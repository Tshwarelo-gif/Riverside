-- Riverside Community Hub — initial schema
-- Domains: members, resources, bookings, donations

-- ============================================================
-- ENUMS
-- ============================================================

create type member_role as enum ('member', 'staff', 'admin');
create type booking_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type resource_type as enum ('room', 'equipment', 'gym_slot');
create type donation_type as enum ('monetary', 'food_parcel');
create type donation_status as enum ('pending', 'received', 'allocated');

-- ============================================================
-- MEMBERS
-- One row per authenticated user, keyed to auth.users.
-- Public sign-up creates a 'member' row; staff/admin are
-- promoted manually (or via an admin-only endpoint later).
-- ============================================================

create table members (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role member_role not null default 'member',
  joined_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- ============================================================
-- RESOURCES
-- Bookable things: rooms, equipment, gym slots.
-- Capacity is used to prevent overbooking.
-- ============================================================

create table resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type resource_type not null,
  description text,
  capacity int not null default 1 check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BOOKINGS
-- A member requests a resource for a time window.
-- Staff/admin approve or reject. Overlap checking against
-- capacity is enforced in the API layer (see notes below).
-- ============================================================

create table bookings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members (id) on delete cascade,
  resource_id uuid not null references resources (id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'pending',
  notes text,
  reviewed_by uuid references members (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint booking_time_valid check (end_time > start_time)
);

create index bookings_resource_time_idx on bookings (resource_id, start_time, end_time);
create index bookings_member_idx on bookings (member_id);

-- ============================================================
-- DONATIONS
-- Can be linked to a member or fully anonymous (member_id null).
-- ============================================================

create table donations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members (id) on delete set null,
  donor_name text,           -- used when anonymous/non-member donor supplies a name
  donor_contact text,
  type donation_type not null,
  amount numeric(10, 2),      -- for monetary donations
  item_description text,      -- for food_parcel donations
  status donation_status not null default 'pending',
  received_at timestamptz,
  created_at timestamptz not null default now(),
  constraint donation_has_value check (
    (type = 'monetary' and amount is not null)
    or (type = 'food_parcel' and item_description is not null)
  )
);

create index donations_member_idx on donations (member_id);
create index donations_type_status_idx on donations (type, status);

-- ============================================================
-- HELPER: current user's role (used repeatedly in RLS policies)
-- ============================================================

create or replace function current_member_role()
returns member_role
language sql
security definer
stable
as $$
  select role from members where id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table members enable row level security;
alter table resources enable row level security;
alter table bookings enable row level security;
alter table donations enable row level security;

-- MEMBERS: a user can read/update their own row; staff/admin can read all;
-- only admin can change roles (enforced in API layer, not RLS, since RLS
-- can't easily diff "which columns changed").
create policy "members_select_own_or_staff"
  on members for select
  using (id = auth.uid() or current_member_role() in ('staff', 'admin'));

create policy "members_update_own"
  on members for update
  using (id = auth.uid());

create policy "members_insert_self"
  on members for insert
  with check (id = auth.uid());

-- RESOURCES: readable by anyone authenticated; writable by staff/admin only.
create policy "resources_select_all"
  on resources for select
  using (true);

create policy "resources_write_staff"
  on resources for all
  using (current_member_role() in ('staff', 'admin'))
  with check (current_member_role() in ('staff', 'admin'));

-- BOOKINGS: a member sees their own bookings; staff/admin see all.
create policy "bookings_select_own_or_staff"
  on bookings for select
  using (member_id = auth.uid() or current_member_role() in ('staff', 'admin'));

create policy "bookings_insert_own"
  on bookings for insert
  with check (member_id = auth.uid());

-- Members can cancel their own pending booking; staff/admin can update any
-- (approve/reject). Enforcing "only status->cancelled, only if pending" for
-- the member case is done in the API layer for clarity/testability.
create policy "bookings_update_own_or_staff"
  on bookings for update
  using (member_id = auth.uid() or current_member_role() in ('staff', 'admin'));

-- DONATIONS: a member sees their own donations; staff/admin see all;
-- anonymous donations (member_id null) are only visible to staff/admin.
create policy "donations_select_own_or_staff"
  on donations for select
  using (member_id = auth.uid() or current_member_role() in ('staff', 'admin'));

create policy "donations_insert_own_or_anonymous"
  on donations for insert
  with check (member_id = auth.uid() or member_id is null);

create policy "donations_update_staff"
  on donations for update
  using (current_member_role() in ('staff', 'admin'));

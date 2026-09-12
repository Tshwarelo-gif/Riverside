-- Sample data for local dev / demo.
-- Note: real member rows depend on auth.users existing first — in practice
-- you'd sign up test users via Supabase Auth (dashboard or API) and then
-- these member profile rows get created by the registration flow, not seeded
-- directly. Resources below have no such dependency, so they're safe to seed.

insert into resources (name, type, description, capacity) values
  ('Main Hall', 'room', 'Large event space, seats up to 80', 80),
  ('Meeting Room A', 'room', 'Small meeting room with whiteboard', 8),
  ('Community Gym', 'gym_slot', 'Shared gym floor, one session per booking', 15),
  ('Projector Kit', 'equipment', 'Portable projector + screen', 1),
  ('Youth Programme Room', 'room', 'Dedicated room for youth activities', 25);

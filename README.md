Riverside Community Hub

A full-stack membership, facility-booking, and donation platform built for Riverside Community Hub — a fictional but realistic nonprofit community centre offering youth programmes, a small gym, meeting/event rooms, and a food-parcel donation drive.

Built to replace a paper-and-WhatsApp workflow with a single web platform: the public can register as members, book facilities and equipment, and make donations, while staff get an admin dashboard to approve bookings, manage resources, and generate reports for funders.

Live demo
	
App	https://riverside-dun.vercel.app
API health check	https://riverside-api-evog.onrender.com/health
Source	https://github.com/Tshwarelo-gif/Riverside

The API is hosted on Render's free tier, which spins down after inactivity — the first request after a quiet period can take 30–60 seconds to respond while it wakes back up.

Tech stack
Frontend: React, TypeScript, Vite, Tailwind CSS, React Router
Backend: Node.js, Express, TypeScript
Database & Auth: Supabase (Postgres + Row Level Security + Auth)
Shared: a packages/shared workspace of Zod schemas, with TypeScript types inferred directly from them — the same validation and types are used on both the frontend and backend, so they can't drift apart
Hosting: Vercel (frontend), Render (API), Supabase (database)
Features

Public / anonymous

Browse bookable resources
Donate (monetary or food parcel) without needing an account

Members (after registering)

Request bookings for rooms, equipment, or gym slots
View and cancel their own pending bookings
Donate and see their own donation history
Personal dashboard with profile details

Staff / admin

Approve or reject pending booking requests
Add new bookable resources, and activate/deactivate existing ones
Advance donation status (pending → received → allocated)
View a funder-facing summary report (member count, bookings by status, donation totals)
Architecture

Monorepo, npm workspaces:

riverside-hub/
├── apps/
│   ├── web/          React + TypeScript frontend (Vite)
│   └── api/           Node + Express backend
├── packages/
│   └── shared/         Zod schemas + inferred TS types, used by both apps
└── supabase/
    └── migrations/      Database schema as SQL, checked into the repo
Key decision: authorization lives in Postgres, not Express

The API does not use Supabase's service-role key for normal requests. Instead, auth middleware verifies the caller's Supabase JWT and builds a request-scoped Supabase client authenticated as that user. Every query that client makes is subject to the Row Level Security policies defined in the migration — so a member can only ever see their own bookings/donations, and staff can see everything, enforced by the database itself rather than by application code that could have a bug in it.

The service-role client is reserved for a handful of specific server-only operations that genuinely need to see across all rows before making a decision — e.g. checking whether a resource is already at capacity for a requested time slot before allowing a new booking.

Database

Four core tables: members (extends Supabase's auth.users), resources (bookable rooms/equipment/gym slots, each with a capacity), bookings (member ↔ resource ↔ time window, with a staff approval step and capacity-aware overlap checking), and donations (optionally linked to a member — anonymous donors are supported — covering both monetary and food-parcel donations).

See supabase/migrations/0001_init_schema.sql for full column definitions and Row Level Security policies.

Local development setup
bash
git clone https://github.com/Tshwarelo-gif/Riverside.git
cd Riverside/riverside-hub
npm install

Create a Supabase project, then run supabase/migrations/0001_init_schema.sql
 and supabase/seed.sql against it via the SQL Editor.

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
 fill in both .env files with your Supabase project's values

npm run dev:api   # starts the Express API on :3001
npm run dev:web   # starts the Vite dev server on :5173
Environment variables

apps/api/.env

Variable	Description
SUPABASE_URL	Your Supabase project URL
SUPABASE_ANON_KEY	Supabase anon/publishable key
SUPABASE_SERVICE_ROLE_KEY	Supabase service-role/secret key — server-only, never expose
WEB_ORIGIN	The frontend's URL, for CORS
PORT	Port the API listens on (defaults to 3001)

apps/web/.env

Variable	Description
VITE_SUPABASE_URL	Same Supabase project URL
VITE_SUPABASE_ANON_KEY	Same Supabase anon/publishable key
VITE_API_BASE_URL	The Express API's URL
Deployment

Three services, deployed separately:

Supabase — create a project, run the migration + seed via the SQL Editor
Render — deploys apps/api using the render.yaml Blueprint at the repo root
Vercel — deploys apps/web; set the project's Root Directory to apps/web (or <repo-folder>/apps/web if your repo has an extra nesting level — see note below) and add the three VITE_* environment variables

After both are deployed, set WEB_ORIGIN on Render to the real Vercel URL so CORS allows requests from the live frontend.

Note on repo structure: if you unzip a project folder and run git init one directory above the actual project root, everything ends up nested one level deeper than expected in the repo (e.g. your-repo/riverside-hub/... instead of your-repo/...). Both render.yaml's rootDir and Vercel's Root Directory setting need to account for that extra folder if so — check by browsing the repo on GitHub before assuming the structure matches this README exactly.

Testing as staff

There's no self-serve way to become staff (deliberately — a real nonprofit shouldn't let anyone grant themselves admin access). To test the staff dashboard, register a normal account, then in Supabase's Table Editor open the members table, find your row, and change role from member to staff.

Project status
 Database schema + Row Level Security policies
 Shared Zod schemas + TypeScript types
 Express API — members, resources, bookings, donations, admin modules
 React frontend — registration/login/dashboard, bookings, donations, staff dashboard
 Deployed to Supabase, Render, and Vercel

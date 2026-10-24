# Calabash

Student success and wellbeing platform. Upload course data, score students with rules staff can read, forecast who is heading into concern, send caring outreach, and track what happened.

Stack: Next.js (App Router), Supabase (Postgres and login), optional Resend (email) and Anthropic (email wording).

## Run it
1. Copy `.env.example` to `.env.local` and fill it in.
2. In Supabase SQL Editor run `supabase/schema.sql`, then create demo users and run `supabase/demo-users.sql`.
3. `npm install` then `npm run dev`, and open http://localhost:3000.

## How it is secured
- Row-level security is on for every table with no public policies, so the public key can read nothing.
- Every route checks the signed-in user's role on the server. Coordinators cannot read wellness replies.
- Student links are private, expire after 14 days, and work once.
- Uploads are validated and spreadsheet formula injection is neutralised. Concession reasons are never collected.
- Service keys live only in server environment variables.

# Calabash: project guide for Claude Code

Student success and wellbeing platform for South African universities and colleges. Tagline: "Catch it early. Care for every student."
Built for the FNB App of the Year Hackathon 2026 (challenge: Access to higher education). Founder: a UCT medical student.

## What it does
Staff upload a course CSV. Students are scored with transparent rules (days without login, missed submissions, low latest test, concession count, attendance) plus a simple trend forecast. Medium concern gets an automatic gentle email. High concern waits for a staff member to approve. Each email has a private, single-use, expiring link to a student page where they pick a wellness time and optionally say what is getting in the way. Everything is logged.

## Stack and layout
- Next.js 14 App Router, plain JavaScript. Supabase (Postgres, Auth). Optional Resend (email) and Anthropic API (email wording only).
- `app/page.js` staff dashboard (client component). `app/s/[token]/page.js` student page.
- `app/api/*/route.js` server routes. `lib/server.js` auth and helpers. `lib/risk.js` scoring and forecast. `lib/messages.js` email text, AI draft, sending.
- `supabase/schema.sql` tables. `supabase/demo-users.sql` roles. `public/sample.csv` fake students.
- All database access goes through server routes using the service role key. Row-level security is on with no public policies.

## Rules that must never be broken
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or put it in client code or in git. Only `NEXT_PUBLIC_*` values may reach the browser.
- Concession reasons are never collected, only counts. Do not add health or reason fields.
- Wellness form answers are readable only by the `wellness` and `admin` roles. Coordinators must never see them.
- AI only drafts email wording. It never decides who is at risk. Staff approve high-concern messages before they send.
- No automated decision about a student without a person. Crisis language must go to a human.
- Keep student links single-use and expiring. Validate and sanitise all input.

## Run locally
1. Copy `.env.example` to `.env.local` and fill in the Supabase values.
2. `npm install`, then `npm run dev`, then open http://localhost:3000.
3. Run `npm run build` before every commit and fix any errors.

## Hackathon requirements (very important)
- Must be a real working web app on a live link, not a static page or mock-up, and it must process user data in real time.
- Deliverables: live link, Git repo link, slides (user journey, technical architecture, demo login details), demo accounts for judges, daily updates on Sonke before midnight.
- Final submission deadline: Monday 26 October 2026, 23:59.
- Judged on: Product, Creativity, Usability, Sustainability, Impact, Presentation, Intelligence (10 points each). Intelligence is the forecast plus AI drafting.

## Known gaps and next tasks (in priority order)
1. Confirm the deployed app works end to end with real Supabase data and fix any errors.
2. Make the nightly check run on a schedule (Vercel Cron calling a protected route).
3. Polish the dashboard for mobile and add a small trend chart per student.
4. Add tests proving a coordinator cannot read wellness replies and a student cannot see another student's page.
5. Add security headers and rate limiting on the student routes.
6. Show a clear "Why was this student flagged?" panel and an outcome view (contacted, booked, improved).

## Conventions
Small focused changes, plain JavaScript, no new dependencies unless needed, clear commit messages, push to `main` so Vercel redeploys.

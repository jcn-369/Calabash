-- Calabash database schema. Run this once in Supabase: SQL Editor > New query > paste > Run.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text,
  role text not null check (role in ('coordinator','wellness','admin'))
);
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  course text not null, student_number text not null, name text not null, email text not null,
  created_at timestamptz default now(),
  unique (course, student_number)
);
create table if not exists signals (
  student_id uuid primary key references students(id) on delete cascade,
  days_since_login int default 0, submissions_due int default 0, submissions_done int default 0,
  test_marks numeric[] default '{}', classes_held int default 0, classes_attended int default 0,
  concessions int default 0, updated_at timestamptz default now()
);
create table if not exists risk_records (
  student_id uuid primary key references students(id) on delete cascade,
  score int, level text, reasons text[], fscore int, flevel text, forecast_note text,
  computed_at timestamptz default now()
);
create table if not exists rules (
  id int primary key default 1 check (id = 1),
  login_days int default 7, missed int default 2, mark_below int default 50,
  conc int default 2, attend_below int default 60
);
insert into rules (id) values (1) on conflict do nothing;
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  kind text, subject text, body text, to_email text, status text, delivery text,
  token uuid default gen_random_uuid(), expires_at timestamptz default (now() + interval '14 days'),
  used_at timestamptz, approved_by text, created_at timestamptz default now(), sent_at timestamptz
);
create table if not exists interventions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  action text, actor text, created_at timestamptz default now()
);
create table if not exists form_responses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  slot text, tags text[], note text, created_at timestamptz default now()
);
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text, action text, target text, created_at timestamptz default now()
);

-- Row-level security ON with no policies: the public (anon) key can read and write nothing.
-- All access goes through our server routes, which check the user's role first.
alter table profiles enable row level security;
alter table students enable row level security;
alter table signals enable row level security;
alter table risk_records enable row level security;
alter table rules enable row level security;
alter table messages enable row level security;
alter table interventions enable row level security;
alter table form_responses enable row level security;
alter table audit_log enable row level security;

-- Run AFTER creating these three users in Supabase: Authentication > Users > Add user (tick "Auto Confirm User").
-- Emails and passwords are your choice. Change the emails below to match what you created.
insert into profiles (id, email, full_name, role)
select id, email, 'Demo Coordinator', 'coordinator' from auth.users where email = 'coordinator@calabash.demo'
on conflict (id) do update set role = excluded.role;
insert into profiles (id, email, full_name, role)
select id, email, 'Demo Wellness Counsellor', 'wellness' from auth.users where email = 'wellness@calabash.demo'
on conflict (id) do update set role = excluded.role;
insert into profiles (id, email, full_name, role)
select id, email, 'Demo Admin', 'admin' from auth.users where email = 'admin@calabash.demo'
on conflict (id) do update set role = excluded.role;

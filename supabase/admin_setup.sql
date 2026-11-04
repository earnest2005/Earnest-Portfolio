-- 1) Supabase Dashboard > Authentication > Users > Add user (your email + strong password; disable public sign-ups in Auth settings).
-- 2) Replace the email below and run:
insert into admins(user_id) select id from auth.users where email='YOUR-EMAIL@example.com';

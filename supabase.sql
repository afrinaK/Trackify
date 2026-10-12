-- Supabase dashboard -> SQL Editor -> New query -> paste all -> Run
create table profiles(id uuid primary key references auth.users on delete cascade,name text not null default '',email text,role text not null default 'user' check(role in('user','admin')),avatar text,theme text not null default 'light' check(theme in('light','dark')),created_at timestamptz not null default now());
create function is_admin() returns boolean language sql security definer set search_path=public stable as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,name,email,role) values(new.id,coalesce(new.raw_user_meta_data->>'name',''),new.email,case when exists(select 1 from profiles) then 'user' else 'admin' end); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create table applications(id bigint generated always as identity primary key,user_id uuid not null default auth.uid() references profiles(id) on delete cascade,category text not null check(category in('masters','private','govt')),org text not null,position text not null,
 publish_date date,deadline date,exam_date date,interview_date date,viva_date date,joining_date date,status text not null,link text,reference text,notes text,extra jsonb not null default '{}',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table professors(id bigint generated always as identity primary key,user_id uuid not null default auth.uid() references profiles(id) on delete cascade,name text not null,email text,research_area text,department text,university text,country text,status text not null default 'Not Contacted',notes text,last_contact date,next_followup date,created_at timestamptz not null default now());
create table professor_contacts(id bigint generated always as identity primary key,user_id uuid not null default auth.uid() references profiles(id) on delete cascade,professor_id bigint not null references professors(id) on delete cascade,note text,contacted_at timestamptz not null default now());
create table documents(id bigint generated always as identity primary key,user_id uuid not null default auth.uid() references profiles(id) on delete cascade,application_id bigint not null references applications(id) on delete cascade,kind text not null,original_name text not null,path text not null,created_at timestamptz not null default now());
create table activities(id bigint generated always as identity primary key,user_id uuid not null default auth.uid() references profiles(id) on delete cascade,text text not null,created_at timestamptz not null default now());
create table notifications(id bigint generated always as identity primary key,user_id uuid not null default auth.uid() references profiles(id) on delete cascade,text text not null,is_read boolean not null default false,created_at timestamptz not null default now());

-- Row Level Security: each user sees only their own rows; admins can read everything
do $$ declare t text; begin
 foreach t in array array['applications','professors','professor_contacts','documents','activities','notifications'] loop
  execute format('alter table %I enable row level security',t);
  execute format('create policy "own rows" on %I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
  execute format('create policy "admin read" on %I for select to authenticated using(is_admin())',t);
 end loop; end $$;
alter table profiles enable row level security;
create policy "read own or admin" on profiles for select to authenticated using(id=auth.uid() or is_admin());
create policy "update own" on profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke update on profiles from authenticated;
grant update(name,theme,avatar) on profiles to authenticated;

create function admin_set_role(uid uuid,new_role text) returns void language plpgsql security definer set search_path=public as $$
begin if not is_admin() then raise exception 'Admins only.'; end if; if uid=auth.uid() then raise exception 'You cannot change your own role.'; end if;
 update profiles set role=case when new_role='admin' then 'admin' else 'user' end where id=uid; end $$;
create function admin_delete_user(uid uuid) returns void language plpgsql security definer set search_path=public,auth as $$
begin if not is_admin() then raise exception 'Admins only.'; end if; if uid=auth.uid() then raise exception 'You cannot delete yourself.'; end if;
 delete from auth.users where id=uid; end $$;
revoke execute on function admin_set_role(uuid,text),admin_delete_user(uuid) from public,anon;
grant execute on function admin_set_role(uuid,text),admin_delete_user(uuid) to authenticated;

-- File storage: private documents, public avatars, each user limited to their own folder
insert into storage.buckets(id,name,public,file_size_limit) values('documents','documents',false,10485760),('avatars','avatars',true,2097152) on conflict do nothing;
create policy "documents own folder" on storage.objects for all to authenticated using(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatars own folder" on storage.objects for all to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

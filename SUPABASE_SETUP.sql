-- 류현상 키우기 커뮤니티용 Supabase 테이블/RLS 설정
-- Supabase Dashboard > SQL Editor > New query 에 붙여넣고 Run 하세요.

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname varchar(16) not null,
  category varchar(20) not null default '자유' check (category in ('자유','공략','엔딩 인증','버그 제보')),
  title varchar(80) not null check (char_length(title) between 1 and 80),
  content text not null check (char_length(content) between 1 and 1200),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname varchar(16) not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

do $$ begin
  create policy "posts_read" on public.posts for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "posts_insert" on public.posts for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "posts_update" on public.posts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "posts_delete" on public.posts for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "comments_read" on public.comments for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "comments_insert" on public.comments for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "comments_update" on public.comments for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "comments_delete" on public.comments for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "likes_read" on public.likes for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "likes_insert" on public.likes for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "likes_delete" on public.likes for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on public.posts, public.comments, public.likes to authenticated;
grant usage, select on all sequences in schema public to authenticated;

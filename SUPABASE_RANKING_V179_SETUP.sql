-- 류현상 키우기 v179 실시간 랭킹용 Supabase 설정
-- Supabase Dashboard > SQL Editor > New query 에 전체 붙여넣고 Run 하세요.
-- 기존 v178/v179 설정 사용자는 별도 SUPABASE_RANKING_V187_FAME_UPDATE.sql을 한 번 실행하세요.
-- v179부터 엔딩 정보는 스포일러 방지를 위해 온라인 랭킹에 저장/표시하지 않습니다.

create table if not exists public.leaderboard_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname varchar(16) not null check (char_length(nickname) between 1 and 16),
  money bigint not null default 0 check (money between 0 and 1000000000000),
  fans bigint not null default 0 check (fans between 0 and 1000000000),
  looks smallint not null default 0 check (looks between 0 and 100),
  fame_level smallint not null default 1 check (fame_level between 1 and 100),
  vocal smallint not null default 0 check (vocal between 0 and 100),
  compose smallint not null default 0 check (compose between 0 and 100),
  acting smallint not null default 0 check (acting between 0 and 100),
  total_score smallint not null default 0 check (total_score between 0 and 500),
  day integer not null default 1 check (day between 1 and 1000000),
  updated_at timestamptz not null default now()
);

create index if not exists leaderboard_profiles_money_idx on public.leaderboard_profiles (money desc);
create index if not exists leaderboard_profiles_fans_idx on public.leaderboard_profiles (fans desc);
create index if not exists leaderboard_profiles_looks_idx on public.leaderboard_profiles (looks desc);
create index if not exists leaderboard_profiles_total_idx on public.leaderboard_profiles (total_score desc);

alter table public.leaderboard_profiles enable row level security;

do $$ begin
  create policy "leaderboard_profiles_read" on public.leaderboard_profiles for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "leaderboard_profiles_insert_own" on public.leaderboard_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "leaderboard_profiles_update_own" on public.leaderboard_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "leaderboard_profiles_delete_own" on public.leaderboard_profiles for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on public.leaderboard_profiles to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.leaderboard_profiles;
exception when duplicate_object then null; end $$;

-- 류현상 키우기 v178 실시간 랭킹용 Supabase 설정
-- Supabase Dashboard > SQL Editor > New query 에 전체 붙여넣고 Run 하세요.
-- 기존 커뮤니티/대전 테이블은 건드리지 않습니다.

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
  total_score smallint not null default 0 check (total_score between 0 and 400),
  ending_count smallint not null default 0 check (ending_count between 0 and 100),
  day integer not null default 1 check (day between 1 and 1000000),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_endings (
  user_id uuid not null references public.leaderboard_profiles(user_id) on delete cascade,
  ending_name varchar(80) not null check (char_length(ending_name) between 1 and 80),
  nickname varchar(16) not null check (char_length(nickname) between 1 and 16),
  clear_day integer null check (clear_day is null or clear_day between 1 and 1000000),
  achieved_at timestamptz not null default now(),
  primary key (user_id, ending_name)
);

create index if not exists leaderboard_profiles_money_idx on public.leaderboard_profiles (money desc);
create index if not exists leaderboard_profiles_fans_idx on public.leaderboard_profiles (fans desc);
create index if not exists leaderboard_profiles_looks_idx on public.leaderboard_profiles (looks desc);
create index if not exists leaderboard_profiles_total_idx on public.leaderboard_profiles (total_score desc);
create index if not exists leaderboard_profiles_endings_idx on public.leaderboard_profiles (ending_count desc);
create index if not exists leaderboard_endings_name_day_idx on public.leaderboard_endings (ending_name, clear_day asc nulls last);

alter table public.leaderboard_profiles enable row level security;
alter table public.leaderboard_endings enable row level security;

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

do $$ begin
  create policy "leaderboard_endings_read" on public.leaderboard_endings for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "leaderboard_endings_insert_own" on public.leaderboard_endings for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "leaderboard_endings_update_own" on public.leaderboard_endings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on public.leaderboard_profiles to authenticated;
grant select, insert, update on public.leaderboard_endings to authenticated;

create or replace function public.record_leaderboard_ending(
  p_ending_name text,
  p_clear_day integer,
  p_nickname text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_ending_name is null or char_length(trim(p_ending_name)) < 1 or char_length(trim(p_ending_name)) > 80 then
    raise exception '엔딩 이름이 올바르지 않습니다.';
  end if;
  if p_nickname is null or char_length(trim(p_nickname)) < 1 or char_length(trim(p_nickname)) > 16 then
    raise exception '닉네임이 올바르지 않습니다.';
  end if;
  if p_clear_day is not null and (p_clear_day < 1 or p_clear_day > 1000000) then
    raise exception '클리어 일수가 올바르지 않습니다.';
  end if;

  insert into public.leaderboard_endings(user_id, ending_name, nickname, clear_day, achieved_at)
  values (auth.uid(), trim(p_ending_name), trim(p_nickname), p_clear_day, now())
  on conflict (user_id, ending_name) do update
  set nickname = excluded.nickname,
      clear_day = case
        when public.leaderboard_endings.clear_day is null then excluded.clear_day
        when excluded.clear_day is null then public.leaderboard_endings.clear_day
        else least(public.leaderboard_endings.clear_day, excluded.clear_day)
      end,
      achieved_at = case
        when public.leaderboard_endings.clear_day is null and excluded.clear_day is not null then now()
        when excluded.clear_day is not null and excluded.clear_day < public.leaderboard_endings.clear_day then now()
        else public.leaderboard_endings.achieved_at
      end;
end;
$$;

create or replace function public.leaderboard_ending_summary()
returns table(ending_name text, clear_count bigint, fastest_day integer)
language sql
stable
security invoker
set search_path = public
as $$
  select e.ending_name::text,
         count(*)::bigint as clear_count,
         min(e.clear_day)::integer as fastest_day
  from public.leaderboard_endings e
  group by e.ending_name
  order by count(*) desc, min(e.clear_day) asc nulls last, e.ending_name asc;
$$;

create or replace function public.leaderboard_ending_top(p_ending_name text)
returns table(nickname text, clear_day integer, achieved_at timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select e.nickname::text, e.clear_day, e.achieved_at
  from public.leaderboard_endings e
  where e.ending_name = p_ending_name and e.clear_day is not null
  order by e.clear_day asc, e.achieved_at asc
  limit 100;
$$;

grant execute on function public.record_leaderboard_ending(text, integer, text) to authenticated;
grant execute on function public.leaderboard_ending_summary() to authenticated;
grant execute on function public.leaderboard_ending_top(text) to authenticated;

-- Realtime 구독 활성화. 이미 추가된 경우에는 그대로 둡니다.
do $$ begin
  alter publication supabase_realtime add table public.leaderboard_profiles;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.leaderboard_endings;
exception when duplicate_object then null; end $$;

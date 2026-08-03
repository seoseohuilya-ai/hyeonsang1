-- 류현상 키우기 v173 · 2 VS 2 류현상 O/X 팀 퀴즈
-- Supabase SQL Editor에서 이 파일 전체를 한 번 실행하세요.
-- 4인 / 2명씩 팀 선택 / 7문제 랜덤 / 문제당 10초 / 개인 정답 1점 → 팀 합산

create table if not exists public.teamquiz_rooms (
  code text primary key,
  host_id uuid not null,
  status text not null default 'waiting' check (status in ('waiting','playing','finished')),
  current_question integer not null default 0,
  question_ids integer[] not null default '{}'::integer[],
  phase text not null default 'question' check (phase in ('question','reveal')),
  question_started_at timestamptz,
  reveal_until timestamptz,
  winner_team integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teamquiz_players (
  room_code text not null references public.teamquiz_rooms(code) on delete cascade,
  user_id uuid not null,
  nickname text not null,
  team integer not null check (team in (1,2)),
  ready boolean not null default false,
  score integer not null default 0,
  correct_count integer not null default 0,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key(room_code,user_id)
);

create table if not exists public.teamquiz_answers (
  room_code text not null references public.teamquiz_rooms(code) on delete cascade,
  user_id uuid not null,
  question_index integer not null,
  answer boolean not null,
  is_correct boolean not null,
  points integer not null default 0,
  answered_at timestamptz not null default now(),
  primary key(room_code,user_id,question_index)
);

alter table public.teamquiz_rooms enable row level security;
alter table public.teamquiz_players enable row level security;
alter table public.teamquiz_answers enable row level security;
revoke all on public.teamquiz_rooms,public.teamquiz_players,public.teamquiz_answers from anon,authenticated;

create or replace function public.teamquiz_is_participant(p_code text)
returns boolean language sql security definer set search_path=public stable
as $$
  select auth.uid() is not null and exists(
    select 1 from public.teamquiz_players
    where room_code=upper(trim(p_code)) and user_id=auth.uid() and left_at is null
  );
$$;

create or replace function public.teamquiz_answer_key(p_question_id integer)
returns boolean language plpgsql immutable
as $$
declare
  keys boolean[] := array[
    true,false,true,false,true,false,true,true,false,true,false,true,false,true,true,false,true,
    false,true,false,true,false,true,false,false,true,true,false,true,false,false,false,false,true
  ];
begin
  if p_question_id < 0 or p_question_id >= array_length(keys,1) then
    raise exception '잘못된 문제 번호입니다.';
  end if;
  return keys[p_question_id+1];
end;
$$;

create or replace function public.teamquiz_healthcheck()
returns jsonb language plpgsql security definer set search_path=public
as $$
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  return jsonb_build_object('ok',true,'version',173,'players',4,'rounds',7,'seconds',10,'team_select',true,'hidden_answers',true);
end;
$$;

create or replace function public.teamquiz_create_room(p_nickname text,p_team integer default 1)
returns text language plpgsql security definer set search_path=public
as $$
declare v_uid uuid:=auth.uid();v_code text;i integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  if nullif(trim(p_nickname),'') is null then raise exception '닉네임이 필요합니다.'; end if;
  if p_team not in (1,2) then raise exception '팀은 1 또는 2만 선택할 수 있습니다.'; end if;
  delete from public.teamquiz_rooms where created_at < now()-interval '3 hours';
  for i in 1..30 loop
    v_code:=upper(substr(md5(random()::text||clock_timestamp()::text||v_uid::text),1,8));
    exit when not exists(select 1 from public.teamquiz_rooms where code=v_code);
  end loop;
  if exists(select 1 from public.teamquiz_rooms where code=v_code) then raise exception '방을 만들지 못했습니다.'; end if;
  insert into public.teamquiz_rooms(code,host_id) values(v_code,v_uid);
  insert into public.teamquiz_players(room_code,user_id,nickname,team) values(v_code,v_uid,left(trim(p_nickname),16),p_team);
  return v_code;
end;
$$;

create or replace function public.teamquiz_join_room(p_code text,p_nickname text,p_team integer)
returns text language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_uid uuid:=auth.uid();v_room public.teamquiz_rooms%rowtype;v_count integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  if nullif(trim(p_nickname),'') is null then raise exception '닉네임이 필요합니다.'; end if;
  if p_team not in (1,2) then raise exception '팀은 1 또는 2만 선택할 수 있습니다.'; end if;
  select * into v_room from public.teamquiz_rooms where code=v_code for update;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  if v_room.status<>'waiting' and not exists(select 1 from public.teamquiz_players where room_code=v_code and user_id=v_uid) then raise exception '이미 시작된 방입니다.'; end if;
  if exists(select 1 from public.teamquiz_players where room_code=v_code and user_id=v_uid) then
    update public.teamquiz_players set nickname=left(trim(p_nickname),16),left_at=null where room_code=v_code and user_id=v_uid;
    return v_code;
  end if;
  select count(*) into v_count from public.teamquiz_players where room_code=v_code and left_at is null;
  if v_count>=4 then raise exception '방이 가득 찼습니다.'; end if;
  select count(*) into v_count from public.teamquiz_players where room_code=v_code and left_at is null and team=p_team;
  if v_count>=2 then raise exception '%팀 자리가 가득 찼습니다.',p_team; end if;
  insert into public.teamquiz_players(room_code,user_id,nickname,team) values(v_code,v_uid,left(trim(p_nickname),16),p_team);
  update public.teamquiz_rooms set updated_at=now() where code=v_code;
  return v_code;
end;
$$;

create or replace function public.teamquiz_set_team(p_code text,p_team integer)
returns void language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_uid uuid:=auth.uid();v_status text;v_count integer;
begin
  if p_team not in (1,2) then raise exception '팀은 1 또는 2만 선택할 수 있습니다.'; end if;
  if not public.teamquiz_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select status into v_status from public.teamquiz_rooms where code=v_code for update;
  if v_status<>'waiting' then raise exception '대기실에서만 팀을 바꿀 수 있습니다.'; end if;
  select count(*) into v_count from public.teamquiz_players where room_code=v_code and left_at is null and team=p_team and user_id<>v_uid;
  if v_count>=2 then raise exception '%팀 자리가 가득 찼습니다.',p_team; end if;
  update public.teamquiz_players set team=p_team,ready=false where room_code=v_code and user_id=v_uid;
  update public.teamquiz_rooms set updated_at=now() where code=v_code;
end;
$$;

create or replace function public.teamquiz_set_ready(p_code text,p_ready boolean)
returns void language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));
begin
  if not public.teamquiz_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  if not exists(select 1 from public.teamquiz_rooms where code=v_code and status='waiting') then raise exception '대기실에서만 준비할 수 있습니다.'; end if;
  update public.teamquiz_players set ready=coalesce(p_ready,false) where room_code=v_code and user_id=auth.uid();
end;
$$;

create or replace function public.teamquiz_start_room(p_code text)
returns void language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_room public.teamquiz_rooms%rowtype;v_total integer;v_t1 integer;v_t2 integer;v_ready integer;v_questions integer[];
begin
  select * into v_room from public.teamquiz_rooms where code=v_code for update;
  if not found then raise exception '방이 없습니다.'; end if;
  if auth.uid()<>v_room.host_id then raise exception '방장만 시작할 수 있습니다.'; end if;
  if v_room.status<>'waiting' then raise exception '이미 시작된 방입니다.'; end if;
  select count(*),count(*) filter(where team=1),count(*) filter(where team=2),count(*) filter(where ready)
    into v_total,v_t1,v_t2,v_ready from public.teamquiz_players where room_code=v_code and left_at is null;
  if v_total<>4 or v_t1<>2 or v_t2<>2 then raise exception '각 팀 2명씩 총 4명이 필요합니다.'; end if;
  if v_ready<>4 then raise exception '4명 모두 준비해야 합니다.'; end if;
  select array_agg(q order by rnd) into v_questions from (select q,random() rnd from generate_series(0,33) q order by rnd limit 7) s;
  update public.teamquiz_players set score=0,correct_count=0 where room_code=v_code;
  delete from public.teamquiz_answers where room_code=v_code;
  update public.teamquiz_rooms set status='playing',current_question=0,question_ids=v_questions,phase='question',question_started_at=now(),reveal_until=null,winner_team=null,updated_at=now() where code=v_code;
end;
$$;

create or replace function public.teamquiz_submit_answer(p_code text,p_answer boolean)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_uid uuid:=auth.uid();v_room public.teamquiz_rooms%rowtype;v_qid integer;v_correct boolean;
begin
  if not public.teamquiz_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select * into v_room from public.teamquiz_rooms where code=v_code for update;
  if v_room.status<>'playing' or v_room.phase<>'question' then raise exception '지금은 답을 제출할 수 없습니다.'; end if;
  if now()>=v_room.question_started_at+interval '10 seconds' then raise exception '제한시간이 끝났습니다.'; end if;
  v_qid:=v_room.question_ids[v_room.current_question+1];v_correct:=public.teamquiz_answer_key(v_qid)=p_answer;
  insert into public.teamquiz_answers(room_code,user_id,question_index,answer,is_correct,points)
    values(v_code,v_uid,v_room.current_question,p_answer,v_correct,case when v_correct then 1 else 0 end)
    on conflict(room_code,user_id,question_index) do nothing;
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.teamquiz_tick(p_code text)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_room public.teamquiz_rooms%rowtype;v_t1 integer;v_t2 integer;v_winner integer;
begin
  if not public.teamquiz_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select * into v_room from public.teamquiz_rooms where code=v_code for update;
  if not found then raise exception '방이 없습니다.'; end if;
  if v_room.status<>'playing' then return jsonb_build_object('ok',true,'status',v_room.status); end if;
  if v_room.phase='question' and now()>=v_room.question_started_at+interval '10 seconds' then
    update public.teamquiz_players p set
      score=p.score+coalesce((select a.points from public.teamquiz_answers a where a.room_code=v_code and a.user_id=p.user_id and a.question_index=v_room.current_question),0),
      correct_count=p.correct_count+coalesce((select case when a.is_correct then 1 else 0 end from public.teamquiz_answers a where a.room_code=v_code and a.user_id=p.user_id and a.question_index=v_room.current_question),0)
    where p.room_code=v_code and p.left_at is null;
    update public.teamquiz_rooms set phase='reveal',reveal_until=now()+interval '3 seconds',updated_at=now() where code=v_code;
    return jsonb_build_object('ok',true,'phase','reveal');
  end if;
  if v_room.phase='reveal' and v_room.reveal_until is not null and now()>=v_room.reveal_until then
    if v_room.current_question>=6 then
      select coalesce(sum(score),0) into v_t1 from public.teamquiz_players where room_code=v_code and left_at is null and team=1;
      select coalesce(sum(score),0) into v_t2 from public.teamquiz_players where room_code=v_code and left_at is null and team=2;
      v_winner:=case when v_t1>v_t2 then 1 when v_t2>v_t1 then 2 else 0 end;
      update public.teamquiz_rooms set status='finished',winner_team=v_winner,updated_at=now() where code=v_code;
      return jsonb_build_object('ok',true,'status','finished','winner_team',v_winner);
    else
      update public.teamquiz_rooms set current_question=current_question+1,phase='question',question_started_at=now(),reveal_until=null,updated_at=now() where code=v_code;
      return jsonb_build_object('ok',true,'phase','question');
    end if;
  end if;
  return jsonb_build_object('ok',true,'phase',v_room.phase);
end;
$$;

create or replace function public.teamquiz_snapshot(p_code text)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_room public.teamquiz_rooms%rowtype;v_players jsonb;v_reveal jsonb:='[]'::jsonb;v_my_answer boolean;v_qid integer;
begin
  if not public.teamquiz_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select * into v_room from public.teamquiz_rooms where code=v_code;
  if not found then raise exception '방이 없습니다.'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'nickname',nickname,'team',team,'ready',ready,'score',score,'correct_count',correct_count,'joined_at',joined_at,'left_at',left_at) order by joined_at),'[]'::jsonb)
    into v_players from public.teamquiz_players where room_code=v_code;
  if v_room.status='playing' and cardinality(v_room.question_ids)>v_room.current_question then
    v_qid:=v_room.question_ids[v_room.current_question+1];
    select answer into v_my_answer from public.teamquiz_answers where room_code=v_code and user_id=auth.uid() and question_index=v_room.current_question;
    if v_room.phase='reveal' then
      select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'nickname',p.nickname,'team',p.team,'answer',a.answer,'is_correct',a.is_correct,'points',a.points) order by p.team,p.joined_at),'[]'::jsonb)
        into v_reveal from public.teamquiz_players p left join public.teamquiz_answers a on a.room_code=p.room_code and a.user_id=p.user_id and a.question_index=v_room.current_question
        where p.room_code=v_code and p.left_at is null;
    end if;
  end if;
  return jsonb_build_object('code',v_room.code,'host_id',v_room.host_id,'status',v_room.status,'current_question',v_room.current_question,'question_id',v_qid,'phase',v_room.phase,'question_started_at',v_room.question_started_at,'reveal_until',v_room.reveal_until,'winner_team',v_room.winner_team,'players',v_players,'my_answer',v_my_answer,'reveal_answers',v_reveal,'server_now',now());
end;
$$;

create or replace function public.teamquiz_list_open_rooms()
returns table(room_code text,host_nickname text,player_count bigint,team1_count bigint,team2_count bigint,is_mine boolean)
language sql security definer set search_path=public
as $$
  select r.code,
    coalesce((select p.nickname from public.teamquiz_players p where p.room_code=r.code and p.user_id=r.host_id limit 1),'익명'),
    count(p.user_id) filter(where p.left_at is null),
    count(p.user_id) filter(where p.left_at is null and p.team=1),
    count(p.user_id) filter(where p.left_at is null and p.team=2),
    exists(select 1 from public.teamquiz_players me where me.room_code=r.code and me.user_id=auth.uid() and me.left_at is null)
  from public.teamquiz_rooms r left join public.teamquiz_players p on p.room_code=r.code
  where r.status='waiting' and r.created_at>now()-interval '3 hours'
  group by r.code,r.host_id,r.created_at order by r.created_at desc limit 30;
$$;

create or replace function public.teamquiz_leave_room(p_code text)
returns void language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_code));v_uid uuid:=auth.uid();v_room public.teamquiz_rooms%rowtype;v_team integer;v_next uuid;
begin
  select * into v_room from public.teamquiz_rooms where code=v_code for update;
  if not found then return; end if;
  select team into v_team from public.teamquiz_players where room_code=v_code and user_id=v_uid;
  update public.teamquiz_players set left_at=now(),ready=false where room_code=v_code and user_id=v_uid;
  if v_room.status='playing' then
    update public.teamquiz_rooms set status='finished',winner_team=case when v_team=1 then 2 when v_team=2 then 1 else 0 end,updated_at=now() where code=v_code;
  elsif v_room.status='waiting' and v_room.host_id=v_uid then
    select user_id into v_next from public.teamquiz_players where room_code=v_code and left_at is null order by joined_at limit 1;
    if v_next is null then delete from public.teamquiz_rooms where code=v_code;
    else update public.teamquiz_rooms set host_id=v_next,updated_at=now() where code=v_code; end if;
  end if;
end;
$$;

revoke all on function public.teamquiz_is_participant(text) from public;
revoke all on function public.teamquiz_answer_key(integer) from public;
revoke all on function public.teamquiz_healthcheck() from public;
revoke all on function public.teamquiz_create_room(text,integer) from public;
revoke all on function public.teamquiz_join_room(text,text,integer) from public;
revoke all on function public.teamquiz_set_team(text,integer) from public;
revoke all on function public.teamquiz_set_ready(text,boolean) from public;
revoke all on function public.teamquiz_start_room(text) from public;
revoke all on function public.teamquiz_submit_answer(text,boolean) from public;
revoke all on function public.teamquiz_tick(text) from public;
revoke all on function public.teamquiz_snapshot(text) from public;
revoke all on function public.teamquiz_list_open_rooms() from public;
revoke all on function public.teamquiz_leave_room(text) from public;

grant execute on function public.teamquiz_healthcheck() to authenticated;
grant execute on function public.teamquiz_create_room(text,integer) to authenticated;
grant execute on function public.teamquiz_join_room(text,text,integer) to authenticated;
grant execute on function public.teamquiz_set_team(text,integer) to authenticated;
grant execute on function public.teamquiz_set_ready(text,boolean) to authenticated;
grant execute on function public.teamquiz_start_room(text) to authenticated;
grant execute on function public.teamquiz_submit_answer(text,boolean) to authenticated;
grant execute on function public.teamquiz_tick(text) to authenticated;
grant execute on function public.teamquiz_snapshot(text) to authenticated;
grant execute on function public.teamquiz_list_open_rooms() to authenticated;
grant execute on function public.teamquiz_leave_room(text) to authenticated;

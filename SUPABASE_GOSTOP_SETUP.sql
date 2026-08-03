-- 류현상 키우기 v151 : 2~3인 실시간 맞고·고스톱 Supabase 설정
-- 게임 속 가상 보유금을 사용하는 점당 판돈을 지원합니다. 기존 커뮤니티/퀴즈 DB는 건드리지 않습니다.

create table if not exists public.gostop_rooms (
  code text primary key,
  host_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting','playing','finished')),
  max_players integer not null default 2 check (max_players between 2 and 3),
  point_rate bigint not null default 1000 check (point_rate in (1000,5000,10000,50000,100000)),
  turn_user_id uuid references auth.users(id) on delete set null,
  decision_user_id uuid references auth.users(id) on delete set null,
  winner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gostop_rooms add column if not exists point_rate bigint not null default 1000;
update public.gostop_rooms set point_rate=1000 where point_rate not in (1000,5000,10000,50000,100000);

create table if not exists public.gostop_players (
  room_code text not null references public.gostop_rooms(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname varchar(16) not null,
  seat integer not null check (seat between 1 and 3),
  ready boolean not null default false,
  hand integer[] not null default '{}',
  captured integer[] not null default '{}',
  score integer not null default 0,
  go_count integer not null default 0,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key(room_code,user_id),
  unique(room_code,seat)
);

create table if not exists public.gostop_game_state (
  room_code text primary key references public.gostop_rooms(code) on delete cascade,
  deck integer[] not null default '{}',
  table_cards integer[] not null default '{}',
  turn_no integer not null default 0,
  last_action text,
  last_played integer,
  last_drawn integer
);

alter table public.gostop_rooms enable row level security;
alter table public.gostop_players enable row level security;
alter table public.gostop_game_state enable row level security;

create or replace function public.gostop_is_participant(p_room_code text)
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(select 1 from public.gostop_players where room_code=upper(trim(p_room_code)) and user_id=auth.uid() and left_at is null);
$$;
revoke all on function public.gostop_is_participant(text) from public;
grant execute on function public.gostop_is_participant(text) to authenticated;

-- 방/참가자 원본 테이블은 참가자만 읽을 수 있고, 손패/덱은 직접 읽지 못하게 합니다.
drop policy if exists "gostop_rooms_read" on public.gostop_rooms;
create policy "gostop_rooms_read" on public.gostop_rooms for select to authenticated using(public.gostop_is_participant(code));
grant select on public.gostop_rooms to authenticated;
revoke all on public.gostop_players,public.gostop_game_state from anon,authenticated;
revoke insert,update,delete on public.gostop_rooms from anon,authenticated;

create or replace function public.gostop_card_month(p_card integer)
returns integer language sql immutable as $$ select case when p_card between 0 and 47 then (p_card/4)+1 else 0 end; $$;

create or replace function public.gostop_card_kind(p_card integer)
returns text language sql immutable as $$
 select case
   when p_card in (0,8,28,40,44) then 'gwang'
   when p_card in (4,12,16,20,24,29,32,36,45) then 'animal'
   when p_card in (1,5,9,13,17,21,25,33,37,46) then 'ribbon'
   when p_card in (41,47) then 'doublepi'
   else 'pi'
 end;
$$;

create or replace function public.gostop_score_cards(p_cards integer[],p_go integer default 0)
returns integer language plpgsql immutable as $$
declare
  v_g integer:=0;v_a integer:=0;v_r integer:=0;v_pi integer:=0;v_score integer:=0;
  v_card integer;v_red integer:=0;v_blue integer:=0;v_grass integer:=0;v_godori integer:=0;
begin
  if p_cards is null then return greatest(0,p_go); end if;
  foreach v_card in array p_cards loop
    case public.gostop_card_kind(v_card)
      when 'gwang' then v_g:=v_g+1;
      when 'animal' then v_a:=v_a+1;
      when 'ribbon' then v_r:=v_r+1;
      when 'doublepi' then v_pi:=v_pi+2;
      else v_pi:=v_pi+1;
    end case;
    if v_card in (1,5,9) then v_red:=v_red+1; end if;
    if v_card in (21,33,37) then v_blue:=v_blue+1; end if;
    if v_card in (13,17,25) then v_grass:=v_grass+1; end if;
    if v_card in (4,12,29) then v_godori:=v_godori+1; end if;
  end loop;
  if v_g=3 then v_score:=v_score+case when 44=any(p_cards) then 2 else 3 end;
  elsif v_g=4 then v_score:=v_score+4;
  elsif v_g>=5 then v_score:=v_score+15; end if;
  if v_a>=5 then v_score:=v_score+(v_a-4); end if;
  if v_r>=5 then v_score:=v_score+(v_r-4); end if;
  if v_pi>=10 then v_score:=v_score+(v_pi-9); end if;
  if v_red=3 then v_score:=v_score+3; end if;
  if v_blue=3 then v_score:=v_score+3; end if;
  if v_grass=3 then v_score:=v_score+3; end if;
  if v_godori=3 then v_score:=v_score+5; end if;
  return greatest(0,v_score+greatest(0,p_go));
end;
$$;

create or replace function public.gostop_next_active_user(p_room_code text,p_after_seat integer)
returns uuid language plpgsql stable security definer set search_path=public
as $$
declare v_uid uuid;
begin
  select user_id into v_uid from public.gostop_players
  where room_code=upper(trim(p_room_code)) and left_at is null and seat>p_after_seat order by seat limit 1;
  if v_uid is null then
    select user_id into v_uid from public.gostop_players where room_code=upper(trim(p_room_code)) and left_at is null order by seat limit 1;
  end if;
  return v_uid;
end;
$$;
revoke all on function public.gostop_next_active_user(text,integer) from public;

create or replace function public.gostop_healthcheck()
returns jsonb language plpgsql security definer set search_path=public
as $$ begin if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if; return jsonb_build_object('ok',true,'version',169,'point_rate',true,'png_board',true,'last_turn_guard',true,'nagari_guard',true); end; $$;

drop function if exists public.gostop_create_room(text,integer);
create or replace function public.gostop_create_room(p_nickname text,p_max_players integer,p_point_rate bigint)
returns text language plpgsql security definer set search_path=public
as $$
declare v_uid uuid:=auth.uid();v_code text;i integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  if nullif(trim(p_nickname),'') is null then raise exception '닉네임이 필요합니다.'; end if;
  if p_max_players not between 2 and 3 then raise exception '고스톱은 2~3인으로 플레이합니다.'; end if;
  if p_point_rate not in (1000,5000,10000,50000,100000) then raise exception '지원하지 않는 점당 판돈입니다.'; end if;
  delete from public.gostop_rooms where created_at<now()-interval '2 hours';
  for i in 1..20 loop v_code:=upper(substr(md5(random()::text||clock_timestamp()::text||v_uid::text),1,8)); exit when not exists(select 1 from public.gostop_rooms where code=v_code); end loop;
  if exists(select 1 from public.gostop_rooms where code=v_code) then raise exception '방을 만들지 못했습니다.'; end if;
  insert into public.gostop_rooms(code,host_id,max_players,point_rate) values(v_code,v_uid,p_max_players,p_point_rate);
  insert into public.gostop_players(room_code,user_id,nickname,seat) values(v_code,v_uid,left(trim(p_nickname),16),1);
  return v_code;
end;
$$;

drop function if exists public.gostop_list_open_rooms();
create or replace function public.gostop_list_open_rooms()
returns table(room_code text,host_nickname text,player_count integer,max_players integer,point_rate bigint,is_mine boolean)
language sql security definer set search_path=public
as $$
  select r.code,
    coalesce((select p.nickname from public.gostop_players p where p.room_code=r.code and p.user_id=r.host_id limit 1),'익명'),
    (select count(*)::integer from public.gostop_players p where p.room_code=r.code and p.left_at is null),
    r.max_players,r.point_rate,r.host_id=auth.uid()
  from public.gostop_rooms r
  where r.status='waiting' and r.created_at>now()-interval '2 hours'
    and (select count(*) from public.gostop_players p where p.room_code=r.code and p.left_at is null)<r.max_players
  order by r.created_at desc limit 40;
$$;

create or replace function public.gostop_join_room(p_code text,p_nickname text)
returns text language plpgsql security definer set search_path=public
as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_code));v_status text;v_max integer;v_count integer;v_seat integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select status,max_players into v_status,v_max from public.gostop_rooms where code=v_code for update;
  if not found then raise exception '존재하지 않는 방입니다.'; end if;
  if v_status<>'waiting' then raise exception '이미 시작된 방입니다.'; end if;
  if exists(select 1 from public.gostop_players where room_code=v_code and user_id=v_uid) then
    update public.gostop_players set nickname=left(trim(p_nickname),16),left_at=null where room_code=v_code and user_id=v_uid; return v_code;
  end if;
  select count(*) into v_count from public.gostop_players where room_code=v_code and left_at is null;
  if v_count>=v_max then raise exception '방이 가득 찼습니다.'; end if;
  select s into v_seat from generate_series(1,v_max)s where not exists(select 1 from public.gostop_players p where p.room_code=v_code and p.seat=s and p.left_at is null) order by s limit 1;
  insert into public.gostop_players(room_code,user_id,nickname,seat) values(v_code,v_uid,left(trim(p_nickname),16),v_seat);
  update public.gostop_rooms set updated_at=now() where code=v_code;
  return v_code;
end;
$$;

create or replace function public.gostop_set_ready(p_code text,p_ready boolean)
returns void language plpgsql security definer set search_path=public
as $$ begin
  if not public.gostop_is_participant(p_code) then raise exception '참가자가 아닙니다.'; end if;
  if not exists(select 1 from public.gostop_rooms where code=upper(trim(p_code)) and status='waiting') then raise exception '대기 중인 방이 아닙니다.'; end if;
  update public.gostop_players set ready=p_ready where room_code=upper(trim(p_code)) and user_id=auth.uid() and left_at is null;
  update public.gostop_rooms set updated_at=now() where code=upper(trim(p_code));
end; $$;

create or replace function public.gostop_start_room(p_code text)
returns void language plpgsql security definer set search_path=public
as $$
declare
 v_code text:=upper(trim(p_code));v_host uuid;v_status text;v_max integer;v_count integer;v_ready integer;v_users uuid[];v_deck integer[];v_first uuid;
begin
  select host_id,status,max_players into v_host,v_status,v_max from public.gostop_rooms where code=v_code for update;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  if v_host<>auth.uid() then raise exception '방장만 시작할 수 있습니다.'; end if;
  if v_status<>'waiting' then raise exception '이미 시작된 방입니다.'; end if;
  select count(*),count(*) filter(where ready) into v_count,v_ready from public.gostop_players where room_code=v_code and left_at is null;
  if v_count<>v_max then raise exception '방 설정 인원이 모두 입장해야 시작할 수 있습니다.'; end if;
  if v_ready<>v_count then raise exception '모든 참가자가 준비해야 합니다.'; end if;
  select array_agg(user_id order by seat) into v_users from public.gostop_players where room_code=v_code and left_at is null;
  select array_agg(i order by random()) into v_deck from generate_series(0,47)i;
  delete from public.gostop_game_state where room_code=v_code;
  if v_max=2 then
    update public.gostop_players set hand=case when user_id=v_users[1] then v_deck[1:10] else v_deck[11:20] end,captured='{}',score=0,go_count=0,ready=false where room_code=v_code and left_at is null;
    insert into public.gostop_game_state(room_code,deck,table_cards) values(v_code,v_deck[29:48],v_deck[21:28]);
  else
    update public.gostop_players set hand=case when user_id=v_users[1] then v_deck[1:7] when user_id=v_users[2] then v_deck[8:14] else v_deck[15:21] end,captured='{}',score=0,go_count=0,ready=false where room_code=v_code and left_at is null;
    insert into public.gostop_game_state(room_code,deck,table_cards) values(v_code,v_deck[28:48],v_deck[22:27]);
  end if;
  v_first:=v_users[1];
  update public.gostop_rooms set status='playing',turn_user_id=v_first,decision_user_id=null,winner_id=null,updated_at=now() where code=v_code;
end;
$$;

create or replace function public.gostop_get_snapshot(p_room_code text)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_state public.gostop_game_state%rowtype;v_players jsonb;v_hand integer[];v_captured integer[];
begin
  if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select * into v_room from public.gostop_rooms where code=v_code;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  select * into v_state from public.gostop_game_state where room_code=v_code;
  select hand,captured into v_hand,v_captured from public.gostop_players where room_code=v_code and user_id=v_uid;
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',p.user_id,'nickname',p.nickname,'seat',p.seat,'ready',p.ready,'hand_count',cardinality(p.hand),'captured_count',cardinality(p.captured),
    'captured',coalesce(to_jsonb(p.captured),'[]'::jsonb),'score',public.gostop_score_cards(p.captured,p.go_count),'go_count',p.go_count,'left_at',p.left_at) order by p.seat),'[]'::jsonb)
  into v_players from public.gostop_players p where p.room_code=v_code;
  return jsonb_build_object('code',v_room.code,'status',v_room.status,'host_id',v_room.host_id,'max_players',v_room.max_players,'point_rate',v_room.point_rate,'turn_user_id',v_room.turn_user_id,
    'decision_user_id',v_room.decision_user_id,'winner_id',v_room.winner_id,'players',v_players,'my_hand',coalesce(to_jsonb(v_hand),'[]'::jsonb),
    'my_captured',coalesce(to_jsonb(v_captured),'[]'::jsonb),'table_cards',coalesce(to_jsonb(v_state.table_cards),'[]'::jsonb),'deck_count',coalesce(cardinality(v_state.deck),0),
    'turn_no',coalesce(v_state.turn_no,0),'last_action',v_state.last_action,'last_played',v_state.last_played,'last_drawn',v_state.last_drawn);
end;
$$;

create or replace function public.gostop_play_card(p_room_code text,p_card integer)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare
 v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;
 v_hand integer[];v_table integer[];v_captured integer[];v_match integer;v_draw integer;v_score integer;v_threshold integer;v_next uuid;v_seat integer;v_deck integer[];v_top integer;v_count integer;v_winner uuid;v_maxscore integer;
begin
  if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select * into v_room from public.gostop_rooms where code=v_code for update;
  if v_room.status<>'playing' then raise exception '진행 중인 게임이 아닙니다.'; end if;
  if v_room.decision_user_id is not null then raise exception '고/스톱 선택을 먼저 완료해야 합니다.'; end if;
  if v_room.turn_user_id<>v_uid then raise exception '내 차례가 아닙니다.'; end if;
  select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid and left_at is null for update;
  if not (p_card=any(v_me.hand)) then raise exception '내 손패에 없는 카드입니다.'; end if;
  select * into v_state from public.gostop_game_state where room_code=v_code for update;
  v_hand:=array_remove(v_me.hand,p_card);v_table:=v_state.table_cards;v_captured:=v_me.captured;v_deck:=v_state.deck;

  select x into v_match from unnest(v_table)x where public.gostop_card_month(x)=public.gostop_card_month(p_card) order by x limit 1;
  if v_match is null then v_table:=array_append(v_table,p_card);
  else v_table:=array_remove(v_table,v_match);v_captured:=v_captured||array[p_card,v_match]; end if;

  v_draw:=null;
  if coalesce(cardinality(v_deck),0)>0 then
    v_draw:=v_deck[1];
    v_deck:=case when cardinality(v_deck)<=1 then '{}'::integer[] else v_deck[2:cardinality(v_deck)] end;
    v_match:=null;
    select x into v_match from unnest(v_table)x where public.gostop_card_month(x)=public.gostop_card_month(v_draw) order by x limit 1;
    if v_match is null then v_table:=array_append(v_table,v_draw);
    else v_table:=array_remove(v_table,v_match);v_captured:=v_captured||array[v_draw,v_match]; end if;
  end if;

  v_score:=public.gostop_score_cards(v_captured,v_me.go_count);
  update public.gostop_players set hand=v_hand,captured=v_captured,score=v_score where room_code=v_code and user_id=v_uid;
  update public.gostop_game_state set deck=v_deck,table_cards=v_table,turn_no=turn_no+1,last_action='패를 냈습니다.',last_played=p_card,last_drawn=v_draw where room_code=v_code;
  v_threshold:=case when v_room.max_players=2 then 7 else 3 end;

  -- 더미의 마지막 패를 뒤집은 턴에서만 즉시 종료합니다.
  -- 손패가 먼저 0장이 되어도 다른 참가자의 마지막 턴이 남아 있을 수 있으므로 손패 수만으로 종료하지 않습니다.
  -- 마지막 행동자가 기준 점수를 넘겼으면 자동 STOP 승리, 못 넘겼으면 나가리(정산 없음)입니다.
  if coalesce(cardinality(v_deck),0)=0 then
    if v_score>=v_threshold then
      v_winner:=v_uid;
      update public.gostop_game_state set last_action='마지막 패 자동 STOP' where room_code=v_code;
    else
      v_winner:=null;
      update public.gostop_game_state set last_action='마지막 패 나가리' where room_code=v_code;
    end if;
    update public.gostop_rooms set status='finished',winner_id=v_winner,turn_user_id=null,decision_user_id=null,updated_at=now() where code=v_code;
    return jsonb_build_object('finished',true,'score',v_score,'winner_id',v_winner,'nagari',v_winner is null);
  end if;

  if v_score>=v_threshold then
    update public.gostop_rooms set decision_user_id=v_uid,updated_at=now() where code=v_code;
    return jsonb_build_object('decision',true,'score',v_score);
  end if;

  v_next:=public.gostop_next_active_user(v_code,v_me.seat);
  update public.gostop_rooms set turn_user_id=v_next,updated_at=now() where code=v_code;
  return jsonb_build_object('ok',true,'score',v_score);
end;
$$;

create or replace function public.gostop_choose_go(p_room_code text,p_go boolean)
returns text language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;v_next uuid;
begin
  if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
  select * into v_room from public.gostop_rooms where code=v_code for update;
  if v_room.status<>'playing' or v_room.decision_user_id<>v_uid then raise exception '지금은 고/스톱을 선택할 수 없습니다.'; end if;
  select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid for update;
  select * into v_state from public.gostop_game_state where room_code=v_code for update;
  -- 구버전에서 마지막 패 GO 선택창이 남아 있더라도 빈 턴으로 넘기지 않고 자동 STOP합니다.
  if p_go and coalesce(cardinality(v_state.deck),0)=0 then
    update public.gostop_rooms set status='finished',winner_id=v_uid,turn_user_id=null,decision_user_id=null,updated_at=now() where code=v_code;
    update public.gostop_game_state set last_action='마지막 패 자동 STOP' where room_code=v_code;
    return 'stop';
  end if;
  if p_go then
    update public.gostop_players set go_count=go_count+1,score=public.gostop_score_cards(captured,go_count+1) where room_code=v_code and user_id=v_uid;
    v_next:=public.gostop_next_active_user(v_code,v_me.seat);
    update public.gostop_rooms set decision_user_id=null,turn_user_id=v_next,updated_at=now() where code=v_code;
    update public.gostop_game_state set last_action='GO를 선택했습니다.' where room_code=v_code;
    return 'go';
  else
    update public.gostop_rooms set status='finished',winner_id=v_uid,turn_user_id=null,decision_user_id=null,updated_at=now() where code=v_code;
    update public.gostop_game_state set last_action='STOP을 선택했습니다.' where room_code=v_code;
    return 'stop';
  end if;
end;
$$;

create or replace function public.gostop_leave_room(p_room_code text)
returns text language plpgsql security definer set search_path=public
as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_active integer;v_winner uuid;v_next uuid;
begin
  select * into v_room from public.gostop_rooms where code=v_code for update;
  if not found then return 'missing'; end if;
  select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid and left_at is null;
  if not found then return 'not_participant'; end if;
  if v_room.status='waiting' then
    if v_room.host_id=v_uid then delete from public.gostop_rooms where code=v_code;
    else delete from public.gostop_players where room_code=v_code and user_id=v_uid;update public.gostop_rooms set updated_at=now() where code=v_code;end if;
    return 'left';
  end if;
  update public.gostop_players set left_at=now() where room_code=v_code and user_id=v_uid;
  if v_room.status='playing' then
    select count(*) into v_active from public.gostop_players where room_code=v_code and left_at is null;
    if v_active<=1 then
      select user_id into v_winner from public.gostop_players where room_code=v_code and left_at is null limit 1;
      update public.gostop_rooms set status='finished',winner_id=v_winner,turn_user_id=null,decision_user_id=null,updated_at=now() where code=v_code;
    elsif v_room.turn_user_id=v_uid or v_room.decision_user_id=v_uid then
      v_next:=public.gostop_next_active_user(v_code,v_me.seat);
      update public.gostop_rooms set turn_user_id=v_next,decision_user_id=null,updated_at=now() where code=v_code;
    end if;
  end if;
  return 'left';
end;
$$;

revoke all on function public.gostop_healthcheck() from public;
revoke all on function public.gostop_create_room(text,integer,bigint) from public;
revoke all on function public.gostop_list_open_rooms() from public;
revoke all on function public.gostop_join_room(text,text) from public;
revoke all on function public.gostop_set_ready(text,boolean) from public;
revoke all on function public.gostop_start_room(text) from public;
revoke all on function public.gostop_get_snapshot(text) from public;
revoke all on function public.gostop_play_card(text,integer) from public;
revoke all on function public.gostop_choose_go(text,boolean) from public;
revoke all on function public.gostop_leave_room(text) from public;

grant execute on function public.gostop_healthcheck() to authenticated;
grant execute on function public.gostop_create_room(text,integer,bigint) to authenticated;
grant execute on function public.gostop_list_open_rooms() to authenticated;
grant execute on function public.gostop_join_room(text,text) to authenticated;
grant execute on function public.gostop_set_ready(text,boolean) to authenticated;
grant execute on function public.gostop_start_room(text) to authenticated;
grant execute on function public.gostop_get_snapshot(text) to authenticated;
grant execute on function public.gostop_play_card(text,integer) to authenticated;
grant execute on function public.gostop_choose_go(text,boolean) to authenticated;
grant execute on function public.gostop_leave_room(text) to authenticated;

DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='gostop_rooms') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.gostop_rooms; END IF;
END $$;
alter table public.gostop_rooms replica identity full;

select '류현상 키우기 v151 고스톱 DB 설정 완료!' as result;

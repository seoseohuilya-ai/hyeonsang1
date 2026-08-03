-- 류현상 키우기 v151 · 온라인 맞고/고스톱 PNG 화투판 + 점당 판돈 업데이트
-- 기존 고스톱 DB가 이미 설치되어 있는 사용자는 이 파일만 Supabase SQL Editor에서 한 번 전체 실행하세요.

alter table public.gostop_rooms add column if not exists point_rate bigint not null default 1000;
update public.gostop_rooms set point_rate=1000 where point_rate not in (1000,5000,10000,50000,100000);

DO $$
BEGIN
 IF NOT EXISTS (select 1 from pg_constraint where conname='gostop_rooms_point_rate_check') THEN
  alter table public.gostop_rooms add constraint gostop_rooms_point_rate_check check(point_rate in (1000,5000,10000,50000,100000));
 END IF;
END $$;

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

create or replace function public.gostop_healthcheck()
returns jsonb language plpgsql security definer set search_path=public
as $$ begin if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if; return jsonb_build_object('ok',true,'version',151,'point_rate',true,'png_board',true); end; $$;

-- 기존 2개 인자 방 생성 함수는 v151의 3개 인자 함수로 교체합니다.
drop function if exists public.gostop_create_room(text,integer);
drop function if exists public.gostop_create_room(text,integer,bigint);
create function public.gostop_create_room(p_nickname text,p_max_players integer,p_point_rate bigint)
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

-- 반환 컬럼이 늘어나므로 기존 함수를 삭제 후 다시 만듭니다.
drop function if exists public.gostop_list_open_rooms();
create function public.gostop_list_open_rooms()
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

-- 상대가 먹은 패는 실제 화투판에서 공개 정보이므로 스냅샷에 함께 전달합니다.
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

revoke all on function public.gostop_create_room(text,integer,bigint) from public;
revoke all on function public.gostop_list_open_rooms() from public;
revoke all on function public.gostop_get_snapshot(text) from public;
grant execute on function public.gostop_create_room(text,integer,bigint) to authenticated;
grant execute on function public.gostop_list_open_rooms() to authenticated;
grant execute on function public.gostop_get_snapshot(text) to authenticated;
grant execute on function public.gostop_healthcheck() to authenticated;

select '류현상 키우기 v151 온라인 맞고/고스톱 업데이트 완료!' as result;

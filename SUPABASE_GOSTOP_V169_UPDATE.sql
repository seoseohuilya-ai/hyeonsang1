-- 류현상 키우기 v169 · 온라인 맞고/고스톱 마지막 턴 안정화 업데이트
-- 기존 v151 이상 DB에 한 번 실행하세요.
-- 마지막 패 GO 오류 방지 + 마지막 패 자동 STOP/나가리 처리 + 헬스체크 버전 갱신

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


revoke all on function public.gostop_healthcheck() from public;
revoke all on function public.gostop_play_card(text,integer) from public;
revoke all on function public.gostop_choose_go(text,boolean) from public;
grant execute on function public.gostop_healthcheck() to authenticated;
grant execute on function public.gostop_play_card(text,integer) to authenticated;
grant execute on function public.gostop_choose_go(text,boolean) to authenticated;

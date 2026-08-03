-- 류현상 키우기 v183 · 온라인 맞고/고스톱 특수 룰 업데이트
-- 기존 SUPABASE_GOSTOP_SETUP.sql / V151 / V169를 실행한 프로젝트에서 이 파일을 한 번 전체 실행하세요.
-- 추가: 총통, 흔들기, 폭탄+빈패 2회, 뻑/자뻑/뻑먹기, 쪽, 따닥, 싹쓸이,
--       피박/광박/멍따/고박 및 3고 이상 배수 계산용 메타데이터.

alter table public.gostop_players add column if not exists shake_count integer not null default 0;
alter table public.gostop_players add column if not exists bomb_count integer not null default 0;
alter table public.gostop_players add column if not exists bomb_credits integer not null default 0;
alter table public.gostop_players add column if not exists shaken_months integer[] not null default '{}';
alter table public.gostop_players add column if not exists ppuk_count integer not null default 0;
alter table public.gostop_players add column if not exists last_decision_score integer not null default 0;

alter table public.gostop_rooms add column if not exists finish_reason text;
alter table public.gostop_rooms add column if not exists finish_meta jsonb not null default '{}'::jsonb;

alter table public.gostop_game_state add column if not exists ppuk_state jsonb not null default '{}'::jsonb;
alter table public.gostop_game_state add column if not exists choice_user_id uuid references auth.users(id) on delete set null;
alter table public.gostop_game_state add column if not exists choice_stage text;
alter table public.gostop_game_state add column if not exists choice_candidates integer[] not null default '{}';
alter table public.gostop_game_state add column if not exists choice_context jsonb not null default '{}'::jsonb;

create or replace function public.gostop_card_value(p_card integer)
returns integer language sql immutable as $$
 select case public.gostop_card_kind(p_card)
   when 'gwang' then 12 when 'animal' then 7 when 'ribbon' then 5 when 'doublepi' then 4 else 2 end;
$$;

-- 9월 국진(카드 32)은 열끗/쌍피 중 점수가 높은 쪽으로 자동 계산합니다.
create or replace function public.gostop_score_cards_mode(p_cards integer[],p_go integer,p_gukjin_pi boolean)
returns integer language plpgsql immutable as $$
declare v_g integer:=0;v_a integer:=0;v_r integer:=0;v_pi integer:=0;v_score integer:=0;v_card integer;v_red integer:=0;v_blue integer:=0;v_grass integer:=0;v_godori integer:=0;
begin
 if p_cards is null then return greatest(0,p_go); end if;
 foreach v_card in array p_cards loop
   if v_card=32 and p_gukjin_pi then v_pi:=v_pi+2;
   else
     case public.gostop_card_kind(v_card)
       when 'gwang' then v_g:=v_g+1;
       when 'animal' then v_a:=v_a+1;
       when 'ribbon' then v_r:=v_r+1;
       when 'doublepi' then v_pi:=v_pi+2;
       else v_pi:=v_pi+1;
     end case;
   end if;
   if v_card in (1,5,9) then v_red:=v_red+1; end if;
   if v_card in (21,33,37) then v_blue:=v_blue+1; end if;
   if v_card in (13,17,25) then v_grass:=v_grass+1; end if;
   if v_card in (4,12,29) then v_godori:=v_godori+1; end if;
 end loop;
 if v_g=3 then v_score:=v_score+case when 40=any(p_cards) then 2 else 3 end;
 elsif v_g=4 then v_score:=v_score+4; elsif v_g>=5 then v_score:=v_score+15; end if;
 if v_a>=5 then v_score:=v_score+(v_a-4); end if;
 if v_r>=5 then v_score:=v_score+(v_r-4); end if;
 if v_pi>=10 then v_score:=v_score+(v_pi-9); end if;
 if v_red=3 then v_score:=v_score+3; end if;
 if v_blue=3 then v_score:=v_score+3; end if;
 if v_grass=3 then v_score:=v_score+3; end if;
 if v_godori=3 then v_score:=v_score+5; end if;
 return greatest(0,v_score+greatest(0,p_go));
end; $$;

create or replace function public.gostop_score_cards(p_cards integer[],p_go integer default 0)
returns integer language sql immutable as $$
 select greatest(public.gostop_score_cards_mode(p_cards,p_go,false),public.gostop_score_cards_mode(p_cards,p_go,true));
$$;

create or replace function public.gostop_refresh_scores(p_room_code text)
returns void language plpgsql security definer set search_path=public as $$
begin
 update public.gostop_players set score=public.gostop_score_cards(captured,go_count)
 where room_code=upper(trim(p_room_code));
end; $$;
revoke all on function public.gostop_refresh_scores(text) from public;

-- 피 뺏기: 2인은 상대 1명, 3인은 나머지 각 상대에게 같은 수만큼 가져옵니다.
create or replace function public.gostop_steal_pi(p_room_code text,p_winner uuid,p_count integer)
returns void language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_opp record;v_card integer;i integer;
begin
 if p_count<=0 then return; end if;
 for v_opp in select user_id from public.gostop_players where room_code=v_code and user_id<>p_winner and left_at is null order by seat loop
   for i in 1..p_count loop
     select c into v_card from unnest((select captured from public.gostop_players where room_code=v_code and user_id=v_opp.user_id)) c
      where public.gostop_card_kind(c) in ('pi','doublepi')
      order by case public.gostop_card_kind(c) when 'pi' then 1 else 2 end, c limit 1;
     exit when v_card is null;
     update public.gostop_players set captured=array_remove(captured,v_card) where room_code=v_code and user_id=v_opp.user_id;
     update public.gostop_players set captured=array_append(captured,v_card) where room_code=v_code and user_id=p_winner;
     v_card:=null;
   end loop;
 end loop;
 perform public.gostop_refresh_scores(v_code);
end; $$;
revoke all on function public.gostop_steal_pi(text,uuid,integer) from public;

create or replace function public.gostop_next_can_act_user(p_room_code text,p_after_seat integer)
returns uuid language plpgsql stable security definer set search_path=public as $$
declare v_uid uuid;
begin
 select user_id into v_uid from public.gostop_players where room_code=upper(trim(p_room_code)) and left_at is null
 and (coalesce(cardinality(hand),0)>0 or bomb_credits>0) and seat>p_after_seat order by seat limit 1;
 if v_uid is null then select user_id into v_uid from public.gostop_players where room_code=upper(trim(p_room_code)) and left_at is null
 and (coalesce(cardinality(hand),0)>0 or bomb_credits>0) order by seat limit 1; end if;
 return v_uid;
end; $$;
revoke all on function public.gostop_next_can_act_user(text,integer) from public;

create or replace function public.gostop_finish_turn(p_room_code text,p_uid uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;v_score integer;v_threshold integer;v_next uuid;
begin
 perform public.gostop_refresh_scores(v_code);
 select * into v_room from public.gostop_rooms where code=v_code for update;
 select * into v_me from public.gostop_players where room_code=v_code and user_id=p_uid for update;
 select * into v_state from public.gostop_game_state where room_code=v_code for update;
 v_score:=public.gostop_score_cards(v_me.captured,v_me.go_count);v_threshold:=case when v_room.max_players=2 then 7 else 3 end;
 update public.gostop_game_state set turn_no=turn_no+1 where room_code=v_code;
 if coalesce(cardinality(v_state.deck),0)=0 then
   if v_score>=v_threshold then
     update public.gostop_rooms set status='finished',winner_id=p_uid,turn_user_id=null,decision_user_id=null,finish_reason='stop',finish_meta='{}',updated_at=now() where code=v_code;
     update public.gostop_game_state set last_action='마지막 패 자동 STOP',choice_user_id=null,choice_stage=null,choice_candidates='{}',choice_context='{}' where room_code=v_code;
     return jsonb_build_object('finished',true,'winner_id',p_uid,'score',v_score);
   else
     update public.gostop_rooms set status='finished',winner_id=null,turn_user_id=null,decision_user_id=null,finish_reason='nagari',finish_meta='{}',updated_at=now() where code=v_code;
     update public.gostop_game_state set last_action='마지막 패 나가리',choice_user_id=null,choice_stage=null,choice_candidates='{}',choice_context='{}' where room_code=v_code;
     return jsonb_build_object('finished',true,'nagari',true,'score',v_score);
   end if;
 end if;
 if v_score>=v_threshold and v_score>coalesce(v_me.last_decision_score,0) then
   update public.gostop_rooms set decision_user_id=p_uid,updated_at=now() where code=v_code;
   return jsonb_build_object('decision',true,'score',v_score);
 end if;
 v_next:=public.gostop_next_can_act_user(v_code,v_me.seat);
 if v_next is null or v_next=p_uid then
   update public.gostop_rooms set status='finished',winner_id=case when v_score>=v_threshold then p_uid else null end,turn_user_id=null,decision_user_id=null,finish_reason=case when v_score>=v_threshold then 'stop' else 'nagari' end,updated_at=now() where code=v_code;
   return jsonb_build_object('finished',true,'winner_id',case when v_score>=v_threshold then p_uid else null end);
 end if;
 update public.gostop_rooms set turn_user_id=v_next,updated_at=now() where code=v_code;
 return jsonb_build_object('ok',true,'score',v_score);
end; $$;
revoke all on function public.gostop_finish_turn(text,uuid) from public;

-- 더미 1장 처리. 선택이 필요한 경우 choice 상태를 남기고 멈춥니다.
create or replace function public.gostop_resolve_draw(p_room_code text,p_uid uuid,p_ctx jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_state public.gostop_game_state%rowtype;v_deck integer[];v_table integer[];v_draw integer;v_dm integer;v_matches integer[];v_match integer;v_temp integer[];v_initial integer:=coalesce((p_ctx->>'initial_matches')::integer,-1);v_pm integer:=coalesce((p_ctx->>'played_month')::integer,0);v_played integer:=nullif(p_ctx->>'played','')::integer;v_placed boolean:=coalesce((p_ctx->>'placed')::boolean,false);v_bomb boolean:=coalesce((p_ctx->>'bomb')::boolean,false);v_owner text;v_self boolean;v_action text:='패를 냈습니다.';
begin
 select * into v_state from public.gostop_game_state where room_code=v_code for update;
 v_deck:=v_state.deck;v_table:=v_state.table_cards;
 if coalesce(cardinality(v_deck),0)=0 then return public.gostop_finish_turn(v_code,p_uid); end if;
 v_draw:=v_deck[1];v_deck:=case when cardinality(v_deck)<=1 then '{}'::integer[] else v_deck[2:cardinality(v_deck)] end;v_dm:=public.gostop_card_month(v_draw);
 v_temp:=array(select jsonb_array_elements_text(coalesce(p_ctx->'temp_capture','[]'::jsonb))::integer);
 -- 뻑
 if coalesce(cardinality(v_temp),0)=2 and v_initial=1 and v_dm=v_pm and not v_bomb then
   v_table:=v_table||v_temp||array[v_draw];
   update public.gostop_players set ppuk_count=ppuk_count+1 where room_code=v_code and user_id=p_uid;
   update public.gostop_game_state set deck=v_deck,table_cards=v_table,last_drawn=v_draw,last_action='뻑!',ppuk_state=jsonb_set(coalesce(ppuk_state,'{}'::jsonb),array[v_dm::text],to_jsonb(p_uid::text),true) where room_code=v_code;
   return public.gostop_finish_turn(v_code,p_uid);
 end if;
 if coalesce(cardinality(v_temp),0)>0 then update public.gostop_players set captured=captured||v_temp where room_code=v_code and user_id=p_uid; end if;
 select coalesce(array_agg(x order by x),'{}'::integer[]) into v_matches from unnest(v_table)x where public.gostop_card_month(x)=v_dm;
 if cardinality(v_matches)=0 then v_table:=array_append(v_table,v_draw);
 elsif cardinality(v_matches)=1 then
   v_match:=v_matches[1];v_table:=array_remove(v_table,v_match);update public.gostop_players set captured=captured||array[v_draw,v_match] where room_code=v_code and user_id=p_uid;
   if v_initial=0 and v_placed and v_dm=v_pm and v_match=v_played then perform public.gostop_steal_pi(v_code,p_uid,1);v_action:='쪽! 상대 피를 가져갑니다.';
   elsif v_initial=2 and v_dm=v_pm then perform public.gostop_steal_pi(v_code,p_uid,1);v_action:='따닥! 상대 피를 가져갑니다.'; end if;
 elsif cardinality(v_matches)=2 then
   update public.gostop_game_state set deck=v_deck,table_cards=v_table,last_drawn=v_draw,last_action='먹을 패를 선택하세요.',choice_user_id=p_uid,choice_stage='draw',choice_candidates=v_matches,choice_context=p_ctx||jsonb_build_object('draw',v_draw) where room_code=v_code;
   return jsonb_build_object('choice',true,'stage','draw');
 else
   foreach v_match in array v_matches loop v_table:=array_remove(v_table,v_match); end loop;
   update public.gostop_players set captured=captured||array[v_draw]||v_matches where room_code=v_code and user_id=p_uid;
   v_owner:=v_state.ppuk_state->>v_dm::text;v_self=(v_owner=p_uid::text);
   update public.gostop_game_state set ppuk_state=coalesce(ppuk_state,'{}'::jsonb)-v_dm::text where room_code=v_code;
   if v_owner is not null then perform public.gostop_steal_pi(v_code,p_uid,case when v_self then 2 else 1 end);v_action:=case when v_self then '자뻑! 상대 피 2장을 가져갑니다.' else '뻑 먹기! 상대 피를 가져갑니다.' end; end if;
 end if;
 update public.gostop_game_state set deck=v_deck,table_cards=v_table,last_drawn=v_draw,last_action=v_action where room_code=v_code;
 if cardinality(v_table)=0 then perform public.gostop_steal_pi(v_code,p_uid,1);update public.gostop_game_state set last_action=case when v_action='패를 냈습니다.' then '싹쓸이! 상대 피를 가져갑니다.' else v_action||' · 싹쓸이!' end where room_code=v_code; end if;
 return public.gostop_finish_turn(v_code,p_uid);
end; $$;
revoke all on function public.gostop_resolve_draw(text,uuid,jsonb) from public;

create or replace function public.gostop_play_card(p_room_code text,p_card integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;v_table integer[];v_matches integer[];v_match integer;v_month integer;v_owner text;v_self boolean;v_ctx jsonb;
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;
 select * into v_room from public.gostop_rooms where code=v_code for update;if v_room.status<>'playing' then raise exception '진행 중인 게임이 아닙니다.'; end if;
 if v_room.decision_user_id is not null then raise exception '고/스톱 선택을 먼저 완료해야 합니다.'; end if;if v_room.turn_user_id<>v_uid then raise exception '내 차례가 아닙니다.'; end if;
 select * into v_state from public.gostop_game_state where room_code=v_code for update;if v_state.choice_user_id is not null then raise exception '먹을 패 선택을 먼저 완료해야 합니다.'; end if;
 select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid and left_at is null for update;if v_me.bomb_credits>0 then raise exception '폭탄 빈패를 먼저 사용해야 합니다.'; end if;if not (p_card=any(v_me.hand)) then raise exception '내 손패에 없는 카드입니다.'; end if;
 update public.gostop_players set hand=array_remove(hand,p_card) where room_code=v_code and user_id=v_uid;v_table:=v_state.table_cards;v_month:=public.gostop_card_month(p_card);
 select coalesce(array_agg(x order by x),'{}'::integer[]) into v_matches from unnest(v_table)x where public.gostop_card_month(x)=v_month;
 v_ctx:=jsonb_build_object('played',p_card,'played_month',v_month,'initial_matches',cardinality(v_matches),'placed',false,'bomb',false,'temp_capture','[]'::jsonb);
 if cardinality(v_matches)=0 then v_table:=array_append(v_table,p_card);v_ctx:=jsonb_set(v_ctx,'{placed}','true'::jsonb);
 elsif cardinality(v_matches)=1 then v_match:=v_matches[1];v_table:=array_remove(v_table,v_match);v_ctx:=jsonb_set(v_ctx,'{temp_capture}',to_jsonb(array[p_card,v_match]));
 elsif cardinality(v_matches)=2 then
   update public.gostop_game_state set table_cards=v_table,last_played=p_card,last_drawn=null,last_action='먹을 패를 선택하세요.',choice_user_id=v_uid,choice_stage='play',choice_candidates=v_matches,choice_context=v_ctx where room_code=v_code;
   return jsonb_build_object('choice',true,'stage','play');
 else
   foreach v_match in array v_matches loop v_table:=array_remove(v_table,v_match); end loop;
   update public.gostop_players set captured=captured||array[p_card]||v_matches where room_code=v_code and user_id=v_uid;
   v_owner:=v_state.ppuk_state->>v_month::text;v_self=(v_owner=v_uid::text);update public.gostop_game_state set ppuk_state=coalesce(ppuk_state,'{}'::jsonb)-v_month::text where room_code=v_code;
   if v_owner is not null then perform public.gostop_steal_pi(v_code,v_uid,case when v_self then 2 else 1 end); end if;
 end if;
 update public.gostop_game_state set table_cards=v_table,last_played=p_card,last_drawn=null,last_action=case when cardinality(v_matches)=3 then case when v_owner=v_uid::text then '자뻑!' when v_owner is not null then '뻑 먹기!' else '패 4장을 먹었습니다.' end else '패를 냈습니다.' end where room_code=v_code;
 return public.gostop_resolve_draw(v_code,v_uid,v_ctx);
end; $$;

create or replace function public.gostop_choose_match(p_room_code text,p_card integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_state public.gostop_game_state%rowtype;v_ctx jsonb;v_table integer[];v_draw integer;v_dm integer;v_initial integer;v_pm integer;v_played integer;v_action text:='패를 가져갑니다.';
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;select * into v_state from public.gostop_game_state where room_code=v_code for update;
 if v_state.choice_user_id<>v_uid or not (p_card=any(v_state.choice_candidates)) then raise exception '선택할 수 없는 패입니다.'; end if;
 v_ctx:=v_state.choice_context;v_table:=array_remove(v_state.table_cards,p_card);
 if v_state.choice_stage='play' then
   v_played:=(v_ctx->>'played')::integer;v_ctx:=jsonb_set(v_ctx,'{temp_capture}',to_jsonb(array[v_played,p_card]));
   update public.gostop_game_state set table_cards=v_table,choice_user_id=null,choice_stage=null,choice_candidates='{}',choice_context='{}',last_action='먹을 패를 골랐습니다.' where room_code=v_code;
   return public.gostop_resolve_draw(v_code,v_uid,v_ctx);
 elsif v_state.choice_stage='draw' then
   v_draw:=(v_ctx->>'draw')::integer;v_dm:=public.gostop_card_month(v_draw);v_initial:=coalesce((v_ctx->>'initial_matches')::integer,-1);v_pm:=coalesce((v_ctx->>'played_month')::integer,0);v_played:=nullif(v_ctx->>'played','')::integer;
   update public.gostop_players set captured=captured||array[v_draw,p_card] where room_code=v_code and user_id=v_uid;
   if v_initial=0 and coalesce((v_ctx->>'placed')::boolean,false) and v_dm=v_pm and p_card=v_played then perform public.gostop_steal_pi(v_code,v_uid,1);v_action:='쪽! 상대 피를 가져갑니다.';
   elsif v_initial=2 and v_dm=v_pm then perform public.gostop_steal_pi(v_code,v_uid,1);v_action:='따닥! 상대 피를 가져갑니다.'; end if;
   update public.gostop_game_state set table_cards=v_table,choice_user_id=null,choice_stage=null,choice_candidates='{}',choice_context='{}',last_action=v_action where room_code=v_code;
   if cardinality(v_table)=0 then perform public.gostop_steal_pi(v_code,v_uid,1);update public.gostop_game_state set last_action=v_action||' · 싹쓸이!' where room_code=v_code; end if;
   return public.gostop_finish_turn(v_code,v_uid);
 end if;
 raise exception '선택 상태가 올바르지 않습니다.';
end; $$;

create or replace function public.gostop_declare_shake(p_room_code text,p_month integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;v_h integer;v_t integer;
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;select * into v_room from public.gostop_rooms where code=v_code for update;select * into v_state from public.gostop_game_state where room_code=v_code for update;select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid for update;
 if v_room.status<>'playing' or v_room.turn_user_id<>v_uid or v_room.decision_user_id is not null or v_state.choice_user_id is not null then raise exception '지금은 흔들 수 없습니다.'; end if;
 select count(*) into v_h from unnest(v_me.hand)x where public.gostop_card_month(x)=p_month;select count(*) into v_t from unnest(v_state.table_cards)x where public.gostop_card_month(x)=p_month;
 if v_h<>3 or v_t<>0 or p_month=any(v_me.shaken_months) then raise exception '흔들기 조건이 아닙니다.'; end if;
 update public.gostop_players set shake_count=shake_count+1,shaken_months=array_append(shaken_months,p_month) where room_code=v_code and user_id=v_uid;update public.gostop_game_state set last_action=p_month||'월 흔들기! 승리 시 2배.' where room_code=v_code;return jsonb_build_object('ok',true,'month',p_month);
end; $$;

create or replace function public.gostop_use_bomb(p_room_code text,p_month integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;v_cards integer[];v_floor integer[];v_table integer[];v_ctx jsonb;
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;select * into v_room from public.gostop_rooms where code=v_code for update;select * into v_state from public.gostop_game_state where room_code=v_code for update;select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid for update;
 if v_room.status<>'playing' or v_room.turn_user_id<>v_uid or v_room.decision_user_id is not null or v_state.choice_user_id is not null then raise exception '지금은 폭탄을 쓸 수 없습니다.'; end if;if v_me.bomb_credits>0 then raise exception '기존 폭탄 빈패를 먼저 사용해야 합니다.'; end if;
 select coalesce(array_agg(x),'{}'::integer[]) into v_cards from unnest(v_me.hand)x where public.gostop_card_month(x)=p_month;select coalesce(array_agg(x),'{}'::integer[]) into v_floor from unnest(v_state.table_cards)x where public.gostop_card_month(x)=p_month;
 if cardinality(v_cards)<>3 or cardinality(v_floor)<>1 then raise exception '폭탄 조건이 아닙니다.'; end if;
 v_table:=array_remove(v_state.table_cards,v_floor[1]);update public.gostop_players set hand=array_remove(array_remove(array_remove(hand,v_cards[1]),v_cards[2]),v_cards[3]),captured=captured||v_cards||v_floor,bomb_count=bomb_count+1,bomb_credits=bomb_credits+2 where room_code=v_code and user_id=v_uid;
 perform public.gostop_steal_pi(v_code,v_uid,1);update public.gostop_game_state set table_cards=v_table,last_played=v_cards[1],last_drawn=null,last_action=p_month||'월 폭탄! 상대 피를 가져갑니다.' where room_code=v_code;
 v_ctx:=jsonb_build_object('played',v_cards[1],'played_month',p_month,'initial_matches',1,'placed',false,'bomb',true,'temp_capture','[]'::jsonb);return public.gostop_resolve_draw(v_code,v_uid,v_ctx);
end; $$;

create or replace function public.gostop_bomb_skip(p_room_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;select * into v_room from public.gostop_rooms where code=v_code for update;select * into v_state from public.gostop_game_state where room_code=v_code for update;select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid for update;
 if v_room.status<>'playing' or v_room.turn_user_id<>v_uid or v_room.decision_user_id is not null or v_state.choice_user_id is not null or v_me.bomb_credits<=0 then raise exception '폭탄 빈패를 사용할 수 없습니다.'; end if;
 update public.gostop_players set bomb_credits=bomb_credits-1 where room_code=v_code and user_id=v_uid;update public.gostop_game_state set last_played=null,last_drawn=null,last_action='폭탄 빈패! 더미만 뒤집습니다.' where room_code=v_code;
 return public.gostop_resolve_draw(v_code,v_uid,jsonb_build_object('played_month',0,'initial_matches',-1,'placed',false,'bomb',false,'bomb_skip',true,'temp_capture','[]'::jsonb));
end; $$;

-- 시작: 새 메타 초기화 + 바닥 4장 같은 월이면 재셔플 + 총통 즉시 승리
create or replace function public.gostop_start_room(p_code text)
returns void language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_code));v_host uuid;v_status text;v_max integer;v_count integer;v_ready integer;v_users uuid[];v_deck integer[];v_first uuid;v_table integer[];v_try integer:=0;v_chong uuid;v_month integer;v_p record;
begin
 select host_id,status,max_players into v_host,v_status,v_max from public.gostop_rooms where code=v_code for update;if not found then raise exception '방을 찾을 수 없습니다.'; end if;if v_host<>auth.uid() then raise exception '방장만 시작할 수 있습니다.'; end if;if v_status<>'waiting' then raise exception '이미 시작된 방입니다.'; end if;
 select count(*),count(*) filter(where ready) into v_count,v_ready from public.gostop_players where room_code=v_code and left_at is null;if v_count<>v_max then raise exception '방 설정 인원이 모두 입장해야 시작할 수 있습니다.'; end if;if v_ready<>v_count then raise exception '모든 참가자가 준비해야 합니다.'; end if;select array_agg(user_id order by seat) into v_users from public.gostop_players where room_code=v_code and left_at is null;
 loop v_try:=v_try+1;select array_agg(i order by random()) into v_deck from generate_series(0,47)i;v_table:=case when v_max=2 then v_deck[21:28] else v_deck[22:27] end;exit when not exists(select 1 from generate_series(1,12)m where (select count(*) from unnest(v_table)c where public.gostop_card_month(c)=m)=4) or v_try>=30;end loop;
 delete from public.gostop_game_state where room_code=v_code;
 if v_max=2 then update public.gostop_players set hand=case when user_id=v_users[1] then v_deck[1:10] else v_deck[11:20] end,captured='{}',score=0,go_count=0,shake_count=0,bomb_count=0,bomb_credits=0,shaken_months='{}',ppuk_count=0,last_decision_score=0,ready=false where room_code=v_code and left_at is null;insert into public.gostop_game_state(room_code,deck,table_cards) values(v_code,v_deck[29:48],v_table);
 else update public.gostop_players set hand=case when user_id=v_users[1] then v_deck[1:7] when user_id=v_users[2] then v_deck[8:14] else v_deck[15:21] end,captured='{}',score=0,go_count=0,shake_count=0,bomb_count=0,bomb_credits=0,shaken_months='{}',ppuk_count=0,last_decision_score=0,ready=false where room_code=v_code and left_at is null;insert into public.gostop_game_state(room_code,deck,table_cards) values(v_code,v_deck[28:48],v_table);end if;
 v_first:=v_users[1];update public.gostop_rooms set status='playing',turn_user_id=v_first,decision_user_id=null,winner_id=null,finish_reason=null,finish_meta='{}',updated_at=now() where code=v_code;
 for v_p in select user_id,hand from public.gostop_players where room_code=v_code and left_at is null order by seat loop
   select m into v_month from generate_series(1,12)m where (select count(*) from unnest(v_p.hand)c where public.gostop_card_month(c)=m)=4 limit 1;
   if v_month is not null then v_chong:=v_p.user_id;exit;end if;v_month:=null;
 end loop;
 if v_chong is not null then update public.gostop_players set score=case when user_id=v_chong then 10 else 0 end where room_code=v_code;update public.gostop_rooms set status='finished',winner_id=v_chong,turn_user_id=null,finish_reason='chongtong',finish_meta=jsonb_build_object('month',v_month,'points',10),updated_at=now() where code=v_code;update public.gostop_game_state set last_action=v_month||'월 총통! 즉시 10점 승리.' where room_code=v_code;end if;
end; $$;

create or replace function public.gostop_get_snapshot(p_room_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_state public.gostop_game_state%rowtype;v_players jsonb;v_hand integer[];v_captured integer[];
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;select * into v_room from public.gostop_rooms where code=v_code;if not found then raise exception '방을 찾을 수 없습니다.'; end if;select * into v_state from public.gostop_game_state where room_code=v_code;select hand,captured into v_hand,v_captured from public.gostop_players where room_code=v_code and user_id=v_uid;
 select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'nickname',p.nickname,'seat',p.seat,'ready',p.ready,'hand_count',cardinality(p.hand),'captured_count',cardinality(p.captured),'captured',coalesce(to_jsonb(p.captured),'[]'::jsonb),'score',public.gostop_score_cards(p.captured,p.go_count),'go_count',p.go_count,'shake_count',p.shake_count,'bomb_count',p.bomb_count,'bomb_credits',p.bomb_credits,'shaken_months',coalesce(to_jsonb(p.shaken_months),'[]'::jsonb),'ppuk_count',p.ppuk_count,'last_decision_score',p.last_decision_score,'left_at',p.left_at) order by p.seat),'[]'::jsonb) into v_players from public.gostop_players p where p.room_code=v_code;
 return jsonb_build_object('code',v_room.code,'status',v_room.status,'host_id',v_room.host_id,'max_players',v_room.max_players,'point_rate',v_room.point_rate,'turn_user_id',v_room.turn_user_id,'decision_user_id',v_room.decision_user_id,'winner_id',v_room.winner_id,'finish_reason',v_room.finish_reason,'finish_meta',v_room.finish_meta,'players',v_players,'my_hand',coalesce(to_jsonb(v_hand),'[]'::jsonb),'my_captured',coalesce(to_jsonb(v_captured),'[]'::jsonb),'table_cards',coalesce(to_jsonb(v_state.table_cards),'[]'::jsonb),'deck_count',coalesce(cardinality(v_state.deck),0),'turn_no',coalesce(v_state.turn_no,0),'last_action',v_state.last_action,'last_played',v_state.last_played,'last_drawn',v_state.last_drawn,'choice_user_id',v_state.choice_user_id,'choice_stage',v_state.choice_stage,'choice_candidates',case when v_state.choice_user_id=v_uid then coalesce(to_jsonb(v_state.choice_candidates),'[]'::jsonb) else '[]'::jsonb end);
end; $$;

create or replace function public.gostop_choose_go(p_room_code text,p_go boolean)
returns text language plpgsql security definer set search_path=public as $$
declare v_code text:=upper(trim(p_room_code));v_uid uuid:=auth.uid();v_room public.gostop_rooms%rowtype;v_me public.gostop_players%rowtype;v_state public.gostop_game_state%rowtype;v_next uuid;v_newscore integer;
begin
 if not public.gostop_is_participant(v_code) then raise exception '참가자가 아닙니다.'; end if;select * into v_room from public.gostop_rooms where code=v_code for update;if v_room.status<>'playing' or v_room.decision_user_id<>v_uid then raise exception '지금은 고/스톱을 선택할 수 없습니다.'; end if;select * into v_me from public.gostop_players where room_code=v_code and user_id=v_uid for update;select * into v_state from public.gostop_game_state where room_code=v_code for update;
 if not p_go or coalesce(cardinality(v_state.deck),0)=0 then update public.gostop_rooms set status='finished',winner_id=v_uid,turn_user_id=null,decision_user_id=null,finish_reason='stop',finish_meta='{}',updated_at=now() where code=v_code;update public.gostop_game_state set last_action=case when p_go then '마지막 패 자동 STOP' else 'STOP을 선택했습니다.' end where room_code=v_code;return 'stop';end if;
 v_newscore:=public.gostop_score_cards(v_me.captured,v_me.go_count+1);update public.gostop_players set go_count=go_count+1,score=v_newscore,last_decision_score=v_newscore where room_code=v_code and user_id=v_uid;v_next:=public.gostop_next_can_act_user(v_code,v_me.seat);if v_next is null then update public.gostop_rooms set status='finished',winner_id=v_uid,turn_user_id=null,decision_user_id=null,finish_reason='stop',updated_at=now() where code=v_code;return 'stop';end if;update public.gostop_rooms set decision_user_id=null,turn_user_id=v_next,updated_at=now() where code=v_code;update public.gostop_game_state set last_action='GO를 선택했습니다.' where room_code=v_code;return 'go';
end; $$;

create or replace function public.gostop_healthcheck()
returns jsonb language plpgsql security definer set search_path=public as $$ begin if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;return jsonb_build_object('ok',true,'version',183,'full_rules',true,'bomb',true,'shake',true,'ppuk',true,'jjok',true,'ddadak',true,'sweep',true,'chongtong',true);end; $$;

revoke all on function public.gostop_play_card(text,integer) from public;
revoke all on function public.gostop_choose_match(text,integer) from public;
revoke all on function public.gostop_declare_shake(text,integer) from public;
revoke all on function public.gostop_use_bomb(text,integer) from public;
revoke all on function public.gostop_bomb_skip(text) from public;
revoke all on function public.gostop_choose_go(text,boolean) from public;
revoke all on function public.gostop_healthcheck() from public;
grant execute on function public.gostop_play_card(text,integer) to authenticated;
grant execute on function public.gostop_choose_match(text,integer) to authenticated;
grant execute on function public.gostop_declare_shake(text,integer) to authenticated;
grant execute on function public.gostop_use_bomb(text,integer) to authenticated;
grant execute on function public.gostop_bomb_skip(text) to authenticated;
grant execute on function public.gostop_choose_go(text,boolean) to authenticated;
grant execute on function public.gostop_healthcheck() to authenticated;

select '류현상 키우기 v183 온라인 맞고/고스톱 특수 룰 업데이트 완료!' as result;

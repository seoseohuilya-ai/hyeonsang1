-- 류현상 키우기 v158 · 노래 맞추기 참가자 답 공개 업데이트
-- v157 노래 맞추기를 이미 설치했다면 이 파일만 Supabase SQL Editor에서 한 번 실행하세요.
-- 테이블/문제 데이터는 삭제하지 않습니다.

drop function if exists public.songquiz_healthcheck();
create function public.songquiz_healthcheck()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select count(*) into v_count from public.songquiz_questions;
  return jsonb_build_object('ok',v_count>=10,'question_count',v_count,'version',158,'mode','one_word_blank_answer_reveal');
end $$;

drop function if exists public.songquiz_get_snapshot(text);
create function public.songquiz_get_snapshot(p_room_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_room_code));v_room public.songquiz_rooms%rowtype;v_players jsonb;v_answers jsonb;v_active integer:=0;v_answered integer:=0;v_reveal boolean:=false;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select * into v_room from public.songquiz_rooms where code=v_code;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  if not exists(select 1 from public.songquiz_players where room_code=v_code and user_id=v_uid) then raise exception '참가자가 아닙니다.'; end if;
  select count(*) into v_active from public.songquiz_players where room_code=v_code and left_at is null;
  if v_room.status='playing' then
    select count(*) into v_answered from public.songquiz_answers a join public.songquiz_players p on p.room_code=a.room_code and p.user_id=a.user_id where a.room_code=v_code and a.question_index=v_room.current_question and p.left_at is null;
    v_reveal:=(v_active>=2 and v_answered>=v_active) or clock_timestamp()>=v_room.question_started_at+interval '15 seconds';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'nickname',nickname,'ready',ready,'score',score,'correct_count',correct_count,'total_response_ms',total_response_ms,'joined_at',joined_at,'left_at',left_at) order by joined_at),'[]'::jsonb) into v_players from public.songquiz_players where room_code=v_code;
  select coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'answer_text',case when v_reveal then answer_text else null end,'is_correct',is_correct,'points',points,'response_ms',response_ms,'submitted_at',submitted_at) order by submitted_at),'[]'::jsonb) into v_answers from public.songquiz_answers where room_code=v_code and question_index=v_room.current_question;
  return jsonb_build_object('code',v_room.code,'host_id',v_room.host_id,'max_players',v_room.max_players,'status',v_room.status,'current_question',v_room.current_question,'question_started_at',v_room.question_started_at,'winner_id',v_room.winner_id,'players',v_players,'answers',v_answers,'answers_revealed',v_reveal);
end $$;

drop function if exists public.songquiz_advance_room(text);
create function public.songquiz_advance_room(p_room_code text)
returns integer language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_room_code));v_room public.songquiz_rooms%rowtype;v_players integer;v_answered integer;v_winner uuid;v_last_submit timestamptz;v_reveal_base timestamptz;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select * into v_room from public.songquiz_rooms where code=v_code for update;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  if v_room.status<>'playing' then return v_room.current_question; end if;
  if not exists(select 1 from public.songquiz_players where room_code=v_code and user_id=v_uid and left_at is null) then raise exception '참가자가 아닙니다.'; end if;
  select count(*) into v_players from public.songquiz_players where room_code=v_code and left_at is null;
  select count(*),max(a.submitted_at) into v_answered,v_last_submit from public.songquiz_answers a join public.songquiz_players p on p.room_code=a.room_code and p.user_id=a.user_id where a.room_code=v_code and a.question_index=v_room.current_question and p.left_at is null;
  if v_answered<v_players and clock_timestamp()<v_room.question_started_at+interval '15 seconds' then return v_room.current_question; end if;
  if v_answered>=v_players and v_players>=2 then v_reveal_base:=coalesce(v_last_submit,v_room.question_started_at);else v_reveal_base:=v_room.question_started_at+interval '15 seconds';end if;
  if clock_timestamp()<v_reveal_base+interval '4 seconds' then return v_room.current_question; end if;
  if v_room.current_question>=9 then
    select user_id into v_winner from public.songquiz_players where room_code=v_code and left_at is null order by score desc,correct_count desc,total_response_ms asc,joined_at asc limit 1;
    update public.songquiz_rooms set status='finished',winner_id=v_winner,updated_at=now() where code=v_code;
    return 10;
  end if;
  update public.songquiz_rooms set current_question=current_question+1,question_started_at=clock_timestamp(),updated_at=now() where code=v_code;
  return v_room.current_question+1;
end $$;

revoke all on function public.songquiz_healthcheck() from public;
revoke all on function public.songquiz_get_snapshot(text) from public;
revoke all on function public.songquiz_advance_room(text) from public;
grant execute on function public.songquiz_healthcheck() to authenticated;
grant execute on function public.songquiz_get_snapshot(text) to authenticated;
grant execute on function public.songquiz_advance_room(text) to authenticated;

select 'v158 노래 맞추기 · 라운드 종료 후 참가자 제출 답 공개 업데이트 완료' as result;

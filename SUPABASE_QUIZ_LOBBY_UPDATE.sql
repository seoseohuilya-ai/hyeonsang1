-- 류현상 키우기 v145: 코드 없는 공개방 로비 추가
-- 이미 v144 퀴즈 SQL을 실행했다면 이 파일만 전체 복사해서 SQL Editor에서 Run 하면 됩니다.

create or replace function public.quiz_list_open_rooms()
returns table(
  room_code text,
  host_nickname text,
  player_count integer,
  created_at timestamptz,
  is_mine boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.code as room_code,
    coalesce(
      (select p.nickname
       from public.quiz_players p
       where p.room_code=r.code
         and p.user_id=r.host_id
         and p.left_at is null
       limit 1),
      '익명'
    ) as host_nickname,
    (select count(*)::integer
     from public.quiz_players p2
     where p2.room_code=r.code
       and p2.left_at is null) as player_count,
    r.created_at,
    (r.host_id = auth.uid()) as is_mine
  from public.quiz_rooms r
  where r.status='waiting'
    and r.created_at >= now() - interval '2 hours'
    and (select count(*)
         from public.quiz_players p3
         where p3.room_code=r.code
           and p3.left_at is null) < 2
  order by r.created_at desc
  limit 30;
$$;

revoke all on function public.quiz_list_open_rooms() from public;
grant execute on function public.quiz_list_open_rooms() to authenticated;
grant usage on schema public to authenticated;
NOTIFY pgrst, 'reload schema';

select 'v145 코드 없는 공개방 로비 설정 완료!' as result;

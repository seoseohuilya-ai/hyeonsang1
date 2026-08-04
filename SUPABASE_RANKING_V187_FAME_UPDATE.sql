-- 류현상 키우기 v187 종합 랭킹 인지도 추가 업데이트
-- 기존 랭킹 DB를 사용 중인 경우 Supabase > SQL Editor에서 이 파일을 한 번 실행하세요.
-- 종합 점수: 보컬 + 작곡 + 연기 + 외모 + 인지도 레벨 (최대 500점)

alter table public.leaderboard_profiles
  drop constraint if exists leaderboard_profiles_total_score_check;

alter table public.leaderboard_profiles
  add constraint leaderboard_profiles_total_score_check
  check (total_score between 0 and 500);

-- 기존 등록 유저도 즉시 새 종합 점수 기준으로 재계산
update public.leaderboard_profiles
set total_score = least(500, greatest(0,
  coalesce(vocal,0) + coalesce(compose,0) + coalesce(acting,0) + coalesce(looks,0) + coalesce(fame_level,1)
)),
updated_at = now();

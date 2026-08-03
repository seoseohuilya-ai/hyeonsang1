-- 류현상 키우기 v158 · 2~4인 실시간 「류현상 노래 맞추기」 · 한 단어 빈칸 / 라운드 종료 후 모두의 답 공개
-- Supabase > SQL Editor > New query 에서 이 파일 전체를 한 번 실행하세요.
-- 기존 커뮤니티/게임 퀴즈/맞고·고스톱 DB는 유지합니다.

create table if not exists public.songquiz_questions (
  id bigint primary key,
  song_title text not null,
  prompt text not null,
  answer text not null
);

create table if not exists public.songquiz_rooms (
  code text primary key,
  host_id uuid not null,
  max_players integer not null check (max_players between 2 and 4),
  status text not null default 'waiting' check (status in ('waiting','playing','finished')),
  current_question integer not null default 0,
  question_ids bigint[] not null default '{}',
  question_started_at timestamptz,
  winner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songquiz_players (
  room_code text not null references public.songquiz_rooms(code) on delete cascade,
  user_id uuid not null,
  nickname text not null,
  ready boolean not null default false,
  score integer not null default 0,
  correct_count integer not null default 0,
  total_response_ms bigint not null default 0,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key(room_code,user_id)
);

create table if not exists public.songquiz_answers (
  room_code text not null references public.songquiz_rooms(code) on delete cascade,
  question_index integer not null,
  user_id uuid not null,
  answer_text text not null default '',
  is_correct boolean not null default false,
  points integer not null default 0,
  response_ms integer not null default 15000,
  submitted_at timestamptz not null default now(),
  primary key(room_code,question_index,user_id)
);

alter table public.songquiz_questions enable row level security;
alter table public.songquiz_rooms enable row level security;
alter table public.songquiz_players enable row level security;
alter table public.songquiz_answers enable row level security;
revoke all on public.songquiz_questions,public.songquiz_rooms,public.songquiz_players,public.songquiz_answers from anon,authenticated;

-- 사용자가 제공한 류현상 노래 가사에서 만든 한 단어 빈칸 문제은행.
-- 노래 제목은 문제 화면에 공개되며, 한 구절에서 정확히 한 단어만 ____ 처리합니다.
-- v155의 '다음 한 줄 입력' 문제는 전부 제거하고 v157 문제로 교체합니다.
-- 이전 방식으로 생성된 진행 중 방을 정리해 구버전 문제 ID가 남지 않게 합니다.
delete from public.songquiz_rooms;
delete from public.songquiz_questions;
insert into public.songquiz_questions(id,song_title,prompt,answer) values
(1,'천도박멸','고요 속에 번진 ____','목소리'),
(2,'천도박멸','____ 않는 그림자','지워지지'),
(3,'천도박멸','____ 들의 기도','잊혀진자'),
(4,'천도박멸','머물지 못한 ____ 사이','영혼'),
(5,'천도박멸','Call my name through the dark I will ____ you','hear'),
(6,'천도박멸','세상이 ____ 난 곁에 있어','잊어도'),
(7,'천도박멸','Bound by fate through the dark I will I ____ turn away','can''t'),
(8,'천도박멸','침묵 속에 I ____','remain'),
(9,'천도박멸','눈에 ____ 않는 진실','보이지'),
(10,'천도박멸','가슴 깊이 ____ 슬픔','짊어진'),
(11,'천도박멸','꿈과 현실 사이 ____','어딘가'),
(12,'천도박멸','나는 ____ 서 있어','여전히'),
(13,'천도박멸','어둠이 날 ____','삼켜도'),
(14,'천도박멸','I will rise ____ fall','never'),
(15,'천도박멸','눈물 ____ 피어나','속에서'),
(16,'천도박멸','I will ____ when you call','answer'),
(17,'천도박멸','세상이 널 ____ 난 곁에 있어','잊어도'),
(18,'천도박멸','Bound by fate I ____ turn away','can''t'),
(19,'For me','떨리는 ____ 맴돌던','입술에'),
(20,'For me','가지 ____ 말','말라는'),
(21,'For me','억지로 삼켜 내고 ____ 내고','비워'),
(22,'For me','혼자 아파하는 ____ 난','사랑이어도'),
(23,'For me','다시는 꺼낼 수 ____ 된','없게'),
(24,'For me','모질게 날 ____ 날 미워해','밀어내'),
(25,'For me','되돌릴 수 없는 ____ 난','사랑이어야'),
(26,'For me','비워 ____ 텐데','버릴'),
(27,'For me','For me 나를 한 번쯤 ____ 줘','돌아봐'),
(28,'For me','너를 ____ 수 있게','잊을'),
(29,'For me','For me 가끔 ____ 그리움','떠오르는'),
(30,'For me','지워 ____ 수 있게','버릴'),
(31,'For me','____ 남겨 둔','가슴속에'),
(32,'For me','심장이 멎을 것 ____','같았던'),
(33,'For me','이제는 ____ 흘러버린','지나버린'),
(34,'For me','계절을 얼마나 더 ____ 널','견뎌야만'),
(35,'For me','보낼 수 ____','있을까'),
(36,'For me','지워 낼 수 ____','없다면'),
(37,'For me','For me 문득 ____ 추억에','차오르는'),
(38,'For me','눈물 ____ 않게','흘리지'),
(39,'For me','For me 나의 기억을 ____ 줘','가져가'),
(40,'For me','다시 ____ 못 하게','사랑'),
(41,'For me','안녕 ____ 안녕','안녕'),
(42,'나의 마음속에','오 나에겐 너무 ____ 바램','커다란'),
(43,'나의 마음속에','나의 ____ 널 슬프게 해서','모자람이'),
(44,'나의 마음속에','그저 ____ 남겨 둔 말','바램으로'),
(45,'나의 마음속에','할 수 없는 내가 바보 ____','같아서'),
(46,'나의 마음속에','나의 ____ 것을','모든'),
(47,'나의 마음속에','너에게 주고 ____','싶지만'),
(48,'나의 마음속에','너 빼곤 ____ 없는 나라서','아무것도'),
(49,'나의 마음속에','그런 내가 이 세상 ____','누구보다'),
(50,'나의 마음속에','널 위해 살고 ____ 걸','있는'),
(51,'나의 마음속에','그런 내가 너의 ____','곁에서'),
(52,'나의 마음속에','너를 ____ 수 있게','지킬'),
(53,'나의 마음속에','나의 ____ 그 누구보다','마음속에'),
(54,'나의 마음속에','너를 ____ 걸','사랑한다는'),
(55,'나의 마음속에','말하지 ____ 너에게','않아도'),
(56,'나의 마음속에','내 마음 ____ 바라고 있는 나야','전해지길'),
(57,'나의 마음속에','오 ____ 지킬 수 없는 약속','나에겐'),
(58,'나의 마음속에','나의 ____ 오직 너만 있어서','하루는'),
(59,'나의 마음속에','너 없인 ____ 아닌 난데','아무것도'),
(60,'나의 마음속에','하고 ____ 할 수 없는 그런 난데','싶어도'),
(61,'나의 마음속에','다 ____ 너만 있다면','버려도'),
(62,'나의 마음속에','평생을 널 ____ 살 텐데','바라보며'),
(63,'상처','널 사랑했던 내가 ____ 봐','바보였나'),
(64,'상처','널 위해서 내 모든 걸 ____','버렸는데'),
(65,'상처','너만을 위해 ____ 내 시간은','살았던'),
(66,'상처','어떻게 ____ 하니','해야'),
(67,'상처','사랑한다고 내게 ____','말했었잖아'),
(68,'상처','나만 사랑한다고 ____','약속했었잖아'),
(69,'상처','그 말만 믿고 ____ 내 시간은','살았던'),
(70,'상처','이대로 널 ____ 힘들어','지우기가'),
(71,'상처','난 내일을 어떻게 ____','살아가니'),
(72,'상처','그리운 내 마음은 너를 ____ 있어','향하고'),
(73,'상처','어디 ____ 모를 곳으로','있을지'),
(74,'상처','날카롭게 파고든 ____ 널 놓지 못하게','상처들이'),
(75,'상처','또 우연히 만들어 낸 너에 대한 ____','기억들이'),
(76,'상처','가슴 깊이 ____ 내 눈물이','스며든'),
(77,'상처','널 놓지 말라고 또 ____ 나의 사랑이','방황하는'),
(78,'상처','____ 말하고 있어 가슴 깊은 곳에','미련이라'),
(79,'상처','다신 ____ 수 없을 것 같아','사랑할'),
(80,'상처','난 하루를 어떻게 ____ 해','견뎌야'),
(81,'상처','그리운 내 ____ 너를 찾고 있어','마음은'),
(82,'상처','어디 ____ 모를 너를','있을지'),
(83,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','잘 ____ 그냥','지내는지'),
(84,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','그렇게도 널 ____ 말야','울렸는데'),
(85,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','참 ____ 나는','고마웠어'),
(86,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','아주 ____ 더','조금'),
(87,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','좋은 ____ 됐지만','사람이'),
(88,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','네 마음에 엉켜 ____ 지워','있는나를'),
(89,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','남보다 더 ____','못하게'),
(90,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','외면하고 ____ 줘','미워해'),
(91,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','아무 일도 없던 ____','것처럼'),
(92,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','____ 않은 것처럼','사랑하지'),
(93,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','잘 ____ 말은','지내라는'),
(94,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','이미 너무 ____ 말야','늦었는데'),
(95,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','이런 ____ 너에 대한','미련도'),
(96,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','하루를 버티는 ____ 못하게','일조차'),
(97,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','더 이상 ____ 일조차','스치는'),
(98,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','혹시 ____ 봐','너일까'),
(99,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','____ 일조차 없게','뒤돌아보는'),
(100,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','너의 하루는 ____ 묻거나','어땠는지'),
(101,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','너의 ____ 그랬구나','속상함을'),
(102,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','____ 일도 이젠 못하게','위로하는'),
(103,'아무 일도 없던 것처럼 사랑하지 않은 것처럼','네 ____ 엉켜 있는 나를 지워','마음에'),
(104,'나는 너의 노래가 되어','이제야 네 ____ 서서','앞에'),
(105,'나는 너의 노래가 되어','하고 싶은 ____ 있어','말이'),
(106,'나는 너의 노래가 되어','이름으로 너와 ____ 싶어','약속하고'),
(107,'나는 너의 노래가 되어','너라는 ____ 만나','사람을'),
(108,'나는 너의 노래가 되어','나는 ____ 배웠어','사랑을'),
(109,'나는 너의 노래가 되어','I ____ with you','promise'),
(110,'나는 너의 노래가 되어','언제나 너의 ____','곁에서'),
(111,'나는 너의 노래가 되어','변하지 않을 ____','나니까'),
(112,'나는 너의 노래가 되어','지치고 ____ 때','힘들'),
(113,'나는 너의 노래가 되어','내게 ____ 돼','기대도'),
(114,'나는 너의 노래가 되어','언제나 네가 ____ 수 있게','부를'),
(115,'나는 너의 노래가 되어','나는 너의 ____ 되어','노래가'),
(116,'나는 너의 노래가 되어','나라는 ____ 항상','사람은'),
(117,'나는 너의 노래가 되어','너라는 ____ 사니까','행복에'),
(118,'나는 너의 노래가 되어','네가 내게 준 ____','사랑만큼'),
(119,'나는 너의 노래가 되어','나도 널 ____','사랑할게'),
(120,'나는 너의 노래가 되어','아니 더 ____','사랑할게'),
(121,'나는 너의 노래가 되어','언제나 서로의 ____','곁에서'),
(122,'나는 너의 노래가 되어','변하지 ____ 해','않기로'),
(123,'나는 너의 노래가 되어','언제나 처음 같은 ____','마음으로'),
(124,'나는 너의 노래가 되어','서로가 서로의 ____ 되어','노래가')
on conflict(id) do update set song_title=excluded.song_title,prompt=excluded.prompt,answer=excluded.answer;
drop function if exists public.songquiz_healthcheck();
create function public.songquiz_healthcheck()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select count(*) into v_count from public.songquiz_questions;
  return jsonb_build_object('ok',v_count>=10,'question_count',v_count,'version',158,'mode','one_word_blank_answer_reveal');
end $$;

drop function if exists public.songquiz_create_room(text,integer);
create function public.songquiz_create_room(p_nickname text,p_max_players integer)
returns text language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text;v_try integer:=0;v_max integer:=greatest(2,least(4,coalesce(p_max_players,2)));
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  if nullif(trim(p_nickname),'') is null then raise exception '닉네임을 입력해 주세요.'; end if;
  delete from public.songquiz_rooms where updated_at < now()-interval '3 hours';
  loop
    v_try:=v_try+1;v_code:=upper(substr(md5(random()::text||clock_timestamp()::text||v_uid::text),1,6));
    exit when not exists(select 1 from public.songquiz_rooms where code=v_code) or v_try>20;
  end loop;
  if exists(select 1 from public.songquiz_rooms where code=v_code) then raise exception '방 코드를 만들지 못했습니다.'; end if;
  insert into public.songquiz_rooms(code,host_id,max_players,status) values(v_code,v_uid,v_max,'waiting');
  insert into public.songquiz_players(room_code,user_id,nickname,ready) values(v_code,v_uid,left(trim(p_nickname),16),false);
  return v_code;
end $$;

drop function if exists public.songquiz_join_room(text,text);
create function public.songquiz_join_room(p_code text,p_nickname text)
returns text language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_code));v_status text;v_max integer;v_count integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select status,max_players into v_status,v_max from public.songquiz_rooms where code=v_code for update;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  if exists(select 1 from public.songquiz_players where room_code=v_code and user_id=v_uid) then
    update public.songquiz_players set nickname=left(trim(p_nickname),16),left_at=null where room_code=v_code and user_id=v_uid;
    return v_code;
  end if;
  if v_status<>'waiting' then raise exception '이미 시작된 방입니다.'; end if;
  select count(*) into v_count from public.songquiz_players where room_code=v_code and left_at is null;
  if v_count>=v_max then raise exception '방이 가득 찼습니다.'; end if;
  insert into public.songquiz_players(room_code,user_id,nickname,ready) values(v_code,v_uid,left(trim(p_nickname),16),false);
  update public.songquiz_rooms set updated_at=now() where code=v_code;
  return v_code;
end $$;

drop function if exists public.songquiz_set_ready(text,boolean);
create function public.songquiz_set_ready(p_code text,p_ready boolean)
returns void language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_code));
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  if not exists(select 1 from public.songquiz_rooms where code=v_code and status='waiting') then raise exception '대기 중인 방이 아닙니다.'; end if;
  update public.songquiz_players set ready=coalesce(p_ready,false) where room_code=v_code and user_id=v_uid and left_at is null;
  if not found then raise exception '참가자가 아닙니다.'; end if;
  update public.songquiz_rooms set updated_at=now() where code=v_code;
end $$;

drop function if exists public.songquiz_start_room(text);
create function public.songquiz_start_room(p_code text)
returns void language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_code));v_host uuid;v_status text;v_max integer;v_count integer;v_ready integer;v_ids bigint[];
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select host_id,status,max_players into v_host,v_status,v_max from public.songquiz_rooms where code=v_code for update;
  if not found then raise exception '방을 찾을 수 없습니다.'; end if;
  if v_host<>v_uid then raise exception '방장만 시작할 수 있습니다.'; end if;
  if v_status<>'waiting' then raise exception '이미 시작된 방입니다.'; end if;
  select count(*),count(*) filter(where ready) into v_count,v_ready from public.songquiz_players where room_code=v_code and left_at is null;
  if v_count<>v_max then raise exception '선택한 참가 인원이 모두 모여야 합니다.'; end if;
  if v_ready<>v_count then raise exception '모든 참가자가 준비해야 합니다.'; end if;
  select array_agg(id order by rnd) into v_ids from (select id,random() rnd from public.songquiz_questions order by rnd limit 10) q;
  if coalesce(array_length(v_ids,1),0)<10 then raise exception '노래 문제 수가 부족합니다.'; end if;
  delete from public.songquiz_answers where room_code=v_code;
  update public.songquiz_players set score=0,correct_count=0,total_response_ms=0,ready=false,left_at=null where room_code=v_code;
  update public.songquiz_rooms set status='playing',current_question=0,question_ids=v_ids,question_started_at=clock_timestamp(),winner_id=null,updated_at=now() where code=v_code;
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

drop function if exists public.songquiz_get_current_question(text);
create function public.songquiz_get_current_question(p_room_code text)
returns table(question_text text,song_title text,question_number integer,total_questions integer)
language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_room_code));v_room public.songquiz_rooms%rowtype;v_qid bigint;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select * into v_room from public.songquiz_rooms where code=v_code;
  if not found or v_room.status<>'playing' then raise exception '진행 중인 대전이 아닙니다.'; end if;
  if not exists(select 1 from public.songquiz_players where room_code=v_code and user_id=v_uid and left_at is null) then raise exception '참가자가 아닙니다.'; end if;
  v_qid:=v_room.question_ids[v_room.current_question+1];
  return query select q.prompt,q.song_title,v_room.current_question+1,10 from public.songquiz_questions q where q.id=v_qid;
end $$;

drop function if exists public.songquiz_submit_answer(text,integer,text);
create function public.songquiz_submit_answer(p_room_code text,p_question_index integer,p_answer text)
returns table(result_correct boolean,result_points integer,result_answer text,result_song text,result_response_ms integer)
language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_room_code));v_room public.songquiz_rooms%rowtype;v_qid bigint;v_answer text;v_song text;v_norm_input text;v_norm_answer text;v_elapsed integer;v_correct boolean:=false;v_points integer:=0;
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  select * into v_room from public.songquiz_rooms where code=v_code for update;
  if not found or v_room.status<>'playing' then raise exception '진행 중인 대전이 아닙니다.'; end if;
  if p_question_index<>v_room.current_question then raise exception '이미 다음 문제로 넘어갔습니다.'; end if;
  if not exists(select 1 from public.songquiz_players where room_code=v_code and user_id=v_uid and left_at is null) then raise exception '참가자가 아닙니다.'; end if;
  if exists(select 1 from public.songquiz_answers where room_code=v_code and question_index=p_question_index and user_id=v_uid) then raise exception '이미 답변했습니다.'; end if;
  v_qid:=v_room.question_ids[v_room.current_question+1];
  select answer,song_title into v_answer,v_song from public.songquiz_questions where id=v_qid;
  v_elapsed:=greatest(0,least(15000,floor(extract(epoch from (clock_timestamp()-v_room.question_started_at))*1000)::integer));
  v_norm_input:=regexp_replace(lower(coalesce(p_answer,'')),'[[:space:][:punct:]]+','','g');
  v_norm_answer:=regexp_replace(lower(coalesce(v_answer,'')),'[[:space:][:punct:]]+','','g');
  if clock_timestamp()<=v_room.question_started_at+interval '15 seconds' and length(v_norm_input)>0 and v_norm_input=v_norm_answer then
    v_correct:=true;v_points:=100+greatest(0,floor((15000-v_elapsed)/100.0)::integer);
  else
    v_correct:=false;v_points:=0;
  end if;
  insert into public.songquiz_answers(room_code,question_index,user_id,answer_text,is_correct,points,response_ms) values(v_code,p_question_index,v_uid,left(coalesce(p_answer,''),200),v_correct,v_points,v_elapsed);
  update public.songquiz_players set score=score+v_points,correct_count=correct_count+case when v_correct then 1 else 0 end,total_response_ms=total_response_ms+v_elapsed where room_code=v_code and user_id=v_uid;
  update public.songquiz_rooms set updated_at=now() where code=v_code;
  return query select v_correct,v_points,v_answer,v_song,v_elapsed;
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

drop function if exists public.songquiz_leave_room(text);
create function public.songquiz_leave_room(p_room_code text)
returns void language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_code text:=upper(trim(p_room_code));v_room public.songquiz_rooms%rowtype;v_remaining integer;v_next_host uuid;
begin
  if v_uid is null then return; end if;
  select * into v_room from public.songquiz_rooms where code=v_code for update;
  if not found then return; end if;
  if not exists(select 1 from public.songquiz_players where room_code=v_code and user_id=v_uid) then return; end if;
  if v_room.status='waiting' then
    delete from public.songquiz_players where room_code=v_code and user_id=v_uid;
    select count(*) into v_remaining from public.songquiz_players where room_code=v_code and left_at is null;
    if v_remaining=0 then delete from public.songquiz_rooms where code=v_code;return;end if;
    if v_room.host_id=v_uid then select user_id into v_next_host from public.songquiz_players where room_code=v_code and left_at is null order by joined_at limit 1;update public.songquiz_rooms set host_id=v_next_host,updated_at=now() where code=v_code;end if;
    return;
  end if;
  update public.songquiz_players set left_at=coalesce(left_at,now()) where room_code=v_code and user_id=v_uid;
  if v_room.status='playing' then
    select count(*) into v_remaining from public.songquiz_players where room_code=v_code and left_at is null;
    if v_remaining<2 then select user_id into v_next_host from public.songquiz_players where room_code=v_code and left_at is null order by score desc,correct_count desc,total_response_ms asc limit 1;update public.songquiz_rooms set status='finished',winner_id=v_next_host,updated_at=now() where code=v_code;end if;
  end if;
end $$;

drop function if exists public.songquiz_list_open_rooms();
create function public.songquiz_list_open_rooms()
returns table(room_code text,host_nickname text,player_count integer,max_players integer,is_mine boolean,created_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception '로그인이 필요합니다.'; end if;
  return query
  select r.code,coalesce(h.nickname,'익명'),count(p.user_id) filter(where p.left_at is null)::integer,r.max_players,exists(select 1 from public.songquiz_players me where me.room_code=r.code and me.user_id=v_uid and me.left_at is null),r.created_at
  from public.songquiz_rooms r
  left join public.songquiz_players p on p.room_code=r.code
  left join public.songquiz_players h on h.room_code=r.code and h.user_id=r.host_id
  where r.status='waiting'
  group by r.code,h.nickname,r.max_players,r.created_at
  having count(p.user_id) filter(where p.left_at is null)<r.max_players or exists(select 1 from public.songquiz_players me where me.room_code=r.code and me.user_id=v_uid and me.left_at is null)
  order by r.created_at desc limit 30;
end $$;

revoke all on function public.songquiz_healthcheck() from public;
revoke all on function public.songquiz_create_room(text,integer) from public;
revoke all on function public.songquiz_join_room(text,text) from public;
revoke all on function public.songquiz_set_ready(text,boolean) from public;
revoke all on function public.songquiz_start_room(text) from public;
revoke all on function public.songquiz_get_snapshot(text) from public;
revoke all on function public.songquiz_get_current_question(text) from public;
revoke all on function public.songquiz_submit_answer(text,integer,text) from public;
revoke all on function public.songquiz_advance_room(text) from public;
revoke all on function public.songquiz_leave_room(text) from public;
revoke all on function public.songquiz_list_open_rooms() from public;

grant execute on function public.songquiz_healthcheck() to authenticated;
grant execute on function public.songquiz_create_room(text,integer) to authenticated;
grant execute on function public.songquiz_join_room(text,text) to authenticated;
grant execute on function public.songquiz_set_ready(text,boolean) to authenticated;
grant execute on function public.songquiz_start_room(text) to authenticated;
grant execute on function public.songquiz_get_snapshot(text) to authenticated;
grant execute on function public.songquiz_get_current_question(text) to authenticated;
grant execute on function public.songquiz_submit_answer(text,integer,text) to authenticated;
grant execute on function public.songquiz_advance_room(text) to authenticated;
grant execute on function public.songquiz_leave_room(text) to authenticated;
grant execute on function public.songquiz_list_open_rooms() to authenticated;

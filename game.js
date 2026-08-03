const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const locations={home:{name:'자취방',cls:'home'},store:{name:'편의점',cls:'store'},practice:{name:'연습실',cls:'practice'},park:{name:'공원',cls:'park'},stage:{name:'공연장',cls:'stage'}};
const baseState={day:1,slot:0,time:0,location:'home',level:1,exp:0,rank:'무명 가수',weather:'sun',housing:0,endingPrompted:{},pendingEnding:null,stats:{hp:80,vocal:22,compose:16,acting:0,looks:35,fame:0,fans:0,money:800000,stress:10},equipment:{mic:false,amp:false,battery:false},equipmentModel:{mic:null,amp:null},equipmentDamage:{mic:false,amp:false},equipmentDurability:{mic:0,amp:0,battery:0},forcedRest:{count:0,lastTriggeredDay:-99},restStreak:0,restNightmares:{totalRests:0,lastTriggeredRest:0,seen:[]},dailyPractice:{vocalDay:0,composeDay:0,vocalPenaltyCount:0,composePenaltyCount:0,penaltyInterval:7},instruments:{acousticGuitar:false,keyboard:false,audioInterface:false,studioMic:false,monitorHeadphones:false},fanGroups:{regular:0,enthusiast:0,gay:0,overseas:0},sns:{lastPostDay:-99,totalPosts:0,lastLiveDay:-99,totalLives:0,lastLiveScenario:null,nextVocalBonus:0,nextComposeBonus:0,controversy:0,lastEventDay:-99},drawer:{photos:Array.from({length:7},()=>Array(9).fill(false)),photoMissStreak:0,diaries:[],diaryFoundDays:{},diaryCheckedDay:-99,diaryMissStreak:0,todayDiaryId:null,todayMessage:'',newPhotos:false,newDiary:false,lastTab:'photos'},rival:{met:false,stage:0,respect:0,lastEventDay:-99},items:{bakcas:1,energizer:0,dietPill:0,strongDietPill:0,bakcasUsedToday:0,mealsToday:0,bakcasBoughtToday:0,snacksBoughtToday:0},storeDaily:{promoDay:-99,customerDay:-99,flyerDay:-99,observeDay:-99,buskingDay:-99,buskingCount:0},storeJobs:{workCount:0,stockWorkCount:0},dailyUse:{styleCareDay:-99,styleCareLastDay:1,styleDecayCount:0,meditationDay:-99,meditationCount:0,walkDay:-99,walkCount:0},effects:{energizerUntilDay:0,energizerConsecutiveCount:0,energizerOverdose:false},fleaMarket:{cycleDay:0,soldOut:false,offers:[],purchased:[]},specialProgress:{cardCollectorOfferSeen:false,cardCollectorEligibleDay:0,cardCollectorVisitDone:false,cardCollectorDeclinedDay:0,cardTheftDone:false,weddingSongSeen:false,weddingInviteSeen:false,hurabonoWeddingDone:false},economy:{workStreak:0,lastWorkDay:-99,debt:0,totalDebtRepaid:0,lastDebtNoticeDay:-99,debtStartDay:0,debtCriticalDay:0},equippedInstruments:[],career:{peakFame:0,totalWork:0,totalConcerts:0,totalBroadcasts:0,totalBusking:0,soloBusking:0,bandBusking:0,actingCount:0,actingHits:0},manager:{hired:false,bond:0,wedding:false},band:{formed:false,bond:60,members:{guitar:null,bass:null,piano:null,drums:null}},bandTalk:{lastDay:{guitar:-99,bass:-99,piano:-99,drums:-99},lastTopic:{guitar:-1,bass:-1,piano:-1,drums:-1}},albums:[],endings:[],history:[],dialogue:null,seenEvents:[],soloStreak:0,outfit:0,ownedOutfits:[0],performanceCount:0,stalker:{active:false,resolved:false,encounters:0,safety:0,motherEvacuated:false},narrative:{lastMajorEventDay:-99,twentyDaySeen:[]},gambling:{cards:{C:0,U:0,R:0,SR:0,SEC:0,SP:0},totalCardDraws:0,spDraws:0,lotteryTickets:[],lotteryResults:[]},minigames:{songSurvivalLastDay:-99,quizShowLastDay:-99,songBestStage:0,quizBest:0,quizBag:[],cookingPlayed:0,cookingBest:0,cookingPerfect:0,storeTetrisBest:0,runnerBest:0},arrogance:{lastDay:-99,count:0,lesson:0},specialEvents:{iziViral:false,waitedMoreViral:false,day30Hair:false,day60Workout:false,day90Live:false,day120Chat:false,day150Birthday:false,day180Archive:false,day210Demo:false,day240Meme:false,day300Promise:false,day330Mother:false,day360Reflection:false,day400Fanmeet:false,day450ReturnSpring:false,day500SchoolFestival:false,restLooksNightmare:false,hiddenGameOst:false,hiddenRadioDj:false,hiddenDingo:false,careerLv70:false,careerLv80:false,careerLv90:false,actingExtra:false,firstKissScene:false,mysteriousMerchantPurchased:false,cardCollectorVisit:false,cardTheft:false,hurabonoWeddingDay:false},specialScene:{active:false,key:null},preparation:{stageReady:false,stageReadyDay:-99,buskingInsight:false,buskingInsightDay:-99},cooldowns:{managerTalk:-99,recruit:-99,audition:-99,concert:-99,broadcast:-99,fanmeeting:-99,album:-99,fanEvent:-99,snsPost:-99},milestones:{firstAudition:false,firstConcert:false,firstBroadcast:false,firstFanmeeting:false,firstAlbum:false,managerHired:false,bandFormed:false,stalkerResolved:false,randomSeen:[]},historyKeys:[],lastAction:null,prologueSeen:false};
let state=structuredClone(baseState);let deferredPrompt=null;let audioCtx=null;let motionTimer=null;let burstTimer=null;let memoryGameActive=false;let activeTrainingAbort=null;
let audioMaster=null,bgmGain=null,sfxGain=null,bgmTimer=null,bgmStep=0;
let specialEventBgm=null,specialEventBgmKey=null;
let audioScreenMode='title';
let choiceLock=false,endingMusicMode=false,endingMusicName='';
let customEndingBgm=null,customEndingBgmName='';
let blockingNoticeActive=false;
let instagramLiveActive=false;
let pendingLocationActionStress=false;
let deferredPostAdvance=null;
let cardRevealPending=false;
let pendingTrainingActionBefore=null;
let audioSettings={bgm:true,sfx:true};
const FIXED_MASTER_VOLUME=.72,REGULAR_BGM_VOLUME=.025,SPECIAL_EVENT_BGM_VOLUME=.020,ENDING_BGM_VOLUME=.012,SFX_GAIN_VOLUME=1.8;
const BANKRUPTCY_CRITICAL_DEBT=500000,BANKRUPTCY_CRITICAL_DAYS=15,BANKRUPTCY_MAX_DAYS=30;
const SPECIAL_EVENT_DEFAULT_BGM_ID='specialEventDefaultBgm';
const specialEventBgmMap={};
const customEndingBgmMap={'파산 엔딩':'fatalEndingBgm','활동 중지 엔딩':'fatalEndingBgm'};
const DEFAULT_ENDING_BGM_ID='springRainEndingBgm';
const endingArtworkMap={
 '작곡가 엔딩':'assets/images/endings/ending-composer.png',
 '디지몬 카드샵 사장 엔딩':'assets/images/endings/ending-cardshop.png',
 '무명가수 엔딩':'assets/images/endings/ending-nameless.png',
 '밴드가수 엔딩':'assets/images/endings/ending-band.png',
 '보컬트레이너 엔딩':'assets/images/endings/ending-trainer.png',
 '유명 솔로가수 엔딩':'assets/images/endings/ending-solo.png',
 '활동 중지 엔딩':'assets/images/endings/ending-hiatus.png',
 '월드스타 엔딩':'assets/images/endings/ending-worldstar.png',
 '인플루언서 엔딩':'assets/images/endings/ending-influencer.png',
 '파산 엔딩':'assets/images/endings/ending-bankruptcy.png',
 '단역 배우 엔딩':'assets/images/endings/ending-actor-support.png',
 '유명 배우 엔딩':'assets/images/endings/ending-actor-famous.png',
 '편의점 사장 엔딩':'assets/images/endings/ending-store-owner.png'
};
const OUTFIT_FILES=['outfit-black.png','outfit-white.png','outfit-check.png','outfit-leather.png','outfit-hoodie.png','outfit-stage.png','outfit-mystery.png','user-flea-military.png','user-flea-towel.png','user-flea-sports.png','user-flea-flashy.png','user-flea-uniform.png'];
const FLEA_MARKET_ITEMS=[
 {id:'military',name:'군복',price:800000,desc:'재입대하기 싫은데...',outfit:7,image:'assets/images/user-flea-military.png',lookBonus:0},
 {id:'towel',name:'수건',price:3000000,desc:'수건? 집에 하나 있으면 좋겠지. 그런데 수건 가격이 왜이러지',outfit:8,image:'assets/images/user-flea-towel.png',lookBonus:0},
 {id:'sports',name:'운동복',price:900000,desc:'뭔가 굉장히 타이트해 보인다',outfit:9,image:'assets/images/user-flea-sports.png',lookBonus:1},
 {id:'flashy',name:'화려한 옷',price:4000000,desc:'화려해보이는데 뭔가....',outfit:10,image:'assets/images/user-flea-flashy.png',lookBonus:2},
 {id:'uniform',name:'제복',price:5000000,desc:'엄청 멋져보이는 제복',outfit:11,image:'assets/images/user-flea-uniform.png',lookBonus:2},
 {id:'strongDiet',name:'강력한 다이어트알약',price:200000,desc:'굉장히 쎄보이는 다이어트약이다. 약이 잘들수도?',strongDiet:true,image:null}
];
function outfitImage(index=state.outfit){return `assets/images/${OUTFIT_FILES[index]||OUTFIT_FILES[0]}`}
function fleaMarketIsOpen(day=state.day){return day>=7&&day%7===0}
function fleaMarketDaysUntilOpen(day=state.day){if(day<7)return 7-day;const mod=day%7;return mod===0?0:7-mod}
function currentFleaCycleDay(day=state.day){return fleaMarketIsOpen(day)?day:day-fleaMarketDaysUntilOpen(day)}
const actions={
 home:[
  ['깊은 휴식','체력 +25~45 · 스트레스 -10 · 시간 +2 · 2회 연속 시 보컬·작곡 -1 · 누적 5회 이후 휴식 3회 간격·20% 악몽','rest'],
  ['명상','스트레스 -5 · 하루 2회 · 비용·시간 미소모','meditate'],
  ['서랍','사진 퍼즐 7장·일기 50편 수집 · 시간·능력치 변화 없음','drawer'],
  ['식사','체력 +12~27 · 하루 2회 · 15% 확률로 요리 타이쿤 · 집 등급마다 비용 2배 · 시간 미소모','meal'],
  ['옷장','의상 변경 · 헤어 스타일 관리 15일마다 1회 · 체력 -4·돈 -500,000원·외모 +1','wardrobe'],
  ['이사','돈 -1,000만~1억원 · 집 등급 상승 · 시간 +1','moveHome'],
  ['가계부·채무','채무 상환 시 보유금 감소 · 시간 미소모','finance'],
  ['디지몬 카드 보관함','보유 카드 확인·등급별 판매 · 시간 미소모','digimonInventory']
 ],
 store:[
  ['편의점 알바','누적 10·30·80회 단계 상승 · 단계별 급여 증가 · 시간 +1','work'],
  ['야간 진열 보조','누적 10·30·80회 단계 상승 · 단계별 급여 증가 · 시간 +1','stockWork'],
  ['박칵스 구입','돈 -15,000원 · 박칵스 +1 · 하루 최대 3개 · 스트레스 변화 없음 · 시간 미소모','buyBakcas'],
  ['삼각김밥','체력 +8 · 돈 -2,500원 · 하루 최대 3개 · 스트레스 변화 없음 · 시간 미소모','snack'],
  ['매장 홍보 방송','체력 -8 · 스트레스 +4 · 팬 +8~20 · 인지도 +2 · 시간 +1','storePromo'],
  ['단골 손님 응대','체력 -6 · 스트레스 +2 · 팬 +2~6 · 돈 +3,000~8,000원 · 시간 +1','customerPractice'],
  ['디지몬 카드','1장 체력 -1 · 10장 체력 -5 · 시간 +1','digimonCard'],
  ['복권','1장 체력 -1 · 10장 체력 -5 · 시간 미소모 · 주 100장 제한','lottery']
 ],
 practice:[
  ['보컬 연습','체력 -12 · 보컬 +0~11 · 스트레스 +1 · 시간 +1','vocal'],
  ['작곡 연습','체력 -10 · 작곡 +0~11 · 스트레스 +1 · 시간 +1','compose'],
  ['멤버 오디션','체력 -10 · 돈 -12만~32만원 · 멤버 +1 · 스트레스 +1 · 시간 +1','recruit'],
  ['밴드 합주','체력 -18 · 보컬 +0~2 · 밴드 결속력 +12 · 스트레스 +1 · 시간 +1','rehearse'],
  ['신곡 편곡','체력 -15 · 작곡 +0~2 · 밴드 결속력 +5 · 스트레스 +1 · 시간 +1','arrange'],
  ['장비 점검','돈 -50,000원 · 마이크·음향장비 내구도 전체 회복 · 스트레스 +1 · 시간 +1','repair'],
  ['앨범 제작','돈 -500만~5,000만원 · 팬·인지도·정산 증가 · 스트레스 +1 · 시간 +1','album'],
  ['연기','366일차부터 · 체력 -14 · 연기 경력 증가 · 낮은 확률로 러닝 미니게임 · 시간 +1','acting']
 ],
 park:[
  ['버스킹','성공 시 보컬 +1 · 1% 확률로 에너자이저 획득 · 시간 +1','busking'],
  ['밴드 버스킹','성공 시 보컬 +1 · 1% 확률로 에너자이저 획득 · 시간 +1','bandBusking'],
  ['산책','스트레스 -15 · 하루 2회 · 1% 확률로 박칵스 획득 · 시간 +1','walk'],
  ['라이벌 관찰','체력 -6 · 보컬 +1 · 스트레스 +1 · 시간 +1','observe'],
  ['공연 전단 홍보','체력 -8 · 돈 -20,000원 · 팬 +8~15 · 인지도 +1 · 시간 +1','flyerPromo'],
  ['관객 반응 조사','체력 -6 · 스트레스 -3 · 다음 버스킹 보너스 · 시간 +1','audienceResearch'],
  ['플리마켓','7일마다 개장 · 랜덤 상품 · 시간 미소모','fleaMarket']
 ],
 stage:[
  ['무대 리허설','다음 무대 보너스 · 공연 기본 상한 3,900,000원 · 리허설+공연 미니게임 성공 시 최대 4,300,000원 · 시간 +1','stageRehearsal'],
  ['오디션','체력 -20 · 성공 시 스트레스 +1·팬 +45~150·인지도 +18~45 / 실패 시 스트레스 +6 · 시간 +1','audition'],
  ['공연','성공 시 보컬 +1 · 체력 -28 · 팬·돈·인지도 +변동 · 시간 +1','concert'],
  ['방송 출연','체력 -22 · 스트레스 +7 · 팬 +250~690 · 인지도 +90~138 · 관계 +5 · 시간 +1','broadcast'],
  ['팬미팅','체력 -20 · 돈 -300,000원 · 팬 +220~450 · 스트레스 -7 · 시간 +1','fanmeeting'],
  ['월드 투어 선언','정규앨범·외모100·Lv100·팬10만·펜트하우스·보컬/작곡95 · 시간 미소모','national'],
  ['노래 서바이벌','366일차부터 · 음표 벽돌깨기 · 처음부터 최고 난이도 · 7일 간격 · 시간 +1','songSurvival'],
  ['도전 퀴즈쇼','366일차부터 · 류현상 O/X 퀴즈 10문제 · 7일 간격 · 시간 +1','quizShow']
 ]
};
const dialogues={
 home:[
  '방 안은 조용했다. 창문 틈으로 들어온 빛이 기타 케이스 위에 길게 누웠다. 오늘도 누군가 알아주지 않는 노래를 만들겠지만, 적어도 어제보다 한 줄은 더 솔직하게 쓸 수 있을 것 같다.',
  '냉장고를 열어 보니 물과 반쯤 남은 김치뿐이었다. 류현상은 잠시 고민하다 문을 닫았다. 배고픔보다 먼저 떠오른 건 어젯밤 완성하지 못한 후렴구였다.',
  '벽이 얇아 큰 소리로 노래할 수 없었다. 그는 이불을 뒤집어쓰고 작은 목소리로 고음을 확인했다. 옆집에서는 재채기 소리가 들렸다. 적어도 항의는 아니었다.',
  '책상 위에는 구겨진 가사 종이가 쌓여 있었다. “사랑”이라는 단어를 지우고 “미련”을 썼다가, 다시 지웠다. 좋은 가사보다 솔직한 가사가 더 어려웠다.',
  '현상은 거울 속 긴 머리를 한참 바라봤다. 자르면 편할 것 같았지만, 이상하게도 이 머리까지 잘라 버리면 무명 시절의 자신도 함께 사라질 것 같았다.',
  '휴대전화에는 조회수 17회의 영상이 떠 있었다. 그중 세 번은 후라보노, 두 번은 본인이 눌렀다는 사실을 그는 굳이 계산하지 않기로 했다.',
  '아랫집에서 천장을 두드리는 소리가 났다. 류현상은 기타를 내려놓고 조용히 중얼거렸다. “이번에는 내가 아니라 냉장고인데.” 냉장고는 억울하다는 듯 다시 웅웅거렸다.',
  '비싼 집으로 이사하는 상상을 하다가 월세 자동이체 문자를 확인했다. 상상은 정확히 4초 만에 끝났다.'
 ],
 store:[
  '형광등 아래에서 보면 누구나 조금 피곤해 보인다. 류현상은 유리문에 비친 자신의 얼굴을 보고 안경을 고쳐 썼다. 손님이 아니라 야간 근무자처럼 보이는 데 성공했다.',
  '계산대 앞 손님이 류현상을 빤히 보더니 물었다. “혹시 그 공원에서 노래하는 분 맞죠?” 그는 잠시 고민하다 영수증을 건네며 말했다. “오늘은 계산하는 사람입니다.”',
  '박칵스를 바라보는 시간이 길어졌다. 음료 냉장고 안에서 작은 병들이 마치 합창단처럼 줄을 맞추고 있었다. 문제는 한 병으로 피로가 사라지지 않는다는 점이었다.',
  '삼각김밥 포장을 뜯으며 그는 유통기한과 자신의 가수 인생을 비교하지 않기로 했다. 적어도 삼각김밥은 오늘 안에 누군가 선택해 줄 것이다.',
  '편의점 스피커에서 유행곡이 흘러나왔다. 류현상은 음료를 진열하면서 무심코 화음을 넣었다. 손님 한 명이 놀라 돌아봤지만, 그는 아무 일도 없었다는 듯 생수 가격표를 정리했다.',
  '손님이 “박칵스 어디 있어요?”라고 묻자 류현상은 너무 빠르게 위치와 효능과 가격까지 설명했다. 손님은 잠시 침묵하다 두 병을 샀다. 본인도 한 병 살까 고민했다.',
  '새벽 두 시, 아무도 없는 매장에 전자레인지 완료음이 울렸다. 류현상은 그 네 음을 듣고 괜찮은 멜로디라고 생각했다. 피곤하면 무엇이든 곡이 된다.',
  '진상 손님이 봉투값 100원을 두고 십 분째 항의했다. 류현상은 무대보다 계산대가 더 강한 멘탈을 요구한다는 사실을 배웠다.'
 ],
 practice:[
  'B군은 합주 시작 전부터 기타 톤과 코러스 수정안을 동시에 정리하고 있었다. L군은 ‘형, 저 사람은 쉬는 날에도 출근할 상인데요?’라고 웃었고, J군은 고개만 한 번 끄덕였다. R군은 스틱으로 의자를 두드렸다. 아직 한 음도 맞추지 않았는데 이미 성격은 다 드러났다.',
  '“다시.” 류현상이 짧게 말하자 네 명이 동시에 한숨을 쉬었다. 그래도 누구도 악기를 내려놓지 않았다. 그 작은 사실이 오늘 연습의 가장 좋은 부분이었다.',
  'B군이 기타 볼륨을 올리며 ‘현상아, 후렴 묻힌다. 이 정도는 나와야 된다 아이가’라고 말했다. L군은 웃으며 ‘둘 다 조금씩만 내리면 평화롭지 않을까요?’라고 중재했고, J군은 말없이 귀마개를 꺼냈다. R군만 아쉬운 표정이었다.',
  '합주가 끝나고 저녁 메뉴를 정하는데 누군가 해물탕을 말하자 J군의 손이 건반 위에서 멈췄다. 한참 침묵하던 J군이 아주 작게 말했다. ‘그건… 좀 무섭습니다.’ L군이 웃음을 참느라 고개를 숙였다.',
  'R군은 필인 한 번을 멋지게 성공한 뒤 같은 필인을 모든 마디에 넣기 시작했다. 류현상이 세 번째 반복에서 멈추자 R군은 아쉬운 표정으로 스틱을 내려놨다.',
  'L군은 틀린 음이 나올 때마다 부드럽게 농담을 던졌다. ‘형, 방금 음 하나가 집에 먼저 갔는데요?’ 류현상이 인상을 쓰자 곧바로 웃으며 ‘괜찮아요. 다시 잡으면 되죠.’라고 덧붙였다.',
  '합주가 끝난 뒤 멤버들은 아무도 먼저 나가지 않았다. 음악 이야기를 하다가 배달 메뉴 이야기로 넘어갔고, 결국 가장 오래 논의한 것은 탕수육 소스를 붓느냐 찍느냐였다.',
  '후라보노가 문을 열고 들어오더니 연습실을 한 바퀴 둘러봤다. “형, 음악은 좋은데 전기세가 무대급이에요.” 모두가 조용히 앰프 볼륨을 한 칸 내렸다.'
 ],
 park:[
  '공원에는 운동하는 사람, 산책하는 사람, 아무 이유 없이 벤치에 앉아 있는 사람이 있었다. 류현상은 그중 단 한 명이라도 노래를 듣기 위해 멈춰 주길 바라며 마이크를 세웠다.',
  '바람이 불 때마다 긴 머리카락이 입술에 붙었다. 세 번째 곡에서 그는 노래를 멈추고 머리를 묶었다. 관객 한 명이 박수를 쳤다. 노래보다 실용적인 선택에 대한 박수 같았다.',
  '첫 곡이 끝났지만 아무도 박수치지 않았다. 류현상은 두 번째 곡을 시작했다. 무명가수의 장점은 침묵에 익숙하다는 것이고, 단점도 정확히 그것이었다.',
  '벤치 끝에 늘 오는 중년 남자가 앉아 있었다. 그는 한 번도 박수치지 않았지만 항상 마지막 곡까지 듣고 갔다. 오늘은 작은 캔커피 하나를 무대 앞에 두고 떠났다.',
  '강아지 한 마리가 스피커 앞에 앉아 고개를 갸웃거렸다. 주인이 끌고 가려 했지만 강아지는 버텼다. 오늘 가장 열성적인 관객은 사람보다 네 발이 많았다.',
  '아이들이 류현상의 긴 머리를 보고 “마법사다”라고 속삭였다. 류현상은 마이크를 잡고 낮게 말했다. “노래만 하는 마법사야.” 아이들은 기대보다 크게 웃었다.',
  '비가 올 듯 구름이 내려앉았다. 관객은 줄었지만 소리가 공기 속에서 더 선명하게 퍼졌다. 나쁜 날씨가 항상 나쁜 무대를 만드는 것은 아니었다.',
  '멀리서 누군가 휴대전화로 촬영하고 있었다. 조회수가 오를 기회인지, 또 다른 흑역사의 시작인지 알 수 없었다.'
 ],
 stage:[
  '무대 뒤에서는 모든 사람이 평소보다 조용했다. 케이블을 정리하는 스태프의 발소리까지 크게 들렸다. 류현상은 손바닥의 땀을 셔츠에 닦고 첫 음을 머릿속으로 반복했다.',
  '관객석은 어두워 얼굴이 보이지 않았다. 이상하게도 그 편이 편했다. 수백 명의 낯선 사람은 한 명의 냉정한 심사위원보다 덜 무서울 때가 있었다.',
  '후라보노가 큐시트를 들고 다가왔다. “형, 긴장돼요?” 류현상이 대답하지 않자 후라보노는 고개를 끄덕였다. “네. 평소랑 똑같다는 뜻이군요.”',
  'B군은 무대 직전까지 기타 톤과 세트리스트를 확인하며 ‘마, 준비는 해도 해도 끝이 없다’고 중얼거렸다. L군은 긴장을 풀려고 가벼운 농담을 던졌고, J군은 말없이 건반 앞에 앉았다. R군은 스틱을 한 번 떨어뜨렸다. 완벽하지 않아서 오히려 익숙한 팀이었다.',
  '조명이 켜지는 순간, 생활비와 악성 댓글과 월세가 잠시 머릿속에서 사라졌다. 무대 위에서는 노래 하나만 제대로 끝내면 됐다.',
  '대기실 거울에는 출연자들의 이름표가 줄지어 붙어 있었다. 가장 아래에 적힌 류현상의 이름이 낯설게 보였다. 언젠가는 가장 큰 글씨로 적힐 수 있을까.',
  '관객이 류현상의 이름을 외쳤다. 처음에는 몇 명뿐이었지만 곧 더 많은 목소리가 섞였다. 그는 안경을 고쳐 쓰며 그 소리를 오래 기억하려 했다.',
  '무대 감독이 30초 남았다고 손가락으로 신호했다. 후라보노는 “형, 가사 잊어도 표정으로 버티세요”라고 속삭였다. 전혀 도움이 되지 않았지만 웃음은 났다.'
 ]
};
const actionDialogue={
 rest:[
  '눈을 감자 멀리서 자동차 소리와 냉장고 모터 소리가 겹쳐 들렸다. 이상하게도 일정한 박자였다. 류현상은 쉬면서도 그 리듬을 기억해 뒀다.',
  '소파에 눕자마자 잠들 줄 알았지만 머릿속에서는 후렴구가 계속 반복됐다. 그는 결국 휴대전화에 허밍을 녹음한 뒤에야 편하게 숨을 내쉬었다.',
  '아무것도 하지 않는 시간이 불안했지만, 목과 어깨의 힘이 풀리는 걸 느끼자 조금은 납득할 수 있었다. 쉬는 것도 다음 노래를 위한 준비였다.',
  '후라보노가 보내온 메시지에는 “형, 쉬세요”라는 문장이 세 번 적혀 있었다. 류현상은 답장 대신 휴대전화를 뒤집어 놓았다. 말은 안 들어도 메시지는 읽었다.'
 ],
 meditate:[
  '류현상은 휴대전화를 뒤집어 놓고 조용히 호흡을 세었다. 머릿속에서 엉켜 있던 일정과 숫자가 조금씩 멀어졌다.',
  '창문을 조금 열고 등을 곧게 폈다. 들이마시는 숨보다 내쉬는 숨을 길게 가져가자 굳어 있던 어깨가 천천히 풀렸다.',
  '아무 음악도 틀지 않은 채 방 안의 작은 소리에 집중했다. 몇 분 뒤에는 걱정이 사라지지는 않았지만, 적어도 끌려가지는 않을 수 있었다.'
 ],
 compose:[
  '첫 줄은 쉽게 나왔지만 두 번째 줄에서 한 시간이 멈췄다. 류현상은 “영원”을 썼다가 너무 흔해 지우고, “내일”을 썼다가 너무 밝아 다시 지웠다.',
  '후렴구를 녹음해 밴드 채팅방에 올리자 B군은 ‘현상아, 2절 코드 내가 조금 손봐도 되나. 좋다.’라고 답했고, L군은 ‘형 이거 꽤 좋은데요? 제 친구한테 자랑 좀 해도 되겠네요 ㅋㅋ’라고 보냈다. J군은 엄지 이모티콘 하나, R군은 드럼 이모티콘 18개를 보냈다.',
  '멜로디는 좋았지만 가사가 문제였다. 솔직하게 쓰면 부끄럽고, 숨기면 아무 감정도 남지 않았다. 결국 가장 지우고 싶었던 문장을 첫 소절에 넣었다.',
  '전자레인지 완료음에서 시작한 멜로디가 생각보다 근사하게 이어졌다. 명곡의 탄생 배경을 나중에 인터뷰에서 솔직히 말할지는 고민해 보기로 했다.'
 ],
 vocal:[
  '고음에서 힘이 들어가자 류현상은 다시 처음부터 불렀다. 더 크게가 아니라 더 편하게. 열 번째 시도에서야 목소리가 억지로 밀어 올리지 않아도 떠올랐다.',
  '녹음된 자신의 목소리는 언제나 낯설었다. 잘한 부분보다 부족한 부분이 먼저 들렸지만, 오늘은 어제보다 숨소리가 안정적이었다.',
  'B군이 문밖에서 ‘현상아, 그 부분만 스물일곱 번째다. 목부터 좀 쉬어라.’라고 말했다. 류현상이 ‘형은 작업 좀 쉬고?’라고 받아치자 B군은 잠시 침묵했다. 둘 다 상대에게 할 말은 아니었다.',
  '음정은 맞았지만 감정이 비어 있었다. 그는 눈을 감고 가장 듣고 싶었던 말을 떠올린 뒤 다시 노래했다. 이번에는 기계의 숫자보다 본인의 귀가 먼저 반응했다.'
 ],
 busking:[
  '첫 곡에서는 세 명이 멈췄고, 두 번째 곡에서는 일곱 명이 남았다. 마지막 곡이 끝났을 때 낯선 사람들이 서로 눈치를 보다가 동시에 박수를 쳤다.',
  '한 관객이 신청곡을 외쳤지만 류현상이 모르는 곡이었다. 그는 잠시 침묵한 뒤 “다음 주까지 배워 오겠습니다”라고 답했다. 관객은 정말 다음 주에 오겠다고 했다.',
  '노래 도중 아이가 무대 앞 모금함에 과자 한 봉지를 넣었다. 현금은 아니었지만 류현상은 오늘 받은 것 중 가장 비싼 응원처럼 느꼈다.',
  '바람 때문에 악보가 날아갔다. 류현상은 가사를 기억하는 척 계속 노래했지만 2절 대부분은 즉흥이었다. 이상하게도 관객 반응은 평소보다 좋았다.'
 ],
 bandBusking:[
  'R군의 첫 드럼이 울리자 지나가던 사람들이 동시에 고개를 돌렸다. B군이 ‘가보자, 현상아’ 하고 기타를 들어 올렸고, L군은 여유롭게 웃으며 베이스를 얹었다. J군은 말없이 첫 코드를 눌렀다. 혼자서는 만들 수 없는 시작이었다.',
  'J군이 예정에 없던 짧은 간주를 시작했다. 평소 말도 적은 사람이 갑자기 방향을 틀자 모두가 놀랐지만, B군이 바로 ‘좋다, 간다’ 하고 따라붙었고 R군이 박자를 받쳤다. 끝나고 보니 오늘 가장 좋은 부분이었다.',
  '마지막 곡에서 멤버들이 서로 눈을 마주쳤다. 누구도 말하지 않았지만 엔딩을 한 번 더 늘렸다. 관객은 그것을 계획된 연출이라고 믿어 줬다.',
  '공연 후 모금함을 열자 돈보다 밴드 이름을 적은 쪽지가 더 많았다. R군은 쪽지를 하나씩 읽었고 L군은 사진을 찍어 단체방에 올리며 ‘오늘 우리 좀 인기 밴드 같지 않아요?’라고 웃었다.'
 ],
 rehearse:[
  '첫 합주는 엉망이었다. B군은 ‘한 번 더 하자’며 쉬지 않고 수정안을 냈고 R군은 자꾸 빨라졌다. J군은 필요한 말만 짧게 하고 다시 건반을 쳤다. L군은 틀릴 때마다 농담으로 분위기를 풀었다. 이상하게도 그래서 계속할 수 있었다.',
  '세 번째 반복에서 드디어 네 악기가 같은 곳을 향했다. 곡이 끝나자 아무도 말하지 않았다. 잘됐다는 걸 모두 알고 있을 때 나오는 침묵이었다.',
  'R군이 ‘이번엔 완벽했죠?’라고 묻자 L군이 웃으며 ‘거의요. 두 번째 마디는 못 들은 걸로 해드릴까요?’라고 답했다. R군은 억울해했지만 녹음 파일은 L군의 편이었다.',
  '후라보노가 합주를 듣고 박수를 쳤다. “좋네요. 그런데 곡이 7분이면 방송에서는 1절 시작 전에 잘려요.” 감동은 정확히 3초 만에 현실로 돌아왔다.'
 ],
 audition:['대기 번호가 불리자 입안이 바짝 말랐다. 류현상은 안경을 고쳐 쓰고 무대 중앙으로 걸었다. 심사위원의 표정보다 마이크의 높이를 맞추는 데 집중했다.','첫 소절에서 목소리가 조금 떨렸지만 두 번째 문장부터는 관객석이 보이지 않았다. 노래가 끝난 뒤 찾아온 정적이 실패인지 집중인지 알 수 없었다.'],
 concert:['객석의 불이 꺼지고 수백 개의 응원봉이 떠올랐다. 류현상은 첫 음을 내기 전 그 풍경을 한 번 더 눈에 담았다.','앙코르 요청이 계속되자 후라보노가 무대 옆에서 손가락 하나를 들어 보였다. 한 곡만 더 하라는 뜻이었지만, R군은 이미 세 곡 할 표정이었다.'],
 broadcast:['카메라 감독이 “자연스럽게 해주세요”라고 말했다. 카메라 세 대와 스태프 열 명 앞에서 자연스러운 사람이 되는 것은 노래보다 어려웠다.','생방송 표시등이 켜지자 후라보노가 멀리서 입 모양으로 “웃어요”라고 말했다. 류현상은 아주 조금 입꼬리를 올렸다. 방송 후 팬들은 그 장면을 희귀 영상이라 불렀다.'],
 walk:['이어폰 없이 걸으니 도시의 소리가 그대로 들렸다. 횡단보도 신호음, 자전거 벨, 아이들의 웃음이 서로 다른 리듬으로 겹쳤다.','공원 한 바퀴를 돌고 나니 머릿속을 꽉 채우던 생각들이 조금씩 자리를 비켰다. 돌아가는 길에는 새 가사의 첫 문장이 떠올랐다.'],
 observe:['라이벌은 고음을 힘으로 밀지 않았다. 류현상은 질투하는 대신 호흡 위치와 입 모양을 유심히 봤다. 배울 수 있다면 자존심은 잠시 미뤄도 됐다.','잘하는 사람의 무대는 간단해 보였다. 하지만 자세히 볼수록 작은 선택이 수십 개 쌓여 있었다. 류현상은 휴대전화 메모장에 관찰한 내용을 적었다.'],
 meal:['따뜻한 국물이 목을 지나자 몸이 조금 풀렸다. 류현상은 너무 빨리 먹다가 혀를 데었고, 무대보다 식사가 더 위험할 수 있다는 사실을 배웠다.','오랜만에 제대로 된 식사를 했다. 밥을 먹는 동안만큼은 팬 수와 인지도와 월세를 생각하지 않으려 했지만, 계산서가 나오자 다시 현실로 돌아왔다.'],
 snack:['삼각김밥 포장을 뜯다가 김이 반으로 찢어졌다. 류현상은 무너진 모양을 잠시 바라본 뒤 그냥 먹었다. 맛에는 큰 지장이 없었다.','간단히 배를 채웠다. 배고픔은 사라졌지만 편의점 신제품 디저트에 대한 미련은 남았다.'],
 work:['새벽 배송 상자를 정리하고 계산대를 지켰다. 손님이 몰릴 때마다 무대보다 빠른 판단력이 필요했다. 그래도 근무가 끝나자 통장 잔고는 확실히 늘었다.','한 손님이 류현상을 알아보고 사인을 부탁했다. 점장은 계산부터 하라고 눈짓했고, 류현상은 영수증 뒷면에 아주 빠르게 이름을 적었다.','컵라면 물을 세 번 쏟은 손님과 봉투값을 항의하는 손님이 동시에 왔다. 류현상은 오늘 얻은 것은 70,000원과 강한 정신력이라고 생각했다.','매장 음악으로 자신의 버스킹 영상이 재생됐다. 손님들은 아무도 눈치채지 못했지만 류현상은 노래가 끝날 때까지 진열대 뒤에서 나오지 않았다.'],
 bakcas:['박칵스를 마시자 정신이 번쩍 들었다. 효과인지 플라시보인지 중요하지 않았다. 지금 필요한 것은 다시 움직일 이유였다.','병뚜껑을 열자 익숙한 향이 올라왔다. 류현상은 “이 정도면 공식 스폰서가 연락할 때도 됐는데”라고 혼잣말했다. 아무 연락도 오지 않았다.'],
 sleep:['내일은 오늘보다 조금 더 나아질 수 있을까. 정답은 없었지만 알람은 정확히 맞춰 두었다.']
};
const actionFollowups={
 rest:['창밖의 빛이 조금 기울 때까지 그는 말없이 숨을 골랐다. 다시 일어날 때는 방금 전보다 어깨가 가벼웠다.','쉬는 동안 팬카페 알림이 몇 번 울렸지만 확인하지 않았다. 오늘만큼은 숫자보다 목 상태가 먼저였다.'],
 meditate:['짧은 명상이 끝난 뒤에도 문제는 그대로였지만, 무엇부터 해야 할지는 전보다 또렷해졌다.','그는 눈을 뜨고 한동안 그대로 앉아 있었다. 서두르지 않아도 된다는 생각만으로 호흡이 한결 편해졌다.'],
 compose:['완성되지 않은 문장들은 삭제하지 않고 별표를 붙여 두었다. 실패한 가사도 언젠가 다른 곡의 시작이 될 수 있었다.','작업을 마친 뒤 데모를 다시 들으니 처음보다 결점이 더 많이 들렸다. 그래도 고칠 곳이 보인다는 건 앞으로 갈 수 있다는 뜻이었다.'],
 vocal:['연습이 끝난 뒤 따뜻한 물을 마시며 오늘 가장 안정적이었던 구간을 따로 표시했다. 작은 진전이라도 기록해 두기로 했다.','목이 지치기 전에 멈추는 것도 실력이라는 말을 떠올렸다. 류현상은 마지막 한 번을 참아 내고 마이크 전원을 껐다.'],
 work:['퇴근 도장을 찍고 나오자 다리가 묵직했다. 그는 오늘 번 돈이 다음 무대의 장비와 생활비로 나뉠 것을 머릿속으로 계산했다.','유니폼을 벗으며 무대 의상보다 편의점 조끼를 더 자주 입는 현실에 잠시 웃었다. 그래도 음악을 계속할 수 있게 해 주는 시간이었다.'],
 rehearse:['합주가 끝난 뒤 멤버들은 녹음 파일을 처음부터 다시 들었다. 서로의 실수를 놀리면서도 다음 연습 날짜는 누구보다 빨리 정했다.','연습실 불을 끄기 전 마지막 후렴을 한 번 더 맞췄다. 이번에는 네 사람의 호흡이 같은 곳에서 멈췄다.'],
 walk:['벤치에 잠시 앉아 지나가는 사람들을 바라봤다. 각자의 속도로 움직이는 모습을 보니 자신도 너무 서두를 필요는 없다고 느꼈다.','돌아오는 길에는 휴대전화 메모장에 짧은 문장을 남겼다. 오늘의 산책도 언젠가 노래 한 줄이 될 수 있었다.'],
 observe:['관찰을 끝낸 뒤 그대로 따라 하기보다 자신에게 맞는 방식으로 바꿔 메모했다. 배움과 모방의 경계를 잊지 않으려 했다.','라이벌의 장점만 보지 않고 자신이 더 잘할 수 있는 부분도 적었다. 비교가 자책으로 끝나지 않게 만드는 연습이었다.'],
 meal:['빈 그릇을 보며 오늘만큼은 끼니를 거르지 않았다는 사실에 만족했다. 목을 쓰는 사람에게 식사도 훈련의 일부였다.','계산을 마치고 나오자 몸에 온기가 돌았다. 다음 행동을 할 힘이 생긴 것만으로도 충분한 지출이었다.'],
 snack:['짧은 휴식과 작은 간식이 생각보다 집중력을 되돌려 줬다. 그는 포장지를 접어 쓰레기통에 정확히 던졌다.','배는 완전히 차지 않았지만 당장 쓰러질 것 같은 느낌은 사라졌다. 다시 움직이기에는 그 정도면 충분했다.'],
 bakcas:['빈 병을 내려놓고 심호흡을 했다. 회복된 체력을 어디에 쓸지 생각하자 하루가 조금 더 길어진 기분이었다.','쓴맛이 입안에 남았지만 눈앞은 선명해졌다. 류현상은 가방 지퍼를 닫고 다음 일정을 확인했다.'],
 busking:['공연이 끝난 뒤에도 몇몇 관객은 자리를 떠나지 않고 다음 일정과 자작곡 제목을 물었다. 류현상은 무심한 표정으로 하나씩 답했다.','장비를 정리하는 동안 멀리서 방금 부른 후렴을 흥얼거리는 소리가 들렸다. 오늘의 노래가 누군가에게 남았다는 증거였다.'],
 bandBusking:['멤버들은 공연이 끝난 뒤 서로의 손을 가볍게 맞부딪쳤다. 완벽하지 않았지만 함께 수습한 순간들이 밴드를 더 단단하게 만들었다.','관객이 빠져나간 뒤에도 R군은 마지막 박자를 두드렸고 B군은 벌써 다음 공연의 간주와 새 곡 코드 이야기를 꺼냈다. L군이 ‘형, 저 사람 퇴근이라는 걸 아예 모르죠?’라고 웃었다. 팀의 밤은 아직 끝나지 않았다.']
};
function pickActionDialogue(key){const arr=actionDialogue[key]||[];if(!arr.length)return '';const first=pickContextual(arr);const pool=arr.filter(x=>x!==first);const second=pool.length?pickContextual(pool):'';const follow=pickContextual(actionFollowups[key]||[]);return [first,second||follow].filter(Boolean).join('\n\n')}
function actionStory(key,base){const follow=pickContextual(actionFollowups[key]||[]);return follow?`${base}\n\n${follow}`:base}
function markWeddingStorySeen(kind){
 state.specialProgress=state.specialProgress||{};
 if(kind==='song')state.specialProgress.weddingSongSeen=true;
 if(kind==='invite')state.specialProgress.weddingInviteSeen=true;
}
const storyEvents=[
 {id:'lost-wallet',place:'park',condition:()=>['busking','bandBusking'].includes(state.lastAction)&&state.equipment.mic&&state.equipment.amp,title:'벤치 위의 지갑',text:'버스킹 준비를 하던 중 벤치 위에서 두꺼운 지갑을 발견했다.',choices:[['주인을 기다린다',()=>{stat('fame',8);stat('stress',-4);return '잠시 뒤 달려온 주인이 연신 고개를 숙였다. 그는 지역 공연기획자였다.'}],['경찰서에 맡긴다',()=>{stat('fame',3);return '연습 시간은 줄었지만 마음은 편했다.'}]]},
 {id:'rain-busking',place:'park',condition:()=>['busking','bandBusking'].includes(state.lastAction)&&state.weather==='rain'&&state.equipment.mic&&state.equipment.amp,title:'갑작스러운 소나기',text:'첫 곡이 끝나기도 전에 비가 쏟아졌다. 관객들은 하나둘 뛰어가기 시작했다.',choices:[['끝까지 노래한다',()=>{if(state.stats.hp<12){stat('stress',8);return '목이 잠기고 감기에 걸릴 뻔했다.'}stat('hp',-12);stat('fans',15);stat('fame',12);return '몇 명의 관객이 우산을 들고 끝까지 자리를 지켰다. 영상은 밤새 퍼졌다.'}],['장비부터 지킨다',()=>{stat('stress',-2);return '공연은 중단했지만 장비는 무사했다.'}]]},
 {id:'child-request',place:'park',condition:()=>['busking','bandBusking'].includes(state.lastAction)&&state.equipment.mic&&state.equipment.amp,title:'어린 관객의 신청곡',text:'어린아이가 동전 몇 개를 내밀며 세상을 떠난 강아지가 좋아하던 노래를 불러 달라고 했다.',choices:[['정성껏 불러준다',()=>{stat('fans',10);stat('stress',-5);return '아이와 보호자가 눈물을 훔겼다. 돈보다 오래 남는 공연이었다.'}],['자작곡을 들려준다',()=>{gainSkill('compose',2,'event');stat('fans',4);return '아이는 이해하지 못한 듯했지만 끝까지 자리를 지켰다.'}]]},
 {id:'viral-comment',place:'home',condition:()=>state.performanceCount>0&&state.stats.fans>=50,title:'댓글 1,247개',text:'잠에서 깨 보니 어젯밤 영상에 댓글이 폭발적으로 달려 있었다. 칭찬만큼 악성 댓글도 많았다.',choices:[['모두 읽는다',()=>{stat('fame',25);stat('stress',14);return '사람들의 반응을 알게 됐지만 마음은 무거워졌다.'}],['휴대전화를 끈다',()=>{stat('stress',-8);return '오늘은 음악만 생각하기로 했다.'}]]},
 {id:'neighbor',place:'home',condition:()=>state.lastAction==='compose'&&state.time>=2,title:'벽 너머의 항의',text:'밤늦게 작곡하다가 이웃이 문을 두드렸다. 생각보다 몹시 화가 나 있다.',choices:[['진심으로 사과한다',()=>{stat('money',-30000);stat('stress',-2);return '작은 선물을 건네고 연습 시간을 조정했다.'}],['방음재를 설치한다',()=>{if(state.stats.money<120000){stat('stress',8);return '돈이 부족해 임시로 이불을 벽에 붙였다.'}stat('money',-120000);gainSkill('compose',2,'event');return '집에서도 더 편하게 작업할 수 있게 됐다.'}]]},
 {id:'old-guitar',place:'home',title:'낡은 기타의 편지',text:'중고 기타 케이스 안쪽에서 이전 주인이 남긴 짧은 편지를 발견했다. “포기하지 말 것.”',choices:[['책상 앞에 붙인다',()=>{stat('stress',-12);gainSkill('compose',2,'event');return '짧은 문장이 이상할 만큼 오래 마음에 남았다.'}],['곡의 소재로 쓴다',()=>{gainSkill('compose',4,'event');return '새 노래의 첫 문장이 완성됐다.'}]]},
 {id:'store-fan',place:'store',condition:()=>state.lastAction==='work'&&state.stats.fans>=100,title:'알아본 손님',text:'편의점 손님이 계산을 마치고도 떠나지 않더니 조심스럽게 사인을 부탁했다.',choices:[['친절하게 해준다',()=>{stat('fans',5);stat('looks',1);return '손님은 소중히 간직하겠다며 환하게 웃었다.'}],['무뚝뚝하게 거절한다',()=>{stat('fans',-10);stat('stress',-2);return '짧은 거절 장면이 온라인에 올라가 일부 팬이 실망해 떠났다.'}]]},
 {id:'store-manager',place:'store',title:'새벽의 후라보노',text:'새벽 근무 중 후라보노가 따뜻한 캔커피를 들고 나타났다.',condition:()=>state.lastAction==='work'&&state.manager.hired&&state.time===3,choices:[['고맙다고 한다',()=>{state.manager.bond=clamp(state.manager.bond+8);return '후라보노는 형이 고맙다는 말을 할 줄도 아냐며 웃었다.'}],['왜 왔냐고 묻는다',()=>{state.manager.bond=clamp(state.manager.bond+3);return '일정 확인하러 왔다면서도 그는 한참 자리를 지켰다.'}]]},
 {id:'member-solo-offer',place:'practice',title:'솔로 제안',text:'기타리스트가 유명 세션팀에서 함께하자는 제안을 받았다고 털어놓았다.',condition:()=>state.band.formed,choices:[['진심으로 응원한다',()=>{state.band.bond=clamp(state.band.bond+12);return '멤버는 제안을 거절하고 밴드에 남겠다고 했다.'}],['팀을 먼저 생각하라고 한다',()=>{state.band.bond=clamp(state.band.bond-18);return '연습실 분위기가 싸늘해졌다.'}]]},
 {id:'late-member',place:'practice',title:'지각한 드러머',text:'드러머가 두 시간 늦게 도착했다. 아무 설명도 하지 않은 채 드럼 앞에 앉았다.',condition:()=>state.band.members.drums,choices:[['이유를 묻는다',()=>{state.band.bond=clamp(state.band.bond+5);return '가족 문제로 정신이 없었다는 사실을 알게 됐다.'}],['그냥 연습을 시작한다',()=>{state.band.bond=clamp(state.band.bond-6);return '합주는 끝났지만 서로의 마음은 멀어졌다.'}]]},
 {id:'broken-mic',place:'practice',condition:()=>false,title:'마이크 파손',text:'연습 도중 마이크가 바닥에 떨어졌다. 누가 건드렸는지는 아무도 보지 못했다.',choices:[['공동 비용으로 수리한다',()=>{stat('money',-50000);if(state.band.formed)state.band.bond=clamp(state.band.bond+5);return '누구의 잘못인지 따지지 않자 분위기가 누그러졌다.'}],['범인을 찾는다',()=>{stat('stress',8);if(state.band.formed)state.band.bond=clamp(state.band.bond-8);return '마이크보다 더 큰 균열이 생겼다.'}]]},
 {id:'rival',place:'stage',condition:()=>state.lastAction==='audition'&&state.stats.vocal>=40&&state.stats.fame>=30,title:'라이벌의 도발',text:'오디션 대기실에서 유명 연습생이 장발과 안경을 훑어보며 콘셉트가 과하다고 비웃었다.',choices:[['무시한다',()=>{gainSkill('vocal',2,'event');return '무대에서 증명하는 편이 더 빠르다.'}],['차분하게 받아친다',()=>{stat('looks',2);stat('fame',5);return '주변 참가자들이 웃음을 터뜨렸다.'}]]},
 {id:'lyric-forgot',place:'stage',title:'사라진 가사',text:'생방송 도중 갑자기 다음 가사가 떠오르지 않았다.',condition:()=>state.lastAction==='broadcast'&&state.milestones.firstBroadcast,choices:[['즉흥으로 이어간다',()=>{const ok=state.stats.compose+Math.random()*40>45;if(ok){stat('fame',35);stat('fans',40);return '즉흥 가사는 오히려 전설적인 장면이 됐다.'}stat('fans',-80);stat('fame',-8);stat('stress',12);return '방송 사고 장면이 확산되며 일부 팬이 실망했다.'}],['관객에게 마이크를 넘긴다',()=>{stat('fans',20);return '관객의 합창이 빈 가사를 채웠다.'}]]},
 {id:'fan-gift',place:'stage',title:'너무 비싼 선물',text:'팬이 고가의 시계를 선물로 보냈다. 편지에는 답장을 꼭 달라는 말이 적혀 있다.',condition:()=>['concert','fanmeeting'].includes(state.lastAction)&&state.stats.fans>=1000,choices:[['정중히 돌려보낸다',()=>{stat('fame',12);stat('fans',3);return '원칙 있는 대응이라는 평가를 받았다.'}],['감사히 받는다',()=>{stat('money',300000);stat('fans',-40);stat('fame',-5);stat('stress',8);return '선물을 받은 사실이 알려져 특혜 논란이 생기고 일부 팬이 떠났다.'}]]},
 {id:'hurabono-sick',place:'stage',title:'후라보노의 과로',text:'공연 직전 후라보노가 계단에서 휘청거렸다. 며칠째 제대로 잠을 자지 못한 얼굴이다.',condition:()=>state.lastAction==='concert'&&state.manager.hired&&state.milestones.firstConcert,choices:[['공연을 미루고 병원에 간다',()=>{state.manager.bond=clamp(state.manager.bond+18);stat('money',-150000);return '공연은 손해를 봤지만 후라보노는 오래도록 그 선택을 기억했다.'}],['스태프에게 맡긴다',()=>{state.manager.bond=clamp(state.manager.bond-12);stat('fame',10);return '공연은 예정대로 진행됐지만 후라보노와의 거리가 멀어졌다.'}]]},
 {id:'fan-letter',place:'home',title:'한 통의 긴 편지',text:'노래 덕분에 힘든 시기를 버텼다는 팬의 편지가 도착했다.',condition:()=>state.stats.fans>=300,choices:[['직접 답장을 쓴다',()=>{stat('fans',8);stat('stress',-10);return '답장을 쓰며 내가 노래하는 이유를 다시 생각했다.'}],['새 노래로 답한다',()=>{gainSkill('compose',3,'event');return '편지를 책상 위에 두고 곡을 쓰기 시작했다.'}]]},
 {id:'band-dinner',place:'store',title:'편의점 회식',text:'돈이 부족한 밴드는 편의점 테이블에 둘러앉아 컵라면으로 첫 회식을 열었다.',condition:()=>state.band.formed,choices:[['내가 계산한다',()=>{stat('money',-25000);state.band.bond=clamp(state.band.bond+14);return '값싼 식사였지만 누구도 먼저 자리를 뜨지 않았다.'}],['각자 계산한다',()=>{state.band.bond=clamp(state.band.bond+4);return '소박하지만 편안한 밤이었다.'}]]},
 {id:'wedding-song',place:'practice',title:'후라보노의 축가 부탁',text:'후라보노가 결혼식 축가로 어떤 노래가 좋을지 조심스럽게 물었다. 평소 계약 이야기만 하던 얼굴이 오늘따라 유난히 어색해 보였다.',condition:()=>state.manager.wedding,choices:[['새 곡을 써준다',()=>{markWeddingStorySeen('song');gainSkill('compose',5,'event');state.manager.bond=clamp(state.manager.bond+15);return '류현상은 며칠 동안 잠을 줄여 축가를 완성했다. 후라보노는 첫 소절을 듣고 웃으려다 눈시울을 붉혔다. “형, 결혼식에서 저 울면 책임지세요.”'}],['대표곡을 부른다',()=>{markWeddingStorySeen('song');state.manager.bond=clamp(state.manager.bond+8);return '후라보노는 고개를 끄덕였다. “형 노래면 뭐든 좋아요. 단, 결혼식에서 애드리브 5분은 안 됩니다.”'}]]},
 {id:'p-string',place:'practice',title:'B군의 퇴근 없는 기타 점검',text:'합주가 끝났는데도 B군은 기타를 내려놓지 않고 코드와 톤을 다시 확인하고 있었다. 류현상이 이제 그만 가자고 하자 B군은 “현상아, 이거 한 번만 더 보면 된다. 진짜다.”라고 말했다. 이미 세 번째 ‘한 번만 더’였다.',condition:()=>!!state.band.members.guitar,choices:[['옆에 앉아 같이 확인한다',()=>{state.band.bond=clamp(state.band.bond+7);return 'B군은 투덜거리면서도 류현상 목에 좋다며 따뜻한 물부터 건넸다. 둘은 코드 두 군데를 고치고 나서야 연습실을 나왔다.'}],['강제로 불을 끈다',()=>{state.band.bond=clamp(state.band.bond-2);return 'B군은 “마, 사람 일하는데 불을 끄나”라고 했지만 결국 기타를 챙겼다. 나가는 길에도 휴대전화로 데모를 듣고 있었다.'}]]},
 {id:'l-one-word',place:'practice',title:'L군의 친동생 폭로전',text:'쉬는 시간에 L군이 류현상의 친동생과 학창 시절 얘기를 꺼냈다. “형, 동생한테 들은 얘기 하나 있는데 말해도 돼요?” 웃는 얼굴이 너무 수상했다.',condition:()=>!!state.band.members.bass,choices:[['들어 본다',()=>{state.band.bond=clamp(state.band.bond+6);return 'L군은 류현상의 흑역사를 하나 풀어놓고는 “그래도 지금이 훨씬 멋있어요. 진짜로요.”라고 부드럽게 수습했다. 멤버들은 한참 웃었다.'}],['입막음한다',()=>{state.band.bond=clamp(state.band.bond+1);return '류현상이 급하게 막자 L군은 “알겠어요. 이건 다음 회식 때 풀게요.”라며 웃었다. 전혀 안심되는 말은 아니었다.'}]]},
 {id:'j-space-remix',place:'practice',title:'J군과 해산물 회식',text:'합주가 끝난 뒤 회식 메뉴로 해산물 모둠이 거론되자 J군의 얼굴이 굳었다. 평소보다도 더 조용해진 그는 한참 뒤 “형… 그거 움직이는 거 있습니까?”라고 물었다.',condition:()=>!!state.band.members.piano,choices:[['고기집으로 바꾼다',()=>{state.band.bond=clamp(state.band.bond+5);return 'J군은 짧게 “감사합니다.”라고 말했다. 술이 몇 잔 들어가자 그 조용하던 사람이 갑자기 R군의 드럼 솔로를 몸으로 흉내 내기 시작했다. 모두가 처음 보는 광경이었다.'}],['해산물집으로 간다',()=>{state.band.bond=clamp(state.band.bond-3);return 'J군은 테이블 가장 먼 곳에 앉아 접시를 경계했다. “저거… 눈 마주친 것 같은데예.” 아주 약한 부산 억양이 평소보다 진하게 튀어나왔다.'}]]},
 {id:'r-noise',place:'practice',title:'R군과 소음 측정기',text:'연습실 관리자가 소음 측정기를 들고 찾아왔다. R군이 연주할 때마다 기계 숫자가 위험 구간까지 치솟았다. R군은 기계가 예민하다고 주장했다.',condition:()=>!!state.band.members.drums,choices:[['전자드럼을 빌린다',()=>{stat('money',-60000);state.band.bond=clamp(state.band.bond+4);return 'R군은 타격감이 부족하다며 투덜댔지만, 이웃 연습실에서 처음으로 박수가 들렸다. 아마 감사의 박수였을 것이다.'}],['R군에게 살살 치라고 한다',()=>{state.band.bond=clamp(state.band.bond-3);return 'R군은 정말 살살 쳤다. 문제는 곡 전체가 자장가처럼 변했다는 것이었다.'}]]},
 {id:'manager-hair',place:'home',title:'후라보노의 머리 관리 제안',text:'후라보노가 긴 머리를 한참 보더니 작은 빗과 헤어 오일을 내밀었다. “형, 콘셉트는 좋은데 바람 불면 얼굴이 안 보여요. 가수인지 커튼인지 구분이 안 됩니다.”',condition:()=>state.manager.hired,choices:[['관리를 맡긴다',()=>{stat('looks',3);state.manager.bond=clamp(state.manager.bond+5);return '후라보노는 능숙하게 머리를 정리했다. 류현상이 어디서 배웠냐고 묻자 그는 관리 영상 백 개를 봤다고 짧게 답했다.'}],['내버려 두라고 한다',()=>{state.manager.bond=clamp(state.manager.bond-2);return '후라보노는 오일을 책상 위에 두고 갔다. 다음 버스킹에서 바람이 불자 류현상은 조용히 그 오일을 떠올렸다.'}]]},
 {id:'wrong-delivery',place:'home',title:'잘못 배달된 마이크',text:'문 앞에 주문하지 않은 고급 마이크가 놓여 있었다. 송장에는 옆 동 이름과 비슷한 이름이 적혀 있었다. 지금 장비보다 몇 배는 비싸 보였다.',choices:[['바로 돌려준다',()=>{stat('fame',5);stat('stress',-3);return '주인은 근처 녹음실 엔지니어였다. 그는 고마움의 표시로 다음 녹음 때 한 번 도와주겠다고 약속했다.'}],['하루만 테스트한다',()=>{gainSkill('vocal',2,'event');stat('stress',7);return '소리는 놀라울 만큼 좋았다. 그러나 초인종이 울릴 때마다 심장이 더 크게 뛰었다. 결국 밤이 되기 전에 돌려줬다.'}]]},
 {id:'store-lottery',place:'store',title:'당첨 복권의 주인',text:'손님이 버리고 간 영수증 사이에서 당첨된 즉석복권이 발견됐다. 금액은 크지 않았지만 현재 생활비에는 충분히 의미가 있었다.',choices:[['CCTV로 손님을 찾는다',()=>{stat('fame',7);return '며칠 뒤 주인이 다시 찾아왔다. 그는 감사하다며 버스킹 공연을 회사 단체 채팅방에 공유했다.'}],['매장 분실물로 보관한다',()=>{stat('stress',-2);return '복권은 분실물 봉투 안에 들어갔다. 류현상은 계산대 아래에서 복권보다 자신의 통장 잔고를 더 오래 바라봤다.'}]]},
 {id:'store-idol-fan',place:'store',title:'다른 가수의 열성 팬',text:'한 손님이 계산대 앞에서 유명 아이돌의 장점을 15분 동안 설명했다. 마지막에는 류현상에게도 그 가수처럼 머리를 자르면 어떻겠냐고 조언했다.',choices:[['끝까지 친절하게 듣는다',()=>{stat('stress',4);stat('fans',2);return '손님은 친절한 직원이라며 매장 후기에 별 다섯 개를 남겼다. 류현상 이야기는 한 줄도 없었다.'}],['나는 가수라고 말한다',()=>{stat('fame',5);return '손님은 놀라 휴대전화로 검색했다. 조회수 23회의 영상이 화면에 떴고, 두 사람은 잠시 말이 없어졌다.'}]]},
 {id:'park-magician',place:'park',condition:()=>['busking','bandBusking'].includes(state.lastAction)&&state.equipment.mic&&state.equipment.amp,title:'마술사와 자리 경쟁',text:'늘 공연하던 자리에 거리 마술사가 먼저 장비를 펼쳐 놓았다. 그는 비둘기 두 마리와 큰 상자를 데려왔다. 류현상의 앰프보다 훨씬 눈에 띄었다.',choices:[['합동 공연을 제안한다',()=>{stat('fans',12);stat('fame',8);return '류현상이 노래하는 동안 마술사는 카드와 비둘기를 날렸다. 무슨 공연인지는 설명하기 어려웠지만 관객은 많이 모였다.'}],['다른 자리로 이동한다',()=>{stat('stress',-2);return '조용한 나무 아래에서 노래했다. 관객은 적었지만 마지막까지 듣는 사람은 더 오래 머물렀다.'}]]},
 {id:'park-grandma',place:'park',condition:()=>['busking','bandBusking'].includes(state.lastAction)&&state.equipment.mic&&state.equipment.amp,title:'할머니의 평가',text:'노래가 끝나자 산책하던 할머니가 다가왔다. “얼굴은 잘생겼는데 노래가 너무 슬퍼. 젊은 사람이 왜 맨날 헤어져?” 매우 정확한 질문이었다.',choices:[['밝은 노래를 즉석에서 부른다',()=>{gainSkill('compose',2,'event');stat('fans',5);return '류현상은 급하게 밝은 코드를 만들었다. 가사는 여전히 조금 슬펐지만 할머니는 박수를 쳤다.'}],['원래 감성이라고 설명한다',()=>{stat('looks',1);return '할머니는 고개를 저으며 귤 두 개를 건넸다. “그래도 밥은 먹고 다녀.” 오늘의 출연료였다.'}]]},
 {id:'stage-makeup',place:'stage',condition:()=>['audition','concert','broadcast'].includes(state.lastAction)&&state.manager.hired&&state.stats.fame>=150,title:'처음 받는 무대 화장',text:'메이크업 아티스트가 류현상의 얼굴을 가까이 들여다보며 말했다. “피부는 좋은데 표정이 너무 어두워요.” 후라보노가 옆에서 “원래 저 표정입니다”라고 설명했다.',choices:[['웃는 연습을 한다',()=>{stat('looks',2);return '거울 앞에서 여러 번 웃어 봤지만 대부분 수상해 보였다. 마지막에 아주 조금 올라간 입꼬리만 남기기로 했다.'}],['평소 표정대로 간다',()=>{stat('fame',5);return '방송 후 팬들은 무표정이 콘셉트라며 좋아했다. 류현상은 콘셉트가 아니라는 말을 굳이 하지 않았다.'}]]},
 {id:'stage-name',place:'stage',condition:()=>['audition','concert','broadcast'].includes(state.lastAction)&&state.manager.hired&&state.stats.fame>=200,title:'예명 제안',text:'방송 작가가 류현상이라는 이름이 조금 무겁다며 짧은 예명을 제안했다. 후보는 “류”, “현”, 그리고 “블랙롱”이었다. 마지막 후보를 누가 적었는지는 모두 모른 척했다.',choices:[['본명을 지킨다',()=>{stat('fame',8);return '류현상은 이름을 바꾸지 않겠다고 말했다. 후라보노는 고개를 끄덕이며 블랙롱이라고 적힌 종이를 조용히 찢었다.'}],['류로 활동해 본다',()=>{stat('looks',2);stat('fame',4);return '하루 동안 류라고 불렸지만 스태프 절반이 누굴 부르는지 몰랐다. 다음 날 다시 류현상으로 돌아왔다.'}]]},
 {id:'band-group-photo',place:'stage',title:'밴드 단체 사진',text:'공연 후 단체 사진을 찍으려는데 누구도 같은 포즈를 하지 않았다. B군은 팔짱을 낀 채 ‘마, 빨리 찍자’고 했고, 훤칠한 L군은 장난스럽게 모델 포즈를 잡았다. J군은 거의 미동도 없었고, R군은 점프하려 했다.',condition:()=>state.lastAction==='concert'&&state.band.formed&&state.milestones.firstConcert,choices:[['각자 하고 싶은 대로 찍는다',()=>{state.band.bond=clamp(state.band.bond+8);stat('fans',10);return '사진은 통일감이 전혀 없었지만 이상하게 밴드의 성격이 그대로 담겼다. 팬들은 역대 최고의 단체 사진이라고 불렀다.'}],['정돈된 포즈를 시킨다',()=>{stat('looks',2);return '깔끔한 사진이 완성됐다. 다만 촬영이 끝나자 R군이 혼자 점프한 사진을 따로 올렸고 그 사진이 더 많이 공유됐다.'}]]},
 {id:'manager-first-pay',place:'home',title:'첫 정산표',text:'후라보노가 두꺼운 파일을 책상 위에 내려놓았다. 공연 수익보다 교통비와 장비비가 더 길게 적혀 있었다. “형, 매출과 수익은 다른 말입니다. 오늘부터는 제가 둘을 구분해서 보여드릴게요.”',condition:()=>state.manager.hired&&state.manager.bond<40,choices:[['차근차근 설명을 듣는다',()=>{state.manager.bond=clamp(state.manager.bond+8);stat('stress',-3);return '류현상은 숫자를 피하지 않고 끝까지 들었다. 후라보노는 마지막 장을 덮으며 말했다. “좋아요. 망하지 않는 가수의 첫 수업이었습니다.”'}],['음악만 알면 된다고 한다',()=>{state.manager.bond=clamp(state.manager.bond-5);return '후라보노는 한동안 말이 없었다. 그러다 정산표 첫 장에 굵은 글씨로 적었다. “그래서 지난번에 망함.” 류현상은 반박하지 못했다.'}]]},
 {id:'manager-midnight-call',place:'home',title:'새벽 두 시의 전화',text:'새벽 두 시, 후라보노에게 전화가 왔다. 급한 공연 연락인 줄 알았지만 그는 한참 침묵하다가 말했다. “형, 오늘 무대 좋았어요. 그 말 안 하면 잠이 안 올 것 같아서요.”',condition:()=>state.manager.hired&&state.manager.bond>=35&&state.time===3,choices:[['고맙다고 솔직히 말한다',()=>{state.manager.bond=clamp(state.manager.bond+10);stat('stress',-6);return '전화기 너머가 잠시 조용해졌다. 후라보노는 헛기침한 뒤 “이런 말 자주 하시면 제가 적응 못 합니다”라고 말했다.'}],['내일 말해도 됐다고 한다',()=>{state.manager.bond=clamp(state.manager.bond+2);return '후라보노는 역시 형답다며 전화를 끊었다. 다음 날 일정표 맨 아래에는 작은 글씨로 “칭찬 유효기간: 당일”이라고 적혀 있었다.'}]]},
 {id:'manager-old-office',place:'practice',title:'사라진 기획사 앞에서',text:'연습실로 가던 길, 두 사람은 우연히 류현상이 예전에 운영하던 기획사 건물 앞을 지나게 됐다. 한때 여자 아이돌 연습생들이 드나들던 곳은 이제 전혀 다른 회사의 사무실이 되어 있었다.',condition:()=>state.manager.hired&&state.manager.bond>=55,choices:[['그때 이야기를 들려준다',()=>{state.manager.bond=clamp(state.manager.bond+12);stat('stress',-8);return '류현상은 잠깐 아이돌 활동으로 모은 돈으로 회사를 차렸던 일, 여자 연습생들을 데뷔시키고 싶었던 일, 그리고 폐업 뒤 모두가 흩어졌던 날을 처음으로 꺼냈다. 후라보노는 조언하지 않고 끝까지 들었다. “이번에는 형 혼자 문 닫게 두지 않을게요.”'}],['그냥 지나간다',()=>{state.manager.bond=clamp(state.manager.bond+3);return '후라보노는 아무것도 묻지 않고 보폭을 맞췄다. 건물이 보이지 않을 때쯤 그는 일부러 다음 공연의 우스운 실수담을 꺼냈다.'}]]},
 {id:'manager-day-off',place:'park',title:'강제 휴무일',text:'후라보노가 버스킹 장비 가방을 빼앗아 벤치 아래에 내려놓았다. “오늘은 공연 금지입니다. 형은 쉬는 법을 잊었고, 저는 그걸 다시 가르칠 책임이 있어요.”',condition:()=>['busking','bandBusking'].includes(state.lastAction)&&state.manager.hired&&state.stats.stress>=65,choices:[['한 시간만 쉰다',()=>{state.manager.bond=clamp(state.manager.bond+8);stat('stress',-20);stat('hp',15);return '두 사람은 말없이 편의점 음료를 마셨다. 류현상이 슬쩍 장비 가방을 보자 후라보노가 발로 가방을 더 멀리 밀었다.'}],['몰래 한 곡만 부른다',()=>{state.manager.bond=clamp(state.manager.bond-7);stat('stress',-4);stat('hp',-8);return '첫 소절이 끝나기도 전에 후라보노가 전원을 껐다. “형, 매니저를 고용했으면 가끔은 매니저 말을 들으세요.” 관객 두 명이 웃으며 박수를 쳤다.'}]]},
 {id:'fan-sign-mistake',place:'stage',title:'팬 사인회 이름 실수',text:'팬의 이름을 여러 번 잘못 부른 장면이 짧은 영상으로 퍼졌다.',condition:()=>['fanmeeting','concert'].includes(state.lastAction)&&state.stats.fans>=1500,choices:[['즉시 공개 사과한다',()=>{stat('fans',-scaledFanLoss(.012,15,60));stat('stress',5);return '빠르게 사과해 논란은 줄었지만 일부 팬은 서운함을 감추지 못했다.'}],['별일 아니라고 넘긴다',()=>{stat('fans',-scaledFanLoss(.05,60,240));stat('fame',-10);stat('stress',8);return '무성의한 대응이라는 평가가 퍼지며 팬덤이 눈에 띄게 줄었다.'}]]},
 {id:'setlist-repeat',place:'stage',title:'반복되는 공연 세트리스트',text:'최근 공연의 곡 순서가 거의 똑같다는 불만이 팬 커뮤니티에 쌓였다.',condition:()=>state.lastAction==='concert'&&state.career.totalConcerts>=3&&state.stats.fans>=1000,choices:[['다음 공연을 새로 준비한다',()=>{gainSkill('compose',1,'event');stat('fans',-scaledFanLoss(.01,10,50));return '불만을 인정하고 새 무대를 약속해 이탈을 최소화했다.'}],['대표곡이면 충분하다고 한다',()=>{stat('fans',-scaledFanLoss(.04,40,180));stat('fame',-6);return '변화를 원하던 팬들이 조용히 떠났다.'}]]},
 {id:'manager-wedding-invite',place:'home',title:'후라보노의 청첩장',text:'후라보노가 청첩장을 건넸다. 류현상이 한참 말없이 읽자 후라보노가 불안한 얼굴로 물었다. “형, 날짜에 공연 잡혀 있어요?”',condition:()=>state.manager.wedding,choices:[['무조건 참석한다고 한다',()=>{markWeddingStorySeen('invite');state.manager.bond=clamp(state.manager.bond+12);return '후라보노는 안도하며 웃었다. “형이 늦으면 신랑 대기실에서 직접 전화할 겁니다.”'}],['스케줄부터 확인한다',()=>{markWeddingStorySeen('invite');state.manager.bond=clamp(state.manager.bond-4);return '후라보노는 이해한다고 했지만 청첩장 모서리를 괜히 여러 번 만졌다. 류현상은 결국 그날 밤 일정을 비웠다.'}]]}
];

const prologueScenes=[
 {chapter:'PROLOGUE 01',title:'잠깐의 아이돌 시절',speaker:'내레이션',text:`류현상은 20대 초반, 아주 짧은 시간 아이돌로 활동한 적이 있었다. 오래 버틴 팀도, 크게 알려진 이름도 아니었지만 무대 위에서 조명을 받던 감각만큼은 분명히 기억하고 있었다.

화려한 성공과는 거리가 멀었지만, 그 시절 벌어 둔 돈은 류현상에게 다른 꿈을 꾸게 했다. 그는 무대 위에 서는 일만큼이나, 누군가의 데뷔와 콘셉트, 무대와 팀을 설계하는 ‘기획’의 일에 강하게 끌리고 있었다.`},
 {chapter:'PROLOGUE 02',title:'스물여섯, 기획사를 차리다',speaker:'류현상',text:`“내가 하고 싶은 건 기획이다.”

류현상은 아이돌 활동으로 모은 돈을 바탕으로 스물여섯 살에 작은 기획사를 차렸다. 사무실이라고 부르기에는 민망한 공간이었지만, 그의 머릿속에는 선명한 그림이 있었다. 좋은 음악을 만들고, 무대를 준비하고, 제대로 된 팀을 키워 내는 회사.

대표이자 실무자이자 청소 담당자였지만 이상하게 힘들지 않았다. 이제야 진짜 하고 싶은 일을 시작했다는 기분이 더 컸기 때문이다.`},
 {chapter:'PROLOGUE 03',title:'연습생들이 있던 회사',speaker:'내레이션',text:`그 기획사에는 여자 아이돌 연습생들이 있었다. 아직 데뷔 전이었지만 각자 목소리와 성격, 장점이 뚜렷한 아이들이었다. 류현상은 직접 콘셉트 기획안을 쓰고, 데뷔 로드맵을 짜고, 쇼케이스 날짜를 상상하며 밤을 새웠다.

누군가는 무모하다고 했지만, 그 시기의 류현상은 정말로 회사가 굴러갈 수 있다고 믿었다. 부족한 돈과 인맥쯤은 버티면 메울 수 있을 거라고 생각했다.`},
 {chapter:'PROLOGUE 04',title:'코로나, 그리고 정지된 계획',speaker:'내레이션',text:`하지만 코로나는 모든 계획을 너무 쉽게 멈춰 세웠다. 공연은 취소됐고, 잡아 두었던 무대와 미팅은 줄줄이 사라졌다. 데뷔 준비는 종이 위 일정표로만 남았고, 수익 없이 월세와 비용만 빠져나갔다.

류현상은 처음에는 잠깐의 위기라고 생각했다. 조금만 버티면 다시 움직일 수 있을 거라고 믿었다. 그러나 현실은 그보다 훨씬 길고 차가웠다.`},
 {chapter:'PROLOGUE 05',title:'폐업과 흩어진 사람들',speaker:'류현상',text:`“미안하다.”

결국 류현상은 회사를 접어야 했다. 여자 연습생들은 각자의 길로 흩어졌고, 어떤 아이는 다른 회사를 알아보러 갔고, 어떤 아이는 꿈을 접겠다고 말했다. 누구를 붙잡을 자격도, 끝까지 책임질 능력도 남아 있지 않았다.

회사 문을 닫던 날, 류현상은 간판보다 사람들의 뒷모습을 더 오래 봤다. 그 순간은 실패라기보다, 자신이 지키지 못한 약속처럼 남았다.`},
 {chapter:'PROLOGUE 06',title:'군대로의 도피',speaker:'내레이션',text:`류현상은 군대로 향했다. 새 출발이라기보다는 도피에 가까웠다. 정해진 시간에 일어나고, 정해진 옷을 입고, 정해진 일을 하면 되는 곳. 그곳에서는 적어도 회사가 왜 망했는지, 왜 끝까지 버티지 못했는지 설명하지 않아도 됐다.

전역만 하면 뭔가 달라질까 생각했지만, 사실 달라지는 건 없었다. 실패를 잠시 미뤄 둘 수 있을 뿐이었다.`},
 {chapter:'PROLOGUE 07',title:'전역 후 남은 질문',speaker:'류현상',text:`전역한 뒤에도 현실은 크게 바뀌지 않았다. 기다리는 기획사도, 복귀를 반기는 팬도 없었다. 안정적인 일을 찾으라는 말은 맞는 말이었지만, 류현상은 이상하게 그 길로는 완전히 걸어 들어갈 수 없었다.

오히려 그때 처음으로 생각했다. ‘내가 진짜 하고 싶은 기획 일을 다시 하려면, 먼저 가수로 성공해야 하는 거 아닐까.’ 사람과 무대를 설계하는 일을 하려면, 우선 자신이 무대 위에서 인정받아야 한다는 생각이었다.`},
 {chapter:'PROLOGUE 08',title:'가수로 다시 시작한다',speaker:'내레이션',text:`회사를 다시 차릴 돈은 없었다. 하지만 노래를 다시 시작할 방법이 완전히 없는 건 아니었다. 마이크 하나, 앰프 하나, 그리고 길 위의 작은 자리만 있으면 누군가 앞에서 노래할 수는 있었다.

류현상은 기획자로 돌아가는 가장 빠른 길이, 아이러니하게도 가수로 다시 처음부터 올라가는 길일 수 있다고 받아들였다.`},
 {chapter:'PROLOGUE 09',title:'다시 처음부터',speaker:'류현상',text:`검은 셔츠를 꺼내 입고, 안경을 닦고, 긴 머리를 정리한 뒤 거울 앞에 섰다. 예전보다 지쳐 보였지만 완전히 무너진 얼굴은 아니었다.

“기획을 하려면, 먼저 가수로 성공해야 한다.”
“다시 처음부터 시작해보자.”

이번에는 회사 대표도 아니고, 누군가의 뒤에 숨은 기획자도 아니다. 류현상 자신의 이름으로, 무명가수로 다시 출발한다.`},
 {chapter:'PROLOGUE 10',title:'류현상 키우기',speaker:'내레이션',text:`20대 초 잠깐의 아이돌 활동, 스물여섯에 차린 기획사, 코로나로 인한 폐업, 흩어진 연습생들, 그리고 군대로의 도피. 류현상은 많은 것을 잃은 채 출발선으로 돌아왔다.

하지만 아직 끝난 건 아니다. 그가 정말 원하는 것은 단순한 유명세가 아니라, 언젠가 다시 무대와 사람을 제대로 기획할 수 있는 힘을 갖는 것이다.

그 힘을 얻기 위해, 류현상은 지금 가수로서 다시 시작한다.

이제 게임이 시작된다.`}
];
let prologueIndex=0;
function renderPrologue(){
 const scene=prologueScenes[prologueIndex];
 const modal=$('#modal');
 modal.classList.add('prologue-modal');
 $('#modalTitle').textContent=scene.chapter;
 $('#modalBody').innerHTML=`<article class="prologue-card"><p class="prologue-kicker">${scene.title}</p><h3>${scene.speaker}</h3><div class="prologue-text">${scene.text.split('\n').map(line=>line?`<p>${line}</p>`:'<div class="prologue-gap"></div>').join('')}</div><div class="prologue-progress"><span style="width:${((prologueIndex+1)/prologueScenes.length)*100}%"></span></div><div class="prologue-actions"><button id="prologueBack" ${prologueIndex===0?'disabled':''}>이전</button><button id="prologueSkip">프롤로그 건너뛰기</button><button id="prologueNext" class="primary">${prologueIndex===prologueScenes.length-1?'버스킹을 시작한다':'다음'}</button></div></article>`;
 if(!modal.open)modal.showModal();
 $('#prologueBack').onclick=()=>{if(prologueIndex>0){prologueIndex--;renderPrologue()}};
 $('#prologueSkip').onclick=beginGameAfterPrologue;
 $('#prologueNext').onclick=()=>{if(prologueIndex<prologueScenes.length-1){prologueIndex++;renderPrologue()}else beginGameAfterPrologue()};
}
function startPrologue(){setAudioScreenMode('title');prologueIndex=0;renderPrologue()}
function beginGameAfterPrologue(){
 const modal=$('#modal');
 modal.classList.remove('prologue-modal');
 if(modal.open)modal.close();
 state.prologueSeen=true;
 state.dialogue={name:'류현상',text:'기획을 다시 하려면, 먼저 가수로 성공해야 한다. 다시 처음부터 시작해보자.'};
 addHistory('🎬 프롤로그 · 아이돌 활동과 기획사 폐업, 군 복무를 지나 가수로 다시 처음부터 시작하기로 했다.','prologue');
 save(false);
 $('#titleScreen').classList.remove('active');
 $('#gameScreen').classList.add('active');
 setAudioScreenMode('game',true);
 render();
}

function deepMerge(base,saved){if(Array.isArray(base))return Array.isArray(saved)?saved:structuredClone(base);if(base&&typeof base==='object'){const out=structuredClone(base);if(saved&&typeof saved==='object')for(const k of Object.keys(saved))out[k]=k in base?deepMerge(base[k],saved[k]):saved[k];return out}return saved===undefined?base:saved}
function getStorage(){try{const key='__ryu_test__';localStorage.setItem(key,'1');localStorage.removeItem(key);return localStorage}catch(err){console.warn('브라우저 저장소를 사용할 수 없습니다.',err);return null}}
function migrateEndingName(name){
 const map={
  '가수 엔딩':'월드스타 엔딩','월드 스타 엔딩':'월드스타 엔딩','월드 밴드 스타 엔딩':'월드스타 엔딩','월드 싱어송라이터 엔딩':'월드스타 엔딩','월드 솔로 보컬리스트 엔딩':'월드스타 엔딩',
  '무명 가수 엔딩':'무명가수 엔딩','인디 가수 엔딩':'무명가수 엔딩','스타 가수 엔딩':'유명 솔로가수 엔딩','라이브 보컬리스트 엔딩':'유명 솔로가수 엔딩',
  '싱어송라이터 엔딩':'작곡가 엔딩','밴드 리더 엔딩':'밴드가수 엔딩','편의점 점장 엔딩':'편의점 사장 엔딩','재기 엔딩':'파산 엔딩','스토커 살해 엔딩':'활동 중지 엔딩'
 };
 return map[name]||name
}
function loadMetaEndings(){const storage=getStorage();if(!storage)return [];try{const raw=JSON.parse(storage.getItem('ryuGameMeta')||'{}');return Array.isArray(raw.endings)?[...new Set(raw.endings.map(migrateEndingName))]:[]}catch{return []}}
function saveMetaEndings(endings){const storage=getStorage();if(!storage)return;try{storage.setItem('ryuGameMeta',JSON.stringify({endings:[...new Set(endings.map(migrateEndingName))]}))}catch(err){console.warn('엔딩 컬렉션 저장 실패',err)}}
function syncEndingCollection(){state.endings=[...new Set([...(state.endings||[]),...loadMetaEndings()])];saveMetaEndings(state.endings)}
function normalizeState(){
 state.day=Math.max(1,Math.floor(Number(state.day)||1));
 state.time=Math.max(0,Math.min(3,Math.floor(Number(state.time)||0)));
 state.slot=Math.max(0,Math.floor(Number(state.slot)||0));
 state.location=locations[state.location]?state.location:'home';
 state.stats=state.stats&&typeof state.stats==='object'?state.stats:structuredClone(baseState.stats);
 delete state.stats.stamina;
 state.stats.hp=clamp(Number(state.stats.hp)||0);
 state.stats.vocal=clamp(Number(state.stats.vocal)||0);
 state.stats.compose=clamp(Number(state.stats.compose)||0);
 const savedActing=Number(state.stats.acting);const legacyActing=Math.min(100,Math.max(0,(Number(state.career?.actingCount)||0)+(Number(state.career?.actingHits)||0)*2));
 state.stats.acting=clamp(Number.isFinite(savedActing)?savedActing:legacyActing);
 state.stats.looks=clamp(Number(state.stats.looks)||0);
 state.stats.stress=clamp(Number(state.stats.stress)||0);
 state.stats.fans=Math.max(0,Math.floor(Number(state.stats.fans)||0));
 state.stats.money=Math.max(0,Math.floor(Number(state.stats.money)||0));
 state.stats.fame=Math.max(0,Math.min(10000,Number(state.stats.fame)||0));
 state.housing=Math.max(0,Math.min(4,Number(state.housing)||0));
 state.weather=['sun','rain','snow'].includes(state.weather)?state.weather:'sun';
 state.equipment={mic:!!state.equipment?.mic,amp:!!state.equipment?.amp,battery:!!state.equipment?.battery};
 const em=state.equipmentModel||{};
 state.equipmentModel={mic:state.equipment.mic&&['usedMic','wiredMic','wirelessMic','customMic'].includes(em.mic)?em.mic:(state.equipment.mic?'usedMic':null),amp:state.equipment.amp&&['entryAmp','smallSound','largeSound'].includes(em.amp)?em.amp:(state.equipment.amp?'entryAmp':null)};
 state.equipmentDamage={mic:false,amp:false};
 const ed=state.equipmentDurability||{};const micMax=state.equipmentModel.mic?equipmentCatalog.mic[state.equipmentModel.mic].durability:0;const ampMax=state.equipmentModel.amp?equipmentCatalog.amp[state.equipmentModel.amp].durability:0;
 state.equipmentDurability={mic:state.equipment.mic?Math.max(1,Math.min(micMax,Number.isFinite(Number(ed.mic))?Number(ed.mic):micMax)):0,amp:state.equipment.amp?Math.max(1,Math.min(ampMax,Number.isFinite(Number(ed.amp))?Number(ed.amp):ampMax)):0,battery:state.equipment.battery?Math.max(1,Math.min(50,Number.isFinite(Number(ed.battery))?Number(ed.battery):50)):0};
 const fr=state.forcedRest||{};state.forcedRest={count:Math.max(0,Number(fr.count)||0),lastTriggeredDay:Number(fr.lastTriggeredDay??-99)};state.restStreak=Math.max(0,Math.floor(Number(state.restStreak)||0));const rn=state.restNightmares||{};state.restNightmares={totalRests:Math.max(0,Math.floor(Number(rn.totalRests)||0)),lastTriggeredRest:Math.max(0,Math.floor(Number(rn.lastTriggeredRest)||0)),seen:(Array.isArray(rn.seen)?rn.seen:[]).filter(x=>['military','stalker','sleep-paralysis'].includes(x)).slice(-3)};const dp=state.dailyPractice||{};const vocalDay=Math.max(0,Math.floor(Number(dp.vocalDay)||0)),composeDay=Math.max(0,Math.floor(Number(dp.composeDay)||0));const migratedPenaltyInterval=Number(dp.penaltyInterval)===7;state.dailyPractice={vocalDay,composeDay,vocalPenaltyCount:migratedPenaltyInterval?Math.max(0,Math.floor(Number(dp.vocalPenaltyCount)||0)):Math.floor(Math.max(0,state.day-vocalDay)/7),composePenaltyCount:migratedPenaltyInterval?Math.max(0,Math.floor(Number(dp.composePenaltyCount)||0)):Math.floor(Math.max(0,state.day-composeDay)/7),penaltyInterval:7};
 state.instruments={acousticGuitar:!!state.instruments?.acousticGuitar,keyboard:!!state.instruments?.keyboard,audioInterface:!!state.instruments?.audioInterface,studioMic:!!state.instruments?.studioMic,monitorHeadphones:!!state.instruments?.monitorHeadphones};
 state.equippedInstruments=(Array.isArray(state.equippedInstruments)?state.equippedInstruments:[]).filter(k=>state.instruments[k]).slice(0,3);
 state.items={bakcas:Math.max(0,Math.floor(Number(state.items?.bakcas)||0)),energizer:Math.max(0,Math.floor(Number(state.items?.energizer)||0)),dietPill:Math.max(0,Math.floor(Number(state.items?.dietPill)||0)),strongDietPill:Math.max(0,Math.floor(Number(state.items?.strongDietPill)||0)),bakcasUsedToday:Math.max(0,Number(state.items?.bakcasUsedToday)||0),mealsToday:Math.max(0,Number(state.items?.mealsToday)||0),bakcasBoughtToday:Math.max(0,Math.min(3,Math.floor(Number(state.items?.bakcasBoughtToday)||0))),snacksBoughtToday:Math.max(0,Math.min(3,Math.floor(Number(state.items?.snacksBoughtToday)||0)))};
 state.storeDaily={promoDay:Number(state.storeDaily?.promoDay??-99),customerDay:Number(state.storeDaily?.customerDay??-99),flyerDay:Number(state.storeDaily?.flyerDay??-99),observeDay:Number(state.storeDaily?.observeDay??-99),buskingDay:Number(state.storeDaily?.buskingDay??-99),buskingCount:Math.max(0,Number(state.storeDaily?.buskingCount)||0)};const sj=state.storeJobs||{};state.storeJobs={workCount:Math.max(0,Math.floor(Number(sj.workCount)||0)),stockWorkCount:Math.max(0,Math.floor(Number(sj.stockWorkCount)||0))};const du=state.dailyUse||{};const hasStyleCareLastDay=Number.isFinite(Number(du.styleCareLastDay));state.dailyUse={styleCareDay:Number(du.styleCareDay??-99),styleCareLastDay:hasStyleCareLastDay?Math.max(1,Number(du.styleCareLastDay)):Math.max(1,state.day),styleDecayCount:hasStyleCareLastDay?Math.max(0,Math.floor(Number(du.styleDecayCount)||0)):0,meditationDay:Number(du.meditationDay??-99),meditationCount:Math.max(0,Math.min(2,Math.floor(Number(du.meditationCount)||0))),walkDay:Number(du.walkDay??-99),walkCount:Math.max(0,Math.min(2,Math.floor(Number(du.walkCount)||0)))};
 const fx=state.effects||{};const energizerUntilDay=Math.max(0,Math.floor(Number(fx.energizerUntilDay)||0));const energizerStillActive=energizerUntilDay>=state.day;state.effects={energizerUntilDay,energizerConsecutiveCount:energizerStillActive?1:0,energizerOverdose:false};
 const sp=state.specialProgress||{};state.specialProgress={cardCollectorOfferSeen:!!sp.cardCollectorOfferSeen,cardCollectorEligibleDay:Math.max(0,Math.floor(Number(sp.cardCollectorEligibleDay)||0)),cardCollectorVisitDone:!!sp.cardCollectorVisitDone,cardCollectorDeclinedDay:Math.max(0,Math.floor(Number(sp.cardCollectorDeclinedDay)||0)),cardTheftDone:!!sp.cardTheftDone,weddingSongSeen:!!sp.weddingSongSeen,weddingInviteSeen:!!sp.weddingInviteSeen,hurabonoWeddingDone:!!sp.hurabonoWeddingDone};
 const economy=state.economy||{};const normalizedDebt=Math.max(0,Number(economy.debt)||0);const savedDebtStart=Number(economy.debtStartDay),savedCriticalDay=Number(economy.debtCriticalDay);
 state.economy={workStreak:Math.max(0,Number(economy.workStreak)||0),lastWorkDay:Number(economy.lastWorkDay??-99),debt:normalizedDebt,totalDebtRepaid:Math.max(0,Number(economy.totalDebtRepaid)||0),lastDebtNoticeDay:Number(economy.lastDebtNoticeDay??-99),debtStartDay:normalizedDebt>0?(Number.isFinite(savedDebtStart)&&savedDebtStart>0?Math.max(1,Math.floor(savedDebtStart)):state.day):0,debtCriticalDay:normalizedDebt>=BANKRUPTCY_CRITICAL_DEBT?(Number.isFinite(savedCriticalDay)&&savedCriticalDay>0?Math.max(1,Math.floor(savedCriticalDay)):state.day):0};
 const career=state.career||{};const totalBusking=Math.max(0,Number(career.totalBusking)||0);const hasSplitBusking=Number.isFinite(Number(career.soloBusking))||Number.isFinite(Number(career.bandBusking));
 state.career={peakFame:Math.max(Number(career.peakFame)||0,Number(state.stats.fame)||0),totalWork:Math.max(0,Number(career.totalWork)||0),totalConcerts:Math.max(0,Number(career.totalConcerts)||0),totalBroadcasts:Math.max(0,Number(career.totalBroadcasts)||0),totalBusking,soloBusking:Math.max(0,Number(career.soloBusking)||(hasSplitBusking?0:totalBusking)),bandBusking:Math.max(0,Number(career.bandBusking)||0),actingCount:Math.max(0,Math.floor(Number(career.actingCount)||0)),actingHits:Math.max(0,Math.floor(Number(career.actingHits)||0))};
 delete state.skillMaintenance; // v139: 15일 장기 미사용 감소 시스템 제거
 const fg=state.fanGroups||{};state.fanGroups={regular:Math.max(0,Number(fg.regular)||0),enthusiast:Math.max(0,Number(fg.enthusiast)||0),gay:Math.max(0,Number(fg.gay)||0),overseas:Math.max(0,Number(fg.overseas)||0)};
 let grouped=Object.values(state.fanGroups).reduce((a,b)=>a+b,0);if(grouped===0&&state.stats.fans>0){state.fanGroups.regular=state.stats.fans;grouped=state.stats.fans}if(grouped>state.stats.fans&&grouped>0){const r=state.stats.fans/grouped;for(const k of Object.keys(state.fanGroups))state.fanGroups[k]=Math.floor(state.fanGroups[k]*r)}
 state.sns={lastPostDay:Number(state.sns?.lastPostDay??-99),totalPosts:Math.max(0,Number(state.sns?.totalPosts)||0),lastLiveDay:Number(state.sns?.lastLiveDay??-99),totalLives:Math.max(0,Number(state.sns?.totalLives)||0),lastLiveScenario:typeof state.sns?.lastLiveScenario==='string'?state.sns.lastLiveScenario:null,nextVocalBonus:Math.max(0,Math.min(1,Number(state.sns?.nextVocalBonus)||0)),nextComposeBonus:Math.max(0,Math.min(1,Number(state.sns?.nextComposeBonus)||0)),controversy:Math.max(0,Number(state.sns?.controversy)||0),lastEventDay:Number(state.sns?.lastEventDay??-99)};
 const drawer=state.drawer||{};const rawPhotos=Array.isArray(drawer.photos)?drawer.photos:[];
 state.drawer={photos:Array.from({length:7},(_,photoIndex)=>Array.from({length:9},(_,pieceIndex)=>!!rawPhotos?.[photoIndex]?.[pieceIndex])),photoMissStreak:Math.max(0,Math.floor(Number(drawer.photoMissStreak)||0)),diaries:[...new Set((Array.isArray(drawer.diaries)?drawer.diaries:[]).map(String).filter(id=>/^d\d{2}$/.test(id)))].slice(0,50),diaryFoundDays:drawer.diaryFoundDays&&typeof drawer.diaryFoundDays==='object'?Object.fromEntries(Object.entries(drawer.diaryFoundDays).filter(([id])=>/^d\d{2}$/.test(id)).map(([id,day])=>[id,Math.max(1,Math.floor(Number(day)||state.day))])):{},diaryCheckedDay:Number(drawer.diaryCheckedDay??-99),diaryMissStreak:Math.max(0,Math.floor(Number(drawer.diaryMissStreak)||0)),todayDiaryId:typeof drawer.todayDiaryId==='string'?drawer.todayDiaryId:null,todayMessage:typeof drawer.todayMessage==='string'?drawer.todayMessage:'',newPhotos:!!drawer.newPhotos,newDiary:!!drawer.newDiary,lastTab:drawer.lastTab==='diary'?'diary':'photos'};
 state.rival={met:!!state.rival?.met,stage:Math.max(0,Math.min(5,Number(state.rival?.stage)||0)),respect:Number(state.rival?.respect)||0,lastEventDay:Number(state.rival?.lastEventDay??-99)};
 state.band.members={guitar:state.band.members?.guitar||null,bass:state.band.members?.bass||null,piano:state.band.members?.piano||null,drums:state.band.members?.drums||null};
 if(state.band.members.guitar&&/P\uAD70/.test(String(state.band.members.guitar)))state.band.members.guitar=String(state.band.members.guitar).replace(/P\uAD70/g,'B군');
 if(Array.isArray(state.history))state.history=state.history.map(line=>String(line).replace(/P\uAD70/g,'B군'));
 state.band.formed=Object.values(state.band.members).every(Boolean);
 const bt=state.bandTalk||{},btDay=bt.lastDay||{},btTopic=bt.lastTopic||{};
 state.bandTalk={lastDay:{guitar:Number(btDay.guitar??-99),bass:Number(btDay.bass??-99),piano:Number(btDay.piano??-99),drums:Number(btDay.drums??-99)},lastTopic:{guitar:Number.isFinite(Number(btTopic.guitar))?Number(btTopic.guitar):-1,bass:Number.isFinite(Number(btTopic.bass))?Number(btTopic.bass):-1,piano:Number.isFinite(Number(btTopic.piano))?Number(btTopic.piano):-1,drums:Number.isFinite(Number(btTopic.drums))?Number(btTopic.drums):-1}};
 if(!state.endingPrompted)state.endingPrompted={};
 if(state.pendingEnding===undefined)state.pendingEnding=null;
 state.outfit=Math.max(0,Math.min(OUTFIT_FILES.length-1,Number(state.outfit)||0));
 state.ownedOutfits=[...new Set([0,...((Array.isArray(state.ownedOutfits)?state.ownedOutfits:[]).map(Number).filter(x=>x>=0&&x<OUTFIT_FILES.length))])];
 if(!state.ownedOutfits.includes(state.outfit))state.outfit=0;
 const fm=state.fleaMarket||{};state.fleaMarket={cycleDay:Math.max(0,Math.floor(Number(fm.cycleDay)||0)),soldOut:!!fm.soldOut,offers:Array.isArray(fm.offers)?fm.offers.filter(id=>FLEA_MARKET_ITEMS.some(x=>x.id===id)):[],purchased:Array.isArray(fm.purchased)?fm.purchased.filter(id=>FLEA_MARKET_ITEMS.some(x=>x.id===id)):[]};
 state.performanceCount=Math.max(0,Number(state.performanceCount)||0);
 const stalkerHistory=Array.isArray(state.history)?state.history:[];
 const safeStalkerChoiceFragments=['즉시 알리고 모습을 기록한다','통화 기록과 문자를 보존해','보안요원을 부르고 CCTV와 출입 기록을 확보한다','상자와 혈서를 건드리지 않고 즉시 신고한다','어머니를 즉시 대피시키고 경찰 신고·주거 보안을 강화한다'];
 const recordedSafeStages=new Set();let recordedStalkerEncounters=0;
 for(const line of stalkerHistory){const value=String(line),match=value.match(/스토커 사건 ([1-5])\/5/);if(!match)continue;const stage=Number(match[1])||0;recordedStalkerEncounters=Math.max(recordedStalkerEncounters,stage);if(safeStalkerChoiceFragments.some(fragment=>value.includes(fragment)))recordedSafeStages.add(stage)}
 const savedStalkerEncounters=Math.max(0,Math.min(5,Number(state.stalker?.encounters)||0));
 const missingStalkerChoices=savedStalkerEncounters>recordedStalkerEncounters;
 const hasRecordedStalkerChoices=recordedStalkerEncounters>0;
 const normalizedStalkerEncounters=missingStalkerChoices?recordedStalkerEncounters:savedStalkerEncounters;
 const normalizedStalkerSafety=hasRecordedStalkerChoices?recordedSafeStages.size:Math.max(0,Math.min(5,Number(state.stalker?.safety)||0));
 const motherEvacuated=!!state.stalker?.motherEvacuated||stalkerHistory.some(line=>String(line).includes('스토커 사건 5/5 · 방문자 — 어머니를 즉시 대피시키고 경찰 신고·주거 보안을 강화한다'));
 const resolvedByFiveSafe=normalizedStalkerEncounters>=5&&normalizedStalkerSafety===5;
 state.stalker={active:!resolvedByFiveSafe&&(!!state.stalker?.active||normalizedStalkerEncounters>0||fameLevel()>=40),resolved:resolvedByFiveSafe,encounters:normalizedStalkerEncounters,safety:normalizedStalkerSafety,motherEvacuated};
 if(resolvedByFiveSafe||missingStalkerChoices){if(state.pendingEnding?.name==='활동 중지 엔딩')state.pendingEnding=null;if(state.endingPrompted)delete state.endingPrompted['fatal:stalker'];}
 const narrative=state.narrative||{};state.narrative={lastMajorEventDay:Number(narrative.lastMajorEventDay??-99),twentyDaySeen:[...new Set((Array.isArray(narrative.twentyDaySeen)?narrative.twentyDaySeen:[]).map(String))]};
 const gambling=state.gambling||{},cards=gambling.cards||{};const normalizedSpCards=Math.max(0,Math.floor(Number(cards.SP)||0));const historySpDraws=(Array.isArray(state.history)?state.history:[]).filter(x=>String(x).includes('🃏 디지몬 카드')).reduce((sum,line)=>{const m=String(line).match(/SP (\d+)장/);return sum+(m?Number(m[1])||0:0)},0);state.gambling={cards:{C:Math.max(0,Math.floor(Number(cards.C)||0)),U:Math.max(0,Math.floor(Number(cards.U)||0)),R:Math.max(0,Math.floor(Number(cards.R)||0)),SR:Math.max(0,Math.floor(Number(cards.SR)||0)),SEC:Math.max(0,Math.floor(Number(cards.SEC)||0)),SP:normalizedSpCards},totalCardDraws:Math.max(0,Math.floor(Number(gambling.totalCardDraws)||0)),spDraws:Math.max(normalizedSpCards,historySpDraws,Math.floor(Number(gambling.spDraws)||0)),lotteryTickets:(Array.isArray(gambling.lotteryTickets)?gambling.lotteryTickets:[]).filter(t=>t&&Array.isArray(t.numbers)).map(t=>({id:String(t.id||`${t.purchaseDay||state.day}-${Math.random()}`),numbers:[...new Set(t.numbers.map(Number).filter(n=>n>=1&&n<=45))].slice(0,6).sort((a,b)=>a-b),purchaseDay:Math.max(1,Math.floor(Number(t.purchaseDay)||state.day)),drawDay:Math.max(1,Math.floor(Number(t.drawDay)||state.day+7)),status:t.status==='drawn'?'drawn':'pending'})).filter(t=>t.numbers.length===6),lotteryResults:(Array.isArray(gambling.lotteryResults)?gambling.lotteryResults:[]).slice(-20)};
 const minigames=state.minigames||{};state.minigames={songSurvivalLastDay:Number(minigames.songSurvivalLastDay??-99),quizShowLastDay:Number(minigames.quizShowLastDay??-99),songBestStage:Math.max(0,Math.min(3,Math.floor(Number(minigames.songBestStage)||0))),quizBest:Math.max(0,Math.min(10,Math.floor(Number(minigames.quizBest)||0))),quizBag:[...new Set((Array.isArray(minigames.quizBag)?minigames.quizBag:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<30))],cookingPlayed:Math.max(0,Math.floor(Number(minigames.cookingPlayed)||0)),cookingBest:Math.max(0,Math.min(3,Math.floor(Number(minigames.cookingBest)||0))),cookingPerfect:Math.max(0,Math.floor(Number(minigames.cookingPerfect)||0)),storeTetrisBest:Math.max(0,Math.floor(Number(minigames.storeTetrisBest)||0)),runnerBest:Math.max(0,Math.floor(Number(minigames.runnerBest)||0))};
 state.arrogance={lastDay:Number(state.arrogance?.lastDay??-99),count:Math.max(0,Number(state.arrogance?.count)||0),lesson:Number(state.arrogance?.lesson)||0};
 const defaultCooldowns={managerTalk:-99,recruit:-99,audition:-99,concert:-99,broadcast:-99,fanmeeting:-99,album:-99,fanEvent:-99,snsPost:-99};
 state.cooldowns={...defaultCooldowns,...(state.cooldowns||{})};
 const defaultMilestones={firstAudition:false,firstConcert:false,firstBroadcast:false,firstFanmeeting:false,firstAlbum:false,managerHired:false,bandFormed:false,stalkerResolved:false,randomSeen:[]};
 state.milestones={...defaultMilestones,...(state.milestones||{})};
 state.milestones.stalkerResolved=!!state.stalker?.resolved;
 state.milestones.randomSeen=Array.isArray(state.milestones.randomSeen)?state.milestones.randomSeen:[];
 state.historyKeys=Array.isArray(state.historyKeys)?state.historyKeys:[];
 state.lastAction=typeof state.lastAction==='string'?state.lastAction:null;
 state.history=(Array.isArray(state.history)?state.history:[]).filter(x=>!/(자취방|편의점|연습실|공원|공연장)으로 이동$/.test(x));
 if(!state.specialProgress.weddingSongSeen&&(state.seenEvents?.includes('wedding-song')||state.history.some(x=>x.includes('후라보노의 축가 부탁'))))state.specialProgress.weddingSongSeen=true;
 if(!state.specialProgress.weddingInviteSeen&&(state.seenEvents?.includes('manager-wedding-invite')||state.history.some(x=>x.includes('후라보노의 청첩장'))))state.specialProgress.weddingInviteSeen=true;
 state.endings=[...new Set((state.endings||[]).map(migrateEndingName))];
 if(state.pendingEnding?.name)state.pendingEnding.name=migrateEndingName(state.pendingEnding.name);
 if(state.endingPrompted['가수 엔딩']){state.endingPrompted['worldstar:v100']=true;delete state.endingPrompted['가수 엔딩'];}if(state.endingPrompted.year){state.endingPrompted['year:1']=true;delete state.endingPrompted.year;}
 // v113 엔딩 주기 마이그레이션: 365일차부터 시작해 이후 100일마다 선택한다.
 const legacyEndingKeys=Object.keys(state.endingPrompted).filter(key=>key.startsWith('year-v100:')||key.startsWith('year-v112:')||key==='year:1'||key==='worldstar:v100'||key==='worldstar:v112');
 if(state.day<365){
  if(state.pendingEnding&&!state.pendingEnding.locked)state.pendingEnding=null;
  for(const key of [...legacyEndingKeys,...Object.keys(state.endingPrompted).filter(key=>key.startsWith('ending-cycle-v113:'))])delete state.endingPrompted[key];
 }else{
  const currentCheckpoint=365+Math.floor((state.day-365)/100)*100;
  const currentCycleKey=`ending-cycle-v113:${currentCheckpoint}`;
  if(state.pendingEnding&&!state.pendingEnding.locked){
   state.pendingEnding.offerKey=currentCycleKey;
   state.pendingEnding.text=`${currentCheckpoint}일차 엔딩 선택 시점이다. 지금까지의 길을 엔딩으로 남기거나 계속 성장할 수 있다. 계속 성장하면 ${currentCheckpoint+100}일차에 다시 엔딩을 선택할 수 있다.`;
   state.endingPrompted[currentCycleKey]=true;
  }
  for(const key of legacyEndingKeys){
   const yearMatch=key.match(/^year-v(?:100|112):(\d+)$/);
   let migratedCheckpoint=null;
   if(yearMatch){
    const legacyYear=Math.max(1,Number(yearMatch[1])||1);
    const legacyOfferDay=legacyYear<=1?365:(legacyYear-1)*365+1;
    migratedCheckpoint=365+Math.floor(Math.max(0,legacyOfferDay-365)/100)*100;
   }else if(key==='year:1'){migratedCheckpoint=365;}
   else if(key.startsWith('worldstar:')){migratedCheckpoint=currentCheckpoint;}
   if(migratedCheckpoint!==null)state.endingPrompted[`ending-cycle-v113:${migratedCheckpoint}`]=true;
   delete state.endingPrompted[key];
  }
 }
 state.specialEvents={iziViral:!!state.specialEvents?.iziViral,waitedMoreViral:!!state.specialEvents?.waitedMoreViral,day30Hair:!!state.specialEvents?.day30Hair,day60Workout:!!state.specialEvents?.day60Workout,day90Live:!!state.specialEvents?.day90Live,day120Chat:!!state.specialEvents?.day120Chat,day150Birthday:!!state.specialEvents?.day150Birthday,day180Archive:!!state.specialEvents?.day180Archive,day210Demo:!!state.specialEvents?.day210Demo,day240Meme:!!state.specialEvents?.day240Meme,day300Promise:!!state.specialEvents?.day300Promise,day330Mother:!!state.specialEvents?.day330Mother,day360Reflection:!!state.specialEvents?.day360Reflection,day400Fanmeet:!!state.specialEvents?.day400Fanmeet,day450ReturnSpring:!!state.specialEvents?.day450ReturnSpring,day500SchoolFestival:!!state.specialEvents?.day500SchoolFestival,restLooksNightmare:!!state.specialEvents?.restLooksNightmare||(Array.isArray(state.history)&&state.history.some(x=>String(x).includes('못생겨지고 뚱뚱해지는 꿈')||String(x).includes('restLooksNightmare'))),hiddenGameOst:!!state.specialEvents?.hiddenGameOst,hiddenRadioDj:!!state.specialEvents?.hiddenRadioDj,hiddenDingo:!!state.specialEvents?.hiddenDingo,careerLv70:!!state.specialEvents?.careerLv70,careerLv80:!!state.specialEvents?.careerLv80,careerLv90:!!state.specialEvents?.careerLv90,actingExtra:!!state.specialEvents?.actingExtra,firstKissScene:!!state.specialEvents?.firstKissScene,mysteriousMerchantPurchased:!!state.specialEvents?.mysteriousMerchantPurchased,cardCollectorVisit:!!state.specialEvents?.cardCollectorVisit,cardTheft:!!state.specialEvents?.cardTheft,hurabonoWeddingDay:!!state.specialEvents?.hurabonoWeddingDay};
 state.specialScene={active:false,key:null};
 const prep=state.preparation||{};state.preparation={stageReady:!!prep.stageReady,stageReadyDay:Number(prep.stageReadyDay??-99),buskingInsight:!!prep.buskingInsight,buskingInsightDay:Number(prep.buskingInsightDay??-99)};
 if(state.day-state.preparation.stageReadyDay>7)state.preparation.stageReady=false;if(state.day-state.preparation.buskingInsightDay>3)state.preparation.buskingInsight=false;
 state.level=fameLevel();updateCardCollectorQualification();
 delete state.romance;
 syncEndingCollection();
}
const SAVE_VERSION='1.5';
const AUTO_SAVE_KEY='ryuGameAuto';
const MANUAL_SAVE_KEYS=['ryuGameSlot1','ryuGameSlot2','ryuGameSlot3'];
function makeSaveRecord(){return {version:SAVE_VERSION,savedAt:new Date().toISOString(),state:JSON.parse(JSON.stringify(state))}}
function parseSaveRecord(raw){if(!raw)return null;try{const data=JSON.parse(raw);if(data&&data.state&&typeof data.state==='object')return data;if(data&&typeof data==='object')return {version:'legacy',savedAt:null,state:data};return null}catch(err){console.warn('저장 데이터 해석 실패',err);return null}}
function migrateLegacySave(){const storage=getStorage();if(!storage||storage.getItem(AUTO_SAVE_KEY))return;const legacy=storage.getItem('ryuGame');if(!legacy)return;const record=parseSaveRecord(legacy);if(!record)return;try{storage.setItem(AUTO_SAVE_KEY,JSON.stringify({...record,version:record.version==='legacy'?'0.9':record.version,savedAt:record.savedAt||new Date().toISOString()}));storage.removeItem('ryuGame')}catch(err){console.warn('구버전 저장 이전 실패',err)}}
function readSave(key){const storage=getStorage();return storage?parseSaveRecord(storage.getItem(key)):null}
function writeSave(key,show=true){const storage=getStorage();if(!storage){if(show)toast('이 브라우저에서는 저장 기능을 사용할 수 없습니다.');return false}try{storage.setItem(key,JSON.stringify(makeSaveRecord()));if(typeof scheduleRankingSync==='function')scheduleRankingSync();if(show){toast(key===AUTO_SAVE_KEY?'자동 저장되었습니다.':'저장되었습니다.');playSfx('save')}return true}catch(err){console.warn('게임 저장 실패',err);if(show)toast('저장 공간이 부족하거나 차단되어 있습니다.');return false}}
function applySaveRecord(record){if(!record?.state)return false;try{state=deepMerge(baseState,record.state);normalizeState();return true}catch(err){console.warn('저장 데이터 복구 실패',err);return false}}
function load(key=AUTO_SAVE_KEY){migrateLegacySave();return applySaveRecord(readSave(key))}
function save(show=true){return writeSave(AUTO_SAVE_KEY,show)}
function formatSaveTime(iso){if(!iso)return '저장 시각 정보 없음';const d=new Date(iso);if(Number.isNaN(d.getTime()))return '저장 시각 정보 없음';return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} 저장`}
function saveLocationName(snapshot){return locations[snapshot.location]?.name||snapshot.location||'알 수 없는 장소'}
function saveCardHtml(record,label,index,isAuto=false){if(!record)return `<section class="save-slot empty"><div class="save-slot-head"><b>${label}</b><span class="save-badge">빈 슬롯</span></div><p>아직 저장된 진행 상황이 없습니다.</p>${isAuto?'':`<button class="primary wide" data-save-slot="${index}">저장하기</button>`}</section>`;const s=record.state||{};const stats=s.stats||{};return `<section class="save-slot"><div class="save-slot-head"><b>${label}</b><span class="save-badge">${isAuto?'AUTO':'SLOT '+index}</span></div><p class="save-summary"><strong>${Number(s.day||1).toLocaleString()}일째 · ${saveLocationName(s)}</strong><br>인지도 ${Number(stats.fame||0).toLocaleString()} · 팬 ${Number(stats.fans||0).toLocaleString()}명<br>보유금 ${Number(stats.money||0).toLocaleString()}원${Number(s.economy?.debt||0)>0?` · 채무 ${Number(s.economy.debt).toLocaleString()}원`:''}</p><small>${formatSaveTime(record.savedAt)} · v${record.version||'?'}</small><div class="save-slot-actions"><button class="primary" data-load-key="${isAuto?AUTO_SAVE_KEY:MANUAL_SAVE_KEYS[index-1]}">불러오기</button>${isAuto?'':`<button data-save-slot="${index}">덮어쓰기</button><button class="danger" data-delete-slot="${index}">삭제</button>`}</div></section>`}
function openSaveManager(mode='all'){
 migrateLegacySave();
 const auto=readSave(AUTO_SAVE_KEY),slots=MANUAL_SAVE_KEYS.map(readSave);
 const html=`<div class="save-manager">${mode!=='manual'?saveCardHtml(auto,'최근 자동 저장',0,true):''}<div class="save-slots">${slots.map((r,i)=>saveCardHtml(r,`저장 슬롯 ${i+1}`,i+1,false)).join('')}</div><p class="save-help">자동 저장은 이동·행동·날짜 변경 때 갱신됩니다. 수동 슬롯은 서로 독립적으로 보관됩니다.</p></div>`;
 showModal(mode==='load'?'저장 데이터 불러오기':'저장 / 불러오기',html);
 $$('[data-save-slot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.saveSlot),key=MANUAL_SAVE_KEYS[i-1],existing=readSave(key);if(existing&&!confirm(`현재 진행 상황으로 저장 슬롯 ${i}을 덮어쓰시겠습니까?`))return;if(writeSave(key,true))openSaveManager(mode)});
 $$('[data-delete-slot]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.deleteSlot);if(!confirm(`저장 슬롯 ${i}을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`))return;const storage=getStorage();if(storage)storage.removeItem(MANUAL_SAVE_KEYS[i-1]);toast(`저장 슬롯 ${i}을 삭제했습니다.`);openSaveManager(mode)});
 $$('[data-load-key]').forEach(b=>b.onclick=()=>{const key=b.dataset.loadKey;if($('#gameScreen').classList.contains('active')&&!confirm('현재 진행 내용은 자동 저장되지만, 마지막 행동 이후 변경 내용이 있을 수 있습니다. 불러오시겠습니까?'))return;stopSpecialEventBgm(false);forceAudioOn();if(!load(key))return toast('저장 데이터를 불러오지 못했습니다.');setChoiceLock(false);exitEndingMusic();$('#titleScreen').classList.remove('active');$('#gameScreen').classList.add('active');setAudioScreenMode('game',true);closeModal();render();toast('저장 데이터를 불러왔습니다.')});
}
function loadAudioSettings(){
 try{const raw=localStorage.getItem('ryuAudioSettings'),saved=raw?JSON.parse(raw):{};audioSettings={bgm:saved.bgm!==false,sfx:saved.sfx!==false}}
 catch{audioSettings={bgm:true,sfx:true}}
 updateAudioButton();syncScreenBgm()
}
function saveAudioSettings(){try{localStorage.setItem('ryuAudioSettings',JSON.stringify(audioSettings))}catch{}updateAudioButton()}
function updateAudioButton(){const b=$('#audioBtn');if(!b)return;const on=!!audioSettings.bgm;b.textContent=on?'♪':'♩';b.classList.toggle('audio-on',on);b.classList.toggle('audio-off',!on);b.setAttribute('aria-label',on?'배경음악 켜짐':'배경음악 꺼짐')}
function titleBgmElement(){return document.getElementById('titleScreenBgm')}
function gameBgmElement(){return document.getElementById('gameMainBgm')}
function pauseMediaBgm(audio,reset=false){if(!audio)return;if(!audio.paused)audio.pause();if(reset){try{audio.currentTime=0}catch{}}}
function syncScreenBgm(restart=false){
 const title=titleBgmElement(),game=gameBgmElement(),target=audioScreenMode==='game'?game:title,other=audioScreenMode==='game'?title:game;
 [title,game].forEach(audio=>{if(audio){audio.loop=true;audio.volume=REGULAR_BGM_VOLUME}});
 pauseMediaBgm(other,false);
 const canPlay=!!audioSettings.bgm&&!specialEventBgm&&!endingMusicMode&&!customEndingBgm&&document.visibilityState!=='hidden';
 if(!canPlay){pauseMediaBgm(target,false);return}
 if(restart&&target){try{target.currentTime=0}catch{}}
 target?.play().catch(()=>{})
}
function setAudioScreenMode(mode,restart=false){audioScreenMode=mode==='game'?'game':'title';syncScreenBgm(restart)}
function ensureAudio(){if(!audioCtx){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx){syncScreenBgm();return false}audioCtx=new Ctx();audioMaster=audioCtx.createGain();bgmGain=audioCtx.createGain();sfxGain=audioCtx.createGain();audioMaster.gain.value=FIXED_MASTER_VOLUME;bgmGain.gain.value=(endingMusicMode&&audioSettings.bgm)?ENDING_BGM_VOLUME:0;sfxGain.gain.value=audioSettings.sfx?SFX_GAIN_VOLUME:0;bgmGain.connect(audioMaster);sfxGain.connect(audioMaster);audioMaster.connect(audioCtx.destination)}if(audioCtx.state==='suspended')audioCtx.resume();syncAudioGains();syncScreenBgm();if(endingMusicMode&&audioSettings.bgm&&!bgmTimer&&!specialEventBgm)startBgm();return true}
function forceAudioOn(){const ok=ensureAudio();syncScreenBgm();return ok}
function specialEventBgmVolume(){return audioSettings.bgm?SPECIAL_EVENT_BGM_VOLUME:0}
function syncAudioGains(){
 if(specialEventBgm){specialEventBgm.volume=specialEventBgmVolume();if(audioSettings.bgm&&specialEventBgm.paused)specialEventBgm.play().catch(()=>{});if(!audioSettings.bgm&&!specialEventBgm.paused)specialEventBgm.pause()}
 if(customEndingBgm){customEndingBgm.volume=audioSettings.bgm?ENDING_BGM_VOLUME:0; if(audioSettings.bgm&&customEndingBgm.paused)customEndingBgm.play().catch(()=>{}); if(!audioSettings.bgm&&!customEndingBgm.paused)customEndingBgm.pause()}
 if(audioCtx){const t=audioCtx.currentTime;audioMaster.gain.setTargetAtTime(FIXED_MASTER_VOLUME,t,.04);bgmGain.gain.setTargetAtTime((audioSettings.bgm&&endingMusicMode&&!specialEventBgm&&!customEndingBgm)?ENDING_BGM_VOLUME:0,t,.08);sfxGain.gain.setTargetAtTime(audioSettings.sfx?SFX_GAIN_VOLUME:0,t,.04)}
 if(audioSettings.bgm&&endingMusicMode&&!bgmTimer&&!specialEventBgm&&!customEndingBgm)startBgm();
 if((!audioSettings.bgm||!endingMusicMode||specialEventBgm||customEndingBgm)&&bgmTimer){clearInterval(bgmTimer);bgmTimer=null}
 syncScreenBgm()
}
function startSpecialEventBgm(key){const elementId=specialEventBgmMap[key]||SPECIAL_EVENT_DEFAULT_BGM_ID;stopSpecialEventBgm(false);specialEventBgmKey=key;specialEventBgm=document.getElementById(elementId);if(!specialEventBgm){specialEventBgmKey=null;return}pauseMediaBgm(titleBgmElement());pauseMediaBgm(gameBgmElement());if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null}if(audioCtx&&bgmGain){const t=audioCtx.currentTime;bgmGain.gain.cancelScheduledValues(t);bgmGain.gain.setTargetAtTime(0,t,.04)}specialEventBgm.loop=true;specialEventBgm.currentTime=0;specialEventBgm.volume=specialEventBgmVolume();if(audioSettings.bgm)specialEventBgm.play().catch(()=>{})}
function stopSpecialEventBgm(resume=true){const audio=specialEventBgm;specialEventBgm=null;specialEventBgmKey=null;if(audio){audio.pause();try{audio.currentTime=0}catch{}}if(resume&&audioSettings.bgm){if(endingMusicMode){ensureAudio();restartBgmScheduler();syncAudioGains()}else syncScreenBgm()}}
function stopCustomEndingBgm(resume=true){
 const audio=customEndingBgm;customEndingBgm=null;customEndingBgmName='';
 if(audio){audio.pause();try{audio.currentTime=0}catch{}}
 if(resume&&audioSettings.bgm){if(endingMusicMode){ensureAudio();restartBgmScheduler();syncAudioGains()}else syncScreenBgm()}
}
const bgmScales={home:[48,52,55,59,55,52,50,55],store:[50,53,57,60,57,53,52,57],practice:[45,52,57,60,57,52,48,55],park:[48,55,59,62,59,55,52,59],stage:[45,52,56,59,64,59,56,52]};
function midiHz(n){return 440*Math.pow(2,(n-69)/12)}
function softNote(freq,start,duration,gain=.045,type='sine',target=bgmGain){if(!audioCtx||!target)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.08);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(target);o.start(start);o.stop(start+duration+.04)}
const endingScales={
 '무명가수 엔딩':[45,48,52,55,52,48,47,52],
 '파산 엔딩':[43,46,48,45,41,43,40,38],
 '활동 중지 엔딩':[45,48,52,48,45,43,45,48],
 '월드스타 엔딩':[48,55,60,64,67,64,60,72],
 '유명 솔로가수 엔딩':[50,53,57,60,64,60,57,69],
 '보컬트레이너 엔딩':[48,52,55,59,55,52,50,57],
 '작곡가 엔딩':[45,52,57,60,64,60,57,55],
 '편의점 사장 엔딩':[50,53,55,57,55,53,52,55],
 '인플루언서 엔딩':[55,59,62,67,62,59,57,64],
 '디지몬 카드샵 사장 엔딩':[48,52,55,60,55,52,48,60],
 '밴드가수 엔딩':[45,52,57,60,64,67,64,69]
}
function scheduleBgmBar(){
 if(!audioCtx||!audioSettings.bgm||specialEventBgm)return;
 const now=audioCtx.currentTime+.08;
 if(endingMusicMode){
  const notes=endingScales[endingMusicName]||endingScales['무명가수 엔딩'];
  for(let i=0;i<6;i++){
   const n=notes[(bgmStep+i)%notes.length];
   softNote(midiHz(n+12),now+i*1.05,.9,.019,'sine');
   if(i%2===0)softNote(midiHz(n),now+i*1.05,2.0,.012,'triangle');
  }
  const root=notes[0];softNote(midiHz(root-12),now,6.1,.009,'sine');
  bgmStep=(bgmStep+1)%notes.length;return;
 }
 const notes=bgmScales[state.location]||bgmScales.home;
 for(let i=0;i<8;i++){const n=notes[(bgmStep+i)%notes.length];softNote(midiHz(n+12),now+i*.75,.62,.027,'triangle');if(i%2===0)softNote(midiHz(n),now+i*.75,1.35,.018,'sine')}
 const root=notes[0];softNote(midiHz(root-12),now,5.8,.012,'sine');softNote(midiHz(root-5),now,5.8,.009,'sine');bgmStep=(bgmStep+2)%notes.length
}
function restartBgmScheduler(){if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null}bgmStep=0;if(audioSettings.bgm&&audioCtx&&endingMusicMode&&!specialEventBgm){scheduleBgmBar();bgmTimer=setInterval(scheduleBgmBar,6000)}}
function enterEndingMusic(name){
 stopSpecialEventBgm(false);
 stopCustomEndingBgm(false);
 endingMusicName=name;
 const customId=customEndingBgmMap[name]||DEFAULT_ENDING_BGM_ID;
 if(customId){
  endingMusicMode=false;
  if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null}
  ensureAudio();
  if(audioCtx&&bgmGain){const t=audioCtx.currentTime;bgmGain.gain.cancelScheduledValues(t);bgmGain.gain.setTargetAtTime(0,t,.05)}
  customEndingBgm=document.getElementById(customId);
  customEndingBgmName=name;
  if(customEndingBgm){customEndingBgm.loop=true;customEndingBgm.volume=audioSettings.bgm?ENDING_BGM_VOLUME:0;customEndingBgm.currentTime=0;if(audioSettings.bgm)customEndingBgm.play().catch(()=>{})}
  syncAudioGains();
  syncScreenBgm();
  return;
 }
 endingMusicMode=true;
 syncScreenBgm();
 ensureAudio();
 if(audioCtx&&bgmGain){const t=audioCtx.currentTime;bgmGain.gain.cancelScheduledValues(t);bgmGain.gain.setValueAtTime(bgmGain.gain.value,t);bgmGain.gain.linearRampToValueAtTime(0,t+.75);setTimeout(()=>{restartBgmScheduler();syncAudioGains()},780)}else restartBgmScheduler()
}
function exitEndingMusic(){
 if(customEndingBgm){endingMusicMode=false;endingMusicName='';stopCustomEndingBgm(false);syncAudioGains();syncScreenBgm();return}
 if(!endingMusicMode)return;endingMusicMode=false;endingMusicName='';if(audioCtx&&bgmGain){const t=audioCtx.currentTime;bgmGain.gain.cancelScheduledValues(t);bgmGain.gain.setValueAtTime(bgmGain.gain.value,t);bgmGain.gain.linearRampToValueAtTime(0,t+.55);setTimeout(()=>{restartBgmScheduler();syncAudioGains();syncScreenBgm()},580)}else{restartBgmScheduler();syncScreenBgm()}
}

function startBgm(){if(!audioCtx||bgmTimer||!audioSettings.bgm||specialEventBgm||!endingMusicMode)return;scheduleBgmBar();bgmTimer=setInterval(scheduleBgmBar,6000)}
function playSfx(type='tap'){if(!audioSettings.sfx||!ensureAudio()||!sfxGain)return;const now=audioCtx.currentTime+.01;const note=(n,d=.12,g=.12,w='sine',delay=0)=>softNote(midiHz(n),now+delay,d,g,w,sfxGain);switch(type){case'move':note(60,.12,.09,'triangle');note(67,.18,.08,'triangle',.1);break;case'coin':note(76,.1,.12,'square');note(83,.16,.09,'triangle',.08);break;case'save':note(64,.12,.08,'sine');note(69,.15,.08,'sine',.09);note(76,.22,.07,'sine',.18);break;case'success':note(60,.12,.09,'triangle');note(64,.15,.09,'triangle',.1);note(67,.2,.09,'triangle',.2);note(72,.3,.08,'sine',.3);break;case'fail':note(55,.2,.08,'sawtooth');note(50,.3,.07,'triangle',.15);break;case'busking':note(57,.11,.08,'triangle');note(64,.11,.08,'triangle',.09);note(69,.2,.08,'triangle',.18);break;case'drink':note(72,.08,.07,'sine');note(79,.12,.06,'sine',.08);break;case'event':note(48,.18,.07,'sine');note(60,.24,.08,'triangle',.13);break;case'click':case'tap':default:note(69,.08,.06,'sine');}}
function toggleBgm(){audioSettings.bgm=!audioSettings.bgm;saveAudioSettings();ensureAudio();syncAudioGains();playSfx('tap');renderAudioSettingsIfOpen()}
function toggleSfx(){audioSettings.sfx=!audioSettings.sfx;saveAudioSettings();ensureAudio();syncAudioGains();if(audioSettings.sfx)playSfx('success');renderAudioSettingsIfOpen()}

function gameGuideHtml(){return `<div class="game-guide accessible-guide">
  <section class="guide-hero"><span class="guide-kicker">처음 하는 분도 천천히 보면 됩니다</span><h3>류현상 키우기 · 쉬운 진행 가이드</h3><p>돈을 벌고 → 노래를 연습하고 → 버스킹으로 팬을 모으고 → 오디션·앨범·공연으로 성장하는 게임입니다. 버튼에 적힌 조건만 따라가도 진행할 수 있습니다. 어려운 용어보다 “지금 무엇을 하면 되는지” 중심으로 설명합니다.</p></section>
  <nav class="guide-tabs" aria-label="게임 설명 목차"><button class="active" data-guide-tab="start">처음 시작</button><button data-guide-tab="band">밴드 영입</button><button data-guide-tab="stats">능력치</button><button data-guide-tab="career">활동·366일</button><button data-guide-tab="money">돈·채무</button><button data-guide-tab="tips">쉬운 팁</button></nav>
  <div class="guide-pages">
   <section class="guide-page active" data-guide-page="start">
    <div class="guide-callout"><b>① 초반에는 편의점 + 보컬 연습 + 버스킹</b><p>돈이 부족하면 <b>편의점 알바</b>, 노래 실력이 부족하면 <b>보컬 연습</b>, 팬과 인지도를 늘리고 싶으면 <b>버스킹</b>을 하세요. 체력이 낮으면 자취방에서 <b>식사</b> 또는 <b>깊은 휴식</b>을 하면 됩니다.</p></div>
    <div class="guide-step"><b>② 회색 버튼은 왜 못 누르나요?</b><p>버튼 아래에 부족한 조건이 표시됩니다. 예: “보컬 50 필요”, “5일 후 가능”, “체력 부족”. 그 조건만 채우면 다시 누를 수 있습니다.</p></div>
    <div class="guide-step"><b>③ 하루는 4칸입니다.</b><p>대부분의 행동은 시간 1칸을 사용합니다. 깊은 휴식은 2칸입니다. 장소 이동은 시간을 쓰지 않습니다. 식사·일부 상점 기능처럼 “시간 미소모”라고 적힌 행동도 있습니다.</p></div>
    <div class="guide-step"><b>④ 저장은 자동 + 수동 3칸</b><p>게임은 자주 자동 저장됩니다. 중요한 선택 전에는 메뉴의 저장/불러오기에서 수동 슬롯을 따로 사용하면 여러 엔딩을 보기 편합니다.</p></div>
   </section>
   <section class="guide-page" data-guide-page="band">
    <div class="guide-callout"><b>밴드는 한 번에 생기지 않습니다.</b><p>연습실의 <b>멤버 오디션</b>에서 기타 → 베이스 → 피아노 → 드럼을 각각 조건에 맞춰 영입합니다. 한 명을 영입한 뒤에는 다음 오디션까지 5일 기다려야 합니다.</p></div>
    <div class="guide-table">
     <div><b>기타 B군</b><span>인지도 Lv.5 + 보컬 28 + 오디션 비용 120,000원</span></div>
     <div><b>베이스 L군</b><span>인지도 Lv.10 + 버스킹 누적 3회 + 비용 180,000원</span></div>
     <div><b>피아노 J군</b><span>인지도 Lv.15 + 작곡 35 + 비용 250,000원</span></div>
     <div><b>드럼 R군</b><span>인지도 Lv.20 + 공연 경험 2회 + 비용 320,000원</span></div>
    </div>
    <div class="guide-step"><b>4명이 모두 모이면 완전체</b><p>완전체가 되면 밴드 합주·신곡 편곡·밴드 버스킹 등 밴드 전용 활동을 제대로 진행할 수 있습니다. 멤버창에서 각 멤버와 하루 한 번 대화하면 결속력도 올라갑니다.</p></div>
   </section>
   <section class="guide-page" data-guide-page="stats"><div class="guide-grid">
    <article><b>체력</b><p>행동할 때 줄어듭니다. 너무 낮추지 말고 15~25 정도는 남겨 두는 편이 안전합니다.</p></article><article><b>스트레스</b><p>높을수록 일부 결과가 나빠집니다. 명상·산책·휴식으로 낮출 수 있습니다.</p></article>
    <article><b>보컬</b><p>버스킹·오디션·공연에서 매우 중요합니다. 7일 동안 보컬 연습을 하지 않으면 보컬이 2 감소합니다.</p></article><article><b>작곡</b><p>앨범과 자작곡 성장에 중요합니다. 7일 동안 작곡 연습을 하지 않으면 작곡이 2 감소합니다.</p></article>
    <article><b>연기</b><p>366일 이후 연기 활동으로 성장합니다. 연기 수치가 높을수록 촬영에서 좋은 평가를 받을 확률이 조금씩 올라갑니다.</p></article><article><b>인지도</b><p>인지도 100점마다 Lv.1이 오릅니다. 높은 레벨이 되면 새로운 활동과 사건이 열립니다.</p></article><article><b>팬</b><p>버스킹·공연·방송·SNS·앨범 등으로 늘어납니다.</p></article>
   </div></section>
   <section class="guide-page" data-guide-page="career">
    <div class="guide-callout"><b>편의점 알바도 성장합니다.</b><p>편의점 알바와 야간 진열 보조는 각각 누적 10회·30회·80회에서 단계가 올라 급여가 증가합니다. 근무 중 낮은 확률로 <b>테트리스 미니게임</b>이 등장하며, 플레이 성적에 따라 그날 급여가 더 올라갑니다.</p></div>
    <div class="guide-table"><div><b>버스킹</b><span>팬·인지도·현금을 함께 얻는 초반 핵심 활동</span></div><div><b>오디션</b><span>인지도 Lv.10·보컬 50부터 도전</span></div><div><b>앨범</b><span>연습실에서 제작. 보컬 35·작곡 30 이상 필요</span></div><div><b>공연·방송</b><span>후반 팬과 인지도를 크게 올리는 활동</span></div><div><b>366일 이후</b><span>공연장 노래 서바이벌·O/X 퀴즈쇼, 연습실 연기 활동이 추가됩니다.</span></div><div><b>연기</b><span>366일 이후 연습실에서 가능. 낮은 확률로 류현상 도트 캐릭터 러닝 미니게임이 등장합니다.</span></div></div>
   </section>
   <section class="guide-page" data-guide-page="money"><div class="guide-grid"><article><b>돈이 부족하면</b><p>편의점 알바·야간 진열·버스킹으로 먼저 현금을 확보하세요.</p></article><article><b>채무가 생기면</b><p>일부 앨범·장비·이사 기능이 막힙니다. 수입이 생기면 일부가 자동 상환됩니다.</p></article><article><b>파산 주의</b><p>채무가 50만원 이상인 상태가 15일 이어지거나, 금액과 관계없이 채무가 30일 동안 남아 있으면 파산 엔딩이 발생합니다.</p></article></div></section>
   <section class="guide-page" data-guide-page="tips"><ol class="guide-tip-list"><li><b>처음에는 모든 걸 외울 필요 없습니다.</b><span>버튼 아래 조건을 보고 하나씩 채우면 됩니다.</span></li><li><b>돈만 벌지 말고 연습도 섞으세요.</b><span>알바만 반복하면 보컬·작곡이 내려갈 수 있습니다.</span></li><li><b>밴드 멤버는 조건이 서로 다릅니다.</b><span>기타→베이스→피아노→드럼 조건을 밴드 영입 탭에서 확인하세요.</span></li><li><b>중요한 선택 전에는 수동 저장.</b><span>엔딩과 특별 이벤트를 여러 방향으로 확인하기 편합니다.</span></li><li><b>365일이 끝이 아닙니다.</b><span>계속 성장하면 465·565·665일처럼 100일마다 다시 일반 엔딩을 선택할 기회가 옵니다.</span></li></ol></section>
  </div>
 </div>`}
function bindGameGuide(){$$('[data-guide-tab]').forEach(btn=>btn.onclick=()=>{$$('[data-guide-tab]').forEach(x=>x.classList.toggle('active',x===btn));$$('[data-guide-page]').forEach(page=>page.classList.toggle('active',page.dataset.guidePage===btn.dataset.guideTab))})}
function openGameGuide(){showModal('게임 설명 · 진행 가이드',gameGuideHtml());bindGameGuide()}

function audioSettingsHtml(){return `<div class="audio-settings"><div class="audio-row"><div><label>배경음악</label><small>타이틀과 게임 화면의 음악, 특별 이벤트 음악을 함께 켜거나 끕니다.</small></div><button id="toggleBgmSetting" class="audio-toggle ${audioSettings.bgm?'on':'off'}">${audioSettings.bgm?'켜짐':'꺼짐'}</button></div><div class="audio-row"><div><label>효과음</label><small>이동, 버튼, 구매, 버스킹, 저장 효과음을 켜거나 끕니다.</small></div><button id="toggleSfxSetting" class="audio-toggle ${audioSettings.sfx?'on':'off'}">${audioSettings.sfx?'켜짐':'꺼짐'}</button></div><p class="audio-hint">브라우저의 자동 재생 제한으로 처음 페이지를 열었을 때는 화면을 한 번 눌러야 음악이 시작될 수 있습니다. 선택한 켜짐·꺼짐 상태는 다음 실행에도 저장됩니다.</p></div>`}
function openAudioSettings(){ensureAudio();showModal('음악·효과음 설정',audioSettingsHtml());bindAudioSettings()}
function bindAudioSettings(){const bgm=$('#toggleBgmSetting'),sfx=$('#toggleSfxSetting');if(bgm)bgm.onclick=toggleBgm;if(sfx)sfx.onclick=toggleSfx}
function renderAudioSettingsIfOpen(){if($('#modal')?.open&&$('#modalTitle')?.textContent==='음악·효과음 설정'){$('#modalBody').innerHTML=audioSettingsHtml();bindAudioSettings()}}
let toastTimer=null,toastMessage='',toastSerial=0;
function syncToastLayer(){
 const modal=$('#modal'),modalToast=$('#modalToast'),pageToast=$('#toast');
 const useModal=!!(modal&&modal.open&&modalToast),active=useModal?modalToast:pageToast,inactive=useModal?pageToast:modalToast;
 if(inactive)inactive.classList.remove('show');
 if(!active)return;
 active.textContent=toastMessage;
 active.classList.toggle('show',!!toastMessage);
}
function toast(t){
 toastSerial++;
 toastMessage=String(t??'');
 if(toastTimer)clearTimeout(toastTimer);
 syncToastLayer();
 const duration=memoryGameActive?1600:3200;
 toastTimer=setTimeout(()=>{toastMessage='';syncToastLayer();toastTimer=null},duration);
}
function clearToastImmediately(){
 if(toastTimer)clearTimeout(toastTimer);
 toastTimer=null;toastMessage='';
 $('#toast')?.classList.remove('show');
 $('#modalToast')?.classList.remove('show');
 syncToastLayer();
}
function beginMiniGameUi(){
 memoryGameActive=true;
 document.documentElement.classList.add('minigame-active');
 clearToastImmediately();
}
function endMiniGameUi(){
 memoryGameActive=false;
 document.documentElement.classList.remove('minigame-active');
 clearToastImmediately();
}
function clamp(v,min=0,max=100){return Math.max(min,Math.min(max,v))}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function addHistory(text,key=null){if(key&&state.historyKeys.includes(key))return false;if(key)state.historyKeys.push(key);state.history.push(`${state.day}일차 · ${text}`);if(state.history.length>80)state.history.shift();return true}
function cooldownReady(key,days,label){const last=Number(state.cooldowns?.[key]??-99);const elapsed=state.day-last;if(elapsed<days){toast(`${label}까지 ${days-elapsed}일 남았습니다.`);return false}return true}
function markCooldown(key){state.cooldowns[key]=state.day}
function distributeFanGrowth(delta){if(delta<=0)return;const lv=fameLevel();let overseas=lv>=55?.12:lv>=35?.05:.01;let gay=.08;let enthusiast=lv>=30?.18:.10;const amounts={overseas:Math.floor(delta*overseas),gay:Math.floor(delta*gay),enthusiast:Math.floor(delta*enthusiast)};amounts.regular=Math.max(0,Math.floor(delta)-amounts.overseas-amounts.gay-amounts.enthusiast);for(const [k,v] of Object.entries(amounts))state.fanGroups[k]=(state.fanGroups[k]||0)+v}
function stat(name,delta,rawHp=false){
 if(name==='fame'){state.stats.fame=Math.max(0,Math.min(10000,state.stats.fame+delta));if(state.career)state.career.peakFame=Math.max(state.career.peakFame||0,state.stats.fame);return delta}
 if(name==='money'){
  if(delta>0&&state.economy?.debt>0){const repay=Math.min(state.economy.debt,Math.max(1,Math.floor(delta*.5)));state.economy.debt-=repay;state.economy.totalDebtRepaid=(state.economy.totalDebtRepaid||0)+repay;if(state.economy.debt<=0){state.economy.debt=0;state.economy.debtStartDay=0;state.economy.debtCriticalDay=0}else if(state.economy.debt<BANKRUPTCY_CRITICAL_DEBT){state.economy.debtCriticalDay=0}state.stats.money=Math.max(0,state.stats.money+delta-repay);return delta-repay}
  if(delta<0&&state.stats.money+delta<0){const shortage=Math.abs(delta)-state.stats.money;state.stats.money=0;addDebt(shortage,'예상 밖의 지출');return delta+shortage}
  state.stats.money=Math.max(0,state.stats.money+delta);return delta
 }
 if(name==='fans'){
  const before=state.stats.fans;state.stats.fans=Math.max(0,state.stats.fans+delta);const actual=state.stats.fans-before;
  if(actual>0)distributeFanGrowth(actual);
  if(actual<0){const total=Object.values(state.fanGroups||{}).reduce((a,b)=>a+(Number(b)||0),0);if(total>0){const target=state.stats.fans;let assigned=0;const keys=['overseas','gay','enthusiast','regular'];for(const k of keys){const next=k==='regular'?Math.max(0,target-assigned):Math.max(0,Math.floor((state.fanGroups[k]||0)/total*target));state.fanGroups[k]=next;assigned+=next}}}
  return actual
 }
 if(name==='hp'){
  if(delta<0&&!rawHp)delta=-effectiveHpCost(Math.abs(delta));
  const before=state.stats.hp;
  state.stats.hp=clamp(state.stats.hp+delta);
  const actual=state.stats.hp-before;
  if(delta<0&&before>10&&state.stats.hp<=10){
   const vocalLoss=Math.min(2,state.stats.vocal);
   const composeLoss=Math.min(2,state.stats.compose);
   state.stats.vocal=clamp(state.stats.vocal-vocalLoss);
   state.stats.compose=clamp(state.stats.compose-composeLoss);
   addHistory(`⚠️ 극심한 피로 · 체력이 10 이하로 떨어져 보컬 -${vocalLoss}, 작곡 -${composeLoss}` ,`low-hp:${state.day}:${state.time}:${state.stats.hp}`);
  }
  return actual
 }
 state.stats[name]=clamp(state.stats[name]+delta);return delta
}
function addDebt(amount,reason='미납금'){amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return 0;const wasDebt=Math.max(0,Number(state.economy?.debt)||0);if(wasDebt<=0)state.economy.debtStartDay=state.day;state.economy.debt=wasDebt+amount;if(wasDebt<BANKRUPTCY_CRITICAL_DEBT&&state.economy.debt>=BANKRUPTCY_CRITICAL_DEBT)state.economy.debtCriticalDay=state.day;state.economy.lastDebtNoticeDay=state.day;const rule=state.economy.debt>=BANKRUPTCY_CRITICAL_DEBT?`채무 50만원 이상 상태를 ${BANKRUPTCY_CRITICAL_DAYS}일 안에 줄여야 함`:`최대 ${BANKRUPTCY_MAX_DAYS}일 안에 전액 상환 필요`;addHistory(`💳 채무 발생 · ${reason} ${amount.toLocaleString()}원 · ${rule}`,`debt:${state.day}:${state.economy.debt}`);return amount}
function chargeMonthlyUpkeep(){let upkeep=500000;if(state.manager.hired)upkeep+=250000;if(state.band.formed)upkeep+=400000;const paid=Math.min(state.stats.money,upkeep);state.stats.money-=paid;const unpaid=upkeep-paid;if(unpaid>0)addDebt(unpaid,'월 고정비 미납');addHistory(`🏠 월 고정비 정산 · ${upkeep.toLocaleString()}원${unpaid>0?` · 미납 ${unpaid.toLocaleString()}원 채무 발생`:''}`,`monthly-upkeep:${state.day}`)}
function debtBlocked(label='이 활동'){if((state.economy?.debt||0)<=0)return false;toast(`채무 ${state.economy.debt.toLocaleString()}원을 먼저 줄여야 ${label}을 진행할 수 있습니다.`);return true}
function energizerRemainingDays(){return Math.max(0,(Number(state.effects?.energizerUntilDay)||0)-state.day+1)}
function energizerActive(){return energizerRemainingDays()>0}
function energizerOverdoseActive(){return false}
function energizerStatusLabel(){return energizerActive()?'에너자이저 적용 소모량':'필요 체력'}
function effectiveHpCost(n,context=''){n=Math.max(0,Number(n)||0);if(n<=0)return 0;let rate=energizerActive()?.8:1;if(state.outfit===7&&(context==='work'||context==='stockWork'))rate*=.9;return Math.max(1,Math.ceil(n*rate))}
function costHp(n,context=''){const actual=effectiveHpCost(n,context);if(state.stats.hp<actual){toast(`체력이 부족합니다.${energizerActive()?` ${energizerStatusLabel()}은 ${actual}입니다.`:''}`);return false}stat('hp',-actual,true);state.lastHpCost=actual;return true}
function scaledFanLoss(rate=.03,min=10,max=180){return Math.min(max,Math.max(min,Math.floor(state.stats.fans*rate)))}
const weatherInfo={sun:{label:'☀ 햇빛',success:.10,hp:0,breakChance:0},rain:{label:'🌧 비',success:-.20,hp:6,breakChance:.06},snow:{label:'🌨 눈',success:-.15,hp:9,breakChance:.04}};
const housingInfo=[['지하 단칸방',0],['1층 원룸',10000000],['복층 오피스텔',30000000],['아파트',50000000],['펜트하우스',100000000]];
function fameLevel(){return Math.max(1,Math.min(100,Math.floor(state.stats.fame/100)+1))}
function dayType(){const y=((state.day-1)%365)+1;if([1,15,50,100,150,200,250,300,365].includes(y))return '공휴일';const w=(state.day-1)%7;return w===5||w===6?'주말':'평일'}
function rollWeather(){const r=Math.random();state.weather=r<.58?'sun':r<.82?'rain':'snow'}
function weatherLabel(){return weatherInfo[state.weather].label}
function restAmount(){return 25+state.housing*5}
function mealRecovery(){return 12+state.housing*3+(state.housing>0?3:0)}
function mealCost(){return 8000*Math.pow(2,Math.max(0,Math.min(4,Number(state.housing)||0)))}
const cookingStepCatalog={
 oil:{label:'식용유',icon:'🫗'},egg:{label:'달걀',icon:'🥚'},tomato:{label:'토마토',icon:'🍅'},salt:{label:'소금',icon:'🧂'},stir:{label:'볶기',icon:'🍳'},
 kimchi:{label:'김치',icon:'🥬'},rice:{label:'밥',icon:'🍚'},gochujang:{label:'고추장',icon:'🌶️'},chicken:{label:'닭 날개',icon:'🍗'},soy:{label:'간장',icon:'🫙'},
 syrup:{label:'올리고당',icon:'🍯'},oven:{label:'오븐',icon:'🔥'},water:{label:'물',icon:'💧'},boil:{label:'끓이기',icon:'♨️'},chiliOil:{label:'고추기름',icon:'🔴'},tofu:{label:'순두부',icon:'◻️'}
};
const cookingRecipes=[
 {id:'tomatoEgg',name:'토마토 달걀볶음',icon:'🍅',steps:['oil','egg','tomato','salt','stir']},
 {id:'kimchiRice',name:'김치볶음밥',icon:'🍚',steps:['oil','kimchi','rice','gochujang','stir']},
 {id:'chickenWings',name:'닭 날개 구이',icon:'🍗',steps:['chicken','salt','soy','syrup','oven']},
 {id:'eggPorridge',name:'계란죽',icon:'🥣',steps:['water','rice','egg','salt','boil']},
 {id:'softTofu',name:'순두부찌개',icon:'🍲',steps:['chiliOil','tofu','water','egg','boil']}
];
function cookingTrayFor(recipe){
 const required=[...recipe.steps],decoys=Object.keys(cookingStepCatalog).filter(key=>!required.includes(key));
 shuffleInPlace(decoys);return shuffleInPlace([...required,...decoys.slice(0,5)]);
}
function runCookingCountdown(onStart){
 let n=3;const body=$('#modalBody');if(!body)return()=>{};
 const overlay=document.createElement('div');overlay.className='training-countdown cooking-countdown';overlay.innerHTML=`<strong>${n}</strong><small>요리 준비</small>`;body.appendChild(overlay);playSfx('tap');
 let startTimer=null;const tick=setInterval(()=>{n--;if(n>0){overlay.querySelector('strong').textContent=n;playSfx('tap');return}clearInterval(tick);overlay.querySelector('strong').textContent='START';overlay.querySelector('small').textContent='';playSfx('success');startTimer=setTimeout(()=>{overlay.remove();onStart()},300)},1000);
 return()=>{clearInterval(tick);if(startTimer)clearTimeout(startTimer);overlay.remove()}
}
function startCookingTycoon(before,cost,baseGain){
 state.items.mealsToday=(state.items.mealsToday||0)+1;stat('money',-cost);
 const orders=shuffleInPlace([...cookingRecipes]).slice(0,3);
 let orderIndex=0,stepIndex=0,completed=0,mistakes=0,finished=false,locked=true;
 let tray=cookingTrayFor(orders[0]);
 const totalSeconds=35;let endAt=null,timer=null,countdownCancel=null;
 beginMiniGameUi();
 showModal('자취방 요리 타이쿤','', 'cooking');
 const modal=$('#modal');modal.classList.add('cooking-dialog');
 const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=true;
 const remaining=()=>endAt===null?totalSeconds:Math.max(0,Math.ceil((endAt-performance.now())/1000));
 const renderGame=()=>{
  if(finished)return;
  const recipe=orders[orderIndex];
  const progress=recipe.steps.map((key,index)=>{const item=cookingStepCatalog[key];const cls=index<stepIndex?'done':index===stepIndex?'current':'';return `<span class="cooking-recipe-step ${cls}"><i>${item.icon}</i><small>${item.label}</small></span>`}).join('<b class="cooking-arrow">›</b>');
  $('#modalBody').innerHTML=`<div class="cooking-game"><div class="cooking-hud"><div><small>남은 시간</small><b id="cookingTime">${endAt===null?'대기':`${remaining()}초`}</b></div><div><small>완성 주문</small><b>${completed} / 3</b></div><div><small>실수</small><b>${mistakes}회</b></div></div><div class="cooking-timebar"><i id="cookingTimeFill" style="width:${Math.max(0,remaining()/totalSeconds*100)}%"></i></div><section class="cooking-ticket"><span>ORDER ${orderIndex+1} / 3</span><h3>${recipe.icon} ${recipe.name}</h3><p>${endAt===null?'스타트를 누르면 3초 카운트다운 후 영업을 시작합니다. 레시피 순서를 미리 확인하세요.':locked?'다음 주문을 준비하고 있습니다.':'레시피 순서대로 재료와 조리 버튼을 빠르게 눌러 주세요.'}</p><div class="cooking-recipe">${progress}</div></section><div id="cookingTray" class="cooking-tray">${tray.map(key=>{const item=cookingStepCatalog[key];return `<button data-cooking-step="${key}" ${locked?'disabled':''}><i>${item.icon}</i><b>${item.label}</b></button>`}).join('')}</div><div class="cooking-tip">틀린 재료를 누르면 제한 시간이 2초 줄어듭니다.</div>${endAt===null?'<button id="startCookingGame" class="primary wide">스타트</button>':''}<button id="skipCookingGame" class="cooking-skip" ${locked?'disabled':''}>미니게임 건너뛰고 평범하게 먹기</button></div>`;
  $$('[data-cooking-step]').forEach(button=>button.onclick=()=>selectStep(button.dataset.cookingStep));
  const startButton=$('#startCookingGame');if(startButton)startButton.onclick=()=>{if(finished||countdownCancel||endAt!==null)return;startButton.disabled=true;startButton.textContent='준비 중...';countdownCancel=runCookingCountdown(()=>{countdownCancel=null;if(finished)return;locked=false;endAt=performance.now()+totalSeconds*1000;renderGame();timer=setInterval(updateClock,250)})};
  $('#skipCookingGame').onclick=()=>finish('skip');
 };
 const updateClock=()=>{
  const time=$('#cookingTime'),fill=$('#cookingTimeFill'),left=remaining();
  if(time)time.textContent=`${left}초`;if(fill)fill.style.width=`${Math.max(0,left/totalSeconds*100)}%`;
  if(left<=0)finish('timeout');
 };
 const selectStep=key=>{
  if(finished||locked)return;
  const recipe=orders[orderIndex],expected=recipe.steps[stepIndex];
  if(key!==expected){mistakes++;endAt-=2000;playSfx('fail');const trayEl=$('#cookingTray');trayEl?.classList.remove('wrong');void trayEl?.offsetWidth;trayEl?.classList.add('wrong');toast(`순서가 달라요! 다음은 ${cookingStepCatalog[expected].label}`);updateClock();return}
  stepIndex++;
  if(stepIndex<recipe.steps.length){renderGame();return}
  completed++;locked=true;playSfx('success');
  if(completed>=3&&timer){clearInterval(timer);timer=null}
  const ticket=$('.cooking-ticket');ticket?.classList.add('complete');
  setTimeout(()=>{if(finished)return;if(completed>=3){finish('complete');return}orderIndex++;stepIndex=0;tray=cookingTrayFor(orders[orderIndex]);locked=false;renderGame()},420);
 };
 const finish=mode=>{
  if(finished)return;finished=true;if(timer)clearInterval(timer);if(countdownCancel)countdownCancel();countdownCancel=null;
  endMiniGameUi();activeTrainingAbort=null;
  modal.classList.remove('cooking-dialog');if(closeButton)closeButton.hidden=false;closeModal(true);
  let bonus=0,stressDelta=0,title='평범한 한 끼',summary='미니게임을 건너뛰고 천천히 식사를 마쳤다.';
  if(mode==='complete'){
   if(mistakes===0){bonus=6;stressDelta=-4;title='완벽한 주방장';summary='세 주문을 한 번도 틀리지 않고 완성했다. 좁은 자취방이 잠시 유명 식당처럼 느껴졌다.'}
   else{bonus=4;stressDelta=-3;title='요리 타이쿤 성공';summary=`실수 ${mistakes}회가 있었지만 세 주문을 제한 시간 안에 모두 완성했다.`}
  }else if(mode==='timeout'){
   if(completed>=2){bonus=2;stressDelta=-2;title='아슬아슬한 영업 종료';summary='두 접시를 완성한 순간 타이머가 울렸다. 마지막 요리는 조금 급했지만 먹을 만했다.'}
   else if(completed===1){bonus=0;stressDelta=-1;title='한 접시는 성공';summary='한 접시는 제대로 완성했고 나머지는 한 냄비에 적당히 정리했다.'}
   else{bonus=-3;stressDelta=2;title='주방 대혼란';summary='재료 순서가 완전히 꼬였다. 모양은 수상했지만 버리기 아까워 끝까지 먹었다.'}
  }
  const hpGain=Math.max(5,baseGain+bonus);stat('hp',hpGain);if(stressDelta)stat('stress',stressDelta);
  state.minigames.cookingPlayed=(state.minigames.cookingPlayed||0)+1;
  state.minigames.cookingBest=Math.max(state.minigames.cookingBest||0,completed);
  if(mode==='complete'&&mistakes===0)state.minigames.cookingPerfect=(state.minigames.cookingPerfect||0)+1;
  addHistory(`🍳 요리 타이쿤 · ${title} · 주문 ${completed}/3 · 실수 ${mistakes}회`,`cooking:${state.day}:${state.items.mealsToday}`);
  state.dialogue={name:'류현상',text:`${summary} ${housingInfo[state.housing][0]} 생활비 기준으로 ${cost.toLocaleString()}원을 사용했고 체력 ${hpGain}을 회복했다. 식사에는 시간이 지나지 않는다.`};
  save(false);render();const changes=describeActionResult(before);if(changes)appendStatChangesToDialogue(changes);
  blockingNoticeActive=true;showModal(`요리 결과 · ${title}`,`<div class="cooking-result"><span>${mode==='complete'?'🏆':completed>=2?'🍽️':completed===1?'🥣':'💨'}</span><h3>주문 ${completed} / 3 완성</h3><p>${summary}</p><div><b>체력 +${hpGain}</b>${stressDelta?`<b>스트레스 ${stressDelta>0?'+':''}${stressDelta}</b>`:''}<b>실수 ${mistakes}회</b></div><small>최고 기록 ${state.minigames.cookingBest}/3 · 무실수 완주 ${state.minigames.cookingPerfect}회</small><button id="cookingResultConfirm" class="primary wide">확인</button></div>`,'cooking');
  const resultClose=$('#closeModal');if(resultClose)resultClose.hidden=true;
  $('#cookingResultConfirm').onclick=()=>{blockingNoticeActive=false;if(resultClose)resultClose.hidden=false;closeModal(true)};
 };
 activeTrainingAbort=()=>finish('skip');
 renderGame();
}
const equipmentCatalog={
 mic:{
  usedMic:{name:'중고 마이크',price:100000,durability:10,income:1.02},
  wiredMic:{name:'유선 마이크',price:500000,durability:20,income:1.06},
  wirelessMic:{name:'무선 마이크',price:1000000,durability:30,income:1.10},
  customMic:{name:'커스텀 마이크',price:2500000,durability:40,income:1.15}
 },
 amp:{
  entryAmp:{name:'입문용 앰프',price:300000,durability:10,income:1.02},
  smallSound:{name:'소규모 음향기기',price:1000000,durability:25,income:1.07},
  largeSound:{name:'대규모 음향기기',price:3000000,durability:40,income:1.12}
 }
};
function equipmentBreakCheck(){return ''}
function equipmentMaxDurability(key){if(key==='battery')return 50;const model=state.equipmentModel?.[key];return model&&equipmentCatalog[key]?.[model]?equipmentCatalog[key][model].durability:0}
function equipmentNameText(key){if(key==='battery')return state.equipment.battery?'방수·전원 보호케이스':'미보유';const model=state.equipmentModel?.[key];return model&&equipmentCatalog[key]?.[model]?equipmentCatalog[key][model].name:'미보유'}
function equipmentDurabilityText(key){if(!state.equipment[key])return '미보유';return `${Math.max(0,Number(state.equipmentDurability?.[key])||0)}/${equipmentMaxDurability(key)}`}
function equipmentStatusText(key){return state.equipment[key]?`${equipmentNameText(key)} ${equipmentDurabilityText(key)}`:'미보유'}
function buskingGearIncomeMultiplier(){
 const mic=state.equipmentModel?.mic;
 const amp=state.equipmentModel?.amp;
 const micBonus=equipmentCatalog.mic?.[mic]?.income||1;
 const ampBonus=equipmentCatalog.amp?.[amp]?.income||1;
 return Number((micBonus*ampBonus).toFixed(3));
}
function concertRequirementMet(){return fameLevel()>=15&&state.stats.fans>=5000&&state.stats.vocal>=70}
function concertRequirementText(){return '공연은 인지도 Lv.15, 팬 5,000명, 보컬 70 이상이 필요합니다.'}
function consumeBuskingEquipment(){
 const expired=[];const notes=[];
 if(state.equipment.battery&&state.equipmentDurability.battery>0){
  state.equipmentDurability.battery=Math.max(0,state.equipmentDurability.battery-1);
  notes.push(` 보호 케이스가 장비 내구도 소모를 막았다. 보호 횟수 ${equipmentDurabilityText('battery')}.`);
  if(state.equipmentDurability.battery<=0){state.equipment.battery=false;notes.push(' 방수·전원 보호케이스의 50회 보호 횟수를 모두 사용해 사라졌다.');addHistory('🧰 보호 케이스 소모 · 50회 보호 횟수를 모두 사용했다.',`case-expired:${state.day}`)}
  return notes.join('');
 }
 const multiplier=Math.random()<.1?2:1;
 for(const [key,label] of [['mic','마이크'],['amp','음향장비']]){
  if(!state.equipment[key])continue;
  state.equipmentDurability[key]=Math.max(0,(Number(state.equipmentDurability[key])||equipmentMaxDurability(key))-multiplier);
  if(state.equipmentDurability[key]<=0){state.equipment[key]=false;state.equipmentModel[key]=null;expired.push(label)}
 }
 if(multiplier===2)notes.push(' 보호 케이스가 없어 10% 확률의 장비 충격이 발생해 내구도가 2씩 소모됐다.');
 else notes.push(' 마이크와 음향장비 내구도가 1씩 소모됐다.');
 if(expired.length){const message=`${expired.join('와 ')}의 내구도를 모두 사용해 장비가 사라졌습니다.`;addHistory(`🎙 장비 소모 · ${message}`,`gear-expired:${state.day}:${expired.join('-')}`);notes.push(` ${message}`)}
 return notes.join('');
}
function moveHome(){
 if(debtBlocked('이사'))return;
 if(state.housing>=housingInfo.length-1)return toast('이미 펜트하우스에 살고 있습니다.');
 const next=housingInfo[state.housing+1];
 const current=housingInfo[state.housing];
 if(state.stats.money<next[1])return toast(`${next[0]} 이사 비용 ${next[1].toLocaleString()}원이 필요합니다.`);
 const remain=state.stats.money-next[1];
 showModal('이사를 하시겠습니까?',`<div class="info-card move-confirm-card"><p>현재 집 <b>${current[0]}</b>에서 <b>${next[0]}</b>으로 이사합니다.</p><p>이사 비용 <strong>${next[1].toLocaleString()}원</strong></p><p>이사 후 보유금 <strong>${remain.toLocaleString()}원</strong></p><small>‘네’를 선택해야 비용이 결제되고 시간이 1칸 진행됩니다.</small></div><div class="result-actions"><button id="moveHomeNo">아니오</button><button id="moveHomeYes" class="primary">네</button></div>`);
 const no=$('#moveHomeNo'),yes=$('#moveHomeYes');
 if(no)no.onclick=()=>closeModal();
 if(yes)yes.onclick=()=>{
  if(state.housing>=housingInfo.length-1){closeModal();return toast('이미 펜트하우스에 살고 있습니다.')}
  const confirmedNext=housingInfo[state.housing+1];
  if(state.stats.money<confirmedNext[1]){closeModal();return toast(`${confirmedNext[0]} 이사 비용 ${confirmedNext[1].toLocaleString()}원이 필요합니다.`)}
  const before=snapshotActionResult();
  stat('money',-confirmedNext[1]);state.housing++;
  addHistory(`🏠 주거 업그레이드 · ${confirmedNext[0]}에 새 보금자리를 마련했다.`);
  closeModal();
  showDialogue('류현상',`${confirmedNext[0]}으로 이사했다. 이제 깊은 휴식은 체력 ${restAmount()}, 식사는 ${mealCost().toLocaleString()}원에 체력 ${mealRecovery()}을 회복한다.`);
  save(false);advance(1);scheduleActionResultNotice(before)
 }
}
function forcedRestConditionMet(){
 const stress=Number(state.stats?.stress)||0;
 const hp=Number(state.stats?.hp)||0;
 return stress>=50&&hp<=15
}
function forcedRestChance(){
 if(!forcedRestConditionMet())return 0;
 const stress=Number(state.stats.stress)||0;
 const hp=Number(state.stats.hp)||0;
 const stressBonus=Math.max(0,stress-50)*.008;
 const hpBonus=Math.max(0,15-hp)*.025;
 return Math.min(.95,.30+stressBonus+hpBonus)
}
function runPostAdvanceEvents(source='action',crossedDay=false){
 if(maybeLotteryResult())return;
 const storyStarted=maybeStoryEvent(source);
 if(!storyStarted&&crossedDay&&state.narrative?.lastMajorEventDay!==state.day)randomEvent()
}
function finishDeferredPostAdvance(){
 const pending=deferredPostAdvance;deferredPostAdvance=null;
 if(!pending)return;
 if(pending.drawerDiscovery){drawerDiscoveryNotice(pending.drawerDiscovery,()=>setTimeout(()=>runPostAdvanceEvents(pending.source,pending.crossedDay),120));return}
 setTimeout(()=>runPostAdvanceEvents(pending.source,pending.crossedDay),120)
}
function advance(hours=1,source='action'){
 if(source==='action'&&pendingLocationActionStress){stat('stress',1);pendingLocationActionStress=false}
 let crossedDay=false;
 state.time+=hours;
 while(state.time>=4){state.time-=4;state.day++;dailyTick(false);crossedDay=true}
 const chance=forcedRestChance();
 const forcedRestHp=Number(state.stats.hp)||0;
 const forcedRestStress=Number(state.stats.stress)||0;
 const canForce=!['forcedRest','gambling'].includes(source)&&state.lastAction!=='rest'&&forcedRestConditionMet()&&chance>0&&state.forcedRest.lastTriggeredDay!==state.day;
 if(canForce&&forcedRestConditionMet()&&Math.random()<chance){
  const triggerDay=state.day;
  const triggerHp=forcedRestHp;
  const triggerStress=forcedRestStress;
  state.forcedRest.count++;
  state.forcedRest.lastTriggeredDay=triggerDay;
  stat('hp',30);stat('stress',-15);
  state.time+=4;
  while(state.time>=4){state.time-=4;state.day++;dailyTick(false);crossedDay=true}
  addHistory(`🛌 강제 휴식 · 발생 직전 체력 ${triggerHp}, 스트레스 ${triggerStress} · 하루를 쉬었다. 발생 확률 ${Math.round(chance*100)}%`,`forced-rest:${triggerDay}:${state.forcedRest.count}`);
  state.dialogue={name:'나레이션',text:`체력 ${triggerHp}, 스트레스 ${triggerStress} 상태에서 몸에 무리가 왔다. 류현상은 예정된 일정을 모두 취소하고 하루 동안 강제로 쉬었다.`};
  save(false);render();checkProgress();
  showModal('강제 휴식',`<div class="info-card"><b>체력 15 이하와 스트레스 50 이상 조건이 동시에 충족되었습니다.</b><p>발생 직전: 체력 <strong>${triggerHp}</strong> · 스트레스 <strong>${triggerStress}</strong></p><p>강제 휴식 후: 체력 <strong>${state.stats.hp}</strong> · 스트레스 <strong>${state.stats.stress}</strong></p><small>강제 휴식 후 표시되는 체력은 휴식 회복과 다음 날 자연 회복이 반영된 수치입니다.</small><button id="forcedRestConfirm" class="primary wide">확인</button></div>`);
  const confirm=$('#forcedRestConfirm');if(confirm)confirm.onclick=()=>{closeModal();render();setTimeout(()=>runPostAdvanceEvents('forcedRest',true),180)};
  return
 }
 const drawerDiscovery=rollDrawerPhotoPiece(state.lastAction);
 save(false);render();checkProgress();
 if(['gambling','minigame'].includes(source)){deferredPostAdvance={source,crossedDay,drawerDiscovery};return}
 if(drawerDiscovery){drawerDiscoveryNotice(drawerDiscovery,()=>setTimeout(()=>runPostAdvanceEvents(source,crossedDay),180));return}
 setTimeout(()=>runPostAdvanceEvents(source,crossedDay),180)
}
function markDailyPractice(type){
 if(!['vocal','compose'].includes(type))return;
 state.dailyPractice=state.dailyPractice||{vocalDay:0,composeDay:0,vocalPenaltyCount:0,composePenaltyCount:0,penaltyInterval:7};
 const isVocal=type==='vocal';
 state.dailyPractice[isVocal?'vocalDay':'composeDay']=state.day;
 state.dailyPractice[isVocal?'vocalPenaltyCount':'composePenaltyCount']=0;
}
function applyDailyPracticePenalty(){
 const currentDay=state.day;
 if(currentDay<1)return;
 const rules=[
  ['vocal','vocalDay','vocalPenaltyCount','보컬'],
  ['compose','composeDay','composePenaltyCount','작곡']
 ];
 const lost=[];
 for(const [statKey,lastKey,countKey,label] of rules){
  const lastPractice=Math.max(0,Math.floor(Number(state.dailyPractice?.[lastKey])||0));
  const missedDays=Math.max(0,currentDay-lastPractice);
  const penaltyPeriods=Math.floor(missedDays/7);
  const appliedPeriods=Math.max(0,Math.floor(Number(state.dailyPractice?.[countKey])||0));
  const due=Math.max(0,penaltyPeriods-appliedPeriods);
  if(due<=0)continue;
  const penaltyAmount=due*2;
  const actual=Math.min(penaltyAmount,state.stats[statKey]);
  if(actual>0){stat(statKey,-actual);lost.push(`${label} -${actual}`)}
  state.dailyPractice[countKey]=penaltyPeriods;
 }
 if(lost.length){
  addHistory(`📅 7일 미훈련 감소 · ${lost.join(' / ')}`,`seven-day-practice:${state.day}:${lost.join('|')}`);
 }
}
function applyStyleDecay(){
 const interval=30;
 const lastDay=Math.max(1,Number(state.dailyUse?.styleCareLastDay)||state.day);
 const inactiveDays=Math.max(0,state.day-lastDay);
 const targetCount=Math.floor(inactiveDays/interval);
 const appliedCount=Math.max(0,Math.floor(Number(state.dailyUse?.styleDecayCount)||0));
 const due=Math.max(0,targetCount-appliedCount);
 if(due<=0)return;
 const actual=Math.min(due,Math.max(0,state.stats.looks));
 if(actual>0){
  stat('looks',-actual);
  addHistory(`💇 외모 관리 부족 · 헤어 스타일 관리를 ${inactiveDays}일 동안 하지 않아 외모 -${actual}`,`style-decay:${state.day}:${targetCount}`);
 }
 state.dailyUse.styleDecayCount=targetCount;
}
function styleCareCooldownRemaining(){
 const last=Number(state.dailyUse?.styleCareDay??-99);
 if(last<0)return 0;
 return Math.max(0,15-(state.day-last))
}
function dailyTick(allowRandom=true){applyDailyPracticePenalty();rollWeather();stat('hp',8);stat('stress',-4);state.items.bakcasUsedToday=0;state.items.mealsToday=0;state.items.bakcasBoughtToday=0;state.items.snacksBoughtToday=0;state.storeDaily.buskingDay=state.day;state.storeDaily.buskingCount=0;if(state.economy.lastWorkDay!==state.day-1)state.economy.workStreak=0;applyStyleDecay();updateCardCollectorQualification();if(state.day%30===0)chargeMonthlyUpkeep();return allowRandom?randomEvent():false}
function randomEvent(){
 if(Math.random()>.22)return false;
 const candidates=[
  {id:'daily-viral',title:'바이럴 영상',text:'어젯밤 버스킹 영상이 짧은 영상 플랫폼에서 화제가 됐다.',condition:()=>state.performanceCount>0,effect:()=>{stat('fans',15);stat('fame',12)}},
  {id:'daily-gear',title:'장비 고장',text:'앰프에서 갑자기 잡음이 나기 시작했다.',condition:()=>false,effect:()=>{}},
  {id:'daily-comment',title:'악성 댓글 확산',text:'외모만 믿고 노래한다는 댓글이 퍼지며 일부 팬이 구독을 취소했다.',condition:()=>state.stats.fans>=100,effect:()=>{stat('fans',-scaledFanLoss(.025,8,90));stat('stress',12)}},
  {id:'daily-cancel',title:'공연 지각 논란',text:'교통 문제로 무대 시작이 늦어졌고 기다리던 관객 일부가 실망했다.',condition:()=>state.stats.fans>=500&&state.career.totalConcerts>0,effect:()=>{stat('fans',-scaledFanLoss(.035,20,160));stat('fame',-5);stat('stress',8)}},
  {id:'daily-overwork',title:'무성의한 팬 응대',text:'지친 상태에서 팬에게 건넨 짧은 대답이 차갑게 편집되어 퍼졌다.',condition:()=>state.stats.fans>=800&&state.stats.stress>=60,effect:()=>{stat('fans',-scaledFanLoss(.045,30,220));stat('fame',-8);stat('stress',6)}},
  {id:'daily-singer',title:'유명 가수의 공유',text:'이전 버스킹 영상을 본 유명 가수가 SNS에 짧은 칭찬을 남겼다.',condition:()=>state.performanceCount>0,effect:()=>stat('fame',30)},
  {id:'daily-band',title:'멤버 갈등',text:'최근 솔로 활동이 이어지자 멤버들이 서운함을 드러냈다.',condition:()=>state.band.formed&&state.soloStreak>=2,effect:()=>{state.band.bond=clamp(state.band.bond-14)}}
 ];
 const pool=candidates.filter(x=>x.condition());if(!pool.length)return false;
 const e=pick(pool),before=snapshotStats();e.effect();const changes=describeStatChanges(before);
 showDialogue('돌발 사건',dialogueWithStatChanges(`${e.title} — ${e.text}`,changes));playSfx('event');
 addHistory(`⚡ 돌발 사건 · ${e.title}`,`random:${e.id}`);
 $('#eventBadge').classList.remove('hidden');setTimeout(()=>$('#eventBadge').classList.add('hidden'),2500);
 return true;
}
function memberLeave(){const keys=Object.keys(state.band.members).filter(k=>state.band.members[k]);if(!keys.length)return '';const k=pick(keys),n=state.band.members[k];state.band.members[k]=null;state.band.formed=false;state.band.bond=35;state.soloStreak=0;addHistory(`🎸 밴드 이탈 · ${n}이(가) 팀을 떠났다.`);return `${n}이(가) 반복되는 솔로 활동에 서운함을 느껴 밴드를 떠났다.`}
function setChoiceLock(locked){
 choiceLock=!!locked;
 const screen=$('#gameScreen');if(screen)screen.classList.toggle('choice-lock',choiceLock);
 if(choiceLock){const menu=$('#menuBtn');if(menu)menu.title='선택지를 고르기 전에는 수동 저장과 타이틀 이동만 가능합니다.'}
}
function managerSafeDialogue(name,text){
 if(state.manager.hired)return {name,text};
 let safeName=name;
 let safeText=String(text??'');
 if(safeName==='후라보노'||/후라보노/.test(safeName))safeName='주변 인물';
 safeText=safeText
  .replace(/후라보노가/g,'주변 스태프가')
  .replace(/후라보노는/g,'주변 스태프는')
  .replace(/후라보노에게/g,'지인에게')
  .replace(/후라보노와/g,'주변 사람과')
  .replace(/후라보노의/g,'주변 스태프의')
  .replace(/후라보노를/g,'주변 스태프를')
  .replace(/후라보노/g,'주변 스태프');
 return {name:safeName,text:safeText};
}
function syncDialogueScrollIndicator(){
 const box=$('#dialogueBox')||document.querySelector('.dialogue-box');
 const track=$('#dialogueScrollTrack'),thumb=$('#dialogueScrollThumb');
 if(!box||!track||!thumb)return;
 const overflow=box.scrollHeight>box.clientHeight+3;
 track.classList.toggle('hidden',!overflow);
 if(!overflow)return;
 const wrap=box.closest('.dialogue-wrap');
 if(wrap){
  const boxRect=box.getBoundingClientRect(),wrapRect=wrap.getBoundingClientRect();
  track.style.top=`${Math.max(0,boxRect.top-wrapRect.top+5)}px`;
  track.style.height=`${Math.max(28,boxRect.height-10)}px`;
 }
 const trackHeight=Math.max(28,track.clientHeight||box.clientHeight-10);
 const thumbHeight=Math.max(16,Math.min(trackHeight-2,trackHeight*(box.clientHeight/Math.max(box.scrollHeight,1))));
 const maxScroll=Math.max(1,box.scrollHeight-box.clientHeight);
 const maxTravel=Math.max(0,trackHeight-thumbHeight-2);
 const top=1+(box.scrollTop/maxScroll)*maxTravel;
 thumb.style.height=`${thumbHeight}px`;
 thumb.style.transform=`translateY(${top}px)`;
 track.classList.toggle('at-end',box.scrollTop>=maxScroll-2);
}
function setupDialogueScrollIndicator(){
 const box=$('#dialogueBox')||document.querySelector('.dialogue-box');
 if(!box||box.dataset.scrollIndicatorBound)return;
 box.dataset.scrollIndicatorBound='1';
 box.addEventListener('scroll',syncDialogueScrollIndicator,{passive:true});
 window.addEventListener('resize',syncDialogueScrollIndicator,{passive:true});
 if(window.ResizeObserver){
  const observer=new ResizeObserver(()=>syncDialogueScrollIndicator());
  observer.observe(box);
  const text=$('#dialogueText');if(text)observer.observe(text);
 }
}
function resetDialogueScroll(){
 const box=$('#dialogueBox')||document.querySelector('.dialogue-box');
 if(!box)return;
 box.scrollTop=0;
 syncDialogueScrollIndicator();
 requestAnimationFrame(()=>{if(box.isConnected){box.scrollTop=0;syncDialogueScrollIndicator()}});
 setTimeout(()=>{if(box.isConnected){box.scrollTop=0;syncDialogueScrollIndicator()}},0);
}
let choiceModalSerial=0;
function closeChoiceModal(){
 const modal=$('#choiceModal');
 if(modal?.open)modal.close();
}
function openChoiceModal(title,context,entries,onPick){
 const modal=$('#choiceModal'),titleEl=$('#choiceModalTitle'),contextEl=$('#choiceModalContext'),buttons=$('#choiceModalButtons');
 if(!modal||!buttons)return;
 const serial=++choiceModalSerial;
 if(modal.open)modal.close();
 titleEl.textContent=title||'어떻게 할까?';
 contextEl.textContent=context||'대화를 읽은 뒤 선택해 주세요.';
 buttons.innerHTML='';
 entries.forEach((entry,index)=>{
  const button=document.createElement('button');
  button.textContent=entry[0];
  button.onclick=()=>{
   if(serial!==choiceModalSerial)return;
   [...buttons.querySelectorAll('button')].forEach(x=>x.disabled=true);
   modal.close();
   onPick(entry,index);
  };
  buttons.appendChild(button);
 });
 if(!modal.dataset.boundCancel){
  modal.dataset.boundCancel='1';
  modal.addEventListener('cancel',event=>event.preventDefault());
 }
 modal.showModal();
 requestAnimationFrame(()=>buttons.querySelector('button')?.focus());
}
function displayDialogue(name,text,choices=[]){
 const safe=managerSafeDialogue(name,text);name=safe.name;text=safe.text;
 const wrap=$('#characterWrap'),art=$('#characterArt'),box=$('#dialogueBox')||document.querySelector('.dialogue-box'),plate=$('#speakerName');
 plate.textContent=name;$('#dialogueText').textContent=text;
 const dialogueWrap=document.querySelector('.dialogue-wrap');
 if(dialogueWrap)dialogueWrap.classList.toggle('manager-dialogue-theme',name==='후라보노');
 const isManager=state.manager.hired&&name==='후라보노';const src=isManager?'assets/images/hurabono.png':outfitImage();
 if(art.getAttribute('src')!==src){art.setAttribute('src',src);wrap.classList.add('speaker-enter');$('#scene').classList.add('character-switch');setTimeout(()=>{wrap.classList.remove('speaker-enter');$('#scene').classList.remove('character-switch')},560)}
 wrap.classList.toggle('manager-mode',isManager);art.alt=isManager?'후라보노':'류현상';
 box.classList.remove('dialogue-pop');plate.classList.remove('speaker-pop');void box.offsetWidth;box.classList.add('dialogue-pop');plate.classList.add('speaker-pop');
 const area=$('#choiceArea');area.innerHTML='';area.classList.toggle('hidden',!choices.length);setChoiceLock(choices.length>0);
 if(choices.length){
  const trigger=document.createElement('button');
  trigger.className='primary choice-trigger';
  trigger.textContent=`선택하기 · ${choices.length}가지`;
  trigger.onclick=()=>openChoiceModal('어떻게 할까?',`${name}의 다음 행동을 선택해 주세요.`,choices,(choice)=>{
   area.classList.add('hidden');setChoiceLock(false);
   try{
    const before=snapshotStats();
    const result=choice[1]();
    const changes=describeStatChanges(before);
    const resultText=result&&result.text?result.text:(typeof result==='string'?result:'선택을 마쳤다.');
    showDialogue(result&&result.name?result.name:name,dialogueWithStatChanges(resultText,changes));
    save(false);render();checkProgress();
   }catch(err){
    console.error(err);setChoiceLock(true);
    toast('이벤트 처리 중 오류가 발생했습니다.');
    area.classList.remove('hidden');
   }
  });
  area.appendChild(trigger);
 }
 setupDialogueScrollIndicator();
 resetDialogueScroll();
}
function showDialogue(name,text,choices=[]){state.dialogue={name,text};displayDialogue(name,text,choices)}
const motionLabels={drawer:'서랍',stockWork:'진열 보조',finance:'가계부',flyerPromo:'전단 홍보',audienceResearch:'관객 조사',stageRehearsal:'리허설',storePromo:'홍보 방송',customerPractice:'응대 연습',rest:'휴식',sleep:'SLEEP',compose:'작곡',vocal:'보컬',work:'ALBA',busking:'BUSKING',bandBusking:'BAND LIVE',rehearse:'합주',recruit:'멤버 영입',arrange:'편곡',audition:'오디션',concert:'LIVE',broadcast:'ON AIR',fanmeeting:'팬미팅',date:'DATE',walk:'산책',observe:'관찰',repair:'CHECK',meal:'식사',snack:'간식',buyBakcas:'박칵스',bakcas:'BOOST',digimonCard:'CARD',lottery:'LOTTO',acting:'ACTING'};
const motionClassMap={drawer:'rest',stockWork:'work',finance:'rest',flyerPromo:'walk',audienceResearch:'observe',stageRehearsal:'concert',rest:'rest',sleep:'sleep',compose:'compose',vocal:'vocal',work:'work',busking:'busking',bandBusking:'band',rehearse:'band',recruit:'band',arrange:'compose',audition:'audition',concert:'concert',broadcast:'concert',fanmeeting:'concert',date:'date',walk:'walk',observe:'observe',repair:'repair',meal:'rest',snack:'rest',buyBakcas:'rest',bakcas:'rest',digimonCard:'rest',lottery:'rest',acting:'concert'};
function spawnMusicNotes(count=7){const layer=$('#musicNotes');if(!layer)return;for(let i=0;i<count;i++){const n=document.createElement('span');n.className='music-note';n.textContent=['♪','♫','♬'][Math.floor(Math.random()*3)];n.style.left=`${15+Math.random()*70}%`;n.style.setProperty('--drift',`${-70+Math.random()*140}px`);n.style.animationDelay=`${Math.random()*.45}s`;layer.appendChild(n);setTimeout(()=>n.remove(),3000)}}
function spawnAudienceLights(count=18){const layer=$('#audienceLights');if(!layer)return;layer.innerHTML='';for(let i=0;i<count;i++){const l=document.createElement('i');l.className='audience-light';l.style.left=`${3+Math.random()*94}%`;l.style.bottom=`${2+Math.random()*19}%`;l.style.animationDelay=`${Math.random()*1.5}s`;layer.appendChild(l)}setTimeout(()=>layer.innerHTML='',2800)}
function pulseScene(actionKey){const scene=$('#scene'),burst=$('#actionBurst'),wrap=$('#characterWrap');if(!scene||!burst)return;const motion=motionClassMap[actionKey]||'rest';scene.className=scene.className.replace(/\bmotion-[^\s]+/g,'').trim();void scene.offsetWidth;scene.classList.add(`motion-${motion}`);burst.textContent=motionLabels[actionKey]||'ACTION';burst.classList.remove('show');void burst.offsetWidth;burst.classList.add('show');wrap.classList.add('blink');setTimeout(()=>wrap.classList.remove('blink'),430);if(['busking','bandBusking','concert','audition','broadcast','fanmeeting'].includes(actionKey)){spawnMusicNotes(actionKey==='concert'?12:8);spawnAudienceLights(actionKey==='concert'?28:16)}clearTimeout(motionTimer);clearTimeout(burstTimer);motionTimer=setTimeout(()=>scene.className=scene.className.replace(/\bmotion-[^\s]+/g,'').trim(),1500);burstTimer=setTimeout(()=>burst.classList.remove('show'),1400)}
function bindScenePointer(){const scene=$('#scene');if(!scene||scene.dataset.boundMotion)return;scene.dataset.boundMotion='1';const move=e=>{const r=scene.getBoundingClientRect();const px=((e.clientX-r.left)/r.width)-.5;const py=((e.clientY-r.top)/r.height)-.5;scene.style.setProperty('--mouse-x',`${px*16}px`);scene.style.setProperty('--mouse-y',`${py*10}px`);scene.style.setProperty('--mouse-r',`${px*1.6}deg`)};scene.addEventListener('mousemove',move);scene.addEventListener('mouseleave',()=>{scene.style.setProperty('--mouse-x','0px');scene.style.setProperty('--mouse-y','0px');scene.style.setProperty('--mouse-r','0deg')});}

const twentyDayEpisodes=[
 {id:'day20-cardshop',day:20,title:'20일 에피소드 · 올해 운은 끝났다',history:'🃏 20일 에피소드 · 디지몬 카드샵에서 3만원어치를 샀다가 SEC 세 장을 뽑아 간신히 본전을 지켰다.',scenes:[
  ['나레이션','쉬는 날, 류현상은 모자를 깊게 눌러쓰고 디지몬 카드샵에 들어갔다. 구경만 하고 나올 생각이었다. 정말로 그랬다. 적어도 입구에서 “오늘 신팩 입고”라는 안내문을 보기 전까지는.'],
  ['류현상','진열장 앞에서 카드를 살피는데 뒤쪽에서 작은 웅성거림이 들렸다. “저 사람 버스킹하는 류현상 아니야?” 류현상은 카드 텍스트를 읽는 척했지만, 같은 줄을 네 번 읽고 있었다. 얼굴은 태연했지만 귀는 이미 모든 대화를 생중계 중이었다.'],
  ['나레이션','눈치가 보여 금방 나가려던 그는 직원에게 아주 무심한 척 말했다. “그냥… 3만원어치만 주세요.” 구경만 하겠다는 사람치고는 결제가 빨랐다. 봉투를 뜯을 때마다 주변 시선이 느껴져 표정 관리까지 해야 했다.'],
  ['나레이션','그런데 SEC 시크릿 카드가 한 장, 두 장, 그리고 세 장째 나왔다. SEC 확률은 1,728분의 1. 직원은 계산기를 두드렸고, 구경하던 손님들은 류현상보다 더 흥분했다. 카드를 정리해 보니 정확히 본전 정도였다.'],
  ['류현상','류현상은 카드 세 장을 슬리브에 넣으며 안도했다. “그래도 본전치기네.” 그리고 가게를 나서기 직전 아주 심각하게 중얼거렸다. “올해 운은 여기에 다 썼다.” 그날 이후 횡단보도도 평소보다 두 번 더 확인했다.'] ]},
 {id:'day40-classmate',day:40,title:'40일 에피소드 · 아는 척하지 않은 동창',history:'🎒 40일 에피소드 · 학창 시절 음악을 무시했던 동창을 관객석에서 발견했지만 서로 끝내 아는 척하지 않았다.',scenes:[
  ['나레이션','그날 버스킹은 시작 전부터 분위기가 달랐다. 평소보다 관객이 많았고 첫 곡이 끝나자 박수도 길게 이어졌다. 류현상은 속으로 “오늘은 좀 되는데?”라고 생각했지만 겉으로는 늘 하던 일처럼 안경만 고쳐 썼다.'],
  ['나레이션','세 번째 곡을 부르던 중 관객 사이에서 낯익은 얼굴이 보였다. 학창 시절, 류현상이 음악을 한다고 말할 때마다 “그걸로 먹고살 수 있냐”고 비웃던 같은 반 남자였다. 그 남자도 분명 류현상을 알아봤다. 눈이 마주친 순간 표정이 너무 정확하게 굳었다.'],
  ['류현상','류현상은 한 박자도 놓치지 않고 노래를 이어 갔다. 괜히 더 잘 부르고 싶다는 마음이 올라왔지만 티 내지 않으려 했다. 문제는 평소보다 고음을 20%쯤 더 오래 끌어 버렸다는 것이었다. 관객은 좋아했고 목은 약간 후회했다.'],
  ['나레이션','공연이 끝난 뒤 그 남자는 몇 번이나 다가오려다 멈췄다. 입 모양은 “야, 오랜만이다”쯤 되는 말을 준비하는 듯했다. 류현상도 그 모습을 봤지만 케이블을 정리하는 척 고개를 숙였다.'],
  ['류현상','둘은 끝내 아는 척하지 않았다. 남자는 아쉬운 얼굴로 떠났고, 류현상은 멀어지는 뒷모습을 보며 생각했다. “뭐… 굳이.” 그러면서도 그날 공연 영상을 평소보다 세 번 더 확인했다.'] ]},
 {id:'day60-formen',day:60,title:'60일 에피소드 · 포맨과 합동 공연',history:'🎤 60일 에피소드 · 포맨 노래를 부르다 실제 포맨과 즉석 합동 공연을 했고, 류현상은 속으로 자신이 더 잘했다고 꺼드럭댔다.',scenes:[
  ['나레이션','류현상은 버스킹 중 포맨의 노래를 부르고 있었다. 익숙한 발라드라 관객 반응도 좋았고, 그는 후렴을 향해 감정을 한껏 끌어올렸다. 그때 관객 뒤쪽이 이상하게 술렁이기 시작했다.'],
  ['관객','“어? 진짜 포맨 아니야?” 누군가의 말에 류현상은 가사를 부르면서도 눈동자만 아주 빠르게 움직였다. 실제 포맨 멤버가 우연히 공연을 보고 있었다. 노래를 멈추기에도, 모른 척하기에도 이미 늦은 상황이었다.'],
  ['나레이션','관객들의 요청에 즉석 합동 공연이 성사됐다. 류현상은 긴장하지 않은 척 마이크를 건넸지만 손가락에 힘이 잔뜩 들어가 있었다. 두 목소리가 겹치자 공원은 작은 콘서트장이 됐고, 휴대전화 카메라가 일제히 켜졌다.'],
  ['나레이션','공연은 성공적으로 끝났다. 포맨은 “노래 정말 잘하시네요”라고 인사했고 류현상도 예의 바르게 감사하다고 답했다. 여기까지는 완벽했다.'],
  ['류현상','그들이 떠난 뒤 류현상은 장비를 정리하며 아주 작게 중얼거렸다. “근데 오늘은 내가 조금 더 잘한 것 같은데.” 옆에 있던 관객이 들었는지 웃음을 터뜨렸다. 류현상은 못 들은 척 케이블을 평소보다 진지하게 감았다.'] ]},
 {id:'day80-retro-game',day:80,title:'80일 에피소드 · 레트로 게임기 선물',history:'🎮 80일 에피소드 · 버스킹 전 팬에게 레트로 게임 취향을 질문받았다.',scenes:[
  ['나레이션','버스킹 시작 전, 류현상이 마이크 선을 정리하고 있는데 한 팬이 작은 쇼핑백을 품에 안고 조심스럽게 다가왔다. 말을 걸고 싶지만 방해할까 봐 몇 걸음 앞에서 계속 멈칫거리고 있었다.'],
  ['팬','“현상 씨… 혹시 레트로 게임 좋아하세요?” 예상하지 못한 질문에 류현상은 마이크 높이를 맞추던 손을 멈췄다. 음악 장비 질문에는 준비된 답이 많았지만, 게임 취향 질문은 이상하게 더 신중해졌다.'] ],choices:[
   ['좋아한다',()=>{stat('stress',-2);return '류현상이 “네, 좋아하는 편이에요”라고 대답하자 팬의 얼굴이 환해졌다. “제가 게임기를 선물하고 싶어서요…” 쇼핑백 안에는 정성스럽게 포장된 레트로 게임기가 들어 있었다. 류현상은 공연 전부터 메뉴 화면을 켜 보고 싶은 충동을 참느라 평소보다 준비를 빨리 끝냈다. 스트레스가 2 감소했다.'}],
   ['싫어한다',()=>{return '류현상이 “게임은 별로 안 좋아합니다”라고 대답하자 팬은 쇼핑백을 등 뒤로 살짝 숨겼다. “레트로 게임 좋아하시면 선물하려 했는데…” 류현상은 그제야 쇼핑백 모양을 보고 게임기였다는 사실을 깨달았다. 이미 한 대답을 번복하기엔 자존심이 너무 빨리 고개를 들었다.'}]
  ]},
 {id:'day100-glasses',day:100,title:'100일 에피소드 · 안경을 쓰고 옷 갈아입기',history:'👓 100일 에피소드 · 안경을 벗지 않고 옷을 갈아입다가 유일한 안경을 부러뜨렸다.',scenes:[
  ['나레이션','버스킹을 마치고 집에 돌아온 류현상은 현관에서부터 모든 동작이 귀찮았다. 신발을 벗는 것도, 장비를 내려놓는 것도, 안경을 벗어 케이스에 넣는 것도 전부 내일의 자신에게 맡기고 싶었다.'],
  ['나레이션','그는 안경을 쓴 채로 셔츠를 머리 위로 벗기 시작했다. 첫 번째 단추에서 이미 뭔가 잘못됐다는 느낌이 왔지만, 다시 입고 안경부터 벗는 과정이 더 귀찮았다. 류현상은 그대로 밀어붙였다.'],
  ['효과음','딱. 아주 작고 명확한 소리가 났다. 셔츠 밖으로 겨우 머리를 꺼낸 류현상의 얼굴에는 렌즈 한쪽이 비스듬히 매달려 있었다.'],
  ['류현상','그는 부러진 안경을 두 손으로 들고 한참 침묵했다. “안경 이거 하나뿐인데…” 그리고 현실을 받아들이기 싫은 사람처럼 중얼거렸다. “안경을 바꾸란 신의 계시인가…” 신은 아마 안경부터 벗으라고 했을 가능성이 더 컸다.'] ]},
 {id:'day120-bathhouse',day:120,title:'120일 에피소드 · 남탕의 비명',history:'♨️ 120일 에피소드 · 목욕탕에서 긴 머리 때문에 여성으로 오해받아 노인과 동시에 놀랐다.',scenes:[
  ['나레이션','오랜만에 목욕탕을 찾은 류현상은 익숙하게 남탕 문을 열었다. 머리를 높게 묶을까 잠시 고민했지만 귀찮아서 그대로 풀어 둔 채 수건만 어깨에 걸쳤다.'],
  ['나레이션','탕 안쪽에서 나오던 한 노인이 긴 머리만 보고 류현상을 여성으로 착각했다. 노인은 눈을 크게 뜨더니 목욕탕 전체가 울릴 정도로 “어어어!” 하고 비명을 질렀다.'],
  ['류현상','그 비명에 류현상도 똑같이 놀라 한 걸음 뒤로 물러났다. “왜, 왜 그러세요?” 두 사람의 목소리가 겹치면서 주변 사람들이 모두 고개를 돌렸다.'],
  ['노인','노인은 류현상의 얼굴과 남탕 표지판을 번갈아 본 뒤 연신 고개를 숙였다. “아이고, 미안해요. 머리가 길어서 내가 잘못 봤네.” 류현상도 얼떨결에 같이 사과했다. “아… 저도 놀라게 해서 죄송합니다.”'],
  ['나레이션','사과할 사람이 누구인지 애매한 채 상황은 끝났다. 류현상은 그날 탕 안에서 머리를 세 번이나 뒤로 넘겼고, 노인은 마주칠 때마다 미안한 표정으로 엄지를 들어 보였다.'] ]},
 {id:'day140-wrong-person',day:140,title:'140일 에피소드 · 뒤에서 부르면 생기는 일',history:'🚶 140일 에피소드 · 뒤에서 말을 건 남자가 류현상의 얼굴을 보고 사과하며 도망가자 모든 상황을 깨달았다.',scenes:[
  ['나레이션','류현상은 오랜만에 만난 친구와 길을 걷고 있었다. 친구가 최근 공연 이야기를 묻자 류현상은 “그냥 비슷하지”라고 말하면서도 조회수와 관객 수를 꽤 자세히 설명했다.'],
  ['남자','그때 뒤에서 낯선 남자가 급하게 다가오며 말했다. “저기요, 잠깐만요!” 목소리에는 반가움과 확신이 가득했다. 류현상은 무슨 일인가 싶어 긴 머리를 넘기며 뒤를 돌아봤다.'],
  ['나레이션','남자는 류현상의 얼굴을 확인한 순간 온몸이 굳었다. “아, 죄송합니다! 정말 죄송합니다!” 그는 사과를 세 번쯤 반복하더니 대답을 들을 틈도 없이 빠르게 멀어졌다.'],
  ['친구','친구는 상황을 이해하자마자 벽을 짚고 웃기 시작했다. 류현상은 한동안 아무 말 없이 남자가 사라진 방향을 바라봤다.'],
  ['류현상','몇 초 뒤, 류현상은 모든 것을 깨달았다. “아………” 친구는 그 한마디 때문에 더 크게 웃었고, 류현상은 그날 목적지에 도착할 때까지 앞만 보고 걸었다.'] ]},
 {id:'day160-old-couple',day:160,title:'160일 에피소드 · 눈 오는 날의 관객',history:'❄️ 160일 에피소드 · 눈 속에서 공연을 지켜본 노부부의 감사 인사를 듣고 매 곡 최선을 다하기로 다짐했다.',scenes:[
  ['나레이션','눈이 내리는 날에도 류현상은 공원에 장비를 펼쳤다. 손끝은 쉽게 굳었고 관객은 평소보다 적었다. 솔직히 말하면 그는 몇 곡만 채우고 빨리 집에 갈 생각이었다.'],
  ['나레이션','그런데 멀리 벤치에 앉은 노부부가 첫 곡부터 마지막 곡까지 자리를 지켰다. 눈이 어깨에 쌓이는데도 두 사람은 서로의 장갑 낀 손을 잡고 조용히 노래를 들었다.'],
  ['나레이션','공연이 끝난 뒤 류현상이 케이블을 정리하자 노부부가 천천히 다가왔다. “우리는 공연을 보러 갈 수 없는 형편인데, 이렇게 무료로 공연을 와줘서 너무 고마워요. 정말 즐거운 시간이었습니다.”'],
  ['류현상','류현상은 바로 대답하지 못했다. 오늘 자신은 추위와 관객 수만 생각하며 몇 곡을 대충 넘기려 했다. 그런데 그 노래들이 누군가에게는 오랫동안 기다린 공연이자 특별한 하루가 되어 있었다.'],
  ['나레이션','노부부가 떠난 뒤 그는 이미 정리한 마이크를 다시 한 번 바라봤다. 앞으로 관객이 한 명이든 백 명이든, 한 곡 한 곡 최선을 다하겠다고 마음먹었다. 눈은 계속 내렸지만 집으로 돌아가는 발걸음은 이상하게 가벼웠다.'] ]},
 {id:'day180-greeting',day:180,title:'180일 에피소드 · 모르는 사람과 아는 척하기',history:'🙇 180일 에피소드 · 누군지 모르는 사람의 인사에 순발력으로 반가운 척했지만 끝내 정체를 알아내지 못했다.',scenes:[
  ['나레이션','길을 걷던 류현상에게 한 사람이 아주 반갑게 다가왔다. 얼굴에는 오랜만에 친한 사람을 만난 확신이 가득했다. “아이고, 잘 지내셨어요?”'],
  ['류현상','류현상의 머릿속에서는 초고속 검색이 시작됐다. 학교 선배? 예전 회사 관계자? 편의점 단골? 공연장 스태프? 어떤 폴더에서도 일치하는 얼굴이 나오지 않았다.'],
  ['류현상','하지만 당황한 티를 내기엔 상대가 너무 반가워 보였다. 류현상은 사회성을 총동원해 환하게 웃는 척했다. “아~~ 예, 잘 지내시죠?” 평소 웃지 않던 사람이 억지로 웃자 오히려 더 수상해 보였다.'],
  ['나레이션','두 사람은 날씨와 건강과 “요즘 바쁘시죠” 같은 안전한 문장만 주고받았다. 상대도 이름을 부르지 않았고 류현상도 끝까지 호칭을 피했다. 묘한 심리전 끝에 인사는 무사히 끝났다.'],
  ['류현상','돌아서서 열 걸음쯤 걸은 뒤 류현상은 표정을 원래대로 되돌렸다. 그리고 조용히 중얼거렸다. “그래서 누구지…” 그는 그날 밤까지도 정답을 찾지 못했다.'] ]},
 {id:'day200-manager-mistake',day:200,title:'200일 에피소드 · 매니저시죠?',history:'🚗 200일 에피소드 · 행사 안내원이 류현상을 친구의 매니저로 착각해 친구에게 하루 종일 놀림받았다.',scenes:[
  ['나레이션','류현상은 친구와 함께 한 행사 현장에 도착했다. 친구가 초대받은 일정이었고 류현상은 그냥 동행한 것이었지만, 검은 셔츠와 긴 머리, 무표정한 얼굴 때문에 누구보다 현장 관계자처럼 보였다.'],
  ['안내원','주차 구역에서 안내원이 차 안을 들여다보며 정중하게 물었다. “매니저시죠?” 질문과 동시에 안내원의 시선은 정확히 류현상에게 향했다.'],
  ['나레이션','차 안에 짧은 침묵이 흘렀다. 친구는 류현상과 안내원을 번갈아 보더니 갑자기 박장대소했다. 류현상은 설명하려 입을 열었지만 웃음소리가 너무 커서 타이밍을 놓쳤다.'],
  ['친구','친구는 행사장에 들어간 뒤에도 “매니저님, 물 좀 부탁드립니다”, “매니저님, 다음 스케줄은요?”라며 계속 놀렸다. 주변 사람 몇 명은 진짜로 믿고 류현상에게 일정까지 물었다.'],
  ['류현상','류현상은 세 번째 질문부터 해명을 포기했다. “네, 다음 일정은 얘 입 다물게 하는 겁니다.” 친구는 그 말까지 재미있다며 더 웃었다. 그날 행사 사진에서 류현상은 누구보다 지쳐 보였다.'] ]}
];
function markMajorNarrativeEvent(){state.narrative=state.narrative||{lastMajorEventDay:-99,twentyDaySeen:[]};state.narrative.lastMajorEventDay=state.day}
function runTwentyDayEpisode(def){
 markMajorNarrativeEvent();state.narrative.twentyDaySeen.push(def.id);save(false);
 runLinearStory(def.title,def.scenes,()=>{
  addHistory(def.history,`episode:${def.id}`);save(false);render();
  if(def.choices?.length)showDialogue('팬',`【${def.title}】\n\n팬이 대답을 기다리고 있다.`,def.choices.map(([label,fn])=>[label,()=>{const result=fn();addHistory(`🎮 ${def.title} — ${label}`,`episode-choice:${def.id}`);return result}]))
  else{state.dialogue={name:'나레이션',text:`${def.title} 이야기가 끝났다.`};render()}
 })
}
function maybeTwentyDayEpisode(){
 const seen=new Set(state.narrative?.twentyDaySeen||[]);const def=twentyDayEpisodes.find(x=>state.day>=x.day&&!seen.has(x.id));
 if(!def)return false;runTwentyDayEpisode(def);return true
}
const arroganceScenes=[
 {title:'시청률은 내가 올리는 거지',text:'생방송 대기실. 제작진이 오늘 시청률이 걱정된다고 말하자 류현상이 안경을 고쳐 쓰며 말했다. “내가 나가면 알아서 오르겠지. 요즘 내 이름 검색량 봤어?”\n\n방 안이 잠시 조용해졌다. 후라보노가 큐시트를 접으며 끼어들었다. “형, 시청률은 방송국이 올리고 형은 음정이나 올리세요. 리허설에서 두 번째 후렴 반음 낮았습니다.”',choices:[['농담이었다고 수습한다',()=>{state.manager.bond=clamp(state.manager.bond+5);state.arrogance.lesson++;stat('stress',-2);return '류현상은 헛기침을 했다. “알아. 분위기 풀려고 한 말이야.” 후라보노는 무표정으로 대답했다. “분위기가 더 얼었습니다. 그래도 수습하려는 노력은 인정할게요.”'}],['틀린 말은 아니라고 버틴다',()=>{state.manager.bond=clamp(state.manager.bond-7);state.arrogance.lesson--;stat('stress',5);return '류현상은 팔짱을 끼고 끝까지 고개를 들었다. 후라보노는 큐시트에 크게 적었다. “오늘의 금지어: 내가 나가면.” 방송 직전까지 둘 사이에는 싸늘한 침묵이 흘렀다.'}]]},
 {title:'팬들이 나 보러 온 거잖아',text:'공연장 입구에 긴 줄이 생기자 류현상이 창밖을 보며 중얼거렸다. “저 사람들 전부 나 보러 온 거잖아. 이 정도면 입장할 때 내 사진에 절이라도 해야 하는 거 아니야?”\n\n후라보노가 물병을 건넸다. “형, 절은커녕 입장 지연 때문에 화나서 매표소를 찾는 중이에요. 그리고 팬은 형을 높이려고 오는 사람이 아니라 음악을 같이 들으려고 오는 사람입니다.”',choices:[['팬들에게 직접 사과한다',()=>{state.manager.bond=clamp(state.manager.bond+6);state.arrogance.lesson++;stat('fans',120);stat('fame',6);return '류현상은 예정 시간보다 늦어진 이유를 직접 설명하고 기다려 준 팬들에게 고개를 숙였다. 팬들은 그의 어색하지만 진심 어린 사과에 더 큰 박수를 보냈다.'}],['스타는 기다리게 하는 법이라고 말한다',()=>{state.manager.bond=clamp(state.manager.bond-9);state.arrogance.lesson--;stat('fans',-180);stat('fame',-5);return '후라보노는 즉시 마이크를 빼앗았다. “그 말 한 번 더 하면 오늘 공연 제목을 ‘초심 찾기’로 바꿀 겁니다.” 온라인에는 지각보다 류현상의 태도를 지적하는 글이 더 많이 올라왔다.'}]]},
 {title:'멤버들이 나를 따라와야지',text:'합주가 끝난 뒤 류현상은 녹음 파일을 들으며 말했다. “이제 내 인지도가 이 정도인데 멤버들이 내 수준을 따라오려면 좀 더 연습해야겠어.”\n\nB군이 기타 줄을 닦던 손을 멈추고 ‘현상아, 그 말은 좀 아니다’라고 단호하게 말했다. L군도 웃음기를 거두고 류현상을 바라봤다. 후라보노가 재생 버튼을 다시 눌렀다. “형, 방금 두 번째 마디 박자 놓친 사람이 누구인지 같이 들어볼까요?”',choices:[['내 실수부터 인정한다',()=>{state.manager.bond=clamp(state.manager.bond+5);state.band.bond=clamp(state.band.bond+8);state.arrogance.lesson++;gainSkill('vocal',1,'event');return '류현상은 문제의 마디를 세 번 다시 들은 뒤 짧게 사과했다. “내가 틀렸네. 다시 맞춰 보자.” 멤버들의 굳었던 표정이 풀렸고, 합주는 한 시간 더 이어졌다.'}],['가수의 감각은 다르다고 우긴다',()=>{state.manager.bond=clamp(state.manager.bond-6);state.band.bond=clamp(state.band.bond-12);state.arrogance.lesson--;stat('stress',7);return 'L군이 조심스럽게 웃으며 말했다. “형, 그건 가수의 감각보다 그냥 박자 문제 같은데요?” 후라보노는 고개를 끄덕였다. 그날 합주는 평소보다 일찍 끝났고, 단체 채팅방은 밤까지 조용했다.'}]]},
 {title:'편의점도 이제 날 알아봐야지',text:'오랜만에 편의점에 들른 류현상은 계산대 직원이 자신을 알아보지 못하자 작게 투덜거렸다. “인지도 레벨이 몇인데 아직도 멤버십 있으세요부터 묻네.”\n\n뒤에서 듣던 후라보노가 바로 말했다. “형, 인지도 레벨은 주민등록증이 아닙니다. 그리고 멤버십은 있으시잖아요. 포인트 4,820점.”',choices:[['조용히 멤버십 바코드를 낸다',()=>{state.manager.bond=clamp(state.manager.bond+4);state.arrogance.lesson++;stat('stress',-3);return '류현상은 말없이 휴대전화를 내밀었다. 직원이 뒤늦게 그를 알아보고 놀라자 오히려 먼저 말했다. “편하게 계산해 주세요. 저도 그냥 손님입니다.” 후라보노는 작게 엄지를 들었다.'}],['사인을 먼저 해주겠다고 한다',()=>{state.manager.bond=clamp(state.manager.bond-5);state.arrogance.lesson--;stat('looks',-1);return '직원은 당황해서 영수증만 내밀었다. 후라보노가 류현상의 팔을 끌고 나오며 말했다. “요청받지 않은 사인은 낙서예요, 형.” 류현상은 집에 돌아갈 때까지 아무 말도 하지 않았다.'}]]},
 {title:'대기실은 더 큰 곳으로',text:'공연장 대기실이 좁고 소파가 낡아 있자 류현상이 미간을 찌푸렸다. “이제 내 급이면 최소한 단독 대기실에 소파도 가죽이어야 하는 거 아닌가?”\n\n후라보노는 방 안을 둘러본 뒤 침착하게 말했다. “형이 26살에 기획사 차렸을 때 첫 소속 가수에게 해 주고 싶었던 말이 그거였어요? 아니면 좋은 무대만 만들어 주면 된다고 했어요?” 류현상은 바로 대답하지 못했다.',choices:[['초심을 떠올리고 스태프를 돕는다',()=>{state.manager.bond=clamp(state.manager.bond+8);state.arrogance.lesson+=2;stat('fame',10);stat('stress',-5);return '류현상은 말없이 소매를 걷고 케이블 정리를 도왔다. 공연이 끝난 뒤 현장 스태프가 “요즘 보기 드문 가수”라며 고마워했고, 후라보노는 그제야 웃었다.'}],['성공했으니 대우도 달라야 한다고 한다',()=>{state.manager.bond=clamp(state.manager.bond-10);state.arrogance.lesson-=2;stat('fame',-12);stat('stress',8);return '후라보노는 요구 사항을 전달하는 대신 류현상을 복도로 불러냈다. “정당한 대우와 사람 무시하는 태도는 다릅니다.” 현장 분위기는 끝까지 불편했고, 공연 후 관계자 평가에도 태도 문제가 남았다.'}]]}
];
function maybeArroganceEvent(){
 const lv=fameLevel();
 if(lv<=30||!state.manager.hired)return false;
 if(state.day-state.arrogance.lastDay<5)return false;
 if(Math.random()>.18)return false;
 const scene=arroganceScenes[state.arrogance.count%arroganceScenes.length];
 state.arrogance.lastDay=state.day;state.arrogance.count++;
 playSfx('event');$('#eventBadge').classList.remove('hidden');setTimeout(()=>$('#eventBadge').classList.add('hidden'),2600);
 const choices=scene.choices.map(([label,fn])=>[label,()=>{const result=fn();addHistory(`🎭 후라보노 제지 · ${scene.title} — ${label}`);return result}]);showDialogue('돌발 스토리 · 후라보노',`【${scene.title}】\n\n${scene.text}`,choices);
 return true;
}
function pickContextual(pool){
 const source=pool||[];
 if(!source.length)return '';
 const safePool=source.filter(line=>{
  if(!state.manager.hired&&/후라보노/.test(line))return false;
  const members=state.band?.members||{};
  if(!members.guitar&&/B군/.test(line))return false;
  if(!members.bass&&/L군/.test(line))return false;
  if(!members.piano&&/J군/.test(line))return false;
  if(!members.drums&&/R군/.test(line))return false;
  return true;
 });
 // 모든 후보가 현재 고용·멤버 조건에 맞지 않으면 원본 후보로 되돌아가지 않는다.
 // 이전에는 이 폴백 때문에 깊은 휴식의 두 번째 문장에 미고용 후라보노가 다시 등장했다.
 return safePool.length?pick(safePool):'';
}
function maybeFanCommunityEvent(){
 if(state.stats.fans<300||state.day-state.cooldowns.fanEvent<7||Math.random()>=.10)return false;
 const events=[
  {min:300,title:'열혈 팬의 공연 지도',speaker:'열혈 팬',text:'초기 버스킹부터 공연 장소와 선곡을 정리해 온 팬이 직접 만든 지도를 보내왔다. “가수님이 어디서부터 여기까지 왔는지 잊지 않았으면 좋겠어요.”',gain:()=>{stat('fans',15);stat('stress',-5)}},
  {min:800,title:'게이 팬의 스타일 피드백',speaker:'게이 팬',text:'패션 일을 하는 한 팬이 무대 의상과 조명 조합을 정리한 긴 메시지를 보냈다. 성적 지향을 농담거리로 삼지 않고, 전문성과 애정으로 류현상의 무대를 돕는 팬이었다. “형의 매력은 숨기는 것보다 정확히 보여 주는 게 좋아요.”',gain:()=>{stat('looks',2);stat('fans',20)}},
  {min:1500,title:'해외 팬의 번역 계정',speaker:'해외 팬',text:'해외 팬들이 자발적으로 가사와 인터뷰를 번역하는 계정을 만들었다. 완벽하지 않은 번역도 있었지만, 노래의 감정을 전하려는 마음은 분명했다.',gain:()=>{stat('fans',40);stat('fame',25)}},
  {min:3000,title:'팬덤의 선행 프로젝트',speaker:'팬카페 운영진',text:'생일 광고 대신 류현상의 이름으로 유기동물 보호소에 기부하자는 제안이 올라왔다. 팬들은 가수의 이미지를 과장하기보다 좋은 영향력을 함께 만들고 싶다고 말했다.',gain:()=>{stat('fans',60);stat('fame',35);stat('stress',-4)}}
 ].filter(x=>state.stats.fans>=x.min);
 if(!events.length)return false;const ev=pick(events);state.cooldowns.fanEvent=state.day;const before=snapshotStats();ev.gain();addHistory(`👥 팬 커뮤니티 · ${ev.title}`,`fan:${state.day}:${ev.title}`);const changes=describeStatChanges(before);showDialogue(ev.speaker,dialogueWithStatChanges(`【${ev.title}】\n\n${ev.text}`,changes));return true;
}
function snsPostReward(ev){
 const currentFans=Math.max(0,Number(state.stats.fans)||0);
 const fanMultiplier=1+Math.min(1.5,Math.sqrt(currentFans)/300);
 const fameMultiplier=1+Math.min(.75,Math.sqrt(currentFans)/600);
 return {fans:Math.max(1,Math.round(ev.fans*fanMultiplier)),fame:Math.max(0,Math.round(ev.fame*fameMultiplier)),stress:ev.stress,fanMultiplier,fameMultiplier};
}
const snsScenarios=[
 {title:'연습실 15초 라이브',text:'완성되지 않은 후렴구 15초를 올렸다. 팬들은 짧은 영상 속 숨소리와 기타 소리까지 분석하며 정식 발매를 기다렸다.',fans:15,fame:8,stress:1},
 {title:'무표정 셀카 논쟁',text:'평소와 똑같은 무표정 셀카를 올렸는데 팬들은 “오늘은 입꼬리가 1mm 올라갔다”와 “아니다”로 진지하게 토론했다.',fans:10,fame:5,stress:-1},
 {title:'디지몬 진화 취향 공개',text:'좋아하는 진화 장면을 이야기하자 음악 계정이던 댓글창이 갑자기 디지몬 토론장이 됐다. 류현상은 평소보다 답글을 세 배나 많이 달았다.',fans:18,fame:7,stress:-3},
 {title:'새벽 가사 메모',text:'새벽에 쓴 가사 한 줄을 올렸다. 누군가는 이별을 예감했고 누군가는 다음 앨범의 세계관을 추리했다.',fans:12,fame:10,stress:2},
 {title:'팬아트 리그램',text:'해외 팬의 팬아트를 공유하며 짧게 “고맙습니다”라고 남겼다. 작가는 여러 언어로 축하를 받았고 번역 계정도 함께 성장했다.',fans:25,fame:15,stress:-2},
 {title:'음정 실수 밈',text:'라이브 중 음정이 살짝 흔들린 장면이 밈이 됐다. 숨기지 않고 본인이 좋아요를 누르자 오히려 반응이 부드러워졌다.',fans:20,fame:16,stress:1},
 {title:'너무 솔직한 장비 리뷰',text:'협찬이 아닌 장비에 대해 “좋긴 한데 이 가격이면 고민된다”고 솔직히 말했다. 신뢰는 올랐지만 브랜드 담당자는 조금 긴장했다.',fans:15,fame:12,stress:2},
 {title:'악플에 직접 답할 뻔한 밤',text:'악성 댓글에 긴 답글을 쓰다가 전송 직전에 지웠다. 매니저가 있다면 검토를 맡겼고, 없다면 휴대전화를 뒤집어 놓았다.',fans:3,fame:3,stress:state.manager.hired?-2:5},
 {title:'팬 추천곡 투표',text:'다음 버스킹 커버곡을 투표로 정했다. 예상과 전혀 다른 곡이 1위를 차지해 새 연습 과제가 생겼다.',fans:20,fame:9,stress:2},
 {title:'연습 실패 영상 공개',text:'완벽한 테이크 대신 웃으며 실패하는 장면을 올렸다. 팬들은 완벽함보다 실제 연습 과정을 볼 수 있어 좋다고 말했다.',fans:25,fame:14,stress:-1},
 {title:'공연 비하인드 사진',text:'조명 뒤에서 혼자 가사를 확인하는 사진이 올라왔다. 화려한 무대보다 준비하는 뒷모습이 더 오래 공유됐다.',fans:30,fame:20,stress:1},
 {title:'댓글 오해 소동',text:'짧게 쓴 “알겠습니다.”가 화난 말투로 오해받았다. 류현상은 결국 “화난 거 아닙니다. 원래 이렇습니다.”라고 해명했다.',fans:8,fame:8,stress:3}
];
function maybePassiveSnsEvent(){
 if(state.stats.fans<200||state.day-state.sns.lastEventDay<6||Math.random()>=.08)return false;
 const ev=pick(snsScenarios);state.sns.lastEventDay=state.day;const before=snapshotStats();stat('fans',ev.fans);stat('fame',ev.fame);stat('stress',ev.stress);addHistory(`📱 SNS · ${ev.title}`,`sns:${state.day}:${ev.title}`);const changes=describeStatChanges(before);showDialogue('SNS 반응',dialogueWithStatChanges(`【${ev.title}】\n\n${ev.text}`,changes));return true;
}
const rivalStories=[
 {lv:30,title:'첫 만남 — 카인',scenes:[['나레이션','오디션 대기실 한쪽에서 검은 단발의 남자가 조용히 이어폰을 빼고 있었다. 그는 최근 인디 신에서 이름이 오르기 시작한 싱어송라이터 카인이었다. 류현상과 비슷한 시기에 무대에 서기 시작했지만, 정돈된 이미지와 정확한 라이브로 먼저 주목받고 있었다.'],['카인','“류현상 씨죠? 버스킹 영상 봤습니다. 감정은 좋은데, 고음에서 힘으로 버티는 습관이 있더군요.” 칭찬인지 지적인지 모를 말투였다. 류현상은 표정이 굳었지만 틀린 말은 아니라는 걸 알았다.'],['류현상','“남의 영상 분석할 시간에 본인 노래나 더 하시죠.” 말은 까칠하게 나갔지만, 카인이 지적한 호흡 위치는 머릿속에 남았다. 카인은 기분 나빠하기보다 짧게 웃었다. “그 성격이면 오래 기억되긴 하겠네요.”'],['나레이션','둘은 같은 오디션 무대에 올랐다. 카인은 정교했고 류현상은 거칠지만 절박했다. 결과는 둘 다 다음 단계 진출. 경쟁은 아직 시작에 불과했지만, 서로의 이름은 분명하게 기억됐다.']]},
 {lv:45,title:'음악방송 복도',scenes:[['나레이션','첫 음악방송 리허설 날, 류현상은 복도에서 카인과 다시 마주쳤다. 카인의 무대는 실수 없이 끝났고 스태프들의 칭찬이 이어졌다. 류현상은 괜히 이어폰 볼륨을 높였다.'],['카인','“수원역 영상, 잘 봤습니다. 운이라고 말하는 사람도 있던데 운만으로 그 후렴을 끝까지 끌고 가진 못하죠.” 처음과 달리 노골적인 비꼼은 없었다. 대신 경쟁자를 인정하는 사람의 경계심이 느껴졌다.'],['류현상','“칭찬하려면 그냥 칭찬하세요. 사람 헷갈리게 하지 말고.” 카인은 잠시 웃더니 대답했다. “그럼 솔직히 말하죠. 다음 무대에서는 제가 더 잘할 겁니다.”'],['나레이션','그날 두 사람의 직캠은 나란히 올라왔다. 팬들은 누가 더 낫냐며 경쟁했지만, 류현상은 비교 댓글을 닫고 카인의 무대를 다시 보았다. 질투는 불편했지만 배울 점을 찾게 만드는 감정이기도 했다.']]},
 {lv:60,title:'합동 인터뷰의 불씨',scenes:[['기자','“두 분은 라이벌로 자주 언급됩니다. 서로에게 부족한 점을 하나씩 말해 주시겠어요?” 질문은 분명 논란을 만들기 위한 것이었다.'],['카인','카인은 잠시 생각한 뒤 말했다. “류현상 씨는 감정이 앞서서 무대를 위험하게 만들 때가 있습니다. 하지만 그 위험 때문에 사람들이 멈춰 보는 것도 사실입니다.”'],['류현상','류현상은 반박하려다 말을 골랐다. 사회성을 가지려고 노력하는 순간이었다. “카인은 너무 정확해서 가끔 사람이 아니라 기준표 같아요. 대신 무너지지 않는 법은 저보다 잘 압니다.”'],['나레이션','기사는 자극적인 제목으로 나갔지만 영상 전체를 본 팬들은 두 사람이 서로를 깎아내린 것이 아니라 정확히 이해하고 있다는 걸 알아차렸다. 라이벌 구도는 싸움보다 성장의 이야기로 바뀌기 시작했다.']]},
 {lv:75,title:'라이브 대결',scenes:[['나레이션','연말 특집 방송에서 두 사람은 같은 곡을 각자의 방식으로 편곡해 부르게 됐다. 제작진은 승자를 정하겠다고 했지만, 실제로 중요한 것은 누가 더 오래 기억될 무대를 만드는가였다.'],['카인','“오늘은 봐주지 않겠습니다.” 카인은 평소처럼 침착했지만 손끝에는 긴장이 보였다. 류현상은 그 모습을 보고 오히려 마음이 차분해졌다. 자신만 떨고 있는 게 아니었다.'],['류현상','“봐준 적도 없으면서.” 류현상은 밴드와 눈을 맞췄다. 완벽함으로 카인을 이길 수 없다면 자신의 상처와 실패를 숨기지 않는 무대를 만들기로 했다.'],['나레이션','카인의 무대는 완벽했고 류현상의 무대는 한 번 흔들렸지만 마지막 고음에서 관객 전체가 숨을 멈췄다. 투표 결과는 근소한 차이였다. 승패보다 두 무대가 함께 화제가 되며 두 사람 모두 더 큰 무대로 올라갔다.']]},
 {lv:90,title:'시상식 뒤편의 약속',scenes:[['나레이션','시상식 후보 발표 뒤, 류현상과 카인은 무대 뒤 비상계단에서 마주쳤다. 수많은 카메라와 팬덤 경쟁에서 벗어난 조용한 공간이었다.'],['카인','“처음엔 당신이 금방 사라질 줄 알았습니다. 감정만 앞서는 사람이라고 생각했어요. 그런데 계속 살아남더군요.”'],['류현상','“나도 당신이 재미없는 완벽주의자인 줄 알았어요. 지금도 절반은 맞는 것 같고.” 카인은 웃었고, 류현상도 아주 조금 웃었다.'],['나레이션','둘은 언젠가 경쟁이 아니라 공동 앨범으로 다시 만나자고 약속했다. 라이벌은 상대를 쓰러뜨리기 위한 존재가 아니라, 혼자였다면 도달하지 못할 높이를 보여 주는 사람이 되었다.']]}
];
function runLinearStory(title,scenes,onFinish){let page=0,finished=false;const draw=()=>{const [name,text]=scenes[page];showModal(title,`<div class="ending-story"><div class="ending-count">STORY · ${page+1} / ${scenes.length}</div><h3>${name}</h3><p>${text}</p><div class="ending-nav"><button id="linearPrev" ${page===0?'disabled':''}>이전 장면</button><button id="linearNext" class="primary">${page===scenes.length-1?'이야기를 마친다':'다음 장면'}</button></div></div>`);$('#linearPrev').onclick=()=>{if(page>0){page--;draw()}};$('#linearNext').onclick=()=>{if(finished)return;if(page<scenes.length-1){page++;draw();return}finished=true;closeModal();onFinish&&onFinish()}};draw()}
function maybeRivalStory(){const next=rivalStories[state.rival.stage];if(!next||fameLevel()<next.lv||state.day-state.rival.lastEventDay<5)return false;state.rival.met=true;runLinearStory(next.title,next.scenes,()=>{state.rival.stage++;state.rival.respect+=10;state.rival.lastEventDay=state.day;gainSkill('vocal',2,'rival');stat('fame',15);addHistory(`⚔️ 라이벌 카인 · ${next.title}`,`rival:${state.rival.stage}`);state.dialogue={name:'나레이션',text:'라이벌 스토리를 마쳤다.\n\n【수치 변화】 보컬 +2 · 인지도 +15'};save(false);render()});return true}
const restNightmareStories=[
 {id:'military',title:'다시 제대하는 꿈',text:'류현상은 이미 끝난 군 생활을 다시 시작한 듯한 꿈속에서 군복을 입고 연병장에 서 있었다. 멀리서 누군가 행사 출발 시간이 다 됐다고 외쳤지만, 몸은 생활관 밖으로 한 발짝도 움직이지 않았다.\n\n“아... 안 돼... 나 행사 가야 된단 말이야!!! 이렇게 갈 순 없어!”\n\n그 순간 군대 기상음이 귀를 찢을 듯 울렸고, 류현상은 이불을 걷어차며 벌떡 일어났다. 방 안은 조용했고 휴대전화 알람도 울리지 않았다.\n\n“너무 오래 잤나... 최악이다. 이런 꿈을 꾸네...”'},
 {id:'stalker',title:'창밖의 찰칵 소리',text:'자취방에서 깊이 잠들어 있던 류현상의 귓가에 희미한 소리가 반복해서 들렸다. 찰칵. 찰칵. 처음에는 빗소리라고 생각했지만 소리는 일정한 간격으로 창문 쪽에서 들려왔다.\n\n잠든 류현상의 모습을 누군가 창문 너머에서 계속 촬영하고 있었다. 인기척을 느낀 류현상이 무거운 눈을 겨우 떴을 때 창밖에는 아무도 없었고, 커튼만 가볍게 흔들리고 있었다.\n\n“으... 그만 자야겠다...”\n\n꿈이었다는 것을 알면서도 류현상은 한동안 창문을 제대로 바라보지 못했다.'},
 {id:'sleep-paralysis',title:'보컬 능력치가 떨어지는 소리',text:'류현상은 눈을 떴지만 손가락 하나 움직일 수 없었다. 침실 문 근처에 긴 머리의 누군가가 희미하게 서 있었다. 익숙한 실루엣처럼 보여 류현상은 떨리는 목소리로 간신히 중얼거렸다.\n\n“혹시... 김종서 선배님...?”\n\n희미한 형체가 점점 뚜렷해졌다. 하지만 그것은 사람이 아니었다. 긴 머리의 귀신이 찢어진 입으로 웃으며 침대 쪽으로 고개를 기울였다.\n\n“낄낄낄... 보컬 능력치 떨어지는 소리가 들린다, 들려...”\n\n류현상은 비명을 지르려다 목소리도 내지 못한 채 깨어났다. 가장 먼저 보컬 능력치부터 확인한 자신이 조금 한심했다.'}
];

function maybeRestLooksNightmare(source='action'){
 if(source!=='rest'||state.location!=='home')return false;
 state.specialEvents=state.specialEvents||{};
 if(state.specialEvents.restLooksNightmare)return false;
 if(Math.random()>=.05)return false;
 state.specialEvents.restLooksNightmare=true;
 save(false);
 beginSpecialScene('restLooksNightmare');
 const scenes=[
  {name:'나레이션',text:'깊은 휴식에 빠진 류현상은 어느새 방 안의 거울 앞에 서 있었다. 창밖은 한밤중인데도 방 안은 이상하게 밝았고, 거울 표면은 물결치듯 흔들리고 있었다.'},
  {name:'나레이션',text:'거울 속의 류현상은 점점 낯설어졌다. 턱선은 흐려지고 볼살은 둥글게 부풀었으며, 배는 셔츠 단추를 밀어 올릴 만큼 불러 있었다. 긴 머리는 제멋대로 뻗쳐 있었고 표정은 충격으로 굳어 갔다.'},
  {name:'류현상',text:'“이제 내 가수 활동 어떡하나… 나 얼굴로 먹고사는데…” 류현상은 거울 속 자신의 배를 붙잡고 새파랗게 질렸다. “아니, 목보다 먼저 얼굴이 무너지면 어떡해…”'},
  {name:'류현상',text:'“월드스타가 되려면 외모 관리도 해야 하는데… 정규앨범도 내야 하고, 팬도 10만은 모아야 하고, 인지도도 Lv.100은 찍어야 하고, 펜트하우스도 가야 하고, 보컬이랑 작곡도 95는 넘어야 하는데… 꿈인데도 너무 현실적이잖아!”'},
  {name:'나레이션',text:'그는 식은땀을 흘리며 눈을 떴다. 다행히 몸은 원래대로였다. 하지만 한동안 거울을 확인한 뒤에야 진정할 수 있었다. 류현상은 베개를 끌어안고 작게 중얼거렸다. “외모 관리… 해야겠네.”'}
 ];
 let page=0;
 const area=$('#choiceArea');
 const draw=()=>{
  const s=scenes[page];
  state.dialogue={name:s.name,text:s.text};
  render();
  area.innerHTML='';
  area.classList.remove('hidden');
  const prev=document.createElement('button');
  prev.textContent='이전 장면';
  prev.disabled=page===0;
  const next=document.createElement('button');
  next.className='primary';
  next.textContent=page===scenes.length-1?'꿈에서 깬다':'다음 장면';
  area.append(prev,next);
  prev.onclick=()=>{if(page>0){page--;draw()}};
  next.onclick=()=>{
   if(page<scenes.length-1){page++;draw();return}
   endSpecialScene();
   stat('stress',2);
   addHistory('😱 휴식 랜덤 이벤트 · 못생겨지고 뚱뚱해지는 꿈 · 스트레스 +2',`random:restLooksNightmare:${state.day}:${state.time}`);
   state.dialogue={name:'나레이션',text:'못생겨지고 뚱뚱해지는 꿈에서 깼다.\n\n【수치 변화】 스트레스 +2\n【월드스타 힌트】 정규앨범 · 외모 100 · 인지도 Lv.100 · 팬 100,000명 · 펜트하우스 · 보컬 95 · 작곡 95'};
   playSfx('event');
   save(false);
   render();
  };
 };
 playSfx('event');
 draw();
 return true;
}

function maybeRestNightmare(source='action'){
 if(source!=='rest'||state.location!=='home')return false;
 const data=state.restNightmares||(state.restNightmares={totalRests:0,lastTriggeredRest:0,seen:[]});
 if(data.totalRests<5)return false;
 if(data.totalRests-data.lastTriggeredRest<3)return false;
 if(Math.random()>=.20)return false;
 let available=restNightmareStories.filter(x=>!data.seen.includes(x.id));
 if(!available.length){data.seen=[];available=[...restNightmareStories]}
 const story=pick(available);data.seen.push(story.id);data.lastTriggeredRest=data.totalRests;
 stat('stress',2);markMajorNarrativeEvent();
 state.dialogue={name:'돌발 스토리',text:`【${story.title}】\n\n${story.text}`};
 addHistory(`🌙 과도한 휴식의 악몽 · ${story.title} · 스트레스 +2`,`rest-nightmare:${data.totalRests}:${story.id}`);
 playSfx('event');
 const badge=$('#eventBadge');if(badge){badge.textContent='악몽';badge.classList.remove('hidden');setTimeout(()=>{badge.classList.add('hidden');badge.textContent='돌발 사건'},2800)}
 save(false);render();
 return true;
}
function finishNoTimeSpecialEvent(key,history,text){state.specialEvents[key]=true;endSpecialScene();addHistory(history,`special:${key}`);state.dialogue={name:'나레이션',text};playSfx('success');save(false);render()}
function runHurabonoWeddingDayEvent(){
 const scenes=[
  {name:'나레이션',text:'후라보노의 축가 부탁과 청첩장 이야기가 모두 지나간 뒤, 마침내 결혼식 날이 찾아왔다. 류현상은 그날만큼은 공연도, 방송도, 연습 일정도 잡지 않았다. 평소라면 빈 시간에 무엇이라도 해야 마음이 놓였지만, 오늘은 오래 함께한 매니저의 가장 중요한 하루에만 집중하기로 했다.'},
  {name:'류현상',text:'검은 턱시도를 차려입고 식장에 도착한 류현상은 낯선 정장 차림의 후라보노를 한동안 바라봤다. 늘 큐시트와 휴대전화를 들고 뛰어다니던 사람이 오늘은 신랑 대기실 한가운데서 어색하게 웃고 있었다. “너도 이런 표정을 지을 줄 아네.” 짧은 말에 후라보노는 긴장이 조금 풀린 듯 웃었다.'},
  {name:'후라보노',text:'“형이 오늘 일정 진짜 다 비운 게 더 놀라운데요. 혹시 축가 끝나고 몰래 버스킹 가는 건 아니죠?” 류현상은 대답 대신 축가 악보를 들어 보였다. 여러 번 고쳐 쓴 흔적이 남은 악보였다. 후라보노는 장난스럽던 표정을 거두고 조용히 고개를 숙였다.'},
  {name:'나레이션',text:'예식이 시작되고 두 사람이 서로에게 약속을 전하는 동안, 류현상은 무대 뒤에서 마지막으로 호흡을 정리했다. 수많은 공연장을 경험했지만 오늘만큼은 첫 무대처럼 긴장됐다. 노래를 잘 부르는 것보다, 두 사람의 기억에 오래 남는 노래를 들려주는 일이 더 중요했기 때문이다.'},
  {name:'나레이션',text:'축가의 첫 소절이 시작되자 식장은 금세 조용해졌다. 류현상은 평소 무대처럼 관객을 압도하려 하지 않았다. 두 사람이 함께 버텨 온 시간과 앞으로 살아갈 날들을 생각하며 한 음 한 음 조심스럽게 불렀다. 후렴에 이르자 하객들의 박수와 환호가 자연스럽게 퍼졌고, 후라보노는 웃으면서도 눈가를 여러 번 훔쳤다.'},
  {name:'후라보노',text:'노래가 끝난 뒤 후라보노가 류현상의 손을 힘껏 잡았다. “형 덕분에 제 결혼식이 빛날 수 있었어요.” 수많은 일정과 사고를 함께 수습해 온 시간들이 그 짧은 문장 안에 모두 담겨 있었다.'},
  {name:'류현상',text:'류현상은 쑥스러운 듯 시선을 피하며 대답했다. “앞으로도 내 뒷치닥거리 잘 부탁해요.” 하객들이 웃음을 터뜨렸고, 후라보노도 울다가 결국 크게 웃었다. 감동적인 축하가 순식간에 평소 두 사람다운 대화로 돌아오는 순간이었다.'},
  {name:'나레이션',text:'예식이 끝난 뒤 류현상은 두 사람과 사진을 찍고 가장 늦게까지 자리를 지켰다. 무대 밖에서 누군가의 새로운 출발을 축하하는 일도 노래만큼 오래 남을 수 있다는 걸 알게 된 하루였다. 이날은 시간도 능력치도 변하지 않았지만, 두 사람의 관계에는 숫자로 표시할 수 없는 장면 하나가 더해졌다.'}
 ];
 beginSpecialScene('hurabonoWeddingDay');let page=0;const area=$('#choiceArea');const draw=()=>{const s=scenes[page];state.dialogue={name:s.name,text:s.text};render();area.innerHTML='';const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;const next=document.createElement('button');next.textContent=page===scenes.length-1?'결혼식 이야기를 마친다':'다음 장면';area.append(prev,next);area.classList.remove('hidden');prev.onclick=()=>{if(page>0){page--;draw()}};next.onclick=()=>{if(page<scenes.length-1){page++;draw();return}state.specialProgress.hurabonoWeddingDone=true;finishNoTimeSpecialEvent('hurabonoWeddingDay','💒 특별 이벤트 · 후라보노의 결혼식에서 축가를 불렀다.','후라보노의 결혼식이 끝났다. 오늘의 일정은 오직 결혼식만을 위해 비워 두었고 시간과 능력치는 변하지 않았다.')}};playSfx('event');draw();return true
}
function runCardCollectorSpecialEvent(){
 const scenes=[
  {name:'나레이션',text:'디지몬 카드를 오백 장 이상 모은 다음 날 저녁, 자취방 초인종이 여러 번 울렸다. 택배를 주문한 기억이 없던 류현상은 문을 반쯤 열었다. 문 앞에는 디지몬 배지와 키링이 빼곡히 달린 가방을 든 낯선 남자가 숨을 고르며 서 있었다.'},
  {name:'전문 수집꾼',text:'“류현상 님 맞으시죠? 온라인과 카드샵을 돌며 수집가들 사이에서 소문을 들었습니다. 짧은 기간에 카드 오백 장을 넘게 모은 사람이 있다고요. 실례인 건 알지만, 직접 확인하지 않고는 잠을 못 잘 것 같아서 찾아왔습니다.”'},
  {name:'류현상',text:'현상은 문고리를 잡은 채 한동안 대답하지 않았다. 집 주소를 알아낸 과정부터 수상했지만, 남자의 시선은 사람보다 방 안쪽 카드 보관함에 더 오래 머물렀다. “그걸 확인하려고 남의 집까지 찾아오는 게 정상이라고 생각합니까?”'},
  {name:'나레이션',text:'전문 수집꾼은 당황한 듯 사과하면서도 두꺼운 거래 장부와 시세표를 펼쳤다. 카드의 등급과 최근 거래가가 빼곡하게 정리돼 있었다. 그는 류현상이 보유한 모든 카드를 현재 판매가의 1.5배로 한꺼번에 사겠다고 제안했다.'},
  {name:'전문 수집꾼',text:'“한 장씩 정리하면 시간이 오래 걸립니다. 제가 전부 가져가겠습니다. C부터 SP까지 빠짐없이, 지금 계산되는 총 판매가의 정확히 1.5배를 드리죠. 다시는 나오지 않을 조건이라고 자신합니다.”'},
  {name:'류현상',text:'카드 상자를 바라보자 처음 뽑았던 카드, 팬에게 선물받은 카드, 돈이 없던 시절에도 끝내 팔지 못했던 카드가 떠올랐다. 금액만 보면 거절하기 어려운 제안이었다. 하지만 이 카드들은 단순한 재고가 아니라 무명 시절부터 쌓인 작은 기록이기도 했다.'},
  {name:'나레이션',text:'전문 수집꾼은 계산기를 류현상 쪽으로 돌려 놓았다. 화면에는 모든 카드를 1.5배로 계산한 금액이 표시돼 있었다. 이제 선택만 남았다.'}
 ];
 beginSpecialScene('cardCollectorSpecial');let page=0;const area=$('#choiceArea');const draw=()=>{const s=scenes[page];state.dialogue={name:s.name,text:s.text};render();area.innerHTML='';const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;area.append(prev);prev.onclick=()=>{if(page>0){page--;draw()}};if(page<scenes.length-1){const next=document.createElement('button');next.textContent='다음 장면';area.append(next);next.onclick=()=>{page++;draw()}}else{const decide=document.createElement('button');decide.className='primary choice-trigger';decide.textContent='수집꾼의 제안에 답하기';area.append(decide);setChoiceLock(true);decide.onclick=()=>openChoiceModal('전문 수집꾼의 제안','모든 디지몬 카드를 판매할지 선택해 주세요.',[
 ['좋습니다. 거래하시죠.',()=>{const count=totalCardInventory(),amount=totalCardSaleValue(1.5);clearAllDigimonCards();stat('money',amount);state.specialProgress.cardCollectorVisitDone=true;state.specialProgress.cardCollectorDeclinedDay=0;state.specialEvents.cardCollectorVisit=true;endSpecialScene();addHistory(`🃏 전문 수집꾼 거래 · 카드 ${count.toLocaleString()}장을 1.5배 ${amount.toLocaleString()}원에 판매`,`special:cardCollectorVisit`);state.dialogue={name:'류현상',text:`전문 수집꾼과 거래를 마쳤다. 보유 카드 ${count.toLocaleString()}장은 모두 사라졌고 ${amount.toLocaleString()}원을 받았다.`};playSfx('coin');save(false);render()}],
 ['이건 전부... 내꺼라능!!!',()=>{state.specialProgress.cardCollectorVisitDone=true;state.specialProgress.cardCollectorDeclinedDay=state.day;state.specialEvents.cardCollectorVisit=true;endSpecialScene();addHistory('🃏 전문 수집꾼의 1.5배 매입 제안을 거절했다.','special:cardCollectorVisit');state.dialogue={name:'류현상',text:'“이건 전부... 내꺼라능!!!” 류현상은 문을 닫고 카드 상자를 품에 안았다. 수집꾼은 일주일 뒤 다시 생각해 보라며 의미심장한 말을 남겼다.'};save(false);render()}]
],choice=>{setChoiceLock(false);choice[1]()})}area.classList.remove('hidden')};playSfx('event');draw();return true
}
function runCardTheftEvent(){
 const count=totalCardInventory();beginSpecialScene('cardTheft');const scenes=[{name:'나레이션',text:'전문 수집꾼의 제안을 거절한 지 정확히 일주일 뒤, 류현상은 현관문이 미세하게 열려 있는 것을 발견했다. 잠금장치는 억지로 뜯긴 흔적이 있었고 방 안의 서랍과 상자는 전부 뒤집혀 있었다.'},{name:'류현상',text:'현상은 가장 먼저 카드 보관함으로 달려갔다. 비어 있었다. C 카드부터 가장 아끼던 희귀 카드까지, 집에 있던 디지몬 카드는 단 한 장도 남지 않았다. 다른 물건은 거의 건드리지 않은 채 카드만 정확히 사라져 있었다.'},{name:'나레이션',text:`도둑은 보유 중이던 카드 ${count.toLocaleString()}장을 모두 가져갔다. 경찰에 신고했지만 범인은 카드의 위치와 종류를 미리 알고 있었던 것처럼 흔적을 거의 남기지 않았다. 전문 수집꾼과 관련이 있는지는 끝내 확인할 수 없었다.`},{name:'류현상',text:'“그때 그냥 팔았어야 했나… 아니, 그렇다고 남의 집을 털어?” 류현상은 텅 빈 보관함 앞에 오래 앉아 있었다. 분노와 허탈함이 뒤섞여 스트레스가 조금 쌓였다.'}];let page=0;const area=$('#choiceArea');const draw=()=>{const s=scenes[page];state.dialogue={name:s.name,text:s.text};render();area.innerHTML='';const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;const next=document.createElement('button');next.textContent=page===scenes.length-1?'사건을 마친다':'다음 장면';area.append(prev,next);area.classList.remove('hidden');prev.onclick=()=>{if(page>0){page--;draw()}};next.onclick=()=>{if(page<scenes.length-1){page++;draw();return}clearAllDigimonCards();stat('stress',2);state.specialProgress.cardTheftDone=true;state.specialEvents.cardTheft=true;endSpecialScene();addHistory(`🕵️ 카드 도난 · 디지몬 카드 ${count.toLocaleString()}장을 모두 잃고 스트레스 +2`,`special:cardTheft`);state.dialogue={name:'나레이션',text:`집에 도둑이 들어 디지몬 카드를 모두 잃었다.\n\n【수치 변화】 카드 -${count.toLocaleString()}장 · 스트레스 +2`};playSfx('fail');save(false);render()}};draw();return true
}
function maybeCardCollectorOfferEvent(){
 if(state.specialProgress?.cardCollectorOfferSeen)return false;const total=totalCardInventory();if(total<100||total>=500||Math.random()>=.008)return false;state.specialProgress.cardCollectorOfferSeen=true;const amount=totalCardSaleValue(1.2);showDialogue('카드수집가',`【낯선 카드수집가의 제안】\n\n보유 카드가 ${total.toLocaleString()}장을 넘었다는 소문을 들은 수집가가 찾아왔다. 그는 현재 카드 판매가 합계의 1.2배인 ${amount.toLocaleString()}원에 모든 카드를 넘겨 달라고 요청했다.`,[['수락',()=>{const count=totalCardInventory(),pay=totalCardSaleValue(1.2);clearAllDigimonCards();stat('money',pay);addHistory(`🃏 카드수집가에게 카드 ${count.toLocaleString()}장을 1.2배로 판매`,`collector-offer:${state.day}`);return `수집가에게 모든 카드 ${count.toLocaleString()}장을 넘기고 ${pay.toLocaleString()}원을 받았다.`}],['거절',()=>{addHistory('🃏 카드수집가의 1.2배 매입 제안을 거절했다.',`collector-offer:${state.day}`);return '류현상은 카드 상자를 끌어안으며 판매하지 않겠다고 말했다. 수집가는 아쉬운 표정으로 명함만 남기고 돌아갔다.'}]]);return true
}
function maybeScheduledSpecialEvent(){
 const p=state.specialProgress||{};
 if(p.cardCollectorDeclinedDay&&!p.cardTheftDone&&state.day>=p.cardCollectorDeclinedDay+7)return runCardTheftEvent();
 if(!p.cardCollectorVisitDone&&p.cardCollectorEligibleDay&&state.day>=p.cardCollectorEligibleDay&&totalCardInventory()>=500)return runCardCollectorSpecialEvent();
 if(state.manager.wedding&&p.weddingSongSeen&&p.weddingInviteSeen&&!p.hurabonoWeddingDone)return runHurabonoWeddingDayEvent();
 return false
}
function maybeStoryEvent(source='action'){
 if(state.skipNextStory){state.skipNextStory=false;return false}
 if(state.pendingEnding||choiceLock||state.specialScene?.active||$('#modal')?.open)return false;
 if(state.narrative?.lastMajorEventDay===state.day)return false;
 if(maybeScheduledSpecialEvent()){markMajorNarrativeEvent();return true}
 if(maybeFixedDaySpecialEvent()){markMajorNarrativeEvent();return true}
 if(maybeTwentyDayEpisode())return true;
 if(maybeCareerMilestoneEvent()){markMajorNarrativeEvent();return true}
 if(maybeRestLooksNightmare(source)){markMajorNarrativeEvent();return true}
 if(maybeRestNightmare(source))return true
 if(maybeCardCollectorOfferEvent()){markMajorNarrativeEvent();return true}
 if(maybeMysteriousMerchantEvent()){markMajorNarrativeEvent();return true}
 if(maybeHiddenRandomSpecialEvent()){markMajorNarrativeEvent();return true}
 if(maybeRivalStory()){markMajorNarrativeEvent();return true}
 if(!['vocal','compose'].includes(state.lastAction)&&maybeFanCommunityEvent()){markMajorNarrativeEvent();return true}
 if(!['vocal','compose'].includes(state.lastAction)&&maybePassiveSnsEvent()){markMajorNarrativeEvent();return true}
 if(maybeArroganceEvent()){markMajorNarrativeEvent();return true}
 const randomStoryChance=source==='move'?.28:.52;
 if(Math.random()>=randomStoryChance)return false;
 const pool=storyEvents.filter(ev=>ev.id!=='secret-date'&&ev.id!=='rival'&&(!ev.place||ev.place===state.location)&&(!ev.condition||ev.condition())&&!state.seenEvents.includes(ev.id));
 if(!pool.length)return false;
 const ev=pool[Math.floor(Math.random()*pool.length)];state.seenEvents.push(ev.id);if(state.seenEvents.length>28)state.seenEvents.shift();markMajorNarrativeEvent();playSfx('event');$('#eventBadge').classList.remove('hidden');setTimeout(()=>$('#eventBadge').classList.add('hidden'),2600);const choices=ev.choices.map(([label,fn])=>[label,()=>{const result=fn();addHistory(`📖 특별 이야기 · ${ev.title} — ${label}`,`story:${ev.id}`);return result}]);showDialogue('돌발 스토리',`【${ev.title}】\n\n${ev.text}`,choices);return true
}

const digimonCardGrades={
 C:{value:200,label:'C · 커먼'},U:{value:400,label:'U · 언커먼'},R:{value:1000,label:'R · 레어'},SR:{value:3000,label:'SR · 슈퍼 레어'},SEC:{value:10000,label:'SEC · 시크릿'},SP:{value:200000,label:'SP · 스페셜'}
};
function totalCardInventory(){return Object.values(state.gambling.cards).reduce((a,b)=>a+b,0)}
function totalCardSaleValue(multiplier=1){return Math.floor(Object.entries(state.gambling.cards).reduce((sum,[grade,count])=>sum+(digimonCardGrades[grade]?.value||0)*count,0)*multiplier)}
function clearAllDigimonCards(){for(const grade of Object.keys(state.gambling.cards))state.gambling.cards[grade]=0}
function updateCardCollectorQualification(){
 const progress=state.specialProgress||(state.specialProgress={});
 if(progress.cardCollectorVisitDone)return;
 const total=totalCardInventory();
 if(total>=500&&!progress.cardCollectorEligibleDay)progress.cardCollectorEligibleDay=state.day+1;
 if(total<500&&progress.cardCollectorEligibleDay>state.day)progress.cardCollectorEligibleDay=0;
}

function rollDigimonCard(){
 const r=Math.random();let cursor=0;
 const table=[['SP',1/3456],['SEC',1/1728],['SR',1/36],['R',1/6],['U',1/3]];
 for(const [grade,prob] of table){cursor+=prob;if(r<cursor)return grade}
 return 'C'
}
function launchCardFireworks(){
 const layer=document.createElement('div');layer.className='card-fireworks';
 for(let i=0;i<46;i++){const p=document.createElement('i');p.textContent=['✦','★','✧','●'][i%4];p.style.setProperty('--x',`${Math.random()*100}vw`);p.style.setProperty('--delay',`${Math.random()*.45}s`);p.style.setProperty('--drift',`${-90+Math.random()*180}px`);layer.appendChild(p)}
 document.body.appendChild(layer);setTimeout(()=>layer.remove(),3300)
}
function digimonInventoryHtml(){
 const cards=state.gambling.cards;return `<div class="digimon-summary"><b>보유 카드 ${totalCardInventory().toLocaleString()}장</b><span>누적 뽑기 ${state.gambling.totalCardDraws.toLocaleString()}회 · SP 누적 획득 ${Number(state.gambling.spDraws||0).toLocaleString()}회</span></div><div class="card-grade-grid">${Object.entries(digimonCardGrades).map(([grade,info])=>`<div class="info-card card-grade grade-${grade.toLowerCase()}"><header><b>${info.label}</b><span>${cards[grade].toLocaleString()}장</span></header><p>판매가 ${info.value.toLocaleString()}원</p><button data-sell-card="${grade}" ${cards[grade]<1?'disabled':''}>1장 판매</button><button data-sell-card-all="${grade}" ${cards[grade]<1?'disabled':''}>전부 판매</button></div>`).join('')}</div><div class="info-card"><small>확률: C 1/3 · U 1/3 · R 1/6 · SR 1/36 · SEC 1/1,728 · SP 1/3,456. 입력된 확률 합계에서 남는 구간은 가장 낮은 C 등급으로 처리됩니다. 뽑기만 시간 1칸을 사용하며 판매에는 시간이 들지 않습니다.</small></div>`
}
function bindDigimonInventory(){
 $$('[data-sell-card]').forEach(b=>b.onclick=()=>sellDigimonCard(b.dataset.sellCard,1));
 $$('[data-sell-card-all]').forEach(b=>b.onclick=()=>sellDigimonCard(b.dataset.sellCardAll,state.gambling.cards[b.dataset.sellCardAll]||0))
}
function openDigimonCardHub(){
 showModal('디지몬 카드 구매',`<div class="info-card"><b>디지몬 카드 코너</b><p>1장은 <strong>1,500원 · 체력 1</strong>, 10장은 <strong>15,000원 · 체력 5</strong>입니다.</p><p>10장을 연속으로 뽑아도 1장 뽑기와 동일하게 <strong>시간 1칸</strong>만 지나갑니다.</p><small>확률: C 1/3 · U 1/3 · R 1/6 · SR 1/36 · SEC 1/1,728 · SP 1/3,456<br>카드 보관함과 판매는 자취방에서 이용할 수 있습니다.</small></div><div class="result-actions card-purchase-actions"><button id="digimonBuyOne" class="primary">1장 뽑기<br><small>1,500원 · 체력 1</small></button><button id="digimonBuyTen" class="primary">10장 연속 뽑기<br><small>15,000원 · 체력 5</small></button></div>`);
 const one=$('#digimonBuyOne'),ten=$('#digimonBuyTen');
 if(one)one.onclick=()=>{closeModal();drawDigimonCards(1)};
 if(ten)ten.onclick=()=>{closeModal();drawDigimonCards(10)};
}
function openDigimonInventory(){showModal('디지몬 카드 보관함',digimonInventoryHtml());bindDigimonInventory()}
function sellDigimonCard(grade,count){
 const owned=state.gambling.cards[grade]||0;count=Math.max(0,Math.min(owned,Math.floor(Number(count)||0)));if(!count)return;
 const amount=digimonCardGrades[grade].value*count;state.gambling.cards[grade]-=count;updateCardCollectorQualification();stat('money',amount);addHistory(`💳 디지몬 카드 판매 · ${grade} ${count}장, ${amount.toLocaleString()}원`,`card-sell:${state.day}:${Date.now()}`);state.dialogue={name:'카드 판매',text:`${grade} 카드 ${count}장을 판매했다.\n\n【수치 변화】 돈 +${amount.toLocaleString()}`};playSfx('coin');save(false);render();openDigimonInventory()
}
function showDigimonCardResult(grades){
 const counts={C:0,U:0,R:0,SR:0,SEC:0,SP:0};
 grades.forEach(grade=>counts[grade]++);
 if(grades.length===1){
  const grade=grades[0],info=digimonCardGrades[grade];
  showModal(`디지몬 카드 결과 · ${grade}`,`<div class="digimon-result grade-${grade.toLowerCase()}"><div class="card-rarity">${grade}</div><h3>${info.label} 카드 획득!</h3><p>판매가 <strong>${info.value.toLocaleString()}원</strong> · 현재 ${grade} 보유 ${state.gambling.cards[grade]}장</p><div class="result-actions"><button id="cardResultConfirm" class="primary wide">확인</button></div></div>`);
 }else{
  const order=['SP','SEC','SR','R','U','C'];
  const totalValue=order.reduce((sum,grade)=>sum+counts[grade]*digimonCardGrades[grade].value,0);
  showModal('디지몬 카드 10장 결과',`<div class="digimon-result ten-card-result"><h3>10장 연속 뽑기 완료!</h3><div class="ten-card-grid">${order.filter(grade=>counts[grade]>0).map(grade=>`<div class="ten-card-item grade-${grade.toLowerCase()}"><b>${grade}</b><span>${counts[grade]}장</span><small>${(counts[grade]*digimonCardGrades[grade].value).toLocaleString()}원</small></div>`).join('')}</div><p>획득 카드 판매가 합계 <strong>${totalValue.toLocaleString()}원</strong></p><small>획득한 카드는 모두 보관함에 저장되었습니다.</small><div class="result-actions"><button id="cardResultConfirm" class="primary wide">확인</button></div></div>`);
 }
 if(counts.SP>0){launchCardFireworks();playSfx('success')}
 const confirm=$('#cardResultConfirm');if(confirm)confirm.onclick=()=>closeModal();
}
function drawDigimonCards(count=1){
 count=count===10?10:1;
 const price=1500*count,hpCost=count===10?5:1;
 if(state.stats.money<price){pendingLocationActionStress=false;return toast(`디지몬 카드 ${count}장을 뽑으려면 ${price.toLocaleString()}원이 필요합니다.`)}
 if(!costHp(hpCost)){pendingLocationActionStress=false;return}
 stat('money',-price);
 const grades=[];
 for(let i=0;i<count;i++){
  const grade=rollDigimonCard();grades.push(grade);state.gambling.cards[grade]++;if(grade==='SP')state.gambling.spDraws=(state.gambling.spDraws||0)+1;
 }
 state.gambling.totalCardDraws+=count;updateCardCollectorQualification();
 const actualHpCost=Number(state.lastHpCost)||hpCost;
 showDialogue('류현상',(count===10?'오늘은 열 장이다. 한 장쯤은 좋은 게 나오겠지... 두근 두근.':'오늘은 어떤 카드가 나올까... 두근 두근')+`

【수치 변화】 돈 -${price.toLocaleString()} · 체력 -${actualHpCost}`);
 const summary=Object.entries(grades.reduce((acc,g)=>(acc[g]=(acc[g]||0)+1,acc),{})).map(([g,n])=>`${g} ${n}장`).join(' · ');
 addHistory(`🃏 디지몬 카드 ${count}장 뽑기 · 체력 -${actualHpCost} · ${summary}`,`card-draw:${state.day}:${state.gambling.totalCardDraws}`);
 cardRevealPending=true;advance(1,'gambling');
 setTimeout(()=>{cardRevealPending=false;showDigimonCardResult(grades)},count===10?850:650)
}
function drawDigimonCard(){drawDigimonCards(1)}
function lotteryNumberButtons(selected=[]){const set=new Set(selected);return Array.from({length:45},(_,i)=>{const n=i+1;return `<button class="lottery-number ${set.has(n)?'selected':''}" data-lotto-number="${n}">${n}</button>`}).join('')}
function lotteryWeekInfo(day=state.day){const startDay=Math.floor((Math.max(1,day)-1)/7)*7+1;return {start:startDay,end:startDay+6}}
function lotteryPurchasedThisWeek(){const week=lotteryWeekInfo();return state.gambling.lotteryTickets.filter(t=>t.purchaseDay>=week.start&&t.purchaseDay<=week.end).length}
function openLottery(){
 let selected=[];
 const draw=()=>{const used=lotteryPurchasedThisWeek(),remain=Math.max(0,100-used),week=lotteryWeekInfo();showModal('복권 번호 선택',`<div class="info-card"><b>1~45 중 숫자 6개를 선택하세요.</b><p>1장 1,000원 · 체력 1 · 시간 미소모<br>10장 자동 구매 10,000원 · 체력 5 · 시간 미소모</p><p>${state.day+7}일차 추첨 · 이번 주 ${week.start}~${week.end}일차 구매 <strong>${used}/100장</strong></p></div><div id="lotteryNumbers" class="lottery-number-grid">${lotteryNumberButtons(selected)}</div><p id="lotterySelectionText" class="lottery-selection">선택 ${selected.length}/6 · ${selected.length?selected.join(', '):'번호를 골라 주세요.'}</p><div class="result-actions"><button id="lotteryAuto">자동 선택</button><button id="lotteryReset">초기화</button><button id="lotteryBuy" class="primary" ${selected.length===6&&remain>=1?'':'disabled'}>선택 번호 1장 구매</button><button id="lotteryBuyTen" ${remain>=10?'':'disabled'}>10장 자동 구매</button></div><div class="info-card lottery-prize-table"><small>주간 최대 100장. 1장은 체력 1, 10장 자동 구매는 체력 5가 소모되며 시간은 지나지 않습니다.<br>1등 6개 일치 1억원 · 2등 5개+보너스 2천만원 · 3등 5개 200만원 · 4등 4개 5만원 · 5등 3개 5천원<br><br><b>게임 적용 확률</b>: 1등 0.001% · 2등 0.01% · 3등 0.1% · 4등 1% · 5등 5% · 낙첨 93.889%</small></div>`);bind()};
 const bind=()=>{$$('[data-lotto-number]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.lottoNumber),i=selected.indexOf(n);if(i>=0)selected.splice(i,1);else if(selected.length<6)selected.push(n);else return toast('숫자는 6개까지 선택할 수 있습니다.');selected.sort((a,b)=>a-b);draw()});$('#lotteryAuto').onclick=()=>{selected=randomUniqueNumbers(6);draw()};$('#lotteryReset').onclick=()=>{selected=[];draw()};$('#lotteryBuy').onclick=()=>buyLotteryTickets(1,selected);$('#lotteryBuyTen').onclick=()=>buyLotteryTickets(10)};
 draw()
}
function randomUniqueNumbers(count,exclude=[]){const pool=Array.from({length:45},(_,i)=>i+1).filter(n=>!exclude.includes(n)),out=[];while(out.length<count&&pool.length){out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}return out.sort((a,b)=>a-b)}
function buyLotteryTickets(count=1,numbers=[]){
 count=count===10?10:1;
 const used=lotteryPurchasedThisWeek();
 if(used+count>100)return toast(`복권은 일주일에 100장까지만 구매할 수 있습니다. 이번 주 남은 수량은 ${Math.max(0,100-used)}장입니다.`);
 const price=count*1000,hpCost=count===10?5:1;
 if(state.stats.money<price)return toast(`복권 구매금 ${price.toLocaleString()}원이 필요합니다.`);
 if(count===1&&numbers.length!==6)return toast('숫자 6개를 선택해야 합니다.');
 if(!costHp(hpCost))return;
 stat('money',-price);
 const drawDay=state.day+7,purchaseDay=state.day,tickets=[];
 for(let i=0;i<count;i++){
  const ticketNumbers=count===1?[...numbers].sort((a,b)=>a-b):randomUniqueNumbers(6);
  const ticket={id:`${state.day}-${Date.now()}-${i}-${Math.floor(Math.random()*9999)}`,numbers:ticketNumbers,purchaseDay,drawDay,status:'pending'};
  tickets.push(ticket);state.gambling.lotteryTickets.push(ticket)
 }
 const actualHpCost=Number(state.lastHpCost)||hpCost;
 state.dialogue={name:'복권 판매원',text:(count===1?`복권 1장을 구매했다. 결과는 ${drawDay}일차에 발표된다.`:`자동 번호 복권 10장을 구매했다. 결과는 ${drawDay}일차에 한꺼번에 발표된다.`)+`

【수치 변화】 돈 -${price.toLocaleString()} · 체력 -${actualHpCost}`};
 addHistory(`🎟 복권 ${count}장 구매 · 체력 -${actualHpCost} · ${drawDay}일차 추첨 · 주간 ${used+count}/100장`,`lottery-buy:${purchaseDay}:${Date.now()}`);
 const content=count===1?`<div class="lottery-ticket"><small>추첨 예정 ${drawDay}일차 · 체력 ${actualHpCost} 소모 · 시간 미소모</small><h3>${tickets[0].numbers.map(n=>`<span>${n}</span>`).join('')}</h3><p>7일 뒤 자동으로 당첨 결과가 발표됩니다.</p><button id="lotteryPurchaseConfirm" class="primary wide">확인</button></div>`:`<div class="info-card"><b>복권 10장 자동 구매 완료</b><p>추첨 예정 ${drawDay}일차 · 체력 ${actualHpCost} 소모 · 시간 미소모</p><div class="card-list">${tickets.map((t,i)=>`<small>${i+1}. ${t.numbers.join(', ')}</small>`).join('')}</div><p>이번 주 누적 ${used+count}/100장</p><button id="lotteryPurchaseConfirm" class="primary wide">확인</button></div>`;
 pendingLocationActionStress=false;save(false);render();showModal(count===10?'복권 10장 구매 완료':'복권 구매 완료',content)
 const confirm=$('#lotteryPurchaseConfirm');if(confirm)confirm.onclick=()=>closeModal()
}
const lotteryRankRates=[
 {rank:'1등',rate:.00001,money:100000000,matches:6,bonus:false},
 {rank:'2등',rate:.0001,money:20000000,matches:5,bonus:true},
 {rank:'3등',rate:.001,money:2000000,matches:5,bonus:false},
 {rank:'4등',rate:.01,money:50000,matches:4,bonus:false},
 {rank:'5등',rate:.05,money:5000,matches:3,bonus:false}
];
function rollLotteryPrize(){let r=Math.random(),sum=0;for(const item of lotteryRankRates){sum+=item.rate;if(r<sum)return {...item}}return {rank:'낙첨',rate:1-sum,money:0,matches:Math.floor(Math.random()*3),bonus:false}}
function randomSubset(list,count){const pool=[...list],out=[];while(out.length<count&&pool.length)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return out}
function makeLotteryDrawForPrize(ticketNumbers,prize){
 const mine=[...ticketNumbers],matching=randomSubset(mine,prize.matches),outside=Array.from({length:45},(_,i)=>i+1).filter(n=>!mine.includes(n));
 const winning=[...matching,...randomSubset(outside,6-matching.length)].sort((a,b)=>a-b);
 let bonus;
 if(prize.bonus){bonus=mine.find(n=>!winning.includes(n))}
 else{bonus=randomUniqueNumbers(1,[...winning,...mine])[0]||randomUniqueNumbers(1,winning)[0]}
 const matches=mine.filter(n=>winning.includes(n)).length,hasBonus=mine.includes(bonus);
 return {winning,bonus,matches,hasBonus}
}
function maybeLotteryResult(){
 if($('#modal')?.open||choiceLock)return false;const due=state.gambling.lotteryTickets.filter(t=>t.status==='pending'&&t.drawDay<=state.day);if(!due.length)return false;
 const results=due.map(ticket=>{const prize=rollLotteryPrize(),draw=makeLotteryDrawForPrize(ticket.numbers,prize),winning=draw.winning,bonus=draw.bonus,matches=draw.matches,hasBonus=draw.hasBonus;ticket.status='drawn';if(prize.money)stat('money',prize.money);const result={ticketId:ticket.id,drawDay:ticket.drawDay,announcedDay:state.day,numbers:ticket.numbers,winning,bonus,matches,hasBonus,rank:prize.rank,money:prize.money};state.gambling.lotteryResults.push(result);addHistory(`🎰 ${ticket.drawDay}일차 복권 결과 · ${prize.rank}${prize.money?` ${prize.money.toLocaleString()}원`:''}`,`lottery-result:${ticket.id}`);return result});
 state.gambling.lotteryResults=state.gambling.lotteryResults.slice(-20);save(false);render();const total=results.reduce((a,r)=>a+r.money,0);showModal('복권 추첨 결과',`<div class="card-list">${results.map(r=>`<div class="lottery-result-card ${r.money?'winner':''}"><b>${r.drawDay}일차 추첨 · ${r.rank}${r.money?` · +${r.money.toLocaleString()}원`:''}</b><p>내 번호: ${r.numbers.join(', ')}</p><p>당첨 번호: ${r.winning.join(', ')} + 보너스 ${r.bonus}</p><small>일치 ${r.matches}개${r.hasBonus?' · 보너스 일치':''}</small></div>`).join('')}</div><div class="info-card"><small>게임 적용 확률: 1등 0.001% · 2등 0.01% · 3등 0.1% · 4등 1% · 5등 5%</small></div><button id="lotteryResultConfirm" class="primary wide">확인</button>`);$('#lotteryResultConfirm').onclick=()=>closeModal();if(total>0)playSfx('success');return true
}

function resetFleaMarketForToday(){
 if(!fleaMarketIsOpen())return false;
 if(state.fleaMarket.cycleDay===state.day)return true;
 state.fleaMarket={cycleDay:state.day,soldOut:false,offers:[],purchased:[]};
 if(Math.random()<.20){state.fleaMarket.soldOut=true;save(false);return true}
 const candidates=FLEA_MARKET_ITEMS.filter(item=>item.outfit===undefined||!state.ownedOutfits.includes(item.outfit));
 const shuffled=[...candidates].sort(()=>Math.random()-.5);
 const count=Math.min(shuffled.length,1+Math.floor(Math.random()*2));
 state.fleaMarket.offers=shuffled.slice(0,count).map(x=>x.id);
 if(!state.fleaMarket.offers.length)state.fleaMarket.soldOut=true;
 save(false);return true
}
function fleaMarketItemCard(item){
 const alreadyBought=state.fleaMarket.purchased.includes(item.id);
 const owned=item.outfit!==undefined&&state.ownedOutfits.includes(item.outfit);
 const unavailable=alreadyBought||owned||state.stats.money<item.price;
 const label=alreadyBought||owned?'판매 완료':state.stats.money<item.price?'돈 부족':'구매';
 return `<div class="info-card flea-market-card no-preview"><div class="flea-market-copy"><header><b>${item.name}</b><span>${item.price.toLocaleString()}원</span></header><p>${item.desc}</p><button data-flea-buy="${item.id}" ${unavailable?'disabled':''}>${label}</button></div></div>`
}
function openFleaMarket(){
 if(!fleaMarketIsOpen())return toast(`플리마켓은 ${fleaMarketDaysUntilOpen()}일 후 다시 열립니다.`);
 resetFleaMarketForToday();
 if(state.fleaMarket.soldOut)return showModal('공원 플리마켓',`<div class="flea-market-empty"><b>오늘은 다 팔렸습니다.</b><p>천막은 열려 있지만 남은 물건이 하나도 없다. 다음 플리마켓은 7일 뒤 열린다.</p></div>`,'shop');
 const offers=state.fleaMarket.offers.map(id=>FLEA_MARKET_ITEMS.find(x=>x.id===id)).filter(Boolean);
 showModal('공원 플리마켓',`<div class="gear-balance"><span>현재 보유금</span><strong>${state.stats.money.toLocaleString()}원</strong><small>7일마다 열리는 플리마켓 · 오늘 나온 물건은 이번 장터에서만 구매할 수 있습니다.</small></div><div class="card-list flea-market-list">${offers.map(fleaMarketItemCard).join('')}</div>`,'shop');
 $$('[data-flea-buy]').forEach(button=>button.onclick=()=>buyFleaMarketItem(button.dataset.fleaBuy))
}
function buyFleaMarketItem(id){
 const item=FLEA_MARKET_ITEMS.find(x=>x.id===id);if(!item)return;
 if(!state.fleaMarket.offers.includes(id)||state.fleaMarket.purchased.includes(id))return toast('이미 판매된 물건입니다.');
 if(state.stats.money<item.price)return toast('돈이 부족합니다.');
 stat('money',-item.price);state.fleaMarket.purchased.push(id);
 if(item.outfit!==undefined){
  if(!state.ownedOutfits.includes(item.outfit))state.ownedOutfits.push(item.outfit);
  if(item.lookBonus)stat('looks',item.lookBonus);
  addHistory(`🛍 플리마켓 · ${item.name} 구매 · 옷장에 추가`,`flea:${state.day}:${id}`);
  state.dialogue={name:'류현상',text:`플리마켓에서 ${item.name}을 구입해 옷장에 넣었다.`};
 }else if(item.strongDiet){
  state.items.strongDietPill=(state.items.strongDietPill||0)+1;
  addHistory('💊 플리마켓 · 강력한 다이어트알약 1알 구매 · 아이템창에 추가',`flea:${state.day}:${id}`);
  state.dialogue={name:'류현상',text:'강력한 다이어트알약을 샀다. 일단 아이템창에 넣어 두었다.'};
 }
 playSfx('coin');save(false);render();openFleaMarket()
}
function useStrongDietPill(){
 if((state.items.strongDietPill||0)<1)return toast('강력한 다이어트알약이 없습니다.');
 const hpCost=effectiveHpCost(20);if(state.stats.hp<hpCost)return toast(`체력이 부족합니다. 체력 ${hpCost}이 필요합니다.`);
 const before=snapshotStats();state.items.strongDietPill--;costHp(20);stat('stress',4);
 const roll=Math.random();let lookChange=0;
 if(roll<.02)lookChange=-2;else if(roll<.04)lookChange=2;
 if(lookChange)stat('looks',lookChange);
 const message=lookChange<0?'강한 부작용이 나타나 외모가 2 감소했다.':lookChange>0?'약효가 강하게 나타나 외모가 2 증가했다.':'이번에는 눈에 띄는 변화가 없었다.';
 addHistory(`💊 강력한 다이어트알약 복용 · ${message}`,`strong-diet:${state.day}:${Date.now()}`);
 state.dialogue={name:'류현상',text:`강력한 다이어트알약을 삼켰다. ${message}`};save(false);render();
 showModal('강력한 다이어트알약 결과',`<div class="info-card"><b>${message}</b><p>${describeStatChanges(before)||'수치 변화 없음'}</p><button id="strongDietConfirm" class="primary wide">확인</button></div>`,'items');
 const confirm=$('#strongDietConfirm');if(confirm)confirm.onclick=openItemMenu
}
function openShopHub(){showModal('상점',`<div class="shop-hub"><button id="openGearShop" class="info-card"><b>🎤 장비·악기 상점</b><small>마이크, 음향장비, 악기 구매와 장착</small></button><button id="openSuspiciousShop" class="info-card mystery-shop-button"><b>🕯 수상한 가게</b><small>효과와 부작용을 장담할 수 없는 물건</small></button></div>`,'shop');$('#openGearShop').onclick=openGear;$('#openSuspiciousShop').onclick=openSuspiciousShop}
function openSuspiciousShop(){
 if(debtBlocked('수상한 물건 구매'))return;
 const dietCount=Math.max(0,Number(state.items?.dietPill)||0),energizerCount=Math.max(0,Number(state.items?.energizer)||0);
 showModal('수상한 가게',`<div class="gear-balance"><span>현재 보유금</span><strong>${state.stats.money.toLocaleString()}원</strong><small>구매에는 시간이 소모되지 않으며, 구입한 물건은 아이템창에 보관됩니다.</small></div><div class="card-list"><div class="info-card mystery-shop-card"><header><b>다이어트 알약</b><span>100,000원</span></header><p>잘생겨질지도 모른다.</p><small>보유 ${dietCount}알</small><button id="buyDietPill" ${state.stats.money<100000?'disabled':''}>${state.stats.money<100000?'돈 부족':'구매'}</button></div><div class="info-card mystery-shop-card"><header><b>에너자이저</b><span>400,000원</span></header><p>먹으면 힘이 솟아날지도..</p><small>보유 ${energizerCount}개</small><button id="buyEnergizer" ${state.stats.money<400000?'disabled':''}>${state.stats.money<400000?'돈 부족':'구매'}</button></div></div>`);
 const d=$('#buyDietPill');if(d)d.onclick=buyDietPill;const e=$('#buyEnergizer');if(e)e.onclick=buyEnergizer
}
function showMysteryPurchaseResult(title,body){
 save(false);render();showModal('구매 완료',`<div class="info-card"><b>${title}</b><p>${body}</p><button id="mysteryPurchaseConfirm" class="primary wide">확인</button></div>`);const button=$('#mysteryPurchaseConfirm');if(button)button.onclick=openSuspiciousShop
}
function buyDietPill(){
 if(state.stats.money<100000)return toast('다이어트 알약을 구매할 돈이 부족합니다.');
 stat('money',-100000);state.items.dietPill=(state.items.dietPill||0)+1;addHistory('💊 수상한 가게 · 다이어트 알약 1알 구매 · 아이템 보관함에 추가',`diet-pill-buy:${state.day}:${Date.now()}`);state.dialogue={name:'류현상',text:'다이어트 알약을 샀지만 바로 먹지는 않았다. 일단 아이템 보관함에 넣어 두었다.'};showMysteryPurchaseResult('다이어트 알약을 구입했습니다.',`아이템창에 다이어트 알약 1알이 추가되었습니다.<br>현재 보유: ${(state.items.dietPill||0)}알`)
}
function buyEnergizer(){
 if(state.stats.money<400000)return toast('에너자이저를 구매할 돈이 부족합니다.');
 stat('money',-400000);state.items.energizer=(state.items.energizer||0)+1;addHistory('⚡ 수상한 가게 · 에너자이저 1개 구매 · 아이템 보관함에 추가',`energizer-buy:${state.day}:${Date.now()}`);state.dialogue={name:'류현상',text:'에너자이저를 샀지만 바로 마시지는 않았다. 일단 아이템 보관함에 넣어 두었다.'};showMysteryPurchaseResult('에너자이저를 구입했습니다.',`아이템창에 에너자이저 1개가 추가되었습니다.<br>현재 보유: ${(state.items.energizer||0)}개`)
}
function applyEnergizerDose(returnTarget='items'){
 state.effects.energizerConsecutiveCount=1;state.effects.energizerOverdose=false;state.effects.energizerUntilDay=state.day+6;
 addHistory('⚡ 에너자이저 복용 · 7일 동안 체력 소모 20% 감소',`energizer:${state.day}:${Date.now()}`);state.dialogue={name:'류현상',text:'형광빛 음료를 마시자 몸이 조금 가벼워졌다. 앞으로 7일 동안 행동에 필요한 체력이 평소보다 20% 적게 소모된다.'};save(false);render();showModal('에너자이저 적용',`<div class="info-card"><b>7일 동안 체력 소모량이 20% 감소합니다.</b><p>기본 체력 소모가 10이라면 8만 소모합니다. 계산 결과의 소수점은 올림 처리되며 최소 체력 1은 소모합니다.</p><p>적용 기간: ${state.day}일차부터 ${state.effects.energizerUntilDay}일차까지</p><button id="energizerConfirm" class="primary wide">확인</button></div>`);const confirm=$('#energizerConfirm');if(confirm)confirm.onclick=()=>returnTarget==='shop'?openSuspiciousShop():openItemMenu()
}
function useEnergizerItem(){
 if((state.items.energizer||0)<1)return toast('보유한 에너자이저가 없습니다.');
 state.items.energizer--;applyEnergizerDose('items')
}
function useDietPill(amount=1){
 amount=Number(amount)===10?10:1;
 const owned=Math.max(0,Number(state.items?.dietPill)||0),baseHpCost=10*amount,actualHpCost=effectiveHpCost(baseHpCost);
 if(owned<amount)return toast(`다이어트 알약이 ${amount}알 필요합니다.`);
 if(state.stats.hp<actualHpCost)return toast(`체력이 부족합니다. ${amount}알 연속 복용에는 체력 ${actualHpCost}이 필요합니다.`);
 const before=snapshotStats();state.items.dietPill-=amount;costHp(baseHpCost);stat('stress',2*amount);
 let negative=0,positive=0;const negativeChance=amount===10?.015:.01;
 for(let i=0;i<amount;i++){const roll=Math.random();if(roll<negativeChance)negative++;else if(roll<negativeChance+.01)positive++}
 const lookChange=positive-negative;if(lookChange)stat('looks',lookChange);
 let message='아무런 효과가 없었다.';if(lookChange<0)message=`부작용이 나타나 외모가 ${Math.abs(lookChange)} 감소했다.`;else if(lookChange>0)message=`조금 효과를 보여 외모가 ${lookChange} 증가했다.`;else if(negative&&positive)message='효과와 부작용이 동시에 나타나 외모 변화는 없었다.';
 const changes=describeStatChanges(before);addHistory(`💊 다이어트 알약 ${amount}알 ${amount===10?'연속 ':''}복용 · ${message}`,`diet-pill-use:${state.day}:${amount}:${Date.now()}`);state.dialogue={name:'류현상',text:`다이어트 알약을 ${amount}알${amount===10?' 연속으로':''} 삼킨 뒤 한동안 거울을 바라봤다. ${message}`};save(false);render();showModal('다이어트 알약 결과',`<div class="info-card"><b>${message}</b><p>${changes||'수치 변화 없음'}</p>${amount===10?'<small>10알 연속 복용은 한 알씩 먹을 때보다 각 알약의 외모 감소 부작용 확률이 1%에서 1.5%로 소폭 증가합니다.</small>':''}<button id="dietPillConfirm" class="primary wide">확인</button></div>`);const button=$('#dietPillConfirm');if(button)button.onclick=openItemMenu
}
function bankruptcyStatusText(){
 const debt=Math.max(0,Number(state.economy?.debt)||0),start=Number(state.economy?.debtStartDay)||state.day,critical=Number(state.economy?.debtCriticalDay)||state.day;
 if(debt>=BANKRUPTCY_CRITICAL_DEBT){const elapsed=Math.max(0,state.day-critical),remain=Math.max(0,BANKRUPTCY_CRITICAL_DAYS-elapsed);return `채무가 50만원 이상인 상태 ${elapsed}/${BANKRUPTCY_CRITICAL_DAYS}일 · ${remain}일 안에 50만원 미만으로 줄이지 못하면 파산 엔딩이 발생합니다.`}
 const elapsed=Math.max(0,state.day-start),remain=Math.max(0,BANKRUPTCY_MAX_DAYS-elapsed);return `채무 발생 후 ${elapsed}/${BANKRUPTCY_MAX_DAYS}일 · ${remain}일 안에 전액 상환하지 못하면 파산 엔딩이 발생합니다.`
}
function openFinance(){
 const debt=Math.max(0,state.economy?.debt||0);
 if(debt<=0)return showModal('가계부·채무','<p>현재 채무가 없습니다. 월 고정비와 다음 달 지출을 확인하며 현금을 관리하세요.</p><p>채무가 50만원 이상이면 15일, 50만원 미만이면 최대 30일 안에 정리해야 파산을 피할 수 있습니다.</p>');
 const options=[100000,500000,debt].filter((v,i,a)=>v<=debt&&v<=state.stats.money&&a.indexOf(v)===i);
 showModal('가계부·채무',`<p>현재 채무 <b>${debt.toLocaleString()}원</b> · 보유금 <b>${state.stats.money.toLocaleString()}원</b></p><p>${bankruptcyStatusText()}</p><p>수입 발생 시 50%가 자동 상환되며, 여기서 원하는 금액을 즉시 상환할 수 있습니다.</p>${options.length?options.map(v=>`<button class="wide" data-repay-debt="${v}">${v===debt?'전액 ':''}${v.toLocaleString()}원 상환</button>`).join(''):'<p>현재 보유금으로 상환할 수 없습니다.</p>'}`);
 $$('[data-repay-debt]').forEach(b=>b.onclick=()=>{const amount=Math.min(Number(b.dataset.repayDebt)||0,state.stats.money,state.economy.debt);if(amount<=0)return;state.stats.money-=amount;state.economy.debt-=amount;if(state.economy.debt<=0){state.economy.debt=0;state.economy.debtStartDay=0;state.economy.debtCriticalDay=0}else if(state.economy.debt<BANKRUPTCY_CRITICAL_DEBT){state.economy.debtCriticalDay=0}state.economy.totalDebtRepaid=(state.economy.totalDebtRepaid||0)+amount;addHistory(`💳 직접 채무 상환 · ${amount.toLocaleString()}원`,`debt:manual:${state.day}:${state.economy.debt}`);state.dialogue={name:'가계부',text:`채무 ${amount.toLocaleString()}원을 직접 상환했다.

【수치 변화】 돈 -${amount.toLocaleString()} · 채무 -${amount.toLocaleString()}`};save(false);render();openFinance()})
}

function stageRehearsal(){
 if(!concertRequirementMet())return toast(`공연을 열 수 있는 수준이 되어야 리허설도 가능합니다. ${concertRequirementText()}`);
 if(state.preparation?.stageReady)return toast('이미 다음 무대를 위한 리허설을 마쳤습니다.');
 if(state.stats.money<50000)return toast('공연장 리허설 대관비 5만원이 필요합니다.');
 if(!costHp(10))return;stat('money',-50000);stat('stress',-4);state.preparation.stageReady=true;state.preparation.stageReadyDay=state.day;showDialogue('류현상','공연장의 실제 동선과 음향을 확인했다. 다음 오디션·공연·방송에서 준비 보너스를 받는다.');advance(1)
}
function useBakcas(fromItemMenu=false){
 if(state.items.bakcas<1){toast('박칵스가 없습니다.');if(fromItemMenu)openItemMenu();return false}
 if(state.items.bakcasUsedToday>=2){toast('오늘은 박칵스를 더 마실 수 없습니다.');if(fromItemMenu)openItemMenu();return false}
 if(state.stats.hp>=100){toast('체력이 이미 최대입니다.');if(fromItemMenu)openItemMenu();return false}
 const before=snapshotActionResult();
 state.items.bakcas--;
 state.items.bakcasUsedToday++;
 stat('hp',state.items.bakcasUsedToday===1?25:20);
 if(state.items.bakcasUsedToday===2)stat('stress',4);
 showDialogue('류현상',state.items.bakcasUsedToday===1?pickActionDialogue('bakcas'):'두 번째 박칵스를 마셨다. 정신은 들었지만 심장이 빠르게 뛰고 스트레스가 조금 쌓였다.');
 save(false);render();
 if(fromItemMenu){appendStatChangesToDialogue(describeActionResult(before));openItemMenu()}
 return true
}
const STORE_JOB_STAGES={
 work:{counter:'workCount',label:'편의점 알바',rewards:[45000,55000,70000,90000]},
 stockWork:{counter:'stockWorkCount',label:'야간 진열 보조',rewards:[25000,32000,42000,55000]}
};
function storeJobInfo(key,afterCount=null){
 const def=STORE_JOB_STAGES[key],count=afterCount===null?state.storeJobs[def.counter]:afterCount;
 const stage=count>=80?3:count>=30?2:count>=10?1:0;
 const next=stage===0?10:stage===1?30:stage===2?80:null;
 return {def,count,stage,reward:def.rewards[stage],name:stage===0?'수습':`${stage}단계`,next}
}
function finalizeStoreJobReward(key,bonusRate=0,bonusLabel=''){
 const infoBefore=storeJobInfo(key),def=infoBefore.def;
 state.storeJobs[def.counter]++;
 const info=storeJobInfo(key),promoted=info.stage>infoBefore.stage;
 const bonus=Math.max(0,Math.floor(info.reward*Math.max(0,Number(bonusRate)||0)));
 stat('money',info.reward+bonus);stat('vocal',-2);stat('compose',-2);
 if(key==='stockWork')stat('stress',4);else stat('stress',8+(state.economy.workStreak>=3?5:0));
 state.career.totalWork++;if(key==='work')state.exp+=4;
 const progress=info.next?`다음 단계까지 ${info.count}/${info.next}회`:`최고 단계 달성 · 누적 ${info.count}회`;
 const fatigue=key==='work'&&state.economy.workStreak>=3?' 연속 근무로 피로가 크게 쌓였다.':'';
 const promotion=promoted?` ${info.name}로 승급해 급여가 올랐다!`:'';
 const mini=bonus?` 테트리스 ${bonusLabel||'보너스'}로 추가 수당 ${bonus.toLocaleString()}원을 받았다.`:'';
 showDialogue('류현상',`${pickActionDialogue('work')} ${def.label} ${info.name} 급여 ${info.reward.toLocaleString()}원을 받았다.${mini}${promotion} 반복 근무로 보컬과 작곡 능력이 각각 2 감소했다.${fatigue} ${progress}.`);
 advance(1)
}
function storeJobAction(key){
 if(key==='stockWork'){
  if(!costHp(12,'stockWork'))return;
 }else{
  const prevStreak=state.economy.workStreak,prevLastWorkDay=state.economy.lastWorkDay;
  if(state.economy.lastWorkDay===state.day)state.economy.workStreak=Math.max(1,state.economy.workStreak);
  else if(state.economy.lastWorkDay===state.day-1)state.economy.workStreak=Math.max(1,state.economy.workStreak+1);
  else state.economy.workStreak=1;
  state.economy.lastWorkDay=state.day;
  const hpCost=Math.min(36,22+Math.max(0,state.economy.workStreak-1)*2);
  if(!costHp(hpCost,'work')){state.economy.workStreak=prevStreak;state.economy.lastWorkDay=prevLastWorkDay;return}
 }
 if(Math.random()<.08){startStoreTetris(key);return}
 finalizeStoreJobReward(key,0,'')
}

const drawerPhotoCatalog=[
 {id:0,title:'어린 시절인 나',image:'assets/images/drawer-photo-1.jpg',caption:'아주 오래전, 지금의 류현상이 되기 훨씬 전의 작고 귀여운 하루.',preferred:['work','stockWork']},
 {id:1,title:'앞니플러팅인 나',image:'assets/images/drawer-photo-2.jpg',caption:'무대 조명 같은 빛 아래에서 스쳐 지나가듯 남은, 장난스러운 웃음.',preferred:['walk']},
 {id:2,title:'짧은 머리인 나',image:'assets/images/drawer-photo-3.jpg',caption:'누군가를 기다리는 듯, 혹은 자기 마음을 들여다보는 듯한 고요한 시선.',preferred:['vocal']},
 {id:3,title:'단발인 나',image:'assets/images/drawer-photo-4.jpg',caption:'긴 머리와 무표정한 얼굴 뒤에 더 많은 생각을 숨기고 있던 때.',preferred:['compose']},
 {id:4,title:'팬미팅하는 나',image:'assets/images/drawer-photo-5.jpg',caption:'조용히 기타를 쥐고 있던 손끝에, 노래가 시작되기 전의 긴장이 머물던 순간.',preferred:['arrange']},
 {id:5,title:'버스킹하는 나',image:'assets/images/drawer-photo-6.jpg',caption:'수많은 불빛과 시선이 밤하늘의 별처럼 번지던 순간. 노래 하나가 사람들을 같은 마음으로 묶어 주었다.',preferred:['busking','concert','walk']},
 {id:6,title:'열창하는 나',image:'assets/images/drawer-photo-7.jpg',caption:'보랏빛 저녁 하늘 아래 마이크를 쥔 채, 가장 솔직한 목소리를 꺼내던 장면.',preferred:['vocal','concert','broadcast']}
];
const drawerDiaryEntries=[
 {id:'d01',title:'불 꺼진 방',requires:'general',text:'오늘도 방 안에는 기타와 냉장고 소리만 남았다. 누군가 내 노래를 기다린다는 확신은 없지만, 내일의 내가 오늘보다 덜 부끄럽도록 한 줄은 적어 두기로 했다.\n\n유명해지는 것보다 계속하는 일이 더 어려운 것 같다. 그래서 오늘도 계속했다.'},
 {id:'d02',title:'냉장고 안의 현실',requires:'general',text:'냉장고를 열었더니 물과 김치뿐이었다. 닫고 나서 다시 열어 봤지만 새로운 반찬은 생기지 않았다.\n\n돈이 없다는 사실은 매일 똑같은데, 이상하게도 노래를 만들 때만큼은 내일이 달라질 것처럼 느껴진다.'},
 {id:'d03',title:'조회수 17회',requires:'general',text:'오늘 올린 영상 조회수는 17회였다. 그중 몇 번이 내 클릭인지 세지 않기로 했다.\n\n숫자가 작아도 화면 너머에서 끝까지 들어 준 사람이 한 명쯤은 있을 것이다. 그 한 명을 속이지 않는 노래를 해야겠다.'},
 {id:'d04',title:'얇은 벽',requires:'general',text:'고음을 내자 아랫집에서 천장을 두드렸다. 오늘 연습은 이불을 뒤집어쓴 채 작은 목소리로 이어 갔다.\n\n좋은 환경이 생길 때까지 기다리다가는 아무것도 못 할 것 같다. 불편한 방식이라도 지금 할 수 있는 것을 하자.'},
 {id:'d05',title:'긴 머리',requires:'general',text:'머리를 자르면 편할 것 같다는 생각을 했다. 그런데 거울을 보니 이 머리까지 자르면 무명 시절의 나도 함께 사라질 것 같았다.\n\n사람들이 기억하는 모습보다 내가 버텨 온 시간을 기억하기 위해 조금 더 길러 보기로 했다.'},
 {id:'d06',title:'월세 문자',requires:'general',text:'월세 자동이체 문자가 왔다. 음악 이야기만 하고 살고 싶지만 숫자는 언제나 정확한 날짜에 찾아온다.\n\n현실을 외면하지 않으면서도 꿈을 포기하지 않는 방법을 아직 배우는 중이다.'},
 {id:'d07',title:'새벽의 후렴',requires:'general',text:'잠들기 직전에 후렴 한 줄이 떠올랐다. 다시 일어나 적을까 고민하다가 결국 휴대전화를 켰다.\n\n좋은 문장은 기다려 주지 않는다. 내일 피곤하더라도 오늘의 문장을 붙잡는 편이 낫다.'},
 {id:'d08',title:'첫 편의점 근무',requires:'work',text:'계산대 앞에 서 있으니 무대보다 더 긴장됐다. 손님은 내 노래를 평가하지 않았지만 계산 실수는 바로 알아챘다.\n\n생계를 위한 일이 음악과 멀어 보였는데, 사람들의 말투와 표정을 가까이서 보는 것도 언젠가 가사가 될 수 있겠다는 생각이 들었다.'},
 {id:'d09',title:'새벽 두 시의 전자레인지',requires:'work',text:'매장에 아무도 없을 때 전자레인지 완료음이 울렸다. 네 음뿐인데 이상하게 좋은 멜로디처럼 들렸다.\n\n피곤하면 무엇이든 노래가 된다. 문제는 그 멜로디를 퇴근할 때까지 기억하는 것이다.'},
 {id:'d10',title:'봉투값 백 원',requires:'work',text:'봉투값 백 원 때문에 손님과 한참 실랑이를 했다. 무대에서는 야유를 받아도 노래를 이어 가는데 계산대에서는 백 원이 사람을 흔든다.\n\n오늘은 노래보다 인내심을 연습한 날이었다.'},
 {id:'d11',title:'나를 알아본 손님',requires:'work',text:'손님 한 명이 공원에서 노래하는 사람 아니냐고 물었다. 나는 영수증을 건네며 오늘은 계산하는 사람이라고 답했다.\n\n부끄럽기도 했지만 누군가 내 얼굴과 노래를 함께 기억했다는 사실이 하루 종일 마음에 남았다.'},
 {id:'d12',title:'야간 진열의 리듬',requires:'work',text:'음료 캔을 줄 맞춰 놓는 일이 드럼 패턴처럼 느껴졌다. 같은 동작을 반복하다 보니 복잡했던 생각이 조금 정리됐다.\n\n반복은 지루하지만, 노래도 결국 같은 한 소절을 수십 번 다시 부르는 일이다.'},
 {id:'d13',title:'첫 음부터 다시',requires:'practice',text:'오늘 연습은 첫 음에서 계속 흔들렸다. 열 번쯤 반복하니 화가 났고, 스무 번을 넘기니 오히려 아무 감정도 없어졌다.\n\n마지막 한 번이 가장 나았다. 포기 직전에 한 번 더 해 보는 습관을 들이고 싶다.'},
 {id:'d14',title:'고음 뒤의 침묵',requires:'vocal50',text:'높은 음을 성공하고 나면 기쁜 것보다 다음에도 똑같이 낼 수 있을지 먼저 걱정된다. 우연히 된 것을 실력이라고 부를 수는 없다.\n\n내일도 같은 음을 내기 위해 오늘의 호흡을 기록해 둔다.'},
 {id:'d15',title:'목이 쉬는 날',requires:'practice',text:'목소리가 생각대로 나오지 않았다. 억지로 밀어붙이면 더 나빠질 것 같아 낮은 음과 호흡만 확인했다.\n\n쉬는 것도 연습이라는 말을 이제 조금 이해한다. 다만 쉬는 동안에도 마음까지 멈추지는 않기를.'},
 {id:'d16',title:'지운 가사',requires:'compose',text:'오늘 쓴 가사의 절반을 지웠다. 남은 문장보다 지운 문장이 더 많았지만, 적어도 거짓말 같은 표현은 줄었다.\n\n멋있는 말보다 내 입으로 부를 수 있는 말을 남기는 편이 낫다.'},
 {id:'d17',title:'코드 하나의 차이',requires:'compose',text:'같은 멜로디에 코드 하나를 바꿨더니 곡의 표정이 완전히 달라졌다. 사람도 작은 선택 하나로 다른 하루를 살게 되는 걸까.\n\n오늘은 음악이 내 생각보다 정직하다고 느꼈다.'},
 {id:'d18',title:'작업 파일 27번',requires:'compose',text:'파일 이름이 final, final2, real_final을 지나 27번까지 갔다. 완성이라는 단어를 너무 쉽게 붙인 것 같다.\n\n그래도 첫 번째 파일과 비교하니 분명 나아졌다. 끝이 없는 수정도 방향만 맞으면 성장일 수 있다.'},
 {id:'d19',title:'내 노래를 부르는 일',requires:'compose50',text:'커버곡은 이미 길이 나 있지만 자작곡은 내가 길을 만들어야 한다. 그래서 더 느리고 더 무섭다.\n\n언젠가 누군가 내 노래를 커버하게 된다면 오늘의 막막함도 웃으며 기억할 수 있을까.'},
 {id:'d20',title:'첫 버스킹',requires:'busking',text:'첫 곡이 끝났는데 박수가 없었다. 두 번째 곡을 시작하는 몇 초가 오늘 가장 길었다.\n\n아무도 듣지 않는 것 같아도 끝까지 부르는 사람이 가수라면, 오늘 나는 아주 조금 가수에 가까워졌다.'},
 {id:'d21',title:'벤치의 관객',requires:'busking',text:'늘 같은 벤치에 앉아 마지막 곡까지 듣는 사람이 있다. 박수도 말도 없지만 오늘은 캔커피를 하나 두고 갔다.\n\n표현하지 않는 마음도 있다는 걸 기억해야겠다. 숫자에 잡히지 않는 관객을 위해서도 진심을 다하자.'},
 {id:'d22',title:'비 오는 무대',requires:'busking',text:'비가 오자 관객은 줄었지만 소리는 더 선명하게 퍼졌다. 젖은 장비가 걱정됐지만 마지막 곡까지 불렀다.\n\n좋은 날씨만 기다리면 좋은 무대도 늦어진다.'},
 {id:'d23',title:'첫 공연장',requires:'concert',text:'무대 뒤에서 손바닥의 땀을 셔츠에 닦았다. 객석이 어두워 얼굴이 보이지 않자 오히려 마음이 편해졌다.\n\n첫 음을 내는 순간 공원과 연습실에서의 시간이 한꺼번에 떠올랐다. 무대는 갑자기 생기는 것이 아니라 쌓여서 만들어지는 것 같다.'},
 {id:'d24',title:'앵콜',requires:'concert',text:'공연이 끝난 뒤 앵콜 소리를 들었다. 준비한 곡은 없었지만 다시 무대에 나갔다.\n\n누군가 더 듣고 싶다고 말해 주는 순간을 오래 기억하고 싶다. 다음에는 그 기대에 당황하지 않도록 한 곡을 더 준비하자.'},
 {id:'d25',title:'공연 후 빈 객석',requires:'concert',text:'관객이 모두 나간 뒤 빈 객석을 한동안 바라봤다. 조금 전까지 가득했던 소리가 거짓말처럼 사라졌다.\n\n화려한 순간보다 끝난 뒤의 조용함이 더 오래 남는다. 그 조용함을 견디는 법도 배워야 한다.'},
 {id:'d26',title:'처음 생긴 팬',requires:'fans100',text:'공연이 끝난 뒤 누군가 조심스럽게 사인을 부탁했다. 사인을 정해 둔 적이 없어 이름을 평소보다 크게 썼다.\n\n종이 한 장을 그렇게 소중히 받아 가는 모습을 보니 앞으로 함부로 행동하면 안 되겠다는 생각이 들었다.'},
 {id:'d27',title:'팬의 긴 편지',requires:'fans100',text:'팬이 건넨 편지에는 내 노래를 들으며 버틴 날들이 적혀 있었다. 나는 그 사람이 힘들 때 무엇을 했는지 모르지만, 내 목소리는 그 곁에 있었다.\n\n노래를 만드는 일이 생각보다 더 큰 책임일 수 있다는 걸 처음 느꼈다.'},
 {id:'d28',title:'댓글을 읽는 밤',requires:'sns',text:'좋은 댓글은 여러 번 읽고, 나쁜 댓글은 더 여러 번 읽었다. 왜 마음은 아픈 문장을 더 오래 붙잡는지 모르겠다.\n\n내일은 응원해 준 사람의 말을 먼저 기억해 보기로 했다.'},
 {id:'d29',title:'팬 만 명',requires:'fans10000',text:'팬 숫자가 만 명을 넘었다. 기쁜데도 실감이 나지 않아 화면을 몇 번이나 새로고침했다.\n\n만 명 모두를 알 수는 없지만, 무대에 설 때 한 사람씩 마주한다는 마음은 잊지 말아야겠다.'},
 {id:'d30',title:'해외에서 온 인사',requires:'overseas',text:'알아듣지 못하는 언어로 긴 메시지가 왔다. 번역기를 돌리니 내 노래가 먼 나라의 새벽을 함께했다는 내용이었다.\n\n말은 달라도 슬픔과 위로가 비슷하다는 사실이 신기했다.'},
 {id:'d31',title:'팬에게 잘한다는 것',requires:'fans1000',text:'팬에게 잘한다는 건 모든 부탁을 들어주는 일이 아닐 것이다. 오래 노래하고, 약속을 지키고, 무대에서 대충하지 않는 것.\n\n오늘부터 작은 공연일수록 더 집중하기로 했다.'},
 {id:'d32',title:'후라보노의 잔소리',requires:'manager',text:'후라보노가 일정표와 영수증을 들고 한참 잔소리를 했다. 귀찮아서 대충 대답했지만, 그가 없었다면 놓쳤을 일이 너무 많았다.\n\n고맙다는 말은 다음에 하기로 했다. 다음이 너무 늦지 않으면 좋겠다.'},
 {id:'d33',title:'매니저의 빈자리',requires:'manager',text:'오늘은 후라보노가 잠시 자리를 비웠다. 연락과 이동, 장비 확인을 혼자 하니 평소 당연하게 지나친 일이 보였다.\n\n무대에 혼자 서도 혼자 만든 무대는 아니라는 걸 잊지 말자.'},
 {id:'d34',title:'첫 합주',requires:'band',text:'각자 잘하는 소리만 내니 처음에는 곡이 아니라 소음 같았다. 몇 번을 멈추고 다시 맞추자 어느 순간 한 곡처럼 들렸다.\n\n함께한다는 건 나를 더 크게 만드는 게 아니라 조금씩 양보해 자리를 만드는 일인 것 같다.'},
 {id:'d35',title:'멤버와의 다툼',requires:'band',text:'편곡 방향 때문에 목소리가 높아졌다. 집에 돌아와 생각하니 내 의견을 설명한 게 아니라 밀어붙였다는 걸 알았다.\n\n내일 먼저 사과해야겠다. 좋은 곡을 만들기 전에 좋은 팀을 망치면 아무 의미가 없다.'},
 {id:'d36',title:'합주가 끝난 뒤',requires:'band',text:'연습보다 배달 메뉴를 고르는 데 더 오래 걸렸다. 음악 이야기는 진지했지만 탕수육 소스 앞에서는 모두 어린애가 됐다.\n\n이런 쓸데없는 시간이 팀을 오래 가게 할지도 모른다.'},
 {id:'d37',title:'어머니의 전화',requires:'general',text:'어머니는 활동은 잘하고 있는지보다 밥은 먹었는지 먼저 물었다. 괜찮다고 대답했지만 냉장고 상태는 말하지 않았다.\n\n성공한 모습을 보여 드리고 싶다는 마음이 가끔은 노래보다 더 무겁다.'},
 {id:'d38',title:'집에 다녀온 날',requires:'day330',text:'오랜만에 어머니를 만나고 돌아왔다. 건강을 챙기고 팬들에게 잘하라는 말을 여러 번 들었다.\n\n잔소리처럼 들려 크게 대답했지만, 집에 와서 생각하니 틀린 말이 하나도 없었다.'},
 {id:'d39',title:'어린 시절의 노래',requires:'general',text:'어릴 때 집에서 불렀던 노래가 문득 떠올랐다. 그때는 음정도 미래도 신경 쓰지 않고 그냥 좋아서 불렀다.\n\n기술이 늘수록 그 마음을 잃지 않는 것이 더 어려워진다.'},
 {id:'d40',title:'보여 드리고 싶은 무대',requires:'concert',text:'언젠가 어머니를 가장 좋은 자리에 모시고 공연하고 싶다. 유명해졌다는 증명보다 내가 포기하지 않았다는 걸 보여 드리고 싶다.\n\n그날까지 건강하게 노래해야 한다.'},
 {id:'d41',title:'카드 한 장의 설렘',requires:'cards',text:'팩을 뜯기 전의 몇 초가 이상하게 즐겁다. 결과가 좋지 않아도 다음 장에는 뭔가 있을 것 같은 기대가 남는다.\n\n음악도 비슷하다. 다음 곡이 잘될 거라는 믿음으로 또 만든다.'},
 {id:'d42',title:'팔지 못한 카드',requires:'cards100',text:'돈이 필요해 카드를 정리하다가 몇 장은 끝내 팔지 못했다. 비싼 카드라서가 아니라 그 카드를 뽑았던 날이 떠올랐기 때문이다.\n\n물건에도 시간이 붙으면 가격으로만 계산할 수 없게 된다.'},
 {id:'d43',title:'SP 카드',requires:'sp',text:'SP 카드가 나오는 순간 나도 모르게 소리를 질렀다. 무대에서 큰 박수를 받을 때와는 다른 종류의 기쁨이었다.\n\n가끔은 아무 목적 없이 좋아하는 것이 있어야 버틸 수 있다.'},
 {id:'d44',title:'내 노래가 세상에 나온 날',requires:'album',text:'앨범이 공개됐다. 수십 번 들은 곡인데 스트리밍 화면에서 재생하니 전혀 다른 사람의 노래처럼 느껴졌다.\n\n이제 이 곡은 내 방을 떠나 누군가의 하루에 들어간다. 잘 다녀오라고 말해 주고 싶다.'},
 {id:'d45',title:'넓어진 집',requires:'housing2',text:'집이 넓어졌는데 처음 며칠은 한쪽 구석에서만 생활했다. 작은 방에 익숙해져 빈 공간이 오히려 낯설었다.\n\n환경은 달라졌지만 책상 앞에서 고민하는 모습은 그대로다. 그 사실이 조금 안심됐다.'},
 {id:'d46',title:'유명해진다는 것',requires:'fame50',text:'길에서 알아보는 사람이 늘었다. 기쁘면서도 평범하게 걷는 방법을 잊어가는 기분이 든다.\n\n사람들이 보는 모습과 혼자 있을 때의 내가 너무 멀어지지 않았으면 좋겠다.'},
 {id:'d47',title:'창밖의 그림자',requires:'stalker',text:'요즘 누군가 지켜보는 듯한 기분이 자주 든다. 예민해진 것이라고 넘기려 했지만 같은 그림자가 반복해서 보였다.\n\n팬의 관심과 위험한 집착은 다르다. 혼자 해결하려 하지 말고 주변에 알려야 한다.'},
 {id:'d48',title:'일 년을 앞두고',requires:'day300',text:'활동을 시작한 지 거의 일 년이 됐다. 잘하고 있는지, 이 길이 맞는지 같은 질문은 아직 사라지지 않았다.\n\n다만 처음과 다른 점은 나를 기다리는 관객과 팬의 얼굴이 떠오른다는 것이다.'},
 {id:'d49',title:'다음 무대',requires:'general',text:'지금까지 가장 좋은 무대를 떠올려 봤다. 완벽한 날은 아니었지만 내가 끝까지 집중했던 날이었다.\n\n다음 무대의 크기는 고를 수 없어도, 얼마나 진심을 다할지는 내가 고를 수 있다.'},
 {id:'d50',title:'계속 노래하는 이유',requires:'day360',text:'미래가 어떻게 될지는 여전히 모르겠다. 월드스타가 될 수도, 작은 무대에 남을 수도 있다.\n\n확실한 건 노래를 멈춘 나보다 계속 부르는 내가 더 나답다는 것이다. 내일도 한 곡을 시작하자.'}
];
function drawerEscape(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function drawerEntryAvailable(entry){const req=entry.requires||'general',work=(state.storeJobs?.workCount||0)+(state.storeJobs?.stockWorkCount||0),members=Object.values(state.band?.members||{}).filter(Boolean).length;const map={general:true,work:work>0,practice:(state.stats.vocal>22||state.stats.compose>16),vocal50:state.stats.vocal>=50,compose:state.stats.compose>16,compose50:state.stats.compose>=50,busking:(state.career?.totalBusking||0)>0,concert:(state.career?.totalConcerts||0)>0,fans100:state.stats.fans>=100,fans1000:state.stats.fans>=1000,fans10000:state.stats.fans>=10000,sns:(state.sns?.totalPosts||0)+(state.sns?.totalLives||0)>0,overseas:(state.fanGroups?.overseas||0)>0,manager:!!state.manager?.hired,band:members>0,day120:state.day>=120,day330:state.day>=330,cards:(state.gambling?.totalCardDraws||0)>0,cards100:totalCardInventory()>=100,sp:(state.gambling?.spDraws||0)>0,album:(state.albums||[]).length>0,housing2:(state.housing||0)>=2,fame50:fameLevel()>=50,stalker:!!state.stalker?.active||!!state.stalker?.resolved,day300:state.day>=300,day360:state.day>=360};return !!map[req]}
function drawerPhotoPieceCount(index){return (state.drawer?.photos?.[index]||[]).filter(Boolean).length}
function drawerTotalPhotoPieces(){return (state.drawer?.photos||[]).reduce((sum,pieces)=>sum+pieces.filter(Boolean).length,0)}
function drawerCompletedPhotos(){return drawerPhotoCatalog.filter(photo=>drawerPhotoPieceCount(photo.id)>=9)}
function rollDrawerPhotoPiece(actionKey){
 const eligible=['work','stockWork','walk','vocal','compose','arrange','busking','concert','broadcast'];if(!eligible.includes(actionKey)||drawerTotalPhotoPieces()>=drawerPhotoCatalog.length*9)return null;
 const streak=Math.max(0,Number(state.drawer.photoMissStreak)||0),chance=streak>=18?1:streak>=12?.10:.05;
 if(Math.random()>=chance){state.drawer.photoMissStreak=streak+1;return null}
 const incomplete=drawerPhotoCatalog.filter(photo=>drawerPhotoPieceCount(photo.id)<9);if(!incomplete.length)return null;
 const preferred=incomplete.filter(photo=>photo.preferred.includes(actionKey));const photo=preferred.length&&Math.random()<.72?pick(preferred):pick(incomplete);
 const missing=state.drawer.photos[photo.id].map((found,index)=>found?null:index).filter(index=>index!==null);const piece=pick(missing);state.drawer.photos[photo.id][piece]=true;state.drawer.photoMissStreak=0;state.drawer.newPhotos=true;
 const complete=drawerPhotoPieceCount(photo.id)===9;addHistory(`🧩 사진 조각 발견 · ${photo.title} ${drawerPhotoPieceCount(photo.id)}/9${complete?' · 사진 완성':''}`,`drawer-photo:${photo.id}:${piece}`);
 return {photo,piece,complete};
}
function drawerPhotoPieceImage(photo,index){return `assets/images/drawer-photo-${photo.id+1}-piece-${index+1}.jpg`}
function drawerDiscoveryNotice(discovery,onDone){const count=drawerPhotoPieceCount(discovery.photo.id),pieceImage=drawerPhotoPieceImage(discovery.photo,discovery.piece);showBlockingNotice(discovery.complete?'사진 완성':'사진 조각 발견',`<div class="drawer-discovery-card"><div class="drawer-discovery-piece" style="--drawer-piece-image:url('${pieceImage}')" aria-label="이번에 발견한 정사각형 사진 조각"></div><div><b>${drawerEscape(discovery.photo.title)}</b><p>${discovery.complete?'마지막 조각을 발견해 사진이 완성되었습니다. 전체 사진은 서랍에서 확인할 수 있습니다.':`사진 한 조각을 발견했습니다. 현재 ${count}/9조각입니다.`}</p><small>전체 사진은 정확한 3×3 정사각형 퍼즐로 완성됩니다.</small></div></div>`,onDone)}
function drawerDiaryById(id){return drawerDiaryEntries.find(entry=>entry.id===id)}
function checkDrawerDiaryToday(){
 if(state.drawer.diaryCheckedDay===state.day)return {id:state.drawer.todayDiaryId,message:state.drawer.todayMessage,isNew:false};
 state.drawer.diaryCheckedDay=state.day;state.drawer.todayDiaryId=null;
 const unseen=drawerDiaryEntries.filter(entry=>!state.drawer.diaries.includes(entry.id));if(!unseen.length){state.drawer.todayMessage='일기 50편을 모두 발견했다. 더 이상 가려진 페이지가 없다.';return {id:null,message:state.drawer.todayMessage,isNew:false}}
 const chance=state.drawer.diaryMissStreak>=5?1:.20;
 if(Math.random()<chance){const contextual=unseen.filter(entry=>entry.requires!=='general'&&drawerEntryAvailable(entry)),general=unseen.filter(entry=>entry.requires==='general');const pool=contextual.length&&Math.random()<.72?contextual:(general.length?general:contextual);const entry=pick(pool.length?pool:unseen);state.drawer.diaries.push(entry.id);state.drawer.diaryFoundDays[entry.id]=state.day;state.drawer.diaryMissStreak=0;state.drawer.todayDiaryId=entry.id;state.drawer.todayMessage=`오늘 날짜가 적힌 새로운 일기 「${entry.title}」을 발견했다.`;state.drawer.newDiary=true;addHistory(`📓 일기 발견 · ${entry.title}`,`drawer-diary:${entry.id}`);return {id:entry.id,message:state.drawer.todayMessage,isNew:true}}
 state.drawer.diaryMissStreak++;state.drawer.todayMessage='일기장을 펼쳐 보았지만 오늘 날짜에는 아무것도 적혀 있지 않았다.';return {id:null,message:state.drawer.todayMessage,isNew:false}
}
function drawerPuzzleMarkup(photo,large=false){return `<div class="drawer-puzzle ${large?'large':''}" aria-label="${drawerEscape(photo.title)} 3×3 정사각형 퍼즐">${state.drawer.photos[photo.id].map((found,index)=>`<div class="drawer-piece ${found?'found':'missing'}" ${found?`style="--drawer-piece-image:url('${drawerPhotoPieceImage(photo,index)}')"`:''}>${found?'':'?'}</div>`).join('')}</div>`}
function renderDrawerPhotos(){state.drawer.lastTab='photos';state.drawer.newPhotos=false;const pieces=drawerTotalPhotoPieces(),complete=drawerCompletedPhotos().length,totalPieces=drawerPhotoCatalog.length*9,totalPhotos=drawerPhotoCatalog.length;return `<div class="drawer-summary"><b>사진 조각 ${pieces}/${totalPieces}</b><span>완성 사진 ${complete}/${totalPhotos}</span></div><p class="drawer-help">편의점 알바·야간 진열·산책·보컬 연습·작곡 연습·신곡 편곡·버스킹·공연·방송 출연 중 낮은 확률로 조각을 발견합니다. 12회 연속 실패부터 확률이 오르고, 18회 연속 실패 후에는 다음 대상 행동에서 반드시 발견합니다.</p><div class="drawer-photo-grid">${drawerPhotoCatalog.map(photo=>{const count=drawerPhotoPieceCount(photo.id);return `<button class="drawer-photo-card" data-drawer-photo="${photo.id}">${drawerPuzzleMarkup(photo)}<span><b>${drawerEscape(photo.title)}</b><small>${count>=9?'완성':`${count}/9조각`}</small></span></button>`}).join('')}</div>`}
function renderDrawerDiary(){state.drawer.lastTab='diary';state.drawer.newDiary=false;const found=state.drawer.diaries.length;return `<div class="drawer-summary"><b>류현상의 일기 ${found}/50</b><span>${state.drawer.diaryMissStreak>=5?'다음 확인 확정':'하루 첫 확인 20%'}</span></div><p class="drawer-help">서랍을 그날 처음 열 때만 오늘 일기가 적혀 있는지 판정합니다. 5번 연속 발견하지 못하면 다음 확인에서 반드시 한 편을 발견합니다.</p><div class="drawer-diary-list">${drawerDiaryEntries.map((entry,index)=>{const seen=state.drawer.diaries.includes(entry.id),day=state.drawer.diaryFoundDays[entry.id];return seen?`<button class="drawer-diary-row" data-drawer-diary="${entry.id}"><span>${String(index+1).padStart(2,'0')}</span><div><b>${drawerEscape(entry.title)}</b><small>${day}일차에 발견</small></div></button>`:`<div class="drawer-diary-row locked"><span>${String(index+1).padStart(2,'0')}</span><div><b>????</b><small>아직 발견하지 못한 일기</small></div></div>`}).join('')}</div>`}
function bindDrawerUi(){
 $$('[data-drawer-tab]').forEach(button=>button.onclick=()=>renderDrawerModal(button.dataset.drawerTab));
 $$('[data-drawer-photo]').forEach(button=>button.onclick=()=>openDrawerPhoto(Number(button.dataset.drawerPhoto)));
 $$('[data-drawer-diary]').forEach(button=>button.onclick=()=>openDrawerDiary(button.dataset.drawerDiary));
}
function renderDrawerModal(tab=state.drawer.lastTab||'photos'){
 const result=checkDrawerDiaryToday();if(tab==='diary'){state.drawer.lastTab='diary';state.drawer.newDiary=false}else{state.drawer.lastTab='photos';state.drawer.newPhotos=false}
 save(false);render();
 const modal=$('#modal');modal.classList.add('drawer-dialog');$('#modalTitle').textContent='서랍 · 추억 보관함';
 $('#modalBody').innerHTML=`<div class="drawer-shell"><div class="drawer-today ${result.isNew?'new-entry':''}"><b>${result.isNew?'새로운 일기 발견':'오늘의 일기장'}</b><p>${drawerEscape(result.message)}</p>${result.id?`<button data-drawer-diary="${result.id}" class="primary">오늘 일기 읽기</button>`:''}</div><div class="drawer-tabs"><button data-drawer-tab="photos" class="${tab==='photos'?'active':''}">사진 ${state.drawer.newPhotos?'<i></i>':''}</button><button data-drawer-tab="diary" class="${tab==='diary'?'active':''}">일기 ${state.drawer.newDiary?'<i></i>':''}</button></div><section class="drawer-content">${tab==='diary'?renderDrawerDiary():renderDrawerPhotos()}</section></div>`;
 bindDrawerUi();syncToastLayer();
}
function openDrawer(tab){showModal('서랍 · 추억 보관함','');renderDrawerModal(tab||state.drawer.lastTab||'photos')}
function openDrawerPhoto(index){const photo=drawerPhotoCatalog[index];if(!photo)return;const modal=$('#modal');if(!modal.open)showModal(photo.title,'');modal.classList.add('drawer-dialog');const count=drawerPhotoPieceCount(index),complete=count>=9;$('#modalTitle').textContent=photo.title;$('#modalBody').innerHTML=`<div class="drawer-detail"><button id="drawerBack" class="drawer-back">← 사진 목록</button>${drawerPuzzleMarkup(photo,true)}<h3>${drawerEscape(photo.title)}</h3><p>${complete?drawerEscape(photo.caption):`아직 ${9-count}개의 조각이 비어 있다.`}</p>${complete?'<span class="drawer-complete-stamp">사진 완성</span>':''}</div>`;$('#drawerBack').onclick=()=>renderDrawerModal('photos')}
function openDrawerDiary(id){const entry=drawerDiaryById(id);if(!entry||!state.drawer.diaries.includes(id))return;state.drawer.newDiary=false;save(false);render();$('#modalTitle').textContent=`일기 · ${entry.title}`;$('#modalBody').innerHTML=`<article class="drawer-diary-paper"><button id="drawerBack" class="drawer-back">← 일기 목록</button><small>${state.drawer.diaryFoundDays[id]}일차에 발견한 기록</small><h3>${drawerEscape(entry.title)}</h3>${entry.text.split('\n\n').map(paragraph=>`<p>${drawerEscape(paragraph)}</p>`).join('')}</article>`;$('#drawerBack').onclick=()=>renderDrawerModal('diary')}

function doAction(key){
 if(state.specialScene?.active)return toast('진행 중인 특별 이벤트를 먼저 마쳐 주세요.');
 const actionResultBefore=snapshotActionResult();
 const s=state.stats;
 const f={
 rest:()=>{const atHome=state.location==='home',gain=atHome?restAmount():15;state.restNightmares=state.restNightmares||{totalRests:0,lastTriggeredRest:0,seen:[]};state.restNightmares.totalRests++;state.restStreak=(state.restStreak||0)+1;let repeated='',vocalLoss=0,composeLoss=0;if(state.restStreak>=2){vocalLoss=Math.min(1,state.stats.vocal);composeLoss=Math.min(1,state.stats.compose);stat('vocal',-vocalLoss);stat('compose',-composeLoss);state.restStreak=0;repeated=` 연속으로 두 번 깊은 휴식을 해 보컬 -${vocalLoss}, 작곡 -${composeLoss}.`;addHistory(`🛌 과도한 휴식 · 보컬 -${vocalLoss}, 작곡 -${composeLoss}`,`double-rest:${state.day}:${state.time}`)}stat('hp',gain);stat('stress',atHome?-10:-6);showDialogue('류현상',atHome?`${pickActionDialogue('rest')} 현재 집에서는 체력 ${gain}을 회복했고 반나절이 지났다.${repeated}`:`잠깐 앉아 호흡을 고르고 체력 ${gain}을 회복했다. 집이 아니어서 깊게 쉬지는 못했다.${repeated}`);advance(2,'rest')},
 drawer:()=>{pendingLocationActionStress=false;openDrawer()},
 meditate:()=>{state.dailyUse=state.dailyUse||{};if(state.dailyUse.meditationDay!==state.day){state.dailyUse.meditationDay=state.day;state.dailyUse.meditationCount=0}if((state.dailyUse.meditationCount||0)>=2)return toast('명상은 하루에 두 번만 할 수 있습니다.');if(s.stress<=0)return toast('스트레스가 이미 최저입니다.');state.dailyUse.meditationCount=(state.dailyUse.meditationCount||0)+1;stat('stress',-5);pendingLocationActionStress=false;showDialogue('류현상',`${pickActionDialogue('meditate')} 오늘 명상 ${state.dailyUse.meditationCount}/2회를 마쳤다. 비용과 시간은 소모되지 않는다.`);save(false);render()},
 compose:()=>trainingAction('compose',10),
 meal:()=>{if((state.items.mealsToday||0)>=2)return toast('오늘은 더 이상 식사할 수 없습니다.');if(s.hp>=100)return toast('체력이 이미 최대입니다.');const cost=mealCost();if(s.money<cost)return toast(`식사 비용 ${cost.toLocaleString()}원이 필요합니다.`);const gain=mealRecovery();if(Math.random()<.15){startCookingTycoon(actionResultBefore,cost,gain);return}state.items.mealsToday=(state.items.mealsToday||0)+1;stat('money',-cost);stat('hp',gain);showDialogue('류현상',`${pickActionDialogue('meal')} ${housingInfo[state.housing][0]} 생활비 기준으로 ${cost.toLocaleString()}원을 사용해 체력 ${gain}을 회복했다. 식사에는 시간이 지나지 않는다.`);save(false);render()},
 wardrobe:()=>openWardrobe(),
 fleaMarket:()=>openFleaMarket(),
 bakcas:()=>useBakcas(false),
 moveHome:()=>moveHome(),finance:()=>openFinance(),
 
 stockWork:()=>storeJobAction('stockWork'),
 work:()=>storeJobAction('work'),
 buyBakcas:()=>{if((state.items.bakcasBoughtToday||0)>=3)return toast('오늘은 박칵스를 더 구입할 수 없습니다. 하루 최대 3개입니다.');if(s.money<15000)return toast('돈이 부족합니다.');stat('money',-15000);state.items.bakcas++;state.items.bakcasBoughtToday=(state.items.bakcasBoughtToday||0)+1;pendingLocationActionStress=false;showDialogue('류현상',actionStory('bakcas',`박칵스 하나를 가방에 넣었다. 오늘 구입 ${state.items.bakcasBoughtToday}/3개.`));save(false);render()},
 snack:()=>{if((state.items.snacksBoughtToday||0)>=3)return toast('오늘은 삼각김밥을 더 먹을 수 없습니다. 하루 최대 3개입니다.');if(s.hp>=100)return toast('체력이 이미 최대입니다.');if(s.money<2500)return toast('돈이 부족합니다.');stat('money',-2500);stat('hp',8);state.items.snacksBoughtToday=(state.items.snacksBoughtToday||0)+1;pendingLocationActionStress=false;showDialogue('류현상',`${pickActionDialogue('snack')} 삼각김밥으로 허기를 달랬다. 오늘 ${state.items.snacksBoughtToday}/3개를 먹었다. 시간도, 스트레스도 변하지 않았다.`);save(false);render()},
 storePromo:()=>{if(state.storeDaily.promoDay===state.day)return toast('매장 홍보 방송은 하루에 한 번만 할 수 있습니다.');if(!costHp(8))return;state.storeDaily.promoDay=state.day;const fanGain=8+Math.floor(Math.random()*13);stat('fans',fanGain);stat('fame',2);stat('stress',3);showDialogue('류현상',actionStory('work',`점장의 허락을 받아 매장 안내 방송 끝에 오늘의 버스킹 일정을 짧게 홍보했다. 무심한 척했지만 목소리를 알아본 손님들이 휴대전화를 꺼냈다. 팬 ${fanGain}명이 늘었다.`));advance(1)},
 digimonCard:()=>openDigimonCardHub(),digimonInventory:()=>openDigimonInventory(),lottery:()=>openLottery(),
 customerPractice:()=>{if(state.storeDaily.customerDay===state.day)return toast('단골 손님 응대는 하루에 한 번만 할 수 있습니다.');if(!costHp(6))return;state.storeDaily.customerDay=state.day;const tips=3000+Math.floor(Math.random()*5001);const fanGain=2+Math.floor(Math.random()*5);stat('money',tips);stat('fans',fanGain);stat('stress',1);showDialogue('류현상',actionStory('work',`자주 오던 손님의 부탁을 차분히 해결했다. 손님은 고맙다며 작은 팁을 남기고 버스킹 일정도 물었다. 팁 ${tips.toLocaleString()}원, 팬 ${fanGain}명이 늘었다.`));advance(1)},
 gear:()=>openGear(),vocal:()=>trainingAction('vocal',12),
 rehearse:()=>{if(!state.band.formed)return toast('먼저 밴드를 결성해야 합니다.');if(!costHp(18))return;state.band.bond=clamp(state.band.bond+12);state.soloStreak=0;const gain=gainSkill('vocal',2,'rehearse');showDialogue('류현상',`${pickActionDialogue('rehearse')}${gain===0?' 보컬은 일반 성장 한계인 95에 도달해 더 오르지 않았다.':''}`);advance(1)},
 recruit:()=>recruit(),arrange:()=>{if(!state.band.formed)return toast('밴드가 필요합니다.');if(!costHp(15))return;const gain=gainSkill('compose',2,'arrange');state.band.bond=clamp(state.band.bond+5);showDialogue('류현상',actionStory('rehearse',`각 악기의 빈자리를 줄이자 곡이 훨씬 선명해졌다.${gain===0?' 작곡은 일반 성장 한계인 95에 도달해 더 오르지 않았다.':''}`));advance(1)},
 album:()=>openAlbum(),busking:()=>busking(false),bandBusking:()=>busking(true),walk:()=>{state.dailyUse=state.dailyUse||{};if(state.dailyUse.walkDay!==state.day){state.dailyUse.walkDay=state.day;state.dailyUse.walkCount=0}if((state.dailyUse.walkCount||0)>=2)return toast('산책은 하루에 두 번만 할 수 있습니다.');state.dailyUse.walkCount=(state.dailyUse.walkCount||0)+1;const found=Math.random()<.01;stat('stress',-15);if(found){state.items.bakcas=(state.items.bakcas||0)+1;addHistory('⚡ 산책 중 박칵스 획득 · 가방에 1개를 넣었다.',`walk-bakcas:${state.day}:${Date.now()}`)}showDialogue('류현상',`${pickActionDialogue('walk')} 오늘 산책 ${state.dailyUse.walkCount}/2회를 마쳤다.${found?' 길가에서 개봉되지 않은 박칵스 한 병을 발견해 가방에 넣었다.':''}`);if(found){save(false);render();showBlockingNotice('박칵스 발견',`<div class="info-card"><b>산책 중 박칵스를 주웠습니다.</b><p>박칵스 1개가 아이템 보관함에 추가되었습니다.</p></div>`,()=>advance(1));return}advance(1)},flyerPromo:()=>{if(state.storeDaily.flyerDay===state.day)return toast('공연 전단 홍보는 하루에 한 번만 할 수 있습니다.');if(state.stats.money<20000)return toast('전단 제작비 2만원이 필요합니다.');if(!costHp(8))return;state.storeDaily.flyerDay=state.day;stat('money',-20000);const fanGain=8+Math.floor(Math.random()*8);stat('fans',fanGain);stat('fame',1);showDialogue('류현상',actionStory('busking',`공원 주변에 다음 버스킹 일정을 알리는 전단을 나눠 줬다. 팬 ${fanGain}명이 새로 관심을 보였다.`));advance(1)},audienceResearch:()=>{if(state.preparation?.buskingInsight)return toast('이미 다음 버스킹을 위한 관객 조사를 마쳤습니다.');if(!costHp(6))return;stat('stress',-3);state.preparation.buskingInsight=true;state.preparation.buskingInsightDay=state.day;showDialogue('류현상',actionStory('busking','공원 관객이 멈춰 서는 곡과 시간대를 살폈다. 다음 버스킹은 성공률과 팬 증가량이 상승한다.'));advance(1)},observe:()=>{if(state.storeDaily.observeDay===state.day)return toast('라이벌 관찰은 하루에 한 번만 할 수 있습니다.');if(state.stats.vocal>=95)return toast('보컬 95 이상은 특별 이벤트·앨범·대형 무대로만 성장할 수 있습니다.');if(!costHp(6))return;state.storeDaily.observeDay=state.day;const gain=gainSkill('vocal',1,'observe');stat('stress',1);showDialogue('류현상',pickActionDialogue('observe'));advance(1)},repair:()=>{if(!state.equipment.mic&&!state.equipment.amp)return toast('먼저 마이크나 음향장비를 구입해야 합니다.');const micNeeds=state.equipment.mic&&state.equipmentDurability.mic<equipmentMaxDurability('mic');const ampNeeds=state.equipment.amp&&state.equipmentDurability.amp<equipmentMaxDurability('amp');if(!micNeeds&&!ampNeeds){const status=`마이크 ${equipmentStatusText('mic')} · 음향장비 ${equipmentStatusText('amp')}`;showDialogue('장비 점검',`마이크와 음향장비 내구도가 이미 최대다. ${status}. 보호 케이스는 50회 소모품이라 점검으로 회복되지 않는다.`);toast('장비 내구도가 이미 최대입니다.');pendingLocationActionStress=false;save(false);render();return}if(s.money<50000)return toast('장비 점검비 50,000원이 필요합니다.');stat('money',-50000);if(state.equipment.mic)state.equipmentDurability.mic=equipmentMaxDurability('mic');if(state.equipment.amp)state.equipmentDurability.amp=equipmentMaxDurability('amp');state.equipmentDamage={mic:false,amp:false};const status=`마이크 ${equipmentStatusText('mic')} · 음향장비 ${equipmentStatusText('amp')}`;showDialogue('류현상',actionStory('rehearse',`장비 점검으로 마이크와 음향장비의 내구도를 전부 회복했다. ${status}. 보호 케이스는 소모품이라 회복되지 않는다.`));advance(1)},
 stageRehearsal:()=>stageRehearsal(),audition:()=>audition(),concert:()=>concert(),broadcast:()=>broadcast(),fanmeeting:()=>fanmeeting(),national:()=>national(),acting:()=>actingAction(),songSurvival:()=>startSongSurvival(),quizShow:()=>startQuizShow()
 };pendingLocationActionStress=['store','practice','stage'].includes(state.location)&&!['wardrobe','fleaMarket','gear','drawer','moveHome','finance','national','digimonCard','lottery','songSurvival','quizShow','buyBakcas'].includes(key);if(key!=='rest')state.restStreak=0;state.lastAction=key;if(!['wardrobe','fleaMarket','gear','album','manager','digimonInventory','drawer','songSurvival','quizShow'].includes(key))pulseScene(key);const soundMap={fleaMarket:'coin',stockWork:'coin',finance:'coin',flyerPromo:'tap',audienceResearch:'tap',stageRehearsal:'busking',work:'coin',buyBakcas:'coin',snack:'drink',meal:'drink',storePromo:'tap',customerPractice:'tap',digimonCard:'coin',lottery:'coin',bakcas:'drink',busking:'busking',bandBusking:'busking',concert:'busking',audition:'busking',repair:'coin'};playSfx(soundMap[key]||'tap');if(['vocal','compose'].includes(key))pendingTrainingActionBefore=actionResultBefore;f[key]?.();if(['vocal','compose'].includes(key)&&!memoryGameActive)pendingTrainingActionBefore=null;if(!['songSurvival','quizShow'].includes(key)&&!memoryGameActive)scheduleActionResultNotice(actionResultBefore);
}



// --- v173 편의점 테트리스 / 366일 이후 연기·러닝 미니게임 ---
function startStoreTetris(jobKey){
 beginMiniGameUi();let finished=false,started=false,time=90,score=0,lines=0,dropMs=520,last=0,raf=0,timer=0,countdownCancel=null;
 const COLS=10,ROWS=16,SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
 let board=Array.from({length:ROWS},()=>Array(COLS).fill(0)),piece=null;
 showModal('편의점 돌발 미니게임 · 테트리스',`<div class="store-tetris-game"><div class="mini-game-head"><div><b>밀려드는 상품 박스를 테트리스처럼 정리하세요!</b><small>스타트를 누르면 3초 카운트다운 후 시작합니다. 1분 30초 동안 버티고 줄을 지우면 오늘 급여가 증가합니다.</small></div><strong id="storeTetrisTimer">대기</strong></div><canvas id="storeTetrisCanvas" width="300" height="480"></canvas><div class="store-tetris-info"><span id="storeTetrisScore">점수 0</span><span id="storeTetrisLines">정리 0줄</span></div><div class="store-tetris-controls"><button data-tetris="left" disabled>◀</button><button data-tetris="rotate" disabled>회전</button><button data-tetris="right" disabled>▶</button><button data-tetris="down" disabled>▼</button></div><button id="storeTetrisStart" class="primary wide">스타트</button><small class="tetris-keyboard-hint">키보드: ← → 이동 · ↑ 회전 · ↓ 빠르게</small></div>`,'tetris');
 const canvas=$('#storeTetrisCanvas'),ctx=canvas.getContext('2d'),cell=30;
 function spawn(){const m=structuredClone(pick(SHAPES));piece={m,x:Math.floor((COLS-m[0].length)/2),y:0};if(collide(piece.x,piece.y,piece.m))finish()}
 function collide(x,y,m){for(let r=0;r<m.length;r++)for(let c=0;c<m[r].length;c++)if(m[r][c]){const xx=x+c,yy=y+r;if(xx<0||xx>=COLS||yy>=ROWS||(yy>=0&&board[yy][xx]))return true}return false}
 function rotate(){if(!piece)return;const m=piece.m[0].map((_,i)=>piece.m.map(row=>row[i]).reverse());if(!collide(piece.x,piece.y,m))piece.m=m}
 function lock(){piece.m.forEach((row,r)=>row.forEach((v,c)=>{if(v&&piece.y+r>=0)board[piece.y+r][piece.x+c]=1}));let cleared=0;for(let r=ROWS-1;r>=0;r--){if(board[r].every(Boolean)){board.splice(r,1);board.unshift(Array(COLS).fill(0));cleared++;r++}}if(cleared){lines+=cleared;score+=cleared*120;playSfx('success')}else score+=10;spawn();update()}
 function move(dx){if(piece&&!collide(piece.x+dx,piece.y,piece.m))piece.x+=dx}
 function down(){if(!piece)return;if(!collide(piece.x,piece.y+1,piece.m))piece.y++;else lock()}
 function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#111827';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='rgba(255,255,255,.08)';for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,ROWS*cell);ctx.stroke()}for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(COLS*cell,y*cell);ctx.stroke()}ctx.fillStyle='#f6c453';board.forEach((row,r)=>row.forEach((v,c)=>{if(v)ctx.fillRect(c*cell+2,r*cell+2,cell-4,cell-4)}));if(piece){ctx.fillStyle='#75d6ff';piece.m.forEach((row,r)=>row.forEach((v,c)=>{if(v)ctx.fillRect((piece.x+c)*cell+2,(piece.y+r)*cell+2,cell-4,cell-4)}))}}
 function update(){const a=$('#storeTetrisScore'),b=$('#storeTetrisLines');if(a)a.textContent=`점수 ${score}`;if(b)b.textContent=`정리 ${lines}줄`}
 function loop(ts){if(finished||!started)return;if(ts-last>dropMs){down();last=ts}draw();raf=requestAnimationFrame(loop)}
 function finish(aborted=false){if(finished)return;finished=true;if(countdownCancel)countdownCancel();countdownCancel=null;cancelAnimationFrame(raf);clearInterval(timer);removeEventListener('keydown',key);endMiniGameUi();activeTrainingAbort=null;closeModal(true);state.minigames.storeTetrisBest=Math.max(state.minigames.storeTetrisBest||0,score);const rate=aborted?0:lines>=4?.5:lines>=2?.35:score>=80?.2:.1;finalizeStoreJobReward(jobKey,rate,aborted?'중도 종료':`정리 ${lines}줄 · ${Math.round(rate*100)}%`)}
 function key(e){if(finished||!started)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowUp')rotate();else if(e.key==='ArrowDown')down();draw()}
 $$('[data-tetris]').forEach(b=>b.onclick=()=>{if(!started||finished)return;const a=b.dataset.tetris;if(a==='left')move(-1);if(a==='right')move(1);if(a==='rotate')rotate();if(a==='down')down();draw()});
 const startButton=$('#storeTetrisStart');startButton.onclick=()=>{if(started||finished||countdownCancel)return;startButton.disabled=true;startButton.textContent='준비 중...';countdownCancel=runTrainingCountdown(()=>{countdownCancel=null;if(finished)return;started=true;startButton.remove();$$('[data-tetris]').forEach(b=>b.disabled=false);const timerEl=$('#storeTetrisTimer');if(timerEl)timerEl.textContent='1:30';spawn();update();last=performance.now();addEventListener('keydown',key);raf=requestAnimationFrame(loop);timer=setInterval(()=>{time--;const el=$('#storeTetrisTimer');if(el)el.textContent=time>=60?`${Math.floor(time/60)}:${String(time%60).padStart(2,'0')}`:`${time}초`;if(time<=0)finish(false)},1000)})};
 activeTrainingAbort=()=>finish(true);draw();update();
}
function actingAction(){
 if(state.day<366)return toast('연기는 366일차부터 연습실에서 할 수 있습니다.');
 if(!costHp(14))return;state.career.actingCount=(state.career.actingCount||0)+1;stat('stress',2);const actingChance=Math.min(.9,.25+state.stats.looks/400+state.stats.fame/20000+(state.stats.acting||0)/500);const good=Math.random()<actingChance;const actingGain=good?2:1;const fans=good?8+Math.floor(Math.random()*15):2+Math.floor(Math.random()*6),fame=good?3+Math.floor(Math.random()*5):1;stat('acting',actingGain);stat('fans',fans);stat('fame',fame);if(good)state.career.actingHits=(state.career.actingHits||0)+1;state.exp+=good?8:4;
 const base=`대본을 들고 카메라 앞에서 짧은 장면을 연습했다. ${good?'표정과 발성이 자연스럽다는 말을 들었다.':'아직 카메라 앞 동선이 어색했지만 한 장면을 끝까지 마쳤다.'} 연기 +${actingGain} · 연기 경력 ${state.career.actingCount}회 · 팬 +${fans} · 인지도 +${fame}.`;
 if(firstKissSceneEligible()&&!state.specialEvents?.firstKissScene&&Math.random()<.55){startFirstKissScene(base);return}
 if(!state.specialEvents?.actingExtra&&Math.random()<.08){startActingExtraStory(base);return}
 if(Math.random()<.1){startActingRunner(base);return}showDialogue('류현상',base);advance(1)
}
function startActingRunner(baseText){
 beginMiniGameUi();let finished=false,time=22,score=0,items=0,lives=3,raf=0,last=0,spawnT=0;const canvasW=720,canvasH=300,ground=238;let y=ground-72,vy=0,jumping=false,obstacles=[],pickups=[];
 showModal('연기 돌발 미니게임 · 촬영장 러닝',`<div class="acting-runner"><div class="mini-game-head"><div><b>촬영장 장애물을 피해 끝까지 달리세요!</b><small>류현상 도트 캐릭터로 장애물을 피하고 음표 아이템을 먹습니다.</small></div><strong id="runnerTimer">22초</strong></div><canvas id="actingRunnerCanvas" width="720" height="300"></canvas><div class="runner-stats"><span id="runnerScore">점수 0</span><span id="runnerItems">아이템 0</span><span id="runnerLives">♥♥♥</span></div><button id="runnerJump" class="primary wide">점프</button><small>화면의 점프 버튼 또는 Space / ↑ 키</small></div>`);
 const canvas=$('#actingRunnerCanvas'),ctx=canvas.getContext('2d'),img=new Image();img.src='assets/images/ryu-dot.png';
 function jump(){if(!jumping){vy=-13;jumping=true;playSfx('tap')}}
 function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
 function spawn(){if(Math.random()<.70)obstacles.push({x:canvasW+20,y:ground-38,w:32+Math.random()*22,h:38});else pickups.push({x:canvasW+20,y:ground-85-Math.random()*70,w:28,h:28})}
 function draw(){ctx.clearRect(0,0,canvasW,canvasH);const g=ctx.createLinearGradient(0,0,0,canvasH);g.addColorStop(0,'#8fd2ff');g.addColorStop(1,'#eaf7ff');ctx.fillStyle=g;ctx.fillRect(0,0,canvasW,canvasH);ctx.fillStyle='#a7c87a';ctx.fillRect(0,ground,canvasW,canvasH-ground);ctx.fillStyle='#59656f';obstacles.forEach(o=>ctx.fillRect(o.x,o.y,o.w,o.h));ctx.font='28px sans-serif';pickups.forEach(i=>ctx.fillText('♪',i.x,i.y+25));if(img.complete){ctx.save();ctx.translate(100,0);ctx.scale(-1,1);ctx.drawImage(img,0,0,img.width,img.height,0,y,48,72);ctx.restore()}else{ctx.fillStyle='#222';ctx.fillRect(52,y,48,72)}}
 function updateUi(){if($('#runnerScore'))$('#runnerScore').textContent=`점수 ${score}`;if($('#runnerItems'))$('#runnerItems').textContent=`아이템 ${items}`;if($('#runnerLives'))$('#runnerLives').textContent='♥'.repeat(Math.max(0,lives))}
 function frame(ts){if(finished)return;const dt=Math.min(32,ts-last||16);last=ts;vy+=.72;y+=vy;if(y>=ground-72){y=ground-72;vy=0;jumping=false}spawnT+=dt;if(spawnT>700+Math.random()*500){spawnT=0;spawn()}const speed=6.0+score/1300;obstacles.forEach(o=>o.x-=speed);pickups.forEach(i=>i.x-=speed);const player={x:52,y,w:48,h:72};for(const o of obstacles){if(!o.hit&&rectHit(player,o)){o.hit=true;lives--;score=Math.max(0,score-40);playSfx('fail')}}for(const i of pickups){if(!i.hit&&rectHit(player,i)){i.hit=true;items++;score+=70;playSfx('coin')}}obstacles=obstacles.filter(o=>o.x>-80&&!o.hit);pickups=pickups.filter(i=>i.x>-50&&!i.hit);score+=.6;updateUi();draw();if(lives<=0)finish();else raf=requestAnimationFrame(frame)}
 function key(e){if(e.code==='Space'||e.key==='ArrowUp'){e.preventDefault();jump()}}
 function finish(aborted=false){if(finished)return;finished=true;cancelAnimationFrame(raf);clearInterval(timer);removeEventListener('keydown',key);endMiniGameUi();activeTrainingAbort=null;closeModal(true);score=Math.floor(score);state.minigames.runnerBest=Math.max(state.minigames.runnerBest||0,score);const bonusFans=aborted?0:Math.floor(score/35)+items*4,bonusMoney=aborted?0:items*5000;stat('fans',bonusFans);if(bonusMoney)stat('money',bonusMoney);if(!aborted&&score>=500)state.career.actingHits=(state.career.actingHits||0)+1;showDialogue('류현상',`${baseText}\n\n${aborted?'촬영장 러닝을 중도 종료했다.':`촬영장 러닝 결과 · 점수 ${score} · 아이템 ${items}개 · 팬 +${bonusFans}${bonusMoney?` · 촬영 보너스 +${bonusMoney.toLocaleString()}원`:''}`}`);advance(1)}
 $('#runnerJump').onclick=jump;addEventListener('keydown',key);activeTrainingAbort=()=>finish(true);let timer=setInterval(()=>{time--;const el=$('#runnerTimer');if(el)el.textContent=`${time}초`;if(time<=0)finish(false)},1000);raf=requestAnimationFrame(frame)

}
function firstKissSceneEligible(){
 const acting=Math.max(0,Number(state.career?.actingCount)||0);
 const hits=Math.max(0,Number(state.career?.actingHits)||0);
 const lv=fameLevel();
 const famousActor=acting>=25&&hits>=8&&state.stats.looks>=75&&lv>=65&&state.stats.fans>=20000;
 return acting>=12&&hits>=3&&!famousActor;
}
function startFirstKissScene(baseText=''){
 beginSpecialScene('firstKissScene');
 const before=snapshotStats();
 const scenes=[
  {name:'나레이션',text:'연기 일을 조금씩 이어 가던 어느 날, 류현상에게 한 가수의 뮤직비디오 출연 제안이 들어왔다. 대본에는 짧지만 중요한 장면이 하나 표시되어 있었다. 두 사람이 서로의 마음을 확인하는 첫 키스 장면. 류현상 역시 카메라 앞에서 키스신을 찍는 것은 처음이었다.'},
  {name:'나레이션',text:'촬영 직전, 상대역인 신인 여자배우는 대본을 든 손을 제대로 가만히 두지 못했다. 손끝이 눈에 띄게 떨렸고, 몇 번이나 숨을 크게 들이쉬었다. 감독이 동선을 설명하는 동안에도 그녀의 시선은 자꾸 바닥으로 떨어졌다. 류현상은 자신의 심장도 평소보다 빠르게 뛰고 있다는 걸 느꼈지만, 먼저 그녀 쪽으로 한 걸음 다가갔다.'},
  {name:'류현상',text:'“괜찮아요. 사실 저도 이런 장면은 처음이에요.” 류현상은 목소리를 낮추고, 다른 스태프들에게 들리지 않을 정도로 조용히 말했다. “제가 먼저 천천히 가까이 갈게요. 불편하거나 너무 빠르다 싶으면 바로 말해 주세요. 우리 둘 다 편해야 화면에도 자연스럽게 나올 테니까.”'},
  {name:'여자배우',text:'그녀는 놀란 듯 류현상을 바라보다가 조금 늦게 웃었다. “처음이신데… 왜 이렇게 안 떨려 보이세요?” 류현상은 잠깐 시선을 피하며 안경을 고쳐 썼다. “안 떨리는 척하는 건 무대에서 많이 해 봐서요.” 그 대답에 그녀가 작게 웃자, 팽팽하던 긴장이 조금 풀렸다.'},
  {name:'나레이션',text:'리허설에서는 손을 어디에 둘지, 어느 지점에서 멈출지, 얼굴을 어느 방향으로 기울일지 하나씩 맞췄다. 류현상은 매번 먼저 “여기까지 괜찮죠?”라고 확인했다. 상대가 고개를 끄덕이면 그제야 다음 동작으로 넘어갔다. 처음인 건 두 사람 모두 같았지만, 류현상은 자신의 긴장보다 상대가 덜 무서워하는 쪽을 택했다.'},
  {name:'감독',text:'“자, 갑니다. 준비… 액션.”'},
  {name:'나레이션',text:'카메라가 돌자 주변의 소음이 이상할 만큼 멀어졌다. 류현상은 약속한 동선대로 천천히 거리를 좁혔다. 바로 앞까지 다가간 순간, 여자배우의 눈이 다시 조금 흔들렸다. 그는 서두르지 않고 잠시 눈을 맞췄다. 괜찮다는 듯 아주 작게 웃어 보이자, 그녀도 긴 숨을 내쉬며 살짝 고개를 끄덕였다.'},
  {name:'나레이션',text:'그리고 두 사람은 정해 둔 타이밍에 맞춰 조심스럽게 입을 맞췄다. 길지 않은 장면이었다. 하지만 카메라가 가까이 붙은 몇 초 동안만큼은, 대본에 적혀 있던 감정이 실제처럼 느껴질 정도로 조용하고 선명했다. “컷!”이라는 소리가 들리고 나서야 류현상은 한 발 뒤로 물러났다.'},
  {name:'감독',text:'“좋아요. 방금 거 좋았습니다. 한 번에 갈게요.”'},
  {name:'여자배우',text:'촬영이 끝난 뒤 여자배우는 아직 볼이 조금 붉어진 채 류현상에게 다가왔다. “저 진짜 너무 떨렸거든요. 그런데 계속 확인해 주셔서… 덕분에 하나도 무섭지 않았어요. 정말 고마워요.” 그녀는 말을 마치고도 잠시 시선을 피하지 못했다가, 뒤늦게 민망한 듯 웃었다.'},
  {name:'류현상',text:'류현상은 괜히 태연한 얼굴로 대본을 접었다. “잘 나온 건 둘이 합을 잘 맞춘 거죠.” 그렇게 말했지만 돌아서는 순간 귀가 조금 뜨거워진 건 숨길 수 없었다. 처음 찍은 키스신은 생각보다 긴장됐고, 생각보다 오래 기억에 남을 것 같았다.'},
  {name:'나레이션',text:'그날 촬영은 무사히 끝났다. 류현상은 배우라는 일이 노래와 전혀 다른 방식으로 사람의 마음을 움직일 수 있다는 것을 다시 한 번 느꼈다. 그리고 자신도 모르게, 다음 대본에는 어떤 장면이 적혀 있을지 조금 기대하게 되었다.'}
 ];
 let page=0;
 const draw=()=>{
  const s=scenes[page];
  state.dialogue={name:s.name,text:s.text};render();
  const area=$('#choiceArea');area.innerHTML='';area.classList.remove('hidden');
  const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;
  const next=document.createElement('button');next.className='primary';next.textContent=page===scenes.length-1?'특별 스토리 마치기':'다음 장면';
  area.append(prev,next);
  prev.onclick=()=>{if(page>0){page--;draw()}};
  next.onclick=()=>{
   if(page<scenes.length-1){page++;draw();return}
   state.specialEvents.firstKissScene=true;
   state.career.actingHits=Math.max(0,Number(state.career.actingHits)||0)+1;
   stat('acting',3);stat('fans',60);stat('fame',10);state.exp+=10;
   endSpecialScene();
   addHistory('💋 특별 이벤트 · 뮤직비디오 첫 키스신 촬영을 무사히 마쳤다.','special:firstKissScene');
   const changes=describeStatChanges(before);
   const summary=(baseText?`${baseText}\n\n`:'')+'특별 이벤트 「첫 키스신」을 무사히 마쳤다. 긴장한 상대 배우를 배려하며 촬영을 리드했고, 배우로서 좋은 평가를 한 번 더 얻었다.';
   showDialogue('류현상',dialogueWithStatChanges(summary,changes));
   playSfx('success');save(false);advance(1);
  };
 };
 playSfx('event');draw();
}
function startActingExtraStory(baseText=''){
 beginSpecialScene('actingExtra');
 const before=snapshotStats();
 stat('acting',2);stat('fans',18);stat('fame',6);state.exp+=6;
 const scenes=[
  {name:'나레이션',text:'연기에 도전해 보고 싶었던 류현상은 작은 사극 촬영 현장에서 지나가는 상인 엑스트라 자리를 맡게 되었다. 허름한 짐을 메고 먼지 날리는 장터를 몇 번이고 오가야 하는 역할이었지만, 현상은 이상할 만큼 진지하게 동선을 외우고 있었다.'},
  {name:'현장 스태프',text:'“카메라 지나갈 때 정면 보시면 안 됩니다. 그냥 바쁘게 지나가세요. 존재감은 너무 튀지 않게, 그런데 또 어색하면 안 돼요.” 설명은 간단했지만 막상 해 보니 훨씬 어려웠다. 누군가에게 눈에 띄지 않는 연기를 해야 한다는 점이 특히 그랬다.'},
  {name:'나레이션',text:'첫 테이크에서 류현상은 너무 긴장한 나머지 보폭이 어색해졌고, 두 번째 테이크에서는 짐이 어깨에서 미끄러졌다. 세 번째쯤 되어서야 스태프가 “이번엔 괜찮아요!”라고 손을 들어 보였다. 그 말 한마디에 이상하게 가슴이 뛰었다.'},
  {name:'류현상',text:'주연 배우도, 카메라 감독도, 주변 사람들도 그의 이름을 묻지 않았다. 지나가는 상인 한 명에 관심을 두는 사람은 아무도 없었다. 그래도 그는 촬영이 끝난 뒤 땀에 젖은 소매를 붙잡고 작게 웃었다. “이런 역할도 생각보다 쉽지 않네… 그래도 재밌다.”'},
  {name:'나레이션',text:'힘들고 눈에 띄지 않는 하루였지만 묘하게 뿌듯한 경험이었다. 음악과는 다른 방식으로 화면 안에 존재하는 감각이 또렷하게 남았다. 류현상은 언젠가 더 유명해져서, 이름 있는 배역으로 다시 촬영장에 서 보겠다고 조용히 다짐했다.'}
 ];
 let page=0;
 const draw=()=>{
  const scene=scenes[page];
  state.dialogue={name:scene.name,text:scene.text};
  render();
  const area=$('#choiceArea');
  area.innerHTML='';area.classList.remove('hidden');
  const prev=document.createElement('button');
  prev.textContent='이전 장면';
  prev.disabled=page===0;
  const next=document.createElement('button');
  next.className='primary';
  next.textContent=page===scenes.length-1?'특별 스토리 마치기':'다음 장면';
  area.append(prev,next);
  prev.onclick=()=>{if(page>0){page--;draw()}};
  next.onclick=()=>{
   if(page<scenes.length-1){page++;draw();return}
   state.specialEvents.actingExtra=true;
   endSpecialScene();
   addHistory('🎬 특별 이벤트 · 사극 상인 엑스트라 촬영을 경험했다.','special:actingExtra');
   const changes=describeStatChanges(before);
   const extraText=(baseText?`${baseText}

`:'')+'특별 이벤트 「사극 상인 엑스트라」를 경험했다. 힘들고 아무도 관심 주지 않는 자리였지만, 류현상은 더 유명해져서 언젠가 이름 있는 배우가 되겠다고 다짐했다.';
   showDialogue('류현상',dialogueWithStatChanges(extraText,changes));
   playSfx('success');
   save(false);
   advance(1);
  };
 };
 playSfx('event');
 draw();
}

// --- 366일 이후 방송 미니게임: 노래 서바이벌 · 도전 퀴즈쇼 ---
const SHOW_UNLOCK_DAY=366;
const SHOW_COOLDOWN_DAYS=7;
const songSurvivalRewards={
 0:{label:'참가 보상',money:50000,fans:30,fame:0,exp:8},
 1:{label:'1단계 통과',money:300000,fans:250,fame:40,exp:24},
 2:{label:'2단계 통과',money:800000,fans:650,fame:100,exp:45},
 3:{label:'최종 우승',money:1800000,fans:1400,fame:220,exp:75}
};
const songSurvivalStages=[
 {rows:3,cols:6,speed:4.25,paddle:142,hardChance:0,tripleChance:0},
 {rows:4,cols:7,speed:5.0,paddle:122,hardChance:.28,tripleChance:0},
 {rows:5,cols:8,speed:5.75,paddle:106,hardChance:.45,tripleChance:.12}
];
const quizShowRewards=[
 {min:0,max:3,label:'참가상',money:50000,fans:30,fame:0,exp:8},
 {min:4,max:6,label:'분위기 메이커상',money:250000,fans:150,fame:25,exp:18},
 {min:7,max:8,label:'퀴즈 실력자',money:600000,fans:400,fame:70,exp:35},
 {min:9,max:9,label:'준우승',money:1200000,fans:800,fame:140,exp:55},
 {min:10,max:10,label:'전 문제 정답·우승',money:2200000,fans:1400,fame:240,exp:80,stress:-5}
];
const ryuOxQuiz=[
 {q:'류현상은 1994년 10월 4일에 태어났다.',a:true,why:'1994년 10월 4일 출생이다.'},
 {q:'류현상의 고향은 태어난 곳 기준으로 충청북도 청주시다.',a:true,why:'청주에서 태어난 후 바로 천안으로 이사했다.'},
 {q:'류현상의 키는 180cm, 몸무게는 70kg이며 혈액형은 A형이다.',a:false,why:'실제 신체 정보는 181cm, 68kg, B형이다.'},
 {q:"류현상은 밴드 '스칼레티아(Scarletia)'의 리더, 보컬리스트, 기타리스트로 활동하고 있다.",a:true,why:'스칼레티아의 리더이자 보컬·기타리스트다.'},
 {q:'류현상의 데뷔일은 2013년 5월 1일이다.',a:true,why:'2013년 5월 1일 데뷔했다.'},
 {q:"류현상의 데뷔 싱글 타이틀곡은 'Listen to my love'이다.",a:false,why:"'Listen to my love'는 앨범명이며 타이틀곡은 '사랑이라는게'다."},
 {q:'류현상의 MBTI 검사 결과는 항상 INTJ로 나온다.',a:true,why:'검사 결과는 항상 INTJ로 나온다.'},
 {q:'류현상은 평소 자신의 MBTI가 ENFP라고 자주 소개한다.',a:false,why:'MBTI는 INTJ이며 최근 INFJ가 되어가는 것 같다고 느낀 적은 있다.'},
 {q:'류현상은 2023년 Mnet 초대형 노래방 서바이벌 VS에 출연한 적이 있다.',a:true,why:"2023년 출연해 izi의 '응급실' 무대로 360만 뷰를 기록했다."},
 {q:"류현상은 2024년 지상파 음악 방송인 KBS 2TV '뮤직뱅크'에 출연했다.",a:true,why:'2024년 뮤직뱅크에 출연했다.'},
 {q:"류현상은 서울 홍대 거리에서 생일 기념 팬미팅 'H B D'를 개최했다.",a:false,why:'서울 홍대가 아니라 천안 JB 아트홀에서 개최했다.'},
 {q:"류현상이 진행하는 자체 제작 팟캐스트 콘텐츠의 이름은 '꿀단지'이다.",a:true,why:"자체 제작 팟캐스트 이름은 '꿀단지'다."},
 {q:"'꿀단지' EP.0의 게스트는 자작가수 이원이다.",a:false,why:'EP.0 게스트는 김시도이며 자작가수 이원은 EP.1 게스트다.'},
 {q:"류현상은 OBS 라디오 '파워라이브'에 고정 게스트로 참여하고 있다.",a:true,why:'매주 금요일 고정 게스트로 참여하고 있다.'},
 {q:"류현상은 2025년에 izi의 곡 '응급실'을 리메이크하여 발매했다.",a:true,why:"2025년 11월 4일 '응급실 (2025)'을 발매했다."},
 {q:'2025년 12월에 발매된 음반 《From the Scarletia》는 더블 타이틀곡을 가지고 있다.',a:true,why:"'상처'와 '아무 일도 없던 것처럼 사랑하지 않은 것처럼'이 더블 타이틀이다."},
 {q:'2026년 6월에는 웹툰 "천도박멸"과 콜라보한 OST 음원을 발매했다.',a:true,why:'2026년 6월 21일 웹툰 천도박멸 X 류현상 OST를 발매했다.'},
 {q:"2013년 데뷔 앨범의 원래 타이틀곡은 '눈물만 눈물만'이 될 예정이었으나 변경되었다.",a:true,why:"원래 '눈물만 눈물만'이 타이틀곡이 될 예정이었으나 변경됐다."},
 {q:'2015년에 발매된 음반의 실제 올바른 타이틀은 《Listen to my tears》이다.',a:true,why:'배급사 등록 실수와 별개로 실제 올바른 타이틀은 《Listen to my tears》다.'},
 {q:'밴드 라이오네시스의 멤버 주기훈과 류현상은 서로 다른 세대의 선후배 관계이다.',a:false,why:'두 사람은 선후배가 아니라 1994년생 동갑내기 친구다.'},
 {q:"류현상은 라이오네시스 멤버 주기훈의 싱글 'Remember'를 작사·작곡했다.",a:true,why:"주기훈의 싱글 'Remember' 작사·작곡에 참여했다."},
 {q:'유튜버이자 웹툰 작가인 와나나의 천안 집에 놀러갔다가 웹툰 OST 참여가 급전개되었다.',a:true,why:'와나나의 천안 집에 놀러 갔다가 OST 참여가 빠르게 결정됐다.'},
 {q:'류현상의 취미에는 영화 보기, 요리, MCU 레고 수집이 포함된다.',a:true,why:'영화 보기, 요리, MCU 레고 수집을 취미로 한다.'},
 {q:'류현상은 새로운 취미로 디지몬 카드 게임을 하고 있다.',a:true,why:'새로운 취미로 디지몬 카드 게임을 즐긴다.'},
 {q:"류현상은 영화 '극한직업'을 보며 펑펑 울고 가사 20곡을 쓴 적이 있다.",a:false,why:"'극한직업'이 아니라 '슬픔보다 더 슬픈 이야기'를 보고 울며 가사 20곡을 썼다."},
 {q:'류현상은 초등학교 5학년 때 동방신기, 버즈를 보고 음악을 시작했다.',a:true,why:'초등학교 5학년 때 동방신기와 버즈를 보고 음악을 시작했다.'},
 {q:'류현상이 존경하는 아티스트로 서태지, 신해철, 이승환이 언급된다.',a:false,why:'존경하는 아티스트로 김종서, 동물원, TraxX가 언급된다.'},
 {q:'류현상이 보유한 운전면허는 1종 보통이다.',a:false,why:'보유 면허는 2종 보통이다.'},
 {q:"류현상은 육성재의 'EXHIBITION : Look Closely / Be somebody' M/V에 밴드 기타 멤버로 참여했다.",a:true,why:'육성재 밴드의 기타 멤버로 해당 M/V에 참여했다.'},
 {q:'류현상은 태어나서 성인이 될 때까지 쭉 청주에서 거주하다가 서울로 상경했다.',a:false,why:'청주에서 태어나자마자 천안으로 이사해 성장했다.'}
];
function shuffleInPlace(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
function showCooldownRemaining(lastDay,label){const remaining=SHOW_COOLDOWN_DAYS-(state.day-lastDay);if(remaining>0){toast(`${label} 재도전까지 ${remaining}일 남았습니다.`);return true}return false}
function startSongSurvival(){
 if(state.day<SHOW_UNLOCK_DAY)return toast(`${SHOW_UNLOCK_DAY}일차부터 노래 서바이벌에 참가할 수 있습니다.`);
 if(showCooldownRemaining(state.minigames.songSurvivalLastDay,'노래 서바이벌'))return;
 if(!costHp(16))return;
 stat('stress',4);state.minigames.songSurvivalLastDay=state.day;save(false);
 beginMiniGameUi();
 let cleared=false,lives=3,raf=0,finished=false,running=false,leftHeld=false,rightHeld=false;
 let canvas,ctx,overlay,paddle,ball,bricks=[];
 const W=720,H=500,notes=['♪','♫','♬','♩','𝄞'];
 const cfg=songSurvivalStages[2];
 showModal('노래 서바이벌 · 음표 벽돌깨기',`<div class="survival-head"><div><b>처음부터 최고 난이도! 음표 공으로 모든 벽돌을 깨세요.</b><small>기존 3단계 수준의 속도와 단단한 벽돌로 한 번에 승부합니다. 키보드 ← → 또는 화면 터치로 조작합니다.</small></div><div class="survival-status"><span id="survivalStage">최고 난이도</span><span id="survivalLives">목숨 3</span></div></div><div class="survival-canvas-wrap"><canvas id="survivalCanvas" width="720" height="500" aria-label="노래 서바이벌 벽돌깨기 게임"></canvas><div id="survivalOverlay" class="survival-overlay"><b>노래 서바이벌</b><p>3단계 수준의 벽돌을 한 판에 모두 깨면 최종 우승입니다.</p><button id="survivalOverlayButton" class="primary">도전 시작</button></div></div><div class="survival-controls"><button id="survivalLeft" aria-label="왼쪽 이동">◀</button><button id="survivalLaunch" class="primary">공 다시 띄우기</button><button id="survivalRight" aria-label="오른쪽 이동">▶</button></div><div class="survival-reward-guide"><span>클리어 180만원 · 팬 1,400 · 인지도 220 · 보컬 보너스</span></div>`);
 canvas=$('#survivalCanvas');ctx=canvas.getContext('2d');overlay=$('#survivalOverlay');
 const status=()=>{const se=$('#survivalStage'),le=$('#survivalLives');if(se)se.textContent='최고 난이도';if(le)le.textContent=`목숨 ${lives}`};
 const setOverlay=(title,text,label,handler)=>{running=false;overlay.innerHTML=`<b>${title}</b><p>${text}</p><button id="survivalOverlayButton" class="primary">${label}</button>`;overlay.classList.remove('hidden');$('#survivalOverlayButton').onclick=handler};
 const resetBall=()=>{const angle=(Math.random()*.7-.35);ball={x:W/2,y:H-58,r:11,dx:cfg.speed*Math.sin(angle),dy:-cfg.speed*Math.cos(angle),note:pick(notes)};paddle.x=(W-paddle.w)/2};
 const buildStage=()=>{paddle={x:(W-cfg.paddle)/2,y:H-32,w:cfg.paddle,h:14};lives=3;bricks=[];const margin=28,gap=8,top=55,bh=24,bw=(W-margin*2-gap*(cfg.cols-1))/cfg.cols;for(let r=0;r<cfg.rows;r++){for(let c=0;c<cfg.cols;c++){let hp=1;if(Math.random()<cfg.hardChance)hp=2;if(Math.random()<cfg.tripleChance)hp=3;bricks.push({x:margin+c*(bw+gap),y:top+r*(bh+gap),w:bw,h:bh,hp,maxHp:hp})}}resetBall();status();drawFrame()};
 const drawFrame=()=>{if(!ctx)return;ctx.clearRect(0,0,W,H);const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#111b32');grad.addColorStop(1,'#070b14');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(142,174,225,.18)';ctx.lineWidth=1;for(let y=40;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(const b of bricks){if(b.hp<=0)continue;ctx.fillStyle=b.hp>=3?'#d95d91':b.hp===2?'#7c6ee6':'#3f8edb';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle='rgba(255,255,255,.45)';ctx.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);if(b.hp>1){ctx.fillStyle='#fff';ctx.font='700 13px system-ui';ctx.textAlign='center';ctx.fillText(String(b.hp),b.x+b.w/2,b.y+17)}}ctx.fillStyle='#dbe9ff';ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);ctx.fillStyle='#83b7ff';ctx.fillRect(paddle.x+8,paddle.y+3,paddle.w-16,4);ctx.fillStyle='#fff';ctx.font='900 27px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ball.note,ball.x,ball.y)};
 const normalizeBallSpeed=()=>{const mag=Math.hypot(ball.dx,ball.dy)||1;ball.dx=ball.dx/mag*cfg.speed;ball.dy=ball.dy/mag*cfg.speed};
 const loseLife=()=>{lives--;status();if(lives<=0){finish(false,'failed');return}resetBall();running=false;setOverlay('음표를 놓쳤다',`목숨이 ${lives}개 남았습니다.`,'계속 도전',()=>{overlay.classList.add('hidden');running=true;loop()})};
 const clearGame=()=>{cleared=true;finish(true,'clear')};
 const update=()=>{if(leftHeld)paddle.x-=8;if(rightHeld)paddle.x+=8;paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x));const prevX=ball.x,prevY=ball.y;ball.x+=ball.dx;ball.y+=ball.dy;if(ball.x-ball.r<=0&&ball.dx<0){ball.x=ball.r;ball.dx*=-1}if(ball.x+ball.r>=W&&ball.dx>0){ball.x=W-ball.r;ball.dx*=-1}if(ball.y-ball.r<=0&&ball.dy<0){ball.y=ball.r;ball.dy*=-1}if(ball.dy>0&&ball.y+ball.r>=paddle.y&&prevY+ball.r<=paddle.y+8&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w){ball.y=paddle.y-ball.r;const hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);ball.dx=cfg.speed*hit*.95;ball.dy=-Math.sqrt(Math.max(1,cfg.speed*cfg.speed-ball.dx*ball.dx));normalizeBallSpeed();ball.note=pick(notes)}for(const b of bricks){if(b.hp<=0)continue;if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){b.hp--;const cameFromTop=prevY+ball.r<=b.y||prevY-ball.r>=b.y+b.h;if(cameFromTop)ball.dy*=-1;else ball.dx*=-1;ball.note=pick(notes);playSfx(b.hp<=0?'tap':'click');break}}if(bricks.every(b=>b.hp<=0)){clearGame();return}if(ball.y-ball.r>H){loseLife();return}};
 const loop=()=>{cancelAnimationFrame(raf);const frame=()=>{if(finished||!running)return;update();drawFrame();if(running&&!finished)raf=requestAnimationFrame(frame)};raf=requestAnimationFrame(frame)};
 const finish=(won,reason)=>{if(finished)return;finished=true;running=false;cancelAnimationFrame(raf);removeEventListener('keydown',keyDown);removeEventListener('keyup',keyUp);endMiniGameUi();activeTrainingAbort=null;closeModal(true);const clearedStage=won&&cleared?3:0,reward=songSurvivalRewards[clearedStage];stat('money',reward.money);stat('fans',reward.fans);stat('fame',reward.fame);state.exp+=reward.exp;const vocalGain=clearedStage===3?gainSkill('vocal',1,'majorStage'):0;state.minigames.songBestStage=Math.max(state.minigames.songBestStage,clearedStage);addHistory(`🎵 노래 서바이벌 · 최고 난이도 ${clearedStage===3?'클리어':'실패'} · ${reward.money.toLocaleString()}원, 팬 +${reward.fans}, 인지도 +${reward.fame}${vocalGain?`, 보컬 +${vocalGain}`:''}`,`song-survival:${state.day}`);state.dialogue={name:'노래 서바이벌',text:clearedStage===3?'처음부터 최고 난이도로 시작한 음표 벽돌깨기를 한 번에 클리어하며 최종 우승했다. 류현상은 게임 공이 음표라는 사실보다 자신이 이겼다는 사실에 더 만족했다.':'최고 난이도의 음표 벽돌을 모두 깨지 못했다. 류현상은 다음 도전에서는 첫 공부터 더 집중하겠다며 조용히 이를 갈았다.'};advance(1,'minigame');showModal('노래 서바이벌 결과',`<div class="show-result-card"><span class="show-result-rank">${reward.label}</span><h3>${clearedStage===3?'최고 난이도 클리어':'도전 실패'}</h3><p>상금 <strong>${reward.money.toLocaleString()}원</strong> · 팬 <strong>+${reward.fans.toLocaleString()}</strong> · 인지도 <strong>+${reward.fame}</strong>${vocalGain?` · 보컬 <strong>+${vocalGain}</strong>`:''}</p><small>${reason==='closed'?'중도 종료되어 참가 보상으로 정산되었습니다.':'방송 재도전은 7일 뒤 가능합니다.'}</small><button id="songResultConfirm" class="primary wide">확인</button></div>`);$('#songResultConfirm').onclick=()=>closeModal()};
 const keyDown=e=>{if(e.key==='ArrowLeft'||e.key==='a'){leftHeld=true;e.preventDefault()}if(e.key==='ArrowRight'||e.key==='d'){rightHeld=true;e.preventDefault()}if((e.key===' '||e.key==='Enter')&&!running&&!finished){$('#survivalOverlayButton')?.click();e.preventDefault()}};
 const keyUp=e=>{if(e.key==='ArrowLeft'||e.key==='a')leftHeld=false;if(e.key==='ArrowRight'||e.key==='d')rightHeld=false};
 addEventListener('keydown',keyDown);addEventListener('keyup',keyUp);
 const hold=(button,direction)=>{button.onpointerdown=e=>{e.preventDefault();if(direction<0)leftHeld=true;else rightHeld=true;button.setPointerCapture?.(e.pointerId)};const stop=()=>{if(direction<0)leftHeld=false;else rightHeld=false};button.onpointerup=stop;button.onpointercancel=stop;button.onpointerleave=stop};
 hold($('#survivalLeft'),-1);hold($('#survivalRight'),1);$('#survivalLaunch').onclick=()=>{if(!running&&!finished)$('#survivalOverlayButton')?.click()};canvas.onpointermove=e=>{if(!running)return;const rect=canvas.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*W;paddle.x=Math.max(0,Math.min(W-paddle.w,x-paddle.w/2))};canvas.onpointerdown=e=>{canvas.setPointerCapture?.(e.pointerId);const rect=canvas.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width*W;paddle.x=Math.max(0,Math.min(W-paddle.w,x-paddle.w/2))};
 activeTrainingAbort=()=>finish(false,'closed');buildStage();setOverlay('노래 서바이벌','처음부터 기존 3단계 수준의 최고 난이도로 시작합니다. 모든 벽돌을 깨세요.','도전 시작',()=>{overlay.classList.add('hidden');running=true;loop()})
}
function drawQuizQuestionSet(){
 if(!Array.isArray(state.minigames.quizBag)||state.minigames.quizBag.length<10)state.minigames.quizBag=shuffleInPlace(Array.from({length:ryuOxQuiz.length},(_,i)=>i));
 return state.minigames.quizBag.splice(0,10).map(i=>ryuOxQuiz[i]);
}
function quizRewardFor(score){return quizShowRewards.find(r=>score>=r.min&&score<=r.max)||quizShowRewards[0]}
function startQuizShow(){
 if(state.day<SHOW_UNLOCK_DAY)return toast(`${SHOW_UNLOCK_DAY}일차부터 도전 퀴즈쇼에 참가할 수 있습니다.`);
 if(showCooldownRemaining(state.minigames.quizShowLastDay,'도전 퀴즈쇼'))return;
 if(!costHp(8))return;
 stat('stress',2);state.minigames.quizShowLastDay=state.day;const questions=drawQuizQuestionSet();save(false);
 beginMiniGameUi();let index=0,correct=0,finished=false,answered=false;
 const draw=()=>{const item=questions[index];showModal('도전 퀴즈쇼 · 류현상 O/X',`<div class="quiz-show-head"><div><small>문제 ${index+1} / ${questions.length}</small><div class="quiz-progress"><i style="width:${(index/questions.length)*100}%"></i></div></div><b id="quizScore">정답 ${correct}개</b></div><article class="quiz-question-card"><span>O / X</span><h3>${item.q}</h3></article><div class="ox-buttons"><button id="quizO" class="ox-o">O</button><button id="quizX" class="ox-x">X</button></div><div id="quizFeedback" class="quiz-feedback hidden"></div>`);answered=false;$('#quizO').onclick=()=>answer(true);$('#quizX').onclick=()=>answer(false)};
 const answer=value=>{if(answered||finished)return;answered=true;const item=questions[index],isCorrect=value===item.a;if(isCorrect)correct++;$('#quizO').disabled=$('#quizX').disabled=true;$('#quizO').classList.toggle('selected',value===true);$('#quizX').classList.toggle('selected',value===false);const feedback=$('#quizFeedback');feedback.className=`quiz-feedback ${isCorrect?'correct':'wrong'}`;feedback.innerHTML=`<b>${isCorrect?'정답입니다!':'틀렸습니다.'} 정답은 ${item.a?'O':'X'}</b><p>${item.why}</p><button id="quizNext" class="primary wide">${index===questions.length-1?'결과 보기':'다음 문제'}</button>`;$('#quizScore').textContent=`정답 ${correct}개`;$('#quizNext').onclick=()=>{if(index===questions.length-1)finish(false);else{index++;draw()}}};
 const finish=aborted=>{if(finished)return;finished=true;endMiniGameUi();activeTrainingAbort=null;closeModal(true);const scored=aborted?0:correct,reward=quizRewardFor(scored);stat('money',reward.money);stat('fans',reward.fans);stat('fame',reward.fame);if(reward.stress)stat('stress',reward.stress);state.exp+=reward.exp;state.minigames.quizBest=Math.max(state.minigames.quizBest,aborted?0:correct);addHistory(`⭕ 도전 퀴즈쇼 · ${aborted?'중도 종료':`${correct}/10 정답`} · ${reward.label} · ${reward.money.toLocaleString()}원, 팬 +${reward.fans}, 인지도 +${reward.fame}`,`quiz-show:${state.day}`);state.dialogue={name:'도전 퀴즈쇼',text:aborted?'퀴즈쇼를 중도에 마쳤다. 류현상은 자신에 관한 문제인데도 왜 이렇게 긴장되는지 모르겠다며 안경을 고쳐 썼다.':correct===10?'열 문제를 모두 맞혔다. 류현상은 “내 문제니까 당연하지”라고 말했지만, 제작진은 본인도 틀리는 출연자가 꽤 많다고 알려 줬다.':`${correct}문제를 맞혔다. 틀린 문제의 해설을 듣던 류현상은 “그건 문제 표현이 애매한 것 같은데요”라며 조용히 제작진에게 항의했다.`};advance(1,'minigame');showModal('도전 퀴즈쇼 결과',`<div class="show-result-card"><span class="show-result-rank">${reward.label}</span><h3>${aborted?'중도 종료':`${correct} / 10 정답`}</h3><p>상금 <strong>${reward.money.toLocaleString()}원</strong> · 팬 <strong>+${reward.fans.toLocaleString()}</strong> · 인지도 <strong>+${reward.fame}</strong></p><small>${aborted?'중도 종료로 참가상만 지급되었습니다.':'출제 문제는 제공된 30문제에서 무작위로 나오며, 3회 동안 중복 없이 순환합니다.'}</small><button id="quizResultConfirm" class="primary wide">확인</button></div>`);$('#quizResultConfirm').onclick=()=>closeModal()};
 activeTrainingAbort=()=>finish(true);draw()
}

const specialSceneImageMap={
 iziViral:'assets/images/izi-suwon-viral.jpg',waitedMoreViral:'assets/images/waited-more-myeongdong-viral.jpg',
 day30Hair:'assets/images/special-day30-hair.jpg',day60Workout:'assets/images/special-day60-workout.jpg',day90Live:'assets/images/special-day90-live.jpg',day120Chat:'assets/images/special-day120-kakaotalk.jpg',day150Birthday:'assets/images/special-day150-birthday.jpg',
 day180Archive:'assets/images/special-day180-user.png',day210Demo:'assets/images/special-day210-user.png',day240Meme:'assets/images/special-day240-user.png',day300Promise:'assets/images/special-day300-user.png',day330Mother:'assets/images/special-day330-mother.png',day360Reflection:'assets/images/special-day360-reflection.png',day400Fanmeet:'assets/images/special-day400-fanmeet.png',day450ReturnSpring:'assets/images/special-day450-return-spring.png',day500SchoolFestival:'assets/images/special-day500-school-festival.png',
 careerLv70:'assets/images/special-career-lv70.png',careerLv80:'assets/images/special-career-lv80.png',careerLv90:'assets/images/special-career-lv90.png',actingExtra:'assets/images/special-acting-extra.png',firstKissScene:'assets/images/special-first-kiss-scene.jpg',
 hiddenGameOst:'assets/images/hidden-game-ost.jpg',hiddenRadioDj:'assets/images/hidden-radio-dj.png',hiddenDingo:'assets/images/hidden-dingo-rising.png',mysteriousMerchant:'assets/images/mysterious-merchant.png',cardCollectorSpecial:'assets/images/special-card-collector.png',cardTheft:'assets/images/special-card-collector.png',hurabonoWeddingDay:'assets/images/special-hurabono-wedding.png',restLooksNightmare:'assets/images/special-rest-looks-nightmare.png'
};
function clearTransientSceneEffects(){
 clearTimeout(motionTimer);clearTimeout(burstTimer);
 const scene=$('#scene'),badge=$('#eventBadge'),burst=$('#actionBurst'),notes=$('#musicNotes'),lights=$('#audienceLights'),area=$('#choiceArea');
 if(scene)scene.className=scene.className.replace(/\bmotion-[^\s]+/g,'').replace(/\bcharacter-switch\b/g,'').trim();
 if(badge)badge.classList.add('hidden');
 if(burst){burst.classList.remove('show');burst.textContent=''}
 if(notes)notes.innerHTML='';if(lights)lights.innerHTML='';
 if(area){area.innerHTML='';area.classList.add('hidden')}
 closeChoiceModal();
 setChoiceLock(false);
}
function beginSpecialScene(key){
 clearTransientSceneEffects();
 state.specialScene={active:true,key};
 state.dialogue=null;
 startSpecialEventBgm(key);
}
function endSpecialScene(){
 stopSpecialEventBgm(true);
 state.specialScene={active:false,key:null};
 clearTransientSceneEffects();
}
function startIziViralStory(hpCost){
 const scenes=[
  {name:'내레이션',text:'인지도 Lv.35에 도달한 어느 저녁, 류현상은 평소의 공원이 아닌 수원역 근처에 장비를 펼쳤다. 비가 막 그친 거리에는 젖은 보도블록과 카페 불빛이 길게 번지고 있었다. 사람들은 퇴근길을 재촉했고, 누구도 오래 머물 것 같지 않았다.\n\n류현상은 마이크 높이를 다시 맞춘 뒤, 오늘 마지막 곡으로 오래된 밴드곡 〈응급실〉을 선택했다.'},
  {name:'류현상',text:'첫 소절이 시작되자 흩어지던 발걸음 몇 개가 느려졌다. 류현상은 눈을 감고 후렴을 향해 목소리를 밀어 올렸다.\n\n“너 하나만 사랑하는데↑♬”\n\n평소보다 거칠고 절박한 고음이 수원역 앞 거리를 가로질렀다.'},
  {name:'내레이션',text:'두 번째 후렴에 들어서자 카페 앞에 서 있던 행인이 휴대전화를 꺼냈다. 처음에는 짧게 찍고 지나가려던 영상이었다. 하지만 류현상이 몸을 숙이며 마지막 음을 붙잡는 순간, 촬영자는 녹화 버튼에서 손을 떼지 못했다.\n\n“이대로 나를 두고 가지마하~”\n\n노래가 끝났을 때 작은 박수와 함께 몇 명의 사람들이 동시에 휴대전화를 확인했다.'},
  {name:'지나가던 관객',text:'“이 사람 누구지? 수원역에서 그냥 찍은 건데 목소리가 너무 절박해서 못 지나가겠어요.”\n\n관객은 그날 밤 영상을 짧은 영상 플랫폼과 인스타그램에 올렸다. 제목은 단순했다.\n\n〈수원역에서 응급실 부르는 장발 안경남〉'},
  {name:'내레이션',text:'처음 한 시간 동안 조회 수는 몇백 회에 불과했다. 자정이 지나자 숫자가 천 단위를 넘었고, 새벽에는 추천 알고리즘에 연달아 노출되기 시작했다. 댓글에는 원곡을 떠올렸다는 사람, 목소리 때문에 영상을 반복해서 봤다는 사람, 류현상의 이름을 묻는 사람이 빠르게 늘어났다.\n\n다음 날 아침, 휴대전화 알림은 화면을 켤 때마다 수십 개씩 쌓였다.'},
  state.manager.hired?{name:'후라보노',text:'후라보노는 통계 화면을 한참 바라보다 류현상에게 휴대전화를 내밀었다.\n\n“형, 밤사이에 인스타그램 팔로워가 1만 5천 명 늘었어요. 홍보비도 없고 방송도 아니었는데, 영상 하나가 전부 끌고 왔습니다.”\n\n류현상은 기쁜 표정을 숨기려 안경을 고쳐 썼다. “노래를 잘했으니까 그렇겠지.”\n\n후라보노는 고개를 저었다. “네. 바로 그 말 때문에 제가 계속 옆에 있어야겠네요.”'}:{name:'류현상',text:'다음 날 아침, 류현상은 알림이 멈추지 않는 휴대전화를 들고 한참 화면을 바라봤다. 밤사이에 인스타그램 팔로워가 1만 5천 명 늘어 있었다. 홍보비도, 방송 출연도 없었다. 수원역에서 찍힌 영상 하나가 모든 숫자를 끌고 왔다.\n\n그는 기쁜 표정을 숨기려 안경을 고쳐 썼다. “노래를 잘했으니까 그렇겠지.” 아무도 듣지 않았지만, 스스로 말하고도 조금 꺼드럭거린 것 같아 헛기침을 했다.'},
  {name:'내레이션',text:'영상은 며칠 동안 계속 퍼졌다. 사람들은 류현상을 ‘응급실 버스킹 가수’라고 부르기 시작했고, 다음 버스킹 장소에는 이전보다 훨씬 많은 관객이 모였다.\n\n한 곡의 커버 영상은 류현상의 이름을 처음으로 대중의 알고리즘 위에 올려놓았다. 그러나 그는 영상 속 마지막 고음을 다시 들으며 조용히 중얼거렸다.\n\n“다음에는 내 노래로 저 숫자를 만들 거야.”'}
 ];
 let page=0;
 beginSpecialScene('iziViral');
 const draw=()=>{
  const scene=scenes[page];
  state.dialogue={name:scene.name,text:scene.text};
  render();
  const area=$('#choiceArea');
  area.innerHTML='';area.classList.remove('hidden');
  const button=document.createElement('button');
  button.className='primary';
  button.textContent=page===scenes.length-1?'특별 스토리 마치기':'다음 장면';
  button.onclick=()=>{
   if(page<scenes.length-1){page++;draw();return}
   const before=snapshotStats();
   stat('fans',1500);stat('fame',350);stat('stress',3);
   state.specialEvents.iziViral=true;state.performanceCount++;
   const gearNotice=consumeBuskingEquipment();
   endSpecialScene();
   addHistory('🔥 수원역 특별 이벤트 · 응급실 커버 영상 바이럴, 인스타그램 팔로워 15,000명 증가','special:izi');
   state.dialogue={name:state.manager.hired?'후라보노':'류현상',text:(state.manager.hired?'영상 하나로 팔로워 1만 5천 명이 늘었어요. 지금부터가 더 중요합니다. 다음에는 형의 노래로 사람들을 멈춰 세워요.':'팔로워가 1만 5천 명이나 늘었다. 기쁘지만, 다음에는 내 노래로 사람들을 멈춰 세우고 싶다.')+gearNotice};
   state.skipNextStory=true;
   const changes=describeStatChanges(before);
   playSfx('success');
   if(changes)appendStatChangesToDialogue(changes);
   if(checkStalkerEvent())return;
   advance(1);
  };
  area.appendChild(button);
 };
 draw();
}
function maybeStartIziViralEvent(band,hpCost){
 if(band||state.specialEvents?.iziViral||fameLevel()<35)return false;
 if(!costHp(hpCost))return true;
 startIziViralStory(hpCost);
 return true;
}
function startWaitedMoreViralStory(){
 beginSpecialScene('waitedMoreViral');
 const before={...state.stats};
 const scenes=[
  {name:'나레이션',text:'명동 거리는 늦은 오후의 열기로 가득했다. 유동 인구가 많은 사거리 앞에서 류현상은 마이크 높이를 조절하며 숨을 골랐다. 평소보다 사람이 많았다. 웅성거림 사이로 누군가 “저 사람 공원에서 노래하던 분 아니야?” 하고 속삭였다.'},
  {name:'류현상',text:'오늘은 이상하게 목이 덜 떨린다. 명동은 시끄럽고, 사람들은 바쁘고, 그래서 오히려 노래가 더 멀리 갈 것 같은 기분이 들었다. 그는 천천히 반주를 맞추고 검정치마의 “기다린만큼, 더”를 시작했다.'},
  {name:'류현상',text:'“그대가 숨겨놨던 아픈 상처들 다 내게 옮겨주세요~ 오오오....” 후렴 첫 줄이 길게 퍼지자 지나가던 커플이 발을 멈췄다. 몇몇은 휴대전화를 들었고, 건너편 가게 앞 학생 두 명도 소리를 따라 낮게 흥얼거렸다.'},
  {name:'류현상',text:'“지치지 않고 슬퍼할 수 있게 나를 좀 더 가까이 둬요~~~ 허~~워!!!!” 고음을 밀어 올리는 순간, 앞줄 관객들 사이에서 작은 탄성이 터졌다. 손에 든 컵을 멈춘 사람, 사진을 찍다가 아예 영상을 눌러 버린 사람, 아무 말 없이 끝까지 서서 듣는 사람까지 하나둘 늘어났다.'},
  {name:'나레이션',text:'버스킹이 끝난 뒤에도 휴대전화 카메라는 쉽게 내려가지 않았다. 명동 한복판에서 찍힌 그 영상은 류현상의 손에도 들어갔고, 그는 잠시 망설이다 자신의 인스타그램에 직접 올렸다. 별생각 없이 올린 한 개의 릴스였다.'},
  state.manager.hired?{name:'후라보노',text:'새벽이 되기 전 후라보노의 메시지가 폭격처럼 쏟아졌다. “형, 지금 그 영상 조회수 이상하게 올라가요. 명동 버스킹 영상이 추천 알고리즘을 탔어요. 잠깐만요… 55만, 120만, 300만… 아니, 555만 찍었어요.” 류현상은 침대에서 벌떡 일어나 화면을 다시 확인했다.'}:{name:'류현상',text:'새벽이 되기 전부터 휴대전화 알림이 폭격처럼 쏟아졌다. 명동 버스킹 영상은 55만, 120만, 300만을 지나 결국 555만 조회를 찍었다. 류현상은 침대에서 벌떡 일어나 통계 화면을 몇 번이나 새로고침했다.'},
  {name:'나레이션',text:'하룻밤 사이에 영상 조회수는 555만을 넘겼고, 인스타그램 팔로워는 3만 명이 늘었다. 댓글에는 “이 사람 누구냐”, “라이브가 음원보다 좋다”, “명동에서 이걸 공짜로 들었다고?” 같은 반응이 쏟아졌다. 류현상은 뜨거운 화면을 내려다보다가, 조용히 숨을 삼켰다. 이번에는 정말로 더 많은 사람들이 그의 이름을 기억했다.'}
 ];
 let page=0;
 const area=$('#choiceArea');
 const draw=()=>{
  const scene=scenes[page];
  state.dialogue={name:scene.name,text:scene.text};
  render();
  area.innerHTML='';
  const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;
  const next=document.createElement('button');next.textContent=page===scenes.length-1?'특별 스토리 마치기':'다음 장면';
  area.append(prev,next);area.classList.remove('hidden');
  prev.onclick=()=>{if(page>0){page--;draw()}};
  next.onclick=()=>{
   if(page<scenes.length-1){page++;draw();return;}
   stat('fans',3000);stat('fame',555);stat('stress',4);
   state.specialEvents.waitedMoreViral=true;state.performanceCount++;
   const gearNotice=consumeBuskingEquipment();
   endSpecialScene();
   addHistory('🔥 명동 특별 이벤트 · 기다린만큼, 더 커버 555만 조회, 인스타그램 팔로워 30,000명 증가','special:waitedMore');
   state.dialogue={name:state.manager.hired?'후라보노':'류현상',text:(state.manager.hired?'명동 버스킹 영상 조회수가 555만이에요. 팔로워도 3만이나 늘었고요. 형, 이제 다들 형 이름을 그냥 스쳐 지나가지 않을 거예요.':'명동 버스킹 영상 조회수가 555만을 찍었다. 팔로워도 3만이 늘었다. 어쩌면 오늘의 노래가, 내 이름을 더 멀리 데려다줄지도 모른다.')+gearNotice};
   state.skipNextStory=true;
   const changes=describeStatChanges(before);
   playSfx('success');
   if(changes)appendStatChangesToDialogue(changes);
   if(checkStalkerEvent())return;
   advance(1);
  };
 };
 draw();
}
function maybeStartWaitedMoreViralEvent(band,hpCost){
 if(band||state.specialEvents?.waitedMoreViral||fameLevel()<55)return false;
 if(!costHp(hpCost))return true;
 startWaitedMoreViralStory();
 return true;
}
const MYSTERY_OUTFIT_PRICE=44444444;
function finishMysteriousMerchantEvent(message){
 endSpecialScene();
 state.dialogue={name:'류현상',text:message};
 setChoiceLock(false);save(false);render();
}
function runMysteriousMerchantEvent(){
 beginSpecialScene('mysteriousMerchant');
 const scenes=[
  {name:'나레이션',text:'해가 완전히 저문 뒤였다. 류현상이 다음 일정을 위해 골목을 지나던 순간, 분명 조금 전까지 비어 있던 길 한가운데에 낯선 상인이 서 있었다. 넓은 삿갓과 여러 겹의 검은 로프가 얼굴을 전부 가리고 있었고, 등에 멘 커다란 보따리에서는 금속이 맞부딪히는 듯한 희미한 소리가 들렸다.'},
  {name:'이름 모를 상인',text:'“자네… 이거 하나 사지 않겠나?” 상인은 인사도, 자기소개도 없이 낮게 말했다. 류현상이 대답하기도 전에 그는 보따리 깊숙한 곳으로 손을 넣었다. 이상하게도 보따리 안쪽에서는 밤의 골목과 어울리지 않는 눈부신 빛이 새어 나왔다.'},
  {name:'나레이션',text:'상인이 꺼낸 것은 옷처럼 보였다. 그러나 천인지 금속인지조차 구분할 수 없었다. 검은 표면 위로 금빛과 푸른빛이 물결처럼 지나갔고, 움직이지 않는데도 별가루 같은 빛이 계속 흘러내렸다. 옷깃 안쪽에 붙은 표찰에는 이름 대신 물음표 세 개만 적혀 있었다. 「???」.'},
  {name:'이름 모를 상인',text:'“다시 오지 않을 기회야….” 상인은 가격이 적힌 낡은 나무패를 내밀었다. 44,444,444원. 장난이라고 보기에는 눈앞의 옷이 너무 선명했고, 믿기에는 모든 것이 지나치게 수상했다. 류현상은 빛나는 옷과 얼굴 없는 상인을 번갈아 바라봤다.'},
  {name:'류현상',text:'“옷 한 벌에 사천사백사십사만 사천사백사십사 원… 미친 가격인데.” 그는 그렇게 말하면서도 쉽게 시선을 떼지 못했다. 이 옷을 입고 무대에 오르면 누구든 자신을 바라볼 것 같은 불길하고도 강렬한 확신이 들었다. 수상해 보이지만… 정말 살까?'}
 ];
 let page=0;const area=$('#choiceArea');
 const draw=()=>{
  const scene=scenes[page];state.dialogue={name:scene.name,text:scene.text};render();area.innerHTML='';area.classList.remove('hidden');
  const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;area.appendChild(prev);
  prev.onclick=()=>{if(page>0){page--;draw()}};
  if(page<scenes.length-1){
   const next=document.createElement('button');next.textContent='다음 장면';area.appendChild(next);next.onclick=()=>{page++;draw()};setChoiceLock(false);return;
  }
  const decide=document.createElement('button');decide.className='primary choice-trigger';decide.textContent='구매 여부 선택하기';area.append(decide);setChoiceLock(true);
  decide.onclick=()=>openChoiceModal('수상한 상인의 제안','이름 없는 의상 「???」을 구매할지 선택해 주세요.',[
   [`산다 · ${MYSTERY_OUTFIT_PRICE.toLocaleString()}원`,()=>{
    if(state.stats.money<MYSTERY_OUTFIT_PRICE){
     toast(`돈이 부족합니다. ${(MYSTERY_OUTFIT_PRICE-state.stats.money).toLocaleString()}원이 더 필요합니다.`);
     state.dialogue={name:'이름 모를 상인',text:'“값을 치를 수 있을 때 다시 만나게 될지도 모르지….” 상인은 옷을 다시 보따리 속으로 넣었다. 아직 구매하지 않았으므로, 이 수상한 상인은 언젠가 다시 나타날 수 있다.'};render();draw();return;
    }
    const before=snapshotStats();stat('money',-MYSTERY_OUTFIT_PRICE);stat('fame',1000);
    if(!state.ownedOutfits.includes(6))state.ownedOutfits.push(6);
    state.specialEvents.mysteriousMerchantPurchased=true;
    addHistory('🕯 수상한 상인 · 44,444,444원을 지불하고 이름 없는 의상 「???」을 구매했다. 인지도가 10레벨 상승했다.','special:mysteriousMerchantPurchased');
    playSfx('success');
    const changes=describeStatChanges(before);
    finishMysteriousMerchantEvent('상인은 돈을 세어 보지도 않고 보따리를 닫았다. “좋은 선택이었는지는 무대가 알려 줄 걸세.” 다음 순간 골목의 불빛이 한 번 깜빡였고, 상인은 흔적도 없이 사라졌다. 옷장에는 이름 없는 의상 「???」만이 남았다.');
    if(changes)appendStatChangesToDialogue(changes);
   }],
   ['안 산다',()=>{finishMysteriousMerchantEvent('류현상은 고개를 저었다. “아무리 봐도 사기잖아.” 상인은 낮게 웃으며 빛나는 옷을 다시 보따리 속에 넣었다. “후회하면… 다시 만날 수도 있겠지.” 구매하지 않았으므로 이 상인은 훗날 다시 나타날 수 있다.')}]
  ],choice=>{setChoiceLock(false);choice[1]()});
 };
 playSfx('event');draw();
}
function maybeCareerMilestoneEvent(){
 const lv=fameLevel();
 const defs=[
  {level:70,key:'careerLv70',title:'전국 음악 페스티벌 메인 무대',fame:300,fans:1800,money:2200000,stress:5,scenes:[
   {name:'나레이션',text:'인지도 Lv.70에 도달한 류현상에게 전국 규모 음악 페스티벌의 메인 무대 제안이 도착했다. 거리와 소극장에서 쌓아 온 시간이 처음으로 거대한 무대의 조명과 함성으로 이어지는 순간이었다.'},
   {name:'류현상',text:'수많은 관객이 자신의 이름을 외치는 모습을 바라보자, 공원에서 몇 사람 앞에 기타를 들고 노래하던 첫날이 떠올랐다. 류현상은 마이크를 단단히 쥐고 관객을 향해 손을 내밀었다.'},
   {name:'나레이션',text:'첫 음이 울리자 넓은 공연장이 함성으로 흔들렸다. 류현상은 큰 무대일수록 더 진심을 다해야 한다는 어머니의 말을 떠올리며 마지막 곡까지 온 힘을 다해 노래했다. 그날 이후 그의 이름은 지역을 넘어 전국의 공연 관계자들에게 알려졌다.'}
  ]},
  {level:80,key:'careerLv80',title:'첫 전국 투어 매진',fame:450,fans:3000,money:4000000,stress:7,scenes:[
   {name:'나레이션',text:'인지도 Lv.80에 도달하자 류현상의 첫 전국 투어가 시작됐다. 예매가 열릴 때마다 좌석은 빠르게 사라졌고, 여러 도시의 공연이 연이어 매진되었다.'},
   {name:'후라보노',text:'“형, 이제 관객이 형을 보려고 도시를 옮겨 다녀요.” 후라보노가 매진 표시가 가득한 예매 화면을 보여 주자 류현상은 아무렇지 않은 척 고개를 돌렸지만, 입가에는 숨기지 못한 미소가 남아 있었다.'},
   {name:'나레이션',text:'무대 위에서 바라본 객석은 붉은 응원빛으로 가득했다. 도시마다 관객의 얼굴과 말은 달랐지만 같은 후렴을 함께 불렀다. 류현상의 이름은 더 이상 일부 음악 팬만 아는 이름이 아니게 되었다.'}
  ]},
  {level:90,key:'careerLv90',title:'해외 쇼케이스 초청',fame:650,fans:5000,money:7000000,stress:8,scenes:[
   {name:'나레이션',text:'인지도 Lv.90에 도달한 류현상은 첫 해외 쇼케이스 무대에 초청됐다. 낯선 도시와 언어, 거대한 공연장이 기다리고 있었지만 객석에는 이미 그의 이름이 적힌 응원봉이 가득했다.'},
   {name:'류현상',text:'무대 중앙으로 걸어가며 류현상은 멀리서 자신을 기다린 팬들을 한 명씩 바라보았다. 말은 통하지 않아도 노래가 시작되자 관객의 함성과 떼창은 익숙한 리듬으로 돌아왔다.'},
   {name:'나레이션',text:'자작곡의 마지막 후렴을 해외 관객들이 각자의 발음으로 따라 불렀다. 공연이 끝난 뒤 그의 영상과 음악은 여러 언어로 공유되기 시작했고, 월드 스타를 향한 마지막 구간이 열렸다.'}
  ]}
 ];
 const def=defs.find(x=>lv>=x.level&&!state.specialEvents?.[x.key]);
 if(!def)return false;
 const before=snapshotStats();
 beginSpecialScene(def.key);
 let page=0;
 const area=$('#choiceArea');
 const draw=()=>{
  const scene=def.scenes[page];
  state.dialogue={name:scene.name,text:scene.text};
  render();
  area.innerHTML='';
  const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;
  const next=document.createElement('button');next.textContent=page===def.scenes.length-1?'특별 이벤트 마치기':'다음 장면';
  area.append(prev,next);area.classList.remove('hidden');
  prev.onclick=()=>{if(page>0){page--;draw()}};
  next.onclick=()=>{
   if(page<def.scenes.length-1){page++;draw();return}
   stat('fame',def.fame);stat('fans',def.fans);stat('money',def.money);stat('stress',def.stress);
   if(def.level>=90)state.fanGroups.overseas=(state.fanGroups.overseas||0)+1200;
   state.specialEvents[def.key]=true;
   endSpecialScene();
   addHistory(`🌟 커리어 도약 · ${def.title} · 인지도 +${def.fame}, 팬 +${def.fans.toLocaleString()}명`,`career:${def.key}`);
   playSfx('success');
   const changes=describeStatChanges(before);
   state.dialogue={name:state.manager.hired?'후라보노':'나레이션',text:`특별 이벤트 「${def.title}」가 끝났다.`};
   save(false);render();
   if(changes)appendStatChangesToDialogue(changes);
  };
 };
 playSfx('event');draw();
 return true;
}
function maybeMysteriousMerchantEvent(){
 if(state.specialEvents?.mysteriousMerchantPurchased||Math.random()>=.009)return false;
 runMysteriousMerchantEvent();return true;
}
const hiddenRandomSpecialEvents=[
 {key:'hiddenGameOst',sceneKey:'hiddenGameOst',title:'🎮 게임 OST 제안 · 천도박멸',condition:()=>state.day>=50,history:'🎮 숨겨진 특별 이벤트 · 판타지 웹툰 「천도박멸」의 OST 제작과 녹음 제안을 받아 새로운 영역에 도전했다.',reward:()=>{gainSkill('compose',5,'specialEvent');gainSkill('vocal',3,'specialEvent');stat('fame',45);stat('fans',90);stat('money',800000);stat('stress',3)},scenes:[
  {name:'나레이션',text:'쉰 날이 지난 어느 저녁, 류현상에게 낯선 계정으로 장문의 메시지가 도착했다. 처음에는 흔한 홍보나 협찬 문의라고 생각해 대충 넘기려 했지만, 메시지에는 그가 올린 자작곡과 버스킹 영상의 특정 구간을 정확히 언급한 감상이 적혀 있었다. 보낸 사람은 판타지 웹툰을 연재 중인 남자 작가였다.'},
  {name:'웹툰 작가',text:'“안녕하세요. 저는 판타지 웹툰 「천도박멸」을 그리고 있습니다. 작품의 다음 대형 에피소드에 사용할 OST를 준비 중인데, 류현상 님의 목소리가 주인공의 분위기와 아주 잘 맞는다고 생각했습니다. 단순히 노래만 부르는 것이 아니라, 작품에 맞는 곡을 직접 제작하고 녹음해 주실 수 있을까요?”'},
  {name:'류현상',text:'현상은 제목부터 여러 번 읽었다. “천도박멸… 제목이 세긴 하네.” 웹툰은 인간계와 천계의 균형이 무너진 뒤, 봉인된 힘을 가진 주인공이 운명에 맞서는 이야기였다. 검과 마법, 배신과 구원, 멸망 직전의 세계가 이어지는 무거운 판타지였다. 평소 자신이 쓰던 사랑 노래와는 완전히 다른 결이었다.'},
  {name:'나레이션',text:'며칠 뒤 두 사람은 카페에서 만났다. 작가는 인물 설정표와 전투 장면 콘티, 다음 화의 감정선을 펼쳐 놓고 설명했다. 류현상은 처음에는 팔짱을 낀 채 조용히 듣기만 했지만, 주인공이 모든 것을 잃고도 다시 검을 드는 장면에서 눈빛이 달라졌다. 실패한 뒤 다시 시작한 자신의 기억과 묘하게 겹쳐 보였기 때문이다.'},
  {name:'류현상',text:'“웅장한 곡으로만 가면 흔해질 것 같아요. 초반에는 거의 속삭이듯 시작하고, 후렴에서 세계가 무너지는 느낌으로 확 커지게 하죠. 주인공이 강해서 싸우는 게 아니라, 무서운데도 다시 일어나는 사람처럼 들려야 해요.” 작가는 잠시 놀란 표정으로 바라보다가 빠르게 메모를 시작했다.'},
  {name:'나레이션',text:'현상은 밤마다 작품을 다시 읽으며 멜로디를 만들었다. 검이 부딪히는 장면에는 날카로운 리듬을, 주인공이 동료를 떠올리는 장면에는 길게 남는 피아노 선율을 넣었다. 가이드 보컬을 녹음할 때는 평소보다 낮고 거친 음색을 사용했고, 마지막 고음에서는 마치 봉인이 깨지는 것처럼 감정을 밀어 올렸다.'},
  {name:'웹툰 작가',text:'최종 녹음이 끝난 뒤 작가는 헤드폰을 벗지 못한 채 한동안 침묵했다. “제가 그리려던 장면이 노래로 먼저 완성된 것 같아요.” 현상은 쑥스러운 듯 시선을 피하며 대답했다. “과장은 됐고, 독자들이 장면에 집중할 수 있으면 됐어요.” 말은 까칠했지만 입가에는 만족스러운 미소가 남아 있었다.'},
  {name:'나레이션',text:'「천도박멸」 OST 공개 소식은 웹툰 독자와 기존 팬들 사이에서 빠르게 퍼졌다. 류현상은 처음으로 다른 창작자의 세계를 음악으로 확장하는 경험을 했다. 이번 제안은 단순한 외주가 아니라, 그가 가수이자 작곡가로 새로운 영역에 발을 들인 사건이 되었다.'}
 ]},
 {key:'hiddenRadioDj',sceneKey:'hiddenRadioDj',title:'🎙 라디오 고정 게스트 제안',condition:()=>state.day>=100&&state.manager.hired,history:'📻 숨겨진 특별 이벤트 · 라디오 고정 게스트가 되어 청취자의 사연에 맞춘 노래를 부르는 라디오 버스킹을 시작했다.',reward:()=>{gainSkill('vocal',4,'specialEvent');stat('fans',180);stat('fame',70);stat('money',500000);stat('stress',-2)},scenes:[
  {name:'나레이션',text:'백 일이 지난 어느 날, 후라보노가 평소보다 이른 시간에 류현상을 깨웠다. 지역 음악 라디오 프로그램에서 고정 게스트 제안이 들어왔다는 소식이었다. 매주 한 번 스튜디오에 출연해 청취자의 사연을 읽고, 그 사연에 어울리는 노래를 짧게 라이브로 들려주는 코너였다.'},
  {name:'류현상',text:'“내가 말을 많이 해야 하는 거면 안 해.” 현상은 이불을 뒤집어쓴 채 즉시 거절하려 했다. 후라보노는 태연하게 대답했다. “형이 말을 잘해서 부르는 게 아니라, 말이 짧아서 부르는 거래요. 사연 듣고 한마디 한 다음 노래하면 된대요.” 현상은 그 설명이 칭찬인지 아닌지 판단하지 못한 채 한동안 침묵했다.'},
  {name:'나레이션',text:'첫 녹화 날, 밝은 낮의 라디오 스튜디오는 생각보다 편안했다. DJ 소라는 긴장을 풀어 주려 가벼운 질문부터 던졌다. 현상은 준비한 답보다 늘 한 문장씩 짧게 대답했지만, 억지로 꾸미지 않은 말투가 오히려 청취자들에게 솔직하게 들렸다.'},
  {name:'DJ 소라',text:'“오늘 사연은 꿈을 포기할까 고민하는 스물아홉 살 청취자분의 이야기예요. 몇 번을 실패했는데 다시 시작할 용기가 나지 않는다고 합니다. 현상 씨는 어떤 말을 해 주고 싶으세요?”'},
  {name:'류현상',text:'현상은 대본을 내려다보다가 천천히 마이크 쪽으로 몸을 기울였다. “저도 한 번 크게 망하고 도망친 적 있어요. 다시 시작해도 잘된다는 보장은 없죠. 그래도 안 하면 실패한 장면에서 시간이 멈춰 버립니다. 아주 조금이라도 다시 해 보는 편이… 덜 억울하더라고요.”'},
  {name:'나레이션',text:'그는 사연에 맞춰 조용한 기타 반주를 시작했다. 라디오 스튜디오는 작은 버스킹 무대가 되었고, 청취자는 보이지 않았지만 수많은 사람이 각자의 방과 차 안에서 그 노래를 듣고 있었다. 곡이 끝난 뒤 실시간 메시지 창에는 “오늘 다시 이력서를 써 보겠다”, “노래 듣고 울었다”는 반응이 이어졌다.'},
  {name:'DJ 소라',text:'“말을 못 한다고 하셨는데, 필요한 말은 다 하시네요.” DJ가 웃으며 말하자 현상은 민망한 듯 안경을 고쳐 썼다. “다음부터는 노래만 시키세요.” 하지만 방송이 끝난 뒤 그는 다음 주 사연 목록을 누구보다 먼저 챙겨 보았다.'},
  {name:'나레이션',text:'라디오 버스킹 코너는 고정 코너로 편성되었다. 류현상은 매주 다른 사람의 사연을 음악으로 받아 적었다. 무대에서 관객의 얼굴을 보며 노래하는 것과는 또 다른 방식으로, 그의 목소리는 누군가의 가장 조용한 시간에 도착하기 시작했다.'}
 ]},
 {key:'hiddenDingo',sceneKey:'hiddenDingo',title:'🎬 딩고 · 더 넥스트 라이징 보이스',condition:()=>fameLevel()>=60&&state.manager.hired,history:'🎬 숨겨진 특별 이벤트 · 딩고 「더 넥스트 라이징 보이스」에 출연해 「기다린만큼, 더」 라이브 영상 조회수 1위를 달성했다.',reward:()=>{gainSkill('vocal',5,'specialEvent');stat('fans',1200);stat('fame',280);stat('money',1500000);stat('stress',4)},scenes:[
  {name:'나레이션',text:'인지도 레벨 60을 넘긴 뒤, 음악 콘텐츠 채널 딩고에서 연락이 왔다. 차세대 남성 보컬을 소개하는 프로젝트 「더 넥스트 라이징 보이스」의 후보로 류현상이 추천됐다는 내용이었다. 여러 가수의 라이브 영상이 같은 기간 공개되고, 조회수와 반응을 통해 가장 주목받는 목소리를 가리는 기획이었다.'},
  {name:'후라보노',text:'“형, 이건 꼭 해야 해요. 라이브 한 번으로 지금까지 형을 몰랐던 사람들이 전부 볼 수 있어요.” 현상은 제안서를 한참 읽다가 물었다. “후보라는 건 떨어질 수도 있다는 거잖아.” 후라보노는 웃으며 대답했다. “그러니까 형 성격에 딱 맞죠. 이겨야 기분 좋으니까.”'},
  {name:'나레이션',text:'촬영곡은 명동 버스킹에서 큰 반응을 얻었던 「기다린만큼, 더」로 결정됐다. 화려한 세트나 관객 없이, 보라색 조명과 마이크 하나만 놓인 스튜디오였다. 숨길 장치가 없다는 점이 오히려 현상을 긴장시켰다. 작은 호흡 하나와 음정의 흔들림까지 전부 카메라에 남는 자리였다.'},
  {name:'류현상',text:'촬영 직전 현상은 이어폰을 빼며 말했다. “보정 많이 하지 마세요. 라이브라고 해 놓고 다 만지면 의미 없잖아요.” 제작진은 당황하면서도 고개를 끄덕였다. 까칠한 요구였지만, 그만큼 자신의 목소리로 정면 승부하고 싶다는 뜻이었다.'},
  {name:'나레이션',text:'반주가 시작되자 스튜디오는 순식간에 조용해졌다. 현상은 첫 소절을 낮게 눌러 부른 뒤, 후렴으로 갈수록 감정을 점점 크게 밀어 올렸다. 명동 거리의 소음 속에서 불렀을 때와 달리 이번에는 아주 작은 떨림까지 선명하게 들렸다. 마지막 음이 끝난 뒤 제작진 누구도 바로 말을 꺼내지 못했다.'},
  {name:'제작진',text:'“컷 하겠습니다.”라는 말이 떨어진 뒤에야 스태프들이 박수를 쳤다. 현상은 만족스럽지 않은 표정으로 “한 번 더 가도 돼요?”라고 물었지만, 감독은 첫 테이크가 가장 좋다며 그대로 사용하겠다고 했다. 완벽을 원하는 현상에게는 불안한 결정이었지만, 그 불완전한 생생함이 영상의 핵심이 되었다.'},
  {name:'나레이션',text:'영상 공개 첫날부터 댓글과 공유가 폭발했다. “왜 이제 알았지”, “버스킹 영상보다 음색이 더 잘 들린다”, “다음 라이징 보이스는 이 사람”이라는 반응이 이어졌다. 며칠 뒤 류현상의 영상은 프로젝트 참가자 중 조회수 1위를 기록했다.'},
  {name:'후라보노',text:'후라보노는 조회수 화면을 보여 주며 소리쳤다. “형, 더 넥스트 라이징 보이스 1위예요!” 현상은 한동안 숫자를 바라보다가 태연한 척 말했다. “당연한 거 아니야?” 후라보노는 즉시 받아쳤다. “방금 전까지 조회수 새로고침만 백 번 한 사람이요?” 현상은 대답 대신 휴대전화를 뒤집어 놓았다.'},
  {name:'나레이션',text:'딩고 라이브는 류현상을 버스킹 영상 속 화제의 인물이 아니라, 라이브 실력으로 기억되는 가수로 바꾸어 놓았다. 한 곡의 영상이 새로운 관객을 데려왔고, 그의 다음 무대를 기다리는 사람들의 수는 다시 크게 늘어났다.'}
 ]}
];
function runHiddenRandomSpecialEvent(def){
 beginSpecialScene(def.sceneKey);
 const before=snapshotStats();let page=0;const area=$('#choiceArea');
 const draw=()=>{const scene=def.scenes[page];state.dialogue={name:scene.name,text:scene.text};render();area.innerHTML='';const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;const next=document.createElement('button');next.textContent=page===def.scenes.length-1?'특별 스토리 마치기':'다음 장면';area.append(prev,next);area.classList.remove('hidden');prev.onclick=()=>{if(page>0){page--;draw()}};next.onclick=()=>{if(page<def.scenes.length-1){page++;draw();return}def.reward();state.specialEvents[def.key]=true;endSpecialScene();addHistory(def.history,`hidden:${def.key}`);state.dialogue={name:'나레이션',text:`숨겨진 특별 이벤트 「${def.title}」가 끝났다.`};playSfx('success');save(false);render();const changes=describeStatChanges(before);if(changes)appendStatChangesToDialogue(changes)}};playSfx('event');draw();
}
function maybeHiddenRandomSpecialEvent(){
 const pool=hiddenRandomSpecialEvents.filter(def=>!state.specialEvents?.[def.key]&&def.condition());
 if(!pool.length||Math.random()>=.30)return false;
 runHiddenRandomSpecialEvent(pick(pool));return true;
}
const fixedDaySpecialEvents=[
 {day:30,key:'day30Hair',sceneKey:'day30Hair',label:'30일 특별 이벤트 · 염색 고민',history:'💭 30일 특별 이벤트 · 노란 긴생머리로 염색할지 고민하다 결국 휴대전화를 껐다.',stat:()=>{stat('looks',1);stat('stress',1)},scenes:[
   {name:'나레이션',text:'버스킹을 시작한 지 어느새 서른 날. 밤이 깊은 자취방에서 류현상은 침대에 엎드린 채 휴대전화 화면을 한참이나 내려 보고 있었다. 오늘따라 알고리즘은 유난히 선명한 노란 장발 사진들을 자꾸만 추천해 주었다. 같은 장발이라도 색이 바뀌면 분위기가 달라질까, 사람들의 반응도 달라질까, 그런 생각이 머릿속을 맴돌았다.'},
   {name:'류현상',text:'“이렇게 하면… 더 인기가 많아질 것 같은데.” 그는 화면을 확대해 가며 머리 끝의 결, 빛에 반사되는 색감, 안경과의 어울림까지 혼자 진지하게 따져 봤다. 무대에서 조명을 받으면 확실히 눈에 더 띌 것 같았다. 무뚝뚝한 인상도 조금은 부드러워 보일지 모른다는 기대도 생겼다.'},
   {name:'나레이션',text:'하지만 기대가 커질수록 이상한 두려움도 함께 올라왔다. 염색이 잘못되면 어쩌지. 머릿결이 상하면? 무엇보다 현상은 진지한 표정으로 이마를 쓸어 올리며 가장 큰 공포를 중얼거렸다. ‘혹시 탈모 오는 거 아니야…?’ 노래가 안 나오는 악몽보다, 머리카락이 빠지는 상상이 더 선명하게 그려졌다.'},
   {name:'류현상',text:'그는 검색창에 “염색 탈모 진짜?”를 쳤다가 “장발 남자 탈색 후 관리”, “노란 머리 안 어울리는 사람 특징”까지 줄줄이 눌러 봤다. 볼수록 마음은 더 흔들렸다. ‘인기가 좀 늘 수도 있겠지. 그런데 머리가 줄어들면 무슨 의미가 있어.’ 진지한 고민 같지만, 본인도 어딘가 우스워서 입꼬리가 살짝 올라갔다.'},
   {name:'나레이션',text:'잠시 뒤 류현상은 휴대전화를 천천히 뒤집어 놓았다. 세상이 요구하는 이미지를 따라 바꾸는 일도 중요할 수 있지만, 적어도 오늘은 아니라고 결론 내렸다. 그는 검은 머리를 한 번 쓸어 넘기고 한숨처럼 웃었다. 아직은 그냥, 내가 아는 내 얼굴로 더 버텨 보기로 했다.'},
   {name:'류현상',text:'“나중에 진짜 엄청 유명해지면… 그때 다시 고민하지 뭐.” 그렇게 중얼거린 뒤 그는 화면을 껐다. 침대 옆 스탠드 불빛 아래 검은 머리카락이 조용히 빛났다. 노란 머리는 잠시 미뤘지만, 언젠가 더 큰 무대에 설 자신의 모습은 조금 또렷해졌다.'}
 ]},
 {day:60,key:'day60Workout',sceneKey:'day60Workout',label:'60일 특별 이벤트 · 5회 푸쉬업',history:'💪 60일 특별 이벤트 · 몸 관리를 결심했지만 푸쉬업 5회에서 체력이 바닥났다.',stat:()=>{stat('hp',4);stat('looks',1);stat('stress',1)},scenes:[
   {name:'나레이션',text:'예순째 날 밤, 샤워를 마치고 나온 류현상은 무심코 거울 앞에 멈춰 섰다. 조용한 방 안에는 책상 스탠드의 노란 빛만 남아 있었고, 그 빛 아래 비친 자신의 어깨선과 팔선이 괜히 더 적나라해 보였다. 공연 영상 속 얼굴만 신경 썼지, 몸은 생각보다 훨씬 방치돼 있다는 사실을 그제야 실감했다.'},
   {name:'류현상',text:'“습… 이대론 안되겠는걸.” 늘 까칠한 톤으로 말하는 그였지만, 이번 한마디에는 꽤 진심이 담겨 있었다. 무대에 오래 서려면 목뿐 아니라 몸도 버텨 줘야 한다. 팬들이 좋아하는 건 목소리겠지만, 적어도 본인은 조금 더 단단한 몸으로 무대에 서고 싶었다.'},
   {name:'나레이션',text:'그는 바닥에 매트를 펼쳤다. 마치 엄청난 결심을 한 사람처럼 물병까지 곁에 세워 놓고, 머리를 질끈 묶었다. 팔을 바닥에 짚는 순간만큼은 꽤 진지했다. ‘오늘부터 관리한다. 꾸준히 한다. 진짜 한다.’ 누구에게 들려줄 것도 아닌 선언을 속으로 세 번쯤 반복했다.'},
   {name:'류현상',text:'하나. 둘. 셋. 넷… 다섯. 다섯 번째 푸쉬업을 겨우 마치자 팔이 먼저 항의를 시작했다. 숨이 턱까지 차올랐고, 어깨는 이미 오늘의 임무를 끝냈다는 듯 떨렸다. 현상은 그대로 매트 위에 엎드린 채 한동안 꿈쩍도 못 했다. 운동 시작 30초 만에 세계 평화를 기원하는 심정이 되었다.'},
   {name:'나레이션',text:'잠시 후 그는 팔을 쭉 뻗은 채 바닥에 누워 스스로를 변호하기 시작했다. ‘시작이 중요한 거지. 무리하면 다음 날 더 못 한다. 천천히 가는 게 오래 간다.’ 틀린 말은 아니었다. 다만 그 말이 푸쉬업 다섯 번 뒤에 나오니 설득력이 조금 떨어질 뿐이었다.'},
   {name:'류현상',text:'결국 그는 식은땀을 닦으며 일어났다. “그래도… 안 한 것보단 낫지.” 거울 속 모습이 갑자기 바뀐 것은 아니었지만, 적어도 손놓고 있진 않았다는 사실이 조금은 마음을 놓이게 했다. 언젠가 더 많은 사람 앞에 설 때를 위해, 오늘의 다섯 번은 너무 초라하면서도 묘하게 소중한 시작이었다.'}
 ]},
 {day:90,key:'day90Live',sceneKey:'day90Live',label:'90일 특별 이벤트 · 인스타 라이브',history:'📱 90일 특별 이벤트 · 인스타 라이브에서 기타를 치며 노래하다가 무리한 신청곡은 능숙하게 모르는 척 넘겼다.',stat:()=>{stat('fans',70);stat('fame',45);stat('stress',2)},scenes:[
   {name:'나레이션',text:'아흔째 날 밤, 류현상은 침대 옆 작은 조명을 켜 두고 휴대전화를 세웠다. 인스타그램 라이브 알림이 켜지자 익숙한 아이디들이 하나둘 들어오기 시작했다. 검은 셔츠 차림의 그는 기타를 무릎 위에 올리고 마이크를 조용히 당겼다. 방 안은 늦은 시간 특유의 적막으로 가득했지만, 화면 속 댓글창은 금세 사람들로 북적였다.'},
   {name:'류현상',text:'“오늘은 그냥… 조용한 노래 몇 곡 할 겁니다.” 시작은 담백했지만 첫 소절이 흘러나오자 반응은 곧 뜨거워졌다. ‘헐 라이브 미쳤다’, ‘목소리 왜 이렇게 가까워요’, ‘오늘 안경 너무 잘 어울려요’ 같은 댓글이 쉴 틈 없이 올라왔고, 하트 아이콘은 화면 오른쪽을 쉬지 않고 타고 올랐다.'},
   {name:'나레이션',text:'한참 분위기가 무르익었을 때, 채팅창에 한 팬이 아주 용감한 신청곡을 남겼다. 현상도 알고, 팬들도 아는, 호흡도 길고 고음도 높은 그 악명 높은 곡이었다. 화면에는 “그 노래 불러 주세요!”라는 댓글이 연달아 달렸고, 현상은 분명히 그 문장을 봤으면서도 아주 능숙하게 기타 줄만 만지작거렸다.'},
   {name:'류현상',text:'“음… 채팅이 조금 빨라서 잘 안 보이네요.” 방금 전까지 작은 이모티콘 하나도 정확히 읽던 사람이 갑자기 난독증이라도 온 듯한 말투였다. 팬들은 곧바로 웃음 표시를 쏟아 냈다. “지금 봤잖아요”, “읽었으면서 모르는 척한다”, “이럴 때만 인터넷 느려짐?” 같은 댓글이 쏟아지자 현상은 결국 피식 웃고 말았다.'},
   {name:'류현상',text:'“힘든 노래는… 오늘 제 컨디션을 위해 잠시 묻어 두겠습니다.” 그는 일부러 진지한 척 말했지만, 팬들은 이미 다 알아차린 상태였다. 누군가는 “가수의 건강권을 보장하라”고 적었고, 누군가는 “모르는 척하는 표정까지 콘텐츠”라고 남겼다. 라이브는 오히려 그 장면 덕분에 더 유쾌해졌다.'},
   {name:'나레이션',text:'방송이 끝날 무렵 시청자 수는 예상보다 훨씬 높아져 있었다. 오늘의 라이브는 대형 바이럴까지는 아니어도, 팬들에게 류현상의 밤을 조금 더 가까이 건네준 시간이었다. 그는 로그아웃 버튼을 누르며 조용히 웃었다. 힘든 신청곡은 피했지만, 팬들의 웃음은 확실히 얻어 낸 밤이었다.'}
 ]},
 {day:120,key:'day120Chat',sceneKey:'day120Chat',label:'120일 특별 이벤트 · 팬톡 대소동',history:'💬 120일 특별 이벤트 · 기획 일을 해 보고 싶다고 팬들과 상의했다가 누나에게 답정너 소리를 들었다.',stat:()=>{stat('fans',120);gainSkill('compose',2,'specialEvent');stat('stress',2)},scenes:[
   {name:'나레이션',text:'백스무째 날 밤, 류현상은 팬들과의 단체 채팅방을 열어 놓고 한참을 망설였다. 요즘은 노래 만드는 일도 재미있지만, 이상하게도 기획안을 짜고 콘셉트를 구상하는 순간에도 꽤 큰 몰입을 느끼고 있었다. 기획사를 말아먹었던 기억이 아직도 남아 있는데도, 다시 그 세계를 들여다보고 싶다는 마음이 고개를 들고 있었다.'},
   {name:'류현상',text:'그는 결국 긴 메시지를 보냈다. “요즘 노래 만드는 것도 너무 재밌지만, 기획 일도 욕심나네요… 노래보다 기획 일을 조금 더 해 보고 싶은데 어떻게 생각해요? 솔직한 의견 궁금해요.” 평소보다 꽤 부드럽게 적은 문장이었지만, 마지막엔 또 어색한 이모지를 하나 붙여 놓았다. 류현상 나름의 사회성 노력의 흔적이었다.'},
   {name:'팬들',text:'답장은 거의 동시에 쏟아졌다. “형 노래 너무 좋아요. 가수 계속해 주세요 제발요🥺”, “기획도 잘할 것 같지만 우리는 형의 목소리를 더 듣고 싶어요!”, “오래오래 가수로 있어 줘요 ㅠㅠ”, “기획도 멋있지만 형이 노래할 때가 제일 빛나요✨” 같은 말들이 채팅창을 빠르게 채웠다. 현상은 스크롤을 내리며 묘하게 웃었다.'},
   {name:'류현상',text:'팬들의 반응을 다 읽은 뒤 그는 장난기 섞인 답을 남겼다. “하핫… 제 맘대로 할겁니다😏 (농담 반 진담 반 😜)” 팬들은 곧바로 ‘형 무서워요’, ‘이럴 거면 왜 물어봐요’, ‘그래도 결국 노래하실 거잖아요’라며 또 한 번 웃음 섞인 아우성을 보냈다. 현상도 자기 말이 약간 답정너처럼 들렸다는 걸 느끼고 있었지만, 이미 늦었다.'},
   {name:'누나',text:'그리고 잠시 뒤, 채팅방에 낯익은 이름이 등장했다. 류현상의 누나였다. “그럴거면 왜 물어보냐? 답정너 자식아 ㅋㅋㅋㅋ 그냥 네가 하고 싶은 거 해 진짜.” 채팅창은 순식간에 폭발했다. 팬들은 “누나 등판”, “팩트 폭행 너무 웃겨요”, “누나가 제일 정확해요”라며 환호했고, 현상은 핸드폰을 들고도 한동안 아무 말 없이 웃기만 했다.'},
   {name:'나레이션',text:'결국 그날의 채팅은 노래와 기획, 팬들의 진심, 그리고 누나의 한 방까지 모두 뒤섞인 채 마무리됐다. 류현상은 휴대전화를 내려놓으며 생각했다. 아직 정확한 답을 정한 것은 아니지만, 적어도 자신이 어떤 모습일 때 가장 많은 사람들이 빛을 본다고 말해 주는지는 분명히 알게 되었다.'}
 ]},
 {day:150,key:'day150Birthday',sceneKey:'day150Birthday',label:'150일 특별 이벤트 · 생일 파티',history:'🎂 150일 특별 이벤트 · 팬들이 생일을 축하해 주었고, 한 오랜 팬에게서 귀한 디지몬 카드 50장을 선물받았다.',stat:()=>{stat('fans',300);stat('stress',-6);state.items.bakcas+=2},scenes:[
   {name:'나레이션',text:'백오십째 날, 류현상은 평소보다 조금 이른 시간에 팬들을 만나러 갔다. 별다를 것 없는 일정이라고 생각했지만, 문을 열자마자 보인 풍경은 예상 밖이었다. 조명이 걸린 공간 한가운데에는 검은색과 금색으로 장식된 케이크가 놓여 있었고, 벽에는 ‘Happy Birthday’ 문구와 그의 사진들이 정성스럽게 붙어 있었다. 팬들은 숨을 죽이고 있다가 그가 들어오자 일제히 환하게 웃었다.'},
   {name:'팬들',text:'“생일 축하해요!” 하는 목소리가 여러 방향에서 한꺼번에 쏟아졌다. 누군가는 케이크를 조심히 앞으로 내밀었고, 누군가는 포장된 선물을 한가득 안겨 주었다. 현상은 순간 당황한 표정으로 안경을 고쳐 썼다. 이렇게 많은 축하를 정면으로 받는 일은 여전히 익숙하지 않았지만, 그 낯설음 자체가 따뜻하게 느껴졌다.'},
   {name:'류현상',text:'“이렇게까지 준비한 거예요…?” 그는 늘 그렇듯 감정을 크게 드러내진 않았지만, 목소리는 평소보다 확실히 부드러웠다. 팬들은 웃으며 “오래된 팬이라면 이 정도는 기본이에요”, “오늘은 까칠 금지예요”, “소원 빌고 촛불 끄셔야 돼요”라며 그를 가운데로 이끌었다. 현상은 민망한 듯 한 손을 가슴에 얹고 조용히 고개를 숙였다.'},
   {name:'나레이션',text:'선물은 예상보다 다양했다. 손편지, 직접 만든 키링, 기타 피크 세트, 향이 좋은 차, 무대에서 쓰라며 준비한 소소한 소품까지. 그런데 오래된 한 팬이 내민 상자는 유독 묵직했다. 조심스럽게 포장을 풀자 안에는 투명 슬리브에 넣어 정리된 카드들이 빼곡히 들어 있었다.'},
   {name:'팬',text:'“이거… 전 세계에서 구하기 어려운 디지몬 카드들이에요. 50장 모았어요. 현상 씨가 디지몬 좋아한다고 예전에 말했잖아요.” 순간 류현상의 표정이 눈에 띄게 무너졌다. 무대 위에서 잘 흔들리지 않던 사람이 카드 한 장 한 장을 넘겨 보며 거의 숨을 삼키듯 웃었다. “이건… 진짜 귀한 건데. 아니, 이걸 어떻게…” 그의 눈빛에는 진짜 기쁨이 그대로 드러나 있었다.'},
   {name:'나레이션',text:'그날의 생일은 단순히 케이크를 자르고 사진을 찍는 시간이 아니었다. 류현상에게는 자신이 오랫동안 부른 노래들이 누군가에게는 축하를 준비할 만큼 큰 마음이 되었다는 증거이기도 했다. 그는 선물들을 끌어안고 조용히 말했다. “고마워요. 진짜… 오래 기억할게요.” 팬들은 그 짧고 서툰 감사가 누구보다 진심이라는 것을 알고 있었다.'}
 ]},
 {day:180,key:'day180Archive',sceneKey:'day180Archive',label:'180일 특별 이벤트 · 폐업한 기획사의 흔적',history:'📂 180일 특별 이벤트 · 폐업한 기획사 자료와 흩어진 연습생들의 흔적을 다시 보며, 언젠가 다시 기획하겠다는 마음을 정리했다.',stat:()=>{gainSkill('compose',3,'specialEvent');stat('stress',-2);stat('fame',20)},scenes:[
   {name:'나레이션',text:'백여든째 날 저녁, 류현상은 자취방 구석에 처박혀 있던 오래된 서류 상자를 꺼냈다. 먼지가 뽀얗게 쌓인 상자 겉면에는 예전에 자신이 차렸던 작은 기획사의 이름이 희미하게 남아 있었다. 스물여섯, 잠깐 아이돌 활동으로 벌었던 돈을 모아 기획사를 차리고 세상을 뒤집을 수 있다고 믿었던 시절의 흔적이었다.'},
   {name:'류현상',text:'상자를 여는 손은 생각보다 조심스러웠다. 안에는 콘셉트 기획안, 데뷔 로드맵, 여자 아이돌 연습생 프로필 카드, 단체 인사법 메모, 매출 예상표까지 빼곡하게 들어 있었다. 너무 진지해서 오히려 웃긴 문장도 보였다. “1년 안에 업계 판도 변화.” 현상은 그 문장을 읽고 결국 작게 웃었다. “야, 자신감 하나는 대기업 회장이었네.”'},
   {name:'나레이션',text:'웃음 뒤에는 조금 쓴 기억도 따라왔다. 코로나가 터지기 전까지는 어떻게든 굴러갈 거라고 믿었다. 하지만 공연과 쇼케이스는 줄줄이 취소됐고, 연습생들에게 약속했던 데뷔 계획도 종이 위 문장으로만 남았다. 폐업 통보를 하던 날, 모두를 붙잡을 힘이 없었던 자신이 떠올랐다.'},
   {name:'류현상',text:'한 장 한 장 넘기다 보니 지금의 자신에게도 쓸 만한 아이디어들이 보였다. 팬들과의 소통 방식, 공연 동선, 굿즈 메모, 앨범 콘셉트 구상…. “지금 보면 엉성한데, 완전히 틀린 건 아니네.” 예전의 실패가 전부 실패로만 남은 것은 아니라는 사실이 조금 위로가 됐다.'},
   {name:'나레이션',text:'잠시 그는 생각했다. 언젠가는 다시 기획을 더 본격적으로 해 보고 싶다고. 다만 이번에는 무대 밖으로 도망치듯 회사를 만드는 게 아니라, 가수로 성공한 뒤 더 좋은 팀과 더 좋은 작품을 만드는 방식이어야 한다고. 망해 본 사람이니 할 수 있는 기획도 분명 있을 것이다.'},
   {name:'류현상',text:'현상은 상자 맨 위에 있던 계획표를 조용히 접어 다시 넣었다. “기획을 다시 하려면, 먼저 내가 성공해야지.” 짧은 한마디였지만, 그 안에는 과거의 실패와 지금의 다짐이 함께 들어 있었다. 실패한 기획사의 흔적은 여전히 아팠지만, 동시에 언젠가 다시 써먹을 수 있는 미래의 재료가 되어 있었다.'}
 ]},
 {day:210,key:'day210Demo',sceneKey:'day210Demo',label:'210일 특별 이벤트 · 새벽 데모와 디지몬 감성',history:'🎙 210일 특별 이벤트 · 새벽에 자작곡 데모를 만들다가 디지몬 감성이 과해진 가사에 스스로 웃었다.',stat:()=>{gainSkill('compose',4,'specialEvent');gainSkill('vocal',2,'specialEvent');stat('stress',1)},scenes:[
   {name:'나레이션',text:'이백열째 날 새벽, 류현상은 도무지 잠이 오지 않아 혼자 작업을 시작했다. 방 안은 조용했고, 창밖 도시의 불빛만 희미하게 깜빡였다. 그는 기타를 가볍게 튕기며 막 떠오른 멜로디를 휴대전화 녹음 앱에 담기 시작했다. 밤이 깊을수록 이상하게 좋은 멜로디가 잘 나오는 날이 있었다.'},
   {name:'류현상',text:'처음에는 꽤 진지했다. “좋은데… 이거 된다.” 그는 낮은 톤으로 멜로디를 흥얼거리고, 가사를 메모장에 빠르게 적어 내려갔다. 문제는 집중이 길어질수록 그의 취향도 점점 스며든다는 데 있었다. 잠깐 쉬는 사이 무심코 틀어 둔 디지몬 오프닝 영상이 머릿속에 남아 있었던 것이다.'},
   {name:'나레이션',text:'그래서였을까. 어느 순간 메모장에는 “진화하듯 커지는 마음”, “디지털처럼 번지는 신호”, “너와 나의 세계가 연결된다” 같은 문장이 줄줄이 적혀 있었다. 사랑 노래를 쓰는 줄 알았는데 어쩐지 마지막 후렴구는 모험과 진화를 외치는 분위기로 흘러갔다. 현상은 가사를 끝까지 적은 뒤 한동안 화면만 바라봤다.'},
   {name:'류현상',text:'“잠깐만… 이거 사랑 노래야, 디지몬 극장판 주제가야?” 본인이 써 놓고도 웃음이 터졌다. 아무리 디지몬을 좋아해도 그렇지, 감정선이 후렴에서 갑자기 궁극체처럼 진화해 버리면 곤란했다. 그는 머리를 쓸어 넘기며 한숨인지 웃음인지 모를 소리를 냈다.'},
   {name:'나레이션',text:'그래도 멜로디 자체는 꽤 마음에 들었다. 현상은 가이드 보컬을 한 번 더 녹음했고, 적당히 민망한 가사는 별표를 쳐 두고 수정 후보로 남겨 뒀다. 실패작은 아니었다. 오히려 웃기게 솔직해서 더 기억에 남는 데모였다. 언젠가 진짜 곡으로 발전시킬지, 평생 혼자만 듣고 웃을지는 아직 모른다.'},
   {name:'류현상',text:'파일명은 결국 “new_demo_final_real_last_진화금지”로 저장됐다. 그는 저장 버튼을 누르며 중얼거렸다. “이건 아무한테도 바로 안 들려준다… 조금 더 다듬은 뒤에 공개하자.” 새벽은 여전히 조용했지만, 그 조용함 속에서 또 하나의 류현상다운 곡의 씨앗이 생겨났다.'}
 ]},
 {day:240,key:'day240Meme',sceneKey:'day240Meme',label:'240일 특별 이벤트 · 팬 밈 정주행',history:'😂 240일 특별 이벤트 · 팬들이 만든 밈과 짤을 정주행하며 자신의 까칠한 이미지가 사랑받고 있음을 실감했다.',stat:()=>{stat('fans',150);stat('fame',35);stat('stress',-3)},scenes:[
   {name:'나레이션',text:'이백사십째 날 밤, 류현상은 팬카페와 SNS를 가볍게 둘러보다가 예상치 못한 게시글 하나를 눌렀다. 제목은 “류현상 레전드 모먼트 모음.zip”. 대수롭지 않게 들어갔지만, 그 안에는 그동안 팬들이 모아 둔 각종 짤과 밈, 자막 영상이 끝도 없이 정리돼 있었다. 문제는 그 자료들이 생각보다 너무 정교했다는 점이었다.'},
   {name:'팬들',text:'“무뚝뚝한데 끝까지 우산 씌워 줌”, “표정은 차가운데 박칵스는 먼저 챙겨 줌”, “팬한테 까칠하게 굴다가 집 가서 댓글 다 읽을 상”, “스태프를 혼낼 듯 말 듯 결국 먼저 도와줌” 같은 자막이 하나하나 붙어 있었다. 그의 말투, 안경 올리는 습관, 팬서비스를 부끄러워하는 미세한 표정까지 전부 밈 소재가 되어 있었다.'},
   {name:'류현상',text:'처음엔 “이 사람들 정말 할 일 많다…”라며 혀를 찼다. 그런데 몇 장 더 넘기자 결국 웃음을 참지 못했다. 특히 자신이 팬의 질문에 딱딱하게 답해 놓고는 뒤늦게 음료를 건네는 장면에 “츤데레 아저씨 아님 주의”라고 적혀 있는 짤에서는 완전히 무너졌다. “아저씨는 아니지.” 반박 포인트가 거기라는 점이 또 우스웠다.'},
   {name:'나레이션',text:'재미있었던 건, 그 밈들 속에 비꼼보다 애정이 훨씬 많았다는 사실이었다. 팬들은 그의 무뚝뚝함을 차가움으로만 보지 않았다. 오히려 서툴게 다정한 부분, 말보다 행동이 먼저 나가는 부분, 예민하지만 음악 앞에서는 누구보다 진지한 부분을 정확히 알고 웃고 있었다. 현상은 그제야 조금 안심했다.'},
   {name:'류현상',text:'“내가 저렇게 보이나….” 그는 민망한 표정으로 중얼거렸지만, 싫지는 않았다. 애써 꾸미지 않아도 좋아해 주는 사람들이 있다는 건 꽤 큰 위안이었다. 억지로 성격을 바꾸지 않아도, 대신 조금씩 더 좋은 사람이 되려고 노력하면 된다는 생각도 들었다.'},
   {name:'나레이션',text:'결국 류현상은 팬들이 만든 짧은 밈 영상 하나에 조용히 좋아요를 눌렀다. 그러자 몇 분 뒤 댓글이 또다시 폭발했다. “본체 등판”, “가수님 본인인증 완료”, “오늘도 떡밥 공급 감사합니다.” 그는 휴대전화를 내려놓으며 피식 웃었다. 가끔은 진지한 노래보다, 이런 사소한 웃음이 더 오래 사람을 붙잡아 주는 법이었다.'}
 ]},
 {day:300,key:'day300Promise',sceneKey:'day300Promise',label:'300일 특별 이벤트 · 텅 빈 공연장의 맹세',history:'🎤 300일 특별 이벤트 · 아무도 없는 공연장을 바라보며, 결과와 상관없이 노래를 계속하겠다고 다짐했다.',stat:()=>{stat('fans',250);stat('fame',70);gainSkill('vocal',2,'specialEvent');stat('stress',-4)},scenes:[
   {name:'나레이션',text:'삼백째 날, 공연 시작까지 아직 시간이 꽤 남아 있었지만 류현상은 남들보다 먼저 공연장 안으로 들어왔다. 객석은 비어 있었고, 무대 조명도 반쯤만 켜져 있었다. 관객의 함성도, 밴드의 튜닝 소리도 없는 빈 공연장은 이상할 만큼 넓고 조용했다. 그는 객석 맨 앞줄부터 가장 뒤쪽 자리까지 천천히 눈으로 훑었다.'},
   {name:'류현상',text:'처음 버스킹을 하던 날엔 세 명만 멈춰 서 줘도 다행이라고 생각했다. 지금은 그때보다 훨씬 더 많은 무대를 밟았고, 더 많은 사람의 얼굴을 알게 됐다. 그런데도 빈 객석을 바라보는 마음만큼은 그때와 크게 다르지 않았다. 무대에 서기 직전의 긴장, 목이 잠기지 않을까 하는 걱정, 오늘은 누군가의 하루를 조금이라도 바꿀 수 있을까 하는 기대.'},
   {name:'나레이션',text:'현상은 무대 중앙으로 걸어가 조용히 마이크 스탠드를 잡았다. 객석을 향해 선 채로 한동안 아무 말 없이 서 있었다. 실패했던 기획사, 군대로 도망쳤던 시간, 공원의 찬 바람, 수원역과 명동의 바이럴, 곁에서 도와준 사람들의 조언, 팬들의 웃음과 응원…. 지난 삼백 일이 파도처럼 스쳐 지나갔다.'},
   {name:'류현상',text:'그는 아무도 없는 객석을 향해 아주 작게 말했다. “결과가 뭐가 되든… 난 계속 노래한다.” 누군가에게 들려주기 위한 대사가 아니라, 자신에게 하는 약속이었다. 유명해져도, 뜻대로 안 돼도, 또다시 흔들려도 결국 자신을 살리는 건 노래라는 사실을 이제는 부정할 수 없었다.'},
   {name:'나레이션',text:'그 말 뒤에는 이상하게 마음이 가벼워졌다. 엔딩이 무엇이든, 숫자가 어느 정도이든, 류현상은 이미 중간에서 포기하던 과거의 자신과는 달라져 있었다. 무대는 아직 비어 있었지만 머지않아 관객들로 채워질 것이다. 그리고 그 순간 자신이 부를 첫 음을 그는 누구보다 잘 알고 있었다.'},
   {name:'류현상',text:'멀리서 스태프가 리허설 준비 신호를 보냈다. 현상은 마이크를 한 번 가볍게 쥐었다 놓고, 조용히 안경을 고쳐 썼다. “좋아. 오늘도 해보자.” 빈 공연장에 남긴 작은 맹세는, 곧 시작될 실제 무대를 향한 가장 단단한 예고가 되었다.'}
 ]},
 {day:330,key:'day330Mother',sceneKey:'day330Mother',label:'330일 특별 이벤트 · 어머니의 당부',history:'☕ 330일 특별 이벤트 · 오랜만에 어머니를 만나 팬과 무대를 대하는 진심을 다시 배웠다.',scenes:[
   {name:'나레이션',text:'삼백삼십째 날, 류현상은 오랜만에 어머니를 만나기 위해 집을 나섰다. 활동이 바빠진 뒤로 연락은 자주 했지만 얼굴을 마주 보고 앉아 이야기를 나눈 것은 꽤 오래전이었다. 약속 장소는 어머니가 좋아하는 조용한 카페였다. 창가로 오후 햇살이 들어오고, 테이블 위에는 따뜻한 커피와 아이스 아메리카노가 나란히 놓였다.'},
   {name:'어머니',text:'어머니는 류현상의 얼굴을 한참 바라보다가 가장 먼저 활동 이야기를 물었다. “요즘은 잘하고 있니? 방송도 나오고 공연도 한다던데, 바쁘다고 밥 거르거나 잠 줄이면 안 된다. 노래도 몸이 건강해야 오래 하는 거야.” 잘 지내고 있다는 대답을 듣고도 어머니의 표정에는 걱정이 남아 있었다.'},
   {name:'류현상',text:'“잘하고 있어요. 알아서 챙겨 먹고 다녀요.” 류현상은 대수롭지 않은 듯 대답했지만, 최근 며칠 동안 제대로 된 식사보다 편의점 음식으로 버틴 일이 떠올랐다. 어머니 앞에서는 괜히 자세를 바로 하고 컵을 만지작거렸다.'},
   {name:'어머니',text:'어머니는 이번에는 팬 이야기를 꺼냈다. “너를 좋아해서 시간 내고, 돈 쓰고, 멀리서 공연까지 보러 오는 사람들이 있잖니. 그 마음을 당연하게 생각하면 안 돼. 유명해질수록 팬들에게 더 잘해야 한다. 네가 힘들 때 네 노래를 들어 준 사람들이니까.”'},
   {name:'나레이션',text:'류현상은 처음에는 말없이 고개를 끄덕였다. 팬들에게 고맙다는 마음이 없는 것은 아니었다. 오히려 서툴게 표현해서 문제였다. 댓글을 전부 읽고도 짧게 답하거나, 공연 뒤 팬들이 기다리고 있으면 민망해서 무표정으로 지나친 적도 있었다. 어머니의 말은 그런 장면들을 하나씩 떠올리게 했다.'},
   {name:'어머니',text:'“그리고 공연 크기로 마음을 나누지 마라. 관객이 몇 명이든, 작은 무대든 큰 무대든 항상 진심을 다해야 해. 한 사람에게는 그날 네 공연이 오래 기다린 가장 중요한 하루일 수도 있어. 팬들을 위해 네가 해야 할 일은 매번 최선을 다해 노래하는 거야.”'},
   {name:'류현상',text:'류현상은 다시 조용히 고개를 끄덕였다. 하지만 건강, 식사, 팬, 공연 태도까지 말이 계속 이어지자 익숙한 잔소리처럼 들리기 시작했다. 결국 그는 등을 조금 펴고 평소보다 큰 목소리로 대답했다. “네~ 알겠어요. 진짜 알겠으니까 걱정 좀 그만해요.”'},
   {name:'어머니',text:'어머니는 잠시 류현상을 바라보다가 웃음을 터뜨렸다. “알겠다고 크게 말하는 사람치고 제대로 하는 사람 별로 없던데.” 류현상은 반박하려다 말고 아이스 아메리카노를 한 모금 마셨다. 어머니는 그런 아들의 긴 머리와 피곤해 보이는 얼굴을 바라보며 한 번 더 건강을 챙기라고 말했다.'},
   {name:'나레이션',text:'카페를 나선 뒤에도 어머니의 말은 머릿속에 오래 남았다. 듣는 순간에는 잔소리처럼 느껴졌지만, 결국 자신이 오래 노래하기를 바라는 마음에서 나온 말이라는 것을 알고 있었다. 류현상은 다음 공연의 규모와 상관없이 첫 곡부터 마지막 곡까지 더 진심을 다해 부르기로 했다. 팬에게 고맙다는 말도, 조금은 덜 어색하게 표현해 보기로 했다.'}
 ]},
 {day:360,key:'day360Reflection',sceneKey:'day360Reflection',label:'360일 특별 이벤트 · 1년을 앞둔 밤',history:'🌙 360일 특별 이벤트 · 활동 1년을 앞두고 지나온 관객과 팬, 앞으로의 길을 오래 생각하다 잠들었다.',scenes:[
   {name:'나레이션',text:'삼백육십째 날 밤. 활동을 시작한 지 거의 일 년이 되어 가고 있었다. 일정이 모두 끝난 뒤 자취방으로 돌아온 류현상은 불을 조금만 켜 둔 채 소파에 길게 누웠다. 평소라면 휴대전화로 반응을 확인하거나 다음 곡의 가사를 적었겠지만, 오늘은 아무것도 손에 잡히지 않았다.'},
   {name:'류현상',text:'“앞으로 나는 어떻게 되는 걸까.” 조용한 방 안에서 혼잣말이 유난히 크게 들렸다. 처음에는 당장 다음 공연만 생각하면 됐다. 관객이 멈춰 서 줄지, 장비가 고장 나지 않을지, 오늘 번 돈으로 생활할 수 있을지만 걱정했다. 하지만 시간이 쌓이고 자신을 아는 사람이 늘어나자 고민의 크기도 함께 커졌다.'},
   {name:'나레이션',text:'눈을 감자 지난 시간들이 순서 없이 떠올랐다. 기획사를 시작했다가 접어야 했던 날, 모든 것을 피해 군대로 들어갔던 시간, 전역 뒤 다시 기타를 들고 거리로 나간 첫날. 공원의 차가운 바람과 수원역의 젖은 보도블록, 처음 자신의 이름을 외쳐 준 관객의 목소리도 선명하게 되살아났다.'},
   {name:'류현상',text:'“나는 잘하고 있는 걸까. 이 길이 진짜 맞는 걸까.” 잘된 날만 있었던 것은 아니었다. 노래가 뜻대로 나오지 않은 날, 관객이 거의 없었던 날, 반응 하나에 기분이 흔들리고 숫자가 떨어질까 불안했던 날도 많았다. 유명해지고 싶다는 마음과, 음악을 좋아해서 계속하고 싶다는 마음이 서로 뒤엉켜 있었다.'},
   {name:'나레이션',text:'그동안 자신을 바라봐 준 관객들이 떠올랐다. 우연히 길을 지나가다 한 곡을 끝까지 듣고 간 사람, 작은 공연장 맨 뒤에서 조용히 박수를 친 사람, 같은 노래를 여러 번 들으러 온 팬, 먼 나라에서 번역기를 사용해 응원을 남긴 사람. 류현상에게는 짧은 만남이었지만 누군가에게는 오랫동안 기다린 순간이었을지도 몰랐다.'},
   {name:'류현상',text:'그는 팬들이 남긴 메시지를 몇 개 다시 열어 보았다. “힘든 날 이 노래를 들었다”, “다시 시작할 용기가 생겼다”, “다음 무대도 기다리겠다.” 자신은 여전히 흔들리고 있는데, 자신의 노래는 이미 누군가의 하루에 도착해 있었다. 그 사실이 고맙기도 하고 무겁기도 했다.'},
   {name:'나레이션',text:'앞으로 더 큰 무대에 설 수 있을지, 지금의 관심이 계속될지, 언젠가 다시 실패하게 될지는 알 수 없었다. 아무리 고민해도 미래의 답은 나오지 않았다. 다만 지난 일 년 동안 수없이 포기하고 싶었던 순간에도 결국 다시 마이크 앞에 섰다는 사실만큼은 분명했다.'},
   {name:'류현상',text:'“잘하고 있는지는 모르겠지만… 아직 그만두고 싶지는 않네.” 아주 작은 목소리였다. 완벽한 확신도 거창한 다짐도 아니었다. 하지만 다음 날에도 노래를 계속할 이유로는 충분했다. 류현상은 휴대전화를 내려놓고 소파에 몸을 더 깊이 기댔다.'},
   {name:'나레이션',text:'수없이 많은 생각이 다시 이어졌다가 천천히 흐려졌다. 지난 관객과 팬들의 얼굴, 아직 만나지 못한 미래의 무대, 끝내 완성하지 못한 곡들이 꿈처럼 섞였다. 그렇게 류현상은 답을 내리지 못한 채 잠들었다. 활동 1년을 앞둔 하루는 화려한 사건 없이 지나갔지만, 자신이 걸어온 길을 처음부터 다시 바라본 조용하고 긴 밤으로 남았다.'}
 ]},
 {day:400,key:'day400Fanmeet',sceneKey:'day400Fanmeet',label:'400일 특별 이벤트 · 천안 생일 기념 팬미팅',history:'🎂 400일 특별 이벤트 · 2024년 10월 3일 천안 JB아트홀에서 생일 기념 팬미팅을 열고 팬들과 퀴즈, 선물, 신곡 라이브를 함께했다.',stat:()=>{stat('fans',500);stat('fame',80);stat('stress',-8);gainSkill('vocal',2,'specialEvent')},scenes:[
   {name:'나레이션',text:'400일째의 특별한 기억은 2024년 10월 3일 목요일, 천안 JB아트홀에서 시작됐다. 규모가 아주 큰 공연장은 아니었지만 객석은 류현상을 오래 지켜본 열혈 팬들로 빼곡했다. 입구부터 생일 축하 문구와 직접 만든 작은 피켓들이 보였고, 공연장 안에는 평소 공연과는 다른 들뜬 분위기가 흘렀다. 류현상은 무대 뒤에서 객석의 소리를 듣다가 괜히 안경을 한 번 고쳐 썼다.'},
   {name:'류현상의 동생',text:'이날 MC는 류현상의 동생이 맡았다. 무대에 먼저 오른 동생은 “오늘만큼은 형이 가수라고 너무 어려워하지 마시고 마음껏 놀려 주세요”라고 말해 시작부터 객석을 웃음바다로 만들었다. 류현상이 무대에 나오자마자 동생은 준비한 질문 카드를 꺼내 들었고, 현상은 벌써부터 불길한 표정으로 “가족이 MC 보는 게 제일 위험한데…”라고 중얼거렸다.'},
   {name:'나레이션',text:'첫 코너는 팬들이 류현상에 관한 문제를 맞히는 퀴즈 게임이었다. 좋아하는 것, 무대에서 자주 하는 습관, 예전에 했던 말처럼 오래된 팬이라야 알 법한 문제들이 이어졌다. 팬들은 예상보다 훨씬 빠르게 정답을 외쳤고, 류현상은 자신도 잠시 고민한 문제를 팬이 바로 맞히자 당황했다. “그걸 어떻게 기억해요?”라는 질문에 객석에서는 “팬이니까요!”라는 대답이 동시에 터졌다.'},
   {name:'류현상',text:'정답을 맞힌 팬들에게는 소정의 선물이 돌아갔다. 류현상은 선물을 직접 건네면서도 쑥스러운 듯 짧게 “축하해요”, “이건 진짜 잘 맞혔네”라고 말했다. 평소보다 가까운 거리에서 팬들의 얼굴을 하나씩 마주하다 보니, 온라인의 숫자로만 보던 팬들이 모두 각자의 시간과 기억을 가진 사람이라는 사실이 새삼 실감났다.'},
   {name:'나레이션',text:'분위기가 충분히 달아오른 뒤에는 밴드원들이 무대에 합류했다. 오늘의 핵심은 아직 정식 발매되지 않은 신규 앨범 수록 예정곡 몇 곡을 팬들에게 먼저 들려주는 시간이었다. 조명이 조금 어두워지고 첫 기타 소리가 울리자 방금 전까지 웃고 떠들던 팬들은 놀랄 만큼 조용해졌다. 류현상은 “아직 완성 전이라 나중에 조금 달라질 수도 있어요”라고 말한 뒤 마이크 앞에 섰다.'},
   {name:'밴드원들',text:'밴드원들과 함께 들려준 신곡들은 기존 곡보다 조금 더 깊고 단단한 분위기였다. 어떤 곡에서는 관객이 후렴을 한 번 듣고 바로 박자를 맞췄고, 어떤 곡에서는 끝난 뒤 몇 초 동안 박수조차 나오지 않을 정도로 집중했다. 곡이 끝나자 객석에서 “이거 꼭 앨범에 넣어 주세요!”라는 외침이 나왔고, 류현상은 피식 웃으며 “그럼 회사랑 상의해 볼게요. 회사가 나지만.”이라고 받아쳤다.'},
   {name:'나레이션',text:'팬미팅의 마지막에는 모두가 함께 생일을 축하했다. 화려한 이벤트보다 더 오래 남은 것은, 자신의 노래를 오래 들어온 사람들이 한 공간에서 웃고 노래해 준 모습이었다. 류현상은 평소처럼 긴 감사 인사를 잘하지는 못했다. 대신 “오늘 와 줘서 고마워요. 다음에는 더 좋은 노래 들려드릴게요”라고 짧게 말했다. 팬들은 그 말이 류현상다운 진심이라는 걸 알고 큰 박수로 답했다.'},
   {name:'류현상',text:'무대가 끝나고 객석이 비워진 뒤에도 류현상은 잠시 자리를 떠나지 않았다. 의자 사이에 남은 작은 응원 문구와 무대 위에 놓인 생일 장식을 바라보다가 조용히 웃었다. “생일이 이렇게 시끄러운 날이 될 줄은 몰랐네.” 피곤했지만 이상하게 마음은 가벼웠다. 가수로 보낸 또 하나의 생일이 오래 남을 기억이 되었다.'}
 ]},
 {day:450,key:'day450ReturnSpring',sceneKey:'day450ReturnSpring',label:'450일 특별 이벤트 · 다시 돌아 봄',history:'🌸 450일 특별 이벤트 · 2026년 5월 23일 대전 팬미팅 「다시 돌아 봄」에서 팬들과 레크리에이션, 식사, 어쿠스틱 라이브를 함께했다.',stat:()=>{stat('fans',650);stat('fame',95);stat('stress',-12);gainSkill('vocal',2,'specialEvent')},scenes:[
   {name:'나레이션',text:'450일째의 기억은 2026년 5월 23일, 대전에서 열린 팬미팅 「다시 돌아 봄」이었다. 이름처럼 이번 팬미팅은 무대 위 가수와 객석의 팬이 멀리 떨어져 있는 행사가 아니라, 함께 하루를 보내며 지난 시간을 돌아보는 자리였다. 행사장에 들어선 류현상은 벽에 걸린 「다시 돌아 봄」 현수막을 한참 바라보다가 “제목은 꽤 잘 지었네”라며 혼자 만족스러운 표정을 지었다.'},
   {name:'류현상의 동생',text:'이번에도 MC는 동생이었다. 이미 한 번 경험이 있었던 만큼 진행은 더 거침없었다. 동생은 “지난번보다 더 강한 게임을 준비했습니다. 형도 예외 없습니다”라고 선언했고, 류현상은 객석을 향해 “오늘 저 사람 말 너무 믿지 마세요”라고 미리 선을 그었다. 팬들은 시작 전부터 웃으며 박수를 쳤다.'},
   {name:'나레이션',text:'레크리에이션이 시작되자 팬들의 에너지는 예상보다 훨씬 강했다. 팀을 나눠 몸을 움직이는 게임도 하고, 서로 손을 잡고 원을 만들며 협동하는 게임도 이어졌다. 평소 조용히 공연을 보던 팬들까지 승부가 걸리자 누구보다 진지해졌다. 정답 하나, 점수 하나에 환호와 아쉬움이 동시에 터졌고, 행사장은 팬미팅이라기보다 오랜만에 열린 큰 운동회처럼 변해 갔다.'},
   {name:'류현상',text:'특히 나이가 있는 팬들까지 아이처럼 뛰고 웃는 모습을 본 류현상은 신기한 듯 한참 바라봤다. “다들 공연 볼 때는 되게 얌전하시잖아요. 오늘 왜 이래요?” 그러자 한 팬이 “상품 걸렸잖아요!”라고 외쳤고, 현상은 결국 고개를 숙이며 웃었다. 나이도 직업도 잠시 잊고 모두가 같은 팀 이름을 외치는 모습이 묘하게 따뜻했다.'},
   {name:'나레이션',text:'게임이 끝난 뒤에는 함께 저녁을 먹는 시간이 이어졌다. 테이블마다 오늘 게임 이야기가 끊이지 않았고, 서로 처음 만난 팬들끼리도 어느새 오래 알던 사람처럼 대화하고 있었다. 류현상은 여러 테이블을 돌며 짧게 인사하고 사진도 찍었다. 팬들은 음악 이야기부터 일상 이야기까지 편하게 건넸고, 류현상도 평소보다 긴 대답을 하며 귀를 기울였다.'},
   {name:'나레이션',text:'해가 저물 무렵, 행사장은 다시 작은 공연장으로 바뀌었다. 화려한 밴드 세팅 대신 어쿠스틱 기타와 마이크가 놓였다. 류현상은 의자에 앉아 기타를 조율하며 “오늘 마지막은 좀 조용하게 갑시다. 아까 너무 뛰었어요”라고 말했다. 웃음이 잦아든 뒤 첫 코드가 울렸고, 팬들은 하루 종일 쌓인 에너지를 이번에는 조용한 집중으로 바꿨다.'},
   {name:'류현상',text:'어쿠스틱 라이브에서는 익숙한 노래들도 평소와 다른 호흡으로 불렀다. 관객이 자연스럽게 따라 부르는 부분에서는 마이크를 객석 쪽으로 돌렸고, 작은 떼창이 행사장 전체를 채웠다. 현상은 한 곡이 끝날 때마다 팬들을 바라보며 짧게 이야기를 덧붙였다. “이 노래 처음 만들 때는 이렇게 오래 불러 줄 사람이 있을 줄 몰랐어요.”'},
   {name:'나레이션',text:'하루를 마무리할 시간이 되자 팬들은 아쉬워하면서도 밝게 인사를 건넸다. 류현상은 오늘의 장면들을 천천히 되짚었다. 승부욕에 불타던 팬들, 손을 잡고 원을 만들며 웃던 사람들, 같이 밥을 먹으며 나눈 평범한 이야기, 마지막 어쿠스틱 떼창까지. 「다시 돌아 봄」이라는 이름처럼, 팬들과 함께 지나온 시간을 한 번 돌아보고 다시 앞으로 걸어갈 힘을 얻은 하루였다.'}
 ]},
 {day:500,key:'day500SchoolFestival',sceneKey:'day500SchoolFestival',label:'500일 특별 이벤트 · 고등학교 축제',history:'🏫 500일 특별 이벤트 · 고등학교 축제의 마지막 무대를 장식하고 학생들의 환호 속에서 자신의 학창시절과 지금의 인기를 동시에 즐겼다.',stat:()=>{stat('fans',900);stat('fame',120);gainSkill('vocal',3,'specialEvent');stat('stress',-5)},scenes:[
   {name:'나레이션',text:'500일째, 류현상은 한 고등학교 축제의 초청 공연을 위해 학교에 도착했다. 평일의 학교와 달리 복도와 운동장은 학생들이 만든 부스와 장식으로 가득했고, 스피커에서는 계속 음악이 흘러나왔다. 검은 옷과 긴 머리의 류현상이 스태프와 함께 교문을 지나자 몇몇 학생들이 눈을 크게 뜨며 서로를 툭툭 쳤다.'},
   {name:'학생들',text:'“어? 류현상 아니야?” 처음에는 작은 속삭임이었지만 금세 주변으로 퍼졌다. 이미 팬인 학생들은 휴대전화를 꺼내 들었고, 이름만 들어본 학생들도 친구를 따라 고개를 돌렸다. 류현상은 아무렇지 않은 척 지나가려 했지만 계속 자신을 알아보는 시선이 느껴지자 입꼬리가 아주 조금 올라갔다.'},
   {name:'나레이션',text:'류현상의 순서는 축제의 마지막 공연이었다. 해가 기울며 분위기가 가장 뜨거워질 무렵, 무대 조명이 켜지고 그의 이름이 소개됐다. 학생들의 함성이 체육관과 운동장을 크게 울렸다. 류현상은 오늘만큼은 자신의 취향만 고집하기보다 학생들이 한 번쯤 들어봤을 법한 익숙한 곡들을 중심으로 세트리스트를 준비했다.'},
   {name:'류현상',text:'“마지막 순서라 다들 지쳤을 줄 알았는데 생각보다 멀쩡하네요.” 첫 멘트에 학생들이 더 크게 소리를 질렀다. 그는 웃으며 곧바로 다음 곡을 시작했다. 친숙한 전주가 들리자 여기저기서 따라 부르는 목소리가 커졌고, 후렴에서는 학생들이 휴대전화 플래시를 흔들며 노래를 함께 불렀다.'},
   {name:'나레이션',text:'류현상은 평소 공연처럼 온 힘을 다해 열창했다. 학생들 사이에서는 “실제로 들으니까 더 잘한다”, “목소리 미쳤다”, “장발 진짜 잘 어울린다”는 말들이 계속 나왔다. 무대 위에서도 몇몇 말이 들릴 만큼 반응이 컸다. 마지막 곡이 끝나자 류현상은 숨을 고르며 학생들을 바라봤다. 객석 전체가 젊고 밝은 에너지로 넘쳤다.'},
   {name:'나레이션',text:'공연이 끝난 뒤 바로 차로 돌아갈 수도 있었지만, 류현상은 괜히 학교 안을 조금 더 걸어 보고 싶어졌다. 교실이 이어진 복도, 게시판에 붙은 동아리 모집지, 창문 너머 운동장을 보자 자신의 학창 시절이 자연스럽게 떠올랐다. 그때는 지금처럼 많은 사람이 자신을 알아보는 삶을 상상해 본 적이 있었을까.'},
   {name:'류현상',text:'그는 일부러 조금 천천히 복도를 걸었다. 학생들이 지나가며 “아까 공연 진짜 잘 봤어요!”, “노래 너무 잘해요!”라고 말을 걸 때마다 겉으로는 침착하게 “고마워요”라고 답했다. 하지만 속으로는 칭찬 하나하나를 아주 만족스럽게 받아들이고 있었다. 어깨가 평소보다 미세하게 올라간 것도 본인은 모르는 척했다.'},
   {name:'학생',text:'한 학생이 친구들에게 둘러싸인 채 용기를 내 말했다. “진짜 라이브가 훨씬 좋아요. 마지막 고음에서 소름 돋았어요.” 류현상은 짧게 웃고 “공부도 그 정도로 열심히 하세요”라고 답했다. 학생들이 웃음을 터뜨리자 그도 잠시 학창 시절 선배가 된 것 같은 기분이 들었다.'},
   {name:'나레이션',text:'차로 돌아가기 직전, 류현상은 다시 한 번 학교 건물을 돌아봤다. 학창 시절의 자신은 특별히 많은 주목을 받는 사람이 아니었지만, 지금은 축제의 마지막 무대를 맡고 복도를 걸을 때마다 학생들이 이름을 불러 주고 있었다. 과거와 현재가 같은 공간에 겹쳐지는 기분이었다.'},
   {name:'류현상',text:'차 문을 열기 전 류현상은 아무도 듣지 못하게 작게 웃었다. 학생들이 남긴 “노래 너무 잘한다”는 말이 계속 머릿속에 남아 있었다. 그는 긴 머리를 한 번 쓸어 넘기고 아주 만족스러운 표정으로 중얼거렸다. “훗.” 오늘만큼은 자신의 인기를 조금 누려도 괜찮을 것 같았다.'}
 ]}
];
function runFixedDaySpecialEvent(def){
 beginSpecialScene(def.sceneKey);
 const before=snapshotStats();
 let page=0;
 const area=$('#choiceArea');
 const draw=()=>{
   const scene=def.scenes[page];
   state.dialogue={name:scene.name,text:scene.text};
   render();
   area.innerHTML='';
   const prev=document.createElement('button'); prev.textContent='이전 장면'; prev.disabled=page===0;
   const next=document.createElement('button'); next.textContent=page===def.scenes.length-1?'특별 스토리 마치기':'다음 장면';
   area.append(prev,next); area.classList.remove('hidden');
   prev.onclick=()=>{if(page>0){page--;draw()}};
   next.onclick=()=>{
     if(page<def.scenes.length-1){page++;draw();return;}
     def.stat&&def.stat();
     state.specialEvents[def.key]=true;
     endSpecialScene();
     addHistory(def.history,`special:${def.key}`);
     playSfx('success');
     const changes=describeStatChanges(before);
     state.dialogue={name:'나레이션',text:`${def.label}이(가) 끝났다. ${changes?changes.replace('능력치 변화 · ','이번 일로 '):'오늘의 기억은 조용히 스토리 기록에 남았다.'}`};
     save(false); render();
     if(changes)appendStatChangesToDialogue(changes);
   };
 };
 playSfx('event');
 draw();
}
function maybeFixedDaySpecialEvent(){
 for(const def of fixedDaySpecialEvents){
   if(state.day>=def.day && !state.specialEvents?.[def.key]){ runFixedDaySpecialEvent(def); return true; }
 }
 return false;
}
function finalizeBuskingResult(ctx,rhythmResult=null){
 let {band,type,weather,hpCost,success,quality,fans,money,vocalMultiplier,fameMultiplier,fameLv,gearMultiplier=1,resultBefore}=ctx;
 let rhythmLine='';
 if(rhythmResult?.success){const fanBonus=Math.max(2,Math.floor(fans*.35));const moneyBonus=Math.max(3000,Math.floor(money*.35));fans+=fanBonus;money+=moneyBonus;stat('fame',3);if(band)state.band.bond=clamp(state.band.bond+3);rhythmLine=`\n\n리듬 챌린지 성공! 팬 +${fanBonus}명, 수입 +${moneyBonus.toLocaleString()}원, 인지도 +3${band?' · 밴드 결속력 +3':''}`}
 else if(rhythmResult?.played)rhythmLine='\n\n리듬 챌린지는 아쉽게 실패했지만 기본 공연 보상은 유지됐다.';
 else if(rhythmResult?.closed)rhythmLine='\n\n리듬 챌린지를 닫아 기본 공연 결과만 적용했다.';
 const vocalGain=success?gainSkill('vocal',1,'majorStage'):0;
 stat('fans',fans);stat('fame',success?Math.max(1,Math.floor(quality/8)):1);stat('money',money);
 let leaveNote='';
 if(band){state.band.bond=clamp(state.band.bond+(success?6:2));state.soloStreak=0}else{state.soloStreak++;if(state.band.formed){state.band.bond=clamp(state.band.bond-(state.soloStreak>=3?12:8));if(state.band.bond<=20&&Math.random()<.35)leaveNote=memberLeave()}}
 const durabilityNotice=consumeBuskingEquipment();const broken=equipmentBreakCheck();const result=success?'성공':'실패';
 state.performanceCount++;state.career.totalBusking++;if(band)state.career.bandBusking++;else state.career.soloBusking++;state.storeDaily.buskingCount++;if(state.storeDaily.buskingCount===2)stat('stress',4);if(state.preparation?.buskingInsight)state.preparation.buskingInsight=false;
 const foundEnergizer=Math.random()<.01;if(foundEnergizer){state.items.energizer=(state.items.energizer||0)+1;addHistory(`⚡ ${band?'밴드 ':''}버스킹 중 에너자이저 획득 · 아이템 보관함에 1개 추가`,`busking-energizer:${state.day}:${Date.now()}`)}
 const fanLine=pickFanComment();const story=pickActionDialogue(band?'bandBusking':'busking');
 showDialogue('팬들',`${type} · ${weather.label} 버스킹 ${result}. 체력 ${hpCost} 소모, 팬 ${fans}명, ${money.toLocaleString()}원을 얻었다. 보컬 수입 배율 ${vocalMultiplier.toFixed(2)}배 · 인지도 Lv.${fameLv} 수입 배율 ${fameMultiplier.toFixed(2)}배 · 장비 수입 배율 ${gearMultiplier.toFixed(2)}배.${vocalGain?` 성공 경험으로 보컬 +${vocalGain}.`:''}${broken}${durabilityNotice}${rhythmLine}${foundEnergizer?'\n\n공연을 정리하던 중 에너자이저 1개를 발견해 아이템 보관함에 넣었다.':''}\n\n팬 반응: “${fanLine}”${leaveNote?`\n\n${leaveNote}`:''}\n\n${story}`);
 const continueBusking=()=>{if(checkStalkerEvent()){if(rhythmResult&&resultBefore)setTimeout(()=>appendStatChangesToDialogue(describeActionResult(resultBefore)),260);return}advance(1);if(rhythmResult&&resultBefore)setTimeout(()=>appendStatChangesToDialogue(describeActionResult(resultBefore)),260)};
 if(foundEnergizer){save(false);render();showBlockingNotice('에너자이저 획득',`<div class="info-card"><b>버스킹 중 에너자이저를 얻었습니다.</b><p>에너자이저 1개가 아이템 보관함에 추가되었습니다.</p></div>`,continueBusking);return}
 continueBusking()
}
function startBuskingRhythmGame(ctx){
 beginMiniGameUi();let finished=false,countdownCancel=null,step=0,hits=0,misses=0,timer=null,noteTimer=null;const keys=['←','↓','↑','→'];const sequence=Array.from({length:12},()=>Math.floor(Math.random()*4));
 showModal(ctx.band?'밴드 버스킹 · 리듬 챌린지':'버스킹 · 리듬 챌린지',`<div class="busking-rhythm-head"><div><b>화면에 나타나는 방향을 같은 버튼으로 눌러 주세요.</b><small>3초 뒤 시작 · 12개 중 9개 이상 성공하면 추가 보상을 받습니다. 닫아도 기본 공연 보상은 유지됩니다.</small></div><strong id="buskingRhythmScore">대기</strong></div><div class="busking-rhythm-stage"><div id="buskingRhythmNote" class="busking-rhythm-note">♪</div><div id="buskingRhythmMessage">카운트다운 후 시작합니다.</div></div><div class="busking-rhythm-buttons">${keys.map((k,i)=>`<button data-rhythm-key="${i}" disabled>${k}</button>`).join('')}</div>`);
 const clean=()=>{clearInterval(timer);clearTimeout(noteTimer);if(countdownCancel)countdownCancel()};
 const finish=(success,closed=false)=>{if(finished)return;finished=true;clean();endMiniGameUi();activeTrainingAbort=null;closeModal(true);finalizeBuskingResult(ctx,{success,played:!closed,closed})};
 activeTrainingAbort=()=>finish(false,true);
 const score=()=>{const el=$('#buskingRhythmScore');if(el)el.textContent=`성공 ${hits} · 놓침 ${misses}`};
 const showNext=()=>{if(finished)return;if(step>=sequence.length){finish(hits>=9,false);return}const note=$('#buskingRhythmNote');if(note){note.textContent=keys[sequence[step]];note.classList.remove('pop');void note.offsetWidth;note.classList.add('pop')}noteTimer=setTimeout(()=>{if(finished)return;misses++;step++;score();showNext()},850)};
 const bind=()=>{$$('[data-rhythm-key]').forEach(b=>{b.disabled=false;b.onclick=()=>{if(finished||step>=sequence.length)return;clearTimeout(noteTimer);if(+b.dataset.rhythmKey===sequence[step]){hits++;b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),140)}else{misses++;b.classList.add('miss');setTimeout(()=>b.classList.remove('miss'),140)}step++;score();showNext()}});$('#buskingRhythmMessage').textContent='박자에 맞춰 입력하세요!';score();showNext()};
 countdownCancel=runTrainingCountdown(bind)
}
function busking(band){
 if(!state.equipment.mic||!state.equipment.amp)return toast('마이크와 음향장비를 먼저 구입해야 합니다.');
 if(band&&!state.band.formed)return toast('밴드가 결성되지 않았습니다.');
 if(state.storeDaily.buskingDay!==state.day){state.storeDaily.buskingDay=state.day;state.storeDaily.buskingCount=0}
 if(state.storeDaily.buskingCount>=2)return toast('목 보호를 위해 버스킹은 하루에 두 번까지만 할 수 있습니다.');
 const resultBefore=snapshotActionResult();
 const type=dayType(),weather=weatherInfo[state.weather];const baseHp=band?24:18;let hpCost=baseHp+weather.hp+(type==='공휴일'?3:type==='주말'?1:0);
 if(maybeStartIziViralEvent(band,effectiveHpCost(hpCost)))return;if(maybeStartWaitedMoreViralEvent(band,effectiveHpCost(hpCost)))return;if(!costHp(hpCost))return;hpCost=state.lastHpCost||effectiveHpCost(hpCost);
 const dayBonus=type==='공휴일'?.18:type==='주말'?.12:0;const stressPenalty=Math.max(0,(state.stats.stress-50)/250);const insightBonus=state.preparation?.buskingInsight?.08:0;const successChance=Math.max(.12,Math.min(.95,.48+dayBonus+weather.success+state.stats.vocal/250+state.stats.looks/500+(band?state.band.bond/600:0)+insightBonus-stressPenalty));
 const success=Math.random()<successChance;const quality=safe(state.stats.vocal*.65+state.stats.looks*.2+Math.random()*28)*(success?1:.28);const insightMultiplier=state.preparation?.buskingInsight?1.1:1;const repeatMultiplier=state.storeDaily.buskingCount===0?1:.7;const fans=Math.max(1,Math.floor(quality*(band?3.3:1.8)*(type==='공휴일'?1.5:type==='주말'?1.25:1)*insightMultiplier*repeatMultiplier));const vocalMultiplier=.55+state.stats.vocal*.0095;const fameLv=fameLevel();const fameMultiplier=.65+fameLv*.0135;const gearMultiplier=buskingGearIncomeMultiplier();const baseIncome=(band?18000:8000)+quality*(band?1100:600);const money=Math.max(0,Math.floor(baseIncome*vocalMultiplier*fameMultiplier*gearMultiplier*(success?1:.35)*repeatMultiplier));
 const ctx={band,type,weather,hpCost,success,quality,fans,money,vocalMultiplier,fameMultiplier,fameLv,gearMultiplier,resultBefore};if(Math.random()<.175){startBuskingRhythmGame(ctx);return}finalizeBuskingResult(ctx)
}
function safe(n){return Math.max(1,n)}
function recruit(){
 const names={guitar:'기타 B군',bass:'베이스 L군',piano:'피아노 J군',drums:'드럼 R군'};
 const requirements={
  guitar:{cost:120000,label:'인지도 Lv.5 · 보컬 28',ok:()=>fameLevel()>=5&&state.stats.vocal>=28},
  bass:{cost:180000,label:'인지도 Lv.10 · 버스킹 3회',ok:()=>fameLevel()>=10&&state.career.totalBusking>=3},
  piano:{cost:250000,label:'인지도 Lv.15 · 작곡 35',ok:()=>fameLevel()>=15&&state.stats.compose>=35},
  drums:{cost:320000,label:'인지도 Lv.20 · 공연 경험 2회',ok:()=>fameLevel()>=20&&state.performanceCount>=2}
 };
 const missing=Object.keys(state.band.members).filter(k=>!state.band.members[k]);
 if(!missing.length)return toast('모든 멤버가 모였습니다.');
 const remain=Math.max(0,5-(state.day-(state.cooldowns.recruit??-99)));
 showModal('밴드 멤버 오디션',`<p>멤버는 자동으로 합류하지 않습니다. 파트별 조건을 달성하고 오디션 대관비를 지불해야 하며, 영입 후 5일 동안 새 오디션을 열 수 없습니다.</p>${remain>0?`<p><b>다음 모집까지 ${remain}일</b></p>`:''}<div class="card-list">${missing.map(k=>{const r=requirements[k],eligible=r.ok()&&remain===0&&state.stats.money>=r.cost;return `<div class="info-card"><header><b>${names[k]}</b><span>${r.cost.toLocaleString()}원</span></header><p>${r.label}</p><button data-recruit-member="${k}" ${eligible?'':'disabled'}>${remain>0?'모집 대기':!r.ok()?'조건 부족':state.stats.money<r.cost?'비용 부족':'오디션 진행'}</button></div>`}).join('')}</div>`);
 $$('[data-recruit-member]').forEach(btn=>btn.onclick=()=>{
  const k=btn.dataset.recruitMember,r=requirements[k];
  if(state.day-(state.cooldowns.recruit??-99)<5)return toast('새 멤버 오디션은 5일마다 열 수 있습니다.');
  if(!r.ok())return toast(`${names[k]} 영입 조건이 부족합니다: ${r.label}`);
  if(state.stats.money<r.cost)return toast('오디션 대관비가 부족합니다.');
  if(!costHp(10))return;
  stat('money',-r.cost);state.cooldowns.recruit=state.day;state.band.members[k]=names[k];
  const joined=Object.values(state.band.members).filter(Boolean).length;state.band.bond=Math.max(35,45+joined*5);state.band.formed=joined===4;
  addHistory(`🎸 멤버 오디션 합격 · ${names[k]} 합류`,`member:${k}`);
  if(state.band.formed){state.soloStreak=0;state.milestones.bandFormed=true;addHistory('🎶 밴드 결성 · 모든 파트의 오디션을 마치고 완전체가 되었다.','band:formed')}
  closeModal();showDialogue(names[k],state.band.formed?'네 파트의 오디션이 모두 끝났다. 이제 완전체 밴드로 합주와 공연을 진행할 수 있다.':`${names[k]}이(가) 오디션을 통과했다. 아직 공석이 남아 있어 완전체 활동은 할 수 없다.`);advance(1)
 });
}
function managerEvent(){
 const lv=fameLevel();
 if(!state.manager.hired){
  if(lv<20)return toast(`인지도 Lv.20부터 후라보노를 고용할 수 있습니다. 현재 Lv.${lv}`);
  showDialogue('후라보노','형, 이제 혼자서 일정까지 감당하기에는 연락이 너무 많이 와요. 노래와 연습은 형이 맡고, 계약·공연 문의·정산은 제가 맡겠습니다. 대신 제 말도 아주 가끔은 들어주세요.',[['후라보노를 고용한다',()=>{if(state.stats.money<200000)return '초기 고용비 20만원이 부족했다. 후라보노는 한숨을 쉬더니, 돈이 모이면 다시 이야기하자며 명함을 책상 위에 두고 갔다.';state.manager.hired=true;state.manager.bond=20;state.milestones.managerHired=true;state.cooldowns.managerTalk=state.day;stat('money',-200000);addHistory('📋 매니저 고용 · 후라보노가 류현상의 일정을 맡기 시작했다.','manager:hired');save(false);return '후라보노는 구겨진 일정표를 새 파일에 옮겨 적었다. “좋아요, 형. 이제 노래만 망치지 마세요. 나머지는 제가 어떻게든 해볼게요.” 그렇게 류현상의 첫 매니저가 생겼다.'}],['조금 더 혼자 해본다',()=>{state.manager.bond=Math.max(0,state.manager.bond-2);return '후라보노는 억지로 붙잡지 않았다. 다만 나가기 전 말했다. “혼자 하는 것과 혼자 견디는 건 달라요. 정말 필요해지면 연락하세요.”'}]])
 }else{
  if(state.cooldowns.managerTalk===state.day)return toast('오늘은 이미 후라보노와 충분히 이야기했습니다.');
  state.cooldowns.managerTalk=state.day;
  state.manager.bond=clamp(state.manager.bond+3);
  const talks=[
   '형, 이번 주 일정 다시 정리했습니다. 인터뷰 두 건은 거절했고, 공연 하나는 출연료를 올렸어요. 그런데 형은 오늘도 점심을 안 먹었죠?',
   '계약서에 ‘홍보 목적 무기한 사용’이라는 문장이 숨어 있었어요. 제가 지웠습니다. 형은 서명하기 전에 제발 제목 말고 본문도 읽으세요.',
   '목 상태가 안 좋아 보여요. 오늘 고음 연습은 금지입니다. 형이 몰래 연습하면 연습실 전원을 제가 내릴 겁니다.',
   '댓글은 제가 먼저 확인할게요. 칭찬은 형에게 보내고, 악성 댓글은 제가 읽고 화낸 다음 삭제하겠습니다. 역할 분담이죠.',
   '공연장 측에서 머리를 조금 자르면 어떻겠냐고 물었어요. 제가 거절했습니다. 형의 머리카락도 이제 계약 조건에 포함해야 할 것 같아요.',
   '정산이 들어왔습니다. 생각보다 많지는 않지만, 예전처럼 돈이 어디로 사라졌는지 모르는 일은 없게 할게요.',
   '형, 팬들이 무표정 셀카를 좋아하긴 하는데 전부 같은 사진처럼 보여요. 오늘은 고개를 3도만 오른쪽으로 돌려 봅시다.',
   '다음 무대 동선을 표시해 뒀어요. 지난번처럼 암전 중에 드럼 쪽으로 들어가면 R군이 또 심장 멎는 줄 알았다고 할 겁니다.',
   '형이 기획사를 하던 시절에는 모든 걸 혼자 책임졌겠지만, 지금은 제가 있어요. 힘든 일까지 혼자 가져가지 마세요.',
   '방송 작가가 재미있는 개인기를 준비해 달래요. 제가 “노래를 잘합니다”라고 답했더니 그건 개인기가 아니래요. 세상이 이상합니다.',
   '오늘 일정은 비워 뒀습니다. 아무것도 하지 않는 것도 일정이에요. 단, 몰래 작곡하다 걸리면 휴식으로 인정하지 않겠습니다.',
   '처음에는 형이 또 금방 포기할까 봐 지켜봤어요. 그런데 이제는 제가 먼저 지치지 않게 조심해야겠네요. 생각보다 오래 가고 있잖아요, 우리.'
  ];
  if(fameLevel()>30)talks.push(
   '형, 요즘 인터뷰에서 “제가 나가면 분위기가 달라지죠” 같은 말이 자꾸 나오던데요. 자신감은 좋지만 꺼드럭은 편집으로도 못 살립니다.',
   '인지도 레벨이 올랐다고 예의 레벨까지 자동으로 오르는 건 아니에요. 그건 따로 연습해야 합니다. 오늘부터 제가 옆에서 잡을게요.',
   '형이 잘된 건 맞아요. 그런데 스태프가 형보다 먼저 와서 형보다 늦게 갑니다. 대우를 요구하기 전에 고맙다는 말부터 해 주세요.',
   '팬들이 형을 좋아한다고 형의 모든 말을 좋아하는 건 아닙니다. 까칠함은 매력일 수 있지만 무례함은 그냥 무례함이에요.'
  );
  if(!state.manager.wedding&&state.day>90&&state.manager.bond>=50){weddingEvent();return}
  showDialogue('후라보노',pick(talks));state.skipNextStory=true;advance(1);
 }
}
function weddingEvent(){state.manager.wedding=true;addHistory('💍 후라보노 결혼 소식 · 축가 부탁을 받았다.','manager:wedding');showDialogue('후라보노','형, 저… 다음 달에 결혼합니다.',[['축가를 불러준다',()=>{state.manager.bond=clamp(state.manager.bond+25);if(state.band.formed)state.band.bond=clamp(state.band.bond+15);toast('후라보노 결혼 이벤트 완료');return '형이 축가를 불러준다면 정말 든든할 것 같아요. 고맙습니다.'}],['일정 때문에 어렵다',()=>{state.manager.bond=clamp(state.manager.bond-20);toast('후라보노가 서운해합니다.');return '괜찮아요, 형. 바쁜 거 아니까… 정말 괜찮습니다.'}]])}
function audition(){
 if(fameLevel()<10||state.stats.vocal<50)return toast('인지도 Lv.10, 보컬 50 이상이 필요합니다.');
 if(!cooldownReady('audition',7,'다음 오디션'))return;if(!costHp(20))return;markCooldown('audition');
 const rehearsalBonus=state.preparation?.stageReady?12:0;const chance=clamp(state.stats.vocal+state.stats.looks*.3-state.stats.stress*.25+rehearsalBonus,15,95);const ok=Math.random()*100<chance;if(state.preparation?.stageReady)state.preparation.stageReady=false;
 if(ok){const first=!state.milestones.firstAudition;const fanGain=first?150:45+Math.floor(Math.random()*36);stat('fame',first?45:18);stat('fans',fanGain);if(first){state.milestones.firstAudition=true;addHistory('🎤 첫 오디션 합격 · 다음 무대 진출권을 얻었다.','milestone:audition')}showDialogue('심사위원',first?`당신의 목소리에는 이야기가 있군요. 다음 무대로 올라오세요. 팬 ${fanGain}명이 관심을 보였습니다.`:`재도전 무대가 안정적이었습니다. 팬 ${fanGain}명이 새로 관심을 보였습니다.`)}else{stat('stress',5);showDialogue('심사위원','긴장 때문에 기본기가 흔들렸습니다. 일주일 뒤 다시 준비해 오세요.')}
 advance(1)
}
function finalizeConcertResult(ctx,dodgeResult=null){
 let {earn,newFans,concertFame,resultBefore}=ctx;
 let bonusText='';
 if(dodgeResult?.success){
  const rehearsalActive=!!state.preparation?.stageReady;
  const fanBonus=Math.max(180,Math.floor(newFans*.28));
  const requestedMoneyBonus=Math.max(150000,Math.floor(earn*.18));
  const concertIncomeCap=rehearsalActive?4300000:3900000;
  const moneyBonus=Math.max(0,Math.min(requestedMoneyBonus,concertIncomeCap-earn));
  const fameBonus=12;
  newFans+=fanBonus;earn+=moneyBonus;stat('fame',fameBonus);
  if(state.band.formed)state.band.bond=clamp(state.band.bond+4);
  bonusText=`\n\n음표 피하기 미니게임 성공! 인지도 +${fameBonus}, 팬 +${fanBonus.toLocaleString()}명, ${moneyBonus>0?`추가 수익 ${moneyBonus.toLocaleString()}원`:`공연비 상한 ${concertIncomeCap.toLocaleString()}원 유지`}${rehearsalActive?' · 리허설 연계 보너스 적용':''}${state.band.formed?' · 밴드 결속력 +4':''}`;
 }else if(dodgeResult?.played){
  bonusText='\n\n음표 피하기 미니게임은 실패했지만 기본 공연 보상은 그대로 받았다.';
 }else if(dodgeResult?.closed){
  bonusText='\n\n음표 피하기 미니게임을 닫아 기본 공연 결과만 적용했다.';
 }
 const vocalGain=gainSkill('vocal',1,'majorStage');
 stat('money',earn);stat('fame',concertFame);stat('fans',newFans);stat('stress',4);
 if(state.preparation?.stageReady)state.preparation.stageReady=false;
 if(state.band.formed)state.band.bond=clamp(state.band.bond+8);
 state.performanceCount++;
 if(!state.milestones.firstConcert){
  state.milestones.firstConcert=true;
  addHistory(`🎪 첫 단독 공연 · 수익 ${earn.toLocaleString()}원, 새 팬 ${newFans.toLocaleString()}명`,'milestone:concert');
 }
 showDialogue(state.manager.hired?'후라보노':'팬들',`${state.manager.hired?`공연 수익 ${earn.toLocaleString()}원이 정산됐어요. `:''}인지도 +${concertFame}, 새 팬 ${newFans.toLocaleString()}명이 생겼습니다.${vocalGain?` 공연 경험으로 보컬 +${vocalGain}.`:''}${bonusText}\n\n팬 반응: “${pickFanComment(true)}”`);
 if(checkStalkerEvent()){if(resultBefore)setTimeout(()=>appendStatChangesToDialogue(describeActionResult(resultBefore)),260);return}
 advance(1);if(resultBefore)setTimeout(()=>appendStatChangesToDialogue(describeActionResult(resultBefore)),260)
}
function startConcertDodgeGame(ctx){
 beginMiniGameUi();let finished=false,countdownCancel=null,moveTimer=null,spawnTimer=null,secondTimer=null;let remaining=14,lives=3,playerX=.5,spawnCount=0;const notes=[];const symbols=['♪','♫','♬','♩','𝄞'];
 showModal('공연 · 음표 피하기 미니게임',`<div class="concert-dodge-head"><div><b>류현상을 좌우로 움직여 떨어지는 음표를 피하세요.</b><small>3초 뒤 시작 · 14초 동안 버티면 공연 보너스를 획득합니다. 마우스 또는 손가락으로 화면을 좌우로 움직일 수 있습니다. 닫아도 기본 공연 보상은 유지됩니다.</small></div><div class="concert-dodge-score"><span id="concertDodgeLives">기회 3</span><strong id="concertDodgeTimer">대기</strong></div></div><div id="concertDodgeArena" class="concert-dodge-arena"><div class="concert-dodge-grid"></div><img id="concertDodgePlayer" class="concert-dodge-player" src="assets/images/ryu-dot.png" alt="류현상 도트 캐릭터" draggable="false"/><p id="concertDodgeGuide">카운트다운 후 시작합니다.</p></div>`);
 const arena=$('#concertDodgeArena'),player=$('#concertDodgePlayer'),guide=$('#concertDodgeGuide'),timerEl=$('#concertDodgeTimer'),livesEl=$('#concertDodgeLives');
 const setPlayer=()=>{if(player)player.style.left=`${playerX*100}%`};setPlayer();
 const updateHud=()=>{if(timerEl)timerEl.textContent=`${remaining}초`;if(livesEl)livesEl.textContent=`기회 ${lives}`};
 const clearAll=()=>{clearInterval(moveTimer);clearInterval(spawnTimer);clearInterval(secondTimer);if(countdownCancel)countdownCancel()};
 const removeNote=n=>{if(n.el&&n.el.parentNode)n.el.remove();const idx=notes.indexOf(n);if(idx>=0)notes.splice(idx,1)};
 const finish=(success,reason='fail',closed=false)=>{if(finished)return;finished=true;clearAll();notes.splice(0).forEach(n=>n.el?.remove());endMiniGameUi();activeTrainingAbort=null;closeModal(true);finalizeConcertResult(ctx,{success,played:!closed,closed})};
 activeTrainingAbort=()=>finish(false,'closed',true);
 const movePlayerByEvent=e=>{if(!arena)return;const rect=arena.getBoundingClientRect();const ratio=(e.clientX-rect.left)/rect.width;playerX=Math.max(.08,Math.min(.92,ratio));setPlayer()};
 if(arena){arena.addEventListener('pointerdown',e=>{movePlayerByEvent(e)});arena.addEventListener('pointermove',e=>movePlayerByEvent(e));arena.addEventListener('click',e=>movePlayerByEvent(e))}
 const spawn=()=>{if(!arena||finished)return;const note=document.createElement('div');note.className='concert-falling-note';note.textContent=symbols[Math.floor(Math.random()*symbols.length)];const noteObj={el:note,x:8+Math.random()*84,y:-10,speed:2.4+Math.random()*1.9,size:40+Math.random()*18};note.style.left=`${noteObj.x}%`;note.style.fontSize=`${noteObj.size}px`;arena.appendChild(note);notes.push(noteObj);spawnCount++};
 const hitPlayer=()=>{lives--;updateHud();if(player){player.classList.add('hit');setTimeout(()=>player.classList.remove('hit'),180)}playSfx('alert');if(lives<=0)finish(false,'hit',false)};
 const gameLoop=()=>{for(const note of [...notes]){note.y+=note.speed;note.el.style.top=`${note.y}%`;const dx=Math.abs(note.x-playerX*100);if(note.y>74&&note.y<90&&dx<7.2){removeNote(note);hitPlayer();if(finished)return;continue}if(note.y>108)removeNote(note)}};
 const start=()=>{updateHud();if(guide)guide.textContent='음표를 피하세요!';spawn();moveTimer=setInterval(gameLoop,40);spawnTimer=setInterval(()=>{spawn();if(spawnCount%5===0)spawn()},650);secondTimer=setInterval(()=>{remaining--;updateHud();if(remaining<=0)finish(true,'success',false)},1000)};
 countdownCancel=runTrainingCountdown(start)
}
function concert(){
 if(!concertRequirementMet())return toast(concertRequirementText());
 if(!cooldownReady('concert',7,'다음 공연'))return;const resultBefore=snapshotActionResult();if(!costHp(28))return;markCooldown('concert');state.career.totalConcerts++;
 const stageBoost=state.preparation?.stageReady?1.15:1;const baseEarn=300000+Math.floor(Math.min(state.stats.fans,30000)*120);const earn=Math.min(3900000,Math.floor(baseEarn*stageBoost));const newFans=Math.max(180,Math.floor(Math.sqrt(state.stats.fans)*8*stageBoost));
 const lv=fameLevel();const concertFame=lv>=90?90:lv>=80?80:lv>=70?70:60;const ctx={earn,newFans,concertFame,resultBefore};
 startConcertDodgeGame(ctx)
}
function broadcast(){
 if(!state.manager.hired||state.stats.vocal<85)return toast('방송 출연은 후라보노 고용과 보컬 85 이상이 필요합니다.');
 if(!cooldownReady('broadcast',7,'다음 방송 출연'))return;if(!costHp(22))return;markCooldown('broadcast');state.career.totalBroadcasts++;
 const stageBoost=state.preparation?.stageReady?1.15:1;const lv=fameLevel();const baseBroadcastFame=lv>=90?120:lv>=80?110:lv>=70?100:90;const broadcastFans=Math.floor(Math.min(600,250+Math.sqrt(Math.max(0,state.stats.fans))*2)*stageBoost);const broadcastFame=Math.floor(baseBroadcastFame*stageBoost);stat('fame',broadcastFame);stat('fans',broadcastFans);stat('stress',6);if(state.preparation?.stageReady)state.preparation.stageReady=false;state.manager.bond=clamp(state.manager.bond+5);
 if(!state.milestones.firstBroadcast){state.milestones.firstBroadcast=true;addHistory('📺 첫 방송 출연 · 실시간 검색에 류현상의 이름이 올랐다.','milestone:broadcast')}
 showDialogue('후라보노',`방송 반응이 좋아요. 인지도 +${broadcastFame}, 팬 ${broadcastFans.toLocaleString()}명이 늘었습니다. 다만 다음 출연은 일주일 뒤에 잡겠습니다.`);advance(1)
}
function fanmeeting(){
 if(state.stats.fans<15000)return toast('팬미팅은 팬 15,000명 이상이 필요합니다.');
 if(!state.manager.hired)return toast('팬미팅 진행을 맡을 후라보노를 먼저 고용해야 합니다.');
 if(state.stats.money<300000)return toast('팬미팅 대관·운영비 300,000원이 필요합니다.');
 if(!cooldownReady('fanmeeting',20,'다음 팬미팅'))return;
 if(!costHp(20))return;
 stat('money',-300000);markCooldown('fanmeeting');
 const first=!state.milestones.firstFanmeeting;
 const fanGain=first?450:220+Math.floor(Math.random()*131);
 stat('fans',fanGain);stat('stress',-8);
 if(first){state.milestones.firstFanmeeting=true;addHistory('💌 첫 팬미팅 · 팬들과 직접 이야기를 나눴다.','milestone:fanmeeting')}
 showDialogue('팬들',`현상 씨, 다음 노래도 오래 기다릴게요! 팬 ${fanGain.toLocaleString()}명이 새로 합류했고 스트레스가 줄었다.`);advance(1)
}
function national(){const missing=worldStarMissingRequirements();if(missing.length)return toast(`월드스타 조건 부족: ${missing.join(' · ')}`);offerEnding('월드스타 엔딩','월드스타의 모든 조건을 달성했다. 세계 투어를 시작할 준비가 끝났다.',true,`manual:worldstar:${state.day}`)}
function openGear(){
 if(debtBlocked('장비·악기 구매'))return;
 const micOptions=Object.entries(equipmentCatalog.mic).map(([key,v])=>[v.name,v.price,key,v.durability,v.income]);
 const ampOptions=Object.entries(equipmentCatalog.amp).map(([key,v])=>[v.name,v.price,key,v.durability,v.income]);
 const instruments=[['어쿠스틱 기타',850000,'acousticGuitar','장착 시 작곡 +1 · 버스킹 감성 보정'],['미디 키보드',1400000,'keyboard','장착 시 작곡 +2'],['오디오 인터페이스',2200000,'audioInterface','장착 시 보컬·작곡 +1 · 앨범 완성도'],['스튜디오 콘덴서 마이크',2800000,'studioMic','장착 시 보컬 +2'],['모니터링 헤드폰',950000,'monitorHeadphones','장착 시 보컬 +1 · 훈련 보조']];
 const equipped=new Set(state.equippedInstruments||[]);
 const equipmentCards=(type,items)=>items.map(([n,p,k,d,income])=>{const current=state.equipment[type]&&state.equipmentModel?.[type]===k;return `<div class="info-card"><header><b>${n}</b><span>${current?`내구도 ${equipmentDurabilityText(type)}`:p.toLocaleString()+'원'}</span></header><p>내구도 ${d}회 · ${type==='mic'?'버스킹 마이크':'버스킹 음향 출력 장비'} · 수입 배율 ${Number(income||1).toFixed(2)}배</p><button data-buygear-type="${type}" data-buygear-model="${k}" ${current?'disabled':''}>${current?'사용 중':state.equipment[type]?'구매·교체':'구입'}</button></div>`}).join('');
 const caseCard=`<div class="info-card"><header><b>방수·전원 보호케이스</b><span>${state.equipment.battery?`보호 횟수 ${equipmentDurabilityText('battery')}`:'500,000원'}</span></header><p>50회 소모품 · 보유 중에는 매 버스킹마다 케이스 횟수 1을 사용하고 마이크·음향장비 내구도 소모를 0으로 만든다. 미보유 시 10% 확률로 내구도가 2배 소모된다.</p><button data-buycase ${state.equipment.battery?'disabled':''}>${state.equipment.battery?'사용 중':'구입'}</button></div>`;
 showModal('장비·악기 세팅',`<div class="gear-balance"><span>현재 보유금</span><strong>${state.stats.money.toLocaleString()}원</strong><small>장비를 구매하면 보유금이 즉시 갱신됩니다.</small></div><h3>마이크</h3><div class="card-list">${equipmentCards('mic',micOptions)}</div><h3>앰프·음향장비</h3><div class="card-list">${equipmentCards('amp',ampOptions)}</div><h3>보호 장비</h3><div class="card-list">${caseCard}</div><h3>악기 컬렉션 · 최대 3개 장착</h3><p>보유 효과가 아니라 장착한 악기만 훈련과 앨범에 적용됩니다. 현재 ${equipped.size}/3개 장착.</p><div class="card-list">${instruments.map(([n,p,k,d])=>{const owned=state.instruments[k],on=equipped.has(k);return `<div class="info-card ${on?'equipped-instrument':''}"><header><b>${n}</b><span>${owned?(on?'장착 중':'보유 중'):p.toLocaleString()+'원'}</span></header><p>${d}</p><button ${owned?`data-equipinstrument="${k}"`:`data-buyinstrument="${k}"`}>${owned?(on?'장착 해제':'장착'):'구입'}</button></div>`}).join('')}</div>`);
 $$('[data-buygear-model]').forEach(b=>b.onclick=()=>{const type=b.dataset.buygearType,model=b.dataset.buygearModel,item=equipmentCatalog[type]?.[model];if(!item)return;if(state.stats.money<item.price)return toast('돈이 부족합니다.');stat('money',-item.price);state.equipment[type]=true;state.equipmentModel[type]=model;state.equipmentDurability[type]=item.durability;state.equipmentDamage[type]=false;addHistory(`🎙 장비 구매 · ${item.name} 구입`,`gear:${type}:${model}:${state.day}`);playSfx('coin');save(false);openGear();render()});
 const caseBtn=$('[data-buycase]');if(caseBtn)caseBtn.onclick=()=>{if(state.stats.money<500000)return toast('돈이 부족합니다.');stat('money',-500000);state.equipment.battery=true;state.equipmentDurability.battery=50;addHistory('🧰 장비 구매 · 방수·전원 보호케이스 50회','gear:battery:'+state.day);playSfx('coin');save(false);openGear();render()};
 $$('[data-buyinstrument]').forEach(b=>b.onclick=()=>{const it=instruments.find(x=>x[2]===b.dataset.buyinstrument);if(state.stats.money<it[1])return toast('돈이 부족합니다.');stat('money',-it[1]);state.instruments[it[2]]=true;addHistory(`🎹 악기 수집 · ${it[0]} 구입`,`instrument:${it[2]}`);playSfx('coin');save(false);openGear();render()});
 $$('[data-equipinstrument]').forEach(b=>b.onclick=()=>{const k=b.dataset.equipinstrument;const list=[...(state.equippedInstruments||[])];const i=list.indexOf(k);if(i>=0)list.splice(i,1);else{if(list.length>=3)return toast('악기는 최대 3개까지만 장착할 수 있습니다.');list.push(k)}state.equippedInstruments=list;save(false);openGear();render()})
}
function openWardrobe(){
 if(debtBlocked('의상 구매와 스타일 관리'))return;
 const outfits=[['검은 셔츠',0,0],['흰 셔츠',180000,2],['체크 셔츠',240000,3],['가죽 재킷',480000,5],['후드티',320000,4],['무대 의상',1200000,8],['???',0,0],['군복',0,0],['수건',0,0],['운동복',0,0],['화려한 옷',0,0],['제복',0,0]];
 const styleRemain=styleCareCooldownRemaining();const styleHpNeed=effectiveHpCost(4);const styleReason=state.stats.looks>=100?'외모 최대':styleRemain>0?`${styleRemain}일 후 관리 가능`:state.stats.money<500000?'관리 비용 부족':state.stats.hp<styleHpNeed?`체력 부족 · ${styleHpNeed} 필요`:'';
 showModal('옷장',`<div class="card-list">${outfits.map(([x,price],i)=>{const owned=state.ownedOutfits.includes(i);if((i===6||i>=7)&&!owned)return '';const special=i===6;const flea=i>=7;return `<div class="info-card ${special?'mystery-outfit-card':''} wardrobe-outfit-card ${owned?'has-preview':'no-preview'}">${owned?`<img src="${outfitImage(i)}" alt="${x}">`:''}<div class="wardrobe-copy"><header><b>${x}</b><span>${special?'수상한 상인의 의상':flea?'플리마켓 의상':i===0?'기본 의상':price.toLocaleString()+'원'}</span></header>${special?'<p>착용하는 순간 외모가 최대치 100이 됩니다.</p>':''}<button data-outfit="${i}" ${state.outfit===i?'disabled':''}>${state.outfit===i?'착용 중':owned?'갈아입기':'구매하기'}</button></div></div>`}).join('')}<div class="info-card"><header><b>헤어·스타일 관리</b><span>500,000원</span></header><p>15일마다 한 번 이용할 수 있습니다. 체력 4를 사용하고 외모 +1. 관리 후 30일이 지나면 외모가 1씩 감소합니다.</p><button id="styleCare" ${styleReason?'disabled':''}>${styleReason||'관리받기'}</button></div></div>`);
 $$('[data-outfit]').forEach(b=>b.onclick=()=>{const before=snapshotStats();const i=+b.dataset.outfit,[name,price,bonus]=outfits[i];if(!state.ownedOutfits.includes(i)){if(i>=7)return toast('이 의상은 공원 플리마켓에서 구입해야 합니다.');if(state.stats.money<price)return toast('옷을 구매할 돈이 부족합니다.');stat('money',-price);state.ownedOutfits.push(i);if(bonus)stat('looks',bonus)}state.outfit=i;if(i===6){state.stats.looks=100;addHistory('✨ 의상 「???」 착용 · 외모가 최대치 100이 되었다.','outfit:mystery-equipped')}const changes=describeStatChanges(before);showDialogue('류현상',dialogueWithStatChanges(`${name}으로 갈아입었다. 거울을 보며 “옷이 사람을 만든다는데, 성격까지 부드러워지진 않겠지.”라고 중얼거렸다.`,changes));save(false);closeModal();render()});
 const care=$('#styleCare');if(care)care.onclick=()=>{const remain=styleCareCooldownRemaining();if(remain>0)return toast(`헤어 스타일 관리는 ${remain}일 후 다시 이용할 수 있습니다.`);if(state.stats.money<500000)return toast('스타일 관리 비용 500,000원이 부족합니다.');if(!costHp(4))return;state.dailyUse.styleCareDay=state.day;state.dailyUse.styleCareLastDay=state.day;state.dailyUse.styleDecayCount=0;stat('money',-500000);stat('looks',1);if(state.stats.looks>=100)addHistory('✨ 외모 100 달성 · 무대 스타일이 완성됐다.','milestone:looks100');closeModal();showDialogue('류현상','50만원을 들여 머리와 의상을 전문적으로 정돈해 외모가 1 올랐다. 다음 헤어 스타일 관리는 15일 뒤에 받을 수 있다.');advance(1)}
}

const specialAlbumExtras={
 iziViral:{title:'수원역 · 응급실 커버 바이럴',sceneKey:'iziViral',image:'assets/images/izi-suwon-viral.jpg',scenes:[
  {name:'나레이션',text:'비가 막 그친 수원역 앞. 류현상은 마지막 곡으로 〈응급실〉을 불렀다. 거칠고 절박한 고음에 퇴근길 사람들의 발걸음이 하나둘 멈췄다.'},
  {name:'지나가던 관객',text:'“수원역에서 그냥 찍은 건데 목소리가 너무 절박해서 못 지나가겠어요.” 짧은 영상은 밤사이 추천 알고리즘을 타기 시작했다.'},
  {name:'나레이션',text:'영상은 며칠 동안 퍼졌고 팔로워가 1만 5천 명 늘었다. 사람들은 류현상을 ‘응급실 버스킹 가수’라고 부르기 시작했다.'},
  {name:'류현상',text:'“다음에는 내 노래로 저 숫자를 만들 거야.”'}]},
 waitedMoreViral:{title:'명동 · 기다린만큼, 더 555만 조회',sceneKey:'waitedMoreViral',image:'assets/images/waited-more-myeongdong-viral.jpg',scenes:[
  {name:'나레이션',text:'명동 한복판에서 류현상은 〈기다린만큼, 더〉를 불렀다. 후렴의 고음이 퍼지자 수많은 휴대전화 카메라가 그를 향했다.'},
  {name:'류현상',text:'버스킹 영상을 자신의 인스타그램에 올렸다. 별생각 없이 올린 한 개의 릴스였다.'},
  {name:'나레이션',text:'영상은 하룻밤 사이 555만 조회를 넘겼고 팔로워가 3만 명 늘었다. 이번에는 훨씬 더 많은 사람이 그의 이름을 기억했다.'}]},
 hiddenGameOst:{title:'게임 OST · 천도박멸',sceneKey:'hiddenGameOst',image:'assets/images/hidden-game-ost.jpg',scenes:[{name:'나레이션',text:'판타지 웹툰 게임 〈천도박멸〉의 OST 제작 제안이 도착했다.'},{name:'류현상',text:'낯선 장르였지만 직접 멜로디를 만들고 녹음하며 새로운 음악 세계에 도전했다.'},{name:'나레이션',text:'게임 공개 후 OST는 작품의 장면과 함께 입소문을 탔다.'}]},
 hiddenRadioDj:{title:'라디오 고정 게스트',sceneKey:'hiddenRadioDj',image:'assets/images/hidden-radio-dj.png',scenes:[{name:'나레이션',text:'류현상은 라디오 고정 게스트가 되어 청취자의 사연에 맞춘 노래를 부르게 됐다.'},{name:'류현상',text:'카메라 없는 스튜디오에서 오직 목소리만으로 누군가의 밤을 위로했다.'},{name:'나레이션',text:'조용한 라디오 버스킹은 새로운 팬들을 불러왔다.'}]},
 hiddenDingo:{title:'딩고 · 더 넥스트 라이징 보이스',sceneKey:'hiddenDingo',image:'assets/images/hidden-dingo-rising.png',scenes:[{name:'나레이션',text:'딩고 스튜디오의 한가운데, 류현상은 단 한 번의 라이브 촬영을 준비했다.'},{name:'후라보노',text:'“형, 편집으로 고칠 수 없어요. 평소처럼만 하면 됩니다.”'},{name:'나레이션',text:'〈기다린만큼, 더〉 라이브 영상은 공개 직후 조회수 1위에 올랐다.'}]},
 careerLv70:{title:'Lv.70 · 전국 음악 페스티벌',sceneKey:'careerLv70',image:'assets/images/special-career-lv70.png',scenes:[{name:'나레이션',text:'류현상은 전국 규모 음악 페스티벌의 메인 무대에 올랐다.'},{name:'류현상',text:'공원에서 몇 사람 앞에 노래하던 시절을 떠올리며 수천 명의 관객을 향해 첫 음을 냈다.'},{name:'나레이션',text:'그날 이후 그의 이름은 지역을 넘어 전국의 공연 관계자들에게 알려졌다.'}]},
 careerLv80:{title:'Lv.80 · 전국 투어 매진',sceneKey:'careerLv80',image:'assets/images/special-career-lv80.png',scenes:[{name:'나레이션',text:'첫 전국 투어의 예매 좌석이 연이어 매진됐다.'},{name:'후라보노',text:'“형, 이제 관객이 형을 찾아서 도시를 옮겨 다녀요.”'},{name:'류현상',text:'숫자보다, 도시마다 다른 관객의 얼굴이 더 오래 기억에 남았다.'}]},
 careerLv90:{title:'Lv.90 · 해외 쇼케이스',sceneKey:'careerLv90',image:'assets/images/special-career-lv90.png',scenes:[{name:'나레이션',text:'류현상은 첫 해외 쇼케이스 무대에 섰다. 익숙하지 않은 언어의 함성이 객석을 채웠다.'},{name:'류현상',text:'말은 달라도 노래가 시작되자 관객의 반응은 같았다.'},{name:'나레이션',text:'해외 팬들은 그의 이름과 노래를 각자의 언어로 공유하기 시작했다.'}]},
 actingExtra:{title:'연습실 · 사극 상인 엑스트라',sceneKey:'actingExtra',image:'assets/images/special-acting-extra.png',scenes:[{name:'나레이션',text:'류현상은 사극 촬영 현장에서 지나가는 상인 엑스트라를 맡아 허름한 짐을 메고 장터를 오갔다.'},{name:'현장 스태프',text:'“존재감은 튀지 않게, 그런데 어색하면 안 돼요.” 예상보다 까다로운 주문에 그는 묵묵히 동선을 반복했다.'},{name:'류현상',text:'아무도 관심을 주지 않았지만, 촬영을 마친 뒤 그는 더 유명해져서 언젠가 이름 있는 배우가 되겠다고 다짐했다.'}]},
 firstKissScene:{title:'연기 특별 이벤트 · 첫 키스신',sceneKey:'firstKissScene',image:'assets/images/special-first-kiss-scene.jpg',scenes:[{name:'나레이션',text:'뮤직비디오 촬영장에서 류현상은 처음으로 키스신을 맡게 되었다. 상대역인 신인 여자배우는 촬영 직전까지 손을 떨 정도로 긴장하고 있었다.'},{name:'류현상',text:'“저도 처음이에요. 천천히 합 맞춰요. 불편하면 바로 말해 주세요.” 자신의 긴장보다 상대가 편안해지는 쪽을 먼저 생각했다.'},{name:'나레이션',text:'카메라가 돌자 류현상은 약속한 동선대로 천천히 다가가 상대의 신호를 확인한 뒤 장면을 완성했다. 감독은 한 번에 OK를 외쳤다.'},{name:'여자배우',text:'“계속 배려해 주셔서 정말 고마워요. 덕분에 하나도 무섭지 않았어요.” 촬영이 끝난 뒤에도 그녀의 얼굴에는 설렘과 안도가 함께 남아 있었다.'}]},
 mysteriousMerchantPurchased:{title:'수상한 상인 · 이름 없는 의상',sceneKey:'mysteriousMerchant',image:'assets/images/mysterious-merchant.png',scenes:[{name:'나레이션',text:'어두운 골목에서 얼굴을 가린 상인이 이름 없는 의상 「???」을 내밀었다.'},{name:'수상한 상인',text:'“값은 44,444,444원. 입는 순간 사람들은 당신을 이전과 다르게 기억할 겁니다.”'},{name:'류현상',text:'터무니없는 값을 치르고 의상을 손에 넣었다. 그날부터 그의 인상은 완전히 달라졌다.'}]},
 cardCollectorVisit:{title:'디지몬카드 전문 수집꾼의 방문',sceneKey:'cardCollectorSpecial',image:'assets/images/special-card-collector.png',scenes:[{name:'나레이션',text:'디지몬 카드를 500장 이상 모은 다음 날, 전문 수집꾼이 자취방을 찾아왔다.'},{name:'전문 수집꾼',text:'그는 모든 카드를 판매가의 1.5배로 사겠다는 파격적인 거래를 제안했다.'},{name:'류현상',text:'돈과 추억 사이에서 류현상은 자신의 선택을 내렸다.'}]},
 hurabonoWeddingDay:{title:'후라보노의 결혼식날',sceneKey:'hurabonoWeddingDay',image:'assets/images/special-hurabono-wedding.png',scenes:[{name:'나레이션',text:'후라보노의 축가 부탁과 청첩장 이야기가 모두 끝난 뒤 결혼식 날이 찾아왔다.'},{name:'류현상',text:'류현상은 모든 일정을 비우고 결혼식에서 진심을 담아 축가를 불렀다.'},{name:'후라보노',text:'“형 덕분에 제 결혼식이 빛날 수 있었어요.”'},{name:'류현상',text:'“앞으로도 내 뒷치닥거리 잘 부탁해요.”'}]}
};
function specialAlbumEntries(){
 const fixed=(typeof fixedDaySpecialEvents!=='undefined'?fixedDaySpecialEvents:[]).filter(def=>state.specialEvents?.[def.key]).map(def=>({key:def.key,title:def.label,sceneKey:def.sceneKey,image:specialAlbumImage(def.sceneKey),scenes:def.scenes}));
 const extras=Object.entries(specialAlbumExtras).filter(([key])=>state.specialEvents?.[key]).map(([key,v])=>({key,...v}));
 const drawerPhotos=drawerCompletedPhotos().map(photo=>({key:`drawerPhoto${photo.id}`,title:`서랍 사진 · ${photo.title}`,sceneKey:null,image:photo.image,drawerPhoto:true,scenes:[]}));
 return [...fixed,...extras,...drawerPhotos];
}
function specialAlbumImage(sceneKey){
 const map={day30Hair:'assets/images/special-day30-hair.jpg',day60Workout:'assets/images/special-day60-workout.jpg',day90Live:'assets/images/special-day90-live.jpg',day120Chat:'assets/images/special-day120-kakaotalk.jpg',day150Birthday:'assets/images/special-day150-birthday.jpg',day180Archive:'assets/images/special-day180-user.png',day210Demo:'assets/images/special-day210-user.png',day240Meme:'assets/images/special-day240-user.png',day300Promise:'assets/images/special-day300-user.png',day330Mother:'assets/images/special-day330-mother.png',day360Reflection:'assets/images/special-day360-reflection.png'};
 return map[sceneKey]||'assets/images/home-bg.jpg';
}
function openSpecialAlbum(){
 const entries=specialAlbumEntries();
 const total=(typeof fixedDaySpecialEvents!=='undefined'?fixedDaySpecialEvents.length:0)+Object.keys(specialAlbumExtras).length+drawerPhotoCatalog.length;
 const html=entries.length?`<p class="album-progress">수집 ${entries.length} / ${total}</p><div class="memory-album-grid">${entries.map((e,i)=>`<button class="memory-album-card" data-memory-index="${i}" style="--memory-image:url('${e.image}')"><span class="memory-album-shade"></span><span class="memory-album-title">${e.title}</span><small>클릭해서 다시 보기</small></button>`).join('')}</div>`:`<div class="empty-memory-album"><b>아직 수집된 특별 이벤트가 없습니다.</b><p>특별 이벤트를 완료하면 이미지와 스토리가 이곳에 기록됩니다.</p></div>`;
 showModal('추억 앨범',html,'album');
 $$('[data-memory-index]').forEach(btn=>btn.onclick=()=>{const entry=entries[+btn.dataset.memoryIndex];if(entry.drawerPhoto){closeModal();openDrawerPhoto(entry.key.replace('drawerPhoto','')|0);return}closeModal();replaySpecialAlbum(entry)});
}
function replaySpecialAlbum(entry){
 let page=0;
 const previousLocation=state.location;
 beginSpecialScene(entry.sceneKey);
 const area=$('#choiceArea');
 const finish=()=>{endSpecialScene();state.location=previousLocation;state.dialogue={name:'나레이션',text:`추억 앨범에서 「${entry.title}」을 다시 보았다.`};area.innerHTML='';area.classList.add('hidden');render();};
 const draw=()=>{const scene=entry.scenes[page];state.dialogue={name:scene.name||scene.speaker||'나레이션',text:scene.text};render();area.innerHTML='';const prev=document.createElement('button');prev.textContent='이전 장면';prev.disabled=page===0;const next=document.createElement('button');next.textContent=page===entry.scenes.length-1?'앨범으로 돌아가기':'다음 장면';area.append(prev,next);area.classList.remove('hidden');prev.onclick=()=>{if(page>0){page--;draw()}};next.onclick=()=>{if(page<entry.scenes.length-1){page++;draw()}else{finish();setTimeout(openSpecialAlbum,30)}}};
 playSfx('event');draw();
}

function openAlbum(){if(debtBlocked('앨범 제작'))return;const albums=[['디지털 싱글',5000000],['미니앨범',20000000],['정규앨범',50000000]];showModal('앨범 제작',albums.map(([n,p],i)=>`<div class="info-card"><header><b>${n}</b><span>${p.toLocaleString()}원</span></header><p>보컬과 작곡 능력에 따라 팬과 수익이 증가합니다.</p><button data-album="${i}">발매하기</button></div>`).join(''));$$('[data-album]').forEach(b=>b.onclick=()=>releaseAlbum(albums[+b.dataset.album]))}
function releaseAlbum([name,cost]){
 if(state.stats.money<cost)return toast('제작비가 부족합니다.');if(state.stats.compose<30||state.stats.vocal<35)return toast('작곡 30, 보컬 35 이상이 필요합니다.');if(!cooldownReady('album',30,'다음 앨범 발매'))return;markCooldown('album');
 stat('money',-cost);const score=Math.max(30,state.stats.vocal+state.stats.compose+((state.equippedInstruments||[]).length*2)+(state.band.formed?state.band.bond*.3:0)+Math.random()*35-state.stats.stress*.1);const tier=name==='디지털 싱글'?0:name==='미니앨범'?1:2;const fanRates=[12,35,80],fameRates=[.45,.8,1.2];
 const fans=Math.floor(score*fanRates[tier]);const revenueRate=clamp(.45+score/180,.65,1.6);const revenue=Math.floor(cost*revenueRate);const fameGain=Math.max(30,Math.floor(score*fameRates[tier]));
 stat('fans',fans);stat('fame',fameGain);stat('money',revenue);state.albums.push({name,score:Math.floor(score),fans,revenue});
 addHistory(`💿 ${name} 발매 · 팬 ${fans.toLocaleString()}명, 인지도 +${fameGain}, 정산 ${revenue.toLocaleString()}원`);
 if(!state.milestones.firstAlbum)state.milestones.firstAlbum=true;
 showDialogue(state.manager.hired?'후라보노':'류현상',state.manager.hired?`${name} 발매 완료. 팬 ${fans.toLocaleString()}명, 정산 ${revenue.toLocaleString()}원입니다. 다음 앨범은 최소 30일 동안 준비해야 해요.`:`${name} 발매를 마쳤다. 팬 ${fans.toLocaleString()}명이 늘었고 정산은 ${revenue.toLocaleString()}원이었다. 다음 작품은 서두르지 않고 30일 동안 준비하기로 했다.`);closeModal();advance(1)
}
const endingStories={
 '무명가수 엔딩':[
  ['아직 작은 이름','365일 동안 노래했지만 세상이 류현상의 이름을 크게 부르지는 않았다. 공연은 비어 있는 날이 더 많았고, 영상의 조회 수는 쉽게 두 자릿수를 넘지 못했다. 그래도 매번 끝까지 들어 주는 몇 사람은 남아 있었다.'],
  ['멈춰 서는 한 사람','류현상은 실패한 것인지 오래 생각했다. 그러나 다음 버스킹에서 한 사람이 발걸음을 멈추고, 또 한 사람이 이어폰을 빼는 모습을 보았다. 유명하지 않다는 사실과 가수가 아니라는 사실은 같지 않았다.'],
  ['다시 첫 곡','그는 다음 날에도 낡은 마이크를 세웠다. 관객은 적었지만 첫 소절을 대충 부르지 않았다. 류현상은 이름 없는 가수로 남았지만, 노래를 포기하지 않은 사람으로 계속 살아갔다.']
 ],
 '파산 엔딩':[
  ['미뤄 둔 고지서','처음 생긴 채무는 다음 수입으로 갚을 수 있을 것 같았다. 하지만 월세와 유지비, 예상 밖의 지출이 이어지며 채무는 50만원을 넘겼고, 15일 동안 위험선을 벗어나지 못했다. 독촉 문자는 공연 알림보다 더 자주 울렸다.'],
  ['닫히는 문','장비와 가구가 정리되고 계약은 하나씩 취소됐다. 류현상은 마지막으로 남은 마이크를 바라봤지만 당장 필요한 것은 새 노래가 아니라 생활을 다시 세울 돈이었다. 음악 활동은 강제로 멈췄다.'],
  ['파산','그는 실패를 인정하는 서류에 이름을 적었다. 다시 시작할 가능성까지 사라진 것은 아니었지만, 채무가 위험선을 넘은 뒤에도 제때 줄이지 못한 결과는 명확했다. 이번 이야기는 꿈보다 먼저 지켜야 할 생활의 균형을 잃은 결말로 끝났다.']
 ],
 '활동 중지 엔딩':[
  ['쌓여 있던 경고','인지도 Lv.40부터 이어진 시선과 전화, 침입 흔적은 우연이 아니었다. 류현상은 팬을 의심하고 싶지 않았고 위험을 크게 만들고 싶지도 않았다. 그러나 해결되지 않은 사건은 Lv.50에 도달할 때까지 계속 가까워졌다.'],
  ['스토커의 습격','다섯 번째 경고까지 안전한 대응을 완성하지 못한 뒤, 결국 스토커가 류현상에게 직접 접근해 습격하는 사건이 발생했다. 생명은 건졌지만 류현상은 사건 직후 극심한 충격과 불안 증세를 보였고 정상적인 일상과 무대 활동을 이어 갈 수 없는 상태가 되었다.'],
  ['장기간 활동 중지','소속사는 류현상의 모든 일정을 취소하고 장기간 활동 중지를 발표했다. 그는 외부 접촉을 최소화한 채 정신병원에 입원해 장기 치료를 시작했다. 충격이 너무 커 회복과 복귀가 가능한지, 가능하다면 언제가 될지는 누구도 확신할 수 없었다.']
 ],
 '월드스타 엔딩':[
  ['완성된 조건','정규앨범, 외모 100, 인지도 Lv.100, 팬 10만 명, 펜트하우스, 보컬과 작곡 95 이상. 어느 하나도 우연으로 채울 수 없는 기록이 모두 한 화면에 모였다. 후라보노는 세계 투어 계약서를 내밀며 웃었다.'],
  ['국경을 넘은 노래','서울에서 시작한 투어는 도쿄와 방콕, 파리와 뉴욕으로 이어졌다. 관객들은 서로 다른 언어로 같은 후렴을 불렀고, 류현상은 직접 만든 노래가 번역보다 먼저 마음에 도착하는 순간을 보았다.'],
  ['월드스타 류현상','마지막 공연의 전광판에는 폐업한 기획사와 첫 공원 버스킹부터 지금까지의 장면이 흘렀다. 그는 세계적인 스타가 되었지만 다음 날 호텔 책상에서 다시 새 곡의 첫 문장을 썼다. 세계 무대는 결승점이 아니라 더 큰 시작이었다.']
 ],
 '유명 솔로가수 엔딩':[
  ['이름을 부르는 함성','솔로 버스킹과 앨범, 방송과 단독 공연을 거치며 류현상의 이름은 대중에게 익숙해졌다. 공연장 객석은 그의 목소리 하나를 듣기 위해 채워졌고, 첫 소절이 시작되기 전부터 함성이 터졌다.'],
  ['혼자 서는 무대','유명해진 뒤에도 솔로 무대는 숨을 곳이 없었다. 작은 음정과 표정까지 기사와 영상이 되었지만, 류현상은 그 압박을 노래의 집중력으로 바꾸었다. 매니저와 스태프는 그의 한 사람짜리 무대를 함께 지켰다.'],
  ['대표 가수','앨범과 방송, 투어가 안정적으로 이어졌다. 류현상은 모두가 아는 유명 솔로가수가 되었고, 화려한 무대에서도 공원에서 첫 관객을 기다리던 마음을 잊지 않았다.']
 ],
 '보컬트레이너 엔딩':[
  ['남은 것은 목소리','보컬 능력은 누구보다 높았지만 작곡과 대중 활동은 그만큼 따라오지 못했다. 류현상은 무대에서 성공하는 방법보다 목소리가 무너지지 않게 만드는 원리를 더 깊이 이해하고 있었다.'],
  ['첫 번째 제자','연습생 한 명의 호흡과 발성을 봐 달라는 부탁을 받았다. 류현상은 까칠한 표정으로 자세를 고쳐 주었지만, 제자가 처음으로 안정된 고음을 내자 누구보다 만족한 얼굴을 했다.'],
  ['목소리를 만드는 사람','그의 수업을 거친 가수들이 여러 무대에 올랐다. 류현상은 자신의 이름으로 박수를 받는 대신 수많은 목소리 안에 기술과 경험을 남기는 보컬트레이너가 되었다.']
 ],
 '작곡가 엔딩':[
  ['무대보다 오래 남는 곡','류현상의 작곡 능력은 보컬 활동보다 훨씬 앞서 있었다. 발매한 곡들은 처음에는 조용했지만 다른 가수와 제작자들이 데모를 찾기 시작하면서 이름이 크레디트에 반복해서 등장했다.'],
  ['새벽의 작업실','그는 무대 조명 대신 모니터 불빛 앞에서 더 오래 깨어 있었다. 가수의 음역과 이야기에 맞춰 멜로디를 바꾸고, 수십 번의 수정 끝에 한 소절을 완성했다.'],
  ['히트곡의 이름','여러 가수가 류현상의 곡으로 차트에 올랐다. 대중이 그의 얼굴을 모두 알지는 못해도 노래는 도시 곳곳에서 흘렀다. 그는 자신의 음악 세계를 다른 목소리로 확장하는 작곡가가 되었다.']
 ],
 '편의점 사장 엔딩':[
  ['누적된 근무일지','수습으로 시작한 편의점 일은 어느새 100회를 넘겼다. 발주와 진열, 야간 문제와 단골의 취향까지 류현상보다 매장을 잘 아는 사람은 없었다. 점장은 농담처럼 가게를 맡아 보지 않겠느냐고 말했다.'],
  ['새 간판','모아 둔 자금으로 작은 편의점을 인수했다. 계산대 옆에는 공연 전단과 디지몬 카드 몇 장이 놓였고, 밤이 되면 매장 스피커에서 류현상의 자작곡이 흘렀다.'],
  ['노래하는 사장','그는 유명 가수는 되지 못했지만 생활을 안정시키고 자신의 공간을 만들었다. 가끔 단골들 앞에서 기타를 꺼내 노래하는 편의점 사장 류현상의 무대는 영업이 끝난 뒤 시작됐다.']
 ],
 '인플루언서 엔딩':[
  ['매일 올라온 기록','보컬은 전문 가수의 평균보다 낮았지만 류현상은 60회가 넘는 SNS 게시물로 연습과 일상, 디지몬 취향을 꾸준히 공유했다. 팬들은 완벽한 노래보다 솔직한 반응과 독특한 성격을 기다렸다.'],
  ['알고리즘의 선택','짧은 라이브와 무표정 셀카, 장비 리뷰가 연달아 화제가 됐다. 브랜드와 방송은 가수보다 콘텐츠 창작자로서의 류현상에게 먼저 연락하기 시작했다.'],
  ['화면 속의 스타','류현상은 음악을 포기하지 않았지만 중심 무대는 휴대전화 화면으로 옮겨 갔다. 그는 팬과 매일 직접 연결되는 인플루언서가 되었고, 게시물 하나가 작은 공연보다 더 많은 사람에게 도착했다.']
 ],
 '디지몬 카드샵 사장 엔딩':[
  ['두 번의 SP','외모와 보컬, 작곡, 인지도는 모두 평균 이하에 머물렀다. 그런데 수천 장의 카드 사이에서 믿기 어려운 SP 등급을 두 번이나 뽑았다. 류현상은 이것이 음악보다 분명한 재능일지도 모른다고 생각했다.'],
  ['진열장 안의 꿈','카드 판매금과 모아 둔 돈으로 작은 디지몬 카드샵을 열었다. 벽에는 희귀 카드와 대회 일정이 붙었고, 계산대에서는 류현상이 직접 덱 상담을 해 주었다.'],
  ['카드샵 사장 류현상','손님들은 노래보다 카드 이야기를 하러 그를 찾았다. 류현상은 가끔 매장 대회 우승자에게 자작곡을 들려주는 이상한 상품을 걸었다. 음악가의 꿈은 달라졌지만, 좋아하는 것을 사람들과 나누는 삶은 계속됐다.']
 ],
 '단역 배우 엔딩':[
  ['갑작스러운 방향 전환','갑자기 음악을 하다 말고 연기를 해 보겠다는 류현상의 말에 주변 사람들은 농담인 줄 알았다. 하지만 그는 “해보고 싶었던 것 중 하나예요”라며 대본을 들고 작은 오디션부터 찾아다녔다.'],
  ['짧지만 분명한 장면','주연배우가 되지는 못했다. 이름 없는 행인, 가게 손님, 무대 뒤 스태프 같은 짧은 역할이 대부분이었다. 그래도 촬영이 끝날 때마다 류현상은 자신이 화면 안에 존재했다는 사실을 꽤 만족스러워했다.'],
  ['단역 배우 류현상','화려한 주인공은 아니었지만 그는 단역 배우의 삶에 만족했다. 음악과 전혀 다른 방식으로 사람의 감정을 표현하는 일이 재미있었다. 류현상은 다음 촬영 대본을 챙기며 또 다른 작은 역할을 기다렸다.']
 ],
 '유명 배우 엔딩':[
  ['가수 역할 오디션','돌연 연기자를 하겠다고 선언한 류현상에게 한 드라마의 가수 역할 제안이 들어왔다. 실제 무대 경험 덕분에 마이크를 잡는 자세와 긴장한 표정까지 자연스러웠고, 제작진은 예상보다 큰 비중을 맡겼다.'],
  ['시청률 1위','드라마는 방송 직후 입소문을 타더니 결국 동시간대 시청률 1위를 기록했다. “저 가수 역할 배우 누구야?”라는 검색어가 오르기 시작했고 류현상의 장면은 짧은 영상으로 끊임없이 공유됐다.'],
  ['유명 배우 류현상','처음에는 해보고 싶다는 마음뿐이었지만 이제 사람들은 그를 유명 배우로 불렀다. 음악 무대에서 익힌 감정은 카메라 앞에서도 강점이 되었고, 류현상은 노래와 연기를 오가는 새로운 커리어를 시작했다.']
 ],
 '밴드가수 엔딩':[
  ['네 사람의 카운트','B군의 단단한 기타, L군의 여유로운 베이스, 말없이 정확한 J군의 건반, R군의 드럼이 류현상의 목소리와 맞물렸다. 열두 번이 넘는 밴드 버스킹과 반복된 합주는 서로의 실수를 말없이 메울 정도의 호흡을 만들었다.'],
  ['팀의 이름','단독 공연에서 관객은 류현상뿐 아니라 멤버들의 이름도 함께 불렀다. 의견 충돌과 이탈 위기를 넘긴 결속력은 음악의 일부가 되었고, 누구도 이 무대를 한 사람의 성공이라고 말하지 않았다.'],
  ['밴드가수 류현상','밴드는 전국 공연과 앨범 활동을 이어 갔다. 류현상은 중심 보컬이었지만 모든 곡의 마지막 인사는 늘 같은 말이었다. “우리 밴드였습니다.” 그는 혼자보다 더 큰 소리를 만드는 밴드가수가 되었다.']
 ]
}

// --- 2026 확장 시스템: 성격, 팬 반응, 스토커, 미니게임 ---
const statLabels={hp:'체력',vocal:'보컬',compose:'작곡',acting:'연기',looks:'외모',fame:'인지도',fans:'팬',money:'돈',stress:'스트레스'};
const changeFields={
 hp:['체력',()=>state.stats.hp],vocal:['보컬',()=>state.stats.vocal],compose:['작곡',()=>state.stats.compose],acting:['연기',()=>state.stats.acting],looks:['외모',()=>state.stats.looks],fame:['인지도',()=>state.stats.fame],fans:['팬',()=>state.stats.fans],money:['돈',()=>state.stats.money],debt:['채무',()=>state.economy.debt],stress:['스트레스',()=>state.stats.stress],bandBond:['밴드 결속력',()=>state.band.bond],managerBond:['후라보노 관계',()=>state.manager.bond]
};
function snapshotStats(){return Object.fromEntries(Object.entries(changeFields).map(([k,[,get]])=>[k,get()]))}
function describeStatChanges(before){const parts=[];for(const [k,[label,get]] of Object.entries(changeFields)){const d=get()-(before[k]||0);if(d)parts.push(`${label} ${d>0?'+':''}${d.toLocaleString()}`)}return parts.length?`능력치 변화 · ${parts.join(' / ')}`:''}
function normalizeStatChangeText(message=''){return String(message).replace(/^변경 결과\s*/,'').replace(/^능력치 변화\s*·\s*/,'').replace(/\s*\/\s*/g,' · ').replace(/\n+/g,' · ').trim()}
function stripStatChangeBlocks(text=''){
 return String(text)
  .replace(/(?:\s*\n\s*)*【수치 변화】[^\n]*/g,'')
  .replace(/\n{3,}/g,'\n\n')
  .trimEnd();
}
function dialogueWithStatChanges(text,changes){
 const line=normalizeStatChangeText(changes),base=stripStatChangeBlocks(text);
 return line?`${base}${base?'\n\n':''}【수치 변화】 ${line}`:base;
}
function appendStatChangesToDialogue(changes){
 const line=normalizeStatChangeText(changes);if(!line)return;
 const current=state.dialogue||{name:'나레이션',text:''};
 const base=stripStatChangeBlocks(current.text||'');
 state.dialogue={name:current.name||'나레이션',text:`${base}${base?'\n\n':''}【수치 변화】 ${line}`};
 save(false);const dialogueText=$('#dialogueText');if(dialogueText)dialogueText.textContent=state.dialogue.text
}
let actionNoticeSequence=0;
function snapshotActionResult(){
 return {...snapshotStats(),day:state.day,time:state.time,bakcas:Number(state.items?.bakcas||0),energizer:Number(state.items?.energizer||0),dietPill:Number(state.items?.dietPill||0),strongDietPill:Number(state.items?.strongDietPill||0),meals:Number(state.items?.mealsToday||0),micDurability:Number(state.equipmentDurability?.mic||0),ampDurability:Number(state.equipmentDurability?.amp||0),caseDurability:Number(state.equipmentDurability?.battery||0),housing:Number(state.housing||0),toastSerial}
}
function describeActionResult(before){
 const parts=[];
 for(const [k,[label,get]] of Object.entries(changeFields)){
  const d=get()-Number(before[k]||0);
  if(d)parts.push(`${label} ${d>0?'+':''}${d.toLocaleString()}`)
 }
 const elapsed=(state.day-Number(before.day||state.day))*4+(state.time-Number(before.time||0));
 if(elapsed>0)parts.push(elapsed===4?'하루 경과':`시간 +${elapsed}`);
 const extras=[
  ['bakcas','박칵스',Number(state.items?.bakcas||0)],
  ['energizer','에너자이저',Number(state.items?.energizer||0)],
  ['dietPill','다이어트 알약',Number(state.items?.dietPill||0)],['strongDietPill','강력한 다이어트알약',Number(state.items?.strongDietPill||0)],
  ['micDurability','마이크 내구도',Number(state.equipmentDurability?.mic||0)],
  ['ampDurability','음향장비 내구도',Number(state.equipmentDurability?.amp||0)],
  ['caseDurability','보호케이스 횟수',Number(state.equipmentDurability?.battery||0)]
 ];
 for(const [key,label,current] of extras){const d=current-Number(before[key]||0);if(d)parts.push(`${label} ${d>0?'+':''}${d.toLocaleString()}`)}
 const housingDelta=Number(state.housing||0)-Number(before.housing||0);if(housingDelta)parts.push(`집 등급 +${housingDelta}`);
 return parts.length?`변경 결과\n${parts.join('  ·  ')}`:''
}
function scheduleActionResultNotice(before){
 const sequence=++actionNoticeSequence;
 setTimeout(()=>{
  if(sequence!==actionNoticeSequence)return;
  if(memoryGameActive)return;
  const message=describeActionResult(before);
  if(message)appendStatChangesToDialogue(message)
 },260)
}
const fanComments=[
 '현상 씨 목소리 듣고 오늘도 퇴근할 이유를 찾았습니다.','얼굴은 냉정한데 목소리는 왜 이렇게 다정한가요. 고소하겠습니다. 제 심장 훔친 죄로요.','장발이 바람에 날릴 때마다 제 인생 계획도 같이 날아갑니다.','안경 밀어 올리는 동작만으로 앙코르 가능한 사람 처음 봐요.','노래 한 곡 들었는데 제 통장도 팬클럽 가입비 낼 준비를 합니다.','형, 디지몬 얘기할 때만 눈이 반짝이는 거 너무 귀여워요.','오늘 고음에서 제 영혼이 디지털 월드까지 갔다 왔습니다.','무표정인데 팬서비스가 되는 건 반칙 아닌가요.','현상 씨가 까칠하게 “감사합니다” 할 때마다 수명이 늘어납니다.','노래 끝났는데 왜 제 심장은 아직 후렴구인가요.','류현상 존재 자체가 장르입니다.','오늘도 잘생김이 과로 중이네요.','저는 팬이 아니라 현상 씨 음악의 장기 구독자입니다.','마이크보다 제가 더 떨고 있습니다.','가수님이 숨 쉬었어요. 오늘 공연 레전드.'
];
const superFanComments=['현상 씨 공연 37번째입니다. 오늘도 같은 자리에서 봤어요.','집 벽 한 면을 류현상 사진으로 채웠습니다. 아직 천장은 비어 있어요.','오늘 입은 셔츠 지난달 14일 버스킹 때랑 같은 거죠?','현상 씨가 좋아하는 디지몬 진화 장면을 전부 정리해 왔어요.'];
dialogues.home.push('사람들과 잘 지내고 싶기는 하다. 다만 오늘은 아무도 말을 걸지 않았으면 좋겠다. 모순인 건 안다.','책상 한쪽에 오래된 디지몬 피규어를 세워 뒀다. 힘들 때 보면 이상하게 다시 시작할 마음이 든다.');
dialogues.store.push('친절하게 말하려고 했는데 목소리가 또 차갑게 나왔다. 다음 손님에게는 3퍼센트쯤 더 부드럽게 말해 보자.','디지몬 과자가 행사 중이다. 필요해서 보는 게 아니라 시장 조사를 하는 중이다.');
dialogues.practice.push('소리가 조금만 어긋나도 신경이 곤두선다. 그래도 사람에게 화내기 전에 문제를 설명하는 연습부터 하자.');
dialogues.park.push('팬에게 무뚝뚝하게 답하고 나서 뒤늦게 손을 흔들었다. 사회성은 타이밍이 가장 어렵다.');
dialogues.stage.push('예민함은 무대를 망치기도 하지만, 작은 소리까지 놓치지 않게 해 주기도 한다. 오늘은 후자로 쓰자.');
function pickFanComment(big=false){const pool=[...fanComments,...(big||Math.random()<.18?superFanComments:[])];return pick(pool)}
function trainingBaseGain(type){let gain=4;const eq=new Set(state.equippedInstruments||[]);if(type==='compose'){if(eq.has('acousticGuitar'))gain+=1;if(eq.has('keyboard'))gain+=2;if(eq.has('audioInterface'))gain+=1}else{if(eq.has('studioMic'))gain+=2;if(eq.has('monitorHeadphones'))gain+=1;if(eq.has('audioInterface'))gain+=1}return Math.min(7,gain)}
function scaledTrainingGain(type,raw){const v=state.stats[type];let rate=v<40?1:v<60?.8:v<80?.6:v<90?.4:v<95?.25:0;let gain=Math.floor(raw*rate);if(raw>0&&rate>0)gain=Math.max(1,gain);return gain}
function gainSkill(type,raw,source='general'){
 if(!['vocal','compose'].includes(type))return 0;
 const specialSources=new Set(['specialEvent','album','majorStage','endingReward']);
 const cap=specialSources.has(source)?100:95;
 const current=Number(state.stats[type]||0);
 if(current>=cap)return 0;
 let gain=Math.max(0,Math.floor(Number(raw)||0));
 if(source==='training')gain=scaledTrainingGain(type,gain);
 const actual=Math.min(gain,cap-current);
 if(actual<=0)return 0;
 stat(type,actual);
 return actual;
}
function trainingAction(type,hpCost){
 const atCap=state.stats[type]>=95;
 if(!costHp(hpCost))return;
 markDailyPractice(type);
 if(atCap){state.exp+=4;showDialogue('류현상',`${trainingLabel(type)} 능력치는 일반 성장 한계에 도달했지만 감각을 유지하기 위해 기본 훈련을 진행했다.`);advance(1);return}
 const bonusKey=type==='vocal'?'nextVocalBonus':'nextComposeBonus';const liveBonus=Math.max(0,Number(state.sns?.[bonusKey])||0);if(liveBonus)state.sns[bonusKey]=0;const base=trainingBaseGain(type)+liveBonus;
 if(Math.random()<.19){if(Math.random()<.5)startMemoryGame(type,base);else startReactionGame(type,base);return}
 const actual=gainSkill(type,base,'training');if(actual<=0)return toast(`${trainingLabel(type)} 95 이상은 특별 이벤트·앨범·대형 무대로만 성장할 수 있습니다.`);state.exp+=8;showDialogue('류현상',type==='vocal'?pickActionDialogue('vocal'):pickActionDialogue('compose'));advance(1)
}
function trainingLabel(type){return type==='vocal'?'보컬':'작곡'}
function finishTrainingResult(type,baseGain,success,reason,successText){const before=pendingTrainingActionBefore;pendingTrainingActionBefore=null;const raw=success?Math.round(baseGain*1.5):baseGain;const gain=gainSkill(type,raw,'training');state.exp+=success?12:8;const fallbackText=reason==='closed'?'훈련 게임을 중간에 닫았다. 미니게임 보너스는 받지 못했지만 기본 훈련 능력치는 획득했다.':'제한 시간 안에 끝내지는 못했지만 기본 훈련 능력치는 획득했다.';showDialogue('류현상',success?successText:fallbackText);advance(1);if(before)setTimeout(()=>scheduleActionResultNotice(before),40)}
function runTrainingCountdown(onStart){
 let n=3;const body=$('#modalBody');if(!body)return()=>{};
 const overlay=document.createElement('div');overlay.className='training-countdown';overlay.innerHTML=`<strong>${n}</strong><small>준비</small>`;body.appendChild(overlay);playSfx('tap');
 let startTimer=null;const tick=setInterval(()=>{n--;if(n>0){overlay.querySelector('strong').textContent=n;playSfx('tap');return}clearInterval(tick);overlay.querySelector('strong').textContent='START';overlay.querySelector('small').textContent='';playSfx('success');startTimer=setTimeout(()=>{overlay.remove();onStart()},450)},700);
 return()=>{clearInterval(tick);if(startTimer)clearTimeout(startTimer);overlay.remove()}
}
function startMemoryGame(type,baseGain){
 beginMiniGameUi();const symbols=['♪','♫','♬','𝄞','♩','♭','♯','𝄐'];const cards=[...symbols,...symbols].sort(()=>Math.random()-.5);let first=null,lock=true,matched=0,time=60,timer=null,flipTimer=null,finished=false,countdownCancel=null;
 showModal(type==='vocal'?'보컬 · 음표 카드 짝 맞추기':'작곡 · 음표 카드 짝 맞추기',`<div class="memory-head"><div><b>1분 안에 같은 음악기호 8쌍을 맞추세요.</b><small>스타트를 누르면 3초 카운트다운 후 시작합니다. 중간에 닫으면 기본 능력치만 획득합니다.</small></div><span id="memoryTimer">대기</span></div><div id="memoryGrid" class="memory-grid">${cards.map((x,i)=>`<button class="memory-card" data-i="${i}" data-symbol="${x}" disabled>?</button>`).join('')}</div><button id="memoryStart" class="primary wide">스타트</button>`);
 const finish=(success,reason='time')=>{if(finished)return;finished=true;clearInterval(timer);if(flipTimer)clearTimeout(flipTimer);if(countdownCancel)countdownCancel();countdownCancel=null;endMiniGameUi();activeTrainingAbort=null;closeModal(true);finishTrainingResult(type,baseGain,success,reason,`제한 시간 안에 모든 음악기호를 맞췄다. ${trainingLabel(type)} 능력치를 1.5배 획득했다.`)};
 activeTrainingAbort=()=>finish(false,'closed');
 const bind=()=>{$$('.memory-card').forEach(btn=>{btn.disabled=false;btn.onclick=()=>{if(finished||lock||btn.disabled||btn===first)return;btn.textContent=btn.dataset.symbol;btn.classList.add('open');if(!first){first=btn;return}if(first.dataset.symbol===btn.dataset.symbol){first.disabled=btn.disabled=true;first.classList.add('matched');btn.classList.add('matched');first=null;matched+=2;if(matched===16)finish(true,'success')}else{lock=true;const prev=first;first=null;flipTimer=setTimeout(()=>{if(finished)return;prev.textContent=btn.textContent='?';prev.classList.remove('open');btn.classList.remove('open');lock=false},550)}}});lock=false;const startButton=$('#memoryStart');if(startButton)startButton.remove();$('#memoryTimer').textContent='60초';timer=setInterval(()=>{time--;const el=$('#memoryTimer');if(el)el.textContent=`${time}초`;if(time<=0)finish(false,'time')},1000)};
 const startButton=$('#memoryStart');startButton.onclick=()=>{if(finished||countdownCancel)return;startButton.disabled=true;startButton.textContent='준비 중...';countdownCancel=runTrainingCountdown(()=>{countdownCancel=null;if(!finished)bind()})}
}
function startReactionGame(type,baseGain){
 beginMiniGameUi();const symbols=['♪','♫','♬','𝄞','♩','♭','♯'];let hits=0,misses=0,time=20,finished=false,started=false,timer=null,spawnTimer=null,targetTimer=null,countdownCancel=null;
 showModal(type==='vocal'?'보컬 순발력 훈련':'작곡 순발력 훈련',`<div class="reaction-head"><div><b>빛나는 음표가 나타나면 빠르게 누르세요.</b><small>스타트를 누르면 3초 카운트다운 후 시작합니다. 20초 안에 8번 성공하면 1.5배 보상입니다.</small></div><div class="reaction-score"><span id="reactionHits">성공 0 / 8</span><strong id="reactionTimer">대기</strong></div></div><div id="reactionArena" class="reaction-arena"><button id="reactionTarget" class="reaction-target hidden">♪</button><p id="reactionGuide">스타트를 눌러 시작하세요.</p></div><button id="reactionStart" class="primary wide">스타트</button>`);
 const target=$('#reactionTarget'),guide=$('#reactionGuide');const update=()=>{if($('#reactionHits'))$('#reactionHits').textContent=`성공 ${hits} / 8 · 놓침 ${misses}`;if($('#reactionTimer'))$('#reactionTimer').textContent=`${time}초`};const clearGameTimers=()=>{clearInterval(timer);clearTimeout(spawnTimer);clearTimeout(targetTimer);if(countdownCancel)countdownCancel();countdownCancel=null};
 const finish=(success,reason='time')=>{if(finished)return;finished=true;clearGameTimers();endMiniGameUi();activeTrainingAbort=null;closeModal(true);finishTrainingResult(type,baseGain,success,reason,`나타나는 음표를 빠르게 눌러 순발력 훈련을 성공했다. ${trainingLabel(type)} 능력치를 1.5배 획득했다.`)};
 const scheduleTarget=()=>{if(finished||!started)return;spawnTimer=setTimeout(()=>{if(finished||!started)return;target.textContent=pick(symbols);target.style.left=`${10+Math.random()*80}%`;target.style.top=`${12+Math.random()*72}%`;target.classList.remove('hidden');guide?.classList.add('hidden');targetTimer=setTimeout(()=>{if(finished||target.classList.contains('hidden'))return;target.classList.add('hidden');misses++;update();scheduleTarget()},950)},260+Math.floor(Math.random()*520))};
 target.onclick=()=>{if(finished||!started||target.classList.contains('hidden'))return;clearTimeout(targetTimer);target.classList.add('hit');hits++;update();playSfx('tap');setTimeout(()=>{target.classList.remove('hit');target.classList.add('hidden');if(hits>=8)finish(true,'success');else scheduleTarget()},120)};activeTrainingAbort=()=>finish(false,'closed');
 const startButton=$('#reactionStart');startButton.onclick=()=>{if(finished||started||countdownCancel)return;startButton.disabled=true;startButton.textContent='준비 중...';countdownCancel=runTrainingCountdown(()=>{countdownCancel=null;if(finished)return;started=true;startButton.remove();update();scheduleTarget();timer=setInterval(()=>{time--;update();if(time<=0)finish(hits>=8,hits>=8?'success':'time')},1000)})}
}
function checkStalkerEvent(){
 const lv=fameLevel();if(lv<40||state.stalker.resolved)return false;
 if(!state.stalker.active){state.stalker.active=true;addHistory('🚨 스토커 핵심 사건 시작 · 인지도 Lv.40부터 다섯 단계의 위험이 시작됐다. 각 단계에서 안전한 선택을 모두 골라 안전도 5를 만들어야 하며, Lv.50까지 하나라도 놓치면 스토커 습격으로 인한 활동 중지 엔딩이 발생한다.','stalker:start')}
 const targetEncounter=Math.min(5,Math.floor((lv-40)/2)+1);
 if(state.stalker.encounters>=5||state.stalker.encounters>=targetEncounter)return false;
 const n=state.stalker.encounters+1;const helper=state.manager.hired?'후라보노':'경찰과 공연장 안전 담당자';
 const scenes=[
  ['불길한 기운',`공연 중반부터 류현상은 객석 한쪽에서 묘한 기시감을 느꼈다. 조명 밖 어두운 자리인데도 시선이 피부에 닿는 것처럼 선명했다. 노래를 이어 가며 그쪽을 바라보자, 한 사람이 박수도 치지 않고 고개도 움직이지 않은 채 류현상만 뚫어지게 보고 있었다.\n\n팬의 설렘이나 관객의 호기심과는 달랐다. 표정은 웃고 있었지만 눈빛에는 감정이 없었다. 사람이 사람을 보는 눈이라기보다, 이미 자기 것이 된 물건을 확인하는 듯한 시선이었다. 류현상은 가사를 놓칠 뻔했고 공연이 끝난 뒤에도 그 자리가 계속 신경 쓰였다.`,[[`${helper}에게 즉시 알리고 모습을 기록한다`,()=>{state.stalker.safety++;return state.manager.hired?'후라보노는 관객 촬영 영상과 좌석 위치를 확보하고 공연장 측에 공유했다. “형, 기분 탓으로 넘길 일이 아닙니다. 이상하다고 느꼈을 때부터 기록해야 해요.”':'류현상은 공연장 담당자와 경찰에게 상황을 알리고 가능한 영상과 시간대를 모았다. 불쾌한 감각을 무시하지 않고 첫 증거로 남겼다.'}],['예민해진 것이라 생각하고 넘긴다',()=>{return '류현상은 유명해지면 이상한 시선도 생기는 거라며 스스로를 달랬다. 하지만 장비를 정리하고 돌아서는 순간, 멀리서 같은 사람이 휴대전화를 들어 자신의 뒷모습을 찍는 것을 봤다.'}]]],
  ['발신자 불명',`늦은 새벽, 잠들려던 류현상의 휴대전화가 발신자 표시 제한으로 울렸다. 받지 않자 곧바로 다시 전화가 왔고, 끊어도 몇 초 뒤 또 울렸다. 처음에는 장난 전화라고 생각했지만 한 시간 동안 수십 통이 이어졌다.\n\n문자도 쏟아졌다. “왜 안 받아?”, “지금 깨어 있는 거 알아”, “목소리만 들려줘.” 번호는 표시되지 않았지만 문장 사이에는 류현상이 그날 입었던 옷과 귀가 시간까지 적혀 있었다. 벨소리가 멈춘 뒤에도 진동이 울리는 것 같은 착각이 들었다.`,[[`통화 기록과 문자를 보존해 ${helper}에게 제출한다`,()=>{state.stalker.safety++;return state.manager.hired?'후라보노는 휴대전화를 초기화하지 못하게 막고 통신사 신고, 번호 추적 요청, 경찰 상담을 한꺼번에 진행했다. 숙소 번호와 개인 연락처가 노출된 경로도 점검했다.':'류현상은 메시지를 지우지 않고 화면을 캡처해 통신사와 경찰에 제출했다. 발신자 표시 제한 차단과 긴급 연락망도 설정했다.'}],['휴대전화를 꺼 두고 혼자 버틴다',()=>{return '류현상은 휴대전화를 꺼 서랍에 넣었다. 잠시 조용해졌지만 다음 날 전원을 켜자 부재중 전화와 음성 메시지가 화면을 가득 채웠다. 상대는 침묵을 거절이 아니라 관심을 끄는 방법으로 받아들인 듯했다.'}]]],
  ['무대 뒤의 침입',`공연 전 대기실에서 류현상은 큐시트를 확인하고 있었다. 문이 열리고 후드를 깊게 뒤집어쓴 사람이 들어왔지만, 손에 무언가를 들고 있어 처음에는 관계자인 줄 알았다. 그 사람은 아무 말 없이 류현상 뒤로 다가왔다.\n\n다음 순간 두 팔이 목과 허리를 감쌌다. 낯선 사람이 온몸으로 류현상을 뒤에서 끌어안은 것이다. 류현상이 팔을 떼어 내며 돌아보자 상대는 얼굴을 숨긴 채 복도로 뛰쳐나갔다. 스태프들이 쫓았지만 비상계단 문만 흔들리고 있었다. 대기실 안에는 낯선 향수 냄새가 남았다.`,[[`보안요원을 부르고 CCTV와 출입 기록을 확보한다`,()=>{state.stalker.safety++;return '공연은 잠시 중단됐고 보안팀이 출입구를 봉쇄했다. CCTV에는 위조된 관계자 목걸이를 사용해 들어오는 모습이 남아 있었다. 증거가 구체적으로 쌓이며 정식 수사가 시작됐다.'}],['혼자 뒤쫓아가 얼굴을 확인한다',()=>{return state.manager.hired?'류현상이 복도로 뛰어나가려 하자 후라보노가 몸으로 막았다. 그 짧은 사이 침입자는 사라졌고, 류현상은 보호받는 대신 결정적인 얼굴 확인도 놓쳤다.':'류현상은 비상계단까지 뒤쫓았지만 어두운 계단에서 발소리만 들렸다. 혼자 추격한 탓에 더 위험한 상황이 될 뻔했고, 현장 보존도 늦어졌다.'}]]],
  ['혈서',`팬 사인회에서 마스크를 쓴 한 팬이 작은 선물상자를 내밀었다. 말은 거의 하지 않았고, 류현상이 “감사합니다”라고 하자 고개를 기묘하게 기울인 뒤 사람들 사이로 사라졌다. 포장은 지나치게 정갈했고 리본에는 류현상의 이름이 수십 번 적혀 있었다.\n\n귀가 후 상자를 열자 선물 대신 접힌 종이와 검붉은 얼룩이 나왔다. 종이를 펼친 류현상은 그대로 손을 멈췄다. “난 너와 살고 싶고, 난 너와 죽고 싶어.” 글씨는 마른 부분과 아직 젖은 부분이 섞여 있었고, 상자 바닥에는 집 근처에서 찍힌 사진 한 장이 붙어 있었다.`,[[`상자와 혈서를 건드리지 않고 즉시 신고한다`,()=>{state.stalker.safety++;return '류현상은 상자를 다시 닫지 않고 그대로 두었다. 경찰은 지문과 포장 구매 경로를 확인했고 팬 사인회 영상에서 같은 인물을 특정하기 시작했다. 공연장과 집 주변 경호도 강화됐다.'}],['겁먹은 티를 내지 않으려 혼자 처리한다',()=>{return '류현상은 종이를 찢어 버리려다 손에 얼룩을 묻혔다. 뒤늦게 신고했지만 증거 일부가 훼손됐다. 그날 밤 새로운 문자가 왔다. “선물 마음에 안 들었어?”'}]]],
  ['방문자',`추운 겨울날, 류현상의 어머니가 반찬을 놓아 주려고 집에 들렀다. 류현상은 외부 일정으로 자리를 비운 상태였다. 노크 소리에 문을 열자 젊은 여성이 서 있었다. “저는 류현상 팬이에요. 일본에서 왔어요.” 여성은 먼 곳에서 왔고 밖이 너무 춥다며 잠깐만 기다리게 해 달라고 부탁했다.\n\n어머니는 아들의 팬이라는 말과 떨고 있는 모습을 보고 여성을 집 안으로 들였다. 여성은 공손하게 웃으며 화장실 위치와 류현상의 방, 자주 쓰는 컵까지 자연스럽게 물었다. 그 시각 다른 곳에 있던 류현상의 휴대전화가 ‘띵동’ 하고 울렸다.\n\n메시지를 열자 자신의 집 안 사진이 연달아 도착했다. 침대, 옷장, 욕실, 냉장고 안, 가족사진까지 집을 샅샅이 찍은 사진이었다. 마지막 사진에는 거실에 앉아 있는 어머니의 뒷모습이 담겨 있었다. 류현상은 식겁해 전화를 걸며 집으로 달려갔지만, 도착했을 때 여성은 이미 “잠깐 편의점에 다녀오겠다”며 사라진 뒤였다.`,[[`어머니를 즉시 대피시키고 경찰 신고·주거 보안을 강화한다`,()=>{state.stalker.motherEvacuated=true;state.stalker.safety=Math.min(5,state.stalker.safety+1);return state.manager.hired?'후라보노가 경찰과 함께 현장에 먼저 도착해 어머니를 안전한 곳으로 옮겼다. 출입 기록, 주변 CCTV, 일본에서 왔다는 진술까지 모두 대조했고 그동안 모은 증거가 하나의 인물로 연결됐다.':'류현상은 어머니에게 문을 잠그고 방에서 나오지 말라고 한 뒤 경찰에 신고했다. 주변 CCTV와 앞선 증거가 연결되면서 용의자의 동선이 확인됐다.'}],['다시 찾아오면 직접 대화해 보려 한다',()=>{return '류현상은 어머니를 안심시키며 자신이 직접 만나 끝내겠다고 말했다. 그러나 상대에게는 그 생각조차 “둘만의 만남을 원한다”는 신호로 왜곡될 수 있었다. 집은 더 이상 안전한 공간처럼 느껴지지 않았다.'}]]]
 ];
 const scene=scenes[n-1];state.skipNextStory=true;
 const orderedStalkerChoices=n%2===1?[scene[2][1],scene[2][0]]:scene[2];
 const choices=orderedStalkerChoices.map(([label,fn])=>[label,()=>{state.stalker.encounters=Math.max(state.stalker.encounters,n);let result=fn();addHistory(`🚨 스토커 사건 ${n}/5 · ${scene[0]} — ${label}`);if(n===5&&state.stalker.safety===5){state.stalker.resolved=true;state.stalker.active=false;state.milestones.stalkerResolved=true;addHistory('✅ 스토커 사건 해결 · 다섯 단계에서 모두 안전한 선택을 해 스토커를 검거했다.','stalker:resolved');result+=' 첫 사건부터 마지막 방문자 사건까지 모든 위험 신호를 기록하고 신고한 덕분에 증거가 완성됐다. 경찰은 스토커를 검거했고 류현상과 가족의 주거 및 공연 안전 조치도 마련됐다.'}else if(n===5){result+=` 하지만 다섯 단계 중 안전한 선택은 ${state.stalker.safety}회였다. 사건은 완전히 해결되지 않았고, 인지도 Lv.50에 도달하기 전까지 불안은 계속된다.`}state.skipNextStory=true;advance(1);return result}]);
 showDialogue('핵심 스토리 · 스토커',`【${n}/5 · ${scene[0]}】\n\n${scene[1]}\n\n현재 안전도 ${state.stalker.safety}/5`,choices);return true
}
function getEndingChapters(name){
 const original=endingStories[name]||[['엔딩',`${name}에 도달했다. 류현상의 긴 여정은 여기서 하나의 결말을 맞았지만, 그의 노래는 끝나지 않았다.`]];
 const chapters=structuredClone(original);
 if(name==='무명가수 엔딩'&&!state.manager.hired)chapters[1]=['멈춰 서는 한 사람','류현상은 실패한 것인지 오래 생각했다. 그러나 다음 버스킹에서 한 사람이 발걸음을 멈추고 또 한 사람이 이어폰을 빼는 모습을 보았다. 유명하지 않다는 사실과 가수가 아니라는 사실은 같지 않았다. 혼자서도 노래를 기다리는 사람이 한 명이라도 있다면 계속할 이유는 충분했다.'];
 if(name==='월드스타 엔딩'){const viral=[];if(state.specialEvents.iziViral)viral.push('수원역 응급실 커버 영상');if(state.specialEvents.waitedMoreViral)viral.push('명동 기다린만큼, 더 영상');const past=viral.length?viral.join('과 '):'첫 오디션과 직접 만든 앨범';chapters[2]=['월드스타 류현상',`마지막 공연의 전광판에는 폐업한 기획사와 군 복무, 첫 공원 버스킹, ${past}이 차례로 흘렀다. 그는 세계적인 스타가 되었지만 다음 날 호텔 책상에서 다시 새 곡의 첫 문장을 썼다. 세계 무대는 결승점이 아니라 더 큰 시작이었다.`]}
 return chapters
}
function endingVisualFor(name){return endingArtworkMap[name]||''}
function endingVisualHtml(name,title){const src=endingVisualFor(name);return src?`<div class="ending-visual-frame"><img src="${src}" alt="${name} 장면 이미지"></div>`:`<div class="ending-visual-frame"><div class="ending-visual-fallback">${title}</div></div>`}

function runEndingStory(name,restartAfter=false){
 enterEndingMusic(name);
 setChoiceLock(false);
 const chapters=getEndingChapters(name);
 let page=0;
 const draw=()=>{
  const [title,text]=chapters[page];
  showModal(name,`<div class="ending-story"><div class="ending-count">ENDING · ${page+1} / ${chapters.length}</div><div class="ending-scene">${endingVisualHtml(name,title)}<div class="ending-text-panel"><h3>${title}</h3><p>${String(text).replace(/\n/g,'<br>')}</p></div></div><div class="ending-nav"><button id="endingPrev" ${page===0?'disabled':''}>이전 장면</button><button id="endingNext" class="primary">${page===chapters.length-1?'엔딩을 마친다':'다음 장면'}</button></div></div>`,'ending');
  $('#modal')?.classList.add('ending-focus-modal');
  const prev=$('#endingPrev'),next=$('#endingNext');
  if(prev)prev.onclick=()=>{page--;draw()};
  if(next)next.onclick=()=>{if(page<chapters.length-1){page++;draw()}else{closeModal();if(restartAfter){const collected=[...new Set([...(state.endings||[]),name])];saveMetaEndings(collected);const storage=getStorage();if(storage){storage.removeItem('ryuGame');storage.removeItem(AUTO_SAVE_KEY)}state=structuredClone(baseState);state.endings=collected;syncEndingCollection();toast(`${name}이 엔딩 컬렉션에 저장되었습니다. 새 이야기를 시작합니다.`);startPrologue()}else toast(`${name}의 이야기를 다시 읽었습니다.`)}};
 };
 draw();
}

function hasRegularAlbum(){return (state.albums||[]).some(a=>a?.name==='정규앨범')}
function worldStarMissingRequirements(){
 const missing=[];
 if(!hasRegularAlbum())missing.push('정규앨범 발매 이력');
 if(state.stats.looks<100)missing.push(`외모 100 (${state.stats.looks})`);
 if(fameLevel()<100)missing.push(`인지도 Lv.100 (현재 Lv.${fameLevel()})`);
 if(state.stats.fans<100000)missing.push(`팬 100,000명 (${state.stats.fans.toLocaleString()}명)`);
 if(state.housing<4)missing.push('펜트하우스 이사');
 if(state.stats.vocal<95)missing.push(`보컬 95 (${state.stats.vocal})`);
 if(state.stats.compose<95)missing.push(`작곡 95 (${state.stats.compose})`);
 return missing
}
function worldStarEligible(){return worldStarMissingRequirements().length===0}
function endingProfile(){
 const lv=fameLevel(),albums=state.albums||[],regularAlbum=hasRegularAlbum();
 const soloBusking=Math.max(0,Number(state.career?.soloBusking)||0),bandBusking=Math.max(0,Number(state.career?.bandBusking)||0);
 const workCount=Math.max(0,Number(state.storeJobs?.workCount)||0),stockCount=Math.max(0,Number(state.storeJobs?.stockWorkCount)||0),totalWork=Math.max(0,Number(state.career?.totalWork)||0);
 if(worldStarEligible())return ['월드스타 엔딩','정규앨범·외모 100·인지도 Lv.100·팬 10만 명·펜트하우스·보컬과 작곡 95 이상을 모두 달성했다.'];
 const belowAverage=state.stats.looks<=50&&state.stats.vocal<=50&&state.stats.compose<=50&&lv<=50;
 if(belowAverage&&(state.gambling?.spDraws||0)>=2)return ['디지몬 카드샵 사장 엔딩','외모·보컬·작곡·인지도가 모두 평균 이하인 상태에서 SP 카드를 누적 두 번 뽑아 음악 대신 카드샵을 선택했다.'];
 if((state.career?.actingCount||0)>=25&&(state.career?.actingHits||0)>=8&&state.stats.looks>=75&&lv>=65&&state.stats.fans>=20000)return ['유명 배우 엔딩','연기 25회·좋은 평가 8회·외모 75·인지도 Lv.65·팬 20,000명을 달성해 드라마 가수 역할로 시청률 1위 배우가 되었다.'];
 if((state.career?.actingCount||0)>=10&&(state.career?.actingHits||0)>=2)return ['단역 배우 엔딩','연기 10회 이상과 좋은 평가 2회 이상을 쌓아 작은 역할을 꾸준히 맡는 단역 배우의 길을 선택했다.'];
 if(state.band.formed&&state.band.bond>=75&&bandBusking>=12&&state.career.totalConcerts>=5&&state.stats.vocal>=80&&lv>=45&&state.stats.fans>=15000)return ['밴드가수 엔딩','완전체 밴드, 결속력 75, 밴드 버스킹 12회, 공연 5회, 보컬 80, 인지도 Lv.45, 팬 15,000명을 달성했다.'];
 if(state.stats.vocal>=85&&lv>=60&&state.stats.fans>=30000&&state.career.totalConcerts>=6&&state.career.totalBroadcasts>=3&&albums.length>=1&&soloBusking>=12&&(!state.band.formed||soloBusking>bandBusking))return ['유명 솔로가수 엔딩','보컬과 솔로 활동을 중심으로 앨범·방송·공연 성과를 갖춘 유명 가수가 되었다.'];
 if(state.stats.compose>=90&&albums.length>=2&&albums.some(a=>['미니앨범','정규앨범'].includes(a?.name))&&state.stats.vocal<85)return ['작곡가 엔딩','작곡 90, 앨범 2장 이상, 미니앨범 또는 정규앨범 발매 이력을 갖추고 보컬보다 작곡에 집중했다.'];
 if(state.stats.vocal>=90&&state.stats.compose<=65&&lv<60&&state.career.totalConcerts<=5&&albums.length<=1)return ['보컬트레이너 엔딩','보컬 90 이상이지만 작곡·대중 활동은 낮아 목소리를 가르치는 길을 선택했다.'];
 if(state.stats.vocal<60&&instagramLiveActivityCount()>=60&&state.stats.fans>=10000&&lv>=30&&totalWork<80)return ['인플루언서 엔딩','보컬은 평균보다 낮지만 SNS 게시물과 인스타 라이브를 합쳐 60회 이상 활동하고, 팬 10,000명과 인지도 Lv.30을 달성해 콘텐츠 활동으로 성장했다.'];
 if(totalWork>=100&&Math.max(workCount,stockCount)>=80&&state.stats.money>=5000000&&lv<45&&albums.length<=1)return ['편의점 사장 엔딩','편의점 업무 100회 이상, 한 직무 80회 이상, 보유금 500만 원을 마련해 매장을 인수했다.'];
 return ['무명가수 엔딩','다른 직업·가수 엔딩 조건에는 닿지 못했지만 작은 무대에서 노래를 계속하기로 했다.'];
}
const OPTIONAL_ENDING_START_DAY=365;
const OPTIONAL_ENDING_INTERVAL=100;
function optionalEndingCheckpoint(day=state.day){
 if(day<OPTIONAL_ENDING_START_DAY)return null;
 return OPTIONAL_ENDING_START_DAY+Math.floor((day-OPTIONAL_ENDING_START_DAY)/OPTIONAL_ENDING_INTERVAL)*OPTIONAL_ENDING_INTERVAL;
}
function checkProgress(){
 const lv=fameLevel();state.level=lv;
 if(lv>=100)state.rank='월드스타 후보';else if(lv>=50)state.rank='유명 가수';else if(lv>=10)state.rank='인디 가수';else state.rank='무명 가수';
 if(state.pendingEnding)return;
 const debt=state.economy?.debt||0,debtStart=state.economy?.debtStartDay||0,criticalDay=state.economy?.debtCriticalDay||0;
 const criticalBankruptcy=debt>=BANKRUPTCY_CRITICAL_DEBT&&criticalDay>0&&state.day-criticalDay>=BANKRUPTCY_CRITICAL_DAYS;
 const overdueBankruptcy=debt>0&&debtStart>0&&state.day-debtStart>=BANKRUPTCY_MAX_DAYS;
 if(criticalBankruptcy||overdueBankruptcy){const reason=criticalBankruptcy?`채무가 50만원 이상이 된 ${criticalDay}일차부터 ${BANKRUPTCY_CRITICAL_DAYS}일 동안 위험선을 벗어나지 못했고 현재 채무는 ${debt.toLocaleString()}원이다.`:`채무가 발생한 ${debtStart}일차부터 ${BANKRUPTCY_MAX_DAYS}일이 지났지만 ${debt.toLocaleString()}원을 전액 해결하지 못했다.`;offerEnding('파산 엔딩',`${reason} 파산 엔딩이 즉시 진행된다.`,false,'fatal:bankruptcy',true);return}
 if(lv>=40&&!state.stalker.resolved&&checkStalkerEvent())return;
 const stalkerFatal=lv>=50&&state.stalker.active&&!state.stalker.resolved&&state.stalker.encounters>=5&&state.stalker.safety<5;
 if(stalkerFatal){offerEnding('활동 중지 엔딩','인지도 Lv.40부터 시작된 다섯 단계에서 안전한 선택을 5번 모두 고르지 못한 채 Lv.50에 도달했다. 결국 스토커의 습격으로 장기간 활동을 중지하게 되는 엔딩이 즉시 진행된다.',false,'fatal:stalker',true);return}
 // 선택형 일반 엔딩은 365일차에 처음 열리고, 이후 465·565·665일차처럼 100일마다 다시 열린다.
 const checkpoint=optionalEndingCheckpoint();
 if(checkpoint===null)return;
 const cycleKey=`ending-cycle-v113:${checkpoint}`;
 if(state.endingPrompted[cycleKey])return;
 const result=endingProfile();
 offerEnding(result[0],`${checkpoint}일차 엔딩 선택 시점이다. ${result[1]} 지금까지의 길을 엔딩으로 남기거나 계속 성장할 수 있다. 계속 성장하면 ${checkpoint+OPTIONAL_ENDING_INTERVAL}일차에 다시 엔딩을 선택할 수 있다.`,false,cycleKey);
}
function offerEnding(name,text,force=false,offerKey=name,locked=false){if(state.endingPrompted[offerKey]&&!force)return;state.endingPrompted[offerKey]=true;state.pendingEnding={name,text,offerKey,locked:!!locked};save(false);displayPendingEnding()}
function displayPendingEnding(){if(!state.pendingEnding)return;const {name,text,locked}=state.pendingEnding;const choices=locked?[[`${name}을 확인한다`,()=>{state.pendingEnding=null;unlockEnding(name);runEndingStory(name,true);return `${name}이 시작된다.`}]]:[['최종 엔딩을 본다',()=>{state.pendingEnding=null;unlockEnding(name);runEndingStory(name,true);return `${name}을 선택했다.`}],['계속 성장한다',()=>{state.pendingEnding=null;save(false);return '아직 끝내지 않는다. 더 높은 무대를 향해 계속 나아가기로 했다.'}]];showDialogue(locked?'돌이킬 수 없는 결말':'운명의 선택',text,choices)}
function openEndingCollection(){
 const all=Object.keys(endingStories),unlocked=new Set((state.endings||[]).map(migrateEndingName)),owned=all.filter(name=>unlocked.has(name));
 const head=`<div class="ending-collection-summary"><b>엔딩 컬렉션</b><strong>${owned.length} / ${all.length}</strong><small>미해금 엔딩은 제목이 공개되지 않습니다.</small></div>`;
 const cards=all.map(name=>{const isUnlocked=unlocked.has(name),art=endingVisualFor(name);if(isUnlocked)return `<button class="info-card ending-replay ending-collection-card unlocked" data-ending-replay="${name}">${art?`<img src="${art}" alt="${name} 미리보기">`:''}<span><b>${name}</b><small>엔딩 이미지와 이야기 다시 보기</small></span></button>`;return `<button class="info-card ending-collection-card locked" data-ending-locked="1" aria-label="아직 해금되지 않은 엔딩">${art?`<div class="ending-locked-image"><img src="${art}" alt="" aria-hidden="true"><i>🔒</i></div>`:`<div class="ending-locked-placeholder">🔒</div>`}<span><b>???</b><small>미해금 엔딩 · 해금 후 제목 공개</small></span></button>`}).join('');
 showModal('엔딩 컬렉션',head+`<div class="ending-collection-grid">${cards}</div>`,'ending');
 $$('[data-ending-replay]').forEach(x=>x.onclick=()=>runEndingStory(x.dataset.endingReplay));
 $$('[data-ending-locked]').forEach(x=>x.onclick=()=>toast('아직 해금되지 않은 엔딩입니다.'));
}
function unlockEnding(name){if(!state.endings.includes(name)){state.endings.push(name);saveMetaEndings(state.endings);addHistory(`🏁 엔딩 해금 · ${name}`);save(false);if(typeof scheduleRankingEndingRecord==='function')scheduleRankingEndingRecord(name,state.day);toast(`${name} 해금!`)}}
function applyModalTheme(theme=''){
 const modal=$('#modal');if(!modal)return;
 [...modal.classList].filter(c=>c.startsWith('theme-')).forEach(c=>modal.classList.remove(c));
 if(theme)modal.classList.add(`theme-${theme}`)
}
function showModal(title,html,theme=''){if(typeof cleanupRankingRealtime==='function')cleanupRankingRealtime();const modal=$('#modal');if(modal.open)modal.close();if(!instagramLiveActive)modal.classList.remove('instagram-live-dialog');modal.classList.remove('ending-focus-modal','matgo-fullscreen','online-hwatu-modal');const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=false;applyModalTheme(theme);$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;modal.showModal();syncToastLayer()}
function showBlockingNotice(title,html,onConfirm){
 blockingNoticeActive=true;
 showModal(title,`${html}<button id="blockingNoticeConfirm" class="primary wide">확인</button>`);
 const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=true;
 const confirm=$('#blockingNoticeConfirm');if(confirm)confirm.onclick=()=>{blockingNoticeActive=false;if(closeButton)closeButton.hidden=false;closeModal(true);if(typeof onConfirm==='function')onConfirm()};
}
function closeModal(force=false){if(typeof cleanupRankingRealtime==='function')cleanupRankingRealtime();const modal=$('#modal');if(!force&&modal?.classList.contains('theme-matgo')&&window.matgoIsActive?.()){window.matgoRequestClose?.();return;}if(!force&&modal?.classList.contains('theme-online')&&gostopRoomCode){if(gostopLastStatus==='playing'&&!confirm('진행 중인 고스톱에서 나가면 게임에서 이탈합니다. 나갈까요?'))return;leaveGostopRoom(true,false,true);return}if(!force&&modal?.classList.contains('theme-online')&&songQuizRoomCode){if(songQuizLastStatus==='playing'&&!confirm('류현상 노래 맞추기 대전에서 나가면 현재 대전에서 이탈합니다. 나갈까요?'))return;leaveSongQuizRoom(true,false);return}if(!force&&modal?.classList.contains('theme-online')&&teamQuizRoomCode){if(teamQuizLastSnapshot?.status==='playing'&&!confirm('2vs2 퀴즈 대전에서 나가면 현재 팀 대전에서 이탈합니다. 나갈까요?'))return;leaveTeamQuizRoom(true,false);return}if(!force&&modal?.classList.contains('theme-online')&&onlineQuizRoomCode){leaveOnlineQuizRoom(true,false);return}if(instagramLiveActive&&!force)return;if(blockingNoticeActive&&!force)return;if(memoryGameActive&&!force){if(typeof activeTrainingAbort==='function'){activeTrainingAbort();return}endMiniGameUi()}if(force&&instagramLiveActive){instagramLiveActive=false;modal.classList.remove('instagram-live-dialog');const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=false}if(force&&blockingNoticeActive){blockingNoticeActive=false;const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=false}if(!memoryGameActive)document.documentElement.classList.remove('minigame-active');modal.classList.remove('drawer-dialog');modal.classList.remove('ending-focus-modal');modal.classList.remove('matgo-fullscreen');const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=false;if(modal.open)modal.close();syncToastLayer();if(endingMusicMode||customEndingBgm)exitEndingMusic();if(deferredPostAdvance&&!cardRevealPending)finishDeferredPostAdvance()}
function getLocationDialoguePool(loc){
 const contextual=pool=>(pool||[]).filter(line=>{if(!state.manager.hired&&/후라보노/.test(line))return false;const m=state.band.members;if(!m.guitar&&/B군/.test(line))return false;if(!m.bass&&/L군/.test(line))return false;if(!m.piano&&/J군/.test(line))return false;if(!m.drums&&/R군/.test(line))return false;return true});
 if(loc!=='practice')return contextual(dialogues[loc]);
 const members=Object.values(state.band.members).filter(Boolean);
 if(!members.length)return ['멤버가 없으니 오늘은 혼자 메트로놈과 싸워야 한다. 기계는 말대꾸를 안 해서 그나마 낫다.','빈 연습실은 조용했다. 류현상은 의자를 하나만 꺼내 놓고 혼자 보컬 루틴을 시작했다.','합주 이야기를 하기엔 아직 멤버가 없다. 오늘은 혼자서 곡의 빈칸을 채워 보기로 했다.'];
 if(members.length<4)return [`현재 합류한 멤버는 ${members.join('·')}이다. 아직 빈자리가 있지만 가능한 파트부터 천천히 맞춰 보기로 했다.`,`완전체 밴드는 아니지만 ${members.join('·')}와 기본 리듬을 확인했다. 없는 파트는 가이드 음원으로 채웠다.`,`연습실에는 ${members.length+1}명만 모였다. 류현상은 아직 오지 않은 멤버들의 자리를 상상하며 곡 구조를 정리했다.`];
 return contextual(dialogues.practice)
}
function actionDailyCount(dayKey,countKey){return Number(state.dailyUse?.[dayKey])===state.day?Math.max(0,Number(state.dailyUse?.[countKey])||0):0}
function actionCooldownDays(lastDay,days){return Math.max(0,days-(state.day-Number(lastDay??-99)))}
function actionHpShortage(baseCost){const need=effectiveHpCost(baseCost);return state.stats.hp<need?`체력 부족 · ${need} 필요`:''}
function buskingActionHp(band=false){const type=dayType(),weather=weatherInfo[state.weather];const raw=(band?24:18)+weather.hp+(type==='공휴일'?3:type==='주말'?1:0);return effectiveHpCost(raw)}
function recruitActionReason(){
 const defs=[
  {key:'guitar',cost:120000,ok:()=>fameLevel()>=5&&state.stats.vocal>=28},
  {key:'bass',cost:180000,ok:()=>fameLevel()>=10&&state.career.totalBusking>=3},
  {key:'piano',cost:250000,ok:()=>fameLevel()>=15&&state.stats.compose>=35},
  {key:'drums',cost:320000,ok:()=>fameLevel()>=20&&state.performanceCount>=2}
 ];
 const missing=defs.filter(x=>!state.band.members[x.key]);if(!missing.length)return '모든 멤버 영입 완료';
 const cooldown=actionCooldownDays(state.cooldowns.recruit,5);if(cooldown>0)return `${cooldown}일 후 모집 가능`;
 const hpReason=actionHpShortage(10);if(hpReason)return hpReason;
 const qualified=missing.filter(x=>x.ok());if(!qualified.length)return '멤버 영입 조건 부족';
 if(!qualified.some(x=>state.stats.money>=x.cost))return '오디션 비용 부족';
 return ''
}
function actionAvailability(key){
 let reason='';
 const meditationCount=actionDailyCount('meditationDay','meditationCount');
 const walkCount=actionDailyCount('walkDay','walkCount');
 const buskingCount=state.storeDaily.buskingDay===state.day?Math.max(0,Number(state.storeDaily.buskingCount)||0):0;
 switch(key){
  case 'meditate': reason=meditationCount>=2?'오늘 2/2회 완료':state.stats.stress<=0?'스트레스 없음':'';break;
  case 'meal': reason=(state.items.mealsToday||0)>=2?'오늘 2/2회 완료':state.stats.hp>=100?'체력 최대':state.stats.money<mealCost()?`식사비 부족 · ${mealCost().toLocaleString()}원 필요`:'';break;
  case 'moveHome': {const next=housingInfo[state.housing+1];reason=(state.economy?.debt||0)>0?'채무 상환 필요':state.housing>=housingInfo.length-1?'최고 등급 주거지':next&&state.stats.money<next[1]?`이사비 부족 · ${next[1].toLocaleString()}원 필요`:'';break}
  case 'work': {const nextStreak=state.economy.lastWorkDay===state.day?Math.max(1,state.economy.workStreak):state.economy.lastWorkDay===state.day-1?Math.max(1,state.economy.workStreak+1):1;const need=effectiveHpCost(Math.min(36,22+Math.max(0,nextStreak-1)*2),'work');reason=state.stats.hp<need?`체력 부족 · ${need} 필요`:'';break}
  case 'stockWork': {const need=effectiveHpCost(12,'stockWork');reason=state.stats.hp<need?`체력 부족 · ${need} 필요`:'';break}
  case 'fleaMarket': {const days=fleaMarketDaysUntilOpen();reason=days>0?`${days}일 후 개장`:'';break}
  case 'buyBakcas': reason=(state.items.bakcasBoughtToday||0)>=3?'오늘 3/3개 구매 완료':state.stats.money<15000?'돈 부족 · 15,000원 필요':'';break;
  case 'snack': reason=(state.items.snacksBoughtToday||0)>=3?'오늘 3/3개 완료':state.stats.hp>=100?'체력 최대':state.stats.money<2500?'돈 부족 · 2,500원 필요':'';break;
  case 'storePromo': reason=state.storeDaily.promoDay===state.day?'오늘 이용 완료':actionHpShortage(8);break;
  case 'customerPractice': reason=state.storeDaily.customerDay===state.day?'오늘 이용 완료':actionHpShortage(6);break;
  case 'vocal': reason=actionHpShortage(12);break;
  case 'compose': reason=actionHpShortage(10);break;
  case 'recruit': reason=recruitActionReason();break;
  case 'rehearse': reason=!state.band.formed?'완전체 밴드 필요':actionHpShortage(18);break;
  case 'arrange': reason=!state.band.formed?'완전체 밴드 필요':actionHpShortage(15);break;
  case 'acting': reason=state.day<366?'366일차부터 이용 가능':actionHpShortage(14);break;
  case 'repair': {const has=state.equipment.mic||state.equipment.amp;const needs=(state.equipment.mic&&state.equipmentDurability.mic<equipmentMaxDurability('mic'))||(state.equipment.amp&&state.equipmentDurability.amp<equipmentMaxDurability('amp'));reason=!has?'장비 없음':!needs?'장비 내구도 최대':state.stats.money<50000?'점검비 부족 · 50,000원 필요':'';break}
  case 'album': {const cd=actionCooldownDays(state.cooldowns.album,30);reason=(state.economy?.debt||0)>0?'채무 상환 필요':state.stats.vocal<35||state.stats.compose<30?'보컬 35·작곡 30 필요':cd>0?`${cd}일 후 발매 가능`:state.stats.money<5000000?'제작비 부족 · 500만원 필요':'';break}
  case 'busking': reason=!state.equipment.mic||!state.equipment.amp?'마이크·음향장비 필요':buskingCount>=2?'오늘 2/2회 완료':state.stats.hp<buskingActionHp(false)?`체력 부족 · ${buskingActionHp(false)} 필요`:'';break;
  case 'bandBusking': reason=!state.band.formed?'완전체 밴드 필요':!state.equipment.mic||!state.equipment.amp?'마이크·음향장비 필요':buskingCount>=2?'오늘 2/2회 완료':state.stats.hp<buskingActionHp(true)?`체력 부족 · ${buskingActionHp(true)} 필요`:'';break;
  case 'walk': reason=walkCount>=2?'오늘 2/2회 완료':'';break;
  case 'observe': reason=state.storeDaily.observeDay===state.day?'오늘 이용 완료':state.stats.vocal>=95?'보컬 일반 성장 최대':actionHpShortage(6);break;
  case 'flyerPromo': reason=state.storeDaily.flyerDay===state.day?'오늘 이용 완료':state.stats.money<20000?'전단비 부족 · 20,000원 필요':actionHpShortage(8);break;
  case 'audienceResearch': reason=state.preparation?.buskingInsight?'다음 버스킹 보너스 준비 완료':actionHpShortage(6);break;
  case 'stageRehearsal': reason=!concertRequirementMet()?'Lv.15·팬 5천·보컬 70 필요':state.preparation?.stageReady?'다음 무대 준비 완료':state.stats.money<50000?'대관비 부족 · 50,000원 필요':actionHpShortage(10);break;
  case 'audition': {const cd=actionCooldownDays(state.cooldowns.audition,7);reason=fameLevel()<10||state.stats.vocal<50?'Lv.10·보컬 50 필요':cd>0?`${cd}일 후 재도전`:actionHpShortage(20);break}
  case 'concert': {const cd=actionCooldownDays(state.cooldowns.concert,7);reason=!concertRequirementMet()?'Lv.15·팬 5천·보컬 70 필요':cd>0?`${cd}일 후 공연 가능`:actionHpShortage(28);break}
  case 'broadcast': {const cd=actionCooldownDays(state.cooldowns.broadcast,7);reason=!state.manager.hired?'후라보노 고용 필요':state.stats.vocal<85?'보컬 85 필요':cd>0?`${cd}일 후 출연 가능`:actionHpShortage(22);break}
  case 'fanmeeting': {const cd=actionCooldownDays(state.cooldowns.fanmeeting,20);reason=state.stats.fans<15000?'팬 15,000명 필요':!state.manager.hired?'후라보노 고용 필요':state.stats.money<300000?'운영비 부족 · 30만원 필요':cd>0?`${cd}일 후 개최 가능`:actionHpShortage(20);break}
  case 'national': {const missing=worldStarMissingRequirements();reason=missing.length?`${missing[0]}${missing.length>1?` 외 ${missing.length-1}개`:''}`:'';break}
  case 'songSurvival': {const cd=actionCooldownDays(state.minigames.songSurvivalLastDay,7);reason=state.day<SHOW_UNLOCK_DAY?`${SHOW_UNLOCK_DAY}일차부터`:cd>0?`${cd}일 후 재도전`:actionHpShortage(16);break}
  case 'quizShow': {const cd=actionCooldownDays(state.minigames.quizShowLastDay,7);reason=state.day<SHOW_UNLOCK_DAY?`${SHOW_UNLOCK_DAY}일차부터`:cd>0?`${cd}일 후 재도전`:actionHpShortage(8);break}
 }
 return {disabled:!!reason,reason}
}
function render(){
 $('#dayText').textContent=`${state.day}일차`;$('#timeText').textContent=`${['오전','오후','저녁','밤'][state.time]} · ${weatherLabel()}`;$('#levelText').textContent=fameLevel();$('#rankText').textContent=state.rank;
 const tops=[['♥ 체력','hp'],['♫ 보컬','vocal'],['✍ 작곡','compose'],['🎭 연기','acting'],['★ 인지도','fame']];$('#topStats').innerHTML=tops.map(([n,k])=>`<div class="stat-chip"><small>${n}</small><b>${k==='fame'?`${state.stats.fame.toLocaleString()} · Lv.${fameLevel()}`:state.stats[k].toLocaleString()}</b><div class="bar"><i style="width:${k==='fame'?fameLevel():Math.min(100,state.stats[k])}%"></i></div></div>`).join('');
 $('#resourceStats').innerHTML=[['돈',`${state.stats.money.toLocaleString()}원`],['채무',`${(state.economy.debt||0).toLocaleString()}원`],['팬',`${state.stats.fans.toLocaleString()}명`],['연기',state.stats.acting],['외모',state.stats.looks],['스트레스',state.stats.stress],['박칵스',`${state.items.bakcas}개`],['에너자이저',`${state.items.energizer||0}개`],['마이크',equipmentDurabilityText('mic')],['음향',equipmentDurabilityText('amp')],['보호장비',equipmentDurabilityText('battery')]].map(x=>`<div class="resource-row"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
 $('#mobileResources').innerHTML=[['💰','돈',`${state.stats.money.toLocaleString()}원`],['💳','채무',`${(state.economy.debt||0).toLocaleString()}원`],['👥','팬',`${state.stats.fans.toLocaleString()}명`],['🎭','연기',state.stats.acting],['✨','외모',state.stats.looks],['☁','스트레스',state.stats.stress],['⚡','박칵스',`${state.items.bakcas}개`],['🔋','에너자이저',`${state.items.energizer||0}개`],['🎤','마이크',equipmentDurabilityText('mic')],['🔊','음향',equipmentDurabilityText('amp')],['🧰','보호장비',equipmentDurabilityText('battery')]].map(([icon,label,value])=>`<div class="mobile-resource-chip"><span class="mobile-resource-icon">${icon}</span><span class="mobile-resource-label">${label}</span><b>${value}</b></div>`).join('');
 $('#scheduleList').innerHTML=`<li>현재: ${locations[state.location].name}</li><li>날씨: ${weatherLabel()} · ${dayType()}</li><li>집: ${housingInfo[state.housing][0]}</li><li>밴드 결속력: ${state.band.bond}</li><li>마이크: ${equipmentStatusText('mic')}</li><li>음향장비: ${equipmentStatusText('amp')}</li><li>보호 케이스: ${equipmentDurabilityText('battery')}</li>${energizerActive()?`<li>에너자이저: ${energizerRemainingDays()}일 남음 · 체력 소모 20% 감소</li>`:''}${state.manager.hired?`<li>후라보노 관계: ${state.manager.bond}</li>`:'<li>매니저: 미고용</li>'}`;
 $('#missionBox').innerHTML=`<p>팬 3,000명 달성</p><div class="progress"><span style="width:${Math.min(100,state.stats.fans/30)}%"></span></div><p>첫 앨범 발매 ${state.albums.length?'완료':'미완료'}</p><p>라이벌 스토리 ${state.rival.stage}/5</p>`;
 const homeHousingImages=['assets/images/home-basement.png','assets/images/home-oneroom.png','assets/images/home-duplex.png','assets/images/home-apartment.png','assets/images/home-penthouse.png'];const art=$('#characterArt');if(art){const src=outfitImage();if(!art.src.endsWith(src))art.src=src;}const scene=$('#scene');const specialKey=state.specialScene?.active?state.specialScene.key:null;const specialClassMap={iziViral:' special-izi-viral',waitedMoreViral:' special-waited-more-viral',day30Hair:' special-day30-hair',day60Workout:' special-day60-workout',day90Live:' special-day90-live',day120Chat:' special-day120-chat',day150Birthday:' special-day150-birthday',day180Archive:' special-day180-archive',day210Demo:' special-day210-demo',day240Meme:' special-day240-meme',day300Promise:' special-day300-promise',day330Mother:' special-day330-mother',day360Reflection:' special-day360-reflection',careerLv70:' special-career-lv70',careerLv80:' special-career-lv80',careerLv90:' special-career-lv90',actingExtra:' special-acting-extra',firstKissScene:' special-first-kiss-scene',hiddenGameOst:' special-hidden-game-ost',hiddenRadioDj:' special-hidden-radio-dj',hiddenDingo:' special-hidden-dingo',mysteriousMerchant:' special-mysterious-merchant',cardCollectorSpecial:' special-card-collector',cardTheft:' special-card-theft',hurabonoWeddingDay:' special-hurabono-wedding'};const specialLabelMap={iziViral:'수원역 · 특별 이벤트',waitedMoreViral:'명동 · 특별 이벤트',day30Hair:'자취방 · 30일 특별 이벤트',day60Workout:'자취방 · 60일 특별 이벤트',day90Live:'자취방 · 90일 특별 이벤트',day120Chat:'자취방 · 120일 특별 이벤트',day150Birthday:'생일 파티 · 150일 특별 이벤트',day180Archive:'자취방 · 180일 특별 이벤트',day210Demo:'연습실 · 210일 특별 이벤트',day240Meme:'자취방 · 240일 특별 이벤트',day300Promise:'공연장 · 300일 특별 이벤트',day330Mother:'카페 · 330일 특별 이벤트',day360Reflection:'자취방 · 360일 특별 이벤트',day400Fanmeet:'천안 JB아트홀 · 400일 특별 이벤트',day450ReturnSpring:'대전 · 다시 돌아 봄 · 450일 특별 이벤트',day500SchoolFestival:'고등학교 축제 · 500일 특별 이벤트',careerLv70:'대형 페스티벌 · 인지도 Lv.70 특별 이벤트',careerLv80:'전국 투어 · 인지도 Lv.80 특별 이벤트',careerLv90:'해외 쇼케이스 · 인지도 Lv.90 특별 이벤트',actingExtra:'연습실 · 사극 상인 엑스트라 특별 이벤트',firstKissScene:'뮤직비디오 촬영장 · 첫 키스신 특별 이벤트',hiddenGameOst:'카페 · 게임 OST 특별 이벤트',hiddenRadioDj:'라디오 스튜디오 · 특별 이벤트',hiddenDingo:'딩고 스튜디오 · 특별 이벤트',mysteriousMerchant:'이름 없는 골목 · 수상한 상인',cardCollectorSpecial:'자취방 앞 · 디지몬카드 전문 수집꾼',cardTheft:'자취방 · 카드 도난 사건',hurabonoWeddingDay:'웨딩홀 · 후라보노의 결혼식',restLooksNightmare:'자취방 · 휴식 랜덤 이벤트'};const specialClass=specialKey?(specialClassMap[specialKey]||''):'';const backgroundOnlyClass=specialKey&&specialSceneImageMap[specialKey]?' special-background-only':'';scene.className=`scene ${locations[state.location].cls} outfit-${state.outfit||0}${specialClass}${backgroundOnlyClass}`;scene.dataset.time=state.time;scene.style.setProperty('--spark-opacity',state.location==='stage'?'.58':state.location==='park'?'.46':'.32');const specialImage=specialKey?specialSceneImageMap[specialKey]:null;if(specialImage){const shade=specialKey==='mysteriousMerchant'?'linear-gradient(rgba(2,3,6,.10),rgba(2,3,6,.54))':'linear-gradient(rgba(4,6,10,.08),rgba(4,6,10,.38))';scene.style.setProperty('background-image',`${shade},url('${specialImage}')`,'important');scene.style.setProperty('background-position',specialKey==='mysteriousMerchant'?'center 38%':'center center','important');scene.style.setProperty('background-size',['mysteriousMerchant','cardCollectorSpecial','cardTheft','hurabonoWeddingDay','day330Mother','day360Reflection','day400Fanmeet','day450ReturnSpring','day500SchoolFestival','careerLv70','careerLv80','careerLv90','actingExtra','firstKissScene'].includes(specialKey)?'contain':'cover','important');scene.style.setProperty('background-repeat','no-repeat','important')}else if(state.location==='home'){const shade='linear-gradient(rgba(8,12,20,.10),rgba(8,12,20,.42))';const homeImage=homeHousingImages[Math.max(0,Math.min(homeHousingImages.length-1,Number(state.housing)||0))]||homeHousingImages[0];scene.style.setProperty('background-image',`${shade},url('${homeImage}')`,'important');scene.style.setProperty('background-position','center center','important');scene.style.setProperty('background-size','cover','important');scene.style.setProperty('background-repeat','no-repeat','important')}else{scene.style.removeProperty('background-image');scene.style.removeProperty('background-position');scene.style.removeProperty('background-size');scene.style.removeProperty('background-repeat')}bindScenePointer();$('#gameScreen').classList.toggle('story-lock',!!specialKey);$('#locationLabel').textContent=specialKey?(specialLabelMap[specialKey]||locations[state.location].name):locations[state.location].name;const basePool=getLocationDialoguePool(state.location);const d=state.dialogue||{name:'류현상',text:pick(basePool)};displayDialogue(d.name,d.text);if(state.pendingEnding)setTimeout(displayPendingEnding,0);
 const locationMarkup=Object.entries(locations).map(([k,v])=>`<button data-loc="${k}" class="${state.location===k?'active':''}" aria-pressed="${state.location===k}">${v.name}</button>`).join('');
 $('#locationButtons').innerHTML=locationMarkup;
 $('#mobileLocationButtons').innerHTML=locationMarkup;
 $('#mobileLocationText').textContent=`현재: ${locations[state.location].name}`;
 $$('[data-loc]').forEach(b=>b.onclick=()=>{
   if(state.specialScene?.active)return toast('진행 중인 특별 이벤트를 먼저 마쳐 주세요.');
   const next=b.dataset.loc;
   if(next===state.location){toast(`현재 ${locations[next].name}에 있습니다.`);return;}
   // 장소 이동은 무료지만, 도착한 장소의 돌발 스토리는 기존 확률로 판정한다.
   state.location=next;
   state.lastAction='move';
   state.dialogue={name:'류현상',text:pick(getLocationDialoguePool(next))};
   playSfx('move');
   save(false);render();
   const storyStarted=maybeStoryEvent('move');
   save(false);
   if(!storyStarted)toast(`${locations[next].name}으로 이동했습니다.`);
 });
 const visibleActions=actions[state.location].filter(([, ,k])=>state.day>=366||!['songSurvival','quizShow','acting'].includes(k));
 $('#actionButtons').innerHTML=visibleActions.map(([n,d,k])=>{if(k==='work'||k==='stockWork'){const job=storeJobInfo(k);n=`${n} · ${job.name} ${job.next?`${job.count}/${job.next}`:`${job.count}회`}`;}if(k==='buyBakcas')n=`${n} · ${state.items.bakcasBoughtToday||0}/3개`;if(k==='snack')n=`${n} · ${state.items.snacksBoughtToday||0}/3개`;if(k==='meditate')n=`${n} · ${actionDailyCount('meditationDay','meditationCount')}/2회`;if(k==='meal')n=`${n} · ${state.items.mealsToday||0}/2회 · 요리 15%`;if(k==='walk')n=`${n} · ${actionDailyCount('walkDay','walkCount')}/2회`;if(k==='fleaMarket')n=fleaMarketIsOpen()?'플리마켓 · 오늘 개장':`플리마켓 · D-${fleaMarketDaysUntilOpen()}`;const availability=actionAvailability(k),disabled=availability.disabled,label=n,drawerNew=k==='drawer'&&(state.drawer?.newPhotos||state.drawer?.newDiary);return `<button class="action-card${k==='fleaMarket'?' flea-market-action':''}${drawerNew?' has-collection-news':''}" data-action="${k}" aria-label="${label}${availability.reason?` · ${availability.reason}`:''}${drawerNew?' · 새 수집품 있음':''}" ${disabled?'disabled':''}><b>${label}${drawerNew?'<i class="collection-dot" aria-hidden="true"></i>':''}</b>${disabled?`<small class="action-disabled-reason">${availability.reason}</small>`:''}</button>`}).join('');$$('[data-action]').forEach(b=>b.onclick=()=>doAction(b.dataset.action));
}
function openFanCommunity(){const total=Object.values(state.fanGroups).reduce((a,b)=>a+b,0);showModal('팬 커뮤니티',`<div class="fan-group-grid"><div class="metric-card"><small>일반 팬</small><b>${state.fanGroups.regular.toLocaleString()}명</b></div><div class="metric-card"><small>열혈 팬</small><b>${state.fanGroups.enthusiast.toLocaleString()}명</b></div><div class="metric-card"><small>게이 팬</small><b>${state.fanGroups.gay.toLocaleString()}명</b></div><div class="metric-card"><small>해외 팬</small><b>${state.fanGroups.overseas.toLocaleString()}명</b></div></div><div class="info-card"><b>팬 유형 안내</b><p>팬 유형은 우열이나 능력치가 아니라 팬덤의 다양성을 보여 주는 분류입니다. 게이 팬은 희화화하지 않고 개별 취향과 전문성을 지닌 팬으로 등장합니다.</p><small>분류된 팬 ${total.toLocaleString()}명 / 전체 팬 ${state.stats.fans.toLocaleString()}명</small></div>`,'fan')}
const instagramLiveScenarios=[
 {
  id:'song-request',title:'즉석 노래 요청',prompt:'댓글창에 신청곡이 쏟아진다. 아직 목이 완전히 풀리지 않았지만 팬들은 짧게라도 라이브를 듣고 싶어 한다.',
  chats:[
   {user:'별빛현상',text:'오늘 하루가 너무 길었는데 목소리 들으니까 이제야 퇴근한 기분이에요. 가능하면 딱 한 소절만 불러주시면 안 될까요?'},
   {user:'longhair_music',text:'물고기자리 후렴 진짜 좋아해요. 완곡은 부담스러우면 기타 없이 짧게 불러주셔도 저는 충분히 행복할 것 같아요.'},
   {user:'현상뿐이야',text:'목 상태 안 좋으면 무리하지 마세요! 그래도 가수님이 그냥 흥얼거리는 것도 라이브로 들으면 음원보다 더 특별하단 말이에요.'},
   {user:'퇴근한팬',text:'지금 이어폰 끼고 조용히 기다리는 중이에요. 회사에서 힘들었던 거 노래 한 소절로 전부 잊고 싶습니다 ㅠㅠ'},
   {user:'digimon_vocal',text:'신청곡 너무 많아서 고민되시면 오늘 기분에 가장 가까운 노래를 골라 주세요. 현상님 선택을 듣고 싶어요.'},
   {user:'천안첫콘팬',text:'예전 작은 공연장에서 마이크 없이 불러주셨던 그 느낌 아직도 기억나요. 오늘도 그런 순간 하나만 남겨주세요.'},
   {user:'안경장발단',text:'노래 안 해도 괜찮다고 말하려고 들어왔는데 다들 신청하는 거 보니까 저도 듣고 싶어졌어요. 한 소절만요…!'}
  ],
  choices:[
   {label:'짧게 한 소절 불러준다',reply:'“목이 완전히 풀린 건 아닌데… 정말 짧게만 할게요.” 류현상은 기타를 가볍게 튕기고 후렴 한 소절을 진심껏 불렀다.',reaction:[
    {user:'별빛현상',text:'짧게만 한다더니 첫 음부터 감정이 너무 깊잖아요. 오늘 힘들었던 게 진짜로 조금 괜찮아졌어요.'},
    {user:'퇴근한팬',text:'이어폰으로 듣다가 그대로 멈췄어요. 라이브에서 숨 들이마시는 소리까지 들리니까 더 울컥합니다.'},
    {user:'longhair_music',text:'보컬 컨디션 좋을 때랑 다른 거친 느낌도 너무 좋아요. 이런 순간 때문에 라이브를 기다리는 것 같아요.'},
    {user:'현상뿐이야',text:'무리하지 말라고 해놓고 한 곡 더 외치고 싶은 마음을 참는 중입니다. 오늘은 여기까지만 해도 충분해요.'},
    {user:'천안첫콘팬',text:'작은 공연장에서 들었던 그때랑 똑같은 표정이에요. 오래 팬 하길 정말 잘했다는 생각이 들어요.'}
   ],effect:()=>state.stats.vocal>=70?{fanFactor:1.45,fame:2,hp:-2,note:'안정적인 라이브 한 소절로 댓글창이 뜨겁게 달아올랐다.'}:{fanFactor:1.0,fame:1,hp:-2,stress:1,note:'조금 흔들렸지만 팬들은 완벽함보다 솔직한 라이브를 반겼다.'}},
   {label:'오늘은 대화만 하자고 한다',reply:'“오늘은 노래보다 여러분 얘기를 조금 더 듣고 싶어요. 다음에 목 제대로 풀고 부를게요.”',reaction:[
    {user:'현상뿐이야',text:'이렇게 솔직하게 말해줘서 좋아요. 목 아픈데 억지로 부르는 것보다 오래 건강하게 노래해 주는 게 더 중요해요.'},
    {user:'별빛현상',text:'그럼 오늘 힘들었던 일 하나씩 말해도 되나요? 가수님이 읽어주는 것만으로도 위로가 될 것 같아요.'},
    {user:'퇴근한팬',text:'노래 방송도 좋지만 이렇게 조용히 이야기하는 날이 있어서 팬들이 더 가까워지는 것 같아요.'},
    {user:'digimon_vocal',text:'다음 라이브 신청곡 메모해두겠습니다. 오늘은 현상님 목 쉬는 날, 팬들 수다 떠는 날로 합시다.'},
    {user:'안경장발단',text:'대화만 한다더니 목소리가 편안해서 이것도 거의 ASMR이에요. 그냥 계속 이야기해 주세요.'}
   ],effect:()=>({fanFactor:.85,stress:-1,note:'무리하지 않고 팬들의 이야기를 들으며 편안한 방송을 이어 갔다.'})}
  ]
 },
 {
  id:'hate-comment',title:'악성 댓글 등장',prompt:'따뜻하던 댓글 사이로 노골적인 악성 댓글 하나가 반복해서 올라온다. 팬들은 대신 화를 내며 차단하라고 외친다.',
  chats:[
   {user:'music_truth99',text:'노래도 그 정도인데 팬들이 왜 좋아하는지 모르겠네요. 라이브 켜고 잘생긴 척하는 것도 솔직히 보기 불편합니다.'},
   {user:'현상보호단',text:'저 계정 아까부터 똑같은 말 반복하고 있어요. 현상님 읽지 말고 바로 차단해 주세요. 저희가 신고할게요.'},
   {user:'오래된청자',text:'가수님 표정 굳은 거 보여서 마음 아파요. 한 사람 때문에 오늘 좋은 방송 망치지 않았으면 좋겠어요.'},
   {user:'해외팬번역계',text:'악플은 팬들이 정리할 테니까 현상님은 평소처럼 이야기해 주세요. 좋은 댓글이 훨씬 많다는 걸 꼭 봐주세요.'},
   {user:'콘서트앞줄',text:'저런 말에 답해주면 상대가 원하는 대로 되는 것 같아요. 그래도 가수님 방식대로 차분하게 정리해도 괜찮아요.'},
   {user:'마이크보다떨림',text:'오늘 라이브 기다린 사람이 몇 명인데 한 명 때문에 종료하지 마세요. 여기 있는 사람들이 훨씬 진짜예요.'},
   {user:'팬카페지킴이',text:'계정 캡처했고 신고했습니다. 현상님은 혼자 버티지 말고 불편하면 바로 말해주세요.'}
  ],
  choices:[
   {label:'차분하게 자신의 생각을 말한다',reply:'“좋아하지 않을 수는 있어요. 다만 여기 있는 사람들까지 무시하는 말은 하지 않았으면 합니다.”',reaction:[
    {user:'오래된청자',text:'감정적으로 싸우지 않고 팬들까지 지켜줘서 고마워요. 저 말 한마디 때문에 더 오래 응원하고 싶어졌어요.'},
    {user:'현상보호단',text:'진짜 어른스럽게 말했어요. 괜히 제가 더 흥분했네요. 이제 저 계정은 신고하고 좋은 얘기만 합시다.'},
    {user:'콘서트앞줄',text:'좋아하지 않을 자유와 무례할 자유는 다르다는 걸 정확히 말해준 것 같아요. 오늘 답변 오래 기억할게요.'},
    {user:'해외팬번역계',text:'방금 말도 번역해서 해외 팬들에게 전달할게요. 모두 현상님이 흔들리지 않았다는 걸 알아줬으면 해요.'},
    {user:'마이크보다떨림',text:'표정은 차가운데 말은 누구보다 따뜻하네요. 오늘 라이브에서 또 팬이 될 이유를 하나 얻었습니다.'}
   ],effect:()=>({fanFactor:1.25,fame:1,stress:2,note:'악플에 휘둘리지 않고 팬과 방송의 선을 분명히 지켰다.'})},
   {label:'조용히 차단하고 방송을 이어간다',reply:'류현상은 잠시 화면을 누른 뒤 아무 말 없이 계정을 차단했다. “자, 다른 이야기하죠.”',reaction:[
    {user:'팬카페지킴이',text:'깔끔해서 좋습니다. 저런 사람에게 방송 시간을 더 쓰지 않는 게 가장 좋은 대응인 것 같아요.'},
    {user:'현상보호단',text:'차단 완료 확인! 이제 좋은 댓글로 화면을 꽉 채울게요. 오늘 저녁 뭐 드셨는지부터 알려주세요.'},
    {user:'오래된청자',text:'표정 조금 편해진 것 같아서 다행이에요. 불편한 건 참지 말고 바로 정리해도 됩니다.'},
    {user:'마이크보다떨림',text:'아무 일도 없었던 것처럼 넘어가는 것도 멋있네요. 여기 남은 사람들은 계속 좋은 이야기만 할게요.'},
    {user:'해외팬번역계',text:'채팅 분위기 다시 좋아졌어요. 해외 팬들도 하트 보내고 있으니까 화면 오른쪽 꼭 봐주세요.'}
   ],effect:()=>({fanFactor:.75,stress:-1,note:'악성 계정을 빠르게 차단하고 방송 분위기를 되찾았다.'})}
  ]
 },
 {
  id:'overseas-fans',title:'외국인 팬들의 인사',prompt:'해외 팬들이 여러 나라의 국기 이모티콘과 함께 인사를 남긴다. 댓글 번역 계정도 바쁘게 움직이기 시작한다.',
  chats:[
   {user:'Luna_Brazil',text:'Hello from Brazil! Your live voice reached me even though I am on the other side of the world. Please say hello to us!'},
   {user:'Tokyo_RyuFan',text:'일본에서 보고 있어요. 한국어를 열심히 공부해서 라이브 내용을 조금씩 알아듣고 있습니다. 오늘도 와줘서 고마워요.'},
   {user:'ParisLongHair',text:'프랑스 팬이에요! 자막이 없어도 노래할 때 감정은 전부 이해할 수 있어요. 언젠가 파리에서도 공연해주세요.'},
   {user:'해외팬번역계',text:'지금 브라질, 일본, 프랑스, 필리핀 팬들이 인사하고 있어요. 짧게라도 각 나라 팬들에게 답해주시면 바로 번역할게요.'},
   {user:'ManilaMelody',text:'I discovered you through a busking clip. Since then, I listen to your songs whenever I miss home. Thank you for singing.'},
   {user:'SeoulFanGuide',text:'해외 팬분들 댓글 너무 따뜻해요. 현상님 긴장하지 말고 아는 영어만 천천히 해도 다 좋아할 거예요.'},
   {user:'GlobalScarlet',text:'We do not need perfect English. We just want to hear your own words and know that you can see us here.'}
  ],
  choices:[
   {label:'서툰 영어로 직접 인사한다',reply:'“Hello… everyone. Thank you for watching from far away. I hope we meet on stage someday.”',reaction:[
    {user:'Luna_Brazil',text:'He spoke to us directly! Your English is more than enough because we can feel how sincere you are. Brazil loves you!'},
    {user:'Tokyo_RyuFan',text:'천천히 말해줘서 저도 다 알아들었어요. 언젠가 일본 공연에서 직접 이 말을 다시 듣고 싶습니다.'},
    {user:'ParisLongHair',text:'파리 공연 약속으로 받아들이겠습니다. 오늘 날짜 저장했어요. 그날까지 프랑스 팬들이 계속 기다릴게요.'},
    {user:'해외팬번역계',text:'방금 인사 여러 언어로 번역해서 올렸어요. 해외 팬 채팅 속도가 갑자기 두 배가 됐습니다.'},
    {user:'GlobalScarlet',text:'The pronunciation was careful and adorable, but the promise sounded serious. We will remember it.'}
   ],effect:()=>({fanFactor:1.35,fame:2,stress:1,note:'서툰 영어였지만 직접 전한 진심이 해외 팬들에게 빠르게 퍼졌다.'})},
   {label:'한국말로 천천히 감사 인사를 한다',reply:'“멀리서 제 노래를 찾아와 주셔서 정말 감사합니다. 언어가 달라도 노래로 오래 만나고 싶어요.”',reaction:[
    {user:'해외팬번역계',text:'천천히 말해주셔서 번역하기 정말 좋았어요. 지금 각 나라 팬 계정으로 바로 전달하고 있습니다.'},
    {user:'ManilaMelody',text:'I understood the feeling before reading the translation. Music really lets us meet without the same language.'},
    {user:'Tokyo_RyuFan',text:'말을 천천히 해주셔서 한국어 공부하는 팬들도 직접 이해할 수 있었어요. 배려해줘서 감사합니다.'},
    {user:'Luna_Brazil',text:'We will wait for the day your songs bring you to our country. Until then, we will keep sharing your music.'},
    {user:'SeoulFanGuide',text:'해외 팬들 반응 보니까 괜히 제가 다 뿌듯해요. 오늘 방송 정말 국제적이네요.'}
   ],effect:()=>({fanFactor:1.1,fame:1,note:'천천히 전한 감사 인사가 번역 계정을 통해 여러 나라로 퍼졌다.'})}
  ]
 },
 {
  id:'song-spoiler',title:'신곡 스포일러 요청',prompt:'팬들이 작업 중인 신곡을 조금만 들려달라고 조르기 시작한다. 제목 첫 글자부터 멜로디 한 음까지 온갖 협상이 이어진다.',
  chats:[
   {user:'신곡대기중',text:'발매일까지 기다릴 수 있다고 생각했는데 라이브 켜진 거 보니까 욕심나요. 멜로디 두 마디만 들려주시면 안 될까요?'},
   {user:'세계관분석팀',text:'제목 첫 글자만 알려주셔도 됩니다. 절대 과하게 추리하지 않겠다고 약속은 못 하지만 비밀은 지킬게요.'},
   {user:'가사한줄수집가',text:'가사가 완성 전이라도 한 단어만 공개해주세요. 그 단어로 발매일까지 팬들이 백 가지 해석을 만들어 놓겠습니다.'},
   {user:'후렴중독자',text:'작업 중인 화면 뒤에 코드가 살짝 보인 것 같은데 제가 잘못 본 거죠? 카메라 조금만 옆으로 돌려주세요.'},
   {user:'현상음악연구소',text:'스포를 원하면서도 완성된 곡을 처음 들을 때의 충격은 지키고 싶어요. 진짜 아주 조금만 부탁드립니다.'},
   {user:'앨범예약완료',text:'어차피 나오면 바로 살 건데 미리 듣는다고 손해는 없잖아요. 오히려 예약을 한 장 더 할 수도 있습니다.'},
   {user:'비밀지킬팬',text:'여기 있는 사람들 전부 입 무겁습니다. 물론 화면 녹화 중인 사람은 한 명쯤 있겠지만요…'}
  ],
  choices:[
   {label:'멜로디를 아주 조금 들려준다',reply:'류현상은 한참 고민하다 기타로 아직 제목도 없는 후렴의 두 마디만 조심스럽게 연주했다.',reaction:[
    {user:'신곡대기중',text:'두 마디인데 벌써 머릿속에서 계속 반복돼요. 끊긴 다음 부분을 상상하느라 오늘 잠 못 잘 것 같습니다.'},
    {user:'세계관분석팀',text:'코드 진행이 이전 앨범이랑 연결되는 것 같은데요? 지금부터 자료 정리 들어갑니다. 발매 전까지 분석글 열 개 예정.'},
    {user:'현상음악연구소',text:'아직 다듬는 중인 멜로디라 더 귀한 느낌이에요. 완성되면 감정선이 어떻게 바뀔지 정말 기대됩니다.'},
    {user:'앨범예약완료',text:'방금 예약 한 장 더 한다고 말했는데 진짜로 했습니다. 이제 반드시 이 멜로디가 앨범에 들어가야 합니다.'},
    {user:'비밀지킬팬',text:'녹화는 했지만 공개는 안 하고 혼자만 백 번 듣겠습니다. 이게 비밀을 지키는 건지는 모르겠네요.'}
   ],effect:()=>state.stats.compose>=60?{fanFactor:1.4,fame:2,stress:1,note:'짧은 멜로디만으로도 신곡에 대한 기대가 크게 높아졌다.'}:{fanFactor:.9,fame:1,stress:1,note:'아직 거친 멜로디였지만 팬들은 작업 과정을 함께 본 것에 만족했다.'}},
   {label:'발매일까지 비밀이라고 한다',reply:'“지금 들려주면 여러분이 너무 빨리 알아맞힐 것 같아서 안 됩니다. 완성된 곡으로 놀라게 해드릴게요.”',reaction:[
    {user:'세계관분석팀',text:'우리가 너무 잘 맞혀서 숨기는 거라고 긍정적으로 생각하겠습니다. 그럼 오늘부터 과거 게시물 다시 분석할게요.'},
    {user:'신곡대기중',text:'아쉽지만 완성된 곡으로 처음 듣는 순간도 중요하죠. 대신 발매일은 너무 늦지 않게 알려주세요.'},
    {user:'가사한줄수집가',text:'한 단어도 안 주다니 철벽이네요. 이 철벽까지 신곡 홍보라고 생각하고 기다리겠습니다.'},
    {user:'앨범예약완료',text:'자신 있게 놀라게 해준다고 했으니까 기대치가 더 올라갔어요. 약속 꼭 지켜주세요.'},
    {user:'후렴중독자',text:'카메라 뒤 코드 보려고 화면 밝기 올린 저를 반성합니다. 그냥 발매일까지 얌전히 기다릴게요.'}
   ],effect:()=>({fanFactor:1.0,stress:-1,note:'신곡을 숨긴 채 완성본에 대한 기대를 차분히 쌓았다.'})}
  ]
 },
 {
  id:'fan-advice',title:'팬의 고민 상담',prompt:'한 팬이 꿈을 계속 따라가도 될지 모르겠다는 긴 댓글을 남긴다. 빠르게 올라가던 채팅이 잠시 느려진다.',
  chats:[
   {user:'스물셋의봄',text:'현상님 저는 하고 싶은 일이 있는데 계속 실패해서 이제 그만둬야 하나 고민 중이에요. 주변에서는 현실을 보라고 하는데 마음은 아직 놓이지 않아요.'},
   {user:'조용한응원',text:'이 댓글 그냥 지나가지 않았으면 좋겠어요. 저도 비슷한 시간을 보내고 있어서 현상님이 어떻게 버텼는지 듣고 싶습니다.'},
   {user:'무명시절팬',text:'작은 공원에서 관객 몇 명 앞에 노래하던 때부터 봤어요. 그때 현상님이 어떤 마음으로 다음 날 다시 나왔는지 이야기해 주세요.'},
   {user:'오늘도버틴다',text:'성공한 뒤의 조언보다 아무도 알아주지 않을 때 버틴 사람의 이야기가 더 필요한 밤인 것 같아요.'},
   {user:'팬카페상담소',text:'정답을 달라는 게 아니라 그냥 혼자가 아니라는 말 한마디가 듣고 싶은 것 같아요. 천천히 답해 주세요.'},
   {user:'노래로사는중',text:'저도 음악을 준비하다 포기한 적이 있어서 댓글을 읽는데 마음이 아프네요. 현상님 말이 그 팬에게 오래 남았으면 좋겠습니다.'},
   {user:'스물셋의봄',text:'부담드리려는 건 아니에요. 그냥 오늘 라이브를 보다가 처음으로 누군가에게 솔직하게 말하고 싶어졌어요.'}
  ],
  choices:[
   {label:'자신의 무명 시절을 솔직히 들려준다',reply:'“나도 맞는 길인지 모르면서 계속했어요. 확신이 있어서가 아니라, 그만두고 나면 더 오래 후회할 것 같아서요.”',reaction:[
    {user:'스물셋의봄',text:'그만두지 말라는 말보다 후회하지 않을 만큼 해보라는 뜻으로 들렸어요. 오늘은 하루만 더 해보겠습니다. 정말 고마워요.'},
    {user:'무명시절팬',text:'예전 공원에서 아무도 안 멈춰도 다음 곡 부르던 모습이 떠올랐어요. 그 시간이 지금 누군가에게 답이 됐네요.'},
    {user:'조용한응원',text:'완벽한 조언이 아니라 진짜 경험을 말해줘서 더 와닿았어요. 저도 내일 해야 할 일을 다시 적어보려고 합니다.'},
    {user:'오늘도버틴다',text:'오늘 라이브 저장해두고 힘들 때 다시 볼게요. 가수님 노래뿐 아니라 버텨온 시간까지 좋아하게 됐습니다.'},
    {user:'팬카페상담소',text:'댓글창 전체가 조용히 응원하는 분위기가 됐어요. 한 사람의 고민을 가볍게 넘기지 않아줘서 감사합니다.'}
   ],effect:()=>({fanFactor:1.55,stress:1,note:'무명 시절의 솔직한 경험이 팬들에게 깊은 위로가 되었다.'})},
   {label:'짧은 노래로 마음을 전한다',reply:'류현상은 말 대신 기타를 들고, 실패한 날마다 혼자 불렀던 노래의 한 구절을 조용히 들려주었다.',reaction:[
    {user:'스물셋의봄',text:'말을 길게 하지 않아도 무슨 뜻인지 알 것 같아요. 울고 나니까 조금 가벼워졌습니다. 내일 다시 시작해볼게요.'},
    {user:'노래로사는중',text:'이런 순간 때문에 음악이 필요한 것 같아요. 같은 가사인데 오늘은 전혀 다른 이야기처럼 들렸어요.'},
    {user:'무명시절팬',text:'예전에 공원에서 들었던 곡이에요. 그때의 노래가 지금 누군가를 다시 일으켜 세우는 게 신기하고 뭉클합니다.'},
    {user:'조용한응원',text:'저도 화면 앞에서 같이 울었어요. 현상님이 노래를 계속해줘서 오늘 같은 순간이 생긴 것 같아요.'},
    {user:'오늘도버틴다',text:'이 라이브는 그냥 팬서비스가 아니라 작은 공연이네요. 오늘 받은 마음 오래 간직하겠습니다.'}
   ],effect:()=>state.stats.vocal>=75?{fanFactor:1.5,fame:1,hp:-1,note:'짧은 노래가 말보다 깊게 팬들의 마음에 닿았다.'}:{fanFactor:1.05,hp:-1,note:'완벽하지 않은 노래였지만 위로하려는 마음은 분명하게 전해졌다.'}}
  ]
 },
 {
  id:'broadcast-accident',title:'갑작스러운 방송 사고',prompt:'휴대전화 거치대가 미끄러지며 화면이 천장과 바닥을 번갈아 비춘다. 채팅창은 걱정과 웃음으로 순식간에 폭발한다.',
  chats:[
   {user:'천장첫팬',text:'가수님 어디 갔어요ㅋㅋ 지금 천장 조명이 주인공이 됐습니다. 그래도 목소리는 들리니까 상황 설명 부탁드려요.'},
   {user:'걱정많은팬',text:'휴대전화 떨어진 건가요? 다치지만 않았으면 괜찮아요. 급하게 줍다가 손 베이지 말고 천천히 확인하세요.'},
   {user:'캡처장인',text:'방금 화면 돌아가는 순간 캡처했는데 너무 역동적이에요. 오늘 라이브 대표 사진으로 써도 될 것 같습니다.'},
   {user:'안경장발단',text:'바닥에서 올려다보는 각도인데도 장발만 잠깐 보여서 다들 사람 있는 건 확인했습니다ㅋㅋ'},
   {user:'라이브고인물',text:'이런 게 생방송의 맛이죠. 편집된 영상에서는 절대 볼 수 없는 진짜 현상님 일상이라 재미있어요.'},
   {user:'후라보노호출',text:'후라보노님 보고 계시면 새 거치대 주문해주세요. 이 가수님은 장비보다 휴대전화를 먼저 점검해야 합니다.'},
   {user:'오늘의레전드',text:'아직 10분밖에 안 됐는데 벌써 오늘 라이브 레전드 장면 나왔네요. 종료만 하지 말아주세요.'}
  ],
  choices:[
   {label:'웃으며 다시 세우고 계속한다',reply:'“다들 천장 구경 잘했어요? 다음부터는 거치대부터 점검하겠습니다.” 류현상은 헛웃음을 지으며 화면을 다시 세웠다.',reaction:[
    {user:'천장첫팬',text:'천장 구경 비용은 다음 노래 한 소절로 받겠습니다ㅋㅋ 사고 나도 바로 농담하는 거 너무 자연스러워요.'},
    {user:'캡처장인',text:'방금 웃는 표정 제대로 캡처했습니다. 무표정 셀카 백 장보다 이 한 장이 훨씬 귀해요.'},
    {user:'후라보노호출',text:'거치대 점검 약속 채팅 증거 남았습니다. 다음 방송에서 또 떨어지면 팬들이 단체로 선물 보낼 거예요.'},
    {user:'라이브고인물',text:'사고를 민망해하지 않고 같이 웃어줘서 분위기가 더 좋아졌어요. 이게 진짜 생방송 매력입니다.'},
    {user:'오늘의레전드',text:'오늘 방송 제목은 천장과 류현상의 첫 합동 라이브로 정하겠습니다. 절대 지우지 말아주세요.'}
   ],effect:()=>({fanFactor:1.35,stress:-1,note:'방송 사고를 팬들과 함께 웃어넘기며 오히려 친근한 장면을 만들었다.'})},
   {label:'민망해서 빠르게 마무리한다',reply:'“오늘은 여기까지 해야겠네요. 다음에는 거치대부터 제대로 준비해서 올게요.”',reaction:[
    {user:'걱정많은팬',text:'당황했으면 오늘은 쉬어도 괜찮아요. 휴대전화랑 손 다친 곳 없는지 먼저 확인해 주세요.'},
    {user:'천장첫팬',text:'아쉽지만 오늘 천장 방송도 충분히 재밌었어요. 다음 라이브 약속 꼭 지켜주세요.'},
    {user:'라이브고인물',text:'생방송은 이런 날도 있는 거죠. 짧게 끝나도 들어와 준 것만으로 좋았습니다.'},
    {user:'후라보노호출',text:'다음 방송 전 거치대 검사 목록을 만들어야겠네요. 현상님 오늘은 푹 쉬세요.'},
    {user:'오늘의레전드',text:'짧았지만 임팩트는 가장 강한 라이브였습니다. 팬카페에서 오늘 장면 오래 이야기할 것 같아요.'}
   ],effect:()=>({fanFactor:.55,stress:2,note:'방송은 일찍 끝났지만 팬들은 당황한 모습마저 생방송의 추억으로 남겼다.',earlyEnd:true})}
  ]
 },
 {
  id:'appearance-question',title:'외모와 헤어스타일 질문',prompt:'오늘 헤어스타일과 안경에 관한 댓글이 계속 올라온다. 팬들은 카메라 가까이 와달라며 장난스럽게 요청한다.',
  chats:[
   {user:'장발보존위원회',text:'오늘 머리 묶은 방식 평소랑 조금 다른 것 같아요. 직접 한 건지 샵에서 받은 건지 자세히 보여주세요.'},
   {user:'안경광인',text:'안경이 조명에 반사돼서 눈이 잘 안 보여요. 딱 3초만 카메라 가까이 와주시면 안 될까요?'},
   {user:'피부비법궁금',text:'밤 라이브인데 피부가 왜 이렇게 멀쩡한가요. 관리 비법이 물 많이 마시는 거라는 평범한 답은 금지입니다.'},
   {user:'무표정연구소',text:'오늘은 평소보다 표정이 부드러워 보여요. 웃은 건지 조명이 좋은 건지 팬들 사이에서 의견이 갈리고 있습니다.'},
   {user:'셔츠단추감시',text:'검은 셔츠 정말 잘 어울려요. 옷장에 같은 셔츠가 몇 장인지 언젠가 꼭 공개해 주세요.'},
   {user:'노래도얼굴도팬',text:'외모 이야기만 해서 부담스러우면 바로 노래 얘기로 바꿔도 돼요. 그래도 오늘 스타일 좋은 건 말하고 싶었습니다.'},
   {user:'카메라앞줄',text:'실제 공연에서는 멀리 있어서 얼굴 잘 못 보는데 라이브에서는 가까이 볼 수 있어서 좋아요. 딱 한 번만 부탁드려요.'}
  ],
  choices:[
   {label:'카메라 가까이 다가가 장난친다',reply:'류현상은 말없이 카메라 가까이 다가가 안경을 한 번 밀어 올렸다. “이 정도면 됐죠?”',reaction:[
    {user:'안경광인',text:'됐냐고 묻지 마세요 이미 심장이 멈췄습니다. 안경 올리는 장면 때문에 오늘 라이브 다시보기 백 번 볼 예정이에요.'},
    {user:'장발보존위원회',text:'머리카락 결까지 확인 완료했습니다. 오늘 스타일링 담당자에게 감사패 전달하고 싶어요.'},
    {user:'무표정연구소',text:'분명 무표정이었는데 가까이 오니까 입꼬리 아주 조금 올라간 거 봤어요. 오늘 연구 결과 확정입니다.'},
    {user:'카메라앞줄',text:'공연 맨 앞줄보다 더 가까웠어요. 부탁 들어주셔서 감사합니다. 대신 다음에는 너무 갑자기 오지 마세요.'},
    {user:'노래도얼굴도팬',text:'외모 얘기 부담스러울까 걱정했는데 이렇게 장난으로 받아줘서 분위기가 좋아졌어요. 이제 노래 이야기합시다.'}
   ],effect:()=>state.stats.looks>=70?{fanFactor:1.5,fame:1,note:'짧은 카메라 팬서비스가 수많은 캡처와 공유를 만들어 냈다.'}:{fanFactor:1.0,stress:1,note:'조금 어색했지만 팬들은 드문 장난스러운 모습을 즐거워했다.'}},
   {label:'외모보다 노래를 봐달라고 한다',reply:'“얼굴은 오늘이 지나면 또 달라지지만 노래는 남잖아요. 그쪽을 더 오래 봐주세요.”',reaction:[
    {user:'노래도얼굴도팬',text:'이런 말 하는 사람이 노래도 얼굴도 다 좋은 게 문제예요. 그래도 가수님이 가장 중요하게 생각하는 게 뭔지 알겠어요.'},
    {user:'무명시절팬',text:'외모로 입문했어도 결국 노래 때문에 남는 팬들이 많아요. 저도 첫 버스킹 때 그랬습니다.'},
    {user:'장발보존위원회',text:'장발은 지키면서 노래도 오래 해주세요. 둘 중 하나만 고르라는 말은 아니니까 오해하지 마세요.'},
    {user:'안경광인',text:'진지한 말 하는데 안경 반사 때문에 눈이 안 보여서 조금 웃겼어요. 그래도 무슨 뜻인지는 잘 들었습니다.'},
    {user:'카메라앞줄',text:'다음 공연에서 얼굴보다 노래에 더 집중해볼게요. 그런데 가까이 보는 부탁도 가끔은 들어주세요.'}
   ],effect:()=>state.stats.vocal>=80?{fanFactor:1.2,fame:1,note:'음악에 대한 진지한 태도가 실력파 팬들에게 깊은 인상을 남겼다.'}:{fanFactor:.9,note:'진심은 전해졌고 팬들은 다음 무대에서 노래를 더 집중해 듣기로 했다.'}}
  ]
 },
 {
  id:'old-video',title:'팬이 과거 영상을 언급',prompt:'오래전 조회 수가 거의 없던 버스킹 영상이 다시 발견됐다. 팬들은 당시의 머리와 어색한 멘트를 하나씩 꺼내기 시작한다.',
  chats:[
   {user:'고고학팬',text:'201일 전 공원 버스킹 영상 찾았어요. 첫 곡 끝나고 아무도 박수 안 치니까 혼자 “괜찮습니다” 하던 장면 너무 마음 아프고 웃겨요.'},
   {user:'헤어역사학자',text:'그때 머리 묶은 고무줄 색이 지금이랑 똑같은데 설마 아직도 같은 걸 쓰는 건 아니죠?'},
   {user:'조회수17회',text:'예전 영상 조회 수 17회였는데 지금 팬들이 몰려가서 새로고침할 때마다 숫자가 올라가고 있어요.'},
   {user:'무명시절팬',text:'저 영상 현장에서 직접 봤어요. 관객은 적었지만 마지막 곡까지 정말 진심으로 불렀던 건 지금이랑 똑같았습니다.'},
   {user:'흑역사수집가',text:'곡 시작 전에 카메라 찾느라 10초 동안 허공 보는 장면이 제 최애예요. 절대 삭제하지 말아주세요.'},
   {user:'새로온팬',text:'최근 영상만 보다가 옛날 영상 보니까 여기까지 온 시간이 느껴져서 괜히 울컥했어요. 과거 영상 더 보고 싶어요.'},
   {user:'본인등판기대',text:'가수님 지금 댓글 읽고 표정 굳은 거 맞죠? 흑역사 인정하고 팬들이랑 같이 봐주세요.'}
  ],
  choices:[
   {label:'흑역사를 인정하고 함께 웃는다',reply:'“저때는 카메라가 어디 있는지도 몰랐어요. 머리도… 저건 누가 말렸어야 했는데.”',reaction:[
    {user:'흑역사수집가',text:'본인이 직접 인정해버리니까 더 소중해졌어요. 오늘부터 저 영상은 공식 흑역사이자 팬 필수 시청 자료입니다.'},
    {user:'조회수17회',text:'지금 조회 수 3천 넘었어요! 17회 중 몇 번이 본인 조회였는지도 오늘 솔직하게 공개해주세요.'},
    {user:'무명시절팬',text:'그때도 지금도 무대에 진심인 건 같아요. 달라진 걸 함께 웃을 수 있어서 오래 팬 한 보람이 있습니다.'},
    {user:'헤어역사학자',text:'머리는 지금 훨씬 좋아졌지만 그 시절 스타일도 시대의 기록입니다. 삭제 금지 요청합니다.'},
    {user:'새로온팬',text:'과거를 숨기지 않고 웃어줘서 더 친근해졌어요. 오늘부터 옛날 영상 정주행 시작하겠습니다.'}
   ],effect:()=>({fanFactor:1.35,stress:-1,note:'무명 시절의 어색한 모습을 팬들과 웃으며 소중한 기록으로 바꿨다.'})},
   {label:'그 영상은 잊어달라고 부탁한다',reply:'“그 영상은 알고리즘에서도, 여러분 기억에서도 조용히 사라졌으면 좋겠습니다.”',reaction:[
    {user:'고고학팬',text:'잊어달라는 말을 들으니까 더 보고 싶어졌어요. 죄송하지만 팬카페 인기글로 이미 올라갔습니다.'},
    {user:'흑역사수집가',text:'삭제 요청이 아니라 홍보 멘트로 이해했습니다. 지금 친구들에게 링크 공유 중이에요.'},
    {user:'새로온팬',text:'부끄러워하는 모습까지 귀여워서 영상보다 오늘 반응이 더 오래 남을 것 같아요.'},
    {user:'무명시절팬',text:'지우고 싶은 마음은 알지만 그 시간이 있었기에 지금이 있는 거니까 너무 미워하지 않았으면 해요.'},
    {user:'조회수17회',text:'잊어달라고 말한 순간 조회 수가 또 천 회 올랐습니다. 팬들에게 금지어는 효과가 없는 것 같아요.'}
   ],effect:()=>({fanFactor:1.05,looks:Math.random()<.05?1:0,stress:1,note:'부끄러워하는 반응까지 화제가 되며 과거 영상이 다시 공유됐다.'})}
  ]
 },
 {
  id:'live-challenge',title:'라이브 챌린지 요청',prompt:'요즘 유행하는 짧은 춤 챌린지를 해달라는 댓글이 빠르게 늘어난다. 춤에는 자신이 없지만 팬들의 기대는 점점 커진다.',
  chats:[
   {user:'챌린지영업팀',text:'지금 유행하는 손동작 챌린지 진짜 간단해요. 춤 못 춰도 15초면 끝나니까 한 번만 해주세요.'},
   {user:'몸치도사랑해',text:'잘하는 걸 보고 싶은 게 아니라 현상님이 어설프게 따라 하는 걸 보고 싶은 겁니다. 부담 갖지 마세요.'},
   {user:'릴스편집자',text:'지금 해주시면 제가 음악 맞춰서 예쁘게 편집할게요. 실패해도 팬들이 좋은 영상으로 만들어드립니다.'},
   {user:'노래벌칙제안',text:'챌린지 실패하면 벌칙으로 노래 한 소절 어떠세요? 어느 쪽이든 팬들은 이득입니다.'},
   {user:'장발움직임연구',text:'춤출 때 긴 머리가 어떻게 움직이는지 학술적으로 궁금합니다. 연구를 위해 꼭 필요해요.'},
   {user:'진지한보컬팬',text:'춤 부담스러우면 노래로 대신해도 괜찮아요. 가수님이 불편해하면서 억지로 하는 건 원하지 않습니다.'},
   {user:'조회수예언자',text:'오늘 챌린지 하면 내일 영상 조회 수 최소 십만 예상합니다. 팬 편집 계정들이 이미 대기 중이에요.'}
  ],
  choices:[
   {label:'어설프게라도 챌린지에 도전한다',reply:'류현상은 영상을 한 번 보고 따라 했지만 손과 발의 박자가 끝까지 따로 움직였다. 마지막에는 본인도 웃음을 참지 못했다.',reaction:[
    {user:'몸치도사랑해',text:'제가 원한 게 정확히 이겁니다. 완벽한 챌린지는 다른 사람이 하고 현상님은 오늘처럼 해주세요.'},
    {user:'릴스편집자',text:'영상 저장 완료했습니다. 박자 어긋난 부분까지 음악에 맞춰서 레전드 릴스로 만들어볼게요.'},
    {user:'장발움직임연구',text:'연구 결과 장발은 박자를 정확히 탔지만 주인은 실패했습니다. 그래도 시각적으로는 완벽해요.'},
    {user:'조회수예언자',text:'십만이 아니라 백만 갈 수도 있겠는데요? 마지막에 웃은 표정 때문에 반복 재생하게 됩니다.'},
    {user:'진지한보컬팬',text:'억지로 끌려간 표정이었는데 끝에는 같이 웃어서 다행이에요. 오늘 새로운 모습 보여줘서 고마워요.'}
   ],effect:()=>({fanFactor:1.4,fame:state.stats.looks>=70?2:1,hp:-2,stress:Math.random()<.5?-1:1,note:'서툰 챌린지가 오히려 친근한 매력으로 퍼지기 시작했다.'})},
   {label:'대신 즉석 노래를 들려준다',reply:'“춤은 다른 분들이 더 잘하니까 저는 제가 잘하는 걸로 하겠습니다.” 류현상은 챌린지 음악을 발라드처럼 바꿔 불렀다.',reaction:[
    {user:'노래벌칙제안',text:'챌린지를 거절하고 노래로 이기는 사람 처음 봤어요. 원곡보다 감정이 너무 깊어져서 웃기고 좋습니다.'},
    {user:'진지한보컬팬',text:'본인이 잘하는 방식으로 바꾼 게 훨씬 현상님다워요. 짧은 멜로디인데도 완전히 자기 노래가 됐어요.'},
    {user:'릴스편집자',text:'춤 영상 대신 발라드 챌린지로 편집하겠습니다. 오히려 새로운 유행을 만들 수 있을 것 같아요.'},
    {user:'챌린지영업팀',text:'춤은 못 봐서 아쉽지만 이런 대체안이면 인정합니다. 다음에는 손동작 하나 정도만 도전해주세요.'},
    {user:'조회수예언자',text:'이것도 충분히 퍼질 각이에요. 유행곡을 자기 스타일로 바꾸는 영상은 사람들이 계속 보게 됩니다.'}
   ],effect:()=>state.stats.vocal>=70?{fanFactor:1.35,fame:2,hp:-1,note:'유행 챌린지를 자신만의 발라드로 재해석해 큰 반응을 얻었다.'}:{fanFactor:.9,fame:1,hp:-1,note:'익숙한 노래 방식으로 팬들의 요청에 답했다.'}}
  ]
 },
 {
  id:'next-content',title:'팬들과 다음 활동 정하기',prompt:'팬들이 다음 라이브와 콘텐츠 주제를 직접 정하고 싶다고 말한다. 노래 방송과 작업실 방송 의견이 팽팽하게 나뉜다.',
  chats:[
   {user:'노래방송파',text:'다음 라이브는 신청곡 받아서 한 시간 노래 방송 해주세요. 팬들이 듣고 싶은 곡 미리 투표로 정하면 좋겠어요.'},
   {user:'작업실관찰자',text:'저는 작업실 방송이요! 멜로디 하나가 곡이 되는 과정이 궁금해요. 완성품보다 고민하는 시간이 보고 싶습니다.'},
   {user:'둘다원하는팬',text:'노래 방송 끝나고 10분만 작업 과정 보여주면 안 되나요? 팬들은 선택을 잘 못합니다. 둘 다 보고 싶어요.'},
   {user:'가사연구회',text:'작업실 방송하면 팬들이 댓글로 단어를 제안하고 그중 하나로 가사 만드는 코너도 재미있을 것 같아요.'},
   {user:'라이브음원파',text:'보정 없는 생목소리를 오래 듣고 싶어서 노래 방송에 한 표입니다. 중간에 쉬면서 팬 이야기 읽어도 좋아요.'},
   {user:'현상건강지킴이',text:'노래 방송은 목에 무리 갈 수 있으니까 컨디션 좋은 날만 해주세요. 작업실 방송은 조용히 오래 할 수 있을 것 같아요.'},
   {user:'투표관리자',text:'현재 댓글 집계는 노래 방송 51%, 작업실 방송 49%입니다. 가수님 한 표가 최종 결과를 정합니다.'}
  ],
  choices:[
   {label:'다음에는 노래 방송을 약속한다',reply:'“다음에는 목 관리 제대로 하고 신청곡 방송으로 올게요. 오늘 댓글에 나온 곡부터 정리해둘게요.”',reaction:[
    {user:'노래방송파',text:'약속 저장했습니다! 신청곡 목록 팬카페에 정리해서 올릴게요. 너무 어려운 곡은 양심적으로 제외하겠습니다.'},
    {user:'라이브음원파',text:'보정 없는 한 시간 라이브라니 벌써 기대돼요. 목 무리하지 않도록 중간 휴식 시간도 꼭 넣어주세요.'},
    {user:'현상건강지킴이',text:'약속은 좋지만 컨디션 안 좋으면 미뤄도 됩니다. 오래 노래하는 게 한 번 무리하는 것보다 중요해요.'},
    {user:'둘다원하는팬',text:'노래 방송 끝나고 작업실 5분만 보여주는 협상은 다음 라이브에서 다시 시도하겠습니다.'},
    {user:'투표관리자',text:'최종 결과 노래 방송 승리! 오늘부터 팬들이 신청곡 투표 준비에 들어갑니다.'}
   ],effect:()=>({fanFactor:1.25,nextVocalBonus:1,note:'다음 노래 방송 약속으로 팬들의 기대가 높아졌다. 다음 보컬 연습 보너스가 생겼다.'})},
   {label:'다음에는 작업실 방송을 약속한다',reply:'“완성된 곡만 보여드렸는데, 다음에는 만드는 과정도 조금 공개해볼게요. 대신 스포는 적당히 할 겁니다.”',reaction:[
    {user:'작업실관찰자',text:'드디어 작업실 방송! 막힌 부분에서 오래 고민하는 모습까지 보여주시면 창작하는 팬들에게 큰 도움이 될 것 같아요.'},
    {user:'가사연구회',text:'팬 단어 제안 코너 꼭 기억해주세요. 이상한 단어가 올라와도 현상님이 멋진 가사로 바꾸는 걸 보고 싶어요.'},
    {user:'노래방송파',text:'투표에서는 졌지만 작업실에서 짧게 흥얼거리는 장면이 나올 수 있으니 사실상 우리도 이득입니다.'},
    {user:'둘다원하는팬',text:'작업하다 완성된 후렴 한 번만 불러주시면 두 방송을 동시에 보는 셈이네요. 완벽한 선택입니다.'},
    {user:'투표관리자',text:'최종 결과 작업실 방송 승리! 다음 방송 전까지 팬들이 궁금한 질문을 모아두겠습니다.'}
   ],effect:()=>({fanFactor:1.25,nextComposeBonus:1,note:'작업 과정을 공개하겠다는 약속으로 다음 작곡 연습 보너스가 생겼다.'})}
  ]
 }
];
function instagramLiveActivityCount(){return Math.max(0,Number(state.sns?.totalPosts)||0)+Math.max(0,Number(state.sns?.totalLives)||0)}
function instagramLiveViewerCount(){const fans=Math.max(0,Number(state.stats.fans)||0),root=Math.sqrt(fans);return Math.max(18,Math.round(22+root*(3.6+Math.random()*1.8)))}
function instagramLiveBaseFanGain(){const fans=Math.max(0,Number(state.stats.fans)||0);let min=10,max=25;if(fans>=50000){min=70;max=160}else if(fans>=10000){min=40;max=100}else if(fans>=1000){min=20;max=50}return min+Math.floor(Math.random()*(max-min+1))}
function instagramLiveChatMarkup(chats=[]){return chats.map((chat,index)=>`<div class="ig-chat-line" style="--chat-index:${index}"><b>${chat.user}</b><span>${chat.text}</span></div>`).join('')}
function instagramLiveOutfitImage(){return outfitImage()}
function showInstagramLiveScreen(content){instagramLiveActive=true;showModal('',`<div class="ig-phone-shell">${content}</div>`);const modal=$('#modal'),close=$('#closeModal');modal?.classList.add('instagram-live-dialog');if(close)close.hidden=true;requestAnimationFrame(()=>{const feed=$('#igChatFeed');if(feed)feed.scrollTop=feed.scrollHeight})}
function closeInstagramLiveScreen(){instagramLiveActive=false;const modal=$('#modal'),close=$('#closeModal');modal?.classList.remove('instagram-live-dialog');if(close)close.hidden=false;closeModal(true)}
function instagramLivePhoneFrame({scenario,viewers,chats,body='',footer='댓글 달기…',result=false}){return `<div class="ig-phone${result?' result-mode':''}"><div class="ig-phone-speaker"></div><div class="ig-live-screen"><div class="ig-live-header"><div class="ig-profile-dot"><img src="${instagramLiveOutfitImage()}" alt=""></div><div><b>ryuhyunsang</b><small>류현상</small></div><span class="ig-live-badge">LIVE</span><span class="ig-live-viewers">◉ ${viewers.toLocaleString()}</span></div><div class="ig-live-camera"><div class="ig-live-glow"></div><img class="ig-live-character" src="${instagramLiveOutfitImage()}" alt="인스타 라이브 중인 류현상"><div class="ig-live-topic"><small>오늘의 라이브 상황</small><b>${scenario.title}</b></div><div id="igChatFeed" class="ig-live-chat">${instagramLiveChatMarkup(chats)}</div><div class="ig-live-hearts"><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i></div></div>${body}<div class="ig-live-footer"><span>${footer}</span><b>♡</b><b>▷</b></div></div><div class="ig-phone-homebar"></div></div>`}
function startInstagramLive(){
 if(state.day===state.sns.lastLiveDay)return toast('인스타 라이브는 하루에 한 번만 진행할 수 있습니다.');
 const before=snapshotStats();if(!costHp(3))return;
 const previous=state.sns.lastLiveScenario;const pool=instagramLiveScenarios.filter(x=>x.id!==previous);const scenario=pick(pool.length?pool:instagramLiveScenarios);
 const viewers=instagramLiveViewerCount(),baseHpCost=Math.abs((before.hp||0)-state.stats.hp);
 state.sns.lastLiveDay=state.day;state.sns.totalLives=(state.sns.totalLives||0)+1;state.sns.lastLiveScenario=scenario.id;
 const context={before,scenario,viewers,baseHpCost,startedDay:state.day};
 const choiceBody=`<div class="ig-live-situation"><p>${scenario.prompt}</p><div class="ig-live-choice-title">류현상은 어떻게 반응할까?</div><div class="ig-live-choice-grid">${scenario.choices.map((choice,index)=>`<button data-ig-choice="${index}">${choice.label}</button>`).join('')}</div></div>`;
 showInstagramLiveScreen(instagramLivePhoneFrame({scenario,viewers,chats:scenario.chats,body:choiceBody}));
 $$('[data-ig-choice]').forEach(button=>button.onclick=()=>resolveInstagramLiveChoice(context,Number(button.dataset.igChoice)));
 playSfx('tap');save(false)
}
function resolveInstagramLiveChoice(context,index){
 const {scenario}=context,choice=scenario.choices[index];if(!choice)return;
 const effect=choice.effect?choice.effect():{};const fanGain=Math.max(1,Math.round(instagramLiveBaseFanGain()*Math.max(0,Number(effect.fanFactor??1))+(Number(effect.fans)||0)));
 stat('fans',fanGain);if(effect.fame)stat('fame',effect.fame);if(effect.stress)stat('stress',effect.stress);if(effect.hp)stat('hp',effect.hp);if(effect.looks)stat('looks',effect.looks);
 if(effect.nextVocalBonus)state.sns.nextVocalBonus=Math.max(state.sns.nextVocalBonus||0,effect.nextVocalBonus);
 if(effect.nextComposeBonus)state.sns.nextComposeBonus=Math.max(state.sns.nextComposeBonus||0,effect.nextComposeBonus);
 const peak=Math.max(context.viewers,context.viewers+Math.floor(Math.random()*(Math.max(8,context.viewers*.35))));const duration=effect.earlyEnd?9+Math.floor(Math.random()*8):28+Math.floor(Math.random()*25);const changes=describeStatChanges(context.before)||'능력치 변화 없음';
 const resultBody=`<div class="ig-live-result-panel"><div class="ig-live-reply"><small>류현상의 답변</small><p>${choice.reply}</p></div><div class="ig-live-result-card"><b>라이브 방송 종료</b><div><span>방송 시간</span><strong>${duration}분</strong></div><div><span>최고 동시 시청자</span><strong>${peak.toLocaleString()}명</strong></div><div><span>방송 반응</span><strong>팬 +${fanGain.toLocaleString()}</strong></div><p>${effect.note||'팬들과 진솔하게 소통했다.'}</p><small>${changes}</small><button id="finishInstagramLive" class="primary wide">방송을 마친다</button></div></div>`;
 showInstagramLiveScreen(instagramLivePhoneFrame({scenario,viewers:peak,chats:choice.reaction||[],body:resultBody,footer:'라이브가 종료되었습니다',result:true}));
 addHistory(`📱 인스타 라이브 · ${scenario.title} · ${choice.label} · 팬 +${fanGain.toLocaleString()}`,`instagram-live:${context.startedDay}`);save(false);
 const finish=$('#finishInstagramLive');if(finish)finish.onclick=()=>{closeInstagramLiveScreen();showDialogue('인스타 라이브',`【${scenario.title}】\n\n${choice.reply}\n\n${effect.note||'팬들과 진솔하게 소통했다.'}`);advance(1)};
 playSfx('success')
}

function openSNS(){
 const canPost=state.day!==state.sns.lastPostDay;
 const canLive=state.day!==state.sns.lastLiveDay;
 const preview=snsPostReward({fans:20,fame:10,stress:0});
 const activity=instagramLiveActivityCount();
 showModal('SNS',`<div class="sns-dashboard"><div class="info-card sns-account-card"><b>팔로워·팬 ${state.stats.fans.toLocaleString()}명</b><p>게시물과 인스타 라이브로 팬들과 소통할 수 있습니다. 두 기능은 각각 하루에 한 번 이용할 수 있습니다.</p><small>전체 SNS 활동 ${activity}회 · 게시물 ${state.sns.totalPosts}회 · 인스타 라이브 ${state.sns.totalLives||0}회</small></div><div class="sns-action-grid"><div class="info-card"><b>게시물 올리기</b><p>팬이 많아질수록 게시물 확산력이 커져 팬·인지도 보상이 조금씩 증가합니다.</p><small>현재 팬 보상 배율 약 ${preview.fanMultiplier.toFixed(2)}배 · 인지도 배율 약 ${preview.fameMultiplier.toFixed(2)}배</small><button id="snsPost" ${canPost?'':'disabled'}>${canPost?'게시물 올리기':'오늘 게시 완료'}</button></div><div class="info-card instagram-live-entry"><b>인스타 라이브 방송</b><p>실시간 팬 채팅 속에서 10가지 상황 중 하나가 무작위로 발생합니다. 선택에 따라 방송 반응과 능력치가 달라집니다.</p><small>체력 -3 · 시간 +1 · 하루 1회 · 직전 상황은 연속 등장하지 않음</small><button id="startInstagramLive" class="primary" ${canLive?'':'disabled'}>${canLive?'LIVE 방송 시작':'오늘 라이브 완료'}</button></div></div><div class="card-list">${snsScenarios.slice(0,4).map(x=>`<div class="info-card"><b>${x.title}</b><p>${x.text}</p></div>`).join('')}</div></div>`,'sns');
 const b=$('#snsPost');
 if(b)b.onclick=()=>{
  if(!canPost)return;
  const ev=pick(snsScenarios),reward=snsPostReward(ev);
  state.sns.lastPostDay=state.day;state.sns.totalPosts++;
  const before=snapshotStats();
  stat('fans',reward.fans);stat('fame',reward.fame);stat('stress',reward.stress);
  addHistory(`📱 SNS 게시 · ${ev.title} · 팬 보상 ${reward.fanMultiplier.toFixed(2)}배`,`sns-post:${state.day}`);
  closeModal();
  showDialogue('SNS 반응',`【${ev.title}】\n\n${ev.text}\n\n현재 팬 규모에 따른 게시물 확산 보정이 적용됐다.`);
  advance(1);
  const changes=describeStatChanges(before);if(changes)appendStatChangesToDialogue(changes)
 };
 const live=$('#startInstagramLive');if(live)live.onclick=startInstagramLive
}
function openItemMenu(){
 const empty=state.items.bakcas<1;
 const dailyLimit=state.items.bakcasUsedToday>=2;
 const fullHp=state.stats.hp>=100;
 const disabled=empty||dailyLimit||fullHp;
 const reason=empty?'보유한 박칵스가 없습니다.':dailyLimit?'오늘 사용 횟수를 모두 소진했습니다.':fullHp?'체력이 이미 최대입니다.':'첫 사용은 체력 25, 두 번째 사용은 체력 20을 회복합니다.';
 const energizerCount=Math.max(0,Number(state.items.energizer)||0),dietCount=Math.max(0,Number(state.items.dietPill)||0),strongDietCount=Math.max(0,Number(state.items.strongDietPill)||0);
 const oneDietCost=effectiveHpCost(10),tenDietCost=effectiveHpCost(100),oneDietDisabled=dietCount<1||state.stats.hp<oneDietCost,tenDietDisabled=dietCount<10||state.stats.hp<tenDietCost;
 showModal('아이템',`<div class="card-list"><div class="info-card item-use-card"><b>⚡ 박칵스</b><p>보유 <strong>${state.items.bakcas}개</strong> · 오늘 <strong>${state.items.bakcasUsedToday}/2회</strong> 사용 · 현재 체력 <strong>${state.stats.hp}/100</strong></p><p>${reason}</p><button id="useBakcasFromItems" class="primary wide" ${disabled?'disabled':''}>박칵스 사용</button></div><div class="info-card item-use-card"><b>🔋 에너자이저</b><p>보유 <strong>${energizerCount}개</strong>${energizerActive()?` · 효과 ${energizerRemainingDays()}일 남음`:''}</p><p>먹으면 힘이 솟아날지도..</p><button id="useEnergizerFromItems" class="primary wide" ${energizerCount<1?'disabled':''}>${energizerCount<1?'보유 수량 없음':'에너자이저 사용'}</button></div><div class="info-card item-use-card"><b>💊 다이어트 알약</b><p>보유 <strong>${dietCount}알</strong></p><p>잘생겨질지도 모른다.</p><div class="choice-grid"><button id="useDietPillOne" ${oneDietDisabled?'disabled':''}>${dietCount<1?'보유 수량 없음':state.stats.hp<oneDietCost?`체력 부족 · ${oneDietCost} 필요`:'1알 먹기'}</button><button id="useDietPillTen" ${tenDietDisabled?'disabled':''}>${dietCount<10?`10알 필요 · 현재 ${dietCount}알`:state.stats.hp<tenDietCost?`체력 부족 · ${tenDietCost} 필요`:'10알 연속 먹기'}</button></div><small>1알당 체력 10·스트레스 2. 10알 연속 복용은 외모 감소 부작용 확률이 각 알약당 1%에서 1.5%로 소폭 증가합니다.</small></div><div class="info-card item-use-card"><b>💊 강력한 다이어트알약</b><p>보유 <strong>${strongDietCount}알</strong></p><p>굉장히 쎄보이는 다이어트약이다. 약이 잘들수도?</p><button id="useStrongDietPill" class="primary wide" ${strongDietCount<1?'disabled':''}>${strongDietCount<1?'보유 수량 없음':'1알 먹기'}</button></div></div>`,'items');
 const button=$('#useBakcasFromItems');if(button)button.onclick=()=>useBakcas(true);
 const energizerButton=$('#useEnergizerFromItems');if(energizerButton)energizerButton.onclick=useEnergizerItem;
 const dietOne=$('#useDietPillOne');if(dietOne)dietOne.onclick=()=>useDietPill(1);
 const dietTen=$('#useDietPillTen');if(dietTen)dietTen.onclick=()=>useDietPill(10);const strongDiet=$('#useStrongDietPill');if(strongDiet)strongDiet.onclick=useStrongDietPill
}
function openPhone(type){if(state.specialScene?.active)return toast('진행 중인 특별 이벤트를 먼저 마쳐 주세요.');if(type==='manager'){if(state.manager?.hired)toast(`후라보노 현재 관계 수치: ${state.manager.bond}`);managerEvent();}if(type==='band')showBand();if(type==='fan')openFanCommunity();if(type==='sns')openSNS();if(type==='items')openItemMenu()}
const BAND_MEMBER_META={
 guitar:{short:'B군',role:'기타',icon:'🎸',desc:'류현상보다 한 살 위 · 부산 사투리 · 강직하고 세심한 워커홀릭 작곡가 · 술을 좋아함'},
 bass:{short:'L군',role:'베이스',icon:'🎵',desc:'류현상 친동생의 절친 · 유머러스하고 부드러운 성격 · 평범한 말투 · 훤칠한 외모'},
 piano:{short:'J군',role:'피아노',icon:'🎹',desc:'말수가 극도로 적음 · 아주 약한 부산 억양 · 해산물을 무서워함 · 술이 들어가면 완전히 달라짐'},
 drums:{short:'R군',role:'드럼',icon:'🥁',desc:'에너지 넘치고 큰 소리와 리듬을 사랑하는 드러머'}
};
const BAND_MEMBER_TALKS={
 guitar:[
  {title:'후렴 기타 톤',lines:[['류현상','형, 오늘 후렴 기타 톤 좀 바뀌었지?'],['B군','맞나. 니 목소리 안 묻히게 중역 조금 깎아놨다.'],['류현상','내가 말도 안 했는데?'],['B군','같이 하는데 그 정도는 봐야지. 니는 노래나 똑바로 해라.']]},
  {title:'퇴근이 없는 사람',lines:[['류현상','형, 지금 새벽 두 시야. 아직도 작업해?'],['B군','이거 코드 한 군데만 잡고 잔다.'],['류현상','어제도 그 말 했잖아.'],['B군','어제는 어제고 오늘은 오늘이지. 마, 거의 다 됐다.'],['류현상','워커홀릭이라는 말이 괜히 붙은 게 아니네.']]},
  {title:'B군의 자작곡',lines:[['B군','현상아, 내가 멜로디 하나 적어놨는데 들어볼래?'],['류현상','형도 작곡 계속 하고 있었어?'],['B군','기타만 치면 손이 심심하다 아이가. 가사는 니가 좀 봐라.'],['류현상','이거 생각보다 되게 섬세한데?'],['B군','생각보다가 뭐고. 원래 섬세하다.']]},
  {title:'술 한잔',lines:[['B군','오늘 합주 끝나고 한잔할래?'],['류현상','형 내일 오전부터 작업 있다며.'],['B군','한잔이 두잔 되고 두잔이 세잔 되는 거지 뭐.'],['류현상','그게 문제잖아.'],['B군','그래도 술 마시고 작업은 안 한다. 그 선은 지킨다.']]},
  {title:'한 살 형',lines:[['류현상','형은 딱 한 살 위면서 가끔 열 살 위처럼 말해.'],['B군','한 살도 형은 형이다, 현상아.'],['류현상','그래서 잔소리하는 거야?'],['B군','잔소리 아이다. 니 목 아낄라고 하는 말이지. 따뜻한 물 좀 마셔라.']]},
  {title:'공연 전 체크리스트',lines:[['류현상','형 체크리스트 또 만들었어?'],['B군','기타, 케이블, 예비 줄, 니 목캔디, R군 스틱까지 적어놨다.'],['류현상','왜 내 것까지 챙겨?'],['B군','누가 빠뜨리면 결국 다 같이 고생한다 아이가. 미리 챙기는 게 편하다.']]},
  {title:'직설적인 피드백',lines:[['류현상','오늘 내 보컬 어땠어? 솔직하게.'],['B군','1절 좋고, 두 번째 후렴은 힘 너무 줬다. 그건 아니다.'],['류현상','진짜 바로 말하네.'],['B군','좋은 건 좋다 하고 아닌 건 아니라 해야 빨리 고치지. 대신 마지막 고음은 좋았다.']]},
  {title:'진짜 쉬는 날',lines:[['류현상','형 쉬는 날에는 진짜 쉬어?'],['B군','곡 쓰고 기타 정리하고 공연 영상 본다.'],['류현상','그게 일이잖아.'],['B군','돈 안 받으면 취미다.'],['류현상','그 논리는 처음 듣네.']]}
 ],
 bass:[
  {title:'친동생의 절친',lines:[['류현상','너 볼 때마다 내 동생 친구라는 게 좀 신기하다.'],['L군','저도요. 친구 형이랑 같은 밴드를 하게 될 줄 누가 알았겠어요.'],['류현상','내 얘기 많이 들었지?'],['L군','좋은 얘기만 들었습니다. 안 좋은 건 회식 때 풀게요.'],['류현상','그게 제일 불안한데.']]},
  {title:'훤칠한 베이시스트',lines:[['L군','형, 오늘 팬 한 분이 저한테 모델이냐고 물어봤어요.'],['류현상','뭐라고 했어?'],['L군','베이스 모델은 맞다고 했죠.'],['류현상','그 얼굴로 그런 아재개그 하지 마.'],['L군','얼굴이 아까우니까 말이라도 편하게 해야죠.']]},
  {title:'좋은 베이스',lines:[['류현상','좋은 베이스 연주는 뭐라고 생각해?'],['L군','없으면 허전하고, 있어도 너무 튀진 않는 거요.'],['류현상','좀 억울하지 않아?'],['L군','전 괜찮아요. 필요한 순간에 딱 들리면 그게 제일 멋있잖아요.']]},
  {title:'단체 채팅방',lines:[['류현상','단체방에서 네 답장이 제일 빠르더라.'],['L군','읽고 웃긴 게 생각나면 바로 보내는 편이라서요.'],['류현상','음악 얘기보다 짤이 더 많던데.'],['L군','분위기도 관리해야죠. 밴드의 복지는 제가 담당합니다.']]},
  {title:'오늘 합주 평가',lines:[['류현상','오늘 합주 어땠어?'],['L군','좋았어요. R군이 조금 빨랐고 B군 형 솔로가 조금 길었고, 형은 후렴 한 음이 살짝 낮았고요.'],['류현상','웃으면서 다 말하네.'],['L군','부드럽게 말하면 덜 아프잖아요.']]},
  {title:'밥 메뉴',lines:[['류현상','뭐 먹을래? 오늘은 내가 살게.'],['L군','형이 사면 아무거나 좋죠.'],['류현상','그게 제일 고르기 어렵다니까.'],['L군','그러면 제가 고를게요. 국밥. 실패 확률 0퍼센트입니다.']]},
  {title:'무대에서의 역할',lines:[['L군','형, 무대에서 제가 뒤에 있어도 잘 보이긴 하나 봐요.'],['류현상','키가 크니까 숨을 수가 없지.'],['L군','그럼 앞으로 베이스도 얼굴로 치겠습니다.'],['류현상','손으로 쳐. 제발.']]},
  {title:'밴드의 분위기',lines:[['류현상','우리 멤버들 성격 진짜 다 다르지.'],['L군','그래서 재밌죠. B군 형은 일하고, J군은 말 안 하고, R군은 시끄럽고.'],['류현상','너는?'],['L군','저는 그 사이에서 웃고 있습니다. 형도 좀 웃으세요.']]}
 ],
 piano:[
  {title:'말이 없는 이유',lines:[['류현상','J야, 넌 하루 종일 말 안 해도 안 답답해?'],['J군','안 답답합니다.'],['류현상','끝이야?'],['J군','예.'],['류현상','정말 끝이네.']]},
  {title:'해산물 공포',lines:[['류현상','회식 메뉴로 회 어때?'],['J군','안 됩니다.'],['류현상','알레르기 있어?'],['J군','아뇨. 무섭습니다. 특히 눈 있는 거.'],['류현상','먹는 게 아니라 보는 것도 싫어?'],['J군','예. 많이요.']]},
  {title:'새우의 시선',lines:[['J군','형.'],['류현상','왜?'],['J군','저기 새우 과자 봉지 그림… 치워주면 안 됩니까.'],['류현상','그림도 무서워?'],['J군','좀 그렇네예.'],['류현상','부산 말투 나올 정도로 무섭구나.']]},
  {title:'술 마신 다음 날',lines:[['류현상','어제 네가 탁자 위에서 R군 드럼 솔로 따라 한 거 기억나?'],['J군','…제가요?'],['류현상','그리고 B군한테 사랑한다고 세 번 했어.'],['J군','그만 말씀하이소.'],['류현상','평소 말 좀 해. 술 먹고 몰아서 하지 말고.']]},
  {title:'한 잔 들어가면',lines:[['류현상','너 술 마시면 왜 그렇게 사람이 바뀌냐?'],['J군','저도 모릅니다.'],['류현상','평소 열 마디 할 걸 한 시간에 다 하더라.'],['J군','다음엔 안 마시겠습니다.'],['류현상','지난번에도 그랬어.'],['J군','…예.']]},
  {title:'건반 소리',lines:[['류현상','오늘 피아노 소리 좋더라. 뭘 바꿨어?'],['J군','벨로시티 조금요.'],['류현상','설명 끝?'],['J군','패드도 아주 조금.'],['류현상','오늘 많이 말했네.'],['J군','그러네요.']]},
  {title:'공연 전 긴장',lines:[['류현상','긴장돼?'],['J군','조금요.'],['류현상','표정은 똑같은데.'],['J군','속은 아닙니다.'],['류현상','끝나고 뭐 먹을까?'],['J군','고기면 됩니다. 해산물만 아니면.']]},
  {title:'멤버들에 대한 평가',lines:[['류현상','멤버들 한마디씩 평가해봐.'],['J군','B군 형은 일 너무 많이 합니다.'],['류현상','L군은?'],['J군','잘생겼고… 편합니다.'],['류현상','R군은?'],['J군','시끄럽습니다.'],['류현상','나는?'],['J군','…노래 잘합니다.'],['류현상','마지막에 제일 오래 고민했네.']]}
 ],
 drums:[
  {title:'소음 측정기',lines:[['류현상','오늘은 좀 살살 쳐주면 안 될까?'],['R군','저 진짜 살살 치고 있는데요?'],['류현상','벽이 같이 떨리고 있어.'],['R군','벽도 리듬을 타는 거죠.']]},
  {title:'스틱 이야기',lines:[['류현상','스틱은 왜 이렇게 많이 들고 다녀?'],['R군','두 개는 연주용, 두 개는 예비, 두 개는 예비의 예비입니다.'],['류현상','나머지 여섯 개는?'],['R군','기분 전환용이요.']]},
  {title:'공연의 순간',lines:[['류현상','공연에서 제일 좋아하는 순간이 언제야?'],['R군','첫 카운트요. 제가 네 번 세면 다 같이 시작하잖아요.'],['류현상','의외로 멋있는 답인데.'],['R군','그리고 앙코르에서 템포 올릴 때요.'],['류현상','역시 뒤가 있었네.']]},
  {title:'체력 비결',lines:[['류현상','그렇게 두드리고도 왜 안 지쳐?'],['R군','공연 전에 밥 두 공기 먹습니다.'],['류현상','그게 비결이야?'],['R군','세 공기 먹으면 너무 졸려서 두 공기가 최적입니다.']]},
  {title:'메트로놈',lines:[['R군','메트로놈이 저를 자꾸 쫓아와요.'],['류현상','네가 빨라지는 거야.'],['R군','아뇨, 분명 기계가 느려지는 겁니다.'],['류현상','오늘도 메트로놈 편을 들어야겠네.']]},
  {title:'조용한 취미',lines:[['류현상','드럼 말고 조용한 취미는 없어?'],['R군','퍼즐 맞추기요.'],['류현상','진짜 의외다.'],['R군','근데 안 맞으면 책상을 두드립니다.'],['류현상','결국 조용하지 않네.']]},
  {title:'관객 반응',lines:[['R군','관객들이 손뼉 치는 박자 들으면 기분 좋지 않아요?'],['류현상','응. 무대 위에서만 들리는 느낌이 있지.'],['R군','그래서 가끔 제가 일부러 박자를 비워요. 관객 소리 들으려고.'],['류현상','그런 건 미리 말해 줘. 나 혼자 당황하잖아.']]},
  {title:'밴드의 미래',lines:[['류현상','우리 오래 할 수 있을까?'],['R군','형이 그만두자고 해도 저는 드럼 들고 따라갈 건데요.'],['류현상','드럼 세트를 들고?'],['R군','그래서 밴에 싣고 따라가겠습니다.'],['류현상','그건 좀 든든하네.']]}
 ]
};
function bandTalkUsedToday(key){return Number(state.bandTalk?.lastDay?.[key])===state.day}
function talkToBandMember(key){
 const member=state.band.members?.[key],meta=BAND_MEMBER_META[key],pool=BAND_MEMBER_TALKS[key];
 if(!member||!meta||!pool?.length)return toast('아직 합류하지 않은 멤버입니다.');
 if(bandTalkUsedToday(key))return toast(`${meta.short}과는 오늘 이미 충분히 이야기했습니다.`);
 const previous=Number(state.bandTalk?.lastTopic?.[key]??-1);
 const choices=pool.map((_,i)=>i).filter(i=>i!==previous);const topicIndex=pick(choices.length?choices:pool.map((_,i)=>i));const topic=pool[topicIndex];
 const before=state.band.bond;const gain=Math.random()<.3?2:1;state.band.bond=clamp(state.band.bond+gain);
 state.bandTalk.lastDay[key]=state.day;state.bandTalk.lastTopic[key]=topicIndex;
 addHistory(`💬 ${meta.short}과 대화 · ${topic.title} · 밴드 결속력 +${state.band.bond-before}`);
 save(false);playSfx('event');
 const lines=topic.lines.map(([speaker,text])=>`<div class="member-chat-line ${speaker==='류현상'?'ryu':'member'}"><b>${speaker}</b><p>${text}</p></div>`).join('');
 showModal(`${meta.short}과 대화 · ${topic.title}`,`<div class="member-chat-thread">${lines}</div><div class="member-chat-result">밴드 결속력 <b>+${state.band.bond-before}</b> · 현재 ${state.band.bond}</div><button id="backToBandMembers" class="primary wide">멤버창으로 돌아가기</button>`,'band');
 const back=$('#backToBandMembers');if(back)back.onclick=showBand;
}
function showBand(){
 const order=['guitar','bass','piano','drums'];
 const cards=order.map(k=>{const member=state.band.members[k],meta=BAND_MEMBER_META[k],used=bandTalkUsedToday(k);return `<div class="info-card band-member-card ${member?'joined':'empty'}"><div class="band-member-head"><span class="band-member-icon">${meta.icon}</span><div><b>${meta.short}</b><small>${meta.role}</small></div><strong>${member?'합류':'공석'}</strong></div>${member?`<p>${member}</p><small class="band-member-personality">${meta.desc||''}</small><button class="band-talk-btn" data-band-talk="${k}" ${used?'disabled':''}>${used?'오늘 대화 완료':'대화'}</button>`:'<p>아직 합류하지 않은 멤버입니다.</p>'}</div>`}).join('');
 showModal('밴드 멤버',`<div class="band-bond-summary"><span>현재 밴드 결속력</span><strong>${state.band.bond}</strong><small>멤버와 대화하면 하루에 멤버별 1회, 결속력이 소폭 증가합니다.</small></div><div class="card-list band-member-list">${cards}</div>`,'band');
 $$('[data-band-talk]').forEach(button=>button.onclick=()=>talkToBandMember(button.dataset.bandTalk));
}


// v142: Supabase-backed online community
const COMMUNITY_SUPABASE_URL='https://xhbnnebgcddfbvripzuy.supabase.co';
const COMMUNITY_SUPABASE_KEY='sb_publishable_Jbz_-RFUzO7XY4XsJXtmew_EPbB8xDp';
const COMMUNITY_CATEGORIES=['전체','자유','공략','엔딩 인증','버그 제보'];
let communityDb=null,communityUserId='',communityActiveCategory='전체',communityLoading=false;
function communityConfigured(){return !!(COMMUNITY_SUPABASE_URL&&COMMUNITY_SUPABASE_KEY)}
function communityNickname(){try{return localStorage.getItem('ryuCommunityNickname')||''}catch{return ''}}
function saveCommunityNickname(value){try{localStorage.setItem('ryuCommunityNickname',String(value||'').trim().slice(0,16))}catch{}if(typeof scheduleRankingSync==='function')scheduleRankingSync(true)}
function communityEsc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function communityText(value){return communityEsc(value).replace(/\n/g,'<br>')}
function communityDate(value){try{return new Intl.DateTimeFormat('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value))}catch{return ''}}
function communityErrorMessage(error){
 const raw=String(error?.message||error||'알 수 없는 오류');
 if(/anonymous|sign-?ins?.*disabled/i.test(raw))return 'Supabase의 익명 로그인이 꺼져 있습니다. Authentication에서 Anonymous Sign-In을 켜 주세요.';
 if(/relation .* does not exist|42P01/i.test(raw))return '게시판 테이블이 아직 없습니다. ZIP 안의 SUPABASE_SETUP.sql을 Supabase SQL Editor에서 한 번 실행해 주세요.';
 if(/row-level security|policy|permission denied/i.test(raw))return '게시판 RLS 정책이 설정되지 않았습니다. SUPABASE_SETUP.sql을 다시 확인해 주세요.';
 if(/Failed to fetch|NetworkError|fetch/i.test(raw))return '인터넷 연결 또는 Supabase 접속 상태를 확인해 주세요.';
 return raw;
}
async function ensureCommunityReady(){
 if(!communityConfigured())throw new Error('Supabase 연결 정보가 없습니다.');
 if(!window.supabase?.createClient)throw new Error('Supabase 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
 if(!communityDb)communityDb=window.supabase.createClient(COMMUNITY_SUPABASE_URL,COMMUNITY_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 let {data:{session},error}=await communityDb.auth.getSession();if(error)throw error;
 if(!session){const signed=await communityDb.auth.signInAnonymously();if(signed.error)throw signed.error;session=signed.data.session}
 communityUserId=session?.user?.id||'';return communityDb
}
function communityHeaderHtml(status='online'){
 const nick=communityNickname();
 return `<section class="community-hero"><div><small>RYU COMMUNITY</small><h3>류현상 키우기 커뮤니티</h3><p>실제 플레이어들과 공략, 엔딩, 게임 이야기를 나누는 온라인 게시판입니다.</p></div><span class="community-status ${status==='online'?'online':'offline'}">${status==='online'?'온라인':'연결 확인 중'}</span></section>
 <div class="community-tabs" aria-label="커뮤니티 게시판 분류">${COMMUNITY_CATEGORIES.map(x=>`<button data-community-category="${x}" class="${x===communityActiveCategory?'active':''}">${x}</button>`).join('')}</div>
 <section class="community-toolbar"><div><b>${nick?communityEsc(nick):'닉네임 미설정'}</b><small>${communityUserId?'익명 계정 연결됨':'익명 계정 연결 중'}</small></div><div><button id="communityProfileBtn">닉네임</button><button id="communityRefreshBtn">새로고침</button><button id="communityWriteBtn" class="primary">글쓰기</button></div></section>`
}
function communityLoadingHtml(){return `<div class="community-shell">${communityHeaderHtml('checking')}<section class="community-connect-card"><div class="community-board-icon">💬</div><h3>게시글을 불러오는 중...</h3><p>Supabase 게시판에 연결하고 있습니다.</p></section></div>`}
function communityErrorHtml(error){return `<div class="community-shell">${communityHeaderHtml('offline')}<section class="community-connect-card community-error-card"><div class="community-board-icon">⚠️</div><h3>커뮤니티에 연결하지 못했습니다.</h3><p>${communityEsc(communityErrorMessage(error))}</p><button id="communityRetryBtn" class="primary wide">다시 연결</button></section></div>`}
function communityCount(record,key){const v=record?.[key];if(Array.isArray(v))return Number(v[0]?.count||0);if(v&&typeof v==='object')return Number(v.count||0);return 0}
function communityPostCard(post){
 const likes=communityCount(post,'likes'),comments=communityCount(post,'comments');
 return `<button class="community-post-card" data-community-post="${post.id}"><div class="community-post-top"><span class="community-category">${communityEsc(post.category)}</span><time>${communityDate(post.created_at)}</time></div><h4>${communityEsc(post.title)}</h4><p>${communityEsc(String(post.content||'').replace(/\s+/g,' ').slice(0,120))}</p><div class="community-post-meta"><span>${communityEsc(post.nickname)}</span><span>♥ ${likes} · 댓글 ${comments}</span></div></button>`
}
async function openCommunity(){
 showModal('커뮤니티',communityLoadingHtml(),'community');
 try{await ensureCommunityReady();await loadCommunityPosts()}catch(error){renderCommunityError(error)}
}
function bindCommunityNav(){
 $$('[data-community-category]').forEach(btn=>btn.onclick=()=>{communityActiveCategory=btn.dataset.communityCategory;loadCommunityPosts()});
 const refresh=$('#communityRefreshBtn');if(refresh)refresh.onclick=()=>loadCommunityPosts();
 const profile=$('#communityProfileBtn');if(profile)profile.onclick=openCommunityProfile;
 const write=$('#communityWriteBtn');if(write)write.onclick=openCommunityWrite;
}
function renderCommunityError(error){if(!$('#modal')?.open)return;$('#modalTitle').textContent='커뮤니티';$('#modalBody').innerHTML=communityErrorHtml(error);const retry=$('#communityRetryBtn');if(retry)retry.onclick=openCommunity;bindCommunityNav()}
async function loadCommunityPosts(){
 if(communityLoading)return;communityLoading=true;
 try{
  await ensureCommunityReady();
  if($('#modal')?.open){$('#modalTitle').textContent='커뮤니티';$('#modalBody').innerHTML=communityLoadingHtml();bindCommunityNav()}
  let q=communityDb.from('posts').select('id,user_id,nickname,category,title,content,created_at,likes(count),comments(count)').order('created_at',{ascending:false}).limit(50);
  if(communityActiveCategory!=='전체')q=q.eq('category',communityActiveCategory);
  const {data,error}=await q;if(error)throw error;
  if(!$('#modal')?.open)return;
  $('#modalBody').innerHTML=`<div class="community-shell">${communityHeaderHtml('online')}<section class="community-board-list">${data?.length?data.map(communityPostCard).join(''):'<div class="community-empty"><b>아직 게시글이 없습니다.</b><p>첫 번째 글을 작성해 보세요.</p></div>'}</section></div>`;
  bindCommunityNav();$$('[data-community-post]').forEach(btn=>btn.onclick=()=>openCommunityPost(Number(btn.dataset.communityPost)));
 }catch(error){renderCommunityError(error)}finally{communityLoading=false}
}
function openCommunityProfile(){
 const nick=communityNickname();
 showModal('커뮤니티 닉네임',`<div class="community-form"><p>다른 플레이어에게 표시되는 닉네임입니다. 최대 16자.</p><input id="communityNicknameInput" maxlength="16" placeholder="닉네임 입력" value="${communityEsc(nick)}"><div class="community-form-actions"><button id="communityProfileBack">취소</button><button id="communityNicknameSave" class="primary">저장</button></div></div>`,'community');
 $('#communityProfileBack').onclick=openCommunity;$('#communityNicknameSave').onclick=()=>{const value=$('#communityNicknameInput').value.trim();if(!value)return toast('닉네임을 입력해 주세요.');saveCommunityNickname(value);toast(`커뮤니티 닉네임을 ${value}(으)로 저장했습니다.`);openCommunity()}
}
function communityGameSnapshot(){
 if(!$('#gameScreen')?.classList.contains('active'))return '';
 const fameLevel=Math.max(1,Math.min(100,Math.floor((state.stats?.fame||0)/100)+1));
 return `\n\n[게임 기록]\n${state.day}일차 · 인지도 Lv.${fameLevel} · 팬 ${(state.stats?.fans||0).toLocaleString()}명\n보컬 ${state.stats?.vocal||0} · 작곡 ${state.stats?.compose||0} · 외모 ${state.stats?.looks||0}`
}
function openCommunityWrite(){
 const nick=communityNickname();if(!nick){toast('먼저 커뮤니티 닉네임을 설정해 주세요.');openCommunityProfile();return}
 const defaultCat=communityActiveCategory==='전체'?'자유':communityActiveCategory;
 showModal('새 게시글',`<div class="community-form"><label>게시판<select id="communityPostCategory">${COMMUNITY_CATEGORIES.filter(x=>x!=='전체').map(x=>`<option ${x===defaultCat?'selected':''}>${x}</option>`).join('')}</select></label><label>제목<input id="communityPostTitle" maxlength="80" placeholder="제목을 입력하세요"></label><label>내용<textarea id="communityPostContent" maxlength="1200" rows="9" placeholder="내용을 입력하세요"></textarea></label><button id="communityAttachGame" class="community-secondary wide">현재 게임 기록 붙이기</button><div class="community-form-actions"><button id="communityWriteBack">취소</button><button id="communitySubmitPost" class="primary">등록</button></div></div>`,'community');
 $('#communityWriteBack').onclick=openCommunity;$('#communityAttachGame').onclick=()=>{const snap=communityGameSnapshot();if(!snap)return toast('게임 시작 후 사용할 수 있습니다.');const area=$('#communityPostContent');if(!area.value.includes('[게임 기록]'))area.value=(area.value+snap).slice(0,1200)};
 $('#communitySubmitPost').onclick=async()=>{const btn=$('#communitySubmitPost'),title=$('#communityPostTitle').value.trim(),content=$('#communityPostContent').value.trim(),category=$('#communityPostCategory').value;if(!title||!content)return toast('제목과 내용을 모두 입력해 주세요.');btn.disabled=true;btn.textContent='등록 중...';try{await ensureCommunityReady();const {error}=await communityDb.from('posts').insert({user_id:communityUserId,nickname:communityNickname(),category,title,content});if(error)throw error;playSfx('success');toast('게시글을 등록했습니다.');communityActiveCategory=category;await loadCommunityPosts()}catch(error){toast(communityErrorMessage(error));btn.disabled=false;btn.textContent='등록'} }
}
async function openCommunityPost(postId){
 showModal('게시글',`<div class="community-detail-loading">게시글을 불러오는 중...</div>`,'community');
 try{
  await ensureCommunityReady();
  const [postRes,commentRes,likeRes]=await Promise.all([
   communityDb.from('posts').select('*').eq('id',postId).single(),
   communityDb.from('comments').select('*').eq('post_id',postId).order('created_at',{ascending:true}),
   communityDb.from('likes').select('user_id').eq('post_id',postId)
  ]);
  if(postRes.error)throw postRes.error;if(commentRes.error)throw commentRes.error;if(likeRes.error)throw likeRes.error;
  renderCommunityPostDetail(postRes.data,commentRes.data||[],likeRes.data||[])
 }catch(error){renderCommunityError(error)}
}
function renderCommunityPostDetail(post,comments,likes){
 const mine=post.user_id===communityUserId,liked=likes.some(x=>x.user_id===communityUserId);
 const commentHtml=comments.length?comments.map(c=>`<article class="community-comment"><div><b>${communityEsc(c.nickname)}</b><time>${communityDate(c.created_at)}</time></div><p>${communityText(c.content)}</p>${c.user_id===communityUserId?`<button class="community-comment-delete" data-comment-delete="${c.id}">삭제</button>`:''}</article>`).join(''):'<div class="community-empty compact"><p>아직 댓글이 없습니다.</p></div>';
 $('#modalTitle').textContent='게시글';$('#modalBody').innerHTML=`<div class="community-post-detail"><button id="communityPostBack" class="community-back">← 목록으로</button><article class="community-post-main"><div class="community-post-top"><span class="community-category">${communityEsc(post.category)}</span><time>${communityDate(post.created_at)}</time></div><h3>${communityEsc(post.title)}</h3><div class="community-post-author">${communityEsc(post.nickname)}</div><div class="community-post-content">${communityText(post.content)}</div><div class="community-detail-actions"><button id="communityLikeBtn" class="${liked?'liked':''}">♥ ${likes.length}</button>${mine?'<button id="communityDeletePost">게시글 삭제</button>':''}</div></article><section class="community-comments"><h4>댓글 ${comments.length}</h4>${commentHtml}<div class="community-comment-write"><textarea id="communityCommentContent" maxlength="500" rows="3" placeholder="댓글을 입력하세요"></textarea><button id="communitySubmitComment" class="primary">댓글 등록</button></div></section></div>`;
 $('#communityPostBack').onclick=loadCommunityPosts;
 $('#communityLikeBtn').onclick=async()=>{const btn=$('#communityLikeBtn');btn.disabled=true;try{if(liked){const {error}=await communityDb.from('likes').delete().eq('post_id',post.id).eq('user_id',communityUserId);if(error)throw error}else{const {error}=await communityDb.from('likes').insert({post_id:post.id,user_id:communityUserId});if(error)throw error}await openCommunityPost(post.id)}catch(error){toast(communityErrorMessage(error));btn.disabled=false}};
 const del=$('#communityDeletePost');if(del)del.onclick=async()=>{if(!confirm('이 게시글을 삭제하시겠습니까? 댓글도 함께 삭제됩니다.'))return;del.disabled=true;try{const {error}=await communityDb.from('posts').delete().eq('id',post.id).eq('user_id',communityUserId);if(error)throw error;toast('게시글을 삭제했습니다.');loadCommunityPosts()}catch(error){toast(communityErrorMessage(error));del.disabled=false}};
 $('#communitySubmitComment').onclick=async()=>{const btn=$('#communitySubmitComment'),content=$('#communityCommentContent').value.trim(),nick=communityNickname();if(!nick)return toast('먼저 닉네임을 설정해 주세요.');if(!content)return toast('댓글 내용을 입력해 주세요.');btn.disabled=true;try{const {error}=await communityDb.from('comments').insert({post_id:post.id,user_id:communityUserId,nickname:nick,content});if(error)throw error;playSfx('success');await openCommunityPost(post.id)}catch(error){toast(communityErrorMessage(error));btn.disabled=false}};
 $$('[data-comment-delete]').forEach(btn=>btn.onclick=async()=>{if(!confirm('댓글을 삭제하시겠습니까?'))return;btn.disabled=true;try{const {error}=await communityDb.from('comments').delete().eq('id',Number(btn.dataset.commentDelete)).eq('user_id',communityUserId);if(error)throw error;await openCommunityPost(post.id)}catch(error){toast(communityErrorMessage(error));btn.disabled=false}})
}



// v178: Supabase realtime online rankings
const RANKING_TABS=[
 {id:'money',label:'재산',icon:'💰',key:'money',note:'현재 보유 현금이 높은 순위입니다.'},
 {id:'fans',label:'팬',icon:'👥',key:'fans',note:'현재 팬 수가 많은 순위입니다.'},
 {id:'looks',label:'외모',icon:'✨',key:'looks',note:'현재 외모 능력치가 높은 순위입니다.'},
 {id:'total',label:'종합',icon:'🎤',key:'total_score',note:'보컬 + 작곡 + 연기 + 외모 합산 점수입니다.'}
];
let rankingActiveTab='money',rankingLoading=false,rankingRealtimeChannel=null,rankingRealtimeTimer=null,rankingSyncTimer=null,rankingLastSyncAt=0,rankingSyncDisabledUntil=0;
function rankingModalIsOpen(){const m=$('#modal');return !!(m?.open&&m.classList.contains('theme-ranking'))}
function rankingErrorMessage(error){
 const raw=String(error?.message||error||'알 수 없는 오류'),code=String(error?.code||'');
 if(/anonymous|sign-?ins?.*disabled/i.test(raw))return 'Supabase의 Anonymous Sign-In을 켜 주세요.';
 if(/PGRST202|Could not find the function|relation .* does not exist|does not exist|schema cache|42P01/i.test(raw+' '+code))return `실시간 랭킹 DB 설정이 필요합니다. ZIP 안의 SUPABASE_RANKING_V179_SETUP.sql을 Supabase SQL Editor에서 한 번 실행해 주세요.\n[오류] ${raw}`;
 if(/row-level security|permission denied|42501/i.test(raw+' '+code))return `실시간 랭킹 DB 권한(RLS) 설정을 확인해 주세요. ZIP 안의 SUPABASE_RANKING_V179_SETUP.sql을 다시 실행해 주세요.\n[오류] ${raw}`;
 if(/Failed to fetch|NetworkError|fetch/i.test(raw))return '인터넷 연결 또는 Supabase 접속 상태를 확인해 주세요.';
 return `랭킹 오류: ${raw}${code?` (${code})`:''}`;
}
function rankingClamp(value,min,max){const n=Math.floor(Number(value)||0);return Math.max(min,Math.min(max,n))}
function rankingLatestSavedState(){
 try{
  const records=[readSave(AUTO_SAVE_KEY),...MANUAL_SAVE_KEYS.map(readSave)].filter(Boolean).sort((a,b)=>new Date(b.savedAt||0)-new Date(a.savedAt||0));
  return records[0]?.state||null;
 }catch{return null}
}
function rankingSourceState(){return $('#gameScreen')?.classList.contains('active')?state:rankingLatestSavedState()}
function rankingSnapshotFrom(source){
 if(!source?.stats)return null;const s=source.stats||{};
 const vocal=rankingClamp(s.vocal,0,100),compose=rankingClamp(s.compose,0,100),acting=rankingClamp(s.acting,0,100),looks=rankingClamp(s.looks,0,100);
 return {money:rankingClamp(s.money,0,1000000000000),fans:rankingClamp(s.fans,0,1000000000),looks,fame_level:rankingClamp(Math.floor((Number(s.fame)||0)/100)+1,1,100),vocal,compose,acting,total_score:vocal+compose+acting+looks,day:rankingClamp(source.day||1,1,1000000)}
}
function rankingValue(tab,row){if(tab==='money')return `₩${Number(row.money||0).toLocaleString()}`;if(tab==='fans')return `${Number(row.fans||0).toLocaleString()}명`;if(tab==='looks')return `${Number(row.looks||0)}점`;return `${Number(row.total_score||0)}점`}
function rankingMedal(rank){return rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':String(rank)}
function rankingDate(value){try{return new Intl.DateTimeFormat('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value))}catch{return ''}}
function rankingHeaderHtml(){
 const nick=communityNickname(),hasSave=!!rankingSourceState();
 return `<section class="ranking-hero"><div><small>LIVE LEADERBOARD</small><h3>류현상 키우기 실시간 랭킹</h3><p>재산·팬·외모·종합 능력치를 실시간으로 비교합니다. 엔딩 정보는 랭킹에 공개하지 않습니다.</p></div><span class="ranking-live-dot">● LIVE</span></section>
 <section class="ranking-profile"><div><small>내 닉네임</small><b>${nick?communityEsc(nick):'미설정'}</b><span>${hasSave?'현재/최근 저장 기록을 랭킹에 반영할 수 있습니다.':'저장된 게임이 없어 조회만 가능합니다.'}</span></div><div><button id="rankingNicknameBtn">닉네임</button><button id="rankingSyncBtn" ${nick&&hasSave?'':'disabled'}>내 기록 갱신</button><button id="rankingRefreshBtn">새로고침</button></div></section>
 <div class="ranking-tabs">${RANKING_TABS.map(t=>`<button data-ranking-tab="${t.id}" class="${t.id===rankingActiveTab?'active':''}">${t.icon} ${t.label}</button>`).join('')}</div>`
}
function rankingShellHtml(){return `<div class="ranking-shell">${rankingHeaderHtml()}<div id="rankingContent" class="ranking-content"><div class="ranking-loading">🏆 랭킹을 불러오는 중...</div></div></div>`}
function rankingBindShell(){
 $$('[data-ranking-tab]').forEach(b=>b.onclick=()=>{rankingActiveTab=b.dataset.rankingTab;$$('[data-ranking-tab]').forEach(x=>x.classList.toggle('active',x===rankingActiveTab));loadRankingTab()});
 const nick=$('#rankingNicknameBtn');if(nick)nick.onclick=openRankingNickname;
 const sync=$('#rankingSyncBtn');if(sync)sync.onclick=async()=>{sync.disabled=true;try{const ok=await submitRankingSnapshot();if(ok){toast('현재 게임 기록을 랭킹에 반영했습니다.');await loadRankingTab(true)}}catch(e){renderRankingError(e)}finally{if(sync)sync.disabled=false}};
 const refresh=$('#rankingRefreshBtn');if(refresh)refresh.onclick=()=>loadRankingTab();
}
function renderRankingError(error){if(!rankingModalIsOpen())return;const body=$('#modalBody');if(!body)return;body.innerHTML=`<div class="ranking-shell">${rankingHeaderHtml()}<section class="ranking-error"><div>⚠️</div><h3>실시간 랭킹에 연결하지 못했습니다.</h3><p>${communityText(rankingErrorMessage(error))}</p><button id="rankingRetryBtn" class="primary wide">다시 연결</button></section></div>`;rankingBindShell();const retry=$('#rankingRetryBtn');if(retry)retry.onclick=openRanking}
function openRankingNickname(){
 showModal('랭킹 닉네임',`<div class="community-form"><p>커뮤니티와 실시간 랭킹에서 공통으로 사용할 닉네임입니다. 최대 16자.</p><input id="rankingNicknameInput" maxlength="16" placeholder="닉네임 입력" value="${communityEsc(communityNickname())}"><div class="community-form-actions"><button id="rankingNicknameBack">취소</button><button id="rankingNicknameSave" class="primary">저장</button></div></div>`,'ranking');
 $('#rankingNicknameBack').onclick=openRanking;$('#rankingNicknameSave').onclick=()=>{const value=$('#rankingNicknameInput').value.trim();if(!value)return toast('닉네임을 입력해 주세요.');saveCommunityNickname(value);toast(`닉네임을 ${value}(으)로 저장했습니다.`);openRanking()}
}
async function submitRankingSnapshot({sourceState=null}={}){
 await ensureCommunityReady();const nick=communityNickname(),source=sourceState||rankingSourceState();if(!nick||!source)return false;const snap=rankingSnapshotFrom(source);if(!snap)return false;
 const payload={user_id:communityUserId,nickname:nick,...snap,updated_at:new Date().toISOString()};
 const {error}=await communityDb.from('leaderboard_profiles').upsert(payload,{onConflict:'user_id'});if(error)throw error;
 rankingLastSyncAt=Date.now();rankingSyncDisabledUntil=0;return true;
}
function scheduleRankingSync(force=false){
 if(Date.now()<rankingSyncDisabledUntil||!communityNickname()||!$('#gameScreen')?.classList.contains('active'))return;
 if(rankingSyncTimer)return;const wait=force?350:Math.max(600,20000-(Date.now()-rankingLastSyncAt));
 rankingSyncTimer=setTimeout(async()=>{rankingSyncTimer=null;try{await submitRankingSnapshot({sourceState:state})}catch(e){const raw=String(e?.message||e||'');if(/does not exist|42P01|PGRST202|permission denied|42501/i.test(raw))rankingSyncDisabledUntil=Date.now()+300000}},wait)
}
// v179: 엔딩은 스포일러 방지를 위해 온라인 랭킹에 전송하지 않습니다.
function scheduleRankingEndingRecord(){scheduleRankingSync(true)}
function rankingRowHtml(row,index,tab){
 const rank=index+1,me=row.user_id===communityUserId,detail=tab==='total'?`보컬 ${row.vocal||0} · 작곡 ${row.compose||0} · 연기 ${row.acting||0} · 외모 ${row.looks||0}`:`${Number(row.day||1).toLocaleString()}일차 · ${rankingDate(row.updated_at)}`;
 return `<article class="ranking-row ${rank<=3?'top-'+rank:''} ${me?'me':''}"><span class="ranking-place">${rankingMedal(rank)}</span><div class="ranking-player"><b>${communityEsc(row.nickname||'익명')}</b><small>${detail}</small></div><strong>${rankingValue(tab,row)}</strong></article>`
}
async function loadMetricRanking(tab,silent=false){
 const cfg=RANKING_TABS.find(t=>t.id===tab)||RANKING_TABS[0],target=$('#rankingContent');if(!target)return;if(!silent)target.innerHTML='<div class="ranking-loading">순위를 집계하는 중...</div>';
 let q=communityDb.from('leaderboard_profiles').select('user_id,nickname,money,fans,looks,fame_level,vocal,compose,acting,total_score,day,updated_at').order(cfg.key,{ascending:false}).order('day',{ascending:true}).limit(100);
 const listRes=await q;if(listRes.error)throw listRes.error;
 const meRes=communityUserId?await communityDb.from('leaderboard_profiles').select('user_id,nickname,money,fans,looks,fame_level,vocal,compose,acting,total_score,day,updated_at').eq('user_id',communityUserId).maybeSingle():{data:null,error:null};if(meRes.error)throw meRes.error;
 let myRank=null;if(meRes.data){const value=Number(meRes.data[cfg.key]||0);const countRes=await communityDb.from('leaderboard_profiles').select('*',{count:'exact',head:true}).gt(cfg.key,value);if(countRes.error)throw countRes.error;myRank=Number(countRes.count||0)+1}
 const rows=listRes.data||[],note=cfg.note;
 target.innerHTML=`<section class="ranking-note"><b>${cfg.icon} ${cfg.label} 랭킹</b><span>${note}</span><small>TOP 100 · 같은 수치일 경우 더 적은 플레이 일수가 먼저 표시됩니다.</small></section><div class="ranking-list">${rows.length?rows.map((r,i)=>rankingRowHtml(r,i,tab)).join(''):'<div class="ranking-empty">아직 등록된 기록이 없습니다.</div>'}</div>${meRes.data?`<section class="ranking-my-card"><span>내 순위</span><b>${myRank?.toLocaleString()||'-'}위 · ${communityEsc(meRes.data.nickname)}</b><strong>${rankingValue(tab,meRes.data)}</strong></section>`:`<section class="ranking-my-card muted"><span>내 순위</span><b>아직 랭킹에 기록이 없습니다.</b><small>닉네임을 정하고 ‘내 기록 갱신’을 눌러 주세요.</small></section>`}`;
}
async function loadRankingTab(silent=false){
 if(rankingLoading||!rankingModalIsOpen())return;rankingLoading=true;try{await ensureCommunityReady();await loadMetricRanking(rankingActiveTab,silent)}catch(e){renderRankingError(e)}finally{rankingLoading=false}
}
function cleanupRankingRealtime(){
 if(rankingRealtimeTimer){clearTimeout(rankingRealtimeTimer);rankingRealtimeTimer=null}
 if(rankingRealtimeChannel&&communityDb){try{communityDb.removeChannel(rankingRealtimeChannel)}catch{}}rankingRealtimeChannel=null
}
function queueRankingRealtimeRefresh(){
 if(!rankingModalIsOpen())return;if(rankingRealtimeTimer)clearTimeout(rankingRealtimeTimer);rankingRealtimeTimer=setTimeout(()=>{rankingRealtimeTimer=null;loadRankingTab(true)},500)
}
function startRankingRealtime(){
 cleanupRankingRealtime();if(!communityDb||!rankingModalIsOpen())return;
 rankingRealtimeChannel=communityDb.channel(`ryu-ranking-live-${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'leaderboard_profiles'},queueRankingRealtimeRefresh).subscribe()
}
async function openRanking(){
 showModal('실시간 랭킹',rankingShellHtml(),'ranking');rankingBindShell();
 try{await ensureCommunityReady();if(communityNickname()&&rankingSourceState())await submitRankingSnapshot();if(!rankingModalIsOpen())return;await loadRankingTab();startRankingRealtime()}catch(e){renderRankingError(e)}
}

// v143: 2-player realtime Ryu Hyunsang quiz battle
let onlineQuizRoomCode='';
let onlineQuizChannel=null;
let onlineQuizPollTimer=null;
let onlineQuizClockTimer=null;
let onlineQuizRefreshTimer=null;
let onlineQuizLobbyPollTimer=null;
let onlineQuizAdvanceLock=false;
let onlineQuizSubmitLock=false;
let onlineQuizFeedback=null;

function onlineQuizErrorMessage(error){
 const raw=String(error?.message||error||'알 수 없는 오류');
 const code=String(error?.code||'');
 if(/anonymous|sign-?ins?.*disabled/i.test(raw))return 'Supabase의 Anonymous Sign-In을 켜 주세요.';
 if(/PGRST202|Could not find the function|does not exist|schema cache|42P01/i.test(raw+' '+code))return `실시간 퀴즈 DB 함수/테이블을 찾지 못했습니다. ZIP 안의 SUPABASE_QUIZ_SETUP.sql과 SUPABASE_QUIZ_LOBBY_UPDATE.sql을 순서대로 실행해 주세요.\n[오류] ${raw}`;
 if(/row-level security|permission denied|42501/i.test(raw+' '+code))return `실시간 퀴즈 DB 권한(RLS) 오류입니다. ZIP 안의 퀴즈 SQL 2개를 다시 실행해 주세요.\n[오류] ${raw}`;
 if(/Failed to fetch|NetworkError|fetch/i.test(raw))return '인터넷 연결 또는 Supabase 접속 상태를 확인해 주세요.';
 return `퀴즈 대전 오류: ${raw}${code?` (${code})`:''}`;
}
async function onlineQuizHealthcheck(){
 // v148: quiz_healthcheck RPC 의존성 제거.
 // Supabase 연결/익명 로그인만 확인하고 실제 퀴즈 함수 존재 여부는 로비 RPC에서 검증한다.
 await ensureCommunityReady();
 return {ok:true};
}
function onlineQuizStoredRoom(){try{return localStorage.getItem('ryuOnlineQuizRoom')||''}catch{return ''}}
function saveOnlineQuizStoredRoom(code){try{if(code)localStorage.setItem('ryuOnlineQuizRoom',code);else localStorage.removeItem('ryuOnlineQuizRoom')}catch{}}
function onlineQuizClearTimers(){
 if(onlineQuizPollTimer){clearInterval(onlineQuizPollTimer);onlineQuizPollTimer=null}
 if(onlineQuizClockTimer){clearInterval(onlineQuizClockTimer);onlineQuizClockTimer=null}
 if(onlineQuizRefreshTimer){clearTimeout(onlineQuizRefreshTimer);onlineQuizRefreshTimer=null}
 if(onlineQuizLobbyPollTimer){clearInterval(onlineQuizLobbyPollTimer);onlineQuizLobbyPollTimer=null}
}
async function onlineQuizUnsubscribe(){
 if(onlineQuizChannel&&communityDb){try{await communityDb.removeChannel(onlineQuizChannel)}catch{}}
 onlineQuizChannel=null;
 onlineQuizClearTimers();
}
function onlineQuizScheduleRefresh(){
 if(!onlineQuizRoomCode||!$('#modal')?.open||!$('#modal')?.classList.contains('theme-online'))return;
 if(onlineQuizRefreshTimer)return;
 onlineQuizRefreshTimer=setTimeout(()=>{onlineQuizRefreshTimer=null;refreshOnlineQuizRoom()},90);
}
async function onlineQuizSubscribe(code){
 await onlineQuizUnsubscribe();
 if(!communityDb)return;
 onlineQuizChannel=communityDb.channel(`ryu-quiz-${code}-${communityUserId.slice(0,8)}`)
  .on('postgres_changes',{event:'*',schema:'public',table:'quiz_rooms',filter:`code=eq.${code}`},onlineQuizScheduleRefresh)
  .on('postgres_changes',{event:'*',schema:'public',table:'quiz_players',filter:`room_code=eq.${code}`},onlineQuizScheduleRefresh)
  .on('postgres_changes',{event:'*',schema:'public',table:'quiz_answers',filter:`room_code=eq.${code}`},onlineQuizScheduleRefresh)
  .subscribe();
 onlineQuizPollTimer=setInterval(()=>onlineQuizScheduleRefresh(),1500);
}
function onlineQuizLobbyHtml(message=''){
 const nick=communityNickname();const resume=onlineQuizStoredRoom();
 return `<div class="online-quiz-shell">
  <button id="onlineQuizBackHub" class="community-back">← 대전 종목 선택</button>
  <section class="online-quiz-hero"><div><small>REALTIME 1 VS 1</small><h3>게임 퀴즈 대전</h3><p>방 코드를 입력할 필요 없이 대기 중인 방을 골라 바로 입장합니다. 두 플레이어가 같은 문제 10개를 실시간으로 풉니다.</p></div><span class="online-live-badge">● LIVE</span></section>
  ${message?`<div class="online-quiz-notice">${communityEsc(message)}</div>`:''}
  <section class="online-quiz-profile"><span>대전 닉네임</span><strong>${communityEsc(nick||'미설정')}</strong><button id="onlineQuizNicknameBtn">닉네임 변경</button></section>
  ${resume?`<button id="onlineQuizResumeBtn" class="online-resume wide">진행 중인 대전 이어가기</button>`:''}
  <section class="online-quiz-lobby-card online-create-room"><b>새 공개방 만들기</b><p>방을 만들면 아래 대기방 목록에 자동으로 표시됩니다. 상대방은 입장 버튼만 누르면 됩니다.</p><button id="onlineQuizCreateBtn" class="primary wide" ${nick?'':'disabled'}>방 만들기</button></section>
  <section class="online-public-rooms"><header><div><b>대기 중인 방</b><small>1명이 기다리는 공개방만 표시됩니다.</small></div><button id="onlineQuizRefreshLobby">새로고침</button></header><div id="onlineQuizRoomList" class="online-room-list"><div class="online-room-loading">대기방을 불러오는 중...</div></div></section>
  <section class="online-quiz-rules"><b>대전 규칙</b><span>10문제</span><span>문제당 12초</span><span>첫 정답 100점</span><span>두 번째 정답 70점</span><span>오답 0점</span><span>본편 시간·능력치 소모 없음</span></section>
 </div>`
}
async function openOnlineQuiz(message=''){
 try{
  await onlineQuizHealthcheck();
  onlineQuizRoomCode='';onlineQuizFeedback=null;await onlineQuizUnsubscribe();
  showModal('온라인 대전',onlineQuizLobbyHtml(message),'online');
  bindOnlineQuizLobby();
 }catch(error){
  showModal('온라인 대전',`<div class="online-quiz-error"><b>온라인 대전을 연결하지 못했습니다.</b><p>${communityEsc(onlineQuizErrorMessage(error))}</p><button id="onlineQuizRetry" class="primary">다시 시도</button></div>`,'online');
  const retry=$('#onlineQuizRetry');if(retry)retry.onclick=()=>openOnlineQuiz();
 }
}
function openOnlineQuizNickname(){
 const nick=communityNickname();
 showModal('대전 닉네임',`<div class="community-form"><p>커뮤니티와 온라인 대전에서 함께 사용하는 닉네임입니다.</p><input id="onlineQuizNicknameInput" maxlength="16" placeholder="닉네임 입력" value="${communityEsc(nick)}"><div class="community-form-actions"><button id="onlineQuizNicknameBack">취소</button><button id="onlineQuizNicknameSave" class="primary">저장</button></div></div>`,'online');
 $('#onlineQuizNicknameBack').onclick=()=>openOnlineQuiz();
 $('#onlineQuizNicknameSave').onclick=()=>{const value=$('#onlineQuizNicknameInput').value.trim();if(!value)return toast('닉네임을 입력해 주세요.');saveCommunityNickname(value);toast('대전 닉네임을 저장했습니다.');openOnlineQuiz()};
}
function bindOnlineQuizLobby(){
 const backHub=$('#onlineQuizBackHub');if(backHub)backHub.onclick=openOnlineBattleHub;
 const nickBtn=$('#onlineQuizNicknameBtn');if(nickBtn)nickBtn.onclick=openOnlineQuizNickname;
 const create=$('#onlineQuizCreateBtn');if(create)create.onclick=createOnlineQuizRoom;
 const refresh=$('#onlineQuizRefreshLobby');if(refresh)refresh.onclick=()=>refreshOnlineQuizLobbyRooms(true);
 const resume=$('#onlineQuizResumeBtn');if(resume)resume.onclick=()=>enterOnlineQuizRoom(onlineQuizStoredRoom(),true);
 refreshOnlineQuizLobbyRooms();
 if(onlineQuizLobbyPollTimer)clearInterval(onlineQuizLobbyPollTimer);
 onlineQuizLobbyPollTimer=setInterval(()=>refreshOnlineQuizLobbyRooms(false),2500);
}
async function refreshOnlineQuizLobbyRooms(showToast=false){
 const target=$('#onlineQuizRoomList');if(!target||!communityDb)return;
 try{
  const {data,error}=await communityDb.rpc('quiz_list_open_rooms');if(error)throw error;
  const rooms=Array.isArray(data)?data:[];
  if(!rooms.length){target.innerHTML='<div class="online-room-empty"><b>지금 대기 중인 방이 없습니다.</b><span>새 공개방을 만들면 다른 플레이어에게 바로 표시됩니다.</span></div>';if(showToast)toast('대기 중인 방이 없습니다.');return}
  target.innerHTML=rooms.map(room=>`<article class="online-room-row"><div><b>${communityEsc(room.host_nickname||'익명')}님의 방</b><span>${Number(room.player_count)||1}/2 · 상대를 기다리는 중</span></div><button class="primary" data-online-room-join="${communityEsc(room.room_code)}">${room.is_mine?'이어가기':'입장'}</button></article>`).join('');
  $$('[data-online-room-join]').forEach(btn=>btn.onclick=()=>joinOnlineQuizRoomByCode(btn.dataset.onlineRoomJoin,btn));
  if(showToast)toast('대기방 목록을 새로고침했습니다.');
 }catch(error){target.innerHTML=`<div class="online-room-empty error"><b>대기방을 불러오지 못했습니다.</b><span>${communityEsc(onlineQuizErrorMessage(error))}</span></div>`}
}
async function createOnlineQuizRoom(){
 const btn=$('#onlineQuizCreateBtn');if(btn){btn.disabled=true;btn.textContent='방 만드는 중...'}
 try{await ensureCommunityReady();const {data,error}=await communityDb.rpc('quiz_create_room',{p_nickname:communityNickname()});if(error)throw error;playSfx('success');await enterOnlineQuizRoom(String(data||'').toUpperCase())}catch(error){toast(onlineQuizErrorMessage(error));if(btn){btn.disabled=false;btn.textContent='방 만들기'}}
}
async function joinOnlineQuizRoomByCode(code,btn=null){
 code=String(code||'').trim().toUpperCase();if(!code)return toast('입장할 방을 찾지 못했습니다.');
 if(!communityNickname()){toast('먼저 대전 닉네임을 설정해 주세요.');return openOnlineQuizNickname()}
 if(btn){btn.disabled=true;btn.textContent='입장 중...'}
 try{await ensureCommunityReady();const {data,error}=await communityDb.rpc('quiz_join_room',{p_code:code,p_nickname:communityNickname()});if(error)throw error;playSfx('success');await enterOnlineQuizRoom(String(data||code).toUpperCase())}catch(error){toast(onlineQuizErrorMessage(error));if(btn){btn.disabled=false;btn.textContent='입장'};refreshOnlineQuizLobbyRooms()}
}
async function enterOnlineQuizRoom(code,resume=false){
 if(!code)return openOnlineQuiz();
 try{
  await ensureCommunityReady();onlineQuizRoomCode=String(code).toUpperCase();saveOnlineQuizStoredRoom(onlineQuizRoomCode);onlineQuizFeedback=null;
  showModal('게임 퀴즈 대전',`<div class="online-quiz-loading">방 정보를 불러오는 중...</div>`,'online');
  await onlineQuizSubscribe(onlineQuizRoomCode);await refreshOnlineQuizRoom();
 }catch(error){onlineQuizRoomCode='';if(resume)saveOnlineQuizStoredRoom('');await openOnlineQuiz(onlineQuizErrorMessage(error))}
}
async function fetchOnlineQuizSnapshot(){
 const code=onlineQuizRoomCode;
 const [{data:room,error:roomError},{data:players,error:playersError}]=await Promise.all([
  communityDb.from('quiz_rooms').select('code,host_id,status,current_question,question_started_at,winner_id,created_at').eq('code',code).maybeSingle(),
  communityDb.from('quiz_players').select('user_id,nickname,ready,score,correct_count,joined_at,left_at').eq('room_code',code).order('joined_at',{ascending:true})
 ]);
 if(roomError)throw roomError;if(playersError)throw playersError;if(!room)throw new Error('방이 사라졌습니다.');
 let answers=[];if(room.status==='playing'){
  const result=await communityDb.from('quiz_answers').select('user_id,question_index,is_correct,points,answered_at').eq('room_code',code).eq('question_index',room.current_question);
  if(result.error)throw result.error;answers=result.data||[];
 }
 return {room,players:players||[],answers}
}
async function refreshOnlineQuizRoom(){
 if(!onlineQuizRoomCode||!$('#modal')?.open||!$('#modal')?.classList.contains('theme-online'))return;
 try{
  const snap=await fetchOnlineQuizSnapshot();
  if(snap.room.status==='waiting')renderOnlineQuizWaiting(snap);
  else if(snap.room.status==='playing')await renderOnlineQuizPlaying(snap);
  else renderOnlineQuizFinished(snap);
 }catch(error){
  if(/방이 사라졌습니다/.test(String(error?.message||error))){saveOnlineQuizStoredRoom('');onlineQuizRoomCode='';await onlineQuizUnsubscribe();return openOnlineQuiz('방이 종료되었습니다.')}
  const body=$('#modalBody');if(body)body.innerHTML=`<div class="online-quiz-error"><b>대전 정보를 불러오지 못했습니다.</b><p>${communityEsc(onlineQuizErrorMessage(error))}</p><button id="onlineQuizBackLobby">로비로</button></div>`;
  const back=$('#onlineQuizBackLobby');if(back)back.onclick=()=>leaveOnlineQuizRoom(false,true);
 }
}
function onlineQuizPlayerCard(player,room){
 const isMe=player.user_id===communityUserId,isHost=player.user_id===room.host_id;
 return `<div class="online-player-card ${isMe?'me':''} ${player.left_at?'left':''}"><div><b>${communityEsc(player.nickname)}</b>${isHost?'<span>방장</span>':''}${isMe?'<em>나</em>':''}</div><strong>${player.score||0}점</strong><small>${player.left_at?'나감':player.ready?'준비 완료':'대기 중'}</small></div>`
}
function renderOnlineQuizWaiting({room,players}){
 if(onlineQuizClockTimer){clearInterval(onlineQuizClockTimer);onlineQuizClockTimer=null}
 const me=players.find(p=>p.user_id===communityUserId);const active=players.filter(p=>!p.left_at);const host=room.host_id===communityUserId;const canStart=host&&active.length===2&&active.every(p=>p.ready);
 $('#modalTitle').textContent='게임 퀴즈 대전 · 대기실';
 $('#modalBody').innerHTML=`<div class="online-quiz-shell"><button id="onlineQuizBackPublicLobby" class="community-back">← 공개방 목록</button><div class="online-player-grid">${players.map(p=>onlineQuizPlayerCard(p,room)).join('')}${active.length<2?'<div class="online-player-card empty"><b>상대방을 기다리는 중...</b><small>공개방 목록에서 다른 플레이어가 바로 입장할 수 있습니다.</small></div>':''}</div><div class="online-waiting-actions"><button id="onlineQuizReadyBtn" class="${me?.ready?'ready':''}">${me?.ready?'준비 취소':'준비'}</button>${host?`<button id="onlineQuizStartBtn" class="primary" ${canStart?'':'disabled'}>대전 시작</button>`:'<span>방장이 시작하면 자동으로 대전이 시작됩니다.</span>'}<button id="onlineQuizLeaveBtn">방 나가기</button></div><p class="online-waiting-tip">두 명 모두 <b>준비 완료</b>가 되면 방장이 시작할 수 있습니다.</p></div>`;
 const backPublic=$('#onlineQuizBackPublicLobby');if(backPublic)backPublic.onclick=()=>leaveOnlineQuizRoom(true,true);
 $('#onlineQuizReadyBtn').onclick=async()=>{const b=$('#onlineQuizReadyBtn');b.disabled=true;try{const {error}=await communityDb.rpc('quiz_set_ready',{p_code:room.code,p_ready:!me?.ready});if(error)throw error;playSfx('click');onlineQuizScheduleRefresh()}catch(error){toast(onlineQuizErrorMessage(error));b.disabled=false}};
 const start=$('#onlineQuizStartBtn');if(start)start.onclick=async()=>{start.disabled=true;start.textContent='시작 중...';try{const {error}=await communityDb.rpc('quiz_start_room',{p_code:room.code});if(error)throw error;playSfx('success');onlineQuizFeedback=null;onlineQuizScheduleRefresh()}catch(error){toast(onlineQuizErrorMessage(error));start.disabled=false;start.textContent='대전 시작'}};
 $('#onlineQuizLeaveBtn').onclick=()=>leaveOnlineQuizRoom(true,true);
}
function onlineQuizScoreboard(players,room){
 return `<div class="online-scoreboard">${players.map(p=>`<div class="${p.user_id===communityUserId?'me':''}"><span>${communityEsc(p.nickname)}${p.user_id===room.host_id?' 👑':''}</span><strong>${p.score||0}</strong><small>정답 ${p.correct_count||0}</small></div>`).join('')}</div>`
}
async function renderOnlineQuizPlaying(snap){
 const {room,players,answers}=snap;const qres=await communityDb.rpc('quiz_get_current_question',{p_room_code:room.code});if(qres.error)throw qres.error;const q=Array.isArray(qres.data)?qres.data[0]:qres.data;if(!q)return;
 const options=Array.isArray(q.options)?q.options:[];const mine=answers.find(a=>a.user_id===communityUserId);const opponent=answers.find(a=>a.user_id!==communityUserId);const feedback=onlineQuizFeedback&&onlineQuizFeedback.question===room.current_question?onlineQuizFeedback:null;
 $('#modalTitle').textContent=`게임 퀴즈 대전 · ${room.current_question+1}/10`;
 $('#modalBody').innerHTML=`<div class="online-quiz-shell">${onlineQuizScoreboard(players,room)}<section class="online-question-card"><div class="online-question-top"><span>QUESTION ${room.current_question+1}</span><strong id="onlineQuizTime">12.0</strong></div><div class="online-timebar"><i id="onlineQuizTimeBar" style="width:100%"></i></div><h3>${communityEsc(q.question_text)}</h3><div class="online-answer-grid">${options.map((opt,i)=>`<button data-online-answer="${i}" ${mine?'disabled':''}>${i+1}. ${communityEsc(opt)}</button>`).join('')}</div>${feedback?`<div class="online-answer-feedback ${feedback.correct?'correct':'wrong'}"><b>${feedback.correct?`정답! +${feedback.points}점`:'오답!'}</b><span>정답: ${feedback.correctIndex+1}. ${communityEsc(options[feedback.correctIndex]||'')}</span></div>`:mine?`<div class="online-answer-feedback ${mine.is_correct?'correct':'wrong'}"><b>${mine.is_correct?`정답 +${mine.points}점`:'답변 완료'}</b><span>다음 문제를 기다리는 중...</span></div>`:''}<div class="online-opponent-state">상대방: ${opponent?'답변 완료':'답변 중...'}</div></section><button id="onlineQuizForfeitBtn" class="online-forfeit">대전 포기</button></div>`;
 $$('[data-online-answer]').forEach(btn=>btn.onclick=()=>submitOnlineQuizAnswer(room.current_question,Number(btn.dataset.onlineAnswer),options));
 $('#onlineQuizForfeitBtn').onclick=()=>{if(confirm('대전을 포기할까요? 상대방의 승리로 종료됩니다.'))leaveOnlineQuizRoom(true,true)};
 startOnlineQuizClock(room,answers.length,players.filter(p=>!p.left_at).length);
}
function startOnlineQuizClock(room,answeredCount,playerCount){
 if(onlineQuizClockTimer)clearInterval(onlineQuizClockTimer);
 const tick=()=>{
  const started=new Date(room.question_started_at).getTime();const remain=Math.max(0,12-(Date.now()-started)/1000);const text=$('#onlineQuizTime'),bar=$('#onlineQuizTimeBar');if(text)text.textContent=remain.toFixed(1);if(bar)bar.style.width=`${Math.max(0,Math.min(100,remain/12*100))}%`;
  if((answeredCount>=playerCount||remain<=0)&&!onlineQuizAdvanceLock){onlineQuizAdvanceLock=true;setTimeout(()=>advanceOnlineQuizRoom(),answeredCount>=playerCount?900:40)}
 };
 tick();onlineQuizClockTimer=setInterval(tick,160);
}
async function submitOnlineQuizAnswer(questionIndex,answerIndex,options){
 if(onlineQuizSubmitLock)return;onlineQuizSubmitLock=true;$$('[data-online-answer]').forEach(b=>b.disabled=true);playSfx('click');
 try{
  const {data,error}=await communityDb.rpc('quiz_submit_answer',{p_room_code:onlineQuizRoomCode,p_question_index:questionIndex,p_answer_index:answerIndex});if(error)throw error;const result=Array.isArray(data)?data[0]:data;
  onlineQuizFeedback={question:questionIndex,correct:!!result?.result_correct,points:Number(result?.result_points)||0,correctIndex:Number(result?.result_correct_index)||0};playSfx(onlineQuizFeedback.correct?'success':'fail');onlineQuizScheduleRefresh();
 }catch(error){toast(onlineQuizErrorMessage(error));onlineQuizScheduleRefresh()}finally{onlineQuizSubmitLock=false}
}
async function advanceOnlineQuizRoom(){
 try{if(!onlineQuizRoomCode)return;const {error}=await communityDb.rpc('quiz_advance_room',{p_room_code:onlineQuizRoomCode});if(error)throw error;onlineQuizFeedback=null;onlineQuizScheduleRefresh()}catch(error){if(!/이미|진행/.test(String(error?.message||'')))toast(onlineQuizErrorMessage(error))}finally{onlineQuizAdvanceLock=false}
}
function renderOnlineQuizFinished({room,players}){
 if(onlineQuizClockTimer){clearInterval(onlineQuizClockTimer);onlineQuizClockTimer=null}
 const sorted=[...players].sort((a,b)=>(b.score||0)-(a.score||0));const winner=room.winner_id?players.find(p=>p.user_id===room.winner_id):null;const me=players.find(p=>p.user_id===communityUserId);const result=!winner?'무승부':winner.user_id===communityUserId?'승리!':'패배';
 $('#modalTitle').textContent='퀴즈 대전 결과';
 $('#modalBody').innerHTML=`<div class="online-quiz-shell"><section class="online-result ${result==='승리!'?'win':result==='패배'?'lose':'draw'}"><small>FINAL RESULT</small><h2>${result}</h2>${winner?`<p>승자 <b>${communityEsc(winner.nickname)}</b></p>`:'<p>두 플레이어의 점수가 같습니다.</p>'}</section><div class="online-final-scores">${sorted.map((p,i)=>`<div class="${p.user_id===communityUserId?'me':''}"><span>${i+1}위 · ${communityEsc(p.nickname)}</span><strong>${p.score||0}점</strong><small>${p.correct_count||0}/10 정답${p.left_at?' · 대전 이탈':''}</small></div>`).join('')}</div><div class="online-result-actions"><button id="onlineQuizResultLobby" class="primary">새 대전</button><button id="onlineQuizResultClose">닫기</button></div></div>`;
 if(result==='승리!')playSfx('success');else if(result==='패배')playSfx('fail');
 $('#onlineQuizResultLobby').onclick=()=>leaveOnlineQuizRoom(false,true,true);
 $('#onlineQuizResultClose').onclick=()=>leaveOnlineQuizRoom(false,false,true);
}
async function leaveOnlineQuizRoom(callServer=true,goLobby=false,finished=false){
 const code=onlineQuizRoomCode;onlineQuizRoomCode='';saveOnlineQuizStoredRoom('');onlineQuizFeedback=null;await onlineQuizUnsubscribe();
 if(callServer&&code&&communityDb){try{await communityDb.rpc('quiz_leave_room',{p_room_code:code})}catch{}}
 if(goLobby)return openOnlineQuiz();
 closeModal(true);
}


// v173: realtime 2 vs 2 Ryu Hyunsang O/X team quiz
const TEAM_QUIZ_SECONDS=10,TEAM_QUIZ_ROUNDS=7,TEAM_QUIZ_ROOM_KEY='ryuTeamQuizRoomV173';
const teamQuizQuestions=[
 {q:"류현상은 밴드 '스칼레티아'의 리더이자 보컬, 기타리스트이다.",a:true,why:'스칼레티아의 리더이자 보컬·기타리스트다.'},
 {q:'류현상이 태어난 출생지는 충청남도 천안시이다.',a:false,why:'출생지는 충청북도 청주시이며, 태어나자마자 천안으로 이사했다.'},
 {q:"류현상의 첫 데뷔 음반은 2013년 5월 1일 발매된 'Listen to my love'이다.",a:true,why:"2013년 5월 1일 'Listen to my love'로 데뷔했다."},
 {q:"메탈밴드 백두산의 리더 이름도 '류현상'이다.",a:false,why:"백두산의 리더는 '유현상'이다."},
 {q:'류현상의 신체 프로필상 키는 181cm이다.',a:true,why:'프로필상 키는 181cm다.'},
 {q:'류현상의 혈액형은 AB형이다.',a:false,why:'혈액형은 B형이다.'},
 {q:'류현상의 검사 결과상 MBTI는 지속적으로 INTJ가 나온다.',a:true,why:'검사 결과는 지속적으로 INTJ가 나온다.'},
 {q:"류현상은 2023년 Mnet '초대형 노래방 서바이벌 VS'에 출연한 적이 있다.",a:true,why:'2023년 Mnet 초대형 노래방 서바이벌 VS에 출연했다.'},
 {q:"류현상은 Mnet 서바이벌 방송 당시 버스킹에서 '가시'를 불러 조회수 360만 뷰를 기록했다.",a:false,why:"부른 곡은 izi의 '응급실'이다."},
 {q:"류현상은 2024년 KBS 2TV '뮤직뱅크'에서 육성재의 밴드 기타 멤버로 무대에 섰다.",a:true,why:'2024년 뮤직뱅크 무대에 기타 멤버로 섰다.'},
 {q:"류현상이 진행하는 자체제작 팟캐스트 콘텐츠의 이름은 '달콤한 밤'이다.",a:false,why:"자체제작 팟캐스트 이름은 '꿀단지'다."},
 {q:"류현상의 자체제작 팟캐스트 EP.0 첫 게스트는 '김시도'였다.",a:true,why:'EP.0 첫 게스트는 김시도였다.'},
 {q:'류현상은 2024년 10월 3일 서울 홍대에서 생일 팬미팅을 진행했다.',a:false,why:'장소는 천안 JB 아트홀이었다.'},
 {q:"류현상은 OBS 라디오 '파워라이브'에 매주 금요일 고정 게스트로 참여한다.",a:true,why:'매주 금요일 고정 게스트로 참여한다.'},
 {q:"류현상의 2집 음원 사이트 표기명인 'Listen to my love'는 배급사의 실수이며, 실제 커버명은 'Listen to my tears'이다.",a:true,why:"실제 커버명은 'Listen to my tears'다."},
 {q:"류현상의 데뷔 앨범 타이틀곡은 원래부터 '사랑이라는게'로 확정되어 있었다.",a:false,why:"원래 타이틀곡은 2집 수록곡인 '눈물만 눈물만'이 될 예정이었으나 변경됐다."},
 {q:"류현상은 밴드 izi의 곡 '응급실'을 리메이크하여 앨범을 발매했다.",a:true,why:"izi의 '응급실' 리메이크 음원을 발매했다."},
 {q:"앨범 'From the Scarletia'의 타이틀곡은 단 1곡이다.",a:false,why:"'상처', '아무 일도 없던 것처럼 사랑하지 않은 것처럼' 더블 타이틀이다."},
 {q:"류현상은 네이버 웹툰 '천도박멸'의 OST에 참여했다.",a:true,why:'웹툰 천도박멸 OST에 참여했다.'},
 {q:'라이오네시스 멤버 이말랑(주기훈)은 류현상보다 2살 연상의 선배이다.',a:false,why:'1994년생 동갑내기 친구다.'},
 {q:"류현상은 이말랑(주기훈)의 싱글곡 'Remember'를 작사·작곡해 주었다.",a:true,why:"싱글 'Remember'를 작사·작곡했다."},
 {q:"웹툰 작가 '와나나'와의 OST 작업은 와나나가 류현상의 집에 놀러 오면서 기획되었다.",a:false,why:'류현상이 와나나의 천안 집에 놀러 갔다가 급전개됐다.'},
 {q:"류현상의 공식 취미 중 하나는 'MCU 레고 수집'이다.",a:true,why:'MCU 레고 수집이 공식 취미 중 하나다.'},
 {q:"류현상이 새로 시작한 카드 게임 취미는 '유희왕 카드 게임'이다.",a:false,why:"'디지몬 카드 게임'이다."},
 {q:"류현상은 영화 '타이타닉'을 보고 울면서 가사 20곡을 써냈다.",a:false,why:"보았던 영화는 '슬픔보다 더 슬픈 이야기'다."},
 {q:'류현상이 음악을 시작하게 된 계기는 초등학교 5학년 때 동방신기와 버즈를 본 것이다.',a:true,why:'초등학교 5학년 때 동방신기와 버즈를 본 것이 계기다.'},
 {q:'류현상이 존경하는 아티스트로는 김종서, 동물원, TraxX 등이 있다.',a:true,why:'김종서, 동물원, TraxX 등을 존경하는 아티스트로 꼽는다.'},
 {q:'류현상은 1종 대형 운전면허를 소지하고 있다.',a:false,why:'2종 보통 면허다.'},
 {q:"류현상은 광주MBC '정오의 희망곡' 라디오 프로그램에 출연한 적이 있다.",a:true,why:'광주MBC 정오의 희망곡에 출연한 적이 있다.'},
 {q:'류현상의 생년월일은 1994년 12월 25일이다.',a:false,why:'1994년 10월 4일이다.'},
 {q:'류현상은 아메리카노를 자주 마신다.',a:false,why:'아메리카노를 좋아하지 않는다.'},
 {q:'류현상이 좋아하는 캐릭터는 팽수이다.',a:false,why:'좋아하는 캐릭터는 핑구다.'},
 {q:"'Call my name through the dark I will hear you'는 상처의 노래 가사이다.",a:false,why:'웹툰 OST 천도박멸의 가사다.'},
 {q:"'언제나 너의 곁에서 변하지 않을 나니까'는 나는 너의 노래가 되어의 노래 가사이다.",a:true,why:"'나는 너의 노래가 되어'의 가사다."}
];
let teamQuizRoomCode='',teamQuizPollTimer=null,teamQuizClockTimer=null,teamQuizLastSnapshot=null,teamQuizBusy=false;
function saveTeamQuizRoom(code){try{localStorage.setItem(TEAM_QUIZ_ROOM_KEY,String(code||''))}catch{}}
function storedTeamQuizRoom(){try{return localStorage.getItem(TEAM_QUIZ_ROOM_KEY)||''}catch{return''}}
function clearTeamQuizTimers(){if(teamQuizPollTimer){clearInterval(teamQuizPollTimer);teamQuizPollTimer=null}if(teamQuizClockTimer){clearInterval(teamQuizClockTimer);teamQuizClockTimer=null}teamQuizBusy=false}
function teamQuizErrorMessage(error){const raw=String(error?.message||error||'알 수 없는 오류'),code=String(error?.code||'');if(/PGRST202|does not exist|schema cache|42P01/i.test(raw+' '+code))return `2vs2 퀴즈 DB 설정이 필요합니다. ZIP 안의 SUPABASE_TEAM_QUIZ_V173_SETUP.sql을 Supabase SQL Editor에서 한 번 실행해 주세요.\n[오류] ${raw}`;return raw}
async function teamQuizHealthcheck(){await ensureCommunityReady();const {data,error}=await communityDb.rpc('teamquiz_healthcheck');if(error)throw error;return data}
function teamQuizLobbyHtml(message=''){const nick=communityNickname(),resume=storedTeamQuizRoom();return `<div class="teamquiz-shell"><button id="teamQuizBackHub" class="community-back">← 대전 종목 선택</button><section class="teamquiz-hero"><div><small>REALTIME 2 VS 2 · O/X</small><h3>류현상 팀 퀴즈 대전</h3><p>4명이 2명씩 팀을 이루어 7문제를 풉니다. 한 문제는 10초이며, 제한시간이 끝날 때까지 같은 팀의 O/X 선택도 볼 수 없습니다.</p></div><span>⭕❌</span></section>${message?`<div class="online-quiz-notice">${communityEsc(message)}</div>`:''}<section class="online-quiz-profile"><span>대전 닉네임</span><strong>${communityEsc(nick||'미설정')}</strong><button id="teamQuizNicknameBtn">닉네임 변경</button></section>${resume?'<button id="teamQuizResumeBtn" class="online-resume wide">진행 중인 2vs2 퀴즈 이어가기</button>':''}<section class="teamquiz-create"><b>새 2vs2 공개방 만들기</b><p>방을 만든 뒤 대기실에서 1팀/2팀을 자유롭게 바꿀 수 있습니다.</p><button id="teamQuizCreateBtn" class="primary wide" ${nick?'':'disabled'}>2vs2 방 만들기</button></section><section class="online-public-rooms"><header><div><b>대기 중인 2vs2 방</b><small>원하는 팀의 빈 자리를 골라 입장하세요.</small></div><button id="teamQuizRefresh">새로고침</button></header><div id="teamQuizRoomList" class="online-room-list"><div class="online-room-loading">대기방을 불러오는 중...</div></div></section><section class="teamquiz-rules"><b>규칙</b><span>총 7문제 랜덤</span><span>문제당 10초</span><span>개인 정답 1개 = 팀 1점</span><span>같은 팀도 답은 제한시간 전까지 비공개</span><span>팀원 점수 합산</span><span>높은 팀 승리</span></section></div>`}
async function openTeamQuizLobby(message=''){clearTeamQuizTimers();try{await teamQuizHealthcheck();teamQuizRoomCode='';showModal('2vs2 류현상 퀴즈',teamQuizLobbyHtml(message),'online');$('#teamQuizBackHub').onclick=openOnlineBattleHub;$('#teamQuizNicknameBtn').onclick=()=>openTeamQuizNickname();$('#teamQuizCreateBtn').onclick=()=>createTeamQuizRoom();$('#teamQuizRefresh').onclick=()=>refreshTeamQuizLobby(true);const r=$('#teamQuizResumeBtn');if(r)r.onclick=()=>enterTeamQuizRoom(storedTeamQuizRoom());refreshTeamQuizLobby()}catch(error){showModal('2vs2 류현상 퀴즈',`<div class="online-quiz-error"><b>2vs2 퀴즈를 연결하지 못했습니다.</b><p>${communityEsc(teamQuizErrorMessage(error))}</p><button id="teamQuizRetry" class="primary">다시 시도</button><button id="teamQuizErrorBack">대전 메뉴</button></div>`,'online');$('#teamQuizRetry').onclick=()=>openTeamQuizLobby();$('#teamQuizErrorBack').onclick=openOnlineBattleHub}}
function openTeamQuizNickname(){showModal('대전 닉네임',`<div class="community-form"><p>온라인 대전에서 사용할 닉네임입니다.</p><input id="teamQuizNicknameInput" maxlength="16" value="${communityEsc(communityNickname())}"><div class="community-form-actions"><button id="teamQuizNicknameBack">취소</button><button id="teamQuizNicknameSave" class="primary">저장</button></div></div>`,'online');$('#teamQuizNicknameBack').onclick=()=>openTeamQuizLobby();$('#teamQuizNicknameSave').onclick=()=>{const v=$('#teamQuizNicknameInput').value.trim();if(!v)return toast('닉네임을 입력해 주세요.');saveCommunityNickname(v);openTeamQuizLobby('닉네임을 저장했습니다.')}}
async function refreshTeamQuizLobby(show=false){const target=$('#teamQuizRoomList');if(!target)return;try{const {data,error}=await communityDb.rpc('teamquiz_list_open_rooms');if(error)throw error;const rooms=Array.isArray(data)?data:[];target.innerHTML=rooms.length?rooms.map(r=>`<article class="online-room-row teamquiz-room"><div><b>${communityEsc(r.host_nickname||'익명')}님의 방</b><span>전체 ${Number(r.player_count)||1}/4 · 1팀 ${Number(r.team1_count)||0}/2 · 2팀 ${Number(r.team2_count)||0}/2</span></div><div class="teamquiz-join-buttons"><button data-teamquiz-join="${communityEsc(r.room_code)}" data-team="1" ${(Number(r.team1_count)||0)>=2&&!r.is_mine?'disabled':''}>1팀 참가</button><button data-teamquiz-join="${communityEsc(r.room_code)}" data-team="2" ${(Number(r.team2_count)||0)>=2&&!r.is_mine?'disabled':''}>2팀 참가</button></div></article>`).join(''):'<div class="online-room-empty"><b>대기 중인 방이 없습니다.</b><span>새 2vs2 방을 만들어 보세요.</span></div>';$$('[data-teamquiz-join]').forEach(b=>b.onclick=()=>joinTeamQuizRoom(b.dataset.teamquizJoin,Number(b.dataset.team)));if(show)toast('2vs2 대기방을 새로고침했습니다.')}catch(e){target.innerHTML=`<div class="online-room-empty error">${communityEsc(teamQuizErrorMessage(e))}</div>`}}
async function createTeamQuizRoom(){if(!communityNickname())return openTeamQuizNickname();const b=$('#teamQuizCreateBtn');if(b)b.disabled=true;try{const {data,error}=await communityDb.rpc('teamquiz_create_room',{p_nickname:communityNickname(),p_team:1});if(error)throw error;await enterTeamQuizRoom(String(data||'').toUpperCase())}catch(e){toast(teamQuizErrorMessage(e));if(b)b.disabled=false}}
async function joinTeamQuizRoom(code,team){if(!communityNickname())return openTeamQuizNickname();try{const {data,error}=await communityDb.rpc('teamquiz_join_room',{p_code:String(code).toUpperCase(),p_nickname:communityNickname(),p_team:Number(team)});if(error)throw error;await enterTeamQuizRoom(String(data||code).toUpperCase())}catch(e){toast(teamQuizErrorMessage(e));refreshTeamQuizLobby()}}
async function enterTeamQuizRoom(code){code=String(code||'').toUpperCase();if(!code)return openTeamQuizLobby();teamQuizRoomCode=code;saveTeamQuizRoom(code);clearTeamQuizTimers();showModal('2vs2 류현상 퀴즈',`<div class="online-quiz-loading">방 정보를 불러오는 중...</div>`,'online');await refreshTeamQuizRoom();teamQuizPollTimer=setInterval(()=>refreshTeamQuizRoom(true),850)}
async function fetchTeamQuizSnapshot(){const {data,error}=await communityDb.rpc('teamquiz_snapshot',{p_code:teamQuizRoomCode});if(error)throw error;return data||{}}
async function refreshTeamQuizRoom(silent=false){if(!teamQuizRoomCode||teamQuizBusy)return;teamQuizBusy=true;try{await communityDb.rpc('teamquiz_tick',{p_code:teamQuizRoomCode});const s=await fetchTeamQuizSnapshot();teamQuizLastSnapshot=s;if(s.status==='waiting')renderTeamQuizWaiting(s);else if(s.status==='playing')renderTeamQuizPlaying(s);else if(s.status==='finished')renderTeamQuizFinished(s)}catch(e){if(!silent)toast(teamQuizErrorMessage(e))}finally{teamQuizBusy=false}}
function teamQuizPlayers(s){return Array.isArray(s.players)?s.players:[]}
function renderTeamQuizWaiting(s){const players=teamQuizPlayers(s),me=players.find(p=>p.user_id===communityUserId),host=s.host_id===communityUserId,active=players.filter(p=>!p.left_at),t1=active.filter(p=>Number(p.team)===1),t2=active.filter(p=>Number(p.team)===2),canStart=host&&active.length===4&&t1.length===2&&t2.length===2&&active.every(p=>p.ready);$('#modalTitle').textContent='2vs2 류현상 퀴즈 · 대기실';const teamBox=n=>`<section class="teamquiz-team team-${n}"><header><b>${n}팀</b><span>${active.filter(p=>Number(p.team)===n).length}/2</span></header>${active.filter(p=>Number(p.team)===n).map(p=>`<div class="teamquiz-player ${p.user_id===communityUserId?'me':''}"><b>${communityEsc(p.nickname)}</b><small>${p.user_id===s.host_id?'방장 · ':''}${p.ready?'준비 완료':'대기 중'}</small></div>`).join('')}${Array.from({length:Math.max(0,2-active.filter(p=>Number(p.team)===n).length)},()=>'<div class="teamquiz-player empty">빈 자리</div>').join('')}</section>`;$('#modalBody').innerHTML=`<div class="teamquiz-shell"><button id="teamQuizBackLobby" class="community-back">← 공개방 목록</button><div class="teamquiz-team-grid">${teamBox(1)}${teamBox(2)}</div><div class="teamquiz-team-select"><b>내 팀 선택</b><button data-teamquiz-team="1" class="${Number(me?.team)===1?'selected':''}" ${t1.length>=2&&Number(me?.team)!==1?'disabled':''}>1팀</button><button data-teamquiz-team="2" class="${Number(me?.team)===2?'selected':''}" ${t2.length>=2&&Number(me?.team)!==2?'disabled':''}>2팀</button></div><div class="online-waiting-actions"><button id="teamQuizReady" class="${me?.ready?'ready':''}">${me?.ready?'준비 취소':'준비'}</button>${host?`<button id="teamQuizStart" class="primary" ${canStart?'':'disabled'}>대전 시작</button>`:'<span>방장이 시작합니다.</span>'}<button id="teamQuizLeave">방 나가기</button></div><p class="online-waiting-tip">각 팀 2명씩, 총 4명이 모두 준비해야 시작됩니다.</p></div>`;$('#teamQuizBackLobby').onclick=()=>leaveTeamQuizRoom(true,true);$('#teamQuizLeave').onclick=()=>leaveTeamQuizRoom(true,true);$$('[data-teamquiz-team]').forEach(b=>b.onclick=async()=>{const {error}=await communityDb.rpc('teamquiz_set_team',{p_code:teamQuizRoomCode,p_team:Number(b.dataset.teamquizTeam)});if(error)toast(teamQuizErrorMessage(error));else refreshTeamQuizRoom()});$('#teamQuizReady').onclick=async()=>{const {error}=await communityDb.rpc('teamquiz_set_ready',{p_code:teamQuizRoomCode,p_ready:!me?.ready});if(error)toast(teamQuizErrorMessage(error));else refreshTeamQuizRoom()};const st=$('#teamQuizStart');if(st)st.onclick=async()=>{st.disabled=true;const {error}=await communityDb.rpc('teamquiz_start_room',{p_code:teamQuizRoomCode});if(error){toast(teamQuizErrorMessage(error));st.disabled=false}else refreshTeamQuizRoom()}}
function teamQuizScoreBox(s){const ps=teamQuizPlayers(s),sum=n=>ps.filter(p=>Number(p.team)===n&&!p.left_at).reduce((a,p)=>a+(Number(p.score)||0),0);return `<div class="teamquiz-scoreboard"><div><span>1팀</span><strong>${sum(1)}점</strong></div><b>VS</b><div><span>2팀</span><strong>${sum(2)}점</strong></div></div>`}
function renderTeamQuizPlaying(s){const ps=teamQuizPlayers(s),qid=Number(s.question_id),q=teamQuizQuestions[qid]||teamQuizQuestions[0],phase=s.phase||'question',mine=ps.find(p=>p.user_id===communityUserId),myAnswer=s.my_answer;$('#modalTitle').textContent='2vs2 류현상 퀴즈 대전';const reveal=phase==='reveal',answers=Array.isArray(s.reveal_answers)?s.reveal_answers:[];const answerRows=reveal?`<div class="teamquiz-reveal-list">${ps.filter(p=>!p.left_at).map(p=>{const a=answers.find(x=>x.user_id===p.user_id);return `<div class="team-${p.team}"><span>${p.team}팀 · ${communityEsc(p.nickname)}</span><b>${a?String(a.answer)==='true'||a.answer===true?'O':'X':'미응답'}</b><em>${a?.is_correct?'+1점':'0점'}</em></div>`}).join('')}</div>`:'';$('#modalBody').innerHTML=`<div class="teamquiz-shell playing">${teamQuizScoreBox(s)}<div class="teamquiz-round"><span>${Math.min(TEAM_QUIZ_ROUNDS,Number(s.current_question)+1)} / ${TEAM_QUIZ_ROUNDS}</span><strong id="teamQuizClock">${reveal?'정답 공개':TEAM_QUIZ_SECONDS+'초'}</strong></div><section class="teamquiz-question"><small>${mine?.team||'?'}팀 · 내 선택은 제한시간 전까지 팀원에게도 보이지 않습니다.</small><h3>${communityEsc(q.q)}</h3></section>${reveal?`<div class="teamquiz-correct ${q.a?'o':'x'}"><b>정답 ${q.a?'O':'X'}</b><p>${communityEsc(q.why)}</p></div>${answerRows}`:`<div class="teamquiz-ox"><button id="teamQuizO" class="${myAnswer===true?'selected':''}" ${myAnswer!==null&&myAnswer!==undefined?'disabled':''}>O</button><button id="teamQuizX" class="${myAnswer===false?'selected':''}" ${myAnswer!==null&&myAnswer!==undefined?'disabled':''}>X</button></div><p class="teamquiz-secret">${myAnswer===null||myAnswer===undefined?'10초 안에 O 또는 X를 선택하세요.':'내 답변 제출 완료 · 다른 사람의 선택은 아직 비공개입니다.'}</p>`}</div>`;if(!reveal){const o=$('#teamQuizO'),x=$('#teamQuizX');if(o)o.onclick=()=>submitTeamQuizAnswer(true,o,x);if(x)x.onclick=()=>submitTeamQuizAnswer(false,o,x);startTeamQuizClock(s)}else startTeamQuizRevealClock(s)}
function startTeamQuizClock(s){if(teamQuizClockTimer)clearInterval(teamQuizClockTimer);const start=new Date(s.question_started_at).getTime(),serverNow=new Date(s.server_now||Date.now()).getTime(),offset=Date.now()-serverNow;const draw=()=>{const remain=Math.max(0,TEAM_QUIZ_SECONDS-Math.floor((Date.now()-offset-start)/1000));const e=$('#teamQuizClock');if(e)e.textContent=`${remain}초`;if(remain<=0){clearInterval(teamQuizClockTimer);teamQuizClockTimer=null;refreshTeamQuizRoom()}};draw();teamQuizClockTimer=setInterval(draw,250)}
function startTeamQuizRevealClock(s){if(teamQuizClockTimer)clearInterval(teamQuizClockTimer);const until=new Date(s.reveal_until||Date.now()).getTime(),serverNow=new Date(s.server_now||Date.now()).getTime(),offset=Date.now()-serverNow;const draw=()=>{const remain=Math.max(0,Math.ceil((until-(Date.now()-offset))/1000));const e=$('#teamQuizClock');if(e)e.textContent=`정답 공개 ${remain}초`;if(remain<=0){clearInterval(teamQuizClockTimer);teamQuizClockTimer=null;refreshTeamQuizRoom()}};draw();teamQuizClockTimer=setInterval(draw,250)}
async function submitTeamQuizAnswer(answer,o,x){if(o)o.disabled=true;if(x)x.disabled=true;try{const {error}=await communityDb.rpc('teamquiz_submit_answer',{p_code:teamQuizRoomCode,p_answer:!!answer});if(error)throw error;playSfx('click');refreshTeamQuizRoom()}catch(e){toast(teamQuizErrorMessage(e));if(o)o.disabled=false;if(x)x.disabled=false}}
function renderTeamQuizFinished(s){clearTeamQuizTimers();saveTeamQuizRoom('');const ps=teamQuizPlayers(s),sum=n=>ps.filter(p=>Number(p.team)===n&&!p.left_at).reduce((a,p)=>a+(Number(p.score)||0),0),winner=Number(s.winner_team)||0,mine=ps.find(p=>p.user_id===communityUserId);$('#modalTitle').textContent='2vs2 류현상 퀴즈 · 결과';$('#modalBody').innerHTML=`<div class="teamquiz-shell"><section class="teamquiz-result ${winner&&Number(mine?.team)===winner?'win':''}"><small>TEAM O/X BATTLE RESULT</small><h2>${winner?`${winner}팀 승리!`:'무승부'}</h2>${teamQuizScoreBox(s)}<p>${winner?'두 팀원의 정답 점수를 합산한 결과입니다.':'두 팀의 최종 점수가 같습니다.'}</p></section><div class="teamquiz-final-players">${[1,2].map(n=>`<div><b>${n}팀</b>${ps.filter(p=>Number(p.team)===n).map(p=>`<span>${communityEsc(p.nickname)} · ${Number(p.score)||0}점</span>`).join('')}</div>`).join('')}</div><div class="online-result-actions"><button id="teamQuizAgain" class="primary">새 대전</button><button id="teamQuizHub">대전 종목 선택</button></div></div>`;playSfx(winner&&Number(mine?.team)===winner?'success':'click');$('#teamQuizAgain').onclick=()=>openTeamQuizLobby();$('#teamQuizHub').onclick=openOnlineBattleHub}
async function leaveTeamQuizRoom(callServer=true,goLobby=false){const code=teamQuizRoomCode;teamQuizRoomCode='';teamQuizLastSnapshot=null;saveTeamQuizRoom('');clearTeamQuizTimers();if(callServer&&code&&communityDb){try{await communityDb.rpc('teamquiz_leave_room',{p_code:code})}catch{}}if(goLobby)return openTeamQuizLobby();closeModal(true)}

// v157: online battle hub + 2~4 player one-word Ryu Hyunsang lyric battle
function openOnlineBattleHub(){
 onlineQuizClearTimers();songQuizClearTimers();gostopClearTimers();clearTeamQuizTimers();
 showModal('온라인 대전',`<div class="battle-hub">
  <section class="battle-hub-hero"><small>ONLINE ARCADE</small><h3>온라인 대전</h3><p>원하는 종목을 선택하세요. 공개방 목록에서 코드 입력 없이 바로 참가할 수 있습니다.</p></section>
  <div class="battle-mode-grid">
   <button id="battleQuizBtn" class="battle-mode-card quiz"><span>QUIZ</span><b>게임 퀴즈 대전</b><small>1:1 · 10문제 실시간 스피드 퀴즈</small></button>
   <button id="battleTeamQuizBtn" class="battle-mode-card teamquiz"><span>2 VS 2</span><b>류현상 팀 O/X 퀴즈</b><small>4인 · 팀 선택 · 7문제 · 문제당 10초 · 팀 점수 합산</small></button>
   <button id="battleSongQuizBtn" class="battle-mode-card songquiz"><span>LYRIC BATTLE</span><b>류현상 노래 맞추기</b><small>2~4인 · 노래 제목 공개 · 가사 한 단어 빈칸 · 15초</small></button>
   <button id="battleMatgoBtn" class="battle-mode-card matgo"><span>MATGO</span><b>후라보노AI 1:1 맞고</b><small>후라보노 AI · 실제 화투판 배열 · 게임머니 점당 판돈</small></button>
   <button id="battleGostopBtn" class="battle-mode-card gostop"><span>GO-STOP</span><b>온라인 맞고 · 고스톱</b><small>2인 맞고 / 3인 고스톱 · 동일 PNG 화투판 · 점당 판돈</small></button>
  </div>
  <p class="battle-hub-note">노래 맞추기는 순위 상금을 지급하며, 후라보노AI 맞고·온라인 맞고/고스톱의 판돈은 게임 속 가상 보유금만 사용합니다.</p>
 </div>`,'online');
 $('#battleQuizBtn').onclick=()=>openOnlineQuiz();
 $('#battleTeamQuizBtn').onclick=()=>openTeamQuizLobby();
 $('#battleSongQuizBtn').onclick=()=>openSongQuizLobby();
 $('#battleMatgoBtn').onclick=()=>openMatgoLobby();
 $('#battleGostopBtn').onclick=()=>openGostopLobby();
}

let songQuizRoomCode='';
let songQuizPollTimer=null;
let songQuizLobbyTimer=null;
let songQuizClockTimer=null;
let songQuizLastStatus='';
let songQuizLastSnapshot=null;
let songQuizSubmitLock=false;
let songQuizAdvanceLock=false;
let songQuizFeedback=null;
let songQuizRenderedQuestion=-1;
let songQuizTimeoutQuestion=-1;
const SONG_QUIZ_ROOM_KEY='ryuSongQuizRoomV157';
const SONG_QUIZ_PRIZE_KEY='ryuSongQuizPrizesV157';
const SONG_QUIZ_SECONDS=15;
const SONG_QUIZ_ROUNDS=10;
const SONG_QUIZ_REVEAL_MS=4000;

function songQuizErrorMessage(error){
 const raw=String(error?.message||error||'알 수 없는 오류'),code=String(error?.code||'');
 if(/anonymous|sign-?ins?.*disabled/i.test(raw))return 'Supabase의 Anonymous Sign-In을 켜 주세요.';
 if(/PGRST202|Could not find the function|does not exist|schema cache|42P01/i.test(raw+' '+code))return `류현상 노래 맞추기 DB 설정이 필요합니다. ZIP 안의 SUPABASE_SONG_QUIZ_SETUP.sql을 Supabase SQL Editor에서 한 번 전체 실행해 주세요.\n[오류] ${raw}`;
 if(/row-level security|permission denied|42501/i.test(raw+' '+code))return `노래 맞추기 DB 권한 오류입니다. SUPABASE_SONG_QUIZ_SETUP.sql을 다시 실행해 주세요.\n[오류] ${raw}`;
 if(/Failed to fetch|NetworkError|fetch/i.test(raw))return '인터넷 연결 또는 Supabase 접속 상태를 확인해 주세요.';
 return raw;
}
function songQuizStoredRoom(){try{return localStorage.getItem(SONG_QUIZ_ROOM_KEY)||''}catch{return ''}}
function saveSongQuizStoredRoom(code){try{if(code)localStorage.setItem(SONG_QUIZ_ROOM_KEY,code);else localStorage.removeItem(SONG_QUIZ_ROOM_KEY)}catch{}}
function songQuizPrizeRecords(){try{return JSON.parse(localStorage.getItem(SONG_QUIZ_PRIZE_KEY)||'{}')||{}}catch{return {}}}
function saveSongQuizPrizeRecords(map){try{localStorage.setItem(SONG_QUIZ_PRIZE_KEY,JSON.stringify(map))}catch{}}
function songQuizPrizeFor(maxPlayers,rank){maxPlayers=Number(maxPlayers)||2;rank=Number(rank)||99;if(maxPlayers===2&&rank===1)return 20000;if(maxPlayers===3&&rank===1)return 30000;if(maxPlayers===4&&rank===1)return 50000;if(maxPlayers===4&&rank===2)return 30000;return 0}
function settleSongQuizPrize(code,maxPlayers,rank){code=String(code||'').toUpperCase();if(!code)return 0;const map=songQuizPrizeRecords();if(map[code]?.settled)return Number(map[code].prize)||0;const prize=songQuizPrizeFor(maxPlayers,rank);if(prize>0){stat('money',prize);addHistory(`🎤 류현상 노래 맞추기 · ${rank}위 · 상금 +${prize.toLocaleString()}원`,`song-quiz:${code}`);save(false);render()}map[code]={settled:true,rank,prize,settledAt:Date.now()};saveSongQuizPrizeRecords(map);return prize}
function songQuizClearTimers(){if(songQuizPollTimer){clearInterval(songQuizPollTimer);songQuizPollTimer=null}if(songQuizLobbyTimer){clearInterval(songQuizLobbyTimer);songQuizLobbyTimer=null}if(songQuizClockTimer){clearInterval(songQuizClockTimer);songQuizClockTimer=null}}
async function songQuizHealthcheck(){await ensureCommunityReady();const {data,error}=await communityDb.rpc('songquiz_healthcheck');if(error)throw error;return data}
function songQuizLobbyHtml(message=''){
 const nick=communityNickname(),resume=songQuizStoredRoom();
 return `<div class="songquiz-shell"><button id="songQuizBackHub" class="community-back">← 대전 종목 선택</button><section class="songquiz-hero"><div><small>HARD LYRIC BATTLE · 2~4 PLAYERS</small><h3>류현상 노래 맞추기</h3><p>노래 제목을 먼저 보여 주고, 가사 한 구절에서 한 단어만 빈칸으로 냅니다. 빈칸에 들어갈 단어를 15초 안에 직접 입력하세요.</p></div><span>🎤</span></section>${message?`<div class="online-quiz-notice">${communityEsc(message)}</div>`:''}<section class="online-quiz-profile"><span>대전 닉네임</span><strong>${communityEsc(nick||'미설정')}</strong><button id="songQuizNicknameBtn">닉네임 변경</button></section>${resume?'<button id="songQuizResumeBtn" class="online-resume wide">진행 중인 노래 맞추기 이어가기</button>':''}<section class="songquiz-create"><b>새 공개방 만들기</b><label>참가 인원 <select id="songQuizMaxPlayers"><option value="2">2명</option><option value="3">3명</option><option value="4">4명</option></select></label><p>선택한 인원이 모두 입장하고 준비해야 시작할 수 있습니다.</p><button id="songQuizCreateBtn" class="primary wide" ${nick?'':'disabled'}>노래 맞추기 방 만들기</button></section><section class="songquiz-prizes"><b>순위 상금</b><div><span>2인</span><strong>1등 20,000원</strong></div><div><span>3인</span><strong>1등 30,000원</strong></div><div><span>4인</span><strong>1등 50,000원 · 2등 30,000원</strong></div></section><section class="online-public-rooms"><header><div><b>대기 중인 노래 맞추기 방</b><small>2~4인 공개방에 바로 참가할 수 있습니다.</small></div><button id="songQuizRefreshLobby">새로고침</button></header><div id="songQuizRoomList" class="online-room-list"><div class="online-room-loading">대기방을 불러오는 중...</div></div></section><section class="songquiz-rules"><b>HARD 규칙</b><span>총 ${SONG_QUIZ_ROUNDS}문제</span><span>문제당 ${SONG_QUIZ_SECONDS}초</span><span>노래 제목 항상 공개</span><span>한 구절 · 한 단어 빈칸</span><span>직접 키보드 입력</span><span>정답 100점 + 속도 보너스 최대 150점</span><span>라운드 종료 후 모두의 제출 답 공개</span></section></div>`
}
async function openSongQuizLobby(message=''){
 songQuizClearTimers();songQuizRoomCode='';songQuizLastStatus='';songQuizLastSnapshot=null;songQuizFeedback=null;songQuizRenderedQuestion=-1;songQuizSubmitLock=false;songQuizAdvanceLock=false;songQuizTimeoutQuestion=-1;
 try{await songQuizHealthcheck();showModal('류현상 노래 맞추기',songQuizLobbyHtml(message),'online');bindSongQuizLobby()}catch(error){showModal('류현상 노래 맞추기',`<div class="online-quiz-error"><b>노래 맞추기 대전을 연결하지 못했습니다.</b><p>${communityEsc(songQuizErrorMessage(error))}</p><button id="songQuizRetry" class="primary">다시 시도</button><button id="songQuizErrorBack">대전 메뉴</button></div>`,'online');$('#songQuizRetry').onclick=()=>openSongQuizLobby();$('#songQuizErrorBack').onclick=openOnlineBattleHub}
}
function openSongQuizNickname(){showModal('대전 닉네임',`<div class="community-form"><p>커뮤니티와 온라인 대전에서 함께 사용하는 닉네임입니다.</p><input id="songQuizNicknameInput" maxlength="16" value="${communityEsc(communityNickname())}" placeholder="닉네임 입력"><div class="community-form-actions"><button id="songQuizNicknameBack">취소</button><button id="songQuizNicknameSave" class="primary">저장</button></div></div>`,'online');$('#songQuizNicknameBack').onclick=()=>openSongQuizLobby();$('#songQuizNicknameSave').onclick=()=>{const v=$('#songQuizNicknameInput').value.trim();if(!v)return toast('닉네임을 입력해 주세요.');saveCommunityNickname(v);openSongQuizLobby('닉네임을 저장했습니다.')}}
function bindSongQuizLobby(){$('#songQuizBackHub').onclick=openOnlineBattleHub;$('#songQuizNicknameBtn').onclick=openSongQuizNickname;$('#songQuizRefreshLobby').onclick=()=>refreshSongQuizLobby(true);$('#songQuizCreateBtn').onclick=createSongQuizRoom;const resume=$('#songQuizResumeBtn');if(resume)resume.onclick=()=>enterSongQuizRoom(songQuizStoredRoom(),true);refreshSongQuizLobby();songQuizLobbyTimer=setInterval(()=>refreshSongQuizLobby(false),2500)}
async function refreshSongQuizLobby(showToast=false){const target=$('#songQuizRoomList');if(!target||!communityDb)return;try{const {data,error}=await communityDb.rpc('songquiz_list_open_rooms');if(error)throw error;const rooms=Array.isArray(data)?data:[];if(!rooms.length){target.innerHTML='<div class="online-room-empty"><b>대기 중인 방이 없습니다.</b><span>새 공개방을 만들면 바로 표시됩니다.</span></div>';return}target.innerHTML=rooms.map(r=>`<article class="online-room-row songquiz-room-row"><div><b>${communityEsc(r.host_nickname||'익명')}님의 노래 맞추기</b><span>${Number(r.player_count)||1}/${Number(r.max_players)||2}명 · HARD · 15초 직접 입력</span></div><button class="primary" data-songquiz-join="${communityEsc(r.room_code)}">${r.is_mine?'이어가기':'입장'}</button></article>`).join('');$$('[data-songquiz-join]').forEach(b=>b.onclick=()=>joinSongQuizRoom(b.dataset.songquizJoin,b));if(showToast)toast('노래 맞추기 대기방을 새로고침했습니다.')}catch(error){target.innerHTML=`<div class="online-room-empty error"><b>대기방을 불러오지 못했습니다.</b><span>${communityEsc(songQuizErrorMessage(error))}</span></div>`}}
async function createSongQuizRoom(){if(!communityNickname())return openSongQuizNickname();const btn=$('#songQuizCreateBtn');if(btn)btn.disabled=true;try{const max=Math.max(2,Math.min(4,Number($('#songQuizMaxPlayers')?.value)||2));const {data,error}=await communityDb.rpc('songquiz_create_room',{p_nickname:communityNickname(),p_max_players:max});if(error)throw error;await enterSongQuizRoom(String(data||''))}catch(error){toast(songQuizErrorMessage(error));if(btn)btn.disabled=false}}
async function joinSongQuizRoom(code,btn=null){if(!communityNickname())return openSongQuizNickname();if(btn){btn.disabled=true;btn.textContent='입장 중...'}try{const {data,error}=await communityDb.rpc('songquiz_join_room',{p_code:String(code||''),p_nickname:communityNickname()});if(error)throw error;await enterSongQuizRoom(String(data||code))}catch(error){toast(songQuizErrorMessage(error));if(btn){btn.disabled=false;btn.textContent='입장'}}}
async function enterSongQuizRoom(code,resume=false){songQuizClearTimers();songQuizSubmitLock=false;songQuizAdvanceLock=false;songQuizFeedback=null;songQuizRenderedQuestion=-1;songQuizTimeoutQuestion=-1;songQuizRoomCode=String(code||'').toUpperCase();if(!songQuizRoomCode)return openSongQuizLobby();saveSongQuizStoredRoom(songQuizRoomCode);showModal('류현상 노래 맞추기','<div class="online-quiz-loading">대전방을 불러오는 중...</div>','online');try{await refreshSongQuizRoom(true);songQuizPollTimer=setInterval(()=>refreshSongQuizRoom(false).catch(()=>{}),700)}catch(error){if(resume)saveSongQuizStoredRoom('');songQuizRoomCode='';openSongQuizLobby(songQuizErrorMessage(error))}}
async function fetchSongQuizSnapshot(){const {data,error}=await communityDb.rpc('songquiz_get_snapshot',{p_room_code:songQuizRoomCode});if(error)throw error;return data||{}}
function songQuizPlayerCard(p,s){const me=p.user_id===communityUserId,host=s.host_id===p.user_id;return `<div class="online-player-card ${me?'me':''} ${p.left_at?'left':''}"><div><b>${communityEsc(p.nickname)}</b>${host?'<span>방장</span>':''}${me?'<em>나</em>':''}</div><strong>${Number(p.score)||0}점</strong><small>${p.left_at?'이탈':p.ready?'준비 완료':'대기 중'}${p.correct_count?` · 정답 ${p.correct_count}`:''}</small></div>`}
async function refreshSongQuizRoom(forceRender=false){if(!songQuizRoomCode||!$('#modal')?.open)return;const previous=songQuizLastSnapshot;const s=await fetchSongQuizSnapshot();songQuizLastSnapshot=s;songQuizLastStatus=s.status||'';const players=Array.isArray(s.players)?s.players:[];if(s.status==='waiting'){songQuizRenderedQuestion=-1;renderSongQuizWaiting(s,players)}else if(s.status==='playing'){const changed=songQuizRenderedQuestion!==Number(s.current_question)||previous?.status!=='playing';if(forceRender||changed)await renderSongQuizPlaying(s,players);else updateSongQuizLiveMeta(s,players)}else{songQuizRenderedQuestion=-1;renderSongQuizFinished(s,players)}}
function renderSongQuizWaiting(s,players){if(songQuizClockTimer){clearInterval(songQuizClockTimer);songQuizClockTimer=null}const me=players.find(p=>p.user_id===communityUserId),active=players.filter(p=>!p.left_at),host=s.host_id===communityUserId,max=Number(s.max_players)||2,canStart=host&&active.length===max&&active.every(p=>p.ready);$('#modalTitle').textContent='류현상 노래 맞추기 · 대기실';$('#modalBody').innerHTML=`<div class="songquiz-shell"><button id="songQuizBackLobby" class="community-back">← 공개방 목록</button><section class="songquiz-wait-head"><div><span>HARD LYRIC BATTLE</span><strong>${active.length}/${max}명</strong></div><small>선택한 인원이 모두 모여야 시작됩니다.</small></section><div class="online-player-grid">${players.map(p=>songQuizPlayerCard(p,s)).join('')}${Array.from({length:Math.max(0,max-active.length)},()=>'<div class="online-player-card empty"><b>빈 자리</b><small>참가자를 기다리는 중...</small></div>').join('')}</div><div class="online-waiting-actions"><button id="songQuizReadyBtn" class="${me?.ready?'ready':''}">${me?.ready?'준비 취소':'준비'}</button>${host?`<button id="songQuizStartBtn" class="primary" ${canStart?'':'disabled'}>대전 시작</button>`:'<span>방장이 시작하면 자동으로 진행됩니다.</span>'}<button id="songQuizLeaveBtn">방 나가기</button></div><section class="songquiz-prizes compact"><b>이 방 상금</b>${max===2?'<div><span>1등</span><strong>20,000원</strong></div>':max===3?'<div><span>1등</span><strong>30,000원</strong></div>':'<div><span>1등</span><strong>50,000원</strong></div><div><span>2등</span><strong>30,000원</strong></div>'}</section></div>`;$('#songQuizBackLobby').onclick=()=>leaveSongQuizRoom(true,true);$('#songQuizLeaveBtn').onclick=()=>leaveSongQuizRoom(true,true);$('#songQuizReadyBtn').onclick=async()=>{const {error}=await communityDb.rpc('songquiz_set_ready',{p_code:songQuizRoomCode,p_ready:!me?.ready});if(error)toast(songQuizErrorMessage(error));else refreshSongQuizRoom(true)};const start=$('#songQuizStartBtn');if(start)start.onclick=async()=>{start.disabled=true;start.textContent='문제 준비 중...';const {error}=await communityDb.rpc('songquiz_start_room',{p_code:songQuizRoomCode});if(error){toast(songQuizErrorMessage(error));start.disabled=false;start.textContent='대전 시작'}else{songQuizFeedback=null;songQuizRenderedQuestion=-1;refreshSongQuizRoom(true)}}}
function songQuizScoreboard(players,s){const sorted=[...players].sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0)||(Number(b.correct_count)||0)-(Number(a.correct_count)||0)||(Number(a.total_response_ms)||0)-(Number(b.total_response_ms)||0));return `<div class="songquiz-scoreboard">${sorted.map((p,i)=>`<div class="${p.user_id===communityUserId?'me':''} ${p.left_at?'left':''}"><span>${i+1}위 · ${communityEsc(p.nickname)}</span><strong>${Number(p.score)||0}</strong><small>${Number(p.correct_count)||0}개 정답</small></div>`).join('')}</div>`}
function songQuizSubmissionMarkup(s,players){const answers=Array.isArray(s.answers)?s.answers:[],active=players.filter(p=>!p.left_at),revealed=!!s.answers_revealed;return `<div class="songquiz-submission-head"><b>${revealed?'🎉 이번 문제 답 공개!':'다른 참가자 제출 현황'}</b><small>${revealed?'누가 어떤 단어를 썼는지 확인해 보세요. 잠시 후 다음 문제로 넘어갑니다.':'정답 단어는 전원이 제출하거나 시간이 끝난 뒤 공개됩니다.'}</small></div><div class="songquiz-submission-list ${revealed?'revealed':''}">${active.map(p=>{const a=answers.find(x=>x.user_id===p.user_id),me=p.user_id===communityUserId;if(!a)return `<div class="songquiz-submission-row pending ${me?'me':''}"><span>${communityEsc(p.nickname)}${me?' · 나':''}</span><strong>✍️ 입력 중...</strong></div>`;if(!revealed)return `<div class="songquiz-submission-row locked ${me?'me':''}"><span>${communityEsc(p.nickname)}${me?' · 나':''}</span><strong>🔒 제출 완료</strong></div>`;const answer=String(a.answer_text||'').trim(),timedOut=!answer;return `<div class="songquiz-submission-row ${a.is_correct?'correct':'wrong'} ${me?'me':''}"><span>${a.is_correct?'⭕':'❌'} ${communityEsc(p.nickname)}${me?' · 나':''}</span><strong>${timedOut?'시간 초과':communityEsc(answer)}</strong><small>${a.is_correct?`+${Number(a.points)||0}점`:'0점'} · ${(Math.min(15000,Number(a.response_ms)||15000)/1000).toFixed(1)}초</small></div>`}).join('')}</div>`}
function updateSongQuizLiveMeta(s,players){const score=$('#songQuizLiveScores');if(score)score.innerHTML=songQuizScoreboard(players,s);const answers=Array.isArray(s.answers)?s.answers:[],active=players.filter(p=>!p.left_at);const stateEl=$('#songQuizAnsweredState');if(stateEl)stateEl.textContent=s.answers_revealed?'모두의 답을 공개했습니다!':`답변 완료 ${answers.length}/${active.length}명`;const submissions=$('#songQuizSubmissions');if(submissions)submissions.innerHTML=songQuizSubmissionMarkup(s,players);if(!!s.answers_revealed&&!songQuizAdvanceLock){songQuizAdvanceLock=true;setTimeout(()=>advanceSongQuizRoom(),SONG_QUIZ_REVEAL_MS+250)}}
async function renderSongQuizPlaying(s,players){const qres=await communityDb.rpc('songquiz_get_current_question',{p_room_code:songQuizRoomCode});if(qres.error)throw qres.error;const q=Array.isArray(qres.data)?qres.data[0]:qres.data;if(!q)return;const idx=Number(s.current_question)||0,answers=Array.isArray(s.answers)?s.answers:[],mine=answers.find(a=>a.user_id===communityUserId),active=players.filter(p=>!p.left_at),feedback=songQuizFeedback&&songQuizFeedback.question===idx?songQuizFeedback:null;songQuizRenderedQuestion=idx;songQuizTimeoutQuestion=-1;$('#modalTitle').textContent=`류현상 노래 맞추기 · ${idx+1}/${SONG_QUIZ_ROUNDS}`;const prompt=communityEsc(q.question_text||'').replace(/\n/g,'<br>'),songTitle=communityEsc(q.song_title||'류현상 노래');$('#modalBody').innerHTML=`<div class="songquiz-shell playing"><div id="songQuizLiveScores">${songQuizScoreboard(players,s)}</div><section class="songquiz-question"><div class="songquiz-question-top"><span>QUESTION ${idx+1} · 빈칸 한 단어를 입력하세요</span><strong id="songQuizTime">15.0</strong></div><div class="online-timebar songquiz-timebar"><i id="songQuizTimeBar" style="width:100%"></i></div><div class="songquiz-song-title"><small>노래 제목</small><b>${songTitle}</b></div><blockquote>${prompt}</blockquote><div class="songquiz-arrow">빈칸에 들어갈 한 단어는?</div><form id="songQuizAnswerForm" class="songquiz-answer-form"><input id="songQuizAnswer" type="text" maxlength="30" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="한 단어 입력" ${mine||s.answers_revealed?'disabled':''}><button id="songQuizSubmitBtn" class="primary" ${mine||s.answers_revealed?'disabled':''}>정답 제출</button></form>${feedback?`<div class="songquiz-feedback ${feedback.correct?'correct':'wrong'}"><b>${feedback.correct?`정답! +${feedback.points}점`:'오답!'}</b><p>정답 단어 · ${communityEsc(feedback.answer)}</p><small>${communityEsc(feedback.song)} · ${feedback.responseMs<15000?`${(feedback.responseMs/1000).toFixed(1)}초`:'시간 초과'}</small></div>`:mine?`<div class="songquiz-feedback ${mine.is_correct?'correct':'wrong'}"><b>${mine.is_correct?`정답 +${mine.points}점`:'답변 완료'}</b><p>다른 참가자의 답변을 기다리는 중...</p></div>`:''}<div id="songQuizAnsweredState" class="songquiz-answered-state">${s.answers_revealed?'모두의 답을 공개했습니다!':`답변 완료 ${answers.length}/${active.length}명`}</div><section id="songQuizSubmissions" class="songquiz-submissions">${songQuizSubmissionMarkup(s,players)}</section></section><button id="songQuizForfeitBtn" class="online-forfeit">대전 나가기</button></div>`;const form=$('#songQuizAnswerForm'),input=$('#songQuizAnswer');if(form&&!mine&&!s.answers_revealed)form.onsubmit=e=>{e.preventDefault();submitSongQuizAnswer(idx,input?.value||'',false)};$('#songQuizForfeitBtn').onclick=()=>{if(confirm('노래 맞추기 대전에서 나갈까요? 현재 대전에서 이탈합니다.'))leaveSongQuizRoom(true,true)};startSongQuizClock(s,players);if(input&&!mine&&!s.answers_revealed)setTimeout(()=>{try{input.focus({preventScroll:true})}catch{}},80);if(!!s.answers_revealed&&!songQuizAdvanceLock){songQuizAdvanceLock=true;setTimeout(()=>advanceSongQuizRoom(),SONG_QUIZ_REVEAL_MS+250)}}
function startSongQuizClock(s,players){if(songQuizClockTimer)clearInterval(songQuizClockTimer);const idx=Number(s.current_question)||0;const tick=()=>{if(!songQuizLastSnapshot||Number(songQuizLastSnapshot.current_question)!==idx)return;const started=new Date(songQuizLastSnapshot.question_started_at||s.question_started_at).getTime(),remain=Math.max(0,SONG_QUIZ_SECONDS-(Date.now()-started)/1000),text=$('#songQuizTime'),bar=$('#songQuizTimeBar'),revealed=!!songQuizLastSnapshot.answers_revealed;if(text)text.textContent=revealed?'답 공개':remain.toFixed(1);if(bar)bar.style.width=revealed?'0%':`${Math.max(0,Math.min(100,remain/SONG_QUIZ_SECONDS*100))}%`;const answers=Array.isArray(songQuizLastSnapshot.answers)?songQuizLastSnapshot.answers:[],active=(Array.isArray(songQuizLastSnapshot.players)?songQuizLastSnapshot.players:players).filter(p=>!p.left_at),mine=answers.find(a=>a.user_id===communityUserId);if(remain<=0&&!mine&&songQuizTimeoutQuestion!==idx&&!songQuizSubmitLock){songQuizTimeoutQuestion=idx;submitSongQuizAnswer(idx,'',true);return}if(revealed&&!songQuizAdvanceLock){songQuizAdvanceLock=true;setTimeout(()=>advanceSongQuizRoom(),SONG_QUIZ_REVEAL_MS+250)}};tick();songQuizClockTimer=setInterval(tick,100)}
async function submitSongQuizAnswer(questionIndex,value,timeout=false){if(songQuizSubmitLock)return;value=String(value||'').trim();if(!timeout&&!value)return toast('빈칸에 들어갈 한 단어를 입력해 주세요.');songQuizSubmitLock=true;const input=$('#songQuizAnswer'),btn=$('#songQuizSubmitBtn');if(input)input.disabled=true;if(btn){btn.disabled=true;btn.textContent=timeout?'시간 종료':'채점 중...'};try{const {data,error}=await communityDb.rpc('songquiz_submit_answer',{p_room_code:songQuizRoomCode,p_question_index:questionIndex,p_answer:value});if(error)throw error;const r=Array.isArray(data)?data[0]:data;songQuizFeedback={question:questionIndex,correct:!!r?.result_correct,points:Number(r?.result_points)||0,answer:String(r?.result_answer||''),song:String(r?.result_song||''),responseMs:Number(r?.result_response_ms)||15000};playSfx(songQuizFeedback.correct?'success':'fail');await refreshSongQuizRoom(true)}catch(error){if(timeout&&/이미 다음 문제|이미 답변/.test(String(error?.message||''))){await refreshSongQuizRoom(true).catch(()=>{})}else{toast(songQuizErrorMessage(error));if(input)input.disabled=false;if(btn){btn.disabled=false;btn.textContent='정답 제출'}}}finally{songQuizSubmitLock=false}}
async function advanceSongQuizRoom(){try{if(!songQuizRoomCode)return;const {error}=await communityDb.rpc('songquiz_advance_room',{p_room_code:songQuizRoomCode});if(error)throw error;songQuizFeedback=null;songQuizRenderedQuestion=-1;await refreshSongQuizRoom(true)}catch(error){if(!/아직|이미|진행/.test(String(error?.message||'')))toast(songQuizErrorMessage(error))}finally{songQuizAdvanceLock=false}}
function renderSongQuizFinished(s,players){songQuizClearTimers();saveSongQuizStoredRoom('');const sorted=[...players].sort((a,b)=>{if(!!a.left_at!==!!b.left_at)return a.left_at?1:-1;return (Number(b.score)||0)-(Number(a.score)||0)||(Number(b.correct_count)||0)-(Number(a.correct_count)||0)||(Number(a.total_response_ms)||0)-(Number(b.total_response_ms)||0)||String(a.joined_at||'').localeCompare(String(b.joined_at||''))});const rank=Math.max(1,sorted.findIndex(p=>p.user_id===communityUserId)+1),me=sorted.find(p=>p.user_id===communityUserId),prize=me&&!me.left_at?settleSongQuizPrize(s.code||songQuizRoomCode,s.max_players,rank):0;$('#modalTitle').textContent='류현상 노래 맞추기 · 결과';$('#modalBody').innerHTML=`<div class="songquiz-shell"><section class="songquiz-result ${rank===1?'win':rank===2&&Number(s.max_players)===4?'place':''}"><small>LYRIC BATTLE RESULT</small><h2>${rank}위</h2><p>${rank===1?'가사 빈칸을 가장 정확하고 빠르게 맞혔습니다.':rank===2&&Number(s.max_players)===4?'4인 대전 2등 상금 획득!':'대전이 종료되었습니다.'}</p>${prize?`<strong>상금 +${prize.toLocaleString()}원</strong><small>기존 채무가 있다면 본게임의 수입 자동상환 규칙이 적용됩니다.</small>`:'<strong>상금 없음</strong>'}</section><div class="songquiz-final-ranks">${sorted.map((p,i)=>`<div class="${p.user_id===communityUserId?'me':''}"><span>${i+1}위 · ${communityEsc(p.nickname)}</span><strong>${Number(p.score)||0}점</strong><small>${Number(p.correct_count)||0}/${SONG_QUIZ_ROUNDS} 정답${p.left_at?' · 이탈':''}</small></div>`).join('')}</div><div class="online-result-actions"><button id="songQuizResultLobby" class="primary">새 대전</button><button id="songQuizResultHub">대전 종목 선택</button></div></div>`;if(prize)playSfx('success');else playSfx('click');$('#songQuizResultLobby').onclick=()=>{songQuizRoomCode='';openSongQuizLobby()};$('#songQuizResultHub').onclick=()=>{songQuizRoomCode='';openOnlineBattleHub()}}
async function leaveSongQuizRoom(callServer=true,goLobby=false){const code=songQuizRoomCode;songQuizRoomCode='';songQuizLastStatus='';songQuizLastSnapshot=null;songQuizFeedback=null;songQuizRenderedQuestion=-1;saveSongQuizStoredRoom('');songQuizClearTimers();if(callServer&&code&&communityDb){try{await communityDb.rpc('songquiz_leave_room',{p_room_code:code})}catch{}}if(goLobby)return openSongQuizLobby();closeModal(true)}

// v157: 2~3인 온라인 맞고·고스톱
let gostopRoomCode='';
let gostopPollTimer=null;
let gostopLobbyTimer=null;
let gostopLastStatus='';
let gostopLastSnapshot=null;
let gostopSelectedCard=null;
let gostopVisualQueue=[];
let gostopVisualTimer=null;
let gostopActionFlash=null;
let gostopLocalPlayedCard=null;
const GOSTOP_ROOM_KEY='ryuGostopRoomV147';
const GOSTOP_SETTLEMENT_KEY='ryuGostopSettlementsV151';
const GOSTOP_RATES=[1000,5000,10000,50000,100000];
function gostopStoredRoom(){try{return localStorage.getItem(GOSTOP_ROOM_KEY)||''}catch{return ''}}
function saveGostopStoredRoom(code){try{if(code)localStorage.setItem(GOSTOP_ROOM_KEY,code);else localStorage.removeItem(GOSTOP_ROOM_KEY)}catch{}}
function gostopSettlements(){try{return JSON.parse(localStorage.getItem(GOSTOP_SETTLEMENT_KEY)||'{}')||{}}catch{return {}}}
function saveGostopSettlements(map){try{localStorage.setItem(GOSTOP_SETTLEMENT_KEY,JSON.stringify(map))}catch{}}
function gostopClearTimers(){if(gostopPollTimer){clearInterval(gostopPollTimer);gostopPollTimer=null}if(gostopLobbyTimer){clearInterval(gostopLobbyTimer);gostopLobbyTimer=null}if(gostopVisualTimer){clearTimeout(gostopVisualTimer);gostopVisualTimer=null}gostopVisualQueue=[];gostopActionFlash=null;gostopSelectedCard=null;gostopLocalPlayedCard=null}
function gostopErrorMessage(error){const raw=String(error?.message||error||'알 수 없는 오류'),code=String(error?.code||'');if(/gostop_create_room\(p_max_players,\s*p_nickname\)/i.test(raw))return `예전 고스톱 코드가 캐시에 남아 있습니다. v152 파일을 GitHub에 전체 덮어쓴 뒤 앱을 완전히 종료하고 다시 실행해 주세요. 계속되면 홈 화면 앱을 삭제 후 Safari에서 다시 추가해 주세요.\n[오류] ${raw}`;if(/PGRST202|Could not find the function|does not exist|schema cache|42P01/i.test(raw+' '+code))return `온라인 맞고·고스톱 DB 설정이 필요합니다. ZIP 안의 SUPABASE_GOSTOP_V151_UPDATE.sql을 Supabase SQL Editor에서 한 번 전체 실행해 주세요.\n[오류] ${raw}`;if(/permission denied|row-level security|42501/i.test(raw+' '+code))return `고스톱 DB 권한 오류입니다. SUPABASE_GOSTOP_V151_UPDATE.sql을 다시 실행해 주세요.\n[오류] ${raw}`;return raw}
async function gostopHealthcheck(){await ensureCommunityReady();const {data,error}=await communityDb.rpc('gostop_healthcheck');if(error)throw error;return data}
function gostopThreshold(maxPlayers){return Number(maxPlayers)===3?3:7}
function gostopRate(value){value=Number(value)||1000;return GOSTOP_RATES.includes(value)?value:1000}
function gostopMinBankroll(maxPlayers,rate){return gostopThreshold(maxPlayers)*gostopRate(rate)}
function gostopSetWide(on=false){const modal=$('#modal');if(modal)modal.classList.toggle('online-hwatu-modal',!!on)}
function gostopCardAsset(id){const m=String(gostopMonth(id)).padStart(2,'0'),n=(Number(id)%4)+1;return `assets/hwatu/${m}-${n}.png`}
function gostopCardHtml(id,clickable=false,opts={}){const {small=false,back=false,selected=false}=opts;if(back)return `<span class="matgo-card back ${small?'small':''}"><img src="assets/hwatu/back.png" alt="화투 뒷면"></span>`;const tag=clickable?'button':'span';return `<${tag} class="matgo-card online-hwatu-card ${small?'small':''} ${selected?'selected':''} ${gostopKind(id)}" ${clickable?`data-gostop-card="${id}"`:''}><img src="${gostopCardAsset(id)}" alt="${gostopMonth(id)}월 ${gostopKindText(id)}"></${tag}>`}
function gostopBackHtml(count,small=true){return Array.from({length:Math.max(0,Number(count)||0)},()=>gostopCardHtml(0,false,{back:true,small})).join('')}
function gostopCapturedGroup(cards,kind,title){cards=Array.isArray(cards)?cards:[];const arr=cards.filter(id=>{const k=gostopKind(id);if(kind==='pi')return k==='pi'||k==='doublepi';return k===kind});return `<div class="matgo-capture-group"><b>${title}<em>${arr.length}</em></b><div>${arr.length?arr.sort((a,b)=>gostopMonth(a)-gostopMonth(b)||a-b).map(id=>gostopCardHtml(id,false,{small:true})).join(''):'<span class="matgo-none">-</span>'}</div></div>`}
function gostopCapturedHtml(cards){return `<div class="matgo-captured-row">${gostopCapturedGroup(cards,'gwang','광')}${gostopCapturedGroup(cards,'animal','열끗')}${gostopCapturedGroup(cards,'ribbon','띠')}${gostopCapturedGroup(cards,'pi','피')}</div>`}
function gostopMetaHtml(p={}){const chips=[];if(Number(p.go_count||0))chips.push(`<span class="matgo-meta-chip">${Number(p.go_count)}고</span>`);if(Number(p.shake_count||0))chips.push(`<span class="matgo-meta-chip">흔듦 ${Number(p.shake_count)}</span>`);if(Number(p.bomb_count||0))chips.push(`<span class="matgo-meta-chip">폭탄 ${Number(p.bomb_count)}</span>`);if(Number(p.ppuk_count||0))chips.push(`<span class="matgo-meta-chip">뻑 ${Number(p.ppuk_count)}</span>`);return chips.length?`<div class="matgo-score-meta">${chips.join('')}</div>`:''}
function gostopDiffCards(nextCards,prevCards){const counts=new Map();for(const c of (prevCards||[]))counts.set(Number(c),(counts.get(Number(c))||0)+1);const out=[];for(const c0 of (nextCards||[])){const c=Number(c0),n=counts.get(c)||0;if(n>0)counts.set(c,n-1);else out.push(c)}return out}
function gostopActionFxHtml(){const a=gostopActionFlash;if(!a)return '';return `<div class="matgo-action-fx ${a.type} ${a.side==='me'?'me':'opponent'}"><div class="matgo-action-cards">${(a.cards||[]).map(id=>gostopCardHtml(id,false)).join('')}</div><b>${communityEsc(a.text||'')}</b></div>`}
function gostopQueueTurnVisuals(prev,next){if(!prev||prev.status!=='playing'||next.status!=='playing'||Number(next.turn_no)<=Number(prev.turn_no))return;const actorId=prev.turn_user_id,actor=(prev.players||[]).find(p=>p.user_id===actorId),actorName=actor?.nickname||'상대',mine=actorId===communityUserId;if(next.last_played!=null){if(!(mine&&gostopLocalPlayedCard===Number(next.last_played)))gostopVisualQueue.push({type:'play',side:mine?'me':'opponent',cards:[Number(next.last_played)],text:`${mine?'내가':actorName+'님이'} 패를 냅니다.`});gostopLocalPlayedCard=null}if(next.last_drawn!=null)gostopVisualQueue.push({type:'draw',side:mine?'me':'opponent',cards:[Number(next.last_drawn)],text:'더미에서 한 장을 뒤집습니다.'});for(const np of (next.players||[])){const pp=(prev.players||[]).find(x=>x.user_id===np.user_id),diff=gostopDiffCards(np.captured||[],pp?.captured||[]);if(diff.length)gostopVisualQueue.push({type:'capture',side:np.user_id===communityUserId?'me':'opponent',cards:diff.slice(-4),text:`${np.user_id===communityUserId?'내가':np.nickname+'님이'} 패를 가져갑니다.`})}gostopRunVisualQueue()}
function gostopRunVisualQueue(){if(gostopVisualTimer||gostopActionFlash||!gostopVisualQueue.length||gostopLastStatus!=='playing')return;gostopActionFlash=gostopVisualQueue.shift();const s=gostopLastSnapshot;if(s)renderGostopPlaying(s,Array.isArray(s.players)?s.players:[]);const ms=gostopActionFlash.type==='capture'?620:gostopActionFlash.type==='draw'?420:360;gostopVisualTimer=setTimeout(()=>{gostopVisualTimer=null;gostopActionFlash=null;const snap=gostopLastSnapshot;if(snap?.status==='playing')renderGostopPlaying(snap,Array.isArray(snap.players)?snap.players:[]);gostopRunVisualQueue()},ms)}
function handleGostopCardTap(id){const s=gostopLastSnapshot;if(!s||s.status!=='playing'||s.turn_user_id!==communityUserId||s.decision_user_id)return;const hand=Array.isArray(s.my_hand)?s.my_hand.map(Number):[];id=Number(id);if(!hand.includes(id))return;if(gostopSelectedCard===id){gostopSelectedCard=null;playGostopCard(id);return}gostopSelectedCard=id;playSfx('click');renderGostopPlaying(s,Array.isArray(s.players)?s.players:[])}

function gostopSettlementFor(code){return gostopSettlements()[String(code||'').toUpperCase()]||null}
function gostopSettleFinished(s,players){const code=String(s?.code||gostopRoomCode||'').toUpperCase();if(!code)return 0;const map=gostopSettlements(),old=map[code];if(old?.settled)return Number(old.amount)||0;const winner=players.find(p=>p.user_id===s.winner_id);const me=players.find(p=>p.user_id===communityUserId);if(!me)return 0;if(!winner){map[code]={settled:true,amount:0,nagari:true,settledAt:Date.now()};saveGostopSettlements(map);addHistory(`🎴 온라인 ${Number(s.max_players)===2?'맞고':'고스톱'} · 나가리 · 정산 없음`,`online-gostop:${code}`);save(false);return 0;}const rate=gostopRate(s.point_rate),points=Math.max(gostopThreshold(s.max_players),Number(winner.score)||0),share=points*rate,debtBefore=Math.max(0,Number(state.economy?.debt)||0);let amount=0;if(winner.user_id===communityUserId){const opponents=players.filter(p=>p.user_id!==communityUserId).length;amount=share*opponents;if(amount)stat('money',amount)}else{amount=-share;if(share)stat('money',-share)}const debtAdded=Math.max(0,(Number(state.economy?.debt)||0)-debtBefore);map[code]={settled:true,amount,share,points,rate,winnerId:winner.user_id,debtAdded,settledAt:Date.now()};saveGostopSettlements(map);addHistory(`🎴 온라인 ${Number(s.max_players)===2?'맞고':'고스톱'} · ${winner.nickname||'승자'} 승리 · ${amount>=0?'+':''}${amount.toLocaleString()}원${debtAdded?` · 채무 +${debtAdded.toLocaleString()}원`:''}`,`online-gostop:${code}`);save(false);render();return amount}
function gostopSettleForfeit(code,s){code=String(code||'').toUpperCase();if(!code||!s)return 0;const map=gostopSettlements(),old=map[code];if(old?.settled)return Number(old.amount)||0;const rate=gostopRate(s.point_rate),share=gostopThreshold(s.max_players)*rate,debtBefore=Math.max(0,Number(state.economy?.debt)||0);if(share)stat('money',-share);const debtAdded=Math.max(0,(Number(state.economy?.debt)||0)-debtBefore);map[code]={settled:true,amount:-share,share,points:gostopThreshold(s.max_players),rate,forfeit:true,debtAdded,settledAt:Date.now()};saveGostopSettlements(map);addHistory(`🎴 온라인 ${Number(s.max_players)===2?'맞고':'고스톱'} 기권 · -${share.toLocaleString()}원${debtAdded?` · 채무 +${debtAdded.toLocaleString()}원`:''}`,`online-gostop-forfeit:${code}`);save(false);render();return -share}
function gostopLobbyHtml(message=''){const nick=communityNickname(),resume=gostopStoredRoom(),money=Math.max(0,Number(state.stats?.money)||0);return `<div class="gostop-shell online-hwatu-lobby"><button id="gostopBackHub" class="community-back">← 대전 종목 선택</button><section class="matgo-intro online-hwatu-hero"><div><small>REALTIME 2~3 PLAYERS</small><h3>온라인 맞고 · 고스톱</h3><p>후라보노AI 맞고와 같은 PNG 화투패·화투판 화면을 사용합니다. 2인 맞고와 3인 고스톱을 모두 유지합니다.</p></div><span>🎴</span></section>${message?`<div class="online-quiz-notice">${communityEsc(message)}</div>`:''}<div class="matgo-money"><span>현재 보유금</span><strong>${money.toLocaleString()}원</strong><em>온라인 게임머니</em></div><section class="online-quiz-profile"><span>대전 닉네임</span><strong>${communityEsc(nick||'미설정')}</strong><button id="gostopNicknameBtn">닉네임 변경</button></section>${resume?'<button id="gostopResumeBtn" class="online-resume wide">진행 중인 맞고·고스톱 이어가기</button>':''}<section class="gostop-create online-hwatu-create"><b>새 공개방 만들기</b><label>게임 방식 <select id="gostopMaxPlayers"><option value="2">2인 맞고</option><option value="3">3인 고스톱</option></select></label><div><span>점당 판돈</span><div class="matgo-rate-grid online-hwatu-rate-grid">${GOSTOP_RATES.map(r=>`<button type="button" data-gostop-rate="${r}" class="${r===1000?'selected':''}"><span>점당</span><b>${r.toLocaleString()}원</b><small>${r===1000?'기본 판돈':''}</small></button>`).join('')}</div><input id="gostopRateValue" type="hidden" value="1000"></div><p id="gostopStakeHint" class="online-hwatu-stake-hint"></p><button id="gostopCreateBtn" class="primary wide" ${nick?'':'disabled'}>공개방 만들기</button></section><section class="online-public-rooms"><header><div><b>대기 중인 맞고·고스톱 방</b><small>방의 점당 판돈과 참가 인원을 확인하세요.</small></div><button id="gostopRefreshLobby">새로고침</button></header><div id="gostopRoomList" class="online-room-list"><div class="online-room-loading">대기방을 불러오는 중...</div></div></section><section class="matgo-rule-summary online-hwatu-rules"><b>기능 유지</b><span>2인 맞고 · 10장씩 / 바닥 8장</span><span>3인 고스톱 · 7장씩 / 바닥 6장</span><span>2인 7점부터 GO / STOP</span><span>3인 3점부터 GO / STOP</span><span>광 · 열끗 · 띠 · 피 점수</span><span>홍단 · 청단 · 초단 · 고도리</span></section></div>`}
async function openGostopLobby(message=''){gostopSetWide(false);try{await gostopHealthcheck();gostopRoomCode='';gostopLastStatus='';gostopLastSnapshot=null;gostopClearTimers();showModal('온라인 맞고 · 고스톱',gostopLobbyHtml(message),'online');bindGostopLobby()}catch(error){showModal('온라인 맞고 · 고스톱',`<div class="online-quiz-error"><b>온라인 맞고·고스톱을 연결하지 못했습니다.</b><p>${communityEsc(gostopErrorMessage(error))}</p><button id="gostopRetry" class="primary">다시 시도</button><button id="gostopErrorBack">대전 메뉴</button></div>`,'online');$('#gostopRetry').onclick=()=>openGostopLobby();$('#gostopErrorBack').onclick=openOnlineBattleHub}}
function openGostopNickname(){showModal('대전 닉네임',`<div class="community-form"><p>온라인 대전에서 사용할 닉네임입니다.</p><input id="gostopNicknameInput" maxlength="16" value="${communityEsc(communityNickname())}" placeholder="닉네임 입력"><div class="community-form-actions"><button id="gostopNicknameBack">취소</button><button id="gostopNicknameSave" class="primary">저장</button></div></div>`,'online');$('#gostopNicknameBack').onclick=()=>openGostopLobby();$('#gostopNicknameSave').onclick=()=>{const v=$('#gostopNicknameInput').value.trim();if(!v)return toast('닉네임을 입력해 주세요.');saveCommunityNickname(v);openGostopLobby('닉네임을 저장했습니다.')}}
function bindGostopLobby(){let selectedRate=1000;const update=()=>{const max=Number($('#gostopMaxPlayers')?.value)||2,need=gostopMinBankroll(max,selectedRate),money=Math.max(0,Number(state.stats?.money)||0),hint=$('#gostopStakeHint'),btn=$('#gostopCreateBtn');if(hint)hint.innerHTML=`${max===2?'맞고':'고스톱'} 최소 시작점수 ${gostopThreshold(max)}점 기준 <b>${need.toLocaleString()}원</b> 이상 보유 권장 · 현재 ${money.toLocaleString()}원`;if(btn&&communityNickname())btn.disabled=money<need};$('#gostopBackHub').onclick=openOnlineBattleHub;$('#gostopNicknameBtn').onclick=openGostopNickname;$('#gostopRefreshLobby').onclick=()=>refreshGostopLobby(true);$('#gostopCreateBtn').onclick=createGostopRoom;$('#gostopMaxPlayers').onchange=update;$$('[data-gostop-rate]').forEach(b=>b.onclick=()=>{selectedRate=gostopRate(b.dataset.gostopRate);const input=$('#gostopRateValue');if(input)input.value=selectedRate;$$('[data-gostop-rate]').forEach(x=>x.classList.toggle('selected',x===b));update()});const resume=$('#gostopResumeBtn');if(resume)resume.onclick=()=>enterGostopRoom(gostopStoredRoom(),true);update();refreshGostopLobby();gostopLobbyTimer=setInterval(()=>refreshGostopLobby(false),2500)}
async function refreshGostopLobby(showToast=false){const target=$('#gostopRoomList');if(!target||!communityDb)return;try{const {data,error}=await communityDb.rpc('gostop_list_open_rooms');if(error)throw error;const rooms=Array.isArray(data)?data:[];if(!rooms.length){target.innerHTML='<div class="online-room-empty"><b>대기 중인 방이 없습니다.</b><span>새 방을 만들면 바로 목록에 표시됩니다.</span></div>';return}target.innerHTML=rooms.map(r=>{const max=Number(r.max_players)||2,rate=gostopRate(r.point_rate),need=gostopMinBankroll(max,rate),can=(state.stats?.money||0)>=need||r.is_mine;return `<article class="online-room-row online-hwatu-room-row"><div><b>${communityEsc(r.host_nickname||'익명')}님의 ${max===2?'맞고':'고스톱'}</b><span>${Number(r.player_count)||1}/${max}명 · 점당 ${rate.toLocaleString()}원</span></div><button class="primary" data-gostop-join="${communityEsc(r.room_code)}" data-gostop-rate="${rate}" data-gostop-max="${max}" ${can?'':'disabled'}>${r.is_mine?'이어가기':can?'입장':'보유금 부족'}</button></article>`}).join('');$$('[data-gostop-join]').forEach(b=>b.onclick=()=>joinGostopRoom(b.dataset.gostopJoin,Number(b.dataset.gostopRate),Number(b.dataset.gostopMax),b));if(showToast)toast('맞고·고스톱 대기방을 새로고침했습니다.')}catch(error){target.innerHTML=`<div class="online-room-empty error"><b>대기방을 불러오지 못했습니다.</b><span>${communityEsc(gostopErrorMessage(error))}</span></div>`}}
async function createGostopRoom(){if(!communityNickname())return openGostopNickname();const btn=$('#gostopCreateBtn');if(btn)btn.disabled=true;try{const max=Number($('#gostopMaxPlayers')?.value)||2,rate=gostopRate($('#gostopRateValue')?.value),need=gostopMinBankroll(max,rate);if((state.stats?.money||0)<need)throw new Error(`이 판돈으로 시작하려면 최소 ${need.toLocaleString()}원이 필요합니다.`);const {data,error}=await communityDb.rpc('gostop_create_room',{p_nickname:communityNickname(),p_max_players:max,p_point_rate:rate});if(error)throw error;await enterGostopRoom(String(data||''))}catch(error){toast(gostopErrorMessage(error));if(btn)btn.disabled=false}}
async function joinGostopRoom(code,rate=1000,maxPlayers=2,btn=null){if(!communityNickname())return openGostopNickname();const need=gostopMinBankroll(maxPlayers,rate);if((state.stats?.money||0)<need)return toast(`이 방에 들어가려면 최소 ${need.toLocaleString()}원이 필요합니다.`);if(btn){btn.disabled=true;btn.textContent='입장 중...'}try{const {data,error}=await communityDb.rpc('gostop_join_room',{p_code:String(code||''),p_nickname:communityNickname()});if(error)throw error;await enterGostopRoom(String(data||code))}catch(error){toast(gostopErrorMessage(error));if(btn){btn.disabled=false;btn.textContent='입장'}}}
async function enterGostopRoom(code,resume=false){gostopClearTimers();gostopRoomCode=String(code||'').toUpperCase();if(!gostopRoomCode)return openGostopLobby();saveGostopStoredRoom(gostopRoomCode);showModal('온라인 맞고 · 고스톱','<div class="online-quiz-loading">화투판을 준비하는 중...</div>','online');try{await refreshGostopRoom();gostopPollTimer=setInterval(()=>refreshGostopRoom().catch(()=>{}),850)}catch(error){if(resume)saveGostopStoredRoom('');gostopRoomCode='';openGostopLobby(gostopErrorMessage(error))}}
async function fetchGostopSnapshot(){const {data,error}=await communityDb.rpc('gostop_get_snapshot',{p_room_code:gostopRoomCode});if(error)throw error;return data||{}}
function gostopKind(id){id=Number(id);if([0,8,28,40,44].includes(id))return'gwang';if([4,12,16,20,24,29,32,36,45].includes(id))return'animal';if([1,5,9,13,17,21,25,33,37,46].includes(id))return'ribbon';if([41,47].includes(id))return'doublepi';return'pi'}
function gostopMonth(id){return Math.floor(Number(id)/4)+1}
function gostopKindText(id){return {gwang:'광',animal:'열끗',ribbon:'띠',doublepi:'쌍피',pi:'피'}[gostopKind(id)]||'피'}
function gostopPlayerHtml(p,s){const me=p.user_id===communityUserId,turn=s.turn_user_id===p.user_id,decision=s.decision_user_id===p.user_id;return `<div class="gostop-player ${me?'me':''} ${turn?'turn':''}"><div><b>${communityEsc(p.nickname)}</b><small>${me?'나 · ':''}${p.hand_count||0}장</small></div><strong>${p.score||0}점</strong><span>GO ${p.go_count||0}${decision?' · 선택 중':''}</span></div>`}
async function refreshGostopRoom(){if(!gostopRoomCode||!$('#modal')?.open)return;const prev=gostopLastSnapshot,s=await fetchGostopSnapshot();if(s.turn_user_id!==communityUserId||s.decision_user_id)gostopSelectedCard=null;gostopLastSnapshot=s;gostopLastStatus=s.status||'';const players=Array.isArray(s.players)?s.players:[];if(prev&&s.status==='playing')gostopQueueTurnVisuals(prev,s);if(s.status==='waiting')renderGostopWaiting(s,players);else if(s.status==='playing')renderGostopPlaying(s,players);else renderGostopFinished(s,players)}
function renderGostopWaiting(s,players){gostopSetWide(false);const me=players.find(p=>p.user_id===communityUserId),host=s.host_id===communityUserId,active=players.filter(p=>!p.left_at),canStart=host&&active.length===Number(s.max_players)&&active.every(p=>p.ready),rate=gostopRate(s.point_rate);$('#modalTitle').textContent=Number(s.max_players)===2?'온라인 1:1 맞고 · 대기실':'온라인 3인 고스톱 · 대기실';$('#modalBody').innerHTML=`<div class="gostop-shell"><button id="gostopBackLobby" class="community-back">← 공개방 목록</button><section class="online-hwatu-wait-stake"><span>이번 판</span><strong>점당 ${rate.toLocaleString()}원</strong><small>${Number(s.max_players)===2?'7점':'3점'}부터 GO / STOP</small></section><div class="gostop-player-grid">${players.map(p=>gostopPlayerHtml(p,s)).join('')}${Array.from({length:Math.max(0,Number(s.max_players)-active.length)},()=>'<div class="gostop-player empty"><b>빈 자리</b><small>참가자를 기다리는 중</small></div>').join('')}</div><div class="online-waiting-actions"><button id="gostopReadyBtn" class="${me?.ready?'ready':''}">${me?.ready?'준비 취소':'준비'}</button>${host?`<button id="gostopStartBtn" class="primary" ${canStart?'':'disabled'}>게임 시작</button>`:'<span>방장이 시작하면 게임이 시작됩니다.</span>'}<button id="gostopLeaveBtn">방 나가기</button></div></div>`;$('#gostopBackLobby').onclick=()=>leaveGostopRoom(true,true);$('#gostopLeaveBtn').onclick=()=>leaveGostopRoom(true,true);$('#gostopReadyBtn').onclick=async()=>{const {error}=await communityDb.rpc('gostop_set_ready',{p_code:gostopRoomCode,p_ready:!me?.ready});if(error)toast(gostopErrorMessage(error));else refreshGostopRoom()};const start=$('#gostopStartBtn');if(start)start.onclick=async()=>{start.disabled=true;const {error}=await communityDb.rpc('gostop_start_room',{p_code:gostopRoomCode});if(error){toast(gostopErrorMessage(error));start.disabled=false}else refreshGostopRoom()}}
function gostopOpponentBoard(p,s){const turn=s.turn_user_id===p.user_id,decision=s.decision_user_id===p.user_id,captured=Array.isArray(p.captured)?p.captured:[];return `<section class="online-hwatu-opponent ${turn?'turn':''}"><div class="matgo-player-info"><span>${communityEsc(p.nickname)}</span><strong>${p.score||0}점</strong><small>손패 ${p.hand_count||0}장 · ${p.go_count||0}고${decision?' · GO/STOP 선택 중':''}</small></div><div class="matgo-opponent-hand">${gostopBackHtml(p.hand_count,true)}</div><div class="online-hwatu-opponent-captured">${gostopCapturedHtml(captured)}${gostopMetaHtml(p)}</div></section>`}
function renderGostopPlaying(s,players){gostopSetWide(true);const mine=s.turn_user_id===communityUserId,decisionMine=s.decision_user_id===communityUserId,myHand=Array.isArray(s.my_hand)?s.my_hand:[],table=Array.isArray(s.table_cards)?s.table_cards:[],captured=Array.isArray(s.my_captured)?s.my_captured:[],me=players.find(p=>p.user_id===communityUserId),opponents=players.filter(p=>p.user_id!==communityUserId&&!p.left_at),turn=players.find(p=>p.user_id===s.turn_user_id),decision=players.find(p=>p.user_id===s.decision_user_id),rate=gostopRate(s.point_rate),canPlay=mine&&!s.decision_user_id;$('#modalTitle').textContent=Number(s.max_players)===2?'온라인 1:1 맞고':'온라인 3인 고스톱';const decisionHtml=decisionMine?`<div class="matgo-overlay-choice decision"><div><small>현재 ${me?.score||0}점</small><b>GO / STOP</b><p>계속 진행하거나 현재 점수로 승부를 끝낼 수 있습니다.</p><div class="matgo-decision-buttons"><button id="gostopGoBtn" class="primary">GO</button><button id="gostopStopBtn">STOP</button></div></div></div>`:'';$('#modalBody').innerHTML=`<div class="matgo-board online-hwatu-board">${decisionHtml}${gostopActionFxHtml()}<header class="matgo-board-top"><div><b>점당 ${rate.toLocaleString()}원</b><span>더미 ${s.deck_count||0}장</span></div><strong class="${mine?'me':''}">${decision?`${communityEsc(decision.nickname)}님이 GO / STOP 선택 중`:mine?'내 차례입니다.':`${communityEsc(turn?.nickname||'상대')} 차례입니다.`} · ${s.last_action?communityEsc(s.last_action):'게임 진행 중'}</strong><button id="gostopForfeitBtn">기권</button></header><div class="online-hwatu-opponents ${opponents.length>1?'three-player':''}">${opponents.map(p=>gostopOpponentBoard(p,s)).join('')}</div><section class="matgo-center"><div class="matgo-table-area"><div class="matgo-table-cards">${table.length?table.sort((a,b)=>gostopMonth(a)-gostopMonth(b)||a-b).map(id=>gostopCardHtml(id,false)).join(''):'<span class="matgo-empty-table">바닥이 비었습니다</span>'}</div><div class="matgo-deck-stack"><span class="matgo-card back"><img src="assets/hwatu/back.png" alt="더미"></span><b>${s.deck_count||0}</b></div></div></section><section class="online-hwatu-me"><div class="online-hwatu-my-captured">${gostopCapturedHtml(captured)}${gostopMetaHtml(me||{})}</div><div class="matgo-hand-head"><div><span>${communityEsc(me?.nickname||'나')}</span><strong>${me?.score||0}점</strong></div><small>${canPlay?(gostopSelectedCard!=null?'선택한 패를 한 번 더 누르면 냅니다.':'낼 패를 한 번 눌러 선택하세요.'):mine?'GO / STOP을 선택하세요.':'상대 차례를 기다리는 중...'}</small></div><div class="matgo-my-hand" style="--hand-count:${Math.max(1,myHand.length)}">${myHand.sort((a,b)=>gostopMonth(a)-gostopMonth(b)||a-b).map(id=>gostopCardHtml(id,canPlay,{selected:gostopSelectedCard===Number(id)})).join('')}</div></section></div>`;$$('[data-gostop-card]').forEach(b=>b.onclick=()=>handleGostopCardTap(Number(b.dataset.gostopCard)));const go=$('#gostopGoBtn'),stop=$('#gostopStopBtn');if(go)go.onclick=()=>chooseGostop(true,go);if(stop)stop.onclick=()=>chooseGostop(false,stop);$('#gostopForfeitBtn').onclick=()=>{const minLoss=gostopMinBankroll(s.max_players,rate);if(confirm(`진행 중인 ${Number(s.max_players)===2?'맞고':'고스톱'}에서 기권할까요? 최소 ${minLoss.toLocaleString()}원의 게임머니가 차감됩니다.`))leaveGostopRoom(true,true,true)}}
async function playGostopCard(id){const s=gostopLastSnapshot;if(!s||s.turn_user_id!==communityUserId)return;id=Number(id);gostopLocalPlayedCard=id;gostopActionFlash={type:'play',side:'me',cards:[id],text:'선택한 패를 냅니다.'};renderGostopPlaying(s,Array.isArray(s.players)?s.players:[]);playSfx('click');await new Promise(r=>setTimeout(r,320));gostopActionFlash=null;try{const {error}=await communityDb.rpc('gostop_play_card',{p_room_code:gostopRoomCode,p_card:id});if(error)throw error;await refreshGostopRoom()}catch(error){gostopLocalPlayedCard=null;toast(gostopErrorMessage(error));await refreshGostopRoom().catch(()=>{})}}
async function chooseGostop(go,btn){if(btn)btn.disabled=true;try{const {error}=await communityDb.rpc('gostop_choose_go',{p_room_code:gostopRoomCode,p_go:!!go});if(error)throw error;playSfx(go?'click':'success');refreshGostopRoom()}catch(error){toast(gostopErrorMessage(error));if(btn)btn.disabled=false}}
function renderGostopFinished(s,players){gostopSetWide(false);if(gostopPollTimer){clearInterval(gostopPollTimer);gostopPollTimer=null};const winner=players.find(p=>p.user_id===s.winner_id),rate=gostopRate(s.point_rate),settled=gostopSettleFinished(s,players),mine=s.winner_id===communityUserId;saveGostopStoredRoom('');$('#modalTitle').textContent=Number(s.max_players)===2?'온라인 맞고 · 결과':'온라인 고스톱 · 결과';$('#modalBody').innerHTML=`<div class="gostop-shell"><section class="matgo-result ${winner?(mine?'win':'lose'):'draw'}"><small>${Number(s.max_players)===2?'ONLINE MATGO':'ONLINE GO-STOP'} RESULT</small><h2>${winner?`${communityEsc(winner.nickname)} 승리!`:'나가리'}</h2><p>${winner?`승자 점수 <b>${Number(winner?.score)||0}점</b> · 점당 ${rate.toLocaleString()}원${Number(s.max_players)===3&&mine?' · 상대 2명 정산':''}`:'마지막 패까지 STOP 승자가 없어 게임머니 정산 없이 종료되었습니다.'}</p><div class="gostop-player-grid">${players.map(p=>gostopPlayerHtml(p,s)).join('')}</div><div class="matgo-settlement"><span>내 게임머니 정산</span><strong>${settled>=0?'+':''}${settled.toLocaleString()}원</strong><small>현재 보유금 ${(state.stats?.money||0).toLocaleString()}원 · 채무 ${(state.economy?.debt||0).toLocaleString()}원</small></div><div class="online-result-actions"><button id="gostopResultLobby" class="primary">새 대전</button><button id="gostopResultHub">대전 종목 선택</button></div></section></div>`;if(!winner)playSfx('click');else if(mine)playSfx('success');else playSfx('fail');$('#gostopResultLobby').onclick=()=>leaveGostopRoom(false,true,false,true);$('#gostopResultHub').onclick=async()=>{await leaveGostopRoom(false,false,false,true);openOnlineBattleHub()}}
async function leaveGostopRoom(callServer=true,goLobby=false,forfeit=false,finished=false){const code=gostopRoomCode,s=gostopLastSnapshot,status=gostopLastStatus;if(forfeit&&status==='playing')gostopSettleForfeit(code,s);gostopRoomCode='';gostopLastStatus='';gostopLastSnapshot=null;gostopSelectedCard=null;saveGostopStoredRoom('');gostopClearTimers();gostopSetWide(false);if(callServer&&code&&communityDb){try{await communityDb.rpc('gostop_leave_room',{p_room_code:code})}catch{}}if(goLobby)return openGostopLobby();closeModal(true)}


$('#newGameBtn').onclick=()=>{forceAudioOn();setAudioScreenMode('title');const collected=loadMetaEndings();state=structuredClone(baseState);state.endings=collected;startPrologue()};
$('#continueBtn').onclick=()=>{forceAudioOn();migrateLegacySave();const hasAny=!!readSave(AUTO_SAVE_KEY)||MANUAL_SAVE_KEYS.some(k=>!!readSave(k));if(!hasAny)return toast('저장된 게임이 없습니다.');openSaveManager('load')};
$('#howBtn').onclick=()=>{forceAudioOn();openGameGuide()};
$('#titleCommunityBtn').onclick=()=>{forceAudioOn();openCommunity()};$('#titleRankingBtn').onclick=()=>{forceAudioOn();openRanking()};
$('#closeModal').onclick=()=>closeModal();$('#modal').addEventListener('cancel',e=>{if(window.matgoIsActive?.()){e.preventDefault();window.matgoRequestClose?.();return}if(memoryGameActive||blockingNoticeActive||instagramLiveActive){e.preventDefault();if(memoryGameActive)closeModal()}});$('#audioBtn').onclick=openAudioSettings;$('#menuBtn').onclick=()=>showModal('메뉴','<div class="card-list"><button id="menuCommunity" class="community-menu-button">커뮤니티</button><button id="menuRanking" class="ranking-menu-button">🏆 실시간 랭킹</button><button id="gameGuideBtn" class="primary">게임 설명 · 진행 가이드</button><button id="manualSave">저장 / 불러오기</button><button id="backTitle">타이틀로 돌아가기</button></div>');
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});
$$('[data-phone]').forEach(b=>b.onclick=()=>openPhone(b.dataset.phone));
$$('[data-tab]').forEach(b=>b.onclick=()=>{if(state.specialScene?.active)return toast('진행 중인 특별 이벤트를 먼저 마쳐 주세요.');const t=b.dataset.tab;$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));if(t==='band')showBand();if(t==='album')openSpecialAlbum();if(t==='shop')openShopHub();if(t==='ending')openEndingCollection();if(t==='online')openOnlineBattleHub();if(t==='story')showModal('스토리 기록',state.history.length?`<div class="card-list story-history-list">${[...state.history].reverse().map(x=>`<div class="info-card story-history-item">${x}</div>`).join('')}</div>`:'류현상의 이야기는 이제 시작입니다.','story')});
document.addEventListener('click',e=>{if(e.target&&e.target.id==='menuCommunity'){openCommunity()}if(e.target&&e.target.id==='menuRanking'){openRanking()}if(e.target&&e.target.id==='gameGuideBtn'){openGameGuide()}if(e.target&&e.target.id==='manualSave'){openSaveManager('all')}if(e.target&&e.target.id==='backTitle'){save(false);setChoiceLock(false);stopSpecialEventBgm(false);exitEndingMusic();$('#gameScreen').classList.remove('active');$('#titleScreen').classList.add('active');setAudioScreenMode('title',true);closeModal()}});

document.addEventListener('click',e=>{
 if(!choiceLock)return;
 const target=e.target;
 const allowed=target.closest?.('#choiceArea, #choiceModal, #menuBtn, #manualSave, #backTitle, .save-manager, #modal');
 if(allowed)return;
 e.preventDefault();e.stopImmediatePropagation();
 toast('먼저 선택지를 골라야 합니다. 수동 저장과 타이틀 이동만 가능합니다.');
},true);

migrateLegacySave();
loadAudioSettings();
// 브라우저는 사용자 동작 전 유음 자동재생을 막는다. 첫 입력을 받는 순간부터는 항상 BGM·효과음을 유지한다.
const unlockAudio=()=>forceAudioOn();
document.addEventListener('pointerdown',unlockAudio,{capture:true,once:true});
document.addEventListener('touchstart',unlockAudio,{capture:true,once:true,passive:true});
document.addEventListener('keydown',unlockAudio,{capture:true,once:true});
const resumeGameAudio=()=>{if(document.visibilityState!=='hidden')forceAudioOn()};
window.addEventListener('focus',resumeGameAudio);window.addEventListener('pageshow',resumeGameAudio);
document.addEventListener('visibilitychange',resumeGameAudio);
document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#audioBtn'))playSfx('click')});
const installBtn=$('#installBtn'),installHint=$('#installHint');
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const isIos=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
const isMobileDevice=()=>/android|iphone|ipad|ipod/i.test(navigator.userAgent)||window.matchMedia('(max-width: 720px)').matches;
function refreshInstallUi(){
 const standalone=isStandalone();
 document.documentElement.classList.toggle('standalone-app',standalone);
 document.body?.classList.toggle('standalone-app',standalone);
 if(!installBtn)return;
 if(standalone){installBtn.classList.add('hidden');installHint?.classList.add('hidden');return;}
 if(isMobileDevice()){installBtn.classList.remove('hidden');installHint?.classList.remove('hidden');}
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;refreshInstallUi()});
window.addEventListener('appinstalled',()=>{deferredPrompt=null;refreshInstallUi();toast('홈 화면에 앱이 설치되었습니다.')});
if(installBtn)installBtn.onclick=async()=>{
 if(isStandalone())return toast('이미 앱으로 설치되어 있습니다.');
 if(deferredPrompt){
   deferredPrompt.prompt();
   await deferredPrompt.userChoice;
   deferredPrompt=null;
   refreshInstallUi();
   return;
 }
 if(isIos()){
   showModal('아이폰·아이패드에 설치',`<div class="card-list"><div class="info-card"><b>Safari에서 설치하는 방법</b><p>1. 화면 아래의 <strong>공유 버튼(□↑)</strong>을 누릅니다.<br>2. 메뉴를 내려 <strong>홈 화면에 추가</strong>를 선택합니다.<br>3. 오른쪽 위 <strong>추가</strong>를 누르면 앱처럼 실행할 수 있습니다.</p></div><div class="info-card"><small>카카오톡·인스타그램 내부 브라우저에서는 메뉴가 보이지 않을 수 있습니다. 주소를 Safari로 열어 주세요.</small></div></div>`);
 }else{
   showModal('모바일 앱 설치 안내',`<div class="card-list"><div class="info-card"><b>Chrome에서 설치하는 방법</b><p>브라우저 오른쪽 위 <strong>⋮ 메뉴</strong>를 누른 뒤 <strong>앱 설치</strong> 또는 <strong>홈 화면에 추가</strong>를 선택하세요.</p></div><div class="info-card"><small>설치 항목이 없다면 GitHub Pages 주소를 Chrome에서 직접 열고 페이지를 한 번 새로고침해 주세요.</small></div></div>`);
 }
};
refreshInstallUi();
try{window.matchMedia('(display-mode: standalone)').addEventListener('change',refreshInstallUi)}catch(_){}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('service-worker.js?v=176-hiatus-start-buttons',{updateViaCache:'none'});await reg.update();refreshInstallUi()}catch(err){console.warn('서비스워커 등록 실패',err);refreshInstallUi()}});


/* v36: iOS standalone PWA viewport synchronization */
(function setupIOSViewportFix(){
  const update=()=>{
    const height=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    if(height>0)document.documentElement.style.setProperty('--app-viewport-height',`${Math.round(height)}px`);
  };
  update();
  window.addEventListener('resize',update,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(update,120),{passive:true});
  window.addEventListener('pageshow',update,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(update,60)});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',update,{passive:true});
})();

// v103: long dialogue now shows a persistent scroll position indicator; branching choices open in a separate focused dialog.

// v111: stalker resolution requires all five safe choices; safety equals the number of safe decisions.
// Stalker encounter count now advances only after the player actually chooses an option.

// v178: title/menu realtime ranking with Supabase leaderboard profiles and ending records.

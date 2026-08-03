/* 류현상 키우기 v183 patch - 싱글 맞고(후라보노 AI)
 * 48장 전통 화투 기반 / 2인 10장씩 + 바닥 8장 + 더미 20장
 * 룰: 7점 GO/STOP, 총통, 흔들기, 폭탄, 뻑/자뻑/뻑먹기, 쪽, 따닥, 싹쓸이,
 *      홍단/청단/초단, 고도리, 피박/광박/멍따/고박, 3고 이상 배수, 나가리 다음판 2배.
 */

let matgoGame=null;
const MATGO_MIN_SCORE=7;
const MATGO_RATES=[1000,5000,10000,50000,100000];
const MATGO_NAMES=['소나무','매화','벚꽃','등꽃','창포','모란','싸리','억새','국화','단풍','오동','비'];
const MATGO_KIND_BY_ID=[
 'bright','ribbon','pi','pi',
 'animal','ribbon','pi','pi',
 'bright','ribbon','pi','pi',
 'animal','ribbon','pi','pi',
 'animal','ribbon','pi','pi',
 'animal','ribbon','pi','pi',
 'animal','ribbon','pi','pi',
 'bright','animal','pi','pi',
 'animalpi','ribbon','pi','pi',
 'animal','ribbon','pi','pi',
 'bright','doublepi','pi','pi',
 'bright','animal','ribbon','doublepi'
];
const MATGO_KIND_TEXT={bright:'광',animal:'열끗',animalpi:'국진',ribbon:'띠',doublepi:'쌍피',pi:'피'};
const MATGO_SPECIAL={red:[1,5,9],blue:[21,33,37],grass:[13,17,25],godori:[4,12,29]};

function matgoMonth(id){return Math.floor(Number(id)/4)+1}
function matgoKind(id){return MATGO_KIND_BY_ID[Number(id)]||'pi'}
function matgoCardValue(id){const k=matgoKind(id);return k==='bright'?12:k==='animalpi'?8:k==='animal'?7:k==='ribbon'?5:k==='doublepi'?4:2}
function matgoCardAsset(id){const m=String(matgoMonth(id)).padStart(2,'0');const n=(Number(id)%4)+1;return `assets/hwatu/${m}-${n}.png`}
function matgoShuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function matgoSortCards(cards){return [...cards].sort((a,b)=>matgoMonth(a)-matgoMonth(b)||matgoCardValue(b)-matgoCardValue(a)||a-b)}
function matgoCountMonth(cards,month){return cards.filter(c=>matgoMonth(c)===month).length}
function matgoMonthGroups(cards){const out={};for(const c of cards){const m=matgoMonth(c);(out[m]??=[]).push(c)}return out}
function matgoPickPi(cards){const pis=cards.filter(c=>['pi','doublepi'].includes(matgoKind(c))).sort((a,b)=>matgoCardValue(a)-matgoCardValue(b));return pis[0]??null}
function matgoEsc(s){return typeof communityEsc==='function'?communityEsc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function matgoScoreScenario(cards,gukjinAsPi=false){
 let bright=0,animal=0,ribbon=0,pi=0;const ids=new Set(cards);
 for(const id of cards){const k=matgoKind(id);if(k==='bright')bright++;else if(k==='animal')animal++;else if(k==='animalpi'){if(gukjinAsPi)pi+=2;else animal++}else if(k==='ribbon')ribbon++;else if(k==='doublepi')pi+=2;else pi++}
 let brightScore=0;if(bright===3)brightScore=ids.has(44)?2:3;else if(bright===4)brightScore=4;else if(bright>=5)brightScore=15;
 const animalBase=animal>=5?animal-4:0;const godori=MATGO_SPECIAL.godori.every(x=>ids.has(x))?5:0;
 const ribbonBase=ribbon>=5?ribbon-4:0;const red=MATGO_SPECIAL.red.every(x=>ids.has(x))?3:0;const blue=MATGO_SPECIAL.blue.every(x=>ids.has(x))?3:0;const grass=MATGO_SPECIAL.grass.every(x=>ids.has(x))?3:0;
 const piScore=pi>=10?pi-9:0;
 const base=brightScore+animalBase+godori+ribbonBase+red+blue+grass+piScore;
 return {base,bright,animal,ribbon,pi,brightScore,animalBase,godori,ribbonBase,red,blue,grass,piScore,gukjinAsPi};
}
function matgoScoreCards(cards){
 const a=matgoScoreScenario(cards,false),b=cards.includes(32)?matgoScoreScenario(cards,true):a;
 return b.base>a.base?b:a;
}
function matgoCurrentScore(side){const p=matgoGame?.[side];if(!p)return {base:0,total:0,detail:matgoScoreCards([])};const detail=matgoScoreCards(p.captured);return {base:detail.base,total:detail.base+p.goCount,detail}}
function matgoFinalBreakdown(winner,loser){
 const w=matgoCurrentScore(winner),l=matgoCurrentScore(loser),wp=matgoGame[winner],lp=matgoGame[loser];
 let mult=1;const tags=[];
 if(wp.goCount>=3){const m=2**(wp.goCount-2);mult*=m;tags.push(`${wp.goCount}고 ×${m}`)}
 const shakeBomb=(wp.shakeCount||0)+(wp.bombCount||0);if(shakeBomb){const m=2**shakeBomb;mult*=m;tags.push(`흔들기·폭탄 ×${m}`)}
 if(w.detail.animal>=7){mult*=2;tags.push('멍따 ×2')}
 if(w.detail.pi>=10&&l.detail.pi<=7){mult*=2;tags.push('피박 ×2')}
 if(w.detail.bright>=3&&l.detail.bright===0){mult*=2;tags.push('광박 ×2')}
 if(lp.goCount>0){mult*=2;tags.push('고박 ×2')}
 const carry=Math.max(1,Number(state?.minigames?.matgoCarry)||1);if(carry>1){mult*=carry;tags.push(`나가리 이월 ×${carry}`)}
 return {score:Math.max(MATGO_MIN_SCORE,w.total),mult,tags,detail:w.detail,finalPoints:Math.max(MATGO_MIN_SCORE,w.total)*mult};
}

function matgoCardHtml(id,opts={}){
 const {clickable=false,back=false,selected=false,small=false,mark=''}=opts;
 if(back)return `<span class="matgo-card back ${small?'small':''}"><img src="assets/hwatu/back.png" alt="화투 뒷면"></span>`;
 const m=matgoMonth(id),k=matgoKind(id),alt=`${m}월 ${MATGO_NAMES[m-1]} ${MATGO_KIND_TEXT[k]}`;
 const tag=clickable?'button':'span';return `<${tag} class="matgo-card ${k} ${small?'small':''} ${selected?'selected':''}" ${clickable?`data-matgo-card="${id}"`:''}><img src="${matgoCardAsset(id)}" alt="${alt}">${mark?`<i>${matgoEsc(mark)}</i>`:''}</${tag}>`;
}
function matgoCapturedGroup(cards,kind,title){
 const arr=cards.filter(id=>{const k=matgoKind(id);if(kind==='animal')return k==='animal'||k==='animalpi';if(kind==='pi')return k==='pi'||k==='doublepi';return k===kind});
 return `<div class="matgo-capture-group"><b>${title}<em>${arr.length}</em></b><div>${arr.length?matgoSortCards(arr).map(id=>matgoCardHtml(id,{small:true})).join(''):'<span class="matgo-none">-</span>'}</div></div>`;
}
function matgoCapturedHtml(side){const p=matgoGame[side],s=matgoCurrentScore(side);return `<div class="matgo-captured-row">${matgoCapturedGroup(p.captured,'bright','광')}${matgoCapturedGroup(p.captured,'animal','열끗')}${matgoCapturedGroup(p.captured,'ribbon','띠')}${matgoCapturedGroup(p.captured,'pi','피')}</div><div class="matgo-score-tags"><strong>${s.total}점</strong><span>${p.goCount?`${p.goCount}고`:''}${p.shakeCount?` · 흔듦 ${p.shakeCount}`:''}${p.bombCount?` · 폭탄 ${p.bombCount}`:''}${p.ppukCount?` · 뻑 ${p.ppukCount}`:''}</span></div>`}

function matgoSetFullscreen(on=false){
 const modal=$('#modal');if(!modal)return;
 modal.classList.toggle('matgo-fullscreen',!!on);
 const closeButton=$('#closeModal');if(closeButton)closeButton.hidden=!!on;
}

function openMatgoLobby(message=''){
 matgoGame=null;
 matgoSetFullscreen(false);
 const carry=Math.max(1,Number(state?.minigames?.matgoCarry)||1);const money=Math.max(0,Number(state?.stats?.money)||0);
 showModal('후라보노AI 1:1 맞고',`<div class="matgo-lobby"><button id="matgoBackHub" class="community-back">← 대전 종목 선택</button><section class="matgo-intro"><div><small>HURABONO AI MATGO</small><h3>후라보노AI 1:1 맞고</h3><p>48장 화투로 실제 2인 맞고 방식에 가깝게 진행합니다. 점당 금액은 류현상 키우기의 가상 보유금과 연결됩니다.</p></div><span>🎴</span></section>${message?`<div class="online-quiz-notice">${matgoEsc(message)}</div>`:''}<div class="matgo-money"><span>현재 보유금</span><strong>${money.toLocaleString()}원</strong>${carry>1?`<em>이전 판 나가리: 다음 승부 ${carry}배</em>`:''}</div><section class="matgo-rate-grid">${MATGO_RATES.map(r=>`<button data-matgo-rate="${r}" ${money<r*MATGO_MIN_SCORE?'disabled':''}><span>점당</span><b>${r.toLocaleString()}원</b><small>최소 ${MATGO_MIN_SCORE}점 기준 ${(r*MATGO_MIN_SCORE).toLocaleString()}원 필요</small></button>`).join('')}</section><section class="matgo-rule-summary"><b>적용 룰</b><span>총통 · 흔들기 · 폭탄</span><span>뻑 · 자뻑 · 쪽 · 따닥 · 싹쓸이</span><span>홍단 · 청단 · 초단 · 고도리</span><span>피박 · 광박 · 멍따 · 고박</span><span>3고 이상 배수 · 나가리 이월</span><span>국진은 열끗/쌍피 중 유리한 쪽 자동 계산</span></section></div>`,'matgo');
 $('#matgoBackHub').onclick=()=>{matgoGame=null;openOnlineBattleHub()};$$('[data-matgo-rate]').forEach(b=>b.onclick=()=>startMatgo(Number(b.dataset.matgoRate)));
}

function matgoFreshDeal(){
 for(let tries=0;tries<100;tries++){
  const d=matgoShuffle([...Array(48).keys()]),player=d.slice(0,10),ai=d.slice(10,20),table=d.slice(20,28),deck=d.slice(28);
  const tg=matgoMonthGroups(table);if(Object.values(tg).some(x=>x.length===4))continue;
  return {player:matgoSortCards(player),ai:matgoSortCards(ai),table,deck};
 }
 const d=matgoShuffle([...Array(48).keys()]);return {player:matgoSortCards(d.slice(0,10)),ai:matgoSortCards(d.slice(10,20)),table:d.slice(20,28),deck:d.slice(28)};
}
function matgoFourMonth(hand){const g=matgoMonthGroups(hand);return Number(Object.keys(g).find(m=>g[m].length===4)||0)}
function startMatgo(rate){
 rate=MATGO_RATES.includes(rate)?rate:1000;if(state.stats.money<rate*MATGO_MIN_SCORE)return toast(`최소 ${(rate*MATGO_MIN_SCORE).toLocaleString()}원이 필요합니다.`);
 const deal=matgoFreshDeal();const first=Math.random()<.5?'player':'ai';
 matgoGame={active:true,finished:false,rate,turn:first,turnNo:0,deck:deal.deck,table:deal.table,ppukByMonth:{},pending:null,lastDrawn:null,lastPlayed:null,selectedCard:null,busy:false,animation:null,captureFlash:null,log:`${first==='player'?'류현상':'후라보노'}이 선입니다.`,sideMoney:0,
  player:{hand:deal.player,captured:[],goCount:0,lastDecisionScore:0,shakeCount:0,bombCount:0,bombCredits:0,shakenMonths:[],ppukCount:0},
  ai:{hand:deal.ai,captured:[],goCount:0,lastDecisionScore:0,shakeCount:0,bombCount:0,bombCredits:0,shakenMonths:[],ppukCount:0}};
 const p4=matgoFourMonth(deal.player),a4=matgoFourMonth(deal.ai);if(p4||a4){renderMatgo();setTimeout(()=>matgoFinish(p4?'player':'ai','chongtong',{points:10,month:p4||a4}),350);return}
 renderMatgo();if(first==='ai')matgoScheduleAi();
}

function matgoCanShake(side,month){const p=matgoGame[side];if(p.shakenMonths.includes(month))return false;return matgoCountMonth(p.hand,month)===3&&matgoCountMonth(matgoGame.table,month)===0}
function matgoBombMonths(side){const p=matgoGame[side],g=matgoMonthGroups(p.hand);return Object.keys(g).map(Number).filter(m=>g[m].length===3&&matgoCountMonth(matgoGame.table,m)===1)}
function matgoDeclareShake(side,month){if(!matgoGame?.active||matgoGame.turn!==side||!matgoCanShake(side,month))return;const p=matgoGame[side];p.shakenMonths.push(month);p.shakeCount++;matgoGame.log=`${side==='player'?'류현상':'후라보노'}: ${month}월 흔들기! 승리 시 2배.`;playSfx?.('click');renderMatgo();if(side==='ai')matgoScheduleAi(260)}
function matgoUseBomb(side,month){
 if(!matgoGame?.active||matgoGame.turn!==side)return;const p=matgoGame[side],cards=p.hand.filter(c=>matgoMonth(c)===month),floor=matgoGame.table.filter(c=>matgoMonth(c)===month);if(cards.length!==3||floor.length!==1)return;
 p.hand=p.hand.filter(c=>matgoMonth(c)!==month);matgoGame.table=matgoGame.table.filter(c=>matgoMonth(c)!==month);p.captured.push(...cards,...floor);p.bombCount++;p.bombCredits+=2;matgoGame.lastPlayed=cards[0];matgoGame.log=`${side==='player'?'류현상':'후라보노'}: ${month}월 폭탄! 상대 피 1장 뺏기.`;matgoStealPi(side,1);matgoDrawAndResolve(side,{bomb:true,playedMonth:month,initialMatches:1});
}

function matgoRunAnimation(type,side,cards,text,done,ms=360){
 if(!matgoGame?.active){if(typeof done==='function')done();return}
 matgoGame.busy=true;matgoGame.animation={type,side,cards:[...(cards||[])],text,id:Date.now()};renderMatgo();
 setTimeout(()=>{if(!matgoGame?.active)return;matgoGame.animation=null;matgoGame.busy=false;if(typeof done==='function')done()},ms);
}
function matgoCaptureFlash(side,cards,text='패를 가져갑니다.'){
 if(!matgoGame?.active||!cards?.length)return;const id=Date.now();matgoGame.captureFlash={side,cards:[...cards],text,id};
 setTimeout(()=>{if(matgoGame?.captureFlash?.id===id){matgoGame.captureFlash=null;if(matgoGame?.active)renderMatgo()}},650)
}
function matgoActionFxHtml(){const a=matgoGame?.animation||matgoGame?.captureFlash;if(!a)return '';const type=matgoGame?.animation?a.type:'capture';return `<div class="matgo-action-fx ${type} ${a.side==='player'?'me':'opponent'}"><div class="matgo-action-cards">${(a.cards||[]).map(id=>matgoCardHtml(id,{small:false})).join('')}</div><b>${matgoEsc(a.text||'')}</b></div>`}
function matgoHandlePlayerCard(card){
 if(!matgoGame?.active||matgoGame.turn!=='player'||matgoGame.pending||matgoGame.busy)return;
 if(!matgoGame.player.hand.includes(card))return;
 if(matgoGame.selectedCard===card){matgoGame.selectedCard=null;matgoPlay('player',card);return}
 matgoGame.selectedCard=card;matgoGame.log=`${matgoMonth(card)}월 패를 선택했습니다. 같은 패를 한 번 더 누르면 냅니다.`;playSfx?.('click');renderMatgo();
}

function matgoStealPi(side,count=1){const other=side==='player'?'ai':'player';for(let i=0;i<count;i++){const c=matgoPickPi(matgoGame[other].captured);if(c==null)break;const idx=matgoGame[other].captured.indexOf(c);matgoGame[other].captured.splice(idx,1);matgoGame[side].captured.push(c)}}
function matgoRemoveTable(id){const i=matgoGame.table.indexOf(id);if(i>=0)matgoGame.table.splice(i,1)}
function matgoAddCapture(side,cards){matgoGame[side].captured.push(...cards);matgoCaptureFlash(side,cards,`${side==='player'?'류현상':'후라보노'}이 패를 가져갑니다.`)}
function matgoChooseMatch(side,card,candidates,callback,label='먹을 패를 고르세요'){
 if(side==='ai'){const best=[...candidates].sort((a,b)=>matgoCardValue(b)-matgoCardValue(a))[0];callback(best);return}
 matgoGame.pending={type:'choose',card,candidates:[...candidates],label,callback};renderMatgo();
}
function matgoResolvePlayed(side,card,after){
 const month=matgoMonth(card),matches=matgoGame.table.filter(c=>matgoMonth(c)===month),ctx={played:card,playedMonth:month,initialMatches:matches.length,tempCapture:null,placed:false};
 if(matches.length===0){matgoGame.table.push(card);ctx.placed=true;after(ctx);return}
 if(matches.length===1){matgoRemoveTable(matches[0]);ctx.tempCapture=[card,matches[0]];after(ctx);return}
 if(matches.length===2){matgoChooseMatch(side,card,matches,chosen=>{matgoRemoveTable(chosen);ctx.tempCapture=[card,chosen];after(ctx)},'같은 월이 2장입니다. 먹을 패를 선택하세요.');return}
 // 3장: 뻑 먹기/자뻑
 for(const c of matches)matgoRemoveTable(c);matgoAddCapture(side,[card,...matches]);const owner=matgoGame.ppukByMonth[month];delete matgoGame.ppukByMonth[month];const self=owner===side;matgoStealPi(side,self?2:1);matgoGame.log=`${self?'자뻑':'뻑 먹기'}! ${side==='player'?'류현상':'후라보노'}이 ${self?2:1}피를 가져갑니다.`;after(ctx);
}
function matgoDrawAndResolve(side,ctx){
 if(!matgoGame.deck.length){matgoAfterTurn(side);return}
 const draw=matgoGame.deck.shift();matgoGame.lastDrawn=draw;
 matgoRunAnimation('draw',side,[draw],`${side==='player'?'류현상':'후라보노'}이 더미에서 패를 뒤집습니다.`,()=>matgoResolveDraw(side,ctx,draw),390);
}
function matgoResolveDraw(side,ctx,draw){
 if(!matgoGame?.active)return;const dm=matgoMonth(draw);
 // 뻑: 손에서 낸 패가 1장을 맞췄고, 뒤집은 패가 같은 월
 if(ctx.tempCapture&&ctx.initialMatches===1&&dm===ctx.playedMonth&&!ctx.bomb){
  matgoGame.table.push(...ctx.tempCapture,draw);ctx.tempCapture=null;matgoGame.ppukByMonth[dm]=side;matgoGame[side].ppukCount++;matgoGame.log=`뻑! ${side==='player'?'류현상':'후라보노'}이 ${dm}월을 쌌습니다.`;
  if(matgoGame.turnNo===0){const bonus=7*matgoGame.rate;matgoGame.sideMoney+=(side==='player'?bonus:-bonus);matgoGame.log+=` 첫뻑 보너스 ${bonus.toLocaleString()}원.`}
  matgoAfterTurn(side);return;
 }
 if(ctx.tempCapture){matgoAddCapture(side,ctx.tempCapture);ctx.tempCapture=null}
 const matches=matgoGame.table.filter(c=>matgoMonth(c)===dm);
 if(matches.length===0){matgoGame.table.push(draw);matgoAfterDrawSpecials(side,ctx,draw,false);return}
 if(matches.length===1){
  const match=matches[0];matgoRemoveTable(match);matgoAddCapture(side,[draw,match]);
  const isJjok=ctx.initialMatches===0&&ctx.placed&&dm===ctx.playedMonth&&match===ctx.played;const isDdadak=ctx.initialMatches===2&&dm===ctx.playedMonth;
  if(isJjok){matgoStealPi(side,1);matgoGame.log='쪽! 상대 피 1장을 가져갑니다.'}else if(isDdadak){matgoStealPi(side,1);matgoGame.log='따닥! 상대 피 1장을 가져갑니다.'}
  matgoAfterDrawSpecials(side,ctx,draw,true);return;
 }
 if(matches.length===2){matgoChooseMatch(side,draw,matches,chosen=>{matgoRemoveTable(chosen);matgoAddCapture(side,[draw,chosen]);matgoAfterDrawSpecials(side,ctx,draw,true)},'뒤집은 패와 같은 월이 2장입니다. 먹을 패를 선택하세요.');return}
 for(const c of matches)matgoRemoveTable(c);matgoAddCapture(side,[draw,...matches]);const owner=matgoGame.ppukByMonth[dm];delete matgoGame.ppukByMonth[dm];const self=owner===side;matgoStealPi(side,self?2:1);matgoGame.log=`${self?'자뻑':'뻑 먹기'}! 상대 피 ${self?2:1}장을 가져갑니다.`;matgoAfterDrawSpecials(side,ctx,draw,true);
}
function matgoAfterDrawSpecials(side,ctx,draw,captured){
 if(matgoGame.table.length===0){matgoStealPi(side,1);matgoGame.log=(matgoGame.log?matgoGame.log+' ':'')+'싹쓸이! 상대 피 1장을 가져갑니다.'}
 matgoAfterTurn(side);
}
function matgoPlay(side,card){
 if(!matgoGame?.active||matgoGame.turn!==side||matgoGame.pending||matgoGame.busy)return;const p=matgoGame[side];if(!p.hand.includes(card))return;
 p.hand.splice(p.hand.indexOf(card),1);matgoGame.selectedCard=null;matgoGame.lastPlayed=card;matgoGame.log=`${side==='player'?'류현상':'후라보노'}이 ${matgoMonth(card)}월 패를 냅니다.`;
 matgoRunAnimation('play',side,[card],`${side==='player'?'류현상':'후라보노'}이 ${matgoMonth(card)}월 패를 냅니다.`,()=>matgoResolvePlayed(side,card,ctx=>matgoDrawAndResolve(side,ctx)),360);
}
function matgoSkipBombTurn(side){const p=matgoGame[side];if(!p.bombCredits)return false;p.bombCredits--;matgoGame.lastPlayed=null;matgoGame.log=`${side==='player'?'류현상':'후라보노'}이 폭탄 빈패를 사용하고 더미만 뒤집습니다.`;matgoDrawAndResolve(side,{bombSkip:true,playedMonth:0,initialMatches:-1,tempCapture:null,placed:false});return true}
function matgoCanAct(side){const p=matgoGame?.[side];return !!(p&&((p.hand?.length||0)>0||(p.bombCredits||0)>0))}
function matgoRoundEnded(){return !!(matgoGame&&(matgoGame.deck.length===0||(!matgoCanAct('player')&&!matgoCanAct('ai'))))}
function matgoExhausted(){return matgoRoundEnded()}

function matgoAfterTurn(side){
 if(!matgoGame?.active)return;matgoGame.pending=null;matgoGame.selectedCard=null;matgoGame[side].hand=matgoSortCards(matgoGame[side].hand);matgoGame.turnNo++;
 const score=matgoCurrentScore(side),p=matgoGame[side],ended=matgoRoundEnded();
 if(score.total>=MATGO_MIN_SCORE&&score.total>p.lastDecisionScore){
  // 더미의 마지막 패를 뒤집은 직후에는 GO를 받을 다음 턴 자체가 없으므로 자동 STOP.
  if(ended){matgoGame.log=`마지막 패입니다. ${side==='player'?'류현상':'후라보노'} 자동 STOP!`;renderMatgo();setTimeout(()=>matgoFinish(side,'stop'),220);return}
  matgoGame.pending={type:'decision',side,score:score.total};renderMatgo();if(side==='ai')setTimeout(()=>matgoAiDecision(),520);return;
 }
 if(ended){return matgoFinish(null,'nagari')}
 const next=side==='player'?'ai':'player';
 // 정상 게임에서는 발생하지 않지만 폭탄/빈패 조합 등으로 다음 사람이 행동할 카드가 없어지는 상태를 안전 종료한다.
 if(!matgoCanAct(next)){matgoGame.log='더 진행할 수 있는 패가 없어 판을 종료합니다.';return matgoFinish(null,'nagari')}
 matgoGame.turn=next;renderMatgo();if(matgoGame.turn==='ai')matgoScheduleAi();
}
function matgoGoStop(side,go){
 if(!matgoGame?.active||matgoGame.pending?.type!=='decision'||matgoGame.pending.side!==side)return;const p=matgoGame[side];
 if(!go)return matgoFinish(side,'stop');
 // 구버전/캐시에서 마지막 패 GO 선택창이 남아 있어도 더 이상 빈 턴으로 넘기지 않는다.
 if(matgoRoundEnded()){matgoGame.log='마지막 패라 더 진행할 수 없어 자동 STOP 처리됩니다.';return matgoFinish(side,'stop')}
 p.goCount++;p.lastDecisionScore=matgoCurrentScore(side).total;matgoGame.pending=null;matgoGame.log=`${side==='player'?'류현상':'후라보노'}: GO! 현재 ${p.goCount}고.`;matgoGame.turn=side==='player'?'ai':'player';renderMatgo();if(matgoGame.turn==='ai')matgoScheduleAi();
}

function matgoAiChoice(){
 const p=matgoGame.ai,bombs=matgoBombMonths('ai');if(bombs.length)return {bomb:bombs[0]};
 const shakeMonths=[...new Set(p.hand.map(matgoMonth))].filter(m=>matgoCanShake('ai',m));if(shakeMonths.length){const m=shakeMonths[0];matgoDeclareShake('ai',m);return null}
 let best=null,bestScore=-1e9;for(const c of p.hand){const matches=matgoGame.table.filter(x=>matgoMonth(x)===matgoMonth(c));let v=matgoCardValue(c)*.25;if(matches.length)v+=Math.max(...matches.map(matgoCardValue))*2+matches.length*3;else v-=matgoCardValue(c)*.12;const m=matgoMonth(c);if(p.hand.filter(x=>matgoMonth(x)===m).length>=2)v-=1.5;if(v>bestScore){bestScore=v;best=c}}
 return {card:best??p.hand[0]};
}
function matgoScheduleAi(delay=720){setTimeout(()=>{if(!matgoGame?.active||matgoGame.turn!=='ai'||matgoGame.pending)return;if(matgoRoundEnded()){const ps=matgoCurrentScore('player').total,as=matgoCurrentScore('ai').total;if(as>=MATGO_MIN_SCORE&&as>=ps)return matgoFinish('ai','stop');if(ps>=MATGO_MIN_SCORE)return matgoFinish('player','stop');return matgoFinish(null,'nagari')}if(matgoSkipBombTurn('ai'))return;if(!matgoGame.ai.hand.length){matgoGame.log='후라보노가 낼 패가 없어 판을 종료합니다.';return matgoFinish(null,'nagari')}const choice=matgoAiChoice();if(!choice||choice.card==null&&!choice.bomb)return matgoFinish(null,'nagari');if(choice.bomb)matgoUseBomb('ai',choice.bomb);else matgoPlay('ai',choice.card)},delay)}
function matgoAiDecision(){if(!matgoGame?.active||matgoGame.pending?.type!=='decision'||matgoGame.pending.side!=='ai')return;const s=matgoCurrentScore('ai').total,opp=matgoCurrentScore('player').total,left=matgoGame.deck.length;let go=s<=7&&opp<5&&left>8?Math.random()<.55:s<=8&&opp<6&&left>10?Math.random()<.3:false;if(s>=10||opp>=7||left<=5)go=false;matgoGoStop('ai',go)}

function matgoSettleMoney(net){
 net=Math.trunc(net);if(!net)return 0;
 // 손실액 전체를 본게임 돈 시스템에 넘긴다. 보유금을 초과한 금액은 stat('money')가 자동으로 채무로 전환한다.
 stat('money',net);return net;
}
function matgoFinish(winner,reason='stop',extra={}){
 if(!matgoGame||matgoGame.finished)return;matgoGame.finished=true;matgoGame.active=false;matgoGame.pending=null;
 let title='',body='',net=matgoGame.sideMoney||0,points=0,mult=1,tags=[];
 if(reason==='nagari'||!winner){
  const old=Math.max(1,Number(state.minigames?.matgoCarry)||1);state.minigames.matgoCarry=Math.min(8,old*2);title='나가리';body=`아무도 ${MATGO_MIN_SCORE}점을 넘겨 스톱하지 못했습니다. 다음 맞고 승부는 ${state.minigames.matgoCarry}배로 계산됩니다.`;points=0;
 }else if(reason==='chongtong'){
  const carry=Math.max(1,Number(state.minigames?.matgoCarry)||1);points=extra.points||10;mult=carry;const amount=points*matgoGame.rate*mult;net+=(winner==='player'?amount:-amount);title=`${winner==='player'?'류현상':'후라보노'} 총통 승리!`;body=`${extra.month||''}월 4장을 손에 쥔 총통으로 즉시 ${points}점 승리했습니다.`;state.minigames.matgoCarry=1;
 }else{
  const loser=winner==='player'?'ai':'player',r=matgoFinalBreakdown(winner,loser);points=r.score;mult=r.mult;tags=r.tags;const amount=r.finalPoints*matgoGame.rate;net+=(winner==='player'?amount:-amount);title=`${winner==='player'?'류현상':'후라보노'} 승리!`;body=`${points}점 × 최종 ${mult}배 = ${r.finalPoints}점`;state.minigames.matgoCarry=1;
 }
 const debtBefore=Math.max(0,Number(state.economy?.debt)||0),settled=matgoSettleMoney(net),debtAdded=Math.max(0,(Number(state.economy?.debt)||0)-debtBefore);state.minigames.matgoPlayed=(state.minigames.matgoPlayed||0)+1;if(winner==='player')state.minigames.matgoWins=(state.minigames.matgoWins||0)+1;state.minigames.matgoBest=Math.max(state.minigames.matgoBest||0,points*mult);
 addHistory(`🎴 후라보노AI 맞고 · ${title} · ${settled>=0?'+':''}${settled.toLocaleString()}원${debtAdded?` · 채무 +${debtAdded.toLocaleString()}원`:''}`,`matgo:${state.day}:${Date.now()}`);save(false);render();playSfx?.(winner==='player'?'success':winner==='ai'?'fail':'click');
 showModal('후라보노AI 1:1 맞고 · 결과',`<div class="matgo-result ${winner==='player'?'win':winner==='ai'?'lose':'draw'}"><small>MATGO RESULT</small><h2>${title}</h2><p>${body}</p>${tags.length?`<div class="matgo-result-tags">${tags.map(x=>`<span>${matgoEsc(x)}</span>`).join('')}</div>`:''}<div class="matgo-settlement"><span>점당 ${matgoGame.rate.toLocaleString()}원</span><strong>${settled>=0?'+':''}${settled.toLocaleString()}원</strong><small>현재 보유금 ${state.stats.money.toLocaleString()}원 · 채무 ${(state.economy?.debt||0).toLocaleString()}원${debtAdded?` · 이번 판 채무 +${debtAdded.toLocaleString()}원`:''}${matgoGame.sideMoney?` · 첫뻑 정산 포함`:''}</small></div><div class="matgo-result-actions"><button id="matgoAgain" class="primary">같은 판돈으로 한 판 더</button><button id="matgoLobbyBtn">판돈 다시 고르기</button><button id="matgoHubBtn">대전 메뉴</button></div></div>`,'matgo');
 $('#matgoAgain').onclick=()=>startMatgo(matgoGame.rate);$('#matgoLobbyBtn').onclick=()=>openMatgoLobby();$('#matgoHubBtn').onclick=()=>{matgoGame=null;openOnlineBattleHub()};
}

function renderMatgo(){
 if(!matgoGame)return;
 matgoSetFullscreen(true);const g=matgoGame,turnPlayer=g.turn==='player',ps=matgoCurrentScore('player'),as=matgoCurrentScore('ai'),pendingChoice=g.pending?.type==='choose',pendingDecision=g.pending?.type==='decision';
 const canPlay=g.active&&turnPlayer&&!g.pending&&!g.busy;const playerHand=g.player.hand.map(id=>matgoCardHtml(id,{clickable:canPlay,selected:g.selectedCard===id})).join('');const aiBacks=g.ai.hand.map(()=>matgoCardHtml(0,{back:true,small:true})).join('');
 const bombMonths=canPlay?matgoBombMonths('player'):[];const shakeMonths=canPlay?[...new Set(g.player.hand.map(matgoMonth))].filter(m=>matgoCanShake('player',m)):[];
 const choiceHtml=pendingChoice?`<div class="matgo-overlay-choice"><div><b>${matgoEsc(g.pending.label)}</b><div class="matgo-choice-cards">${g.pending.candidates.map(id=>matgoCardHtml(id,{clickable:false})).join('')}</div><div class="matgo-choice-buttons">${g.pending.candidates.map(id=>`<button data-matgo-choice="${id}">${matgoMonth(id)}월 ${MATGO_KIND_TEXT[matgoKind(id)]}</button>`).join('')}</div></div></div>`:'';
 const decisionHtml=pendingDecision&&g.pending.side==='player'?`<div class="matgo-overlay-choice decision"><div><small>현재 ${g.pending.score}점</small><b>GO / STOP</b><p>${matgoExhausted()?'마지막 패라 더 진행할 수 없습니다. STOP으로 승부를 끝내세요.':'계속 가면 더 큰 배수를 노릴 수 있지만 역전되면 고박을 맞을 수 있습니다.'}</p><div class="matgo-decision-buttons"><button id="matgoGo" class="primary" ${matgoExhausted()?'disabled':''}>GO</button><button id="matgoStop">STOP</button></div></div></div>`:'';
 $('#modalTitle').textContent='후라보노AI 1:1 맞고';$('#modalBody').innerHTML=`<div class="matgo-board">${choiceHtml}${decisionHtml}${matgoActionFxHtml()}<header class="matgo-board-top"><div><b>점당 ${g.rate.toLocaleString()}원</b><span>더미 ${g.deck.length}장</span></div><strong class="${g.turn==='player'?'me':''}">${g.log}</strong><button id="matgoForfeit">기권</button></header><section class="matgo-opponent"><div class="matgo-player-info"><span>후라보노</span><strong>${as.total}점</strong><small>${g.turn==='ai'&&!g.pending?'생각 중...':`손패 ${g.ai.hand.length}장`}</small></div><div class="matgo-opponent-hand">${aiBacks}</div>${matgoCapturedHtml('ai')}</section><section class="matgo-center"><div class="matgo-table-area"><div class="matgo-table-cards">${g.table.length?matgoSortCards(g.table).map(id=>matgoCardHtml(id,{mark:g.ppukByMonth[matgoMonth(id)]?'뻑':''})).join(''):'<span class="matgo-empty-table">바닥이 비었습니다</span>'}</div><div class="matgo-deck-stack"><span class="matgo-card back"><img src="assets/hwatu/back.png" alt="더미"></span><b>${g.deck.length}</b></div></div></section><section class="matgo-me">${matgoCapturedHtml('player')}<div class="matgo-hand-head"><div><span>류현상</span><strong>${ps.total}점</strong></div><small>${canPlay?(g.selectedCard!=null?'선택한 패를 한 번 더 누르면 냅니다.':'낼 패를 한 번 눌러 선택하세요.'):(g.busy?'패가 이동하는 중...':g.turn==='ai'?'후라보노 차례입니다.':'선택을 마쳐 주세요.')}</small></div>${(bombMonths.length||shakeMonths.length)?`<div class="matgo-special-actions">${bombMonths.map(m=>`<button data-matgo-bomb="${m}">💥 ${m}월 폭탄</button>`).join('')}${shakeMonths.map(m=>`<button data-matgo-shake="${m}">〰️ ${m}월 흔들기</button>`).join('')}</div>`:''}<div class="matgo-my-hand" style="--hand-count:${Math.max(1,g.player.hand.length)}">${playerHand}</div></section></div>`;
 $$('[data-matgo-card]').forEach(b=>b.onclick=()=>matgoHandlePlayerCard(Number(b.dataset.matgoCard)));$$('[data-matgo-bomb]').forEach(b=>b.onclick=()=>matgoUseBomb('player',Number(b.dataset.matgoBomb)));$$('[data-matgo-shake]').forEach(b=>b.onclick=()=>matgoDeclareShake('player',Number(b.dataset.matgoShake)));
 $$('[data-matgo-choice]').forEach(b=>b.onclick=()=>{const p=g.pending;if(!p||p.type!=='choose')return;const id=Number(b.dataset.matgoChoice);const cb=p.callback;g.pending=null;cb(id)});if($('#matgoGo'))$('#matgoGo').onclick=()=>matgoGoStop('player',true);if($('#matgoStop'))$('#matgoStop').onclick=()=>matgoGoStop('player',false);$('#matgoForfeit').onclick=()=>matgoRequestClose();
 if(canPlay&&g.player.bombCredits>0){setTimeout(()=>{if(matgoGame?.active&&matgoGame.turn==='player'&&!matgoGame.pending&&matgoGame.player.bombCredits>0)matgoSkipBombTurn('player')},260)}
}

function matgoIsActive(){return !!(matgoGame?.active&&!matgoGame?.finished)}
function matgoRequestClose(){if(!matgoIsActive()){matgoGame=null;matgoSetFullscreen(false);closeModal(true);return}if(!confirm('맞고를 기권하면 현재 판은 후라보노의 7점 승리로 정산됩니다. 기권할까요?'))return;matgoFinish('ai','forfeit')}
window.matgoIsActive=matgoIsActive;window.matgoRequestClose=matgoRequestClose;window.openMatgoLobby=openMatgoLobby;

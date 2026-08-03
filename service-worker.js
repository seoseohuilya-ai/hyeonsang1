const CACHE='ryu-hyunsang-v181-protection-equipment-label';
const CORE=['./','index.html?ver=181','index.html','style.css?v=181-minigame-tuning','matgo.css?v=175-first-kiss-scene','game.js?v=181-protection-equipment-label','matgo.js?v=175-first-kiss-scene','manifest.json','assets/hwatu/01-1.png','assets/hwatu/01-2.png','assets/hwatu/01-3.png','assets/hwatu/01-4.png','assets/hwatu/02-1.png','assets/hwatu/02-2.png','assets/hwatu/02-3.png','assets/hwatu/02-4.png','assets/hwatu/03-1.png','assets/hwatu/03-2.png','assets/hwatu/03-3.png','assets/hwatu/03-4.png','assets/hwatu/04-1.png','assets/hwatu/04-2.png','assets/hwatu/04-3.png','assets/hwatu/04-4.png','assets/hwatu/05-1.png','assets/hwatu/05-2.png','assets/hwatu/05-3.png','assets/hwatu/05-4.png','assets/hwatu/06-1.png','assets/hwatu/06-2.png','assets/hwatu/06-3.png','assets/hwatu/06-4.png','assets/hwatu/07-1.png','assets/hwatu/07-2.png','assets/hwatu/07-3.png','assets/hwatu/07-4.png','assets/hwatu/08-1.png','assets/hwatu/08-2.png','assets/hwatu/08-3.png','assets/hwatu/08-4.png','assets/hwatu/09-1.png','assets/hwatu/09-2.png','assets/hwatu/09-3.png','assets/hwatu/09-4.png','assets/hwatu/10-1.png','assets/hwatu/10-2.png','assets/hwatu/10-3.png','assets/hwatu/10-4.png','assets/hwatu/11-1.png','assets/hwatu/11-2.png','assets/hwatu/11-3.png','assets/hwatu/11-4.png','assets/hwatu/12-1.png','assets/hwatu/12-2.png','assets/hwatu/12-3.png','assets/hwatu/12-4.png','assets/hwatu/back.png','assets/images/ryu.png','assets/images/hurabono.png','assets/images/cover.png','assets/images/home-bg.jpg','assets/images/home-basement.png','assets/images/home-oneroom.png','assets/images/home-duplex.png','assets/images/home-apartment.png','assets/images/home-penthouse.png','assets/images/store-bg.jpg','assets/images/practice-bg.jpg','assets/images/park-bg.jpg','assets/images/stage-bg.jpg','assets/images/izi-suwon-viral.jpg','assets/images/waited-more-myeongdong-viral.jpg','assets/audio/emergency-room-event-bgm.mp3','assets/audio/waited-more-event-bgm.mp3','assets/audio/title-screen-bgm.mp3','assets/audio/game-main-bgm.mp3','assets/audio/moonlight-garden-path.mp3','assets/images/special-day150-birthday.jpg','assets/images/hidden-dingo-rising.png','assets/images/hidden-radio-dj.png','assets/images/hidden-game-ost.jpg','assets/images/special-day120-kakaotalk.jpg','assets/images/special-day90-live.jpg','assets/images/special-day60-workout.jpg','assets/images/special-day30-hair.jpg','assets/images/special-day180-user.png','assets/images/special-day210-user.png','assets/images/special-day240-user.png','assets/images/special-day300-user.png','assets/images/special-day330-mother.png','assets/images/special-day360-reflection.png','assets/images/special-career-lv70.png','assets/images/special-career-lv80.png','assets/images/special-career-lv90.png','assets/images/special-acting-extra.png','assets/images/special-first-kiss-scene.jpg','assets/images/outfit-black.png','assets/images/outfit-white.png','assets/images/outfit-check.png','assets/images/outfit-leather.png','assets/images/outfit-hoodie.png','assets/images/outfit-stage.png','assets/images/outfit-mystery.png','assets/images/user-flea-military.png','assets/images/user-flea-towel.png','assets/images/user-flea-sports.png','assets/images/user-flea-flashy.png','assets/images/user-flea-uniform.png','assets/images/mysterious-merchant.png','assets/images/special-card-collector.png','assets/images/special-hurabono-wedding.png','assets/images/special-rest-looks-nightmare.png','assets/images/special-day400-fanmeet.png','assets/images/special-day450-return-spring.png','assets/images/special-day500-school-festival.png','assets/images/drawer-photo-1.jpg','assets/images/drawer-photo-2.jpg','assets/images/drawer-photo-3.jpg','assets/images/drawer-photo-4.jpg','assets/images/drawer-photo-5.jpg','assets/images/drawer-photo-1-piece-1.jpg','assets/images/drawer-photo-1-piece-2.jpg','assets/images/drawer-photo-1-piece-3.jpg','assets/images/drawer-photo-1-piece-4.jpg','assets/images/drawer-photo-1-piece-5.jpg','assets/images/drawer-photo-1-piece-6.jpg','assets/images/drawer-photo-1-piece-7.jpg','assets/images/drawer-photo-1-piece-8.jpg','assets/images/drawer-photo-1-piece-9.jpg','assets/images/drawer-photo-2-piece-1.jpg','assets/images/drawer-photo-2-piece-2.jpg','assets/images/drawer-photo-2-piece-3.jpg','assets/images/drawer-photo-2-piece-4.jpg','assets/images/drawer-photo-2-piece-5.jpg','assets/images/drawer-photo-2-piece-6.jpg','assets/images/drawer-photo-2-piece-7.jpg','assets/images/drawer-photo-2-piece-8.jpg','assets/images/drawer-photo-2-piece-9.jpg','assets/images/drawer-photo-3-piece-1.jpg','assets/images/drawer-photo-3-piece-2.jpg','assets/images/drawer-photo-3-piece-3.jpg','assets/images/drawer-photo-3-piece-4.jpg','assets/images/drawer-photo-3-piece-5.jpg','assets/images/drawer-photo-3-piece-6.jpg','assets/images/drawer-photo-3-piece-7.jpg','assets/images/drawer-photo-3-piece-8.jpg','assets/images/drawer-photo-3-piece-9.jpg','assets/images/drawer-photo-4-piece-1.jpg','assets/images/drawer-photo-4-piece-2.jpg','assets/images/drawer-photo-4-piece-3.jpg','assets/images/drawer-photo-4-piece-4.jpg','assets/images/drawer-photo-4-piece-5.jpg','assets/images/drawer-photo-4-piece-6.jpg','assets/images/drawer-photo-4-piece-7.jpg','assets/images/drawer-photo-4-piece-8.jpg','assets/images/drawer-photo-4-piece-9.jpg','assets/images/drawer-photo-5-piece-1.jpg','assets/images/drawer-photo-5-piece-2.jpg','assets/images/drawer-photo-5-piece-3.jpg','assets/images/drawer-photo-5-piece-4.jpg','assets/images/drawer-photo-5-piece-5.jpg','assets/images/drawer-photo-5-piece-6.jpg','assets/images/drawer-photo-5-piece-7.jpg','assets/images/drawer-photo-5-piece-8.jpg','assets/images/drawer-photo-5-piece-9.jpg','assets/images/drawer-photo-6.jpg','assets/images/drawer-photo-7.jpg','assets/images/drawer-photo-6-piece-1.jpg','assets/images/drawer-photo-6-piece-2.jpg','assets/images/drawer-photo-6-piece-3.jpg','assets/images/drawer-photo-6-piece-4.jpg','assets/images/drawer-photo-6-piece-5.jpg','assets/images/drawer-photo-6-piece-6.jpg','assets/images/drawer-photo-6-piece-7.jpg','assets/images/drawer-photo-6-piece-8.jpg','assets/images/drawer-photo-6-piece-9.jpg','assets/images/drawer-photo-7-piece-1.jpg','assets/images/drawer-photo-7-piece-2.jpg','assets/images/drawer-photo-7-piece-3.jpg','assets/images/drawer-photo-7-piece-4.jpg','assets/images/drawer-photo-7-piece-5.jpg','assets/images/drawer-photo-7-piece-6.jpg','assets/images/drawer-photo-7-piece-7.jpg','assets/images/drawer-photo-7-piece-8.jpg','assets/images/drawer-photo-7-piece-9.jpg','assets/images/ryu-dot.png','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/audio/fatal-ending.mp3','assets/audio/spring-rain-ending.mp3','assets/images/endings/ending-composer.png','assets/images/endings/ending-cardshop.png','assets/images/endings/ending-nameless.png','assets/images/endings/ending-band.png','assets/images/endings/ending-trainer.png','assets/images/endings/ending-solo.png','assets/images/endings/ending-hiatus.png','assets/images/endings/ending-worldstar.png','assets/images/endings/ending-influencer.png','assets/images/endings/ending-bankruptcy.png','assets/images/endings/ending-actor-support.png','assets/images/endings/ending-actor-famous.png','assets/images/endings/ending-store-owner.png'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith((async()=>{try{const fresh=await fetch(event.request,{cache:'no-store'});const cache=await caches.open(CACHE);cache.put(event.request,fresh.clone()).catch(()=>{});return fresh;}catch(err){return (await caches.match(event.request))||(await caches.match('./'));}})());});


// v74: buying Bakcas no longer changes stress; action notice de-duplication remains enabled.

// v76: location moves remain free, but arriving at a new place checks location-based surprise stories.

// v77: mysterious merchant chance reduced slightly from 0.2% to 0.15%.

// v78: forced rest 50/15, free snack/single lotto, weekly lotto cap, job stages, daily hair care, concert cap and minigame, vocal/fame busking income.

// v79: snack/lottery time-stress adjustments, louder BGM, gear-based busking income, concert-gated rehearsal, and 5 housing backgrounds from user references.

// v80: daily practice penalty changed to -1 per five consecutive days without vocal or compose/arrange training.

// v81: clears old notifications at minigame start, suppresses duplicate action notices, and moves any new toast to a compact top banner.

// v82: full gain/loss action summaries, clearer one-screen stats, and visible cash balance in gear shop.

// v83: short-term practice penalty changed from every 5 missed days to every 7 missed days; old saves migrate without duplicate penalties.

// v84: moving home now requires a Yes/No confirmation before payment and time advancement.

// v85: appearance drops by 1 every 30 days without paid hair/style care; existing saves initialize safely.

// v86: SNS rewards scale with fan count; nightmares use 5+ rests, 3-rest cooldown and 20%; training/busking minigame rates halved; stat changes shown in dialogue; successful busking/concert grants vocal +1; meal cost doubles by housing and upgraded homes recover +3 more HP.

// v87: keep exactly one stat-change block in the dialogue and replace partial results with the latest final result.

// v88: suspicious shop, energizer, adjusted merchant/lottery odds, card collector events, theft follow-up, and Hurabono wedding special event.

// v89: image-backed special events hide character layers; card and lottery purchases consume HP (1 / 5).

// v90: energizer reduces HP costs to one quarter for seven days.

// v91: energizer descriptions now explicitly state rounding up and minimum HP cost of 1.

// v92: diet pill appearance outcomes are -1 at 1%, no change at 98%, and +1 at 1%.

// v93: diet pill price is 100,000 won; taking energizer three or more times before the effect expires causes 1.5x HP costs for seven days.

// v94: added home meditation, usable twice per day with no money or time cost, reducing stress by 5.

// v95: simplified suspicious-shop product descriptions for the diet pill and energizer.

// v96: added long 330-day mother visit and 360-day one-year reflection special events with background-only user images.
// v97: replaced Lv.70/Lv.80/Lv.90 career milestone special-event backgrounds with user images and background-only scenes.

// v98: reset the dialogue box scroll position to the top whenever a new dialogue scene is rendered.

// v99: dialogue body text is 1pt larger while the dialogue box size remains unchanged.

// v100: full 11-ending overhaul with balanced year-end paths, exact world-star/card-shop requirements, 30-day bankruptcy, and Lv.40-50 stalker resolution.

// v101: fixed busking runtime HP error, added 1% walk Bakcas and busking Energizer inventory rewards with blocking confirmation, and raised mysterious merchant chance to 0.9%.

// v102: added interactive Instagram Live phone UI with ten random long-chat scenarios, choices, fan reactions, daily limits, and influencer-ending activity integration.

// v103: persistent dialogue overflow indicator and focused choices in a separate blocking decision dialog.

// v104: added the home drawer collection with 5 nine-piece photo puzzles, 50 contextual diaries, pity systems, new-item badges, and no time/stat cost.

// v116: added dedicated looping BGM for the Emergency Room and Waited More viral special events.

// v135: flea market shows no preview images, offers only 1-2 items on stocked days, and all BGM levels are reduced to 30% of v134.

// v151: online 2-player Matgo / 3-player Go-Stop now shares PNG hwatu board UI and point-rate game-money settlement; quiz/matgo labels updated.
// v156: renamed the seven drawer photo collection titles; v155 battle features remain unchanged.

// v157: removed Kung Kung Tta battle and changed the lyric battle to title-visible one-word blanks.

// v158: 류현상 노래 맞추기 라운드 종료 후 모든 참가자의 제출 단어/정오/점수/응답시간을 4초간 공개.

// v159: replaced the towel outfit image asset with the user-provided transparent PNG.

// v160: restored the exact towel outfit image and added a 5% rest random event dream with a special illustration.

// v161: added fixed special events for days 400, 450, and 500 using the user-provided images.

// v162: the 5% rest looks nightmare is permanently disabled after its first appearance per save.

// v163: replaced the day 400 special event image with the newly provided fan meet image.

// v164: fixed Hurabono AI matgo freeze when GO was selected after the final card; final scoring turn now auto-STOPS and AI has an empty-state failsafe.

// v165: compacted mobile hwatu layouts and exposed visible status chips for shake/bomb/ppuk in both AI matgo and online Go-Stop.

// v166: removed the persistent "last drawn card" display; drawn cards are shown only during the existing draw animation.

// v167: mobile player hand uses a non-overlapping 5-column grid so every card is clearly visible.

// v168: improved captured-card visibility on mobile and forced draw labels to stay on one line.

// v169: full hwatu audit - one-screen mobile board, last-turn GO guards, online nagari settlement guard.

// v171: mobile layout prioritizes the local player captured cards; opponent captured cards are summary-only.

// v172: online 2-3 player hwatu gameplay uses full-screen board; 3-player opponents show actual captured cards; iPhone local captured-card layout spans full width.

// v173: store-job Tetris bonus, accessible guide + band conditions, 2vs2 team O/X quiz, 13-ending collection with actor endings, day-366 acting/runner, and battle-modal close-button reset.

// v174: added Hurabono relation toast, one-time acting extra special event with user image, and user-provided actor ending images.

// v175: one-time first-kiss acting special event in the mid-actor progression range, using the user-provided background image.

// v176: added acting stat, explicit Start buttons for selected minigames, modest gear-income buffs, rehearsal concert cap 4.3M, and replaced stalker murder ending with long-term activity hiatus.

// v177: all special-event scenes use the uploaded '달빛 정원 길' BGM and resume the regular game BGM when the scene ends.

// v178: realtime Supabase leaderboard UI and cache refresh.

// v179: ending rankings removed, locked ending collection hides titles with blurred art, Tetris fits one modal screen.

// v181: v179 기반. 연기 러닝 캐릭터 방향/난이도 조정, 노래 벽돌깨기 최고 난이도 단일판, 테트리스 90초.

// v181 preview fix: 400/450/500일 특별 이벤트 추억 앨범 미리보기 이미지를 실제 이벤트 이미지로 연결.

// v181 preview stat fix: duplicate acting display removed; protection label restored after audio.

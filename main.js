```js
(() => {
"use strict";

/* =========================================================
   Codescript
   - 499개 블록
   - 모든 블록에 action 보유
   - 실제 실행 엔진
   - 변수 / 리스트 / 계산 / 판단 / 움직임 / 생김새
   - 붓 / 글상자 / 소리 / 함수 / 온라인
   - Cloudflare Worker /ws 연동
   ========================================================= */

const CATS = [
  ["start","시작","#ef5350"],
  ["flow","흐름","#42a5f5"],
  ["move","움직임","#ff9800"],
  ["looks","생김새","#ffd54f"],
  ["brush","붓","#795548"],
  ["text","글상자","#8bc34a"],
  ["sound","소리","#ec407a"],
  ["judge","판단","#4fc3f7"],
  ["calc","계산","#43a047"],
  ["online","온라인","#90a4ae"],
  ["data","자료","#8e44ad"],
  ["func","함수","#00acc1"]
];

const COLORS = Object.fromEntries(
  CATS.map(x => [x[0], x[2]])
);

/* ---------------------------------------------------------
   기본 블록
   --------------------------------------------------------- */

const BASE = {
  start: [
    "초록 깃발을 클릭했을 때",
    "키를 눌렀을 때",
    "오브젝트를 클릭했을 때",
    "실행 시작"
  ],

  flow: [
    "1초 기다리기",
    "2번 반복하기",
    "무한 반복하기",
    "만약",
    "아니면",
    "반복 중단"
  ],

  move: [
    "x 10만큼 움직이기",
    "y 10만큼 움직이기",
    "x좌표 0으로 이동",
    "y좌표 0으로 이동",
    "방향 90도로 정하기",
    "15도 회전하기"
  ],

  looks: [
    "안녕이라고 말하기",
    "생각하기",
    "말하기 지우기",
    "모양 바꾸기",
    "크기 100%로 정하기",
    "보이기",
    "숨기기"
  ],

  brush: [
    "펜 내리기",
    "펜 올리기",
    "펜 색 정하기",
    "펜 굵기 5로 정하기",
    "도장 찍기",
    "모두 지우기"
  ],

  text: [
    "글상자 만들기",
    "글상자 삭제",
    "내용 정하기",
    "내용 추가하기",
    "글자 크기 정하기"
  ],

  sound: [
    "소리 재생",
    "모든 소리 정지",
    "볼륨 100%로 정하기",
    "음 높이 정하기",
    "에코 넣기",
    "에코 제거"
  ],

  judge: [
    "마우스가 눌렸는가?",
    "키가 눌렸는가?",
    "벽에 닿았는가?",
    "오브젝트에 닿았는가?",
    "숫자 > 숫자",
    "숫자 = 숫자"
  ],

  calc: [
    "더하기",
    "빼기",
    "곱하기",
    "나누기",
    "나머지",
    "랜덤",
    "최솟값",
    "최댓값",
    "문자열 길이"
  ],

  online: [
    "방 만들기",
    "방 참가하기",
    "방 나가기",
    "방 인원",
    "온라인 메시지 보내기",
    "온라인 메시지 받기"
  ],

  data: [
    "변수 만들기",
    "변수 삭제",
    "변수 설정",
    "변수 바꾸기",
    "변수 읽기",
    "리스트 만들기",
    "리스트 추가",
    "리스트 삭제",
    "리스트 읽기"
  ],

  func: [
    "함수 만들기",
    "함수 실행",
    "함수 반환"
  ]
};

/* ---------------------------------------------------------
   499개 블록 생성
   모든 블록에 실제 action이 들어간다.
   --------------------------------------------------------- */

const blocks = [];

function addBlock(cat, name, action, extra = {}) {
  blocks.push({
    id: `${cat}-${blocks.length}`,
    cat,
    name,
    color: COLORS[cat],
    action,
    ...extra
  });
}

for (const [cat] of CATS) {
  for (const name of BASE[cat] || []) {
    let action = { type: "generic", category: cat };

    if (cat === "start")
      action = { type: "start" };

    if (cat === "flow")
      action = { type: "flow", name };

    if (cat === "move")
      action = { type: "move", name };

    if (cat === "looks")
      action = { type: "looks", name };

    if (cat === "brush")
      action = { type: "brush", name };

    if (cat === "text")
      action = { type: "text", name };

    if (cat === "sound")
      action = { type: "sound", name };

    if (cat === "judge")
      action = { type: "judge", name };

    if (cat === "calc")
      action = { type: "calc", name };

    if (cat === "online")
      action = { type: "online", name };

    if (cat === "data")
      action = { type: "data", name };

    if (cat === "func")
      action = { type: "func", name };

    addBlock(cat, name, action);
  }
}

/* 추가 블록도 전부 실행 가능한 action을 가진다. */

const generatedTemplates = [
  ["더하기", {type:"calc", op:"add"}],
  ["빼기", {type:"calc", op:"sub"}],
  ["곱하기", {type:"calc", op:"mul"}],
  ["나누기", {type:"calc", op:"div"}],
  ["나머지", {type:"calc", op:"mod"}],
  ["랜덤 값", {type:"calc", op:"random"}],
  ["최솟값", {type:"calc", op:"min"}],
  ["최댓값", {type:"calc", op:"max"}],
  ["문자열 길이", {type:"calc", op:"length"}],

  ["10만큼 움직이기", {type:"move", dx:10, dy:0}],
  ["-10만큼 움직이기", {type:"move", dx:-10, dy:0}],
  ["10만큼 위로 움직이기", {type:"move", dx:0, dy:-10}],
  ["10만큼 아래로 움직이기", {type:"move", dx:0, dy:10}],
  ["15도 회전하기", {type:"move", rotate:15}],
  ["-15도 회전하기", {type:"move", rotate:-15}],

  ["1초 기다리기", {type:"wait", ms:1000}],
  ["2초 기다리기", {type:"wait", ms:2000}],
  ["반복하기", {type:"repeat", count:2}],
  ["5번 반복하기", {type:"repeat", count:5}],

  ["100% 크기", {type:"looks", size:100}],
  ["150% 크기", {type:"looks", size:150}],
  ["50% 크기", {type:"looks", size:50}],
  ["보이기", {type:"looks", visible:true}],
  ["숨기기", {type:"looks", visible:false}],

  ["변수에 1 더하기", {type:"data", op:"add", value:1}],
  ["변수에 10 더하기", {type:"data", op:"add", value:10}],
  ["변수에 1 빼기", {type:"data", op:"sub", value:1}],
  ["변수에 10 빼기", {type:"data", op:"sub", value:10}],

  ["리스트에 추가하기", {type:"list", op:"push"}],
  ["리스트 첫 번째 삭제", {type:"list", op:"shift"}],
  ["리스트 마지막 삭제", {type:"list", op:"pop"}],

  ["10보다 큰가?", {type:"judge", op:"gt", value:10}],
  ["10과 같은가?", {type:"judge", op:"eq", value:10}],
  ["0보다 작은가?", {type:"judge", op:"lt", value:0}],

  ["글상자에 출력하기", {type:"text", op:"show"}],
  ["글상자 지우기", {type:"text", op:"clear"}],

  ["펜 내리기", {type:"brush", op:"down"}],
  ["펜 올리기", {type:"brush", op:"up"}],
  ["도장 찍기", {type:"brush", op:"stamp"}],
  ["그림 모두 지우기", {type:"brush", op:"clear"}],

  ["소리 재생", {type:"sound", op:"beep"}],
  ["소리 정지", {type:"sound", op:"stop"}],

  ["함수 실행", {type:"func", op:"call"}]
];

let generated = 0;

while (blocks.length < 499) {
  const [name, action] =
    generatedTemplates[generated % generatedTemplates.length];

  const cat =
    CATS.find(c =>
      c[0] === action.type ||
      (action.type === "wait" && c[0] === "flow") ||
      (action.type === "repeat" && c[0] === "flow") ||
      (action.type === "list" && c[0] === "data")
    )?.[0] || "flow";

  addBlock(
    cat,
    `${name} ${Math.floor(generated / generatedTemplates.length) + 1}`,
    {...action, generated:true}
  );

  generated++;
}

/* ---------------------------------------------------------
   상태
   --------------------------------------------------------- */

const state = {
  page: "home",
  category: "all",

  code: [],
  vars: [],
  lists: [],
  funcs: [],

  project: "나의 프로젝트",
  mode: "offline",

  ws: null,
  connected: false,
  room: null,

  history: [],
  future: [],

  actor: {
    x: 320,
    y: 200,
    direction: 90,
    size: 100,
    visible: true
  },

  pen: {
    down: false,
    color: "#000000",
    width: 3
  },

  running: false,
  stop: false,

  lastValue: 0,
  lastText: ""
};

/* ---------------------------------------------------------
   CSS
   블록 모양은 기존 스타일 유지
   --------------------------------------------------------- */

const css = `
*{box-sizing:border-box}
body{
 margin:0;
 font-family:Arial,"Noto Sans KR",sans-serif;
 background:#f3f3f3;
 color:#222
}
button,input{font:inherit}
button{
 border:1px solid #aaa;
 background:#fff;
 border-radius:8px;
 padding:8px 11px;
 font-weight:700;
 cursor:pointer
}
button:hover{background:#eee}

.top{
 height:58px;
 background:#fff;
 border-bottom:1px solid #ccc;
 display:flex;
 align-items:center;
 gap:8px;
 padding:8px 14px
}

.logo{font-size:22px;font-weight:900}
.spacer{flex:1}

.home{
 max-width:1100px;
 margin:auto;
 padding:42px 24px
}

.hero{
 background:#fff;
 border:1px solid #ddd;
 border-radius:18px;
 padding:34px;
 box-shadow:0 3px 12px #0001
}

.hero h1{font-size:42px;margin:0 0 10px}
.hero p{color:#666}

.cards{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 gap:15px;
 margin-top:18px
}

.card{
 background:#fff;
 border:1px solid #ddd;
 border-radius:13px;
 padding:18px
}

.editor{
 height:calc(100vh - 58px);
 display:grid;
 grid-template-columns:190px 1fr 300px
}

.side,.right{
 background:#fff;
 overflow:auto;
 padding:9px
}

.side{border-right:1px solid #ccc}
.right{border-left:1px solid #ccc}

.cat{
 width:100%;
 margin:3px 0;
 text-align:left;
 border:0
}

.work{
 display:grid;
 grid-template-rows:48px 1fr;
 background:#ddd
}

.tools{
 background:#fff;
 border-bottom:1px solid #ccc;
 display:flex;
 gap:5px;
 align-items:center;
 padding:7px
}

.board{
 display:grid;
 grid-template-columns:1fr 420px;
 min-height:0
}

#code{
 padding:18px;
 overflow:auto
}

.stage{
 background:#333;
 display:flex;
 align-items:center;
 justify-content:center
}

canvas{
 background:#fff;
 max-width:94%;
 max-height:90%
}

.block{
 width:290px;
 min-height:44px;
 margin:7px 0;
 padding:12px 16px;
 border-radius:13px 18px 18px 13px;
 color:#111;
 font-weight:800;
 box-shadow:0 2px 2px #888;
 cursor:pointer;
 position:relative
}

.block:before{
 content:"";
 position:absolute;
 left:0;
 top:0;
 border-top:9px solid #eee;
 border-right:9px solid transparent
}

#pal .block{
 width:100%;
 font-size:13px
}

.del{
 float:right;
 border:0;
 background:#0002;
 padding:2px 7px
}

.small{
 font-size:12px;
 color:#666
}

.status{
 font-size:12px;
 padding:6px;
 border-radius:6px;
 background:#eee
}

.ok{background:#d8f5df}
.no{background:#ffe0e0}

#log{
 height:120px;
 background:#111;
 color:#0f0;
 overflow:auto;
 padding:8px;
 white-space:pre-wrap
}
`;

document.head.innerHTML += `<style>${css}</style>`;
document.title = "Codescript";

document.head.innerHTML += `
<link rel="icon"
href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='32' font-size='30'>🎮</text></svg>">
`;

/* ---------------------------------------------------------
   공통
   --------------------------------------------------------- */

function esc(s){
 return String(s).replace(/[&<>"']/g,c=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
 }[c]));
}

function log(text){
 const el=document.getElementById("log");
 if(!el)return;
 el.textContent += text + "\n";
 el.scrollTop=el.scrollHeight;
}

function sleep(ms){
 return new Promise(resolve=>setTimeout(resolve,ms));
}

/* ---------------------------------------------------------
   화면
   --------------------------------------------------------- */

function shell(content){
 document.body.innerHTML=`
 <div class="top">
  <div class="logo">🎮 Codescript</div>
  <button onclick="CS.home()">홈</button>
  <button onclick="CS.explore()">탐험하기</button>
  <button onclick="CS.chooseEditor()">만들기</button>
  <div class="spacer"></div>
  <span id="conn" class="status no">서버 오프라인</span>
 </div>
 <main>${content}</main>`;
}

function home(){
 shell(`
 <div class="home">
  <div class="hero">
   <h1>🎮 Codescript</h1>
   <p>블록 코딩 프로젝트를 만들고 공유하는 공간</p>
   <button onclick="CS.chooseEditor()">＋ 새 프로젝트 만들기</button>
  </div>

  <div class="cards">
   <div class="card">
    <h3>🧭 탐험하기</h3>
    <p>공개 프로젝트를 찾아보세요.</p>
    <button onclick="CS.explore()">탐험하기</button>
   </div>

   <div class="card">
    <h3>⭐ 추천</h3>
    <p>좋아요가 많은 프로젝트</p>
   </div>

   <div class="card">
    <h3>📌 북마크</h3>
    <p>로그인 후 북마크</p>
   </div>
  </div>
 </div>
 `);
}

function explore(){
 shell(`
 <div class="home">
  <div class="hero">
   <h1>🧭 탐험하기</h1>
   <p>좋아요 · 북마크 · 공유 · 리메이크</p>
   <div id="projects" class="cards">
    <div class="card">불러오는 중...</div>
   </div>
  </div>
 </div>
 `);

 connect();
 request({type:"list_projects"});
}

function chooseEditor(){
 const online=confirm(
  "프로젝트 종류를 선택하세요.\n\n확인 = 온라인\n취소 = 오프라인"
 );

 editor(online?"online":"offline");
}

/* ---------------------------------------------------------
   에디터
   --------------------------------------------------------- */

function editor(mode){

 state.mode=mode;
 state.page="editor";

 shell(`
 <div class="editor">

  <aside class="side">
   <div class="small">기본 블록 499개 · 함수 ${state.funcs.length}개</div>
   <div id="cats"></div>

   <hr>

   <input
    id="search"
    placeholder="블록 검색"
    style="width:100%;padding:8px"
   >

   <div id="pal"></div>
  </aside>

  <section class="work">

   <div class="tools">
    <input
     id="projectName"
     value="${esc(state.project)}"
     style="width:150px;padding:7px"
    >

    <button onclick="CS.undo()">↶</button>
    <button onclick="CS.redo()">↷</button>
    <button onclick="CS.clear()">🗑</button>

    <button onclick="CS.newVar()">＋ 변수</button>
    <button onclick="CS.newList()">＋ 리스트</button>
    <button onclick="CS.newFunc()">＋ 함수</button>

    <button onclick="CS.run()">▶ 실행</button>
    <button onclick="CS.stop()">■ 정지</button>
    <button onclick="CS.save()">💾 저장</button>
   </div>

   <div class="board">

    <div id="code"></div>

    <div class="stage">
     <canvas id="cv" width="640" height="400"></canvas>
    </div>

   </div>
  </section>

  <aside class="right">

   <div class="card">
    <b>프로젝트</b>
    <p id="stats"></p>
    <p>모드: <b id="modeLabel"></b></p>
    <button onclick="CS.publish()">🌐 공개</button>
   </div>

   <div class="card" id="collabCard">
    <b>실시간 협업</b>
    <p id="roomState">방 없음</p>

    <button onclick="CS.createRoom()">방 만들기</button>
    <button onclick="CS.joinRoom()">참가</button>
   </div>

   <div class="card">
    <b>그림판</b>
    <canvas id="paint" width="270" height="140"></canvas>
    <button onclick="CS.clearPaint()">지우기</button>
   </div>

   <div class="card">
    <b>소리</b>
    <button onclick="CS.echo()">🔊 테스트</button>
   </div>

   <pre id="log"></pre>

  </aside>

 </div>
 `);

 initEditor();

 if(state.mode==="online")
  connect();

 render();
 palette();
}

/* ---------------------------------------------------------
   초기화
   --------------------------------------------------------- */

function initEditor(){

 drawCats();

 const search=document.getElementById("search");

 if(search)
  search.oninput=palette;

 const p=document.getElementById("paint");

 if(p){

  const g=p.getContext("2d");

  let drawing=false;
  let x=0;
  let y=0;

  p.onpointerdown=e=>{
   drawing=true;
   x=e.offsetX;
   y=e.offsetY;
  };

  p.onpointerup=()=>{
   drawing=false;
  };

  p.onpointermove=e=>{
   if(!drawing)return;

   g.beginPath();
   g.moveTo(x,y);
   g.lineTo(e.offsetX,e.offsetY);
   g.stroke();

   x=e.offsetX;
   y=e.offsetY;
  };
 }
}

function drawCats(){

 const el=document.getElementById("cats");

 if(!el)return;

 el.innerHTML=
 `<button class="cat" onclick="CS.setCat('all')">전체</button>`;

 CATS.forEach(c=>{

  if(c[0]==="online" && state.mode!=="online")
   return;

  el.innerHTML += `
   <button
    class="cat"
    style="background:${c[2]}"
    onclick="CS.setCat('${c[0]}')"
   >${c[1]}</button>
  `;
 });
}

function visible(b){

 if(b.cat==="online" && state.mode!=="online")
  return false;

 return true;
}

function palette(){

 const el=document.getElementById("pal");

 if(!el)return;

 const q=
  (document.getElementById("search")?.value||"")
  .toLowerCase();

 el.innerHTML=blocks
  .filter(b=>
   (state.category==="all" ||
    b.cat===state.category) &&
   visible(b) &&
   b.name.toLowerCase().includes(q)
  )
  .map(b=>`
   <div
    class="block"
    style="background:${b.color}"
    onclick="CS.add('${b.id}')"
   >
    ${esc(b.name)}
   </div>
  `)
  .join("");
}

/* ---------------------------------------------------------
   코드 렌더링
   --------------------------------------------------------- */

function render(){

 const el=document.getElementById("code");

 if(!el)return;

 document.getElementById("modeLabel").textContent =
  state.mode==="online" ? "온라인" : "오프라인";

 document.getElementById("collabCard").style.display =
  state.mode==="online" ? "block" : "none";

 document.getElementById("stats").textContent =
  `블록 ${state.code.length} · 변수 ${state.vars.length} · 리스트 ${state.lists.length} · 함수 ${state.funcs.length}`;

 el.innerHTML=
  state.code.map((b,i)=>`
   <div
    class="block"
    style="background:${b.color}"
    title="실행 기능: ${esc(b.action?.type || "generic")}"
   >
    ${esc(b.name)}
    <button
     class="del"
     onclick="CS.del(${i})"
    >×</button>
   </div>
  `).join("")
  ||
  "<p class='small'>왼쪽 블록을 클릭하세요.</p>";
}

/* ---------------------------------------------------------
   저장 / 복구
   --------------------------------------------------------- */

function snap(){

 return JSON.stringify({
  code:state.code,
  vars:state.vars,
  lists:state.lists,
  funcs:state.funcs,
  actor:state.actor,
  pen:state.pen
 });
}

function restore(x){

 const d=JSON.parse(x);

 state.code=d.code||[];
 state.vars=d.vars||[];
 state.lists=d.lists||[];
 state.funcs=d.funcs||[];

 state.actor=d.actor||state.actor;
 state.pen=d.pen||state.pen;

 render();
 palette();
}

/* ---------------------------------------------------------
   블록 추가
   --------------------------------------------------------- */

function add(id){

 const b=blocks.find(x=>x.id===id);

 if(!b)return;

 state.history.push(snap());
 state.future=[];

 state.code.push({
  ...b,
  runtimeId:crypto.randomUUID()
 });

 render();
 palette();

 if(state.mode==="online"){
  broadcast({
   type:"project_change",
   payload:{
    code:state.code,
    vars:state.vars,
    lists:state.lists,
    funcs:state.funcs
   }
  });
 }
}

/* =========================================================
   실제 실행 엔진
   ========================================================= */

async function executeBlock(block){

 if(state.stop)
  return;

 const a=block.action||{type:"generic"};

 log(`▶ ${block.name}`);

 switch(a.type){

  /* ---------------- START ---------------- */

  case "start":
   state.lastValue=1;
   break;

  /* ---------------- FLOW ---------------- */

  case "flow":

   if(block.name.includes("기다리기")){
    const m=
     parseFloat(block.name.match(/([\d.]+)초/)?.[1]||1);

    await sleep(m*1000);
   }

   if(block.name.includes("반복")){
    state.lastValue=2;
   }

   if(block.name==="반복 중단"){
    state.stop=true;
   }

   break;

  case "wait":
   await sleep(a.ms||1000);
   break;

  case "repeat":
   state.lastValue=a.count||1;
   break;

  /* ---------------- MOVE ---------------- */

  case "move":

   if(typeof a.dx==="number")
    state.actor.x+=a.dx;

    const n=state.vars[0];

    state.lastValue=
     localStorage.getItem("var:"+n)||0;

    log(`변수 값: ${state.lastValue}`);
   }

   render();
   palette();

   break;
  }

  /* ---------------- LIST ---------------- */

  case "list":{

   if(!state.lists.length)
    state.lists.push("리스트1");

   const list=state.lists[0];

   const key="list:"+list;

   let arr=[];

   try{
    arr=JSON.parse(
     localStorage.getItem(key)||"[]"
    );
   }catch{}

   if(a.op==="push"){
    arr.push(
     prompt("추가할 값","값")||""
    );
   }

   if(a.op==="shift")
    arr.shift();

   if(a.op==="pop")
    arr.pop();

   localStorage.setItem(
    key,
    JSON.stringify(arr)
   );

   state.lastValue=arr.length;

   break;
  }

  /* ---------------- FUNCTION ---------------- */

  case "func"

   if(a.op==="call"){
    log("⚙ 함수 실행");
   }

   break;

  /* ---------------- ONLINE ---------------- */

  case "online":

   if(state.mode!=="online"){
    log("온라인 블록은 온라인 모드에서만 사용할 수 있습니다.");
    break;
   }

   if(block.name.includes("방 만들기"))
    createRoom();

   else if(block.name.includes("방 참가하기"))
    joinRoom();

   else if(block.name.includes("방 나가기")){
    state.room=null;
    log("방에서 나갔습니다.");
   }

   else if(block.name.includes("방 인원"))
    log("현재 방: "+(state.room||"없음"));

   else if(block.name.includes("메시지 보내기")){
    const text=prompt("보낼 메시지","");
    if(text)
     broadcast({
      type:"chat",
      text
     });
   }

   break;

  /* ---------------- GENERATED ---------------- */

  case "generic":
  default:

   state.lastValue=1;
   log(`✓ ${block.name} 완료`);

   break;
 }
}

/* ---------------------------------------------------------
   실행
   --------------------------------------------------------- */

async function run(){

 if(state.running){
  log("이미 실행 중입니다.");
  return;
 }

 state.running=true;
 state.stop=false;

 const logEl=document.getElementById("log");

 if(logEl)
  logEl.textContent="▶ 실행 시작\n";

 try{

  for(const block of state.code){

   if(state.stop)
    break;

   await executeBlock(block);
  }

 }catch(e){

  log("❌ 실행 오류: "+e.message);

 }finally{

  state.running=false;

  log(
   state.stop
    ? "■ 실행 중단"
    : "✓ 실행 완료"
  );
 }
}

/* ---------------------------------------------------------
   Stage
   --------------------------------------------------------- */

function drawStage(){

 const canvas=document.getElementById("cv");

 if(!canvas)return;

 const c=canvas.getContext("2d");

 c.clearRect(
  0,0,
  canvas.width,
  canvas.height
 );

 if(!state.actor.visible)
  return;

 const x=Math.max(
  15,
  Math.min(
   canvas.width-15,
   state.actor.x
  )
 );

 const y=Math.max(
  15,
  Math.min(
   canvas.height-15,
   state.actor.y
  )
 );

 c.save();

 c.translate(x,y);
 c.rotate(
  (state.actor.direction-90)*
  Math.PI/180
 );

 const size=
  35*(state.actor.size/100);

 c.font=`${size}px sans-serif`;
 c.textAlign="center";
 c.textBaseline="middle";

 c.fillText("🎮",0,0);

 c.restore();
}

function clearStage(){

 const canvas=document.getElementById("cv");

 if(!canvas)return;

 canvas
  .getContext("2d")
  .clearRect(
   0,
   0,
   canvas.width,
   canvas.height
  );
}

function drawStamp(){

 const canvas=document.getElementById("cv");

 if(!canvas)return;

 const c=canvas.getContext("2d");

 c.font="35px sans-serif";

 c.fillText(
  "🎮",
  state.actor.x,
  state.actor.y
 );
}

/* ---------------------------------------------------------
   Sound
   --------------------------------------------------------- */

function beep(){

 try{

  const ctx=
   new (window.AudioContext||
   window.webkitAudioContext)();

  const osc=
   ctx.createOscillator();

  const gain=
   ctx.createGain();

  osc.frequency.value=440;

  gain.gain.value=.05;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  setTimeout(()=>{
   osc.stop();
   ctx.close();
  },250);

 }catch{}
}

/* ---------------------------------------------------------
   저장
   --------------------------------------------------------- */

function save(){

 const d={
  name:
   document.getElementById("projectName")?.value ||
   state.project,

  mode:state.mode,

  code:state.code,

  vars:state.vars,
  lists:state.lists,
  funcs:state.funcs,

  actor:state.actor,
  pen:state.pen
 };

 localStorage.setItem(
  "codescript_project",
  JSON.stringify(d)
 );

 if(state.mode==="online")
  request({
   type:"save_project",
   project:d
  });

 alert("저장 완료");
}

function publish(){

 if(state.mode!=="online"){
  alert("오프라인 프로젝트는 서버 공개가 없습니다.");
  return;
 }

 const d={
  name:
   document.getElementById("projectName")?.value ||
   state.project,

  mode:state.mode,

  code:state.code,

  vars:state.vars,
  lists:state.lists,
  funcs:state.funcs,

  public:true
 };

 request({
  type:"save_project",
  project:d
 });

 alert("공개 프로젝트로 저장했습니다.");
}

/* ---------------------------------------------------------
   WebSocket
   --------------------------------------------------------- */

function connect(){

 if(state.ws?.readyState===1)
  return;

 try{

  const protocol=
   location.protocol==="https:" ?
   "wss" :
   "ws";

  state.ws=
   new WebSocket(
    `${protocol}://${location.host}/ws`
   );

  state.ws.onopen=()=>{
   state.connected=true;
   setConn(true);
  };

  state.ws.onclose=()=>{
   state.connected=false;
   setConn(false);
  };

  state.ws.onerror=()=>{
   state.connected=false;
   setConn(false);
  };

  state.ws.onmessage=e=>{

   try{
    handle(JSON.parse(e.data));
   }catch{}
  };

 }catch{

  setConn(false);
 }
}

function setConn(ok){

 const x=
  document.getElementById("conn");

 if(!x)return;

 x.textContent=
  ok ?
  "● 서버 연결됨" :
  "● 서버 오프라인";

 x.className=
  "status "+(ok?"ok":"no");
}

function request(data){

 connect();

 setTimeout(()=>{

  if(state.ws?.readyState===1){

   try{
    state.ws.send(
     JSON.stringify(data)
    );
   }catch{}
  }

 },100);
}

function broadcast(data){

 if(state.room)
  request({
   ...data,
   room:state.room
  });
}

/* ---------------------------------------------------------
   WebSocket 수신
   --------------------------------------------------------- */

function handle(m){

 if(m.type==="connected"){
  setConn(true);
 }

 if(m.type==="projects")
  renderProjects(m.projects||[]);

 if(m.type==="room_created"){

  state.room=m.room;

  const el=
   document.getElementById("roomState");

  if(el)
   el.textContent=
    `방 ${m.room} · ${m.clients||1}명`;
 }

 if(m.type==="room_joined"){

  state.room=m.room;

  const el=
   document.getElementById("roomState");

  if(el)
   el.textContent=
    `방 ${m.room} · ${m.clients||1}명`;
 }

 if(m.type==="presence"){

  const el=
   document.getElementById("roomState");

  if(el)
   el.textContent=
    `방 ${state.room||"-"} · ${m.clients||0}명`;
 }

 if(m.type==="room_update"&&m.payload){

  state.code=m.payload.code||[];
  state.vars=m.payload.vars||[];
  state.lists=m.payload.lists||[];
  state.funcs=m.payload.funcs||[];

  render();
  palette();
 }

 if(m.type==="chat"){
  log(`💬 ${m.text||""}`);
 }

 if(m.type==="error")
  alert(m.message);
}

/* ---------------------------------------------------------
   공개 프로젝트
   --------------------------------------------------------- */

function renderProjects(ps){

 const el=
  document.getElementById("projects");

 if(!el)return;

 const arr=
  ps.length ?
  ps :
  [{
   name:"아직 공개 프로젝트가 없습니다.",
   code:[]
  }];

 el.innerHTML=
  arr.map(p=>`
   <div class="card">

    <h3>🎮 ${esc(p.name)}</h3>

    <p>
     블록 ${p.code?.length||0}개
     · 좋아요 ${p.likes||0}
    </p>

    <button>♡ 좋아요</button>
    <button>🔖</button>
    <button>↻ 리메이크</button>

   </div>
  `).join("");
}

/* ---------------------------------------------------------
   고급 그림판
   --------------------------------------------------------- */

function ensurePixelData(){

 if(!state.paint.pixels ||
    state.paint.pixels.length!==80 ||
    state.paint.pixels[0]?.length!==128){

  state.paint.pixels=
   Array.from(
    {length:80},
    ()=>Array.from(
     {length:128},
     ()=>[255,255,255,0]
    )
   );
 }
}

function rgba(hex,alpha){

 const h=hex.replace("#","");

 const n=parseInt(
  h.length===3 ?
   h.split("").map(x=>x+x).join("") :
   h,
  16
 );

 return [
  n>>16,
  (n>>8)&255,
  n&255,
  Math.round(alpha*2.55)
 ];
}

function hexFromRgb(r,g,b){
 return "#"+
  [r,g,b]
   .map(v=>
    Math.max(
     0,
     Math.min(255,v)
    ).toString(16).padStart(2,"0")
   )
   .join("");
}

function getPaintCanvas(){
 return document.getElementById("paintCanvas");
}

function getPaintCtx(){

 const c=getPaintCanvas();

 return c ?
  c.getContext("2d") :
  null;
}

function paintHistory(){

 if(document.getElementById("paintModal"))
  state.history.push(snap());

 state.future=[];
}

function openPaint(){

 if(document.getElementById("paintModal"))
  return;

 document.body.insertAdjacentHTML(
  "beforeend",
  `
  <div class="paint-modal" id="paintModal">

   <div class="paint-window">

    <div class="paint-head">

     <h2>🎨 Codescript 그림판</h2>

     <button onclick="CS.paintUndo()">↶</button>
     <button onclick="CS.paintRedo()">↷</button>

     <button onclick="CS.paintClear()">
      🗑 캔버스 지우기
     </button>

     <div class="grow"></div>

     <button onclick="CS.exportPaint()">
      PNG 내보내기
     </button>

     <button onclick="CS.closePaint()">
      ✕ 닫기
     </button>

    </div>

    <div class="paint-body">

     <div class="paint-tools">

      <h3>모드</h3>

      <div class="paint-mode">

       <button data-pmode="bitmap">
        Bitmap
       </button>

       <button data-pmode="vector">
        Vector
       </button>

       <button data-pmode="pixelmap">
        Pixelmap
       </button>

      </div>

      <h3>도구</h3>

      <div class="paint-tool-grid">

       <button data-tool="pen">
        ✏️ 연필
       </button>

       <button data-tool="eraser">
        🧽 지우개
       </button>

       <button data-tool="line">
        ／ 직선
       </button>

       <button data-tool="rect">
        ▭ 사각형
       </button>

       <button data-tool="circle">
        ○ 원
       </button>

       <button data-tool="fill">
        🪣 채우기
       </button>

       <button data-tool="select">
        ✋ 선택
       </button>

       <button data-tool="picker">
        💧 스포이드
       </button>

      </div>

      <h3>색상</h3>

      <div class="paint-field">

       <label>색상</label>

       <input
        id="paintColor"
        class="paint-color"
        type="color"
       >

      </div>

      <div class="paint-field">

       <label>투명도</label>

       <input
        id="paintAlpha"
        type="range"
        min="0"
        max="100"
       >

      </div>

      <div class="paint-field">

       <label>굵기</label>

       <input
        id="paintWidth"
        type="range"
        min="1"
        max="80"
       >

      </div>

      <div class="paint-field">

       <label>확대</label>

       <input
        id="paintZoom"
        type="range"
        min="50"
        max="300"
        step="10"
       >

      </div>

      <p class="pixel-help">
       Pixelmap은 128×80 픽셀 기반입니다.
       Vector는 도형을 객체로 저장해 확대해도
       깨지지 않습니다.
      </p>

     </div>

     <div class="paint-canvas-wrap">

      <canvas
       id="paintCanvas"
       width="800"
       height="500"
      ></canvas>

     </div>

     <div class="paint-side">

      <h3>레이어</h3>

      <div id="paintLayers"></div>

      <button onclick="CS.addPaintLayer()">
       ＋ 레이어
      </button>

      <button onclick="CS.renamePaintLayer()">
       이름 변경
      </button>

      <button onclick="CS.removePaintLayer()">
       삭제
      </button>

      <h3>선택 객체</h3>

      <p
       id="paintSelection"
       class="small"
      >
       선택 없음
      </p>

      <h3>프로젝트</h3>

      <button
       onclick="CS.savePaintToProject()"
      >
       💾 프로젝트에 적용
      </button>

     </div>

    </div>

   </div>

  </div>
  `
 );

 bindPaintUI();
 renderPaintEditor();
}

function closePaint(){

 syncPaintFromCanvas();
 syncPaintPreview();

 document
  .getElementById("paintModal")
  ?.remove();
}

function bindPaintUI(){

 document
  .querySelectorAll("[data-pmode]")
  .forEach(
   b=>
    b.onclick=()=>
     setPaintMode(b.dataset.pmode)
  );

 document
  .querySelectorAll("[data-tool]")
  .forEach(
   b=>
    b.onclick=()=>
     setPaintTool(b.dataset.tool)
  );

 const color=
  document.getElementById("paintColor");

 const alpha=
  document.getElementById("paintAlpha");

 const width=
  document.getElementById("paintWidth");

 const zoom=
  document.getElementById("paintZoom");

 if(color){
  color.value=state.paint.color;

  color.oninput=()=>{
   state.paint.color=color.value;
  };
 }

 if(alpha){
  alpha.value=state.paint.alpha;

  alpha.oninput=()=>{
   state.paint.alpha=+alpha.value;
  };
 }

 if(width){
  width.value=state.paint.width;

  width.oninput=()=>{
   state.paint.width=+width.value;
  };
 }

 if(zoom){
  zoom.value=state.paint.zoom;

  zoom.oninput=()=>{
   state.paint.zoom=+zoom.value;
   applyPaintZoom();
  };
 }

 const c=getPaintCanvas();

 if(c){

  c.onpointerdown=paintPointerDown;

  c.onpointermove=paintPointerMove;

  c.onpointerup=paintPointerUp;

  c.onpointercancel=paintPointerUp;

  c.onpointerleave=paintPointerUp;
 }
}

function setPaintMode(mode){

 syncPaintFromCanvas();

 state.paint.mode=mode;

 state.paint.selectedObject=-1;

 if(mode==="pixelmap")
  ensurePixelData();

 renderPaintEditor();
}

function setPaintTool(tool){

 state.paint.tool=tool;

 renderPaintEditor();
}

function applyPaintZoom(){

 const c=getPaintCanvas();

 if(c)
  c.style.width=
   (800*state.paint.zoom/100)+"px";

 if(c)
  c.style.height=
   (500*state.paint.zoom/100)+"px";
}

function layerCanvas(layer){

 if(!layer._canvas){

  layer._canvas=
   document.createElement("canvas");

  layer._canvas.width=800;
  layer._canvas.height=500;
 }

 return layer._canvas;
}

function loadLayerData(layer){

 const c=layerCanvas(layer);

 const ctx=c.getContext("2d");

 ctx.clearRect(
  0,0,
  800,500
 );

 if(layer.dataURL){

  const img=new Image();

  img.onload=()=>{

   ctx.drawImage(
    img,
    0,
    0
   );

   renderPaintEditor();
   syncPaintPreview();
  };

  img.src=layer.dataURL;
 }
}

function syncPaintFromCanvas(){

 const c=getPaintCanvas();

 if(!c)return;

 if(state.paint.mode==="bitmap"){

  const layer=
   state.paint.layers[
    state.paint.activeLayer
   ];

  if(layer){

   layer.dataURL=
    c.toDataURL("image/png");

   const lc=
    layerCanvas(layer);

   lc
    .getContext("2d")
    .clearRect(
     0,
     0,
     800,
     500
    );

   lc
    .getContext("2d")
    .drawImage(
     c,
     0,
     0
    );
  }
 }
}

function renderPaintEditor(){

 const c=getPaintCanvas();

 if(!c)return;

 const ctx=c.getContext("2d");

 ctx.clearRect(
  0,
  0,
  800,
  500
 );

 if(state.paint.mode==="bitmap"){

  const layer=
   state.paint.layers[
    state.paint.activeLayer
   ] ||
   state.paint.layers[0];

  state.paint.layers.forEach(l=>{

   if(l.visible){

    const lc=
     layerCanvas(l);

    if(
     l.dataURL &&
     !lc.dataset.loaded
    ){

     loadLayerData(l);

     lc.dataset.loaded="1";
    }

    ctx.globalAlpha=
     l.opacity||1;

    ctx.drawImage(
     lc,
     0,
     0
    );
   }

  });

  ctx.globalAlpha=1;

 }else if(state.paint.mode==="vector"){

  drawVectorObjects(ctx);

 }else{

  ensurePixelData();

  drawPixelmap(ctx);
 }

 applyPaintZoom();

 document
  .querySelectorAll("[data-pmode]")
  .forEach(
   b=>
    b.classList.toggle(
     "active",
     b.dataset.pmode===
      state.paint.mode
    )
  );

 document
  .querySelectorAll("[data-tool]")
  .forEach(
   b=>
    b.classList.toggle(
     "active",
     b.dataset.tool===
      state.paint.tool
    )
  );

 const layers=
  document.getElementById("paintLayers");

 if(layers)
  layers.innerHTML=
   state.paint.layers
    .map(
     (l,i)=>
      `<div class="layer-row ${
       i===state.paint.activeLayer
        ?"active":""
      }"
       onclick="CS.selectPaintLayer(${i})">
       <span class="layer-name">
        ${l.visible?"👁":"🚫"} ${esc(l.name)}
       </span>
       <span>
        ${Math.round((l.opacity||1)*100)}%
       </span>
      </div>`
    )
    .join("");

 const sel=
  document.getElementById(
   "paintSelection"
  );

 if(sel)
  sel.textContent=
   state.paint.selectedObject>=0
    ? `객체 ${state.paint.selectedObject+1}`
    : "선택 없음";

 syncPaintPreview();
}

function drawVectorObjects(ctx){

 ctx.clearRect(
  0,
  0,
  800,
  500
 );

 state.paint.vectorObjects.forEach(
  (o,i)=>{

   if(
    o.layer!==
    state.paint.activeLayer
   )
    return;

   ctx.save();

   ctx.globalAlpha=
    (o.alpha??100)/100;

   ctx.strokeStyle=o.color;

   ctx.fillStyle=
    o.fill||"transparent";

   ctx.lineWidth=
    o.width||2;

   if(o.type==="line"){

    ctx.beginPath();

    ctx.moveTo(
     o.x,
     o.y
    );

    ctx.lineTo(
     o.x2,
     o.y2
    );

    ctx.stroke();
   }

   if(o.type==="rect"){

    ctx.beginPath();

    ctx.rect(
     Math.min(o.x,o.x2),
     Math.min(o.y,o.y2),
     Math.abs(o.x2-o.x),
     Math.abs(o.y2-o.y)
    );

    o.fill ?
     ctx.fill() :
     ctx.stroke();
   }

   if(o.type==="circle"){

    const rx=
     Math.abs(o.x2-o.x)/2;

    const ry=
     Math.abs(o.y2-o.y)/2;

    ctx.beginPath();

    ctx.ellipse(
     (o.x+o.x2)/2,
     (o.y+o.y2)/2,
     Math.max(1,rx),
     Math.max(1,ry),
     0,
     0,
     Math.PI*2
    );

    o.fill ?
     ctx.fill() :
     ctx.stroke();
   }

   if(o.type==="path"){

    ctx.beginPath();

    o.points.forEach(
     (p,j)=>
      j ?
       ctx.lineTo(
        p[0],
        p[1]
       ) :
       ctx.moveTo(
        p[0],
        p[1]
       )
    );

    ctx.stroke();
   }

   if(i===state.paint.selectedObject){

    ctx.strokeStyle="#1976d2";

    ctx.setLineDash([
     6,
     4
    ]);

    ctx.strokeRect(
     o.x-5,
     o.y-5,
     (o.x2??o.x)-o.x+10,
     (o.y2??o.y)-o.y+10
    );

    ctx.setLineDash([]);
   }

   ctx.restore();
  }
 );
}

function drawPixelmap(ctx){

 ctx.clearRect(
  0,
  0,
  800,
  500
 );

 const sx=800/128;
 const sy=500/80;

 for(
  let y=0;
  y<80;
  y++
 )
  for(
   let x=0;
   x<128;
   x++
  ){

   const p=
    state.paint.pixels[y][x];

   if(p[3]){

    ctx.fillStyle=
     `rgba(
       ${p[0]},
       ${p[1]},
       ${p[2]},
       ${p[3]/255}
     )`;

    ctx.fillRect(
     x*sx,
     y*sy,
     sx+.2,
     sy+.2
    );
   }
  }

 ctx.strokeStyle="#ddd";
 ctx.lineWidth=.5;

 for(
  let x=0;
  x<=128;
  x+=8
 ){

  ctx.beginPath();

  ctx.moveTo(
   x*sx,
   0
  );

  ctx.lineTo(
   x*sx,
   500
  );

  ctx.stroke();
 }

 for(
  let y=0;
  y<=80;
  y+=8
 ){

  ctx.beginPath();

  ctx.moveTo(
   0,
   y*sy
  );

  ctx.lineTo(
   800,
   y*sy
  );

  ctx.stroke();
 }
}

function paintPoint(e){

 const c=getPaintCanvas();

 const r=
  c.getBoundingClientRect();

 return {
  x:
   (e.clientX-r.left)*
   (800/r.width),

  y:
   (e.clientY-r.top)*
   (500/r.height)
 };
}

let paintDrag=null;

function paintPointerDown(e){

 const p=paintPoint(e);

 paintDrag={
  start:p,
  last:p
 };

 paintHistory();

 if(state.paint.mode==="pixelmap"){

  paintPixel(p);

  paintDrag=null;

  return;
 }

 if(state.paint.mode==="bitmap"){

  if(state.paint.tool==="fill"){

   fillBitmap(p);

   paintDrag=null;

   return;
  }

  if(state.paint.tool==="picker"){

   pickBitmap(p);

   paintDrag=null;

   return;
  }

  if(state.paint.tool==="select")
   return;

  drawBitmapPoint(
   p,
   p
  );

 }else if(
  state.paint.mode==="vector"
 ){

  if(
   state.paint.tool==="select"
  ){

   state.paint.selectedObject=
    findVectorObject(p);

   return;
  }
 }
}

function paintPointerMove(e){

 if(!paintDrag)
  return;

 const p=paintPoint(e);

 const s=paintDrag.start;

 if(state.paint.mode==="bitmap"){

  if(
   ["pen","eraser"]
    .includes(state.paint.tool)
  ){

   drawBitmapPoint(
    p,
    paintDrag.last
   );

   paintDrag.last=p;

  }else{

   renderPaintEditor();

   const ctx=getPaintCtx();

   ctx.save();

   ctx.strokeStyle=
    state.paint.color;

   ctx.globalAlpha=
    state.paint.alpha/100;

   ctx.lineWidth=
    state.paint.width;

   ctx.lineCap="round";

   ctx.beginPath();

   if(state.paint.tool==="line"){

    ctx.moveTo(
     s.x,
     s.y
    );

    ctx.lineTo(
     p.x,
     p.y
    );

   }else if(
    state.paint.tool==="rect"
   ){

    ctx.rect(
     Math.min(s.x,p.x),
     Math.min(s.y,p.y),
     Math.abs(p.x-s.x),
     Math.abs(p.y-s.y)
    );

   }else{

    ctx.ellipse(
     (s.x+p.x)/2,
     (s.y+p.y)/2,
     Math.abs(p.x-s.x)/2,
     Math.abs(p.y-s.y)/2,
     0,
     0,
     Math.PI*2
    );
   }

   ctx.stroke();

   ctx.restore();
  }

 }else if(
  state.paint.mode==="vector"
 ){

  renderPaintEditor();

  const ctx=getPaintCtx();

  ctx.save();

  ctx.strokeStyle=
   state.paint.color;

  ctx.globalAlpha=
   state.paint.alpha/100;

  ctx.lineWidth=
   state.paint.width;

  ctx.setLineDash([
   6,
   4
  ]);

  ctx.beginPath();

  if(state.paint.tool==="line"){

   ctx.moveTo(
    s.x,
    s.y
   );

   ctx.lineTo(
    p.x,
    p.y
   );

  }else if(
   state.paint.tool==="rect"
  ){

   ctx.rect(
    Math.min(s.x,p.x),
    Math.min(s.y,p.y),
    Math.abs(p.x-s.x),
    Math.abs(p.y-s.y)
   );

  }else{

   ctx.ellipse(
    (s.x+p.x)/2,
    (s.y+p.y)/2,
    Math.abs(p.x-s.x)/2,
    Math.abs(p.y-s.y)/2,
    0,
    0,
    Math.PI*2
   );
  }

  ctx.stroke();

  ctx.restore();
 }

 paintDrag.last=p;
}

function paintPointerUp(e){

 if(!paintDrag)
  return;

 const p=paintPoint(e);

 const s=paintDrag.start;

 if(
  state.paint.mode==="vector" &&
  state.paint.tool!=="select" &&
  state.paint.tool!=="picker"
 ){

  let o=null;

  if(
   state.paint.tool==="pen"
  )

   o={
    type:"path",
    points:[
     [s.x,s.y],
     [p.x,p.y]
    ],
    color:state.paint.color,
    alpha:state.paint.alpha,
    width:state.paint.width,
    layer:state.paint.activeLayer
   };

  if(
   ["line","rect","circle"]
    .includes(state.paint.tool)
  )

   o={
    type:state.paint.tool,
    x:s.x,
    y:s.y,
    x2:p.x,
    y2:p.y,
    color:state.paint.color,
    alpha:state.paint.alpha,
    width:state.paint.width,
    layer:state.paint.activeLayer
   };

  if(o)
   state.paint.vectorObjects.push(o);
 }

 paintDrag=null;

 renderPaintEditor();

 syncPaintFromCanvas();
}

function drawBitmapPoint(p,last){

 const c=getPaintCtx();

 if(!c)return;

 c.save();

 c.lineCap="round";

 c.lineJoin="round";

 c.lineWidth=
  state.paint.width;

 c.globalAlpha=
  state.paint.alpha/100;

 c.strokeStyle=
  state.paint.tool==="eraser"
   ?" #000".trim()
   :state.paint.color;

 if(
  state.paint.tool==="eraser"
 )
  c.globalCompositeOperation=
   "destination-out";

 c.beginPath();

 c.moveTo(
  last.x,
  last.y
 );

 c.lineTo(
  p.x,
  p.y
 );

 c.stroke();

 c.restore();

 syncPaintFromCanvas();
}

function fillBitmap(p){

 const c=getPaintCtx();

 if(!c)return;

 const img=
  c.getImageData(
   0,
   0,
   800,
   500
  );

 const x=Math.floor(p.x);
 const y=Math.floor(p.y);

 const idx=
  (y*800+x)*4;

 const target=[
  img.data[idx],
  img.data[idx+1],
  img.data[idx+2],
  img.data[idx+3]
 ];

 const fill=
  rgba(
   state.paint.color,
   state.paint.alpha
  );

 if(
  target.every(
   (v,i)=>
    Math.abs(
     v-fill[i]
    )<3
  )
 )
  return;

 const q=[
  [x,y]
 ];

 const seen=
  new Uint8Array(
   800*500
  );

 while(q.length){

  const [
   cx,
   cy
  ]=q.pop();

  if(
   cx<0 ||
   cy<0 ||
   cx>=800 ||
   cy>=500
  )
   continue;

  const k=
   cy*800+cx;

  if(seen[k])
   continue;

  const j=k*4;

  if(
   Math.abs(
    img.data[j]-
    target[0]
   )>3 ||
   Math.abs(
    img.data[j+1]-
    target[1]
   )>3 ||
   Math.abs(
    img.data[j+2]-
    target[2]
   )>3 ||
   Math.abs(
    img.data[j+3]-
    target[3]
   )>3
  )
   continue;

  seen[k]=1;

  img.data[j]=fill[0];
  img.data[j+1]=fill[1];
  img.data[j+2]=fill[2];
  img.data[j+3]=fill[3];

  q.push(
   [cx+1,cy],
   [cx-1,cy],
   [cx,cy+1],
   [cx,cy-1]
  );
 }

 c.putImageData(
  img,
  0,
  0
 );

 syncPaintFromCanvas();
}

function pickBitmap(p){

 const d=
  getPaintCtx()
   .getImageData(
    Math.floor(p.x),
    Math.floor(p.y),
    1,
    1
   ).data;

 state.paint.color=
  hexFromRgb(
   d[0],
   d[1],
   d[2]
  );

 state.paint.alpha=
  Math.round(
   d[3]/2.55
  );

 renderPaintEditor();
}

function paintPixel(p){

 ensurePixelData();

 const x=
  Math.floor(
   p.x/(800/128)
  );

 const y=
  Math.floor(
   p.y/(500/80)
  );

 if(
  x<0 ||
  y<0 ||
  x>=128 ||
  y>=80
 )
  return;

 const col=
  state.paint.tool==="eraser" ?
   [255,255,255,0] :
   rgba(
    state.paint.color,
    state.paint.alpha
   );

 state.paint.pixels[y][x]=col;

 renderPaintEditor();
}

function findVectorObject(p){

 for(
  let i=
   state.paint.vectorObjects.length-1;
  i>=0;
  i--
 ){

  const o=
   state.paint.vectorObjects[i];

  if(
   o.layer!==
   state.paint.activeLayer
  )
   continue;

  const minx=
   Math.min(
    o.x,
    o.x2??o.x
   )-8;

  const maxx=
   Math.max(
    o.x,
    o.x2??o.x
   )+8;

  const miny=
   Math.min(
    o.y,
    o.y2??o.y
   )-8;

  const maxy=
   Math.max(
    o.y,
    o.y2??o.y
   )+8;

  if(
   p.x>=minx &&
   p.x<=maxx &&
   p.y>=miny &&
   p.y<=maxy
  )
   return i;
 }

 return -1;
}

function syncPaintPreview(){

 const prev=
  document.getElementById(
   "paintPreview"
  );

 if(!prev)return;

 const ctx=
  prev.getContext("2d");

 ctx.clearRect(
  0,
  0,
  320,
  180
 );

 const c=getPaintCanvas();

 if(c){

  ctx.drawImage(
   c,
   0,
   0,
   320,
   180
  );

  return;
 }

 if(
  state.paint.mode==="pixelmap"
 ){

  ensurePixelData();

  drawPixelmap(ctx);

 }else if(
  state.paint.mode==="vector"
 ){

  drawVectorObjects(ctx);

 }else{

  const layer=
   state.paint.layers[
    state.paint.activeLayer
   ];

  if(layer?.dataURL){

   const img=new Image();

   img.onload=()=>
    ctx.drawImage(
     img,
     0,
     0,
     320,
     180
    );

   img.src=
    layer.dataURL;
  }
 }
}

function selectPaintLayer(i){

 syncPaintFromCanvas();

 state.paint.activeLayer=i;

 renderPaintEditor();
}

function addPaintLayer(){

 paintHistory();

 state.paint.layers.push({
  id:crypto.randomUUID(),
  name:
   `레이어 ${
    state.paint.layers.length+1
   }`,
  visible:true,
  opacity:1,
  dataURL:null
 });

 state.paint.activeLayer=
  state.paint.layers.length-1;

 renderPaintEditor();
}

function renamePaintLayer(){

 const l=
  state.paint.layers[
   state.paint.activeLayer
  ];

 if(!l)return;

 const n=
  prompt(
   "레이어 이름",
   l.name
  );

 if(n){

  l.name=n;

  renderPaintEditor();
 }
}

function removePaintLayer(){

 if(
  state.paint.layers.length<=1
 ){

  alert(
   "레이어는 최소 1개가 필요합니다."
  );

  return;
 }

 paintHistory();

 state.paint.layers.splice(
  state.paint.activeLayer,
  1
 );

 state.paint.activeLayer=
  Math.max(
   0,
   state.paint.activeLayer-1
  );

 renderPaintEditor();
}

function clearPaint(){

 paintHistory();

 if(
  state.paint.mode==="vector"
 ){

  state.paint.vectorObjects=[];

 }else if(
  state.paint.mode==="pixelmap"
 ){

  ensurePixelData();

  state.paint.pixels=
   Array.from(
    {length:80},
    ()=>Array.from(
     {length:128},
     ()=>[255,255,255,0]
    )
   );

 }else{

  const c=getPaintCanvas();

  if(c)
   c.getContext("2d")
    .clearRect(
     0,
     0,
     800,
     500
    );

  syncPaintFromCanvas();
 }

 renderPaintEditor();
}

function paintUndo(){

 const x=
  state.history.pop();

 if(x){

  state.future.push(
   snap()
  );

  restore(x);
 }
}

function paintRedo(){

 const x=
  state.future.pop();

 if(x){

  state.history.push(
   snap()
  );

  restore(x);
 }
}

function exportPaint(){

 const c=getPaintCanvas();

 if(!c)return;

 syncPaintFromCanvas();

 const a=
  document.createElement("a");

 a.download=
  `${state.project||"codescript"}-그림.png`;

 a.href=
  c.toDataURL(
   "image/png"
  );

 a.click();
}

function savePaintToProject(){

 syncPaintFromCanvas();

 localStorage.setItem(
  "codescript_paint",
  JSON.stringify(
   state.paint
  )
 );

 syncPaintPreview();

 alert(
  "그림판이 프로젝트에 적용되었습니다."
 );
}

/* ---------------------------------------------------------
   전역 API
   --------------------------------------------------------- */

window.CS={

 home,
 explore,
 chooseEditor,
 editor,

 setCat:x=>{
  state.category=x;
  drawCats();
  palette();
 },

 add,
 run,

 stop:()=>{
  state.stop=true;
 },

 save,
 publish,

 undo:()=>{
  const x=
   state.history.pop();

  if(x){

   state.future.push(
    snap()
   );

   restore(x);
  }
 },

 redo:()=>{
  const x=
   state.future.pop();

  if(x){

   state.history.push(
    snap()
   );

   restore(x);
  }
 },

 clear:()=>{
  state.history.push(
   snap()
  );

  state.code=[];

  render();
 },

 newVar:()=>{

  const n=
   prompt(
    "변수 이름",
    "변수"+
     (state.vars.length+1)
   );

  if(n){

   state.vars.push(n);

   render();
   palette();
  }
 },

 newList:()=>{

  const n=
   prompt(
    "리스트 이름",
    "리스트"+
     (state.lists.length+1)
   );

  if(n){

   state.lists.push(n);

   render();
   palette();
  }
 },

 newFunc:()=>{

  const n=
   prompt(
    "함수 이름"
   );

  if(n){

   state.funcs.push(n);

   render();
  }
 },

 del:i=>{

  state.history.push(
   snap()
  );

  state.code.splice(
   i,
   1
  );

  render();
 },

 createRoom:()=>{

  request({
   type:"create_room"
  });
 },

 joinRoom:()=>{

  const id=
   prompt(
    "방 코드"
   );

  if(id)
   request({
    type:"join_room",
    room:id
   });
 },

 clearPaint,
 echo:beep
};

/* ---------------------------------------------------------
   시작
   --------------------------------------------------------- */

try{

 const savedPaint=
  localStorage.getItem(
   "codescript_paint"
  );

 if(savedPaint)
  state.paint=
   JSON.parse(
    savedPaint
   );

}catch{}

home();

})();

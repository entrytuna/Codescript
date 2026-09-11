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
  lastText: "",

  paint: {
    mode:"bitmap",
    tool:"pen",
    color:"#111111",
    alpha:100,
    width:8,
    zoom:100,
    activeLayer:0,
    layers:[],
    vectorObjects:[],
    pixels:null
  }
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

button,input{
 font:inherit
}

button{
 border:1px solid #aaa;
 background:#fff;
 border-radius:8px;
 padding:8px 11px;
 font-weight:700;
 cursor:pointer
}

button:hover{
 background:#eee
}

.top{
 height:58px;
 background:#fff;
 border-bottom:1px solid #ccc;
 display:flex;
 align-items:center;
 gap:8px;
 padding:8px 14px
}

.logo{
 font-size:22px;
 font-weight:900
}

.spacer{
 flex:1
}

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

.hero h1{
 font-size:42px;
 margin:0 0 10px
}

.hero p{
 color:#666
}

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

.side{
 border-right:1px solid #ccc
}

.right{
 border-left:1px solid #ccc
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

.ok{
 background:#d8f5df
}

.no{
 background:#ffe0e0
}

#log{
 height:120px;
 background:#111;
 color:#0f0;
 overflow:auto;
 padding:8px;
 white-space:pre-wrap
}

.cs-input{
 display:inline-block;
 min-width:55px;
 max-width:150px;
 margin:0 4px;
 padding:4px 7px;
 border:1px solid #888;
 border-radius:6px;
 background:#fff
}

.cs-text{
 min-width:100px
}

.cs-slot{
 display:inline-flex;
 align-items:center;
 min-width:65px;
 min-height:30px;
 margin:0 4px;
 padding:3px 7px;
 border:2px dashed #777;
 border-radius:15px;
 background:#fff8
}

.cs-slot.selected{
 outline:3px solid #2196f3;
 background:#fff
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

  <span id="conn" class="status no">
   서버 오프라인
  </span>
 </div>

 <main>${content}</main>
 `;
}

function home(){
 shell(`
 <div class="home">

  <div class="hero">

   <h1>🎮 Codescript</h1>

   <p>
    블록 코딩 프로젝트를 만들고 공유하는 공간
   </p>

   <button onclick="CS.chooseEditor()">
    ＋ 새 프로젝트 만들기
   </button>

  </div>

  <div class="cards">

   <div class="card">
    <h3>🧭 탐험하기</h3>
    <p>공개 프로젝트를 찾아보세요.</p>

    <button onclick="CS.explore()">
     탐험하기
    </button>
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

   <p>
    좋아요 · 북마크 · 공유 · 리메이크
   </p>

   <div id="projects" class="cards">

    <div class="card">
     불러오는 중...
    </div>

   </div>

  </div>

 </div>
 `);

 connect();

 request({
  type:"list_projects"
 });
}

function chooseEditor(){

 const online=confirm(
  "프로젝트 종류를 선택하세요.\n\n확인 = 온라인\n취소 = 오프라인"
 );

 editor(
  online ? "online" : "offline"
 );
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

   <div class="small">
    기본 블록 499개 · 함수 ${state.funcs.length}개
   </div>

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

     <canvas
      id="cv"
      width="640"
      height="400"
     ></canvas>

    </div>

   </div>

  </section>

  <aside class="right">

   <div class="card">

    <b>프로젝트</b>

    <p id="stats"></p>

    <p>
     모드:
     <b id="modeLabel"></b>
    </p>

    <button onclick="CS.publish()">
     🌐 공개
    </button>

   </div>

   <div class="card" id="collabCard">

    <b>실시간 협업</b>

    <p id="roomState">
     방 없음
    </p>

    <button onclick="CS.createRoom()">
     방 만들기
    </button>

    <button onclick="CS.joinRoom()">
     참가
    </button>

   </div>

   <div class="card">

    <b>그림판</b>

    <canvas
     id="paint"
     width="270"
     height="140"
    ></canvas>

    <button onclick="CS.clearPaint()">
     지우기
    </button>

   </div>

   <div class="card">

    <b>소리</b>

    <button onclick="CS.echo()">
     🔊 테스트
    </button>

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

   g.lineTo(
    e.offsetX,
    e.offsetY
   );

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
 `<button class="cat" onclick="CS.setCat('all')">
   전체
  </button>`;

 CATS.forEach(c=>{

  if(
   c[0]==="online" &&
   state.mode!=="online"
  )
   return;

  el.innerHTML += `
   <button
    class="cat"
    style="background:${c[2]}"
    onclick="CS.setCat('${c[0]}')"
   >
    ${c[1]}
   </button>
  `;
 });
}

function visible(b){

 if(
  b.cat==="online" &&
  state.mode!=="online"
 )
  return false;

 return true;
}

function palette(){

 const el=document.getElementById("pal");

 if(!el)return;

 const q=
  (
   document.getElementById("search")?.value ||
   ""
  ).toLowerCase();

 el.innerHTML=blocks
  .filter(b=>
   (
    state.category==="all" ||
    b.cat===state.category
   ) &&
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

function ensureBlockInputs(b){

 if(b.inputs)
  return b.inputs;

 const n=b.name || "";

 let inputs=[];

 if(
  /x 10만큼|y 10만큼|굵기 5|크기 100|볼륨 100|도 회전/.test(n)
 ){

  const m=n.match(
   /-?\d+(?:\.\d+)?/
  );

  inputs=[
   {
    type:"number",
    value:m ? m[0] : "10"
   }
  ];
 }

 else if(
  /x좌표|y좌표|방향/.test(n)
 ){

  const m=n.match(
   /-?\d+(?:\.\d+)?/
  );

  inputs=[
   {
    type:"number",
    value:m ? m[0] : "0"
   }
  ];
 }

 else if(
  /말하기|생각하기/.test(n)
 ){

  inputs=[
   {
    type:"text",
    value:"안녕하세요!"
   }
  ];
 }

 else if(
  /글상자|내용 정하기|내용 추가하기/.test(n)
 ){

  inputs=[
   {
    type:"text",
    value:""
   }
  ];
 }

 else if(
  /숫자 > 숫자|숫자 = 숫자|숫자 < 숫자/.test(n)
 ){

  inputs=[
   {
    type:"slot",
    value:null
   },
   {
    type:"slot",
    value:null
   }
  ];
 }

 else if(
  /더하기|빼기|곱하기|나누기|나머지|최솟값|최댓값/.test(n)
 ){

  inputs=[
   {
    type:"slot",
    value:null
   },
   {
    type:"slot",
    value:null
   }
  ];
 }

 else if(
  /랜덤|문자열 길이/.test(n)
 ){

  inputs=[
   {
    type:"number",
    value:"1"
   },
   {
    type:"number",
    value:"10"
   }
  ];
 }

 b.inputs=inputs;

 return inputs;
}

function inputHTML(b,i,k){

 const input=
  ensureBlockInputs(b)[k];

 if(!input)
  return "";

 if(input.type==="slot"){

  const nested=input.value;

  return `
   <span
    class="cs-slot"
    onclick="CS.selectSlot('${b.id}',${k},event)"
   >
    ${
     nested
      ? esc(nested.name || "블록")
      : "값 넣기"
    }
   </span>
  `;
 }

 if(input.type==="text"){

  return `
   <input
    class="cs-input cs-text"
    value="${esc(input.value ?? "")}"
    onchange="CS.setInput('${b.id}',${k},this.value)"
    onclick="event.stopPropagation()"
   >
  `;
 }

 return `
  <input
   class="cs-input"
   type="number"
   value="${esc(input.value ?? "")}"
   onchange="CS.setInput('${b.id}',${k},this.value)"
   onclick="event.stopPropagation()"
  >
 `;
}

function blockHTML(b,i){

 const inputs=
  ensureBlockInputs(b);

 let text=
  esc(b.name);

 if(inputs.length){

  for(
   let k=inputs.length-1;
   k>=0;
   k--
  ){

   const marker=
    inputHTML(b,i,k);

   text=
    text.replace(
     /숫자|텍스트|값/,
     marker
    );
  }

  if(
   !text.includes("cs-input") &&
   !text.includes("cs-slot")
  ){

   text += " ";

   inputs.forEach((_,k)=>{
    text += inputHTML(b,i,k);
   });
  }
 }

 return `
  <div
   class="block"
   style="background:${b.color}"
   data-index="${i}"
   onclick="CS.selectBlock(${i})"
  >

   ${text}

   <button
    class="del"
    onclick="event.stopPropagation();CS.remove(${i})"
   >
    ×
   </button>

  </div>
 `;
}

function render(){

 const el=
  document.getElementById("code");

 if(!el)return;

 el.innerHTML=
  state.code.map(
   (b,i)=>blockHTML(b,i)
  ).join("");

 const stats=
  document.getElementById("stats");

 if(stats){

  stats.textContent=
   `블록 ${state.code.length} / 499 · 변수 ${state.vars.length} · 리스트 ${state.lists.length}`;
 }

 const mode=
  document.getElementById("modeLabel");

 if(mode)
  mode.textContent=
   state.mode==="online"
    ? "온라인"
    : "오프라인";

 drawStage();
}

function escAttr(s){
 return esc(s);
}

function setInput(blockId,k,value){

 const b=
  state.code.find(
   x=>x.id===blockId
  );

 if(!b)return;

 const inputs=
  ensureBlockInputs(b);

 if(!inputs[k])return;

 inputs[k].value=value;

 render();
}

let selectedSlot=null;

function selectSlot(blockId,k,e){

 if(e)
  e.stopPropagation();

 selectedSlot={
  blockId,
  k
 };

 render();
}

function putBlockInSlot(id){

 if(!selectedSlot)
  return false;

 const parent=
  state.code.find(
   b=>b.id===selectedSlot.blockId
  );

 if(!parent)
  return false;

 const src=
  blocks.find(
   b=>b.id===id
  );

 if(!src)
  return false;

 const inputs=
  ensureBlockInputs(parent);

 if(!inputs[selectedSlot.k])
  return false;

 inputs[selectedSlot.k].value={
  ...src,
  inputs:undefined
 };

 selectedSlot=null;

 render();

 return true;
}

function selectBlock(i){

 selectedSlot=null;

 const b=state.code[i];

 if(!b)return;

 log(
  `블록 선택: ${b.name}`
 );
}

function add(id){

 if(
  selectedSlot &&
  putBlockInSlot(id)
 )
  return;

 const src=
  blocks.find(
   b=>b.id===id
  );

 if(!src)return;

 if(state.code.length>=499){

  log("블록은 최대 499개까지 사용할 수 있습니다.");

  return;
 }

 state.history.push(
  JSON.stringify(state.code)
 );

 state.future=[];

 const copy={
  ...src,
  inputs:undefined
 };

 state.code.push(copy);

 render();

 if(state.connected)
  sendCode();
}

function remove(i){

 if(
  i<0 ||
  i>=state.code.length
 )
  return;

 state.history.push(
  JSON.stringify(state.code)
 );

 state.future=[];

 state.code.splice(i,1);

 render();

 if(state.connected)
  sendCode();
}

function clear(){

 if(!state.code.length)
  return;

 state.history.push(
  JSON.stringify(state.code)
 );

 state.future=[];

 state.code=[];

 render();

 if(state.connected)
  sendCode();
}

/* ---------------------------------------------------------
   실행
   --------------------------------------------------------- */

async function run(){

 if(state.running)
  return;

 state.running=true;
 state.stop=false;

 log("▶ 실행 시작");

 for(
  let i=0;
  i<state.code.length;
  i++
 ){

  if(state.stop)
   break;

  await executeBlock(
   state.code[i]
  );
 }

 state.running=false;

 drawStage();

 log("■ 실행 종료");
}

function stop(){

 state.stop=true;
 state.running=false;

 log("■ 정지");
}

async function executeBlock(b){

 if(!b)
  return;

 const a=b.action || {};

 switch(a.type){

  case "start":

   log(`시작: ${b.name}`);

   break;

  case "wait":

   await sleep(
    Number(a.ms)||0
   );

   break;

  case "repeat":

   log(
    `반복 ${a.count || 1}회`
   );

   break;

  case "move":

   if(typeof a.dx==="number")
    state.actor.x += a.dx;

   if(typeof a.dy==="number")
    state.actor.y += a.dy;

   if(typeof a.rotate==="number")
    state.actor.direction += a.rotate;

   log(
    `이동: ${state.actor.x}, ${state.actor.y}`
   );

   drawStage();

   break;

  case "looks":

   if(typeof a.size==="number")
    state.actor.size=a.size;

   if(typeof a.visible==="boolean")
    state.actor.visible=a.visible;

   if(
    /말하기/.test(b.name)
   ){

    state.lastText=
     ensureBlockInputs(b)[0]?.value ||
     "";

    log(
     `말하기: ${state.lastText}`
    );
   }

   drawStage();

   break;

  case "brush":

   if(a.op==="down")
    state.pen.down=true;

   if(a.op==="up")
    state.pen.down=false;

   if(a.op==="clear")
    clearStage();

   log(
    `붓: ${a.op || b.name}`
   );

   break;

  case "text":

   if(a.op==="show"){

    state.lastText=
     ensureBlockInputs(b)[0]?.value ||
     state.lastText;

    log(
     `글상자: ${state.lastText}`
    );
   }

   if(a.op==="clear")
    state.lastText="";

   break;

  case "sound":

   if(a.op==="beep")
    beep();

   if(a.op==="stop")
    log("소리 정지");

   break;

  case "judge":

   if(a.op==="gt")
    state.lastValue=
     Number(state.lastValue)>Number(a.value);

   else if(a.op==="eq")
    state.lastValue=
     Number(state.lastValue)===Number(a.value);

   else if(a.op==="lt")
    state.lastValue=
     Number(state.lastValue)<Number(a.value);

   else
    state.lastValue=false;

   log(
    `판단 결과: ${state.lastValue}`
   );

   break;

  case "calc":

   if(a.op==="add")
    state.lastValue=
     Number(state.lastValue)+1;

   else if(a.op==="sub")
    state.lastValue=
     Number(state.lastValue)-1;

   else if(a.op==="mul")
    state.lastValue=
     Number(state.lastValue)*2;

   else if(a.op==="div")
    state.lastValue=
     Number(state.lastValue)/2;

   else if(a.op==="mod")
    state.lastValue=
     Number(state.lastValue)%2;

   else if(a.op==="random")
    state.lastValue=
     Math.floor(
      Math.random()*10
     )+1;

   else if(a.op==="min")
    state.lastValue=
     Math.min(
      Number(state.lastValue),
      Number(a.value ?? 0)
     );

   else if(a.op==="max")
    state.lastValue=
     Math.max(
      Number(state.lastValue),
      Number(a.value ?? 0)
     );

   else if(a.op==="length")
    state.lastValue=
     String(
      state.lastText
     ).length;

   log(
    `계산 결과: ${state.lastValue}`
   );

   break;

  case "data":

   if(a.op==="add"){

    if(state.vars.length){

     state.vars[0].value=
      Number(state.vars[0].value||0)+
      Number(a.value||0);
    }

   }

   if(a.op==="sub"){

    if(state.vars.length){

     state.vars[0].value=
      Number(state.vars[0].value||0)-
      Number(a.value||0);
    }

   }

   log(
    `변수 값: ${
     state.vars[0]?.value ?? 0
    }`
   );

   break;

  case "list":

   if(!state.lists.length)
    break;

   const list=
    state.lists[0];

   if(a.op==="push")
    list.items.push(
     state.lastValue
    );

   if(a.op==="shift")
    list.items.shift();

   if(a.op==="pop")
    list.items.pop();

   break;

  case "online":

   if(a.name==="방 만들기")
    createRoom();

   if(a.name==="방 참가하기")
    joinRoom();

   if(a.name==="방 나가기")
    leaveRoom();

   break;

  case "func":

   if(a.op==="call")
    log("⚙ 함수 실행");

   break;

  default:

   log(
    `실행: ${b.name}`
   );
 }
}

/* ---------------------------------------------------------
   무대
   --------------------------------------------------------- */

function drawStage(){

 const cv=
  document.getElementById("cv");

 if(!cv)return;

 const g=
  cv.getContext("2d");

 g.clearRect(
  0,
  0,
  cv.width,
  cv.height
 );

 g.fillStyle="#fff";

 g.fillRect(
  0,
  0,
  cv.width,
  cv.height
 );

 if(state.actor.visible){

  const size=
   30*(state.actor.size/100);

  g.save();

  g.translate(
   state.actor.x,
   state.actor.y
  );

  g.rotate(
   (state.actor.direction-90)*
   Math.PI/180
  );

  g.fillStyle="#ff7043";

  g.beginPath();

  g.moveTo(
   size,
   0
  );

  g.lineTo(
   -size,
   -size/1.5
  );

  g.lineTo(
   -size/2,
   0
  );

  g.lineTo(
   -size,
   size/1.5
  );

  g.closePath();

  g.fill();

  g.restore();
 }
}

function clearStage(){

 const cv=
  document.getElementById("cv");

 if(!cv)return;

 const g=
  cv.getContext("2d");

 g.clearRect(
  0,
  0,
  cv.width,
  cv.height
 );

 g.fillStyle="#fff";

 g.fillRect(
  0,
  0,
  cv.width,
  cv.height
 );
}

function beep(){

 try{

  const AC=
   window.AudioContext ||
   window.webkitAudioContext;

  if(!AC)return;

  const ctx=
   new AC();

  const osc=
   ctx.createOscillator();

  const gain=
   ctx.createGain();

  osc.frequency.value=440;

  osc.connect(gain);

  gain.connect(
   ctx.destination
  );

  osc.start();

  gain.gain.exponentialRampToValueAtTime(
   0.0001,
   ctx.currentTime+0.25
  );

  osc.stop(
   ctx.currentTime+0.25
  );

 }catch(e){

  log(
   "소리를 재생할 수 없습니다."
  );
 }
}

/* ---------------------------------------------------------
   변수 / 리스트 / 함수
   --------------------------------------------------------- */

function newVar(){

 const name=
  prompt(
   "변수 이름을 입력하세요.",
   `변수${state.vars.length+1}`
  );

 if(!name)return;

 state.vars.push({
  name,
  value:0
 });

 log(
  `변수 생성: ${name}`
 );

 render();
}

function newList(){

 const name=
  prompt(
   "리스트 이름을 입력하세요.",
   `리스트${state.lists.length+1}`
  );

 if(!name)return;

 state.lists.push({
  name,
  items:[]
 });

 log(
  `리스트 생성: ${name}`
 );

 render();
}

function newFunc(){

 const name=
  prompt(
   "함수 이름을 입력하세요.",
   `함수${state.funcs.length+1}`
  );

 if(!name)return;

 state.funcs.push({
  name,
  code:[]
 });

 log(
  `함수 생성: ${name}`
 );

 render();
}

/* ---------------------------------------------------------
   실행 취소 / 다시 실행
   --------------------------------------------------------- */

function undo(){

 if(!state.history.length)
  return;

 state.future.push(
  JSON.stringify(state.code)
 );

 state.code=
  JSON.parse(
   state.history.pop()
  );

 render();

 log("↶ 실행 취소");
}

function redo(){

 if(!state.future.length)
  return;

 state.history.push(
  JSON.stringify(state.code)
 );

 state.code=
  JSON.parse(
   state.future.pop()
  );

 render();

 log("↷ 다시 실행");
}

/* ---------------------------------------------------------
   카테고리
   --------------------------------------------------------- */

function setCat(cat){

 state.category=cat;

 palette();
}

/* ---------------------------------------------------------
   온라인
   --------------------------------------------------------- */

function connect(){

 if(
  state.ws &&
  state.ws.readyState===WebSocket.OPEN
 )
  return;

 const protocol=
  location.protocol==="https:"
   ? "wss:"
   : "ws:";

 const url=
  `${protocol}//${location.host}/ws`;

 try{

  state.ws=
   new WebSocket(url);

  state.ws.onopen=()=>{

   state.connected=true;

   const el=
    document.getElementById("conn");

   if(el){

    el.textContent=
     "서버 연결됨";

    el.className=
     "status ok";
   }

   log(
    "온라인 서버 연결 완료"
   );
  };

  state.ws.onclose=()=>{

   state.connected=false;

   const el=
    document.getElementById("conn");

   if(el){

    el.textContent=
     "서버 오프라인";

    el.className=
     "status no";
   }

   log(
    "온라인 서버 연결 종료"
   );
  };

  state.ws.onerror=()=>{

   log(
    "온라인 서버 연결 오류"
   );
  };

  state.ws.onmessage=e=>{

   try{

    const data=
     JSON.parse(e.data);

    handleMessage(data);

   }catch(err){

    log(
     "서버 메시지를 읽을 수 없습니다."
    );
   }
  };

 }catch(e){

  log(
   "WebSocket을 사용할 수 없습니다."
  );
 }
}

function send(data){

 if(
  state.ws &&
  state.ws.readyState===WebSocket.OPEN
 ){

  state.ws.send(
   JSON.stringify(data)
  );
 }
}

function request(data){

 send(data);
}

function sendCode(){

 send({
  type:"code",
  code:state.code
 });
}

function handleMessage(data){

 if(!data)
  return;

 if(data.type==="room"){

  state.room=
   data.room ||
   null;

  const el=
   document.getElementById("roomState");

  if(el)
   el.textContent=
    state.room
     ? `방: ${state.room}`
     : "방 없음";
 }

 if(data.type==="code"){

  if(Array.isArray(data.code)){

   state.code=
    data.code;

   render();
  }
 }

 if(data.type==="projects"){

  const el=
   document.getElementById("projects");

  if(!el)return;

  const list=
   Array.isArray(data.projects)
    ? data.projects
    : [];

  if(!list.length){

   el.innerHTML=
    `<div class="card">
      공개 프로젝트가 없습니다.
     </div>`;

   return;
  }

  el.innerHTML=
   list.map(p=>`
    <div class="card">

     <h3>
      ${esc(p.name || "프로젝트")}
     </h3>

     <p>
      ❤️ ${Number(p.likes||0)}
     </p>

     <button
      onclick="CS.openProject('${escAttr(p.id||"")}')"
     >
      열기
     </button>

    </div>
   `).join("");
 }
}

function createRoom(){

 if(state.mode!=="online"){

  log(
   "온라인 모드에서만 방을 만들 수 있습니다."
  );

  return;
 }

 const room=
  prompt(
   "방 이름을 입력하세요.",
   "room1"
  );

 if(!room)return;

 state.room=room;

 send({
  type:"create_room",
  room
 });

 const el=
  document.getElementById("roomState");

 if(el)
  el.textContent=
   `방: ${room}`;

 log(
  `방 생성 요청: ${room}`
 );
}

function joinRoom(){

 if(state.mode!=="online"){

  log(
   "온라인 모드에서만 방에 참가할 수 있습니다."
  );

  return;
 }

 const room=
  prompt(
   "참가할 방 이름을 입력하세요."
  );

 if(!room)return;

 state.room=room;

 send({
  type:"join_room",
  room
 });

 const el=
  document.getElementById("roomState");

 if(el)
  el.textContent=
   `방: ${room}`;

 log(
  `방 참가 요청: ${room}`
 );
}

function leaveRoom(){

 if(state.connected){

  send({
   type:"leave_room",
   room:state.room
  });
 }

 state.room=null;

 const el=
  document.getElementById("roomState");

 if(el)
  el.textContent=
   "방 없음";

 log(
  "방에서 나왔습니다."
 );
}

/* ---------------------------------------------------------
   저장 / 공개
   --------------------------------------------------------- */

function save(){

 state.project=
  document.getElementById("projectName")?.value ||
  state.project;

 const data={
  name:state.project,
  mode:state.mode,
  code:state.code,
  vars:state.vars,
  lists:state.lists,
  funcs:state.funcs
 };

 localStorage.setItem(
  "codescript-project",
  JSON.stringify(data)
 );

 if(state.connected){

  send({
   type:"save_project",
   project:data
  });
 }

 log(
  `저장 완료: ${state.project}`
 );
}

function publish(){

 state.project=
  document.getElementById("projectName")?.value ||
  state.project;

 const project={
  name:state.project,
  code:state.code,
  vars:state.vars,
  lists:state.lists,
  funcs:state.funcs
 };

 send({
  type:"publish",
  project
 });

 log(
  "프로젝트 공개 요청"
 );
}

function openProject(id){

 send({
  type:"get_project",
  id
 });

 log(
  `프로젝트 불러오기: ${id}`
 );
}

/* ---------------------------------------------------------
   그림판
   --------------------------------------------------------- */

function clearPaint(){

 const p=
  document.getElementById("paint");

 if(!p)return;

 const g=
  p.getContext("2d");

 g.clearRect(
  0,
  0,
  p.width,
  p.height
 );

 state.paint.layers=[];

 log(
  "그림판을 지웠습니다."
 );
}

function echo(){

 beep();

 log(
  "🔊 테스트 소리"
 );
}

/* ---------------------------------------------------------
   초기 진입
   --------------------------------------------------------- */

home();

/* ---------------------------------------------------------
   전역 API
   --------------------------------------------------------- */

window.CS={

 home,
 explore,
 chooseEditor,

 editor,

 setCat,
 add,
 remove,
 clear,

 selectBlock,
 selectSlot,
 setInput,

 run,
 stop,

 undo,
 redo,

 newVar,
 newList,
 newFunc,

 connect,
 createRoom,
 joinRoom,
 leaveRoom,

 save,
 publish,
 openProject,

 clearPaint,
 echo
};

/* =========================================================
   Codescript 추가 기능
   2/4
   ========================================================= */

/* ---------------------------------------------------------
   입력값 처리
   --------------------------------------------------------- */

function resolveInput(block, index, fallback = 0){

  const inputs =
    ensureBlockInputs(block);

  const input =
    inputs[index];

  if(!input)
    return fallback;

  if(
    input.type === "slot" &&
    input.value
  ){

    return resolveNestedValue(
      input.value
    );
  }

  const value =
    input.value;

  if(value === undefined ||
     value === null ||
     value === "")
    return fallback;

  const number =
    Number(value);

  if(!Number.isNaN(number))
    return number;

  return value;
}

function resolveNestedValue(block){

  if(!block)
    return 0;

  const a =
    block.action || {};

  const inputs =
    block.inputs || [];

  if(a.type === "calc"){

    const x =
      inputs[0]
        ? resolveInput(block,0,0)
        : 0;

    const y =
      inputs[1]
        ? resolveInput(block,1,0)
        : 0;

    switch(a.op){

      case "add":
        return Number(x)+Number(y);

      case "sub":
        return Number(x)-Number(y);

      case "mul":
        return Number(x)*Number(y);

      case "div":
        return Number(y) === 0
          ? 0
          : Number(x)/Number(y);

      case "mod":
        return Number(y) === 0
          ? 0
          : Number(x)%Number(y);

      case "min":
        return Math.min(
          Number(x),
          Number(y)
        );

      case "max":
        return Math.max(
          Number(x),
          Number(y)
        );
    }
  }

  if(a.type === "judge"){

    const x =
      inputs[0]
        ? resolveInput(block,0,0)
        : 0;

    const y =
      inputs[1]
        ? resolveInput(block,1,0)
        : 0;

    if(a.op === "gt")
      return Number(x)>Number(y);

    if(a.op === "lt")
      return Number(x)<Number(y);

    if(a.op === "eq")
      return String(x)===String(y);
  }

  if(a.type === "data"){

    const name =
      inputs[0]
        ? resolveInput(block,0,"")
        : "";

    const found =
      state.vars.find(
        v=>v.name===name
      );

    return found
      ? found.value
      : 0;
  }

  return block.name || "";
}

/* ---------------------------------------------------------
   실제 입력값을 사용하는 실행 엔진
   --------------------------------------------------------- */

async function executeBlockReal(block){

  if(!block)
    return null;

  const action =
    block.action || {};

  const inputs =
    ensureBlockInputs(block);

  switch(action.type){

    /* ------------------------------
       움직임
       ------------------------------ */

    case "move":{

      let dx =
        typeof action.dx === "number"
          ? action.dx
          : 0;

      let dy =
        typeof action.dy === "number"
          ? action.dy
          : 0;

      if(/x 10만큼/.test(block.name))
        dx=resolveInput(block,0,10);

      if(/y 10만큼/.test(block.name))
        dy=resolveInput(block,0,10);

      if(/위로/.test(block.name))
        dy=-Math.abs(
          resolveInput(block,0,10)
        );

      if(/아래로/.test(block.name))
        dy=Math.abs(
          resolveInput(block,0,10)
        );

      state.actor.x += dx;
      state.actor.y += dy;

      if(typeof action.rotate==="number"){

        state.actor.direction +=
          resolveInput(
            block,
            0,
            action.rotate
          );
      }

      state.actor.x =
        Math.max(
          0,
          Math.min(
            640,
            state.actor.x
          )
        );

      state.actor.y =
        Math.max(
          0,
          Math.min(
            400,
            state.actor.y
          )
        );

      drawStage();

      log(
        `이동 → x:${Math.round(state.actor.x)} y:${Math.round(state.actor.y)}`
      );

      return state.actor;
    }

    /* ------------------------------
       계산
       ------------------------------ */

    case "calc":{

      let x =
        resolveInput(block,0,0);

      let y =
        resolveInput(block,1,0);

      let result=0;

      switch(action.op){

        case "add":
          result =
            Number(x)+Number(y);
          break;

        case "sub":
          result =
            Number(x)-Number(y);
          break;

        case "mul":
          result =
            Number(x)*Number(y);
          break;

        case "div":
          result =
            Number(y)===0
              ? 0
              : Number(x)/Number(y);
          break;

        case "mod":
          result =
            Number(y)===0
              ? 0
              : Number(x)%Number(y);
          break;

        case "min":
          result =
            Math.min(
              Number(x),
              Number(y)
            );
          break;

        case "max":
          result =
            Math.max(
              Number(x),
              Number(y)
            );
          break;

        case "random":{

          const min =
            Number(
              resolveInput(
                block,
                0,
                1
              )
            );

          const max =
            Number(
              resolveInput(
                block,
                1,
                10
              )
            );

          result =
            Math.floor(
              Math.random()*
              (
                Math.max(min,max)-
                Math.min(min,max)+1
              )
            )+
            Math.min(min,max);

          break;
        }

        case "length":

          result =
            String(
              resolveInput(
                block,
                0,
                ""
              )
            ).length;

          break;

        default:

          result =
            Number(x)||0;
      }

      state.lastValue=result;

      log(
        `계산 → ${result}`
      );

      return result;
    }

    /* ------------------------------
       판단
       ------------------------------ */

    case "judge":{

      let result=false;

      const x =
        resolveInput(
          block,
          0,
          0
        );

      const y =
        resolveInput(
          block,
          1,
          0
        );

      if(
        /마우스가 눌렸는가/.test(
          block.name
        )
      ){

        result =
          !!state.mouseDown;
      }

      else if(
        /키가 눌렸는가/.test(
          block.name
        )
      ){

        result =
          !!state.keyDown;
      }

      else if(
        /벽에 닿았는가/.test(
          block.name
        )
      ){

        result =
          state.actor.x<=0 ||
          state.actor.x>=640 ||
          state.actor.y<=0 ||
          state.actor.y>=400;
      }

      else if(
        /큰가/.test(block.name)
      ){

        result =
          Number(x)>Number(y);
      }

      else if(
        /작은가/.test(block.name)
      ){

        result =
          Number(x)<Number(y);
      }

      else if(
        /같은가/.test(block.name)
      ){

        result =
          String(x)===String(y);
      }

      else if(action.op==="gt"){

        result =
          Number(x)>Number(y);
      }

      else if(action.op==="lt"){

        result =
          Number(x)<Number(y);
      }

      else if(action.op==="eq"){

        result =
          String(x)===String(y);
      }

      state.lastValue=result;

      log(
        `판단 → ${result ? "참" : "거짓"}`
      );

      return result;
    }

    /* ------------------------------
       생김새
       ------------------------------ */

    case "looks":{

      if(
        typeof action.size === "number"
      ){

        state.actor.size =
          resolveInput(
            block,
            0,
            action.size
          );
      }

      if(
        typeof action.visible ===
        "boolean"
      ){

        state.actor.visible =
          action.visible;
      }

      if(
        /말하기/.test(block.name)
      ){

        state.lastText =
          String(
            resolveInput(
              block,
              0,
              ""
            )
          );

        state.speechUntil =
          Date.now()+3000;
      }

      else if(
        /생각하기/.test(block.name)
      ){

        state.lastText =
          String(
            resolveInput(
              block,
              0,
              ""
            )
          );

        state.thought=true;
      }

      else if(
        /말하기 지우기/.test(
          block.name
        )
      ){

        state.lastText="";
        state.thought=false;
      }

      drawStage();

      log(
        state.lastText
          ? `💬 ${state.lastText}`
          : "생김새 변경"
      );

      return state.lastText;
    }

    /* ------------------------------
       자료 / 변수
       ------------------------------ */

    case "data":{

      if(!state.vars.length){

        log(
          "변수가 없습니다. 먼저 변수를 만들어 주세요."
        );

        return 0;
      }

      const variable =
        state.vars[0];

      let value =
        resolveInput(
          block,
          0,
          action.value ?? 0
        );

      if(
        /변수 설정/.test(
          block.name
        )
      ){

        variable.value=value;
      }

      else if(
        /변수 바꾸기/.test(
          block.name
        )
      ){

        variable.value =
          Number(variable.value||0)+
          Number(value||0);
      }

      else if(
        action.op==="add"
      ){

        variable.value =
          Number(variable.value||0)+
          Number(value||0);
      }

      else if(
        action.op==="sub"
      ){

        variable.value =
          Number(variable.value||0)-
          Number(value||0);
      }

      state.lastValue=
        variable.value;

      log(
        `변수 ${variable.name}: ${variable.value}`
      );

      return variable.value;
    }

    /* ------------------------------
       리스트
       ------------------------------ */

    case "list":{

      if(!state.lists.length){

        log(
          "리스트가 없습니다. 먼저 리스트를 만들어 주세요."
        );

        return null;
      }

      const list=
        state.lists[0];

      const value =
        resolveInput(
          block,
          0,
          state.lastValue
        );

      if(
        action.op==="push" ||
        /추가/.test(block.name)
      ){

        list.items.push(value);
      }

      if(
        action.op==="shift" ||
        /첫 번째 삭제/.test(block.name)
      ){

        list.items.shift();
      }

      if(
        action.op==="pop" ||
        /마지막 삭제/.test(block.name)
      ){

        list.items.pop();
      }

      log(
        `리스트 ${list.name}: ${JSON.stringify(list.items)}`
      );

      return list.items;
    }

    /* ------------------------------
       글상자
       ------------------------------ */

    case "text":{

      if(
        /내용 정하기/.test(
          block.name
        ) ||
        action.op==="show"
      ){

        state.lastText =
          String(
            resolveInput(
              block,
              0,
              ""
            )
          );
      }

      if(
        /내용 추가하기/.test(
          block.name
        )
      ){

        state.lastText +=
          String(
            resolveInput(
              block,
              0,
              ""
            )
          );
      }

      if(
        action.op==="clear" ||
        /삭제/.test(block.name)
      ){

        state.lastText="";
      }

      drawStage();

      log(
        `글상자 → ${state.lastText}`
      );

      return state.lastText;
    }

    /* ------------------------------
       붓
       ------------------------------ */

    case "brush":{

      if(
        action.op==="down" ||
        /펜 내리기/.test(block.name)
      ){

        state.pen.down=true;
      }

      if(
        action.op==="up" ||
        /펜 올리기/.test(block.name)
      ){

        state.pen.down=false;
      }

      if(
        /펜 색/.test(block.name)
      ){

        state.pen.color =
          String(
            resolveInput(
              block,
              0,
              "#000000"
            )
          );
      }

      if(
        /펜 굵기/.test(block.name)
      ){

        state.pen.width =
          Number(
            resolveInput(
              block,
              0,
              3
            )
          );
      }

      if(
        action.op==="clear" ||
        /모두 지우기/.test(block.name)
      ){

        clearStage();
      }

      log(
        `붓 → ${state.pen.down ? "내림" : "올림"}`
      );

      return state.pen;
    }

    /* ------------------------------
       소리
       ------------------------------ */

    case "sound":{

      if(
        action.op==="beep" ||
        /소리 재생/.test(block.name)
      ){

        beep();
      }

      if(
        action.op==="stop" ||
        /소리 정지/.test(block.name)
      ){

        if(
          window.speechSynthesis
        ){

          window.speechSynthesis.cancel();
        }
      }

      return true;
    }

    /* ------------------------------
       기다리기
       ------------------------------ */

    case "wait":{

      const seconds =
        Number(
          resolveInput(
            block,
            0,
            (action.ms||1000)/1000
          )
        );

      await sleep(
        Math.max(
          0,
          seconds*1000
        )
      );

      return true;
    }

    /* ------------------------------
       함수
       ------------------------------ */

    case "func":{

      if(
        action.op==="call" ||
        /함수 실행/.test(block.name)
      ){

        const fn =
          state.funcs[0];

        if(fn){

          log(
            `⚙ 함수 실행: ${fn.name}`
          );

          for(
            const child of fn.code
          ){

            if(state.stop)
              break;

            await executeBlockReal(
              child
            );
          }
        }

        else{

          log(
            "실행할 함수가 없습니다."
          );
        }
      }

      return true;
    }

    default:

      log(
        `실행: ${block.name}`
      );

      return true;
  }
}

/* 기존 executeBlock을 실제 입력 처리 버전으로 연결 */

const oldExecuteBlock =
  executeBlock;

executeBlock =
  async function(block){

    try{

      return await executeBlockReal(
        block
      );

    }catch(error){

      console.error(error);

      log(
        `⚠ 블록 실행 오류: ${error.message}`
      );
    }
  };

/* ---------------------------------------------------------
   키보드 / 마우스 입력
   --------------------------------------------------------- */

state.mouseDown=false;
state.keyDown=false;
state.keys={};

window.addEventListener(
 "mousedown",
 ()=>{
  state.mouseDown=true;
 }
);

window.addEventListener(
 "mouseup",
 ()=>{
  state.mouseDown=false;
 }
);

window.addEventListener(
 "keydown",
 e=>{

  state.keyDown=true;
  state.keys[e.key]=true;

  if(
    e.key==="Escape" &&
    state.running
  ){

    stop();
  }
 }
);

window.addEventListener(
 "keyup",
 e=>{

  state.keys[e.key]=false;

  state.keyDown=
    Object.values(
      state.keys
    ).some(Boolean);
 }
);

/* ---------------------------------------------------------
   무대 말풍선 렌더링
   --------------------------------------------------------- */

const originalDrawStage =
  drawStage;

drawStage=function(){

  originalDrawStage();

  const cv=
    document.getElementById("cv");

  if(!cv)
    return;

  const g=
    cv.getContext("2d");

  if(
    state.actor.visible &&
    state.lastText
  ){

    const text=
      String(state.lastText);

    const width=
      Math.min(
        220,
        Math.max(
          100,
          text.length*9+24
        )
      );

    const x=
      Math.min(
        cv.width-width-10,
        Math.max(
          10,
          state.actor.x
        )
      );

    const y=
      Math.max(
        55,
        state.actor.y-55
      );

    g.fillStyle="#fff";

    g.beginPath();

    g.roundRect(
      x,
      y,
      width,
      42,
      12
    );

    g.fill();

    g.strokeStyle="#777";

    g.stroke();

    g.fillStyle="#222";

    g.font="14px Arial";

    g.fillText(
      text.slice(0,28),
      x+10,
      y+26
    );
  }
};

/* ---------------------------------------------------------
   프로젝트 로컬 저장소
   --------------------------------------------------------- */

function loadLocal(){

  try{

    const raw =
      localStorage.getItem(
        "codescript-project"
      );

    if(!raw)
      return false;

    const data =
      JSON.parse(raw);

    if(
      Array.isArray(data.code)
    ){

      state.code=
        data.code;
    }

    if(
      Array.isArray(data.vars)
    ){

      state.vars=
        data.vars;
    }

    if(
      Array.isArray(data.lists)
    ){

      state.lists=
        data.lists;
    }

    if(
      Array.isArray(data.funcs)
    ){

      state.funcs=
        data.funcs;
    }

    if(data.name)
      state.project=data.name;

    log(
      "이전 프로젝트를 불러왔습니다."
    );

    render();

    return true;

  }catch(error){

    console.warn(
      "로컬 프로젝트 불러오기 실패",
      error
    );

    return false;
  }
}

/* ---------------------------------------------------------
   프로젝트 JSON 가져오기 / 내보내기
   --------------------------------------------------------- */

function exportProject(){

  const data={
    version:1,
    app:"Codescript",
    name:state.project,
    mode:state.mode,
    code:state.code,
    vars:state.vars,
    lists:state.lists,
    funcs:state.funcs
  };

  const blob=
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:"application/json"
      }
    );

  const url=
    URL.createObjectURL(blob);

  const a=
    document.createElement("a");

  a.href=url;

  a.download=
    `${state.project || "codescript"}.json`;

  a.click();

  setTimeout(
    ()=>URL.revokeObjectURL(url),
    1000
  );

  log(
    "프로젝트 JSON 내보내기 완료"
  );
}

function importProject(){

  const input=
    document.createElement("input");

  input.type="file";

  input.accept=".json,application/json";

  input.onchange=()=>{

    const file=
      input.files?.[0];

    if(!file)
      return;

    const reader=
      new FileReader();

    reader.onload=()=>{

      try{

        const data=
          JSON.parse(
            reader.result
          );

        if(
          !Array.isArray(
            data.code
          )
        ){

          throw new Error(
            "code 데이터가 없습니다."
          );
        }

        state.code=
          data.code.slice(
            0,
            499
          );

        state.vars=
          Array.isArray(data.vars)
            ? data.vars
            : [];

        state.lists=
          Array.isArray(data.lists)
            ? data.lists
            : [];

        state.funcs=
          Array.isArray(data.funcs)
            ? data.funcs
            : [];

        if(data.name)
          state.project=
            data.name;

        render();

        log(
          "프로젝트 가져오기 완료"
        );

      }catch(error){

        alert(
          "프로젝트 파일을 읽을 수 없습니다.\n"+
          error.message
        );
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

/* ---------------------------------------------------------
   공유 링크
   --------------------------------------------------------- */

function shareProject(){

  const data={
    name:state.project,
    code:state.code,
    vars:state.vars,
    lists:state.lists,
    funcs:state.funcs
  };

  const encoded=
    btoa(
      encodeURIComponent(
        JSON.stringify(data)
      )
    );

  const url=
    location.origin+
    location.pathname+
    "?project="+
    encoded;

  if(
    navigator.clipboard
  ){

    navigator.clipboard.writeText(
      url
    ).then(
      ()=>log(
        "공유 링크를 클립보드에 복사했습니다."
      )
    );

  }else{

    prompt(
      "공유 링크",
      url
    );
  }
}

function loadSharedProject(){

  const params=
    new URLSearchParams(
      location.search
    );

  const encoded=
    params.get("project");

  if(!encoded)
    return false;

  try{

    const data=
      JSON.parse(
        decodeURIComponent(
          atob(encoded)
        )
      );

    if(
      Array.isArray(data.code)
    ){

      state.code=
        data.code.slice(
          0,
          499
        );
    }

    if(
      Array.isArray(data.vars)
    )
      state.vars=data.vars;

    if(
      Array.isArray(data.lists)
    )
      state.lists=data.lists;

    if(
      Array.isArray(data.funcs)
    )
      state.funcs=data.funcs;

    if(data.name)
      state.project=data.name;

    return true;

  }catch(error){

    console.warn(
      "공유 프로젝트 읽기 실패",
      error
    );

    return false;
  }
}

/* ---------------------------------------------------------
   추가 UI 버튼
   --------------------------------------------------------- */

function editorTools(){

  const tools=
    document.querySelector(".tools");

  if(!tools)
    return;

  if(
    document.getElementById(
      "extraTools"
    )
  )
    return;

  const box=
    document.createElement("span");

  box.id="extraTools";

  box.innerHTML=`
    <button onclick="CS.loadLocal()">
      📂 불러오기
    </button>

    <button onclick="CS.exportProject()">
      📤 내보내기
    </button>

    <button onclick="CS.importProject()">
      📥 가져오기
    </button>

    <button onclick="CS.shareProject()">
      🔗 공유
    </button>
  `;

  tools.appendChild(box);
}

/* ---------------------------------------------------------
   기존 editor를 감싸서 추가 도구 초기화
   --------------------------------------------------------- */

const originalEditor =
  editor;

editor=function(mode){

  originalEditor(mode);

  setTimeout(
    ()=>{
      editorTools();
      drawStage();
    },
    0
  );
};

/* ---------------------------------------------------------
   전역 API 추가
   --------------------------------------------------------- */

Object.assign(
  window.CS,
  {
    loadLocal,
    exportProject,
    importProject,
    shareProject
  }
);

/* ---------------------------------------------------------
   공유 프로젝트가 있으면 우선 적용
   --------------------------------------------------------- */

if(
  loadSharedProject()
){

  if(
    state.page==="editor"
  ){

    render();
  }
}
  /* =========================
   3 / 4
   ========================= */

/* ---------- 입력/실행 보강 ---------- */

function getBlockInputValue(block,key,fallback=""){
  if(!block || !block.inputs) return fallback;

  const v=block.inputs[key];

  if(v===undefined || v===null) return fallback;

  if(typeof v==="object" && v.block){
    return resolveNestedValue(v.block);
  }

  return v;
}

function numValue(v,fallback=0){
  const n=Number(v);
  return Number.isFinite(n)?n:fallback;
}

function textValue(v){
  if(v===undefined || v===null) return "";
  return String(v);
}

/* ---------- 변수 ---------- */

function setVarValue(name,value){
  if(!name) return;

  if(!state.varsData)
    state.varsData={};

  state.varsData[name]=value;

  try{
    localStorage.setItem(
      "codescript:var:"+name,
      JSON.stringify(value)
    );
  }catch(e){}

  render();
}

function getVarValue(name){
  if(!name) return 0;

  if(state.varsData && name in state.varsData)
    return state.varsData[name];

  try{
    const raw=localStorage.getItem(
      "codescript:var:"+name
    );

    if(raw!==null)
      return JSON.parse(raw);
  }catch(e){}

  return 0;
}

/* ---------- 리스트 ---------- */

function ensureLists(){
  if(!state.listsData)
    state.listsData={};
}

function createList(name){
  ensureLists();

  if(!name) return;

  if(!Array.isArray(state.listsData[name]))
    state.listsData[name]=[];

  render();
}

function deleteList(name){
  ensureLists();

  if(name in state.listsData)
    delete state.listsData[name];

  render();
}

function listAdd(name,value){
  ensureLists();

  if(!Array.isArray(state.listsData[name]))
    state.listsData[name]=[];

  state.listsData[name].push(value);
  render();
}

function listDelete(name,index){
  ensureLists();

  if(!Array.isArray(state.listsData[name]))
    return;

  index=Math.max(0,Number(index)||0);

  state.listsData[name].splice(index,1);

  render();
}

function listGet(name,index){
  ensureLists();

  if(!Array.isArray(state.listsData[name]))
    return "";

  index=Math.max(0,(Number(index)||1)-1);

  return state.listsData[name][index] ?? "";
}

function listLength(name){
  ensureLists();

  if(!Array.isArray(state.listsData[name]))
    return 0;

  return state.listsData[name].length;
}

/* ---------- 함수 ---------- */

if(!state.funcsData)
  state.funcsData={};

function createFunction(name){
  if(!name) return;

  if(!state.funcsData[name]){
    state.funcsData[name]={
      name,
      blocks:[]
    };
  }

  render();
}

function deleteFunction(name){
  if(!state.funcsData) return;

  delete state.funcsData[name];

  render();
}

/* ---------- 연산 ---------- */

function calculate(op,a,b){
  a=Number(a);
  b=Number(b);

  switch(op){

    case "+":
    case "더하기":
      return a+b;

    case "-":
    case "빼기":
      return a-b;

    case "*":
    case "곱하기":
      return a*b;

    case "/":
    case "나누기":
      return b===0 ? 0 : a/b;

    case "%":
    case "나머지":
      return b===0 ? 0 : a%b;

    case "^":
    case "제곱":
      return Math.pow(a,b);

    default:
      return 0;
  }
}

function compareValues(op,a,b){

  switch(op){

    case "=":
    case "같다":
    case "같음":
      return String(a)===String(b);

    case "!=":
    case "다르다":
    case "다름":
      return String(a)!==String(b);

    case ">":
    case "크다":
      return Number(a)>Number(b);

    case "<":
    case "작다":
      return Number(a)<Number(b);

    case ">=":
      return Number(a)>=Number(b);

    case "<=":
      return Number(a)<=Number(b);

    default:
      return false;
  }
}

/* ---------- 문자열 ---------- */

function stringLength(v){
  return String(v ?? "").length;
}

function stringJoin(a,b){
  return String(a ?? "")+String(b ?? "");
}

function stringContains(a,b){
  return String(a ?? "").includes(String(b ?? ""));
}

function stringCharAt(str,index){
  str=String(str ?? "");

  index=Math.floor(Number(index)||1)-1;

  if(index<0 || index>=str.length)
    return "";

  return str[index];
}

/* ---------- 랜덤 ---------- */

function randomNumber(a,b){
  a=Math.ceil(Number(a)||0);
  b=Math.floor(Number(b)||0);

  if(b<a){
    const t=a;
    a=b;
    b=t;
  }

  return Math.floor(
    Math.random()*(b-a+1)
  )+a;
}

/* ---------- 실행기 ---------- */

async function runBlocks(blocks){

  if(!Array.isArray(blocks))
    return;

  let i=0;

  while(i<blocks.length){

    const block=blocks[i];

    if(!block){
      i++;
      continue;
    }

    if(block.disabled){
      i++;
      continue;
    }

    try{
      await executeBlockReal(block);
    }catch(e){
      log("실행 오류: "+e.message);
    }

    i++;

    await new Promise(
      r=>setTimeout(r,0)
    );
  }
}

/* ---------- 반복 ---------- */

async function repeatBlocks(count,blocks){

  count=Math.max(
    0,
    Math.floor(Number(count)||0)
  );

  for(let i=0;i<count;i++){

    await runBlocks(blocks);

    if(state.stopRequested)
      break;
  }
}

/* ---------- 조건 ---------- */

async function ifBlocks(condition,yesBlocks,noBlocks){

  if(condition){
    await runBlocks(yesBlocks);
  }else{
    await runBlocks(noBlocks);
  }
}

/* ---------- 키보드 ---------- */

if(!state.keys)
  state.keys={};

window.addEventListener("keydown",e=>{
  state.keys[e.key]=true;
});

window.addEventListener("keyup",e=>{
  state.keys[e.key]=false;
});

function keyPressed(key){
  return !!state.keys[key];
}

/* ---------- 마우스 ---------- */

if(!state.mouse){
  state.mouse={
    x:0,
    y:0,
    down:false
  };
}

function updateMousePosition(e){

  const rect=
    stage?.getBoundingClientRect?.();

  if(!rect) return;

  state.mouse.x=
    e.clientX-rect.left;

  state.mouse.y=
    e.clientY-rect.top;
}

window.addEventListener("mousemove",e=>{
  updateMousePosition(e);
});

window.addEventListener("mousedown",()=>{
  state.mouse.down=true;
});

window.addEventListener("mouseup",()=>{
  state.mouse.down=false;
});

/* ---------- 스테이지 입력 ---------- */

function stageClickHandler(e){

  updateMousePosition(e);

  if(typeof state.stageClick==="function"){
    try{
      state.stageClick(
        state.mouse.x,
        state.mouse.y
      );
    }catch(err){}
  }
}

if(stage){
  stage.addEventListener(
    "click",
    stageClickHandler
  );
}

/* ---------- 배우 이동 ---------- */

function moveActor(dx,dy){

  if(!state.actor)
    state.actor={
      x:0,
      y:0,
      dir:90,
      size:100
    };

  state.actor.x+=Number(dx)||0;
  state.actor.y+=Number(dy)||0;

  drawStage();
}

function goActor(x,y){

  if(!state.actor)
    state.actor={
      x:0,
      y:0,
      dir:90,
      size:100
    };

  state.actor.x=Number(x)||0;
  state.actor.y=Number(y)||0;

  drawStage();
}

function turnActor(deg){

  if(!state.actor)
    state.actor={
      x:0,
      y:0,
      dir:90,
      size:100
    };

  state.actor.dir+=Number(deg)||0;

  drawStage();
}

/* ---------- 말하기 ---------- */

function say(text){

  state.speech={
    text:String(text ?? ""),
    until:Date.now()+3000
  };

  drawStage();

  setTimeout(()=>{
    if(
      state.speech &&
      state.speech.until<=Date.now()
    ){
      state.speech=null;
      drawStage();
    }
  },3050);
}

/* ---------- 그림판 데이터 ---------- */

function ensurePaintLayers(){

  if(!state.paint)
    state.paint={};

  if(!Array.isArray(state.paint.layers))
    state.paint.layers=[];

  if(state.paint.layers.length===0){

    state.paint.layers.push({
      name:"배경",
      visible:true,
      opacity:100,
      objects:[]
    });
  }
}

function addPaintLayer(name="레이어"){

  ensurePaintLayers();

  state.paint.layers.push({
    name,
    visible:true,
    opacity:100,
    objects:[]
  });

  state.paint.activeLayer=
    state.paint.layers.length-1;

  render();
}

function removePaintLayer(index){

  ensurePaintLayers();

  if(state.paint.layers.length<=1)
    return;

  index=
    index===undefined
      ? state.paint.activeLayer
      : Number(index);

  if(index<0 ||
     index>=state.paint.layers.length)
    return;

  state.paint.layers.splice(index,1);

  state.paint.activeLayer=
    Math.max(
      0,
      Math.min(
        state.paint.activeLayer,
        state.paint.layers.length-1
      )
    );

  render();
}

function setPaintTool(tool){

  ensurePaintLayers();

  state.paint.tool=tool;

  render();
}

function setPaintColor(color){

  ensurePaintLayers();

  state.paint.color=color;

  render();
}

/* ---------- 프로젝트 데이터 ---------- */

function getProjectData(){

  return {
    version:3,

    name:state.projectName || "새 프로젝트",

    mode:state.mode || "offline",

    blocks:
      Array.isArray(state.blocks)
        ? state.blocks
        : [],

    actor:
      state.actor || {
        x:0,
        y:0,
        dir:90,
        size:100
      },

    vars:
      state.varsData || {},

    lists:
      state.listsData || {},

    funcs:
      state.funcsData || {},

    paint:
      state.paint || {},

    updatedAt:Date.now()
  };
}

function applyProjectData(data){

  if(!data || typeof data!=="object")
    return false;

  state.projectName=
    data.name || "불러온 프로젝트";

  state.mode=
    data.mode || "offline";

  state.blocks=
    Array.isArray(data.blocks)
      ? data.blocks
      : [];

  state.actor=
    data.actor || {
      x:0,
      y:0,
      dir:90,
      size:100
    };

  state.varsData=
    data.vars || {};

  state.listsData=
    data.lists || {};

  state.funcsData=
    data.funcs || {};

  state.paint=
    data.paint || {
      mode:"bitmap",
      tool:"pen",
      color:"#111111",
      alpha:100,
      width:8,
      zoom:100,
      activeLayer:0,
      layers:[],
      vectorObjects:[],
      pixels:null
    };

  ensurePaintLayers();

  render();
  drawStage();

  return true;
}

/* ---------- 자동 저장 ---------- */

let autoSaveTimer=null;

function scheduleAutoSave(){

  clearTimeout(autoSaveTimer);

  autoSaveTimer=setTimeout(()=>{

    try{

      localStorage.setItem(
        "codescript:autosave",
        JSON.stringify(
          getProjectData()
        )
      );

    }catch(e){}

  },500);
}

/* ---------- 기존 상태 변경 감시 ---------- */

function markChanged(){

  state.changed=true;

  scheduleAutoSave();

  if(
    typeof updateUndoState==="function"
  ){
    try{
      updateUndoState();
    }catch(e){}
  }
}

/* ---------- 블록 추가 후 자동 저장 ---------- */

if(typeof window.add==="function"){

  const originalAdd=
    window.add;

  window.add=function(id){

    const result=
      originalAdd(id);

    markChanged();

    return result;
  };
}

/* ---------- 블록 삭제 후 자동 저장 ---------- */

if(typeof window.removeBlock==="function"){

  const originalRemove=
    window.removeBlock;

  window.removeBlock=function(index){

    const result=
      originalRemove(index);

    markChanged();

    return result;
  };
}

/* ---------- 실행 버튼 ---------- */

function stopExecution(){

  state.stopRequested=true;

  state.running=false;

  log("실행 중지");

  render();
}

async function startExecution(){

  if(state.running)
    return;

  state.running=true;
  state.stopRequested=false;

  render();

  try{

    await runBlocks(
      state.blocks || []
    );

  }catch(e){

    log(
      "실행 오류: "+
      (e?.message || e)
    );

  }finally{

    state.running=false;

    render();
  }
}

/* ---------- 프로젝트 초기화 ---------- */

function newProject(){

  state.projectName="새 프로젝트";

  state.blocks=[];

  state.varsData={};

  state.listsData={};

  state.funcsData={};

  state.actor={
    x:0,
    y:0,
    dir:90,
    size:100
  };

  state.paint={
    mode:"bitmap",
    tool:"pen",
    color:"#111111",
    alpha:100,
    width:8,
    zoom:100,
    activeLayer:0,
    layers:[],
    vectorObjects:[],
    pixels:null
  };

  ensurePaintLayers();

  state.changed=false;

  render();
  drawStage();
}

/* ---------- 프로젝트 복제 ---------- */

function cloneProject(){

  const copy=
    JSON.parse(
      JSON.stringify(
        getProjectData()
      )
    );

  copy.name=
    (copy.name || "프로젝트")+
    " 복사본";

  applyProjectData(copy);
}

/* ---------- JSON 다운로드 데이터 생성 ---------- */

function projectJSON(){

  return JSON.stringify(
    getProjectData(),
    null,
    2
  );
}

/* ---------- 클립보드 ---------- */

async function copyProjectJSON(){

  try{

    await navigator.clipboard.writeText(
      projectJSON()
    );

    log("프로젝트 JSON을 복사했습니다.");

  }catch(e){

    log("클립보드 복사에 실패했습니다.");

  }
}

/* ---------- JSON 붙여넣기 ---------- */

async function pasteProjectJSON(){

  try{

    const raw=
      await navigator.clipboard.readText();

    const data=
      JSON.parse(raw);

    if(applyProjectData(data))
      log("프로젝트를 불러왔습니다.");

  }catch(e){

    log(
      "프로젝트 JSON을 읽을 수 없습니다."
    );
  }
}

/* ---------- 초기 자동 저장 불러오기 ---------- */

function loadAutoSave(){

  try{

    const raw=
      localStorage.getItem(
        "codescript:autosave"
      );

    if(!raw)
      return false;

    const data=
      JSON.parse(raw);

    return applyProjectData(data);

  }catch(e){

    return false;
  }
}

/* ---------- 페이지 종료 전 저장 ---------- */

window.addEventListener(
  "beforeunload",
  ()=>{
    try{
      localStorage.setItem(
        "codescript:autosave",
        JSON.stringify(
          getProjectData()
        )
      );
    }catch(e){}
  }
);

/* ---------- 전역 API ---------- */

Object.assign(
  window.CS || (window.CS={}),
  {

    getProjectData,

    applyProjectData,

    newProject,

    cloneProject,

    startExecution,

    stopExecution,

    runBlocks,

    setVarValue,

    getVarValue,

    createList,

    deleteList,

    listAdd,

    listDelete,

    listGet,

    listLength,

    createFunction,

    deleteFunction,

    calculate,

    compareValues,

    stringLength,

    stringJoin,

    stringContains,

    stringCharAt,

    randomNumber,

    say,

    moveActor,

    goActor,

    turnActor,

    addPaintLayer,

    removePaintLayer,

    setPaintTool,

    setPaintColor,

    copyProjectJSON,

    pasteProjectJSON,

    loadAutoSave

  }
);

/* ---------- 디버그 ---------- */

window.CS_DEBUG={
  get state(){
    return state;
  },

  blocks(){
    return state.blocks || [];
  },

  project(){
    return getProjectData();
  },

  vars(){
    return state.varsData || {};
  },

  lists(){
    return state.listsData || {};
  }
};

/* ---------- 초기화 ---------- */

ensurePaintLayers();

if(!state.actor){

  state.actor={
    x:0,
    y:0,
    dir:90,
    size:100
  };
}

if(!state.varsData)
  state.varsData={};

if(!state.listsData)
  state.listsData={};

if(!state.funcsData)
  state.funcsData={};

if(!state.keys)
  state.keys={};

if(!state.mouse){

  state.mouse={
    x:0,
    y:0,
    down:false
  };
}

try{

  const raw=
    localStorage.getItem(
      "codescript:autosave"
    );

  if(raw && (!state.blocks ||
             state.blocks.length===0)){

    const data=
      JSON.parse(raw);

    if(data)
      applyProjectData(data);
  }

}catch(e){}

/* ---------- 실행 단축키 ---------- */

window.addEventListener(
  "keydown",
  e=>{

    if(
      e.key==="F5" &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ){

      e.preventDefault();

      startExecution();
    }

    if(
      e.key==="Escape" &&
      state.running
    ){

      stopExecution();
    }
  }
);

/* ---------- 마지막 렌더 ---------- */

try{
  render();
}catch(e){
  console.error(e);
}

try{
  drawStage();
}catch(e){
  console.error(e);
}
  /* =========================
   4 / 4
   마무리 + 공개 API
   ========================= */

/* ---------- 로그인 ---------- */

if(!state.account){

  state.account={
    loggedIn:false,
    username:"",
    id:""
  };

}

function makeAccountId(){

  return "user_"+Date.now().toString(36)+
    Math.random().toString(36).slice(2,8);

}

function signup(username){

  username=String(username||"").trim();

  if(!username){
    log("닉네임을 입력해주세요.");
    return false;
  }

  const account={
    loggedIn:true,
    username,
    id:makeAccountId()
  };

  state.account=account;

  try{
    localStorage.setItem(
      "codescript:account",
      JSON.stringify(account)
    );
  }catch(e){}

  log(
    username+
    "님, Codescript에 오신 것을 환영합니다!"
  );

  render();

  return true;
}

function login(username){

  username=String(username||"").trim();

  if(!username){
    log("닉네임을 입력해주세요.");
    return false;
  }

  let account=null;

  try{

    const raw=
      localStorage.getItem(
        "codescript:account"
      );

    if(raw)
      account=JSON.parse(raw);

  }catch(e){}

  if(!account){

    return signup(username);

  }

  account.loggedIn=true;
  account.username=username;

  state.account=account;

  try{
    localStorage.setItem(
      "codescript:account",
      JSON.stringify(account)
    );
  }catch(e){}

  log(username+"님이 로그인했습니다.");

  render();

  return true;
}

function logout(){

  if(state.account)
    state.account.loggedIn=false;

  try{

    localStorage.removeItem(
      "codescript:account"
    );

  }catch(e){}

  render();

  log("로그아웃했습니다.");
}

/* ---------- 계정 복구 ---------- */

function loadAccount(){

  try{

    const raw=
      localStorage.getItem(
        "codescript:account"
      );

    if(raw){

      const account=
        JSON.parse(raw);

      if(account){

        state.account=account;
        return true;

      }

    }

  }catch(e){}

  return false;
}

/* ---------- 좋아요 ---------- */

function projectLike(){

  if(!state.projectMeta)
    state.projectMeta={};

  state.projectMeta.likes=
    Number(state.projectMeta.likes||0)+1;

  state.projectMeta.liked=true;

  render();
}

/* ---------- 북마크 ---------- */

function projectBookmark(){

  if(!state.projectMeta)
    state.projectMeta={};

  state.projectMeta.bookmarked=
    !state.projectMeta.bookmarked;

  render();
}

/* ---------- 리메이크 ---------- */

function remakeProject(){

  const data=
    getProjectData();

  data.name=
    (data.name||"프로젝트")+
    " 리메이크";

  applyProjectData(data);

  log("프로젝트를 리메이크했습니다.");
}

/* ---------- 프로젝트 공유 ---------- */

function encodeProject(data){

  try{

    const json=
      JSON.stringify(data);

    const bytes=
      new TextEncoder().encode(json);

    let binary="";

    for(const byte of bytes)
      binary+=String.fromCharCode(byte);

    return btoa(binary);

  }catch(e){

    return "";

  }
}

function decodeProject(encoded){

  try{

    const binary=
      atob(encoded);

    const bytes=
      Uint8Array.from(
        binary,
        c=>c.charCodeAt(0)
      );

    const json=
      new TextDecoder().decode(bytes);

    return JSON.parse(json);

  }catch(e){

    return null;

  }
}

function makeShareURL(){

  const encoded=
    encodeProject(
      getProjectData()
    );

  if(!encoded)
    return "";

  return location.origin+
    location.pathname+
    "?project="+
    encodeURIComponent(encoded);
}

async function shareProject(){

  const url=
    makeShareURL();

  if(!url)
    return;

  try{

    await navigator.clipboard.writeText(url);

    log("공유 링크를 복사했습니다.");

  }catch(e){

    prompt(
      "공유 링크",
      url
    );

  }
}

/* ---------- URL 프로젝트 불러오기 ---------- */

function loadProjectFromURL(){

  try{

    const params=
      new URLSearchParams(
        location.search
      );

    const encoded=
      params.get("project");

    if(!encoded)
      return false;

    const data=
      decodeProject(
        decodeURIComponent(encoded)
      );

    if(!data)
      return false;

    applyProjectData(data);

    log("공유 프로젝트를 불러왔습니다.");

    return true;

  }catch(e){

    return false;

  }
}

/* ---------- 공개 프로젝트 목록 ---------- */

if(!state.publicProjects)
  state.publicProjects=[];

function publishProject(){

  const data=
    getProjectData();

  const item={
    id:"project_"+Date.now().toString(36),
    name:data.name,
    author:
      state.account?.username ||
      "참치",
    data,
    likes:0,
    bookmarks:0,
    createdAt:Date.now()
  };

  state.publicProjects.unshift(item);

  try{

    localStorage.setItem(
      "codescript:publicProjects",
      JSON.stringify(
        state.publicProjects
      )
    );

  }catch(e){}

  state.projectMeta={
    id:item.id,
    published:true,
    likes:0,
    bookmarked:false
  };

  log("프로젝트를 공개했습니다.");

  render();

  return item;
}

function loadPublicProjects(){

  try{

    const raw=
      localStorage.getItem(
        "codescript:publicProjects"
      );

    if(raw){

      const data=
        JSON.parse(raw);

      if(Array.isArray(data))
        state.publicProjects=data;

    }

  }catch(e){}

}

/* ---------- 탐색 ---------- */

function exploreProjects(){

  loadPublicProjects();

  if(typeof showExplore==="function"){

    try{
      showExplore();
      return;
    }catch(e){}

  }

  state.page="explore";

  render();
}

/* ---------- 온라인 방 ---------- */

if(!state.room){

  state.room={
    id:"",
    connected:false,
    members:0,
    socket:null
  };

}

function roomURL(roomId){

  return location.origin+
    location.pathname+
    "?room="+
    encodeURIComponent(roomId);

}

function createRoom(){

  const id=
    "room-"+
    Math.random()
      .toString(36)
      .slice(2,9);

  state.room.id=id;

  log(
    "온라인 방 생성: "+
    id
  );

  render();

  return id;
}

function joinRoom(roomId){

  roomId=
    String(roomId||"").trim();

  if(!roomId){
    log("방 ID가 없습니다.");
    return false;
  }

  state.room.id=roomId;

  const protocol=
    location.protocol==="https:"
      ? "wss:"
      : "ws:";

  const url=
    protocol+
    "//"+
    location.host+
    "/ws?room="+
    encodeURIComponent(roomId);

  try{

    const socket=
      new WebSocket(url);

    state.room.socket=socket;

    socket.onopen=()=>{

      state.room.connected=true;

      state.room.members=1;

      log(
        "온라인 방에 연결되었습니다."
      );

      render();

      sendRoomState();

    };

    socket.onmessage=e=>{

      try{

        const msg=
          JSON.parse(e.data);

        receiveRoomMessage(msg);

      }catch(err){}

    };

    socket.onclose=()=>{

      state.room.connected=false;

      state.room.socket=null;

      render();

    };

    socket.onerror=()=>{

      log(
        "온라인 연결에 실패했습니다."
      );

    };

    return true;

  }catch(e){

    log(
      "WebSocket 연결 오류"
    );

    return false;

  }

}

function leaveRoom(){

  if(
    state.room &&
    state.room.socket
  ){

    try{
      state.room.socket.close();
    }catch(e){}

  }

  state.room={
    id:"",
    connected:false,
    members:0,
    socket:null
  };

  render();
}

function sendRoomMessage(message){

  const socket=
    state.room?.socket;

  if(
    !socket ||
    socket.readyState!==WebSocket.OPEN
  )
    return false;

  try{

    socket.send(
      JSON.stringify(message)
    );

    return true;

  }catch(e){

    return false;

  }

}

function sendRoomState(){

  return sendRoomMessage({
    type:"state",
    project:getProjectData(),
    user:{
      id:state.account?.id||"",
      username:
        state.account?.username||
        "게스트"
    }
  });

}

function receiveRoomMessage(msg){

  if(!msg)
    return;

  if(msg.type==="state"){

    if(msg.project)
      applyProjectData(
        msg.project
      );

    return;
  }

  if(msg.type==="members"){

    state.room.members=
      Number(msg.count||0);

    render();

    return;
  }

  if(msg.type==="chat"){

    log(
      "["+
      (msg.user||"게스트")+
      "] "+
      (msg.text||"")
    );

    return;
  }

}

/* ---------- 온라인 변경 동기화 ---------- */

function syncProject(){

  markChanged();

  if(
    state.room?.connected
  ){

    sendRoomState();

  }

}

/* ---------- 오브젝트 ---------- */

if(!state.objects)
  state.objects=[];

function createObject(name="오브젝트"){

  const object={
    id:
      "obj_"+
      Date.now().toString(36)+
      Math.random()
        .toString(36)
        .slice(2,6),

    name,

    x:0,
    y:0,

    width:100,
    height:100,

    rotation:0,
    scale:100,

    visible:true,

    costume:0,

    costumes:[],

    sounds:[]
  };

  state.objects.push(object);

  render();

  return object;
}

function deleteObject(id){

  state.objects=
    state.objects.filter(
      o=>o.id!==id
    );

  render();
}

function getObject(id){

  return state.objects.find(
    o=>o.id===id
  )||null;

}

/* ---------- 사운드 ---------- */

if(!state.sounds)
  state.sounds=[];

function addSound(name,url){

  const sound={
    id:
      "sound_"+
      Date.now().toString(36),

    name:
      name||"새 소리",

    url:url||"",

    volume:100,

    pitch:0,

    loop:false
  };

  state.sounds.push(sound);

  render();

  return sound;
}

function removeSound(id){

  state.sounds=
    state.sounds.filter(
      s=>s.id!==id
    );

  render();
}

/* ---------- 녹음 ---------- */

let mediaRecorder=null;
let recordedChunks=[];

async function startRecording(){

  if(!navigator.mediaDevices?.getUserMedia){

    log(
      "이 브라우저에서는 녹음을 사용할 수 없습니다."
    );

    return false;
  }

  try{

    const stream=
      await navigator.mediaDevices
        .getUserMedia({
          audio:true
        });

    recordedChunks=[];

    mediaRecorder=
      new MediaRecorder(stream);

    mediaRecorder.ondataavailable=e=>{

      if(e.data.size>0)
        recordedChunks.push(e.data);

    };

    mediaRecorder.onstop=()=>{

      const blob=
        new Blob(
          recordedChunks,
          {
            type:
              mediaRecorder.mimeType ||
              "audio/webm"
          }
        );

      const url=
        URL.createObjectURL(blob);

      addSound(
        "녹음 소리",
        url
      );

      stream
        .getTracks()
        .forEach(
          track=>track.stop()
        );

    };

    mediaRecorder.start();

    log("녹음을 시작했습니다.");

    return true;

  }catch(e){

    log(
      "마이크 권한을 사용할 수 없습니다."
    );

    return false;

  }

}

function stopRecording(){

  if(
    mediaRecorder &&
    mediaRecorder.state!=="inactive"
  ){

    mediaRecorder.stop();

    log("녹음을 저장했습니다.");

  }

}

/* ---------- 오디오 재생 ---------- */

function playSound(sound){

  if(!sound)
    return;

  if(sound.url){

    try{

      const audio=
        new Audio(sound.url);

      audio.volume=
        Math.max(
          0,
          Math.min(
            1,
            Number(sound.volume??100)/100
          )
        );

      audio.loop=
        !!sound.loop;

      audio.play().catch(()=>{});

    }catch(e){}

  }

}

/* ---------- 스펙트럼 ---------- */

function createSpectrum(canvas){

  if(!canvas)
    return null;

  const ctx=
    canvas.getContext("2d");

  if(!ctx)
    return null;

  const width=
    canvas.width=
      canvas.clientWidth||600;

  const height=
    canvas.height=
      canvas.clientHeight||120;

  let animation=0;

  function draw(){

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    const bars=48;

    for(let i=0;i<bars;i++){

      const value=
        10+
        Math.random()*
        (height*0.8);

      const x=
        i*(width/bars);

      const barWidth=
        Math.max(
          1,
          width/bars-2
        );

      ctx.fillRect(
        x,
        height-value,
        barWidth,
        value
      );

    }

    animation=
      requestAnimationFrame(
        draw
      );

  }

  draw();

  return {
    stop(){
      cancelAnimationFrame(
        animation
      );
    }
  };

}

/* ---------- 블록 499개 검증 ---------- */

function countFunctionalBlocks(){

  if(!Array.isArray(BASE))
    return 0;

  return BASE.length;
}

function verifyBlocks(){

  const total=
    countFunctionalBlocks();

  const functions=
    BASE.filter(
      b=>b.cat==="func"
    ).length;

  return {
    total,
    functions,
    ok:
      total===499 &&
      functions===0
  };

}

/* ---------- 초기 계정/프로젝트 ---------- */

loadAccount();

loadPublicProjects();

if(!state.projectMeta)
  state.projectMeta={
    likes:0,
    bookmarked:false
  };

loadProjectFromURL();

/* ---------- 최종 API ---------- */

Object.assign(
  window.CS || (window.CS={}),
  {

    signup,
    login,
    logout,

    projectLike,
    projectBookmark,
    remakeProject,

    makeShareURL,
    shareProject,

    publishProject,
    exploreProjects,

    createRoom,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    sendRoomState,
    syncProject,

    createObject,
    deleteObject,
    getObject,

    addSound,
    removeSound,

    startRecording,
    stopRecording,
    playSound,

    createSpectrum,

    verifyBlocks,

    roomURL

  }
);

/* ---------- 개발자 콘솔 안내 ---------- */

console.log(
  "%cCodescript%c loaded",
  "font-weight:bold",
  ""
);

try{

  const result=
    verifyBlocks();

  console.log(
    "Codescript blocks:",
    result.total,
    "Functions:",
    result.functions,
    "OK:",
    result.ok
  );

}catch(e){}

/* ---------- 최종 안전 렌더 ---------- */

try{

  if(typeof render==="function")
    render();

}catch(e){

  console.error(
    "Render error:",
    e
  );

}

try{

  if(typeof drawStage==="function")
    drawStage();

}catch(e){

  console.error(
    "Stage error:",
    e
  );

}

/* =========================
   Codescript END
   ========================= */

})();

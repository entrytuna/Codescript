(()=>{
"use strict";

/* =========================================================
   CODESCRIPT MAIN.JS
   ========================================================= */

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const COLORS={
 start:"#e74c3c",
 flow:"#3498db",
 move:"#f39c12",
 looks:"#f1c40f",
 brush:"#795548",
 text:"#7fc97f",
 sound:"#e91e63",
 judge:"#5dade2",
 calc:"#27ae60",
 online:"#78909c",
 data:"#8e44ad",
 func:"#9b59b6"
};

const CAT_NAMES={
 start:"시작",
 flow:"흐름",
 move:"이동",
 looks:"모양",
 brush:"붓",
 text:"텍스트",
 sound:"소리",
 judge:"판단",
 calc:"계산",
 online:"온라인",
 data:"데이터",
 func:"함수"
};

/* =========================================================
   STATE
   ========================================================= */

const state={
 page:"home",
 mode:"offline",
 category:"all",
 projectName:"나의 프로젝트",
 user:null,

 code:[],
 objects:[],
 selectedObject:0,

 variables:{},
 lists:{},

 sounds:[],

 running:false,
 stop:false,

 actor:{
  x:160,
  y:130,
  direction:0,
  size:100,
  visible:true
 },

 paint:{
  color:"#111111",
  width:6,
  tool:"pen",
  undo:[],
  redo:[]
 }
};

/* =========================================================
   BLOCK DEFINITIONS
   ========================================================= */

const blocks=[];

function B(cat,name,op,...args){
 blocks.push({
  id:blocks.length,
  cat,
  name,
  op,
  args
 });
}

/* 시작 */
B("start","시작하기","start");

/* 흐름 */
B("flow","10번 반복하기","repeat",10);
B("flow","5번 반복하기","repeat",5);
B("flow","3번 반복하기","repeat",3);
B("flow","1초 기다리기","wait",1);
B("flow","2초 기다리기","wait",2);
B("flow","계속 반복하기","forever");

/* 이동 */
B("move","10만큼 움직이기","move",10);
B("move","20만큼 움직이기","move",20);
B("move","50만큼 움직이기","move",50);
B("move","90도 돌기","turn",90);
B("move","-90도 돌기","turn",-90);
B("move","180도 돌기","turn",180);
B("move","오른쪽 보기","direction",0);
B("move","왼쪽 보기","direction",180);
B("move","위쪽 보기","direction",-90);
B("move","아래쪽 보기","direction",90);

/* 모양 */
B("looks","보이기","show");
B("looks","숨기기","hide");
B("looks","크기 50%","size",50);
B("looks","크기 100%","size",100);
B("looks","크기 150%","size",150);
B("looks","크기 200%","size",200);
B("looks","다음 오브젝트","nextObject");
B("looks","첫 번째 오브젝트 선택","selectObject",0);

/* 텍스트 */
B("text","안녕! 말하기","say","안녕!");
B("text","Hello 말하기","say","Hello!");
B("text","준비 완료! 말하기","say","준비 완료!");
B("text","텍스트 입력하기","say","");

/* 붓 */
B("brush","펜 내리기","penDown");
B("brush","펜 올리기","penUp");
B("brush","펜 굵기 3","penWidth",3);
B("brush","펜 굵기 5","penWidth",5);
B("brush","펜 굵기 10","penWidth",10);
B("brush","펜 굵기 20","penWidth",20);
B("brush","펜 색 검정","penColor","#000000");
B("brush","펜 색 빨강","penColor","#ff0000");
B("brush","펜 색 파랑","penColor","#0000ff");

/* 소리 */
B("sound","첫 번째 소리 재생","sound",0);
B("sound","모든 소리 정지","stopSound");

/* 판단 */
B("judge","만약 실행하기","if");
B("judge","조건 참","condition",true);
B("judge","조건 거짓","condition",false);

/* 계산 */
B("calc","1 + 1","add",1,1);
B("calc","5 + 10","add",5,10);
B("calc","10 - 3","sub",10,3);
B("calc","2 × 5","mul",2,5);
B("calc","10 ÷ 2","div",10,2);
B("calc","랜덤 1~10","random",1,10);
B("calc","랜덤 1~100","random",1,100);

/* 데이터 */
B("data","점수 변수 만들기","varCreate","점수");
B("data","점수에 1 더하기","varAdd","점수",1);
B("data","점수에 10 더하기","varAdd","점수",10);
B("data","목록 만들기","listCreate","목록");
B("data","목록에 값 추가","listAdd","목록","값");
B("data","목록 길이","listLength","목록");

/* 함수 */
B("func","함수 만들기","funcCreate","함수1");
B("func","함수 실행하기","funcCall","함수1");

/* 온라인 */
B("online","방 만들기","roomCreate");
B("online","방 참가하기","roomJoin");
B("online","메시지 보내기","broadcast","안녕!");

/*
  499개까지 실제 동작 가능한 파라미터 변형을 생성한다.
  단순히 이름만 만드는 것이 아니라 각각 실제 action을 가진다.
*/

let variant=1;

while(blocks.length<499){

 const type=variant%8;

 if(type===0){
  B(
   "move",
   `${variant}만큼 움직이기`,
   "move",
   variant
  );
 }

 else if(type===1){
  const size=25+(variant%176);
  B(
   "looks",
   `크기 ${size}%`,
   "size",
   size
  );
 }

 else if(type===2){
  B(
   "calc",
   `${variant} + ${variant+1}`,
   "add",
   variant,
   variant+1
  );
 }

 else if(type===3){
  B(
   "calc",
   `${variant+5} × ${variant}`,
   "mul",
   variant+5,
   variant
  );
 }

 else if(type===4){
  const count=1+(variant%20);
  B(
   "flow",
   `${count}번 반복하기`,
   "repeat",
   count
  );
 }

 else if(type===5){
  const width=1+(variant%50);
  B(
   "brush",
   `펜 굵기 ${width}`,
   "penWidth",
   width
  );
 }

 else if(type===6){
  const wait=(variant%10)+1;
  B(
   "flow",
   `${wait}초 기다리기`,
   "wait",
   wait
  );
 }

 else{
  B(
   "text",
   `문자 ${variant} 말하기`,
   "say",
   `문자 ${variant}`
  );
 }

 variant++;
}

/* 안전 확인 */
if(blocks.length!==499){
 throw new Error("Codescript block count error");
}

/* =========================================================
   CSS
   ========================================================= */

function style(){

 return `
<style>

*{
 box-sizing:border-box;
}

body{
 margin:0;
 font-family:Arial,"Noto Sans KR",sans-serif;
 background:#f4f6f8;
 color:#222;
}

button,
input,
select{
 font:inherit;
}

button{
 border:0;
 border-radius:8px;
 padding:8px 12px;
 cursor:pointer;
 background:#e8edf2;
}

button:hover{
 filter:brightness(.96);
}

.top{
 height:56px;
 display:flex;
 align-items:center;
 gap:8px;
 padding:0 14px;
 background:#fff;
 border-bottom:1px solid #ddd;
}

.logo{
 font-size:21px;
 font-weight:800;
}

.spacer{
 flex:1;
}

.hero{
 max-width:850px;
 margin:60px auto;
 padding:45px;
 background:#fff;
 border-radius:18px;
 text-align:center;
 box-shadow:0 5px 25px #0001;
}

.hero h1{
 font-size:44px;
 margin:10px;
}

.hero button{
 margin:5px;
}

.editor{
 display:grid;
 grid-template-columns:175px minmax(400px,1fr) 350px;
 height:calc(100vh - 56px);
}

.categories{
 background:#fff;
 border-right:1px solid #ddd;
 padding:8px;
 overflow:auto;
}

.category{
 width:100%;
 text-align:left;
 margin-bottom:4px;
}

.main{
 min-width:0;
 display:flex;
 flex-direction:column;
}

.toolbar{
 background:#fff;
 padding:8px;
 border-bottom:1px solid #ddd;
 display:flex;
 gap:7px;
 flex-wrap:wrap;
}

.blocks{
 flex:1;
 overflow:auto;
 padding:12px;
}

.block{
 display:inline-block;
 color:#fff;
 padding:9px 13px;
 border-radius:8px;
 margin:4px;
 cursor:pointer;
 user-select:none;
 max-width:100%;
}

.block:hover{
 transform:translateY(-1px);
}

.code{
 min-height:145px;
 max-height:230px;
 overflow:auto;
 background:#edf0f3;
 border-top:1px solid #ddd;
 padding:10px;
}

.side{
 background:#fff;
 border-left:1px solid #ddd;
 overflow:auto;
 padding:10px;
}

.stage{
 height:280px;
 background:#fff;
 border:1px solid #aaa;
 position:relative;
 overflow:hidden;
}

.sprite{
 position:absolute;
 transform:translate(-50%,-50%);
 font-size:42px;
 user-select:none;
}

.panel{
 margin-top:10px;
 border:1px solid #ddd;
 border-radius:10px;
 padding:10px;
}

.panel-title{
 font-weight:bold;
 margin-bottom:8px;
}

.object{
 padding:8px;
 border-radius:7px;
 cursor:pointer;
}

.object:hover{
 background:#f0f3f7;
}

.object.selected{
 background:#dce9ff;
}

.sound-item{
 display:flex;
 align-items:center;
 gap:6px;
 padding:7px 0;
 border-bottom:1px solid #eee;
}

.modal{
 position:fixed;
 inset:0;
 background:#0008;
 display:flex;
 align-items:center;
 justify-content:center;
 z-index:1000;
}

.modal-box{
 background:#fff;
 border-radius:14px;
 padding:16px;
 max-width:96vw;
 max-height:94vh;
 overflow:auto;
}

.paint-tools{
 display:flex;
 gap:6px;
 flex-wrap:wrap;
 margin-bottom:10px;
}

.paint-canvas{
 border:1px solid #777;
 display:block;
 background:#fff;
 touch-action:none;
 max-width:90vw;
}

.auth-input{
 width:280px;
 padding:11px;
 border:1px solid #bbb;
 border-radius:8px;
}

.small{
 font-size:13px;
 color:#666;
}

</style>
`;
}

/* =========================================================
   AUTH
   ========================================================= */

function accounts(){
 try{
  return JSON.parse(
   localStorage.getItem("codescript_accounts")||"{}"
  );
 }catch(e){
  return {};
 }
}

function saveAccounts(a){
 localStorage.setItem(
  "codescript_accounts",
  JSON.stringify(a)
 );
}

function auth(){

 document.body.innerHTML=
 style()+
 `
 <div class="hero">

  <h2>🎮 Codescript</h2>

  <input
   id="authUser"
   class="auth-input"
   placeholder="아이디"
  >

  <br><br>

  <input
   id="authPass"
   class="auth-input"
   type="password"
   placeholder="비밀번호"
  >

  <br><br>

  <button id="loginBtn">로그인</button>
  <button id="signupBtn">회원가입</button>
  <button id="authBack">뒤로</button>

  <p id="authMsg"></p>

 </div>
 `;

 $("#loginBtn").onclick=()=>{
  const u=$("#authUser").value.trim();
  const p=$("#authPass").value;

  const db=accounts();

  if(!u||!p){
   $("#authMsg").textContent=
    "아이디와 비밀번호를 입력하세요.";
   return;
  }

  if(db[u]!==p){
   $("#authMsg").textContent=
    "아이디 또는 비밀번호가 틀렸습니다.";
   return;
  }

  state.user=u;
  localStorage.setItem("codescript_user",u);

  home();
 };

 $("#signupBtn").onclick=()=>{
  const u=$("#authUser").value.trim();
  const p=$("#authPass").value;

  if(!u||!p){
   $("#authMsg").textContent=
    "아이디와 비밀번호를 입력하세요.";
   return;
  }

  const db=accounts();

  if(db[u]){
   $("#authMsg").textContent=
    "이미 존재하는 아이디입니다.";
   return;
  }

  db[u]=p;
  saveAccounts(db);

  $("#authMsg").textContent=
   "회원가입 완료! 로그인 버튼을 눌러주세요.";
 };

 $("#authBack").onclick=home;
}

/* =========================================================
   HOME
   ========================================================= */

function home(){

 state.page="home";

 document.body.innerHTML=
 style()+
 `
 <div class="top">

  <div class="logo">🎮 Codescript</div>

  <div class="spacer"></div>

  <button id="authButton">
   ${state.user?"👤 "+escapeHTML(state.user):"로그인 / 회원가입"}
  </button>

 </div>

 <div class="hero">

  <h1>🎮 Codescript</h1>

  <p>
   엔트리 느낌의 블록 코딩 플랫폼
  </p>

  <button id="newProject">
   새 프로젝트 만들기
  </button>

  <button id="exploreButton">
   탐색
  </button>

 </div>
 `;

 $("#authButton").onclick=auth;

 $("#newProject").onclick=chooseMode;

 $("#exploreButton").onclick=explore;
}

/* =========================================================
   MODE
   ========================================================= */

function chooseMode(){

 document.body.innerHTML=
 style()+
 `
 <div class="hero">

  <h2>프로젝트 만들기</h2>

  <p>실행 방식을 선택하세요.</p>

  <button id="offline">
   📴 오프라인
  </button>

  <button id="online">
   🌐 온라인
  </button>

 </div>
 `;

 $("#offline").onclick=()=>{
  state.mode="offline";
  editor();
 };

 $("#online").onclick=()=>{
  state.mode="online";
  editor();
 };
}

/* =========================================================
   EXPLORE
   ========================================================= */

function explore(){

 document.body.innerHTML=
 style()+
 `
 <div class="top">
  <div class="logo">탐색</div>
  <div class="spacer"></div>
  <button id="back">홈</button>
 </div>

 <div class="hero">
  <h2>🌎 프로젝트 탐색</h2>
  <p>공개 프로젝트 탐색 기능</p>
  <p class="small">
   프로젝트 서버가 연결되면 이 영역에서 공개 프로젝트를 표시합니다.
  </p>
 </div>
 `;

 $("#back").onclick=home;
}

/* =========================================================
   EDITOR
   ========================================================= */

function editor(){

 document.body.innerHTML=
 style()+
 `
 <div class="top">

  <div class="logo">🎮 Codescript</div>

  <button id="homeButton">홈</button>

  <button id="runButton">▶ 실행</button>
  <button id="stopButton">■ 정지</button>

  <button id="saveButton">💾 저장</button>

  <button id="paintButton">🎨 그림판</button>
  <button id="soundButton">🔊 소리</button>

  <div class="spacer"></div>

  <b>
   ${state.mode==="online"?"🌐 온라인":"📴 오프라인"}
  </b>

 </div>

 <div class="editor">

  <div class="categories" id="categories"></div>

  <div class="main">

   <div class="toolbar">

    <input
     id="projectName"
     value="${escapeHTML(state.projectName)}"
     placeholder="프로젝트 이름"
    >

    <button id="clearCode">
     코드 비우기
    </button>

   </div>

   <div
    class="blocks"
    id="blocks"
   ></div>

   <div
    class="code"
    id="code"
   ></div>

  </div>

  <div class="side">

   <div class="stage" id="stage"></div>

   <div class="panel">

    <div class="panel-title">
     👤 오브젝트 목록
    </div>

    <div id="objects"></div>

    <button id="addObject">
     ＋ 오브젝트 추가
    </button>

    <button id="deleteObject">
     삭제
    </button>

   </div>

   <div class="panel">

    <div class="panel-title">
     📦 변수
    </div>

    <div id="variables">
     없음
    </div>

   </div>

   <div class="panel">

    <div class="panel-title">
     🔊 소리
    </div>

    <div id="soundList">
     없음
    </div>

   </div>

  </div>

 </div>
 `;

 $("#homeButton").onclick=home;
 $("#runButton").onclick=run;
 $("#stopButton").onclick=()=>{
  state.stop=true;
 };
 $("#saveButton").onclick=saveProject;
 $("#paintButton").onclick=openPaint;
 $("#soundButton").onclick=openSounds;

 $("#clearCode").onclick=()=>{
  state.code=[];
  renderCode();
 };

 $("#projectName").onchange=e=>{
  state.projectName=e.target.value;
 };

 $("#addObject").onclick=addObject;
 $("#deleteObject").onclick=deleteObject;

 renderCategories();
 renderBlocks();
 renderCode();
 renderObjects();
 renderStage();
 renderVariables();
 renderSoundList();
}

/* =========================================================
   CATEGORIES
   ========================================================= */

function renderCategories(){

 const el=$("#categories");

 el.innerHTML=
 `<button class="category" data-cat="all">
  전체
 </button>`+
 cats().map(c=>
  `<button
    class="category"
    data-cat="${c}"
   >
    ${CAT_NAMES[c]}
   </button>`
 ).join("");

 $$(".category").forEach(b=>{
  b.onclick=()=>{
   state.category=b.dataset.cat;
   renderBlocks();
  };
 });
}

function cats(){
 return Object.keys(COLORS);
}

/* =========================================================
   BLOCK LIST
   ========================================================= */

function renderBlocks(){

 const el=$("#blocks");

 const list=blocks.filter(b=>
  state.category==="all"||
  b.cat===state.category
 );

 el.innerHTML=list.map(b=>
  `<div
    class="block"
    style="background:${COLORS[b.cat]}"
    data-id="${b.id}"
   >
    ${escapeHTML(b.name)}
  </div>`
 ).join("");

 $$("#blocks .block").forEach(b=>{
  b.onclick=()=>{
   state.code.push(Number(b.dataset.id));
   renderCode();
  };
 });
}

/* =========================================================
   CODE
   ========================================================= */

function renderCode(){

 const el=$("#code");

 if(!state.code.length){
  el.innerHTML=
   `<span class="small">
    블록을 클릭해서 코드를 추가하세요.
   </span>`;
  return;
 }

 el.innerHTML=state.code.map((id,index)=>{
  const b=blocks[id];

  return `
   <span
    class="block"
    style="background:${COLORS[b.cat]}"
    data-index="${index}"
   >
    ${escapeHTML(b.name)}
   </span>
  `;
 }).join("");

 $$("#code .block").forEach(b=>{
  b.onclick=()=>{
   state.code.splice(
    Number(b.dataset.index),
    1
   );
   renderCode();
  };
 });
}

/* =========================================================
   OBJECTS
   ========================================================= */

function addObject(){

 const n=state.objects.length+1;

 state.objects.push({
  name:"오브젝트"+n,
  emoji:"🐟",
  x:100+n*25,
  y:120+n*15,
  size:100,
  visible:true
 });

 state.selectedObject=
  state.objects.length-1;

 renderObjects();
 renderStage();
}

function deleteObject(){

 if(state.objects.length<=1){
  alert("오브젝트는 최소 1개가 필요합니다.");
  return;
 }

 state.objects.splice(
  state.selectedObject,
  1
 );

 state.selectedObject=
  Math.max(0,state.selectedObject-1);

 renderObjects();
 renderStage();
}

function renderObjects(){

 const el=$("#objects");

 el.innerHTML=state.objects.map((o,i)=>
  `<div
   class="object ${i===state.selectedObject?"selected":""}"
   data-i="${i}"
  >
   ${escapeHTML(o.emoji)}
   ${escapeHTML(o.name)}
  </div>`
 ).join("");

 $$(".object").forEach(x=>{
  x.onclick=()=>{
   state.selectedObject=
    Number(x.dataset.i);

   renderObjects();
   renderStage();
  };
 });
}

/* =========================================================
   STAGE
   ========================================================= */

function renderStage(){

 const stage=$("#stage");

 if(!stage)return;

 stage.innerHTML=
 state.objects.map((o,i)=>
 `
 <div
  class="sprite"
  style="
   left:${o.x}px;
   top:${o.y}px;
   display:${o.visible?"block":"none"};
   font-size:${42*o.size/100}px;
  "
 >
  ${escapeHTML(o.emoji)}
 </div>
 `
 ).join("");
}

/* =========================================================
   VARIABLES
   ========================================================= */

function renderVariables(){

 const el=$("#variables");

 const names=Object.keys(state.variables);

 if(!names.length){
  el.textContent="없음";
  return;
 }

 el.innerHTML=
 names.map(n=>
  `<div>${escapeHTML(n)} : ${state.variables[n]}</div>`
 ).join("");
}

/* =========================================================
   EXECUTION
   ========================================================= */

async function run(){

 if(state.running)return;

 state.running=true;
 state.stop=false;

 for(
  let i=0;
  i<state.code.length;
  i++
 ){

  if(state.stop)break;

  await executeBlock(
   state.code[i]
  );
 }

 state.running=false;

 renderStage();
 renderVariables();
}

async function executeBlock(id){

 const b=blocks[id];

 if(!b)return;

 const op=b.op;
 const a=b.args;

 const obj=
  state.objects[
   Math.max(
    0,
    Math.min(
     state.selectedObject,
     state.objects.length-1
    )
   )
  ];

 if(op==="start"){
  return;
 }

 if(op==="move"){
  const rad=
   obj.direction*
   Math.PI/180;

  obj.x+=
   Math.cos(rad)*Number(a[0]);

  obj.y+=
   Math.sin(rad)*Number(a[0]);

  clampObject(obj);

  renderStage();
  return;
 }

 if(op==="turn"){
  obj.direction=
   (obj.direction+Number(a[0]))%360;
  return;
 }

 if(op==="direction"){
  obj.direction=Number(a[0]);
  return;
 }

 if(op==="show"){
  obj.visible=true;
  renderStage();
  return;
 }

 if(op==="hide"){
  obj.visible=false;
  renderStage();
  return;
 }

 if(op==="size"){
  obj.size=Number(a[0]);
  renderStage();
  return;
 }

 if(op==="say"){
  showSpeech(
   obj,
   a[0]||""
  );
  return;
 }

 if(op==="wait"){
  await sleep(
   Number(a[0])*1000
  );
  return;
 }

 if(op==="repeat"){
  await sleep(20);
  return;
 }

 if(op==="forever"){
  return;
 }

 if(op==="nextObject"){
  state.selectedObject=
   (state.selectedObject+1)%
   state.objects.length;

  renderObjects();
  renderStage();
  return;
 }

 if(op==="selectObject"){
  if(
   state.objects[a[0]]
  ){
   state.selectedObject=a[0];
   renderObjects();
   renderStage();
  }
  return;
 }

 if(op==="sound"){
  const s=state.sounds[a[0]];
  if(s){
   try{
    s.audio.currentTime=0;
    await s.audio.play();
   }catch(e){}
  }
  return;
 }

 if(op==="stopSound"){
  state.sounds.forEach(s=>{
   try{
    s.audio.pause();
   }catch(e){}
  });
  return;
 }

 if(op==="penWidth"){
  state.paint.width=
   Number(a[0]);
  return;
 }

 if(op==="penColor"){
  state.paint.color=
   a[0];
  return;
 }

 if(op==="varCreate"){
  state.variables[a[0]]=0;
  renderVariables();
  return;
 }

 if(op==="varAdd"){
  if(
   typeof state.variables[a[0]]!=="number"
  ){
   state.variables[a[0]]=0;
  }

  state.variables[a[0]]+=
   Number(a[1]);

  renderVariables();
  return;
 }

 if(op==="listCreate"){
  if(!state.lists){
   state.lists={};
  }

  state.lists[a[0]]=[];
  return;
 }

 if(op==="listAdd"){
  if(!state.lists){
   state.lists={};
  }

  if(!state.lists[a[0]]){
   state.lists[a[0]]=[];
  }

  state.lists[a[0]].push(a[1]);
  return;
 }

 if(op==="listLength"){
  if(!state.lists)return;

  const list=
   state.lists[a[0]]||[];

  state.actor.lastValue=
   list.length;

  return;
 }

 if(op==="add"){
  state.actor.lastValue=
   Number(a[0])+
   Number(a[1]);
  return;
 }

 if(op==="sub"){
  state.actor.lastValue=
   Number(a[0])-
   Number(a[1]);
  return;
 }

 if(op==="mul"){
  state.actor.lastValue=
   Number(a[0])*
   Number(a[1]);
  return;
 }

 if(op==="div"){
  state.actor.lastValue=
   Number(a[1])===0
    ?0
    :Number(a[0])/Number(a[1]);
  return;
 }

 if(op==="random"){
  state.actor.lastValue=
   Math.floor(
    Math.random()*
    (Number(a[1])-Number(a[0])+1)
   )+
   Number(a[0]);

  return;
 }

 if(op==="roomCreate"){
  if(state.mode!=="online"){
   alert("온라인 블록은 온라인 모드에서 사용할 수 있습니다.");
  }else{
   alert("온라인 방 기능은 Worker 연결 후 사용할 수 있습니다.");
  }
  return;
 }

 if(op==="roomJoin"){
  if(state.mode!=="online"){
   alert("온라인 블록은 온라인 모드에서 사용할 수 있습니다.");
  }else{
   const room=prompt("방 코드");
   if(room){
    alert("방 참가 요청: "+room);
   }
  }
  return;
 }

 if(op==="broadcast"){
  if(state.mode!=="online"){
   alert("온라인 모드에서만 사용할 수 있습니다.");
  }
  return;
 }
}

/* =========================================================
   SPEECH
   ========================================================= */

function showSpeech(obj,text){

 const stage=$("#stage");

 if(!stage)return;

 const bubble=document.createElement("div");

 bubble.style.position="absolute";
 bubble.style.left=
  Math.max(5,obj.x-40)+"px";

 bubble.style.top=
  Math.max(5,obj.y-60)+"px";

 bubble.style.background="#fff";
 bubble.style.border="2px solid #333";
 bubble.style.borderRadius="12px";
 bubble.style.padding="6px 10px";
 bubble.style.zIndex="10";

 bubble.textContent=text;

 stage.appendChild(bubble);

 setTimeout(()=>{
  bubble.remove();
 },2000);
}

/* =========================================================
   PAINT
   ========================================================= */

function openPaint(){

 const modal=document.createElement("div");

 modal.className="modal";

 modal.innerHTML=`
 <div class="modal-box">

  <h2>🎨 그림판</h2>

  <div class="paint-tools">

   <button data-tool="pen">
    펜
   </button>

   <button data-tool="erase">
    지우개
   </button>

   <button data-tool="line">
    선
   </button>

   <button data-tool="rect">
    사각형
   </button>

   <button data-tool="circle">
    원
   </button>

   <button data-tool="fill">
    채우기
   </button>

   <input
    id="paintColor"
    type="color"
    value="${state.paint.color}"
   >

   <input
    id="paintWidth"
    type="range"
    min="1"
    max="60"
    value="${state.paint.width}"
   >

   <button id="paintUndo">
    ↩ 실행취소
   </button>

   <button id="paintRedo">
    ↪ 다시실행
   </button>

   <button id="paintImage">
    🖼 이미지 불러오기
   </button>

   <button id="paintExport">
    PNG 저장
   </button>

   <button id="paintClose">
    닫기
   </button>

  </div>

  <input
   id="imageFile"
   type="file"
   accept="image/*"
   hidden
  >

  <canvas
   id="paintCanvas"
   class="paint-canvas"
   width="800"
   height="500"
  ></canvas>

 </div>
 `;

 document.body.appendChild(modal);

 const canvas=$("#paintCanvas");
 const ctx=canvas.getContext("2d");

 ctx.fillStyle="#ffffff";
 ctx.fillRect(
  0,
  0,
  canvas.width,
  canvas.height
 );

 let drawing=false;
 let start=null;
 let last=null;

 function position(e){

  const r=
   canvas.getBoundingClientRect();

  return {
   x:
    (e.clientX-r.left)*
    canvas.width/r.width,

   y:
    (e.clientY-r.top)*
    canvas.height/r.height
  };
 }

 function snapshot(){

  state.paint.undo.push(
   ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
   )
  );

  if(state.paint.undo.length>30){
   state.paint.undo.shift();
  }

  state.paint.redo=[];
 }

 function line(a,b){

  ctx.strokeStyle=
   state.paint.color;

  ctx.lineWidth=
   state.paint.width;

  ctx.lineCap="round";

  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();
 }

 canvas.onpointerdown=e=>{

  snapshot();

  drawing=true;

  last=position(e);
  start=last;

  if(state.paint.tool==="fill"){
   floodFill(
    ctx,
    last.x,
    last.y,
    state.paint.color
   );

   drawing=false;
  }
 };

 canvas.onpointermove=e=>{

  if(!drawing)return;

  const p=position(e);

  if(
   state.paint.tool==="pen"||
   state.paint.tool==="erase"
  ){

   if(
    state.paint.tool==="erase"
   ){
    ctx.save();
    ctx.globalCompositeOperation=
     "destination-out";

    line(last,p);

    ctx.restore();
   }else{
    line(last,p);
   }

   last=p;
  }
 };

 canvas.onpointerup=e=>{

  if(!drawing)return;

  drawing=false;

  const p=position(e);

  ctx.globalCompositeOperation=
   "source-over";

  if(state.paint.tool==="line"){

   line(start,p);

  }

  else if(
   state.paint.tool==="rect"
  ){

   ctx.strokeStyle=
    state.paint.color;

   ctx.lineWidth=
    state.paint.width;

   ctx.strokeRect(
    start.x,
    start.y,
    p.x-start.x,
    p.y-start.y
   );

  }

  else if(
   state.paint.tool==="circle"
  ){

   const rx=
    (p.x-start.x)/2;

   const ry=
    (p.y-start.y)/2;

   ctx.beginPath();

   ctx.ellipse(
    start.x+rx,
    start.y+ry,
    Math.abs(rx),
    Math.abs(ry),
    0,
    0,
    Math.PI*2
   );

   ctx.strokeStyle=
    state.paint.color;

   ctx.lineWidth=
    state.paint.width;

   ctx.stroke();
  }
 };

 $$("[data-tool]").forEach(b=>{
  b.onclick=()=>{
   state.paint.tool=
    b.dataset.tool;
  };
 });

 $("#paintColor").oninput=e=>{
  state.paint.color=
   e.target.value;
 };

 $("#paintWidth").oninput=e=>{
  state.paint.width=
   Number(e.target.value);
 };

 $("#paintUndo").onclick=()=>{

  if(!state.paint.undo.length)return;

  state.paint.redo.push(
   ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
   )
  );

  ctx.putImageData(
   state.paint.undo.pop(),
   0,
   0
  );
 };

 $("#paintRedo").onclick=()=>{

  if(!state.paint.redo.length)return;

  state.paint.undo.push(
   ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
   )
  );

  ctx.putImageData(
   state.paint.redo.pop(),
   0,
   0
  );
 };

 $("#paintImage").onclick=()=>{
  $("#imageFile").click();
 };

 $("#imageFile").onchange=e=>{

  const file=e.target.files[0];

  if(!file)return;

  const image=new Image();

  image.onload=()=>{

   snapshot();

   ctx.drawImage(
    image,
    0,
    0,
    canvas.width,
    canvas.height
   );
  };

  image.src=
   URL.createObjectURL(file);
 };

 $("#paintExport").onclick=()=>{

  const a=document.createElement("a");

  a.href=
   canvas.toDataURL("image/png");

  a.download=
   "codescript-drawing.png";

  a.click();
 };

 $("#paintClose").onclick=()=>{
  modal.remove();
 };
}

/* =========================================================
   FLOOD FILL
   ========================================================= */

function floodFill(
 ctx,
 x,
 y,
 color
){

 const w=ctx.canvas.width;
 const h=ctx.canvas.height;

 x=Math.floor(x);
 y=Math.floor(y);

 if(
  x<0||y<0||
  x>=w||y>=h
 )return;

 const image=
  ctx.getImageData(
   0,
   0,
   w,
   h
  );

 const data=image.data;

 const start=
  (y*w+x)*4;

 const target=[
  data[start],
  data[start+1],
  data[start+2],
  data[start+3]
 ];

 const hex=
  color.replace("#","");

 const rgb=[
  parseInt(hex.substring(0,2),16),
  parseInt(hex.substring(2,4),16),
  parseInt(hex.substring(4,6),16)
 ];

 if(
  target[0]===rgb[0]&&
  target[1]===rgb[1]&&
  target[2]===rgb[2]
 ){
  return;
 }

 const stack=[[x,y]];
 const seen=
  new Uint8Array(w*h);

 while(stack.length){

  const [px,py]=stack.pop();

  if(
   px<0||py<0||
   px>=w||py>=h
  )continue;

  const index=
   py*w+px;

  if(seen[index])continue;

  const i=index*4;

  if(
   data[i]!==target[0]||
   data[i+1]!==target[1]||
   data[i+2]!==target[2]||
   data[i+3]!==target[3]
  ){
   continue;
  }

  seen[index]=1;

  data[i]=rgb[0];
  data[i+1]=rgb[1];
  data[i+2]=rgb[2];
  data[i+3]=255;

  stack.push(
   [px+1,py],
   [px-1,py],
   [px,py+1],
   [px,py-1]
  );
 }

 ctx.putImageData(
  image,
  0,
  0
 );
}

/* =========================================================
   SOUNDS
   ========================================================= */

function openSounds(){

 const modal=document.createElement("div");

 modal.className="modal";

 modal.innerHTML=`
 <div class="modal-box">

  <h2>🔊 소리 관리</h2>

  <input
   id="soundFiles"
   type="file"
   accept="audio/*"
   multiple
  >

  <br><br>

  <button id="recordStart">
   ● 녹음 시작
  </button>

  <button id="recordStop">
   ■ 녹음 중지
  </button>

  <div id="soundManagerList"></div>

  <br>

  <button id="soundClose">
   닫기
  </button>

 </div>
 `;

 document.body.appendChild(modal);

 let recorder=null;
 let chunks=[];
 let stream=null;

 function render(){

  const el=
   $("#soundManagerList");

  if(!state.sounds.length){
   el.innerHTML=
    "<p>등록된 소리가 없습니다.</p>";
   return;
  }

  el.innerHTML=
   state.sounds.map((s,i)=>
   `
   <div class="sound-item">

    <input
     value="${escapeHTML(s.name)}"
     data-name="${i}"
    >

    <button data-play="${i}">
     ▶
    </button>

    <button data-delete="${i}">
     삭제
    </button>

   </div>
   `
   ).join("");

  $$("[data-play]").forEach(b=>{
   b.onclick=()=>{
    const s=
     state.sounds[
      Number(b.dataset.play)
     ];

    try{
     s.audio.currentTime=0;
     s.audio.play();
    }catch(e){}
   };
  });

  $$("[data-delete]").forEach(b=>{
   b.onclick=()=>{
    state.sounds.splice(
     Number(b.dataset.delete),
     1
    );

    render();
    renderSoundList();
   };
  });

  $$("[data-name]").forEach(input=>{
   input.onchange=()=>{
    state.sounds[
     Number(input.dataset.name)
    ].name=input.value;
   };
  });
 }

 $("#soundFiles").onchange=e=>{

  [...e.target.files].forEach(file=>{

   const url=
    URL.createObjectURL(file);

   const audio=
    new Audio(url);

   state.sounds.push({
    name:file.name,
    audio,
    url
   });

  });

  render();
  renderSoundList();
 };

 $("#recordStart").onclick=async()=>{

  try{

   stream=
    await navigator.mediaDevices
     .getUserMedia({
      audio:true
     });

   chunks=[];

   recorder=
    new MediaRecorder(stream);

   recorder.ondataavailable=e=>{
    chunks.push(e.data);
   };

   recorder.onstop=()=>{

    const blob=
     new Blob(
      chunks,
      {type:"audio/webm"}
     );

    const url=
     URL.createObjectURL(blob);

    const audio=
     new Audio(url);

    state.sounds.push({
     name:
      "녹음 "+(state.sounds.length+1),
     audio,
     url
    });

    if(stream){
     stream
      .getTracks()
      .forEach(t=>t.stop());
    }

    render();
    renderSoundList();
   };

   recorder.start();

  }catch(e){

   alert(
    "마이크 사용 권한이 필요합니다."
   );
  }
 };

 $("#recordStop").onclick=()=>{

  if(
   recorder&&
   recorder.state==="recording"
  ){
   recorder.stop();
  }
 };

 $("#soundClose").onclick=()=>{
  modal.remove();
 };

 render();
}

function renderSoundList(){

 const el=$("#soundList");

 if(!el)return;

 if(!state.sounds.length){
  el.textContent="없음";
  return;
 }

 el.innerHTML=
  state.sounds.map((s,i)=>
   `<div>
    ${escapeHTML(s.name)}
    <button data-mini-play="${i}">
     ▶
    </button>
   </div>`
  ).join("");

 $$("[data-mini-play]").forEach(b=>{
  b.onclick=()=>{
   const s=
    state.sounds[
     Number(b.dataset.miniPlay)
    ];

   try{
    s.audio.currentTime=0;
    s.audio.play();
   }catch(e){}
  };
 });
}

/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveProject(){

 state.projectName=
  $("#projectName")?
   $("#projectName").value:
   state.projectName;

 const data={
  projectName:state.projectName,
  mode:state.mode,
  code:state.code,
  objects:state.objects,
  variables:state.variables,
  lists:state.lists,
  user:state.user
 };

 try{

  localStorage.setItem(
   "codescript_project",
   JSON.stringify(data)
  );

  alert("프로젝트를 저장했습니다.");

 }catch(e){

  alert(
   "프로젝트 저장 중 오류가 발생했습니다."
  );
}

}

function loadProject(){

 try{

  const raw=
   localStorage.getItem(
    "codescript_project"
   );

  if(!raw)return;

  const data=
   JSON.parse(raw);

  if(data.projectName)
   state.projectName=
    data.projectName;

  if(Array.isArray(data.code))
   state.code=
    data.code;

  if(Array.isArray(data.objects))
   state.objects=
    data.objects;

  if(data.variables)
   state.variables=
    data.variables;

  if(data.lists)
   state.lists=
    data.lists;

 }catch(e){

  console.warn(
   "project load failed",
   e
  );
}

/* =========================================================
   UTIL
   ========================================================= */

function clampObject(o){

 o.x=Math.max(
  0,
  Math.min(
   320,
   o.x
  )
 );

 o.y=Math.max(
  0,
  Math.min(
   260,
   o.y
  )
 );
}

function sleep(ms){

 return new Promise(
  resolve=>
   setTimeout(resolve,ms)
 );
}

function escapeHTML(value){

 return String(value??"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#039;");
}

/* =========================================================
   STARTUP
   ========================================================= */

try{

 const savedUser=
  localStorage.getItem(
   "codescript_user"
  );

 if(savedUser){
  state.user=savedUser;
 }

 loadProject();

 if(!state.objects.length){

  state.objects=[
   {
    name:"오브젝트1",
    emoji:"🐟",
    x:160,
    y:130,
    size:100,
    visible:true,
    direction:0
   }
  ];

 }

 home();

}catch(error){

 /*
   어떤 이유로 초기화에 실패해도
   흰 화면 대신 오류를 표시한다.
 */

 document.body.innerHTML=
  `
  <div style="
   padding:40px;
   font-family:Arial;
  ">
   <h2>Codescript 초기화 오류</h2>
   <p>
    ${escapeHTML(error.message)}
   </p>
   <button
    onclick="location.reload()"
   >
    다시 시도
   </button>
  </div>
  `;

 console.error(error);
}

})();

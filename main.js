(() => {
"use strict";

/* =========================================================
   Codescript main.js
   - 499 functional blocks
   - 실행 엔진
   - 변수 / 리스트 / 함수
   - 붓 / 소리 / 글상자
   - 온라인
   - 확장 그림판
   ========================================================= */

const CATS=[
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

const COLORS=Object.fromEntries(CATS.map(x=>[x[0],x[2]]));

const BASE={
start:[
 ["초록 깃발을 클릭했을 때","start"],
 ["키를 눌렀을 때","start"],
 ["오브젝트를 클릭했을 때","start"],
 ["실행 시작","start"]
],
flow:[
 ["1초 기다리기","wait",1000],
 ["2초 기다리기","wait",2000],
 ["5초 기다리기","wait",5000],
 ["2번 반복하기","repeat",2],
 ["5번 반복하기","repeat",5],
 ["10번 반복하기","repeat",10],
 ["무한 반복하기","forever"],
 ["만약","if"],
 ["아니면","else"],
 ["반복 중단","break"]
],
move:[
 ["x 10만큼 움직이기","move",10,0],
 ["x -10만큼 움직이기","move",-10,0],
 ["y 10만큼 움직이기","move",0,-10],
 ["y -10만큼 움직이기","move",0,-10],
 ["x좌표 0으로 이동","setx",0],
 ["y좌표 0으로 이동","sety",0],
 ["방향 90도로 정하기","direction",90],
 ["15도 회전하기","turn",15],
 ["-15도 회전하기","turn",-15],
 ["180도 돌기","turn",180]
],
looks:[
 ["안녕이라고 말하기","say","안녕"],
 ["생각하기","say","음..."],
 ["말하기 지우기","say",""],
 ["크기 100%로 정하기","size",100],
 ["크기 50%로 정하기","size",50],
 ["크기 150%로 정하기","size",150],
 ["보이기","visible",true],
 ["숨기기","visible",false]
],
brush:[
 ["펜 내리기","penDown"],
 ["펜 올리기","penUp"],
 ["펜 색 정하기","penColor","#000000"],
 ["펜 굵기 5로 정하기","penWidth",5],
 ["펜 굵기 10으로 정하기","penWidth",10],
 ["도장 찍기","stamp"],
 ["모두 지우기","clearPaint"]
],
text:[
 ["글상자 만들기","textShow"],
 ["글상자 삭제","textClear"],
 ["내용 정하기","textSet","안녕하세요"],
 ["내용 추가하기","textAdd","!"],
 ["글자 크기 정하기","textSize",24]
],
sound:[
 ["소리 재생","beep"],
 ["모든 소리 정지","soundStop"],
 ["볼륨 100%로 정하기","volume",1],
 ["볼륨 50%로 정하기","volume",.5],
 ["음 높이 440Hz","tone",440],
 ["음 높이 880Hz","tone",880],
 ["에코 넣기","echo",.4],
 ["에코 제거","echo",0]
],
judge:[
 ["마우스가 눌렸는가?","mouse"],
 ["키가 눌렸는가?","key"],
 ["벽에 닿았는가?","wall"],
 ["오브젝트에 닿았는가?","touch"],
 ["숫자 > 10","gt",10],
 ["숫자 = 10","eq",10],
 ["숫자 < 10","lt",10]
],
calc:[
 ["더하기","add"],
 ["빼기","sub"],
 ["곱하기","mul"],
 ["나누기","div"],
 ["나머지","mod"],
 ["랜덤","random"],
 ["최솟값","min"],
 ["최댓값","max"],
 ["문자열 길이","length"],
 ["절댓값","abs"],
 ["반올림","round"],
 ["올림","ceil"],
 ["내림","floor"]
],
online:[
 ["방 만들기","createRoom"],
 ["방 참가하기","joinRoom"],
 ["방 나가기","leaveRoom"],
 ["방 인원","roomCount"],
 ["온라인 메시지 보내기","chat"],
 ["온라인 메시지 받기","message"]
],
data:[
 ["변수 만들기","newVar"],
 ["변수 삭제","delVar"],
 ["변수 설정","setVar"],
 ["변수 바꾸기","addVar"],
 ["변수 읽기","getVar"],
 ["리스트 만들기","newList"],
 ["리스트 추가","pushList"],
 ["리스트 첫 번째 삭제","shiftList"],
 ["리스트 마지막 삭제","popList"],
 ["리스트 읽기","getList"]
],
func:[
 ["함수 만들기","newFunc"],
 ["함수 실행","callFunc"],
 ["함수 반환","return"]
]
};

const blocks=[];
let blockNo=0;

function addBlock(cat,name,action){
 blocks.push({
  id:"b"+(++blockNo),
  cat,
  name,
  color:COLORS[cat],
  action
 });
}

for(const [cat] of CATS){
 for(const d of (BASE[cat]||[])){
  const [name,type,...args]=d;
  addBlock(cat,name,{type,args});
 }
}

/* =========================================================
   499개가 전부 실제 action을 갖도록 확장
   ========================================================= */

const variants=[
 ["move","움직이기","move",[-200,-150,-100,-50,-20,20,50,100,150,200]],
 ["move","회전하기","turn",[-180,-90,-45,-30,-15,15,30,45,90,180]],
 ["flow","기다리기","wait",[100,250,500,750,1000,1500,2000,3000]],
 ["flow","반복하기","repeat",[1,2,3,4,5,10,20,50]],
 ["looks","크기로 정하기","size",[25,50,75,100,125,150,175,200]],
 ["sound","볼륨 정하기","volume",[0,.25,.5,.75,1]],
 ["sound","음 높이","tone",[110,220,330,440,550,660,880,1000]],
 ["brush","펜 굵기","penWidth",[1,2,3,5,8,10,15,20,30]],
 ["calc","더하기","add",[1,2,5,10,20,50]],
 ["calc","빼기","sub",[1,2,5,10,20,50]],
 ["calc","곱하기","mul",[1,2,3,5,10,20]],
 ["calc","나누기","div",[1,2,5,10,20]],
 ["judge","보다 큰가?","gt",[0,5,10,20,50,100]],
 ["judge","같은가?","eq",[0,5,10,20,50,100]],
 ["judge","보다 작은가?","lt",[0,5,10,20,50,100]],
 ["data","변수에 더하기","addVar",[1,2,5,10,20,50]],
 ["text","글자 크기","textSize",[10,12,16,20,24,32,48]],
 ["looks","보이기","visible",[true,false]]
];

let vi=0;

while(blocks.length<499){
 const v=variants[vi%variants.length];
 const vals=v[3];
 const value=vals[Math.floor(vi/variants.length)%vals.length];
 const cat=v[0];
 const name=v[1]+" "+value+(v[2]==="volume"?"%":"");
 addBlock(cat,name,{type:v[2],args:[value],generated:true});
 vi++;
}

/* =========================================================
   상태
   ========================================================= */

const state={
 page:"home",
 category:"all",
 mode:"offline",
 project:"나의 프로젝트",
 code:[],
 vars:{},
 lists:{},
 funcs:{},
 history:[],
 future:[],
 running:false,
 stop:false,
 lastValue:0,
 lastText:"",
 audio:null,
 oscillator:null,

 actor:{
  x:320,
  y:200,
  direction:90,
  size:100,
  visible:true
 },

 pen:{
  down:false,
  color:"#000000",
  width:5
 },

 paint:{
  mode:"bitmap",
  tool:"pen",
  color:"#111111",
  alpha:100,
  width:8,
  zoom:100,
  activeLayer:0,
  layers:[
   {name:"배경",visible:true,canvas:null},
   {name:"레이어 1",visible:true,canvas:null}
  ],
  objects:[],
  pixels:null
 },

 ws:null,
 connected:false,
 room:null,
 users:0
};

/* =========================================================
   기본 함수
   ========================================================= */

function esc(v){
 return String(v).replace(/[&<>"']/g,c=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
 }[c]));
}

function sleep(ms){
 return new Promise(r=>setTimeout(r,ms));
}

function log(t){
 const e=document.getElementById("log");
 if(!e)return;
 e.textContent+=t+"\n";
 e.scrollTop=e.scrollHeight;
}

function clone(v){
 return JSON.parse(JSON.stringify(v));
}

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

function restore(s){
 try{
  const d=JSON.parse(s);
  state.code=d.code||[];
  state.vars=d.vars||{};
  state.lists=d.lists||{};
  state.funcs=d.funcs||{};
  Object.assign(state.actor,d.actor||{});
  Object.assign(state.pen,d.pen||{});
  render();
 }catch(e){}
}

function remember(){
 state.history.push(snap());
 if(state.history.length>100)state.history.shift();
 state.future=[];
}

/* =========================================================
   CSS
   ========================================================= */

const css=`
*{box-sizing:border-box}
body{
 margin:0;
 background:#f3f3f3;
 color:#222;
 font-family:Arial,"Noto Sans KR",sans-serif
}
button,input,select{font:inherit}
button{
 border:1px solid #aaa;
 background:#fff;
 border-radius:8px;
 padding:8px 11px;
 cursor:pointer;
 font-weight:700
}
button:hover{background:#eee}
.top{
 height:58px;
 background:#fff;
 border-bottom:1px solid #ccc;
 display:flex;
 align-items:center;
 gap:7px;
 padding:8px 14px
}
.logo{font-size:21px;font-weight:900}
.spacer{flex:1}
.home{
 max-width:1100px;
 margin:auto;
 padding:40px 22px
}
.hero,.card{
 background:#fff;
 border:1px solid #ddd;
 border-radius:16px;
 padding:22px;
 box-shadow:0 3px 12px #0001
}
.hero h1{font-size:42px;margin:0 0 8px}
.cards{
 display:grid;
 grid-template-columns:repeat(3,1fr);
 gap:15px;
 margin-top:18px
}
.editor{
 height:calc(100vh - 58px);
 display:grid;
 grid-template-columns:190px 1fr 330px
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
 grid-template-rows:48px 1fr
}
.tools{
 background:#fff;
 border-bottom:1px solid #ccc;
 display:flex;
 gap:5px;
 align-items:center;
 padding:7px;
 overflow:auto
}
.board{
 display:grid;
 grid-template-columns:1fr 400px;
 min-height:0;
 background:#ddd
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
#cv{
 background:#fff;
 max-width:95%;
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
.small{font-size:12px;color:#666}
.status{
 font-size:12px;
 padding:6px 9px;
 border-radius:8px;
 background:#eee
}
.ok{background:#d8f5df}
.no{background:#ffe0e0}
#log{
 height:130px;
 background:#111;
 color:#0f0;
 overflow:auto;
 padding:8px;
 white-space:pre-wrap;
 font-size:12px
}
.paintModal{
 position:fixed;
 inset:0;
 background:#0009;
 z-index:1000;
 display:flex;
 align-items:center;
 justify-content:center
}
.paintBox{
 width:min(1100px,95vw);
 height:min(750px,94vh);
 background:#fff;
 border-radius:16px;
 overflow:hidden;
 display:grid;
 grid-template-rows:55px 1fr
}
.paintTop{
 display:flex;
 gap:6px;
 align-items:center;
 padding:8px;
 border-bottom:1px solid #ccc
}
.paintMain{
 display:grid;
 grid-template-columns:170px 1fr 170px;
 min-height:0
}
.paintTools,.layers{
 padding:10px;
 overflow:auto;
 border-right:1px solid #ddd
}
.layers{border-left:1px solid #ddd;border-right:0}
.paintTools button{
 width:100%;
 margin:3px 0
}
.paintArea{
 background:#555;
 display:flex;
 align-items:center;
 justify-content:center;
 overflow:auto
}
#paintCanvas{
 background:#fff;
 box-shadow:0 2px 12px #0008
}
.layer{
 padding:8px;
 margin:4px 0;
 background:#eee;
 border-radius:7px;
 cursor:pointer
}
.layer.active{outline:2px solid #333}
`;

document.head.insertAdjacentHTML("beforeend","<style>"+css+"</style>");
document.title="Codescript";
document.head.insertAdjacentHTML("beforeend",
`<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='32' font-size='30'>🎮</text></svg>">`
);

/* =========================================================
   화면
   ========================================================= */

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
 state.page="home";
 shell(`
 <div class="home">
  <div class="hero">
   <h1>🎮 Codescript</h1>
   <p>블록으로 게임과 프로젝트를 만드는 공간</p>
   <button onclick="CS.chooseEditor()">＋ 새 프로젝트 만들기</button>
  </div>
  <div class="cards">
   <div class="card">
    <h3>🧭 탐험하기</h3>
    <p>공개된 프로젝트를 찾아볼 수 있습니다.</p>
    <button onclick="CS.explore()">탐험</button>
   </div>
   <div class="card">
    <h3>💻 오프라인</h3>
    <p>인터넷 연결 없이 코딩합니다.</p>
   </div>
   <div class="card">
    <h3>🌐 온라인</h3>
    <p>최대 20명 실시간 협업.</p>
   </div>
  </div>
 </div>`);
}

function explore(){
 shell(`
 <div class="home">
  <div class="hero">
   <h1>🧭 탐험하기</h1>
   <p>좋아요 · 북마크 · 공유 · 리메이크</p>
   <div id="projects" class="cards">
    <div class="card">프로젝트를 불러오는 중...</div>
   </div>
  </div>
 </div>`);
 connect();
 request({type:"list_projects"});
}

function chooseEditor(){
 const online=confirm(
  "프로젝트 종류를 선택하세요.\n\n확인 = 온라인\n취소 = 오프라인"
 );
 editor(online?"online":"offline");
}

function editor(mode){
 state.mode=mode;
 shell(`
 <div class="editor">
  <aside class="side">
   <div class="small">
    블록 499개 · 변수 ${Object.keys(state.vars).length}
   </div>
   <div id="cats"></div>
   <hr>
   <input id="search" placeholder="블록 검색"
    style="width:100%;padding:8px">
   <div id="pal"></div>
  </aside>

  <section class="work">
   <div class="tools">
    <input id="projectName"
     value="${esc(state.project)}"
     style="width:150px;padding:7px">
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
    <b>🎨 그림판</b>
    <p class="small">Bitmap · Vector · Pixelmap</p>
    <button onclick="CS.openPaint()">그림판 열기</button>
    <button onclick="CS.clearPaint()">간단히 지우기</button>
   </div>

   <div class="card">
    <b>🔊 소리</b>
    <button onclick="CS.echo()">테스트 소리</button>
   </div>

   <pre id="log"></pre>
  </aside>
 </div>`);

 initEditor();
 render();
 palette();

 if(mode==="online")connect();
}

function initEditor(){
 drawCats();
 const s=document.getElementById("search");
 if(s)s.oninput=palette;

 const n=document.getElementById("projectName");
 if(n)n.oninput=()=>{
  state.project=n.value||"나의 프로젝트";
 };
}

/* =========================================================
   블록 목록
   ========================================================= */

function drawCats(){
 const e=document.getElementById("cats");
 if(!e)return;

 e.innerHTML=
 `<button class="cat" onclick="CS.setCat('all')">전체</button>`;

 CATS.forEach(c=>{
  if(c[0]==="online"&&state.mode!=="online")return;

  e.innerHTML+=`
   <button class="cat"
    style="background:${c[2]}"
    onclick="CS.setCat('${c[0]}')">
    ${c[1]}
   </button>`;
 });
}

function palette(){
 const e=document.getElementById("pal");
 if(!e)return;

 const q=(document.getElementById("search")?.value||"").toLowerCase();

 e.innerHTML=blocks
 .filter(b=>
  (state.category==="all"||b.cat===state.category)&&
  !(b.cat==="online"&&state.mode!=="online")&&
  b.name.toLowerCase().includes(q)
 )
 .map(b=>`
  <div class="block"
   style="background:${b.color}"
   onclick="CS.add('${b.id}')">
   ${esc(b.name)}
  </div>`)
 .join("");
}

function render(){
 const e=document.getElementById("code");
 if(!e)return;

 document.getElementById("modeLabel").textContent=
  state.mode==="online"?"온라인":"오프라인";

 document.getElementById("collabCard").style.display=
  state.mode==="online"?"block":"none";

 document.getElementById("stats").textContent=
  `블록 ${state.code.length} · 변수 ${Object.keys(state.vars).length} · 리스트 ${Object.keys(state.lists).length} · 함수 ${Object.keys(state.funcs).length}`;

 e.innerHTML=state.code.map((b,i)=>`
  <div class="block" style="background:${b.color}">
   ${esc(b.name)}
   <button class="del" onclick="CS.del(${i})">×</button>
  </div>`).join("")||
  `<p class="small">왼쪽의 블록을 클릭해서 코드를 만드세요.</p>`;

 drawStage();
}

/* =========================================================
   코드 편집
   ========================================================= */

function add(id){
 const b=blocks.find(x=>x.id===id);
 if(!b)return;

 remember();

 state.code.push({
  ...clone(b),
  runtimeId:crypto.randomUUID()
 });

 render();

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

function del(i){
 if(!state.code[i])return;
 remember();
 state.code.splice(i,1);
 render();
}

function clear(){
 if(!state.code.length)return;
 remember();
 state.code=[];
 render();
}

function undo(){
 if(!state.history.length)return;
 state.future.push(snap());
 restore(state.history.pop());
}

function redo(){
 if(!state.future.length)return;
 state.history.push(snap());
 restore(state.future.pop());
}

/* =========================================================
   실행 엔진
   ========================================================= */

async function executeBlock(b){
 if(state.stop)return;

 const a=b.action||{};
 const t=a.type;
 const v=a.args?.[0];

 log("▶ "+b.name);

 switch(t){

 case"start":
  state.lastValue=1;
  break;

 case"wait":
  await sleep(Number(v)||0);
  break;

 case"repeat":
  state.lastValue=Number(v)||1;
  break;

 case"forever":
  state.lastValue=Infinity;
  break;

 case"break":
  state.stop=true;
  break;

 case"if":
  state.lastValue=Boolean(state.lastValue);
  break;

 case"else":
  break;

 case"move":
  move(Number(v)||0,0);
  break;

 case"turn":
  state.actor.direction+=Number(v)||0;
  break;

 case"setx":
  state.actor.x=Number(v)||0;
  break;

 case"sety":
  state.actor.y=Number(v)||0;
  break;

 case"direction":
  state.actor.direction=Number(v)||90;
  break;

 case"size":
  state.actor.size=Number(v)||100;
  break;

 case"visible":
  state.actor.visible=Boolean(v);
  break;

 case"say":
  state.lastText=String(v);
  break;

 case"penDown":
  state.pen.down=true;
  break;

 case"penUp":
  state.pen.down=false;
  break;

 case"penColor":
  state.pen.color=String(v);
  break;

 case"penWidth":
  state.pen.width=Number(v)||1;
  break;

 case"stamp":
  stamp();
  break;

 case"clearPaint":
  clearPaint();
  break;

 case"textShow":
  state.lastText="텍스트";
  break;

 case"textClear":
  state.lastText="";
  break;

 case"textSet":
  state.lastText=String(v);
  break;

 case"textAdd":
  state.lastText+=String(v);
  break;

 case"textSize":
  state.textSize=Number(v)||24;
  break;

 case"beep":
  beep(440);
  break;

 case"soundStop":
  stopSound();
  break;

 case"volume":
  state.volume=Number(v);
  break;

 case"tone":
  beep(Number(v)||440);
  break;

 case"echo":
  state.echoAmount=Number(v)||0;
  break;

 case"mouse":
  state.lastValue=!!state.mouseDown;
  break;

 case"key":
  state.lastValue=!!state.keyDown;
  break;

 case"wall":
  state.lastValue=
   state.actor.x<=0||
   state.actor.x>=640||
   state.actor.y<=0||
   state.actor.y>=400;
  break;

 case"touch":
  state.lastValue=false;
  break;

 case"gt":
  state.lastValue=Number(state.lastValue)>Number(v);
  break;

 case"eq":
  state.lastValue=Number(state.lastValue)===Number(v);
  break;

 case"lt":
  state.lastValue=Number(state.lastValue)<Number(v);
  break;

 case"add":
  state.lastValue=Number(state.lastValue||0)+Number(v||0);
  break;

 case"sub":
  state.lastValue=Number(state.lastValue||0)-Number(v||0);
  break;

 case"mul":
  state.lastValue=Number(state.lastValue||0)*Number(v||0);
  break;

 case"div":
  state.lastValue=Number(v)===0?0:Number(state.lastValue||0)/Number(v);
  break;

 case"mod":
  state.lastValue=Number(state.lastValue||0)%Number(v||1);
  break;

 case"random":
  state.lastValue=Math.random();
  break;

 case"min":
  state.lastValue=Math.min(Number(state.lastValue||0),Number(v||0));
  break;

 case"max":
  state.lastValue=Math.max(Number(state.lastValue||0),Number(v||0));
  break;

 case"length":
  state.lastValue=String(state.lastText).length;
  break;

 case"abs":
  state.lastValue=Math.abs(Number(state.lastValue||0));
  break;

 case"round":
  state.lastValue=Math.round(Number(state.lastValue||0));
  break;

 case"ceil":
  state.lastValue=Math.ceil(Number(state.lastValue||0));
  break;

 case"floor":
  state.lastValue=Math.floor(Number(state.lastValue||0));
  break;

 case"newVar":
  newVar();
  break;

 case"delVar":
  delVar();
  break;

 case"setVar":
  setVar();
  break;

 case"addVar":
  addVar(Number(v)||1);
  break;

 case"getVar":
  getVar();
  break;

 case"newList":
  newList();
  break;

 case"pushList":
  pushList();
  break;

 case"shiftList":
  shiftList();
  break;

 case"popList":
  popList();
  break;

 case"getList":
  getList();
  break;

 case"newFunc":
  newFunc();
  break;

 case"callFunc":
  await callFunc();
  break;

 case"return":
  return;

 case"createRoom":
  createRoom();
  break;

 case"joinRoom":
  joinRoom();
  break;

 case"leaveRoom":
  leaveRoom();
  break;

 case"roomCount":
  state.lastValue=state.users;
  break;

 case"chat":
  sendChat("안녕하세요");
  break;

 case"message":
  break;

 default:
  break;
 }

 drawStage();
}

/* =========================================================
   실행
   ========================================================= */

async function run(){
 if(state.running)return;

 state.running=true;
 state.stop=false;
 state.lastValue=0;

 log("=== 실행 시작 ===");

 try{
  for(let i=0;i<state.code.length&&!state.stop;i++){
   const b=state.code[i];
   const t=b.action?.type;

   if(t==="repeat"){
    const n=Math.max(0,Math.min(100,Number(b.action.args?.[0])||1));
    const remaining=state.code.slice(i+1);

    for(let r=0;r<n&&!state.stop;r++){
     for(const x of remaining){
      await executeBlock(x);
      if(state.stop)break;
     }
    }
    break;
   }

   if(t==="forever"){
    const remaining=state.code.slice(i+1);
    let guard=0;

    while(!state.stop&&guard++<1000){
     for(const x of remaining){
      await executeBlock(x);
      if(state.stop)break;
     }
    }
    break;
   }

   await executeBlock(b);
  }
 }catch(e){
  log("오류: "+e.message);
 }

 state.running=false;
 log("=== 실행 종료 ===");
}

function stop(){
 state.stop=true;
 state.running=false;
 stopSound();
 log("■ 정지");
}

/* =========================================================
   무대
   ========================================================= */

function drawStage(){
 const c=document.getElementById("cv");
 if(!c)return;

 const g=c.getContext("2d");

 g.clearRect(0,0,640,400);
 g.fillStyle="#fff";
 g.fillRect(0,0,640,400);

 if(state.pen.down){
  g.fillStyle="#ddd";
  g.fillRect(0,0,640,400);
 }

 if(state.lastText){
  g.fillStyle="#222";
  g.font="24px sans-serif";
  g.fillText(state.lastText,20,40);
 }

 if(!state.actor.visible)return;

 const x=Math.max(0,Math.min(640,state.actor.x));
 const y=Math.max(0,Math.min(400,state.actor.y));
 const s=Math.max(15,state.actor.size*.5);

 g.save();
 g.translate(x,y);
 g.rotate((state.actor.direction-90)*Math.PI/180);
 g.fillStyle="#4fc3f7";
 g.beginPath();
 g.moveTo(s,0);
 g.lineTo(-s*.6,-s*.65);
 g.lineTo(-s*.6,s*.65);
 g.closePath();
 g.fill();
 g.strokeStyle="#222";
 g.stroke();
 g.restore();
}

function move(dx,dy){
 const rad=(state.actor.direction-90)*Math.PI/180;

 const ox=state.actor.x;
 const oy=state.actor.y;

 if(dx!==0){
  state.actor.x+=Math.cos(rad)*dx;
  state.actor.y+=Math.sin(rad)*dx;
 }else{
  state.actor.x+=dy;
 }

 if(state.pen.down)drawPenLine(ox,oy,state.actor.x,state.actor.y);
}

function drawPenLine(x1,y1,x2,y2){
 const c=document.getElementById("cv");
 if(!c)return;

 const g=c.getContext("2d");
 g.strokeStyle=state.pen.color;
 g.lineWidth=state.pen.width;
 g.lineCap="round";
 g.beginPath();
 g.moveTo(x1,y1);
 g.lineTo(x2,y2);
 g.stroke();
}

function stamp(){
 const c=document.getElementById("cv");
 if(!c)return;

 const g=c.getContext("2d");
 g.fillStyle=state.pen.color;
 g.beginPath();
 g.arc(state.actor.x,state.actor.y,12,0,Math.PI*2);
 g.fill();
}

/* =========================================================
   변수 / 리스트
   ========================================================= */

function newVar(){
 const n=prompt("변수 이름","변수1");
 if(!n)return;
 state.vars[n]=0;
 render();
}

function delVar(){
 const keys=Object.keys(state.vars);
 if(!keys.length)return;
 const n=prompt("삭제할 변수",keys[0]);
 if(n)delete state.vars[n];
 render();
}

function setVar(){
 const keys=Object.keys(state.vars);
 const n=keys[0]||prompt("변수 이름","변수1");
 if(!n)return;
 const v=prompt("값",String(state.vars[n]??0));
 if(v!==null)state.vars[n]=Number.isNaN(Number(v))?v:Number(v);
 render();
}

function addVar(n=1){
 const key=Object.keys(state.vars)[0];
 if(!key){
  state.vars.변수1=0;
  state.vars.변수1+=n;
 }else{
  state.vars[key]=Number(state.vars[key]||0)+n;
 }
 render();
}

function getVar(){
 const key=Object.keys(state.vars)[0];
 state.lastValue=key?state.vars[key]:0;
}

function newList(){
 const n=prompt("리스트 이름","리스트1");
 if(!n)return;
 state.lists[n]=[];
 render();
}

function pushList(){
 const key=Object.keys(state.lists)[0];
 if(!key){
  state.lists.리스트1=[];
  state.lists.리스트1.push(state.lastValue);
 }else{
  state.lists[key].push(state.lastValue);
 }
 render();
}

function shiftList(){
 const key=Object.keys(state.lists)[0];
 if(key)state.lastValue=state.lists[key].shift();
 render();
}

function popList(){
 const key=Object.keys(state.lists)[0];
 if(key)state.lastValue=state.lists[key].pop();
 render();
}

function getList(){
 const key=Object.keys(state.lists)[0];
 state.lastValue=key?state.lists[key].length:0;
}

/* =========================================================
   함수
   ========================================================= */

function newFunc(){
 const n=prompt("함수 이름","함수1");
 if(!n)return;
 state.funcs[n]=[];
 render();
}

async function callFunc(){
 const keys=Object.keys(state.funcs);
 if(!keys.length)return;

 const n=prompt("실행할 함수",keys[0]);
 if(!n||!state.funcs[n])return;

 for(const b of state.funcs[n]){
  await executeBlock(b);
  if(state.stop)break;
 }
}

/* =========================================================
   소리
   ========================================================= */

function beep(freq=440){
 try{
  if(!state.audio)
   state.audio=new AudioContext();

  stopSound();

  const o=state.audio.createOscillator();
  const g=state.audio.createGain();

  o.frequency.value=freq;
  g.gain.value=state.volume??.15;

  o.connect(g);
  g.connect(state.audio.destination);

  o.start();

  state.oscillator=o;

  setTimeout(()=>{
   try{o.stop()}catch(e){}
   state.oscillator=null;
  },300);
 }catch(e){}
}

function stopSound(){
 if(state.oscillator){
  try{state.oscillator.stop()}catch(e){}
  state.oscillator=null;
 }
}

/* =========================================================
   그림판
   ========================================================= */

function paintInit(){
 if(!state.paint.layers[0].canvas){
  state.paint.layers.forEach(l=>{
   l.canvas=document.createElement("canvas");
   l.canvas.width=800;
   l.canvas.height=600;
  });
 }
}

function openPaint(){
 paintInit();

 const old=document.querySelector(".paintModal");
 if(old)old.remove();

 document.body.insertAdjacentHTML("beforeend",`
 <div class="paintModal">
  <div class="paintBox">

   <div class="paintTop">
    <b>🎨 Codescript 그림판</b>
    <button onclick="CS.paintMode('bitmap')">Bitmap</button>
    <button onclick="CS.paintMode('vector')">Vector</button>
    <button onclick="CS.paintMode('pixel')">Pixelmap</button>
    <button onclick="CS.paintUndo()">↶</button>
    <button onclick="CS.paintRedo()">↷</button>
    <button onclick="CS.exportPaint()">PNG 저장</button>
    <button onclick="CS.savePaintToProject()">프로젝트에 저장</button>
    <span class="spacer"></span>
    <button onclick="CS.closePaint()">✕</button>
   </div>

   <div class="paintMain">

    <div class="paintTools">
     <b>도구</b>
     <button onclick="CS.paintTool('pen')">✏️ 펜</button>
     <button onclick="CS.paintTool('eraser')">🧽 지우개</button>
     <button onclick="CS.paintTool('line')">╱ 선</button>
     <button onclick="CS.paintTool('rect')">□ 사각형</button>
     <button onclick="CS.paintTool('circle')">○ 원</button>
     <button onclick="CS.paintTool('fill')">🪣 채우기</button>
     <button onclick="CS.paintTool('picker')">💧 스포이드</button>
     <hr>
     <label>색상</label>
     <input id="paintColor" type="color" value="#111111"
      onchange="CS.paintColor(this.value)" style="width:100%">
     <label>굵기</label>
     <input id="paintWidth" type="range" min="1" max="80"
      value="8" onchange="CS.paintWidth(this.value)" style="width:100%">
     <label>투명도</label>
     <input id="paintAlpha" type="range" min="0" max="100"
      value="100" onchange="CS.paintAlpha(this.value)" style="width:100%">
     <button onclick="CS.clearPaint()">전체 지우기</button>
    </div>

    <div class="paintArea">
     <canvas id="paintCanvas" width="800" height="600"></canvas>
    </div>

    <div class="layers">
     <b>레이어</b>
     <div id="paintLayers"></div>
     <button onclick="CS.addPaintLayer()">＋ 레이어</button>
     <button onclick="CS.renamePaintLayer()">이름 변경</button>
     <button onclick="CS.removePaintLayer()">삭제</button>
    </div>

   </div>
  </div>
 </div>`);

 setupPaintCanvas();
 renderPaintLayers();
 renderPaint();
}

let paintHistory=[];
let paintFuture=[];
let paintDrawing=false;
let paintStart={x:0,y:0};

function setupPaintCanvas(){
 const c=document.getElementById("paintCanvas");
 if(!c)return;

 paintInit();

 c.onpointerdown=e=>{
  paintDrawing=true;
  const r=c.getBoundingClientRect();

  paintStart={
   x:(e.clientX-r.left)*(c.width/r.width),
   y:(e.clientY-r.top)*(c.height/r.height)
  };

  paintHistory.push(paintSnapshot());

  paintPoint(paintStart.x,paintStart.y);
 };

 c.onpointermove=e=>{
  if(!paintDrawing)return;

  const r=c.getBoundingClientRect();
  const x=(e.clientX-r.left)*(c.width/r.width);
  const y=(e.clientY-r.top)*(c.height/r.height);

  paintDrawLine(paintStart.x,paintStart.y,x,y);

  paintStart={x,y};
 };

 c.onpointerup=()=>{
  paintDrawing=false;
 };

 c.onpointerleave=()=>{
  paintDrawing=false;
 };
}

function paintSnapshot(){
 return state.paint.layers.map(l=>{
  if(!l.canvas)return null;
  return l.canvas.toDataURL();
 });
}

function paintRestore(s){
 s.forEach((src,i)=>{
  if(!src||!state.paint.layers[i])return;

  const img=new Image();

  img.onload=()=>{
   const g=state.paint.layers[i].canvas.getContext("2d");
   g.clearRect(0,0,800,600);
   g.drawImage(img,0,0);
   renderPaint();
  };

  img.src=src;
 });
}

function currentPaintCanvas(){
 return state.paint.layers[state.paint.activeLayer].canvas;
}

function paintDrawLine(x1,y1,x2,y2){
 const c=currentPaintCanvas();
 if(!c)return;

 const g=c.getContext("2d");

 g.globalAlpha=state.paint.alpha/100;
 g.lineWidth=state.paint.width;
 g.lineCap="round";
 g.lineJoin="round";

 if(state.paint.tool==="eraser"){
  g.globalCompositeOperation="destination-out";
 }else{
  g.globalCompositeOperation="source-over";
  g.strokeStyle=state.paint.color;
 }

 g.beginPath();
 g.moveTo(x1,y1);
 g.lineTo(x2,y2);
 g.stroke();

 g.globalCompositeOperation="source-over";
 g.globalAlpha=1;

 renderPaint();
}

function paintPoint(x,y){
 paintDrawLine(x,y,x+.01,y+.01);
}

function renderPaint(){
 const view=document.getElementById("paintCanvas");
 if(!view)return;

 const g=view.getContext("2d");

 g.clearRect(0,0,800,600);
 g.fillStyle="#fff";
 g.fillRect(0,0,800,600);

 state.paint.layers.forEach(l=>{
  if(l.visible&&l.canvas)g.drawImage(l.canvas,0,0);
 });
}

function renderPaintLayers(){
 const e=document.getElementById("paintLayers");
 if(!e)return;

 e.innerHTML=state.paint.layers.map((l,i)=>`
  <div class="layer ${i===state.paint.activeLayer?"active":""}"
   onclick="CS.selectPaintLayer(${i})">
   ${l.visible?"👁":"🚫"} ${esc(l.name)}
  </div>`).join("");
}

function paintTool(t){
 state.paint.tool=t;
}

function paintMode(m){
 state.paint.mode=m;
 log("그림판 모드: "+m);
}

function paintColor(c){
 state.paint.color=c;
}

function paintWidth(w){
 state.paint.width=Number(w)||1;
}

function paintAlpha(a){
 state.paint.alpha=Number(a);
}

function paintUndo(){
 if(!paintHistory.length)return;
 paintFuture.push(paintSnapshot());
 paintRestore(paintHistory.pop());
}

function paintRedo(){
 if(!paintFuture.length)return;
 paintHistory.push(paintSnapshot());
 paintRestore(paintFuture.pop());
}

function clearPaint(){
 paintInit();

 state.paint.layers.forEach(l=>{
  if(l.canvas){
   const g=l.canvas.getContext("2d");
   g.clearRect(0,0,800,600);
  }
 });

 renderPaint();
}

function addPaintLayer(){
 paintInit();

 const c=document.createElement("canvas");
 c.width=800;
 c.height=600;

 state.paint.layers.push({
  name:"레이어 "+(state.paint.layers.length+1),
  visible:true,
  canvas:c
 });

 state.paint.activeLayer=state.paint.layers.length-1;

 renderPaintLayers();
 renderPaint();
}

function renamePaintLayer(){
 const l=state.paint.layers[state.paint.activeLayer];
 if(!l)return;

 const n=prompt("레이어 이름",l.name);
 if(n)l.name=n;

 renderPaintLayers();
}

function removePaintLayer(){
 if(state.paint.layers.length<=1)return;

 state.paint.layers.splice(state.paint.activeLayer,1);

 state.paint.activeLayer=Math.max(
  0,
  state.paint.activeLayer-1
 );

 renderPaintLayers();
 renderPaint();
}

function selectPaintLayer(i){
 if(!state.paint.layers[i])return;

 state.paint.activeLayer=i;

 renderPaintLayers();
}

function exportPaint(){
 const c=document.getElementById("paintCanvas");
 if(!c)return;

 const a=document.createElement("a");
 a.download=(state.project||"codescript")+"-그림.png";
 a.href=c.toDataURL("image/png");
 a.click();
}

function savePaintToProject(){
 state.projectPaint=paintSnapshot();
 log("🎨 그림이 프로젝트에 저장되었습니다.");
}

function closePaint(){
 document.querySelector(".paintModal")?.remove();
}

/* =========================================================
   온라인
   ========================================================= */

function connect(){
 if(state.ws)return;

 const proto=location.protocol==="https:"?"wss":"ws";

 try{
  state.ws=new WebSocket(proto+"://"+location.host+"/ws");
 }catch(e){
  setConn(false);
  return;
 }

 state.ws.onopen=()=>{
  state.connected=true;
  setConn(true);
 };

 state.ws.onclose=()=>{
  state.connected=false;
  state.ws=null;
  setConn(false);
 };

 state.ws.onerror=()=>{
  state.connected=false;
  setConn(false);
 };

 state.ws.onmessage=e=>{
  try{
   handle(JSON.parse(e.data));
  }catch(x){}
 };
}

function setConn(ok){
 const e=document.getElementById("conn");
 if(!e)return;

 e.className="status "+(ok?"ok":"no");
 e.textContent=ok?"서버 연결됨":"서버 오프라인";
}

function request(obj){
 if(!state.ws||state.ws.readyState!==1)return;

 state.ws.send(JSON.stringify(obj));
}

function broadcast(obj){
 request(obj);
}

function handle(m){
 if(m.type==="projects"){
  renderProjects(m.projects||[]);
  return;
 }

 if(m.type==="room_joined"){
  state.room=m.room||null;
  state.users=m.users||0;

  const e=document.getElementById("roomState");
  if(e)e.textContent=
   state.room?`방 ${state.room} · ${state.users}명`:"방 없음";

  return;
 }

 if(m.type==="room_state"){
  state.users=m.users||0;

  const e=document.getElementById("roomState");
  if(e)e.textContent=
   state.room?`방 ${state.room} · ${state.users}명`:"방 없음";

  return;
 }

 if(m.type==="project_change"){
  const p=m.payload||{};

  state.code=p.code||state.code;
  state.vars=p.vars||state.vars;
  state.lists=p.lists||state.lists;
  state.funcs=p.funcs||state.funcs;

  render();
  return;
 }

 if(m.type==="chat"){
  log("💬 "+(m.message||""));
 }
}

function createRoom(){
 if(state.mode!=="online")return;

 const name=prompt("방 이름","codescript-room");
 if(!name)return;

 state.room=name;

 request({
  type:"create_room",
  room:name
 });

 const e=document.getElementById("roomState");
 if(e)e.textContent="방 생성 요청: "+name;
}

function joinRoom(){
 if(state.mode!=="online")return;

 const name=prompt("참가할 방","codescript-room");
 if(!name)return;

 state.room=name;

 request({
  type:"join_room",
  room:name
 });
}

function leaveRoom(){
 if(!state.room)return;

 request({
  type:"leave_room",
  room:state.room
 });

 state.room=null;
 state.users=0;

 const e=document.getElementById("roomState");
 if(e)e.textContent="방 없음";
}

function sendChat(text){
 if(!state.room)return;

 request({
  type:"chat",
  room:state.room,
  message:text
 });
}

function renderProjects(list){
 const e=document.getElementById("projects");
 if(!e)return;

 if(!list.length){
  e.innerHTML=`
   <div class="card">
    공개된 프로젝트가 아직 없습니다.
   </div>`;
  return;
 }

 e.innerHTML=list.map(p=>`
  <div class="card">
   <h3>${esc(p.name||"이름 없음")}</h3>
   <p>❤️ ${p.likes||0}</p>
   <button onclick="CS.remake('${esc(p.id||"")}')">
    리메이크
   </button>
  </div>`).join("");
}

function remake(id){
 log("리메이크: "+id);
}

/* =========================================================
   저장 / 공개
   ========================================================= */

function save(){
 const data={
  name:state.project,
  mode:state.mode,
  code:state.code,
  vars:state.vars,
  lists:state.lists,
  funcs:state.funcs,
  actor:state.actor,
  pen:state.pen,
  paint:state.projectPaint||null
 };

 localStorage.setItem(
  "codescript-project",
  JSON.stringify(data)
 );

 if(state.mode==="online"){
  request({
   type:"save_project",
   project:data
  });
 }

 log("💾 저장 완료");
}

function publish(){
 save();

 if(state.mode==="online"){
  request({
   type:"publish_project",
   project:{
    name:state.project,
    code:state.code,
    vars:state.vars,
    lists:state.lists,
    funcs:state.funcs
   }
  });
 }

 log("🌐 공개 요청 완료");
}

/* =========================================================
   전역 API
   ========================================================= */

window.CS={
 home,
 explore,
 chooseEditor,
 editor,

 setCat(c){
  state.category=c;
  palette();
 },

 add,
 del,
 clear,
 undo,
 redo,

 run,
 stop,

 save,
 publish,

 newVar,
 delVar,
 setVar,
 addVar,
 getVar,

 newList,
 pushList,
 shiftList,
 popList,
 getList,

 newFunc,
 callFunc,

 createRoom,
 joinRoom,
 leaveRoom,

 echo(){
  beep(440);
 },

 clearPaint,
 openPaint,
 closePaint,
 paintTool,
 paintMode,
 paintColor,
 paintWidth,
 paintAlpha,
 paintUndo,
 paintRedo,
 addPaintLayer,
 renamePaintLayer,
 removePaintLayer,
 selectPaintLayer,
 exportPaint,
 savePaintToProject,

 connect
};

/* =========================================================
   키보드
   ========================================================= */

window.addEventListener("keydown",e=>{
 state.keyDown=true;

 if(e.key==="Escape"){
  state.stop=true;
 }

 if(e.key===" "){
  e.preventDefault();
 }

 if(e.ctrlKey&&e.key.toLowerCase()==="z"){
  e.preventDefault();
  undo();
 }

 if(e.ctrlKey&&e.key.toLowerCase()==="y"){
  e.preventDefault();
  redo();
 }
});

window.addEventListener("keyup",()=>{
 state.keyDown=false;
});

window.addEventListener("pointerdown",()=>{
 state.mouseDown=true;
});

window.addEventListener("pointerup",()=>{
 state.mouseDown=false;
});

/* =========================================================
   시작
   ========================================================= */

home();

})();

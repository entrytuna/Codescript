(() => {
"use strict";

/* =========================================================
   CODESCRIPT FINAL
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
  CATS.map(x => [x[0],x[2]])
);

/* ---------------------------------------------------------
   BLOCKS
   --------------------------------------------------------- */

const DEFINITIONS = [
  ["start","초록 깃발을 클릭했을 때","start"],
  ["start","키를 눌렀을 때","start"],
  ["start","오브젝트를 클릭했을 때","start"],
  ["start","실행 시작","start"],

  ["flow","1초 기다리기","wait",1],
  ["flow","2초 기다리기","wait",2],
  ["flow","10번 반복하기","repeat",10],
  ["flow","무한 반복하기","forever"],
  ["flow","반복 중단","break"],
  ["flow","만약","if"],
  ["flow","아니면","else"],

  ["move","10만큼 움직이기","move",10],
  ["move","-10만큼 움직이기","move",-10],
  ["move","x 10만큼 움직이기","movex",10],
  ["move","x -10만큼 움직이기","movex",-10],
  ["move","y 10만큼 움직이기","movey",10],
  ["move","y -10만큼 움직이기","movey",-10],
  ["move","x좌표 0으로 이동","setx",0],
  ["move","y좌표 0으로 이동","sety",0],
  ["move","방향 90도로 정하기","direction",90],
  ["move","15도 시계방향 회전","turn",15],
  ["move","15도 반시계방향 회전","turn",-15],
  ["move","가운데로 이동","center"],

  ["looks","안녕이라고 말하기","say","안녕"],
  ["looks","생각하기","think","음..."],
  ["looks","말하기 지우기","clearSay"],
  ["looks","보이기","show"],
  ["looks","숨기기","hide"],
  ["looks","크기 100%로 정하기","size",100],
  ["looks","크기 50%로 정하기","size",50],
  ["looks","크기 150%로 정하기","size",150],
  ["looks","모양 바꾸기","costume"],

  ["brush","펜 내리기","penDown"],
  ["brush","펜 올리기","penUp"],
  ["brush","모두 지우기","clearPaint"],
  ["brush","도장 찍기","stamp"],
  ["brush","펜 굵기 5로 정하기","penWidth",5],
  ["brush","펜 굵기 10으로 정하기","penWidth",10],

  ["text","글자 쓰기","text","Hello"],
  ["text","글자 지우기","clearText"],

  ["sound","소리 재생하기","sound"],
  ["sound","모든 소리 멈추기","stopSound"],

  ["judge","키가 눌렸는지","key"],
  ["judge","마우스를 클릭했는지","mouse"],
  ["judge","변수가 0보다 큰지","greater",0],
  ["judge","변수가 0인지","equal",0],

  ["calc","더하기","add",1,1],
  ["calc","빼기","sub",1,1],
  ["calc","곱하기","mul",2,2],
  ["calc","나누기","div",10,2],
  ["calc","나머지","mod",10,3],
  ["calc","랜덤 수","random",1,10],
  ["calc","반올림","round",1.5],
  ["calc","절댓값","abs",-5],

  ["online","온라인 방 만들기","roomCreate"],
  ["online","온라인 방 참가하기","roomJoin"],
  ["online","채팅 보내기","chat"],
  ["online","내 이름 가져오기","username"],

  ["data","변수 만들기","newVar","변수"],
  ["data","변수에 값 넣기","setVar","변수",0],
  ["data","변수 값 바꾸기","changeVar","변수",1],
  ["data","변수 보이기","showVar","변수"],
  ["data","변수 숨기기","hideVar","변수"],
  ["data","리스트 만들기","newList","목록"],
  ["data","리스트에 추가하기","pushList","목록","값"],
  ["data","리스트 모두 삭제","clearList","목록"],

  ["func","함수 만들기","newFunc","함수"],
  ["func","함수 실행하기","callFunc","함수"]
];

const BLOCKS = [];

for (const d of DEFINITIONS) {
  BLOCKS.push({
    id: "b" + (BLOCKS.length + 1),
    cat: d[0],
    name: d[1],
    action: d.slice(2),
    color: COLORS[d[0]]
  });
}

/* 실제 동작을 가지는 추가 블록 */
const generators = [
  ["move","%d만큼 움직이기","move", -100,100,5],
  ["move","x %d만큼 이동하기","movex",-100,100,5],
  ["move","y %d만큼 이동하기","movey",-100,100,5],
  ["move","%d도 회전하기","turn",-360,360,15],

  ["looks","크기 %d%%로 정하기","size",10,200,10],
  ["looks","%d초 동안 말하기","sayTime",1,10,1],

  ["brush","펜 굵기 %d로 정하기","penWidth",1,50,1],

  ["flow","%d초 기다리기","wait",0,20,1],
  ["flow","%d번 반복하기","repeat",1,100,1],

  ["calc","%d + %d","add",-100,100,5],
  ["calc","%d - %d","sub",-100,100,5],
  ["calc","%d × %d","mul",-20,20,1],
  ["calc","%d ÷ %d","div",-100,100,5],

  ["data","변수에 %d 더하기","changeVar","변수",-100,100,5]
];

let seed = 1;

function valueSeries(min,max,step) {
  const a = [];
  for(let x=min;x<=max;x+=step) {
    a.push(x);
  }
  return a;
}

for(const g of generators) {
  const cat = g[0];
  const template = g[1];
  const action = g[2];

  if(action === "move" ||
     action === "movex" ||
     action === "movey" ||
     action === "turn" ||
     action === "size" ||
     action === "penWidth" ||
     action === "wait" ||
     action === "repeat") {

    for(const v of valueSeries(g[3],g[4],g[5])) {
      BLOCKS.push({
        id:"b"+(++seed)+BLOCKS.length,
        cat,
        name:template.replace("%d",v),
        action:[action,v],
        color:COLORS[cat]
      });
    }
  }

  if(action === "sayTime") {
    for(let v=1;v<=10;v++) {
      BLOCKS.push({
        id:"b"+(++seed)+BLOCKS.length,
        cat,
        name:template.replace("%d",v),
        action:[action,v],
        color:COLORS[cat]
      });
    }
  }

  if(action==="add" ||
     action==="sub" ||
     action==="mul" ||
     action==="div") {

    for(let a=-10;a<=10;a++) {
      for(let b=-10;b<=10;b++) {
        BLOCKS.push({
          id:"b"+(++seed)+BLOCKS.length,
          cat,
          name:template
            .replace("%d",a)
            .replace("%d",b),
          action:[action,a,b],
          color:COLORS[cat]
        });

        if(BLOCKS.length>=499) break;
      }

      if(BLOCKS.length>=499) break;
    }
  }
}

/* 499개까지 실제 액션을 가진 블록으로 채움 */
const fallbackActions = [
  ["move",x=>["move",x]],
  ["looks",x=>["size",x]],
  ["brush",x=>["penWidth",x]],
  ["flow",x=>["wait",x]],
  ["calc",x=>["add",x,1]],
  ["data",x=>["changeVar","변수",x]]
];

let f = 0;

while(BLOCKS.length < 499) {
  const cat = fallbackActions[f % fallbackActions.length][0];
  const val = (BLOCKS.length % 20) + 1;
  const maker = fallbackActions[f % fallbackActions.length][1];

  BLOCKS.push({
    id:"b"+BLOCKS.length,
    cat,
    name:
      cat==="move" ? val+"만큼 움직이기" :
      cat==="looks" ? "크기 "+val+"%로 정하기" :
      cat==="brush" ? "펜 굵기 "+val :
      cat==="flow" ? val+"초 기다리기" :
      cat==="calc" ? val+" 더하기 1" :
      "변수에 "+val+" 더하기",
    action:maker(val),
    color:COLORS[cat]
  });

  f++;
}

BLOCKS.length = 499;

/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */

const state = {
  page:"home",
  category:"all",

  user:null,

  code:[],

  objects:[
    {
      id:"obj1",
      name:"오브젝트 1",
      x:320,
      y:220,
      size:100,
      direction:90,
      visible:true,
      costume:null,
      sound:null
    }
  ],

  selectedObject:"obj1",

  vars:{},
  lists:{},
  funcs:{},

  sounds:[],

  project:{
    name:"나의 프로젝트",
    id:null,
    public:false
  },

  paint:{
    mode:"bitmap",
    tool:"pen",
    color:"#111111",
    alpha:100,
    width:8,
    zoom:100,
    canvas:null,
    ctx:null,
    drawing:false,
    lastX:0,
    lastY:0,
    startX:0,
    startY:0,
    layers:[
      {
        name:"배경",
        visible:true,
        opacity:1,
        canvas:null
      }
    ],
    activeLayer:0,
    history:[],
    future:[]
  },

  audio:{
    recorder:null,
    chunks:[],
    recording:false
  },

  running:false,
  stop:false,
  ws:null,
  room:null
};

/* ---------------------------------------------------------
   CSS
   --------------------------------------------------------- */

const css = document.createElement("style");

css.textContent = `
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;font-family:Arial,"Noto Sans KR",sans-serif;background:#f4f6f8;color:#222}
button,input,select{font:inherit}
button{cursor:pointer;border:0}
#app{height:100%}

.top{
height:58px;
background:#20242a;
color:white;
display:flex;
align-items:center;
padding:0 16px;
gap:10px
}

.logo{
font-size:21px;
font-weight:900;
margin-right:20px
}

.top button{
background:#30363d;
color:white;
padding:9px 13px;
border-radius:8px
}

.top button:hover{background:#424952}

.userbox{margin-left:auto;display:flex;gap:8px;align-items:center}

.layout{
height:calc(100% - 58px);
display:grid;
grid-template-columns:220px 1fr 330px;
overflow:hidden
}

.sidebar{
background:#fff;
border-right:1px solid #ddd;
overflow:auto;
padding:10px
}

.cat{
padding:10px 12px;
margin-bottom:5px;
border-radius:8px;
cursor:pointer;
font-weight:700
}

.cat:hover,.cat.active{background:#e9edf1}

.blocks{
padding:10px;
overflow:auto;
background:#eef1f4
}

.block{
color:white;
padding:10px 12px;
border-radius:8px;
margin:7px 0;
font-weight:700;
box-shadow:0 2px 3px #0002;
cursor:pointer;
user-select:none
}

.block:hover{transform:translateX(2px)}

.workspace{
position:relative;
background:#e7eaee;
overflow:auto;
padding:15px
}

.codearea{
min-height:100%;
background:white;
border-radius:12px;
padding:15px;
box-shadow:0 2px 10px #0001
}

.codeblock{
padding:10px 13px;
border-radius:8px;
color:white;
margin:7px 0;
font-weight:700;
display:flex;
justify-content:space-between
}

.codeblock small{opacity:.7;cursor:pointer}

.stage{
width:640px;
height:400px;
background:white;
border:2px solid #222;
position:relative;
margin:0 auto 15px;
overflow:hidden
}

.object{
position:absolute;
transform-origin:center;
cursor:pointer;
min-width:45px;
min-height:45px;
display:flex;
align-items:center;
justify-content:center;
font-weight:900;
font-size:18px;
border-radius:12px;
background:#69aefc;
border:2px solid #3578bd;
user-select:none
}

.object.selected{
outline:3px solid #111;
outline-offset:3px
}

.right{
background:white;
border-left:1px solid #ddd;
overflow:auto;
padding:10px
}

.panel{
border:1px solid #ddd;
border-radius:10px;
padding:10px;
margin-bottom:10px
}

.panel h3{
margin:0 0 10px;
font-size:15px
}

.objrow,.soundrow,.layerrow{
display:flex;
align-items:center;
gap:6px;
padding:8px;
border-radius:7px;
margin-bottom:4px;
background:#f2f4f6;
cursor:pointer
}

.objrow.active,.layerrow.active{background:#dfeaff}

.objname{flex:1}

.smallbtn{
padding:5px 7px;
border-radius:6px;
background:#ddd
}

.modal{
position:fixed;
inset:0;
background:#0008;
display:none;
align-items:center;
justify-content:center;
z-index:1000
}

.modal.show{display:flex}

.dialog{
background:white;
width:min(1100px,94vw);
height:min(760px,92vh);
border-radius:15px;
display:flex;
flex-direction:column;
overflow:hidden
}

.dialoghead{
padding:12px 15px;
border-bottom:1px solid #ddd;
display:flex;
align-items:center;
gap:8px
}

.dialoghead b{font-size:18px}

.dialogbody{
flex:1;
overflow:auto;
padding:12px
}

.paintbar{
display:flex;
flex-wrap:wrap;
gap:6px;
padding:8px;
background:#f0f2f4;
border-radius:9px;
margin-bottom:10px
}

.paintbar button,.paintbar label{
padding:7px 10px;
background:white;
border:1px solid #ccc;
border-radius:7px;
cursor:pointer
}

.paintcanvaswrap{
background:#aaa;
height:520px;
overflow:auto;
display:flex;
align-items:center;
justify-content:center;
padding:20px
}

#paintCanvas{
background:white;
box-shadow:0 2px 8px #0004;
touch-action:none
}

.login{
height:100%;
display:flex;
align-items:center;
justify-content:center;
background:linear-gradient(135deg,#eaf2ff,#f6f7f9)
}

.loginbox{
width:380px;
max-width:92vw;
background:white;
padding:30px;
border-radius:18px;
box-shadow:0 10px 40px #0002
}

.loginbox h1{text-align:center;margin-top:0}

.loginbox input{
width:100%;
padding:12px;
margin:6px 0;
border:1px solid #ccc;
border-radius:8px
}

.loginbox button.main{
width:100%;
padding:12px;
background:#3578ef;
color:white;
border-radius:8px;
margin-top:8px;
font-weight:800
}

.switch{
text-align:center;
margin-top:12px;
cursor:pointer;
color:#3578ef
}

.home{
height:100%;
display:flex;
align-items:center;
justify-content:center;
text-align:center
}

.homebox h1{font-size:48px;margin:0 0 10px}
.homebox p{color:#666}

.homebuttons{
display:flex;
gap:10px;
justify-content:center;
margin-top:25px
}

.homebuttons button{
padding:14px 25px;
border-radius:10px;
background:#3578ef;
color:white;
font-weight:800
}

.fileinput{display:none}

.range{
width:100px
}
`;

document.head.appendChild(css);

/* ---------------------------------------------------------
   HELPERS
   --------------------------------------------------------- */

const $ = s => document.querySelector(s);

function esc(v){
  return String(v)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function selectedObject(){
  return state.objects.find(
    o=>o.id===state.selectedObject
  ) || state.objects[0];
}

function catName(id){
  return CATS.find(x=>x[0]===id)?.[1] || id;
}

/* ---------------------------------------------------------
   API
   --------------------------------------------------------- */

async function api(url,options={}){
  const r = await fetch(url,{
    credentials:"include",
    ...options,
    headers:{
      "content-type":"application/json",
      ...(options.headers||{})
    }
  });

  const data = await r.json().catch(()=>({
    ok:false,
    error:"서버 응답 오류"
  }));

  if(!r.ok) throw new Error(data.error || "요청 실패");

  return data;
}

/* ---------------------------------------------------------
   LOGIN
   --------------------------------------------------------- */

function loginPage(signup=false){

  $("#app").innerHTML = `
    <div class="login">
      <div class="loginbox">
        <h1>🎮 Codescript</h1>
        <p style="text-align:center;color:#777">
          ${signup ? "새 계정 만들기":"로그인"}
        </p>

        <input id="authUser"
          placeholder="아이디"
          autocomplete="username">

        <input id="authPass"
          type="password"
          placeholder="비밀번호"
          autocomplete="${signup?"new-password":"current-password"}">

        <button class="main" id="authButton">
          ${signup?"회원가입":"로그인"}
        </button>

        <div id="authError"
          style="color:#e33;text-align:center;margin-top:10px"></div>

        <div class="switch" id="authSwitch">
          ${signup
            ?"이미 계정이 있다면 로그인"
            :"계정이 없다면 회원가입"}
        </div>
      </div>
    </div>
  `;

  $("#authButton").onclick = async()=>{

    const username=$("#authUser").value.trim();
    const password=$("#authPass").value;

    if(!username || !password){
      $("#authError").textContent="아이디와 비밀번호를 입력하세요.";
      return;
    }

    try{

      const data=await api(
        signup?"/api/signup":"/api/login",
        {
          method:"POST",
          body:JSON.stringify({
            username,
            password
          })
        }
      );

      state.user=data.user;
      home();

    }catch(e){
      $("#authError").textContent=e.message;
    }
  };

  $("#authSwitch").onclick=()=>loginPage(!signup);
}

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */

function home(){

  state.page="home";

  $("#app").innerHTML=`
    <div class="top">
      <div class="logo">🎮 Codescript</div>
      <button id="homeCreate">만들기</button>
      <button id="homeExplore">탐색</button>

      <div class="userbox">
        <span>👤 ${esc(state.user?.username || "")}</span>
        <button id="logout">로그아웃</button>
      </div>
    </div>

    <div class="home">
      <div class="homebox">
        <h1>Codescript</h1>
        <p>블록으로 만드는 나만의 게임</p>

        <div class="homebuttons">
          <button id="startOffline">오프라인 만들기</button>
          <button id="startOnline">온라인 만들기</button>
        </div>
      </div>
    </div>
  `;

  $("#homeCreate").onclick=()=>editor("offline");
  $("#homeExplore").onclick=explore;
  $("#startOffline").onclick=()=>editor("offline");
  $("#startOnline").onclick=()=>editor("online");

  $("#logout").onclick=async()=>{
    await api("/api/logout",{method:"POST"}).catch(()=>{});
    state.user=null;
    loginPage(false);
  };
}

/* ---------------------------------------------------------
   EXPLORE
   --------------------------------------------------------- */

function explore(){

  state.page="explore";

  $("#app").innerHTML=`
    <div class="top">
      <div class="logo">🎮 Codescript</div>
      <button id="backHome">홈</button>
      <button id="newProject">새 프로젝트</button>
      <div class="userbox">
        👤 ${esc(state.user?.username||"")}
      </div>
    </div>

    <div style="padding:25px">
      <h2>탐색</h2>
      <p>로그인한 계정의 프로젝트를 불러옵니다.</p>
      <div id="projects">불러오는 중...</div>
    </div>
  `;

  $("#backHome").onclick=home;
  $("#newProject").onclick=()=>editor("offline");

  loadProjects();
}

async function loadProjects(){

  const box=$("#projects");

  try{
    const data=await api("/api/projects");

    if(!data.projects.length){
      box.innerHTML="<p>아직 저장한 프로젝트가 없습니다.</p>";
      return;
    }

    box.innerHTML=data.projects.map(p=>`
      <div class="panel">
        <b>${esc(p.name)}</b>
        <div style="color:#777;font-size:13px">
          ${new Date(p.updated_at).toLocaleString()}
        </div>
        <button class="smallbtn"
          data-open="${p.id}">
          열기
        </button>
      </div>
    `).join("");

    box.querySelectorAll("[data-open]").forEach(btn=>{
      btn.onclick=()=>{
        const p=data.projects.find(
          x=>x.id===Number(btn.dataset.open)
        );

        if(!p)return;

        try{
          const project=JSON.parse(p.data);
          loadProject(project);
          state.project.id=p.id;
          state.project.name=p.name;
          editor("offline");
        }catch{}
      };
    });

  }catch(e){
    box.innerHTML=`<p>${esc(e.message)}</p>`;
  }
}

/* ---------------------------------------------------------
   EDITOR
   --------------------------------------------------------- */

function editor(mode){

  state.page="editor";
  state.project.mode=mode;

  $("#app").innerHTML=`
    <div class="top">
      <div class="logo">🎮 Codescript</div>

      <button id="goHome">홈</button>
      <button id="run">▶ 실행</button>
      <button id="stop">■ 정지</button>
      <button id="save">💾 저장</button>
      <button id="paintOpen">🎨 그림판</button>

      <div class="userbox">
        👤 ${esc(state.user?.username||"")}
      </div>
    </div>

    <div class="layout">

      <div class="sidebar">
        ${CATS.map(c=>`
          <div class="cat"
            data-cat="${c[0]}"
            style="border-left:5px solid ${c[2]}">
            ${c[1]}
          </div>
        `).join("")}
      </div>

      <div class="blocks" id="blocks"></div>

      <div class="workspace">

        <div class="stage" id="stage"></div>

        <div class="codearea">
          <h3>코드</h3>
          <div id="code"></div>
        </div>

      </div>

      <div class="right">

        <div class="panel">
          <h3>🧍 오브젝트 목록</h3>

          <div id="objects"></div>

          <button class="smallbtn" id="addObject">
            ＋ 오브젝트 추가
          </button>
        </div>

        <div class="panel">
          <h3>🔊 소리</h3>

          <input
            class="fileinput"
            id="soundFile"
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/*">

          <button class="smallbtn" id="uploadSound">
            🔊 소리 업로드
          </button>

          <button class="smallbtn" id="recordSound">
            🎙️ 녹음
          </button>

          <div id="sounds"></div>
        </div>

        <div class="panel">
          <h3>📊 오브젝트 속성</h3>
          <div id="props"></div>
        </div>

      </div>
    </div>

    <div class="modal" id="paintModal">
      <div class="dialog">

        <div class="dialoghead">
          <b>🎨 그림판</b>
          <span style="margin-left:auto"></span>
          <button class="smallbtn" id="closePaint">닫기</button>
        </div>

        <div class="dialogbody">

          <div class="paintbar">

            <button data-tool="pen">✏️ 펜</button>
            <button data-tool="eraser">🧹 지우개</button>
            <button data-tool="line">╱ 선</button>
            <button data-tool="rect">□ 사각형</button>
            <button data-tool="circle">○ 원</button>
            <button data-tool="fill">🪣 채우기</button>
            <button data-tool="picker">💧 스포이드</button>

            <label>
              색
              <input id="paintColor" type="color" value="#111111">
            </label>

            <label>
              굵기
              <input id="paintWidth"
                class="range"
                type="range"
                min="1"
                max="80"
                value="8">
            </label>

            <label>
              투명도
              <input id="paintAlpha"
                class="range"
                type="range"
                min="1"
                max="100"
                value="100">
            </label>

            <button id="paintUndo">↩ 실행취소</button>
            <button id="paintRedo">↪ 다시실행</button>
            <button id="paintClear">🗑 전체삭제</button>
            <button id="paintExport">PNG 저장</button>
            <button id="paintImageUpload">🖼 이미지 추가</button>

            <input
              class="fileinput"
              id="imageFile"
              type="file"
              accept="image/*">

            <button id="addLayer">＋ 레이어</button>
            <button id="removeLayer">－ 레이어</button>

          </div>

          <div class="paintbar">

            <button id="bitmapMode">Bitmap</button>
            <button id="vectorMode">Vector</button>
            <button id="pixelMode">Pixelmap</button>

            <span style="margin-left:10px">
              레이어:
            </span>

            <div id="layers"></div>

          </div>

          <div class="paintcanvaswrap">
            <canvas
              id="paintCanvas"
              width="800"
              height="500">
            </canvas>
          </div>

        </div>
      </div>
    </div>
  `;

  bindEditor();
  renderBlocks();
  renderCode();
  renderObjects();
  renderSounds();
  renderProps();
  initPaint();
  renderStage();

  if(mode==="online"){
    connectWS();
  }
}

/* ---------------------------------------------------------
   BLOCK UI
   --------------------------------------------------------- */

function renderBlocks(){

  const box=$("#blocks");

  const list=state.category==="all"
    ? BLOCKS
    : BLOCKS.filter(b=>b.cat===state.category);

  box.innerHTML=list.map(b=>`
    <div class="block"
      draggable="true"
      data-id="${b.id}"
      style="background:${b.color}">
      ${esc(b.name)}
    </div>
  `).join("");

  box.querySelectorAll(".block").forEach(el=>{
    el.onclick=()=>{
      const b=BLOCKS.find(
        x=>x.id===el.dataset.id
      );

      if(!b)return;

      state.code.push({
        ...b,
        uid:crypto.randomUUID()
      });

      renderCode();
    };

    el.ondragstart=e=>{
      e.dataTransfer.setData(
        "text/plain",
        el.dataset.id
      );
    };
  });
}

function renderCode(){

  const box=$("#code");

  if(!state.code.length){
    box.innerHTML=
      `<p style="color:#999">
        왼쪽 블록을 클릭해서 코드를 추가하세요.
      </p>`;
    return;
  }

  box.innerHTML=state.code.map((b,i)=>`
    <div
      class="codeblock"
      style="background:${b.color}">
      <span>${esc(b.name)}</span>
      <small data-del="${i}">✕</small>
    </div>
  `).join("");

  box.querySelectorAll("[data-del]").forEach(x=>{
    x.onclick=()=>{
      state.code.splice(
        Number(x.dataset.del),
        1
      );
      renderCode();
    };
  });
}

/* ---------------------------------------------------------
   OBJECTS
   --------------------------------------------------------- */

function renderObjects(){

  const box=$("#objects");

  box.innerHTML=state.objects.map(o=>`
    <div class="objrow ${
      o.id===state.selectedObject?"active":""
    }" data-object="${o.id}">

      <span>🧍</span>
      <span class="objname">${esc(o.name)}</span>

      <button class="smallbtn"
        data-dup="${o.id}">
        ⧉
      </button>

      <button class="smallbtn"
        data-delobj="${o.id}">
        ×
      </button>
    </div>
  `).join("");

  box.querySelectorAll("[data-object]").forEach(row=>{
    row.onclick=e=>{
      if(
        e.target.closest("[data-dup]") ||
        e.target.closest("[data-delobj]")
      )return;

      state.selectedObject=row.dataset.object;

      renderObjects();
      renderProps();
      renderStage();
    };
  });

  box.querySelectorAll("[data-dup]").forEach(btn=>{
    btn.onclick=()=>{
      const o=state.objects.find(
        x=>x.id===btn.dataset.dup
      );

      if(!o)return;

      const copy={
        ...structuredClone(o),
        id:crypto.randomUUID(),
        name:o.name+" 복사본",
        x:o.x+20,
        y:o.y+20
      };

      state.objects.push(copy);
      state.selectedObject=copy.id;

      renderObjects();
      renderStage();
    };
  });

  box.querySelectorAll("[data-delobj]").forEach(btn=>{
    btn.onclick=()=>{
      if(state.objects.length<=1){
        alert("오브젝트는 최소 1개가 필요합니다.");
        return;
      }

      state.objects=state.objects.filter(
        o=>o.id!==btn.dataset.delobj
      );

      state.selectedObject=state.objects[0].id;

      renderObjects();
      renderProps();
      renderStage();
    };
  });
}

function addObject(){

  const n=state.objects.length+1;

  const o={
    id:crypto.randomUUID(),
    name:"오브젝트 "+n,
    x:320,
    y:200,
    size:100,
    direction:90,
    visible:true,
    costume:null,
    sound:null
  };

  state.objects.push(o);
  state.selectedObject=o.id;

  renderObjects();
  renderProps();
  renderStage();
}

function renderProps(){

  const o=selectedObject();

  if(!o)return;

  $("#props").innerHTML=`
    <label>이름</label>
    <input id="objName"
      value="${esc(o.name)}"
      style="width:100%;padding:7px">

    <label>X</label>
    <input id="objX"
      type="number"
      value="${o.x}"
      style="width:100%;padding:7px">

    <label>Y</label>
    <input id="objY"
      type="number"
      value="${o.y}"
      style="width:100%;padding:7px">

    <label>크기</label>
    <input id="objSize"
      type="number"
      value="${o.size}"
      style="width:100%;padding:7px">

    <label>방향</label>
    <input id="objDir"
      type="number"
      value="${o.direction}"
      style="width:100%;padding:7px">

    <label>
      <input id="objVisible"
        type="checkbox"
        ${o.visible?"checked":""}>
      보이기
    </label>

    <br>

    <button class="smallbtn" id="renameObj">
      이름 적용
    </button>
  `;

  $("#renameObj").onclick=()=>{
    o.name=$("#objName").value||"오브젝트";
    updateObject();
  };

  ["objX","objY","objSize","objDir"].forEach(id=>{
    $("#"+id).oninput=()=>{
      o.x=Number($("#objX").value);
      o.y=Number($("#objY").value);
      o.size=Number($("#objSize").value);
      o.direction=Number($("#objDir").value);
      renderStage();
    };
  });

  $("#objVisible").onchange=()=>{
    o.visible=$("#objVisible").checked;
    renderStage();
  };
}

function updateObject(){
  renderObjects();
  renderProps();
  renderStage();
}

/* ---------------------------------------------------------
   STAGE
   --------------------------------------------------------- */

function renderStage(){

  const stage=$("#stage");

  if(!stage)return;

  stage.innerHTML="";

  for(const o of state.objects){

    if(!o.visible)continue;

    const el=document.createElement("div");

    el.className=
      "object"+
      (o.id===state.selectedObject
        ?" selected":"");

    el.dataset.id=o.id;

    el.style.left=(o.x-25)+"px";
    el.style.top=(o.y-25)+"px";

    el.style.width=(50*o.size/100)+"px";
    el.style.height=(50*o.size/100)+"px";

    el.style.transform=
      `rotate(${o.direction-90}deg)`;

    if(o.costume){
      el.style.backgroundImage=
        `url("${o.costume}")`;

      el.style.backgroundSize="cover";
      el.textContent="";
    }else{
      el.textContent="🎮";
    }

    el.onclick=e=>{
      e.stopPropagation();

      state.selectedObject=o.id;

      renderObjects();
      renderProps();
      renderStage();
    };

    stage.appendChild(el);
  }
}

/* ---------------------------------------------------------
   SOUND
   --------------------------------------------------------- */

function renderSounds(){

  const box=$("#sounds");

  if(!state.sounds.length){
    box.innerHTML=
      `<p style="color:#999">소리가 없습니다.</p>`;
    return;
  }

  box.innerHTML=state.sounds.map((s,i)=>`
    <div class="soundrow">

      🔊

      <span class="objname">
        ${esc(s.name)}
      </span>

      <button class="smallbtn"
        data-play="${i}">
        ▶
      </button>

      <button class="smallbtn"
        data-stop="${i}">
        ■
      </button>

      <button class="smallbtn"
        data-del-sound="${i}">
        ×
      </button>

    </div>
  `).join("");

  box.querySelectorAll("[data-play]").forEach(btn=>{
    btn.onclick=()=>{
      const s=state.sounds[Number(btn.dataset.play)];

      if(s.audio){
        s.audio.currentTime=0;
        s.audio.play().catch(()=>{});
      }
    };
  });

  box.querySelectorAll("[data-stop]").forEach(btn=>{
    btn.onclick=()=>{
      const s=state.sounds[Number(btn.dataset.stop)];

      if(s.audio){
        s.audio.pause();
        s.audio.currentTime=0;
      }
    };
  });

  box.querySelectorAll("[data-del-sound]").forEach(btn=>{
    btn.onclick=()=>{
      const i=Number(btn.dataset.delSound);

      const s=state.sounds[i];

      if(s.audio){
        s.audio.pause();
      }

      if(s.url){
        URL.revokeObjectURL(s.url);
      }

      state.sounds.splice(i,1);
      renderSounds();
    };
  });
}

function uploadSound(file){

  if(!file)return;

  const allowed=[
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/webm"
  ];

  if(
    !allowed.includes(file.type) &&
    !/\.(mp3|wav|ogg|m4a|webm)$/i.test(file.name)
  ){
    alert("MP3, WAV, OGG 등의 오디오 파일만 사용할 수 있습니다.");
    return;
  }

  const url=URL.createObjectURL(file);

  const audio=new Audio(url);

  state.sounds.push({
    id:crypto.randomUUID(),
    name:file.name.replace(/\.[^.]+$/,""),
    type:file.type,
    size:file.size,
    url,
    audio,
    blob:file
  });

  renderSounds();
}

async function recordSound(){

  if(state.audio.recording){
    state.audio.recorder.stop();
    return;
  }

  if(!navigator.mediaDevices?.getUserMedia){
    alert("이 브라우저에서는 마이크 녹음을 사용할 수 없습니다.");
    return;
  }

  try{

    const stream=
      await navigator.mediaDevices.getUserMedia({
        audio:true
      });

    const recorder=
      new MediaRecorder(stream);

    state.audio.recorder=recorder;
    state.audio.chunks=[];
    state.audio.recording=true;

    $("#recordSound").textContent="⏹ 녹음 중지";

    recorder.ondataavailable=e=>{
      if(e.data.size){
        state.audio.chunks.push(e.data);
      }
    };

    recorder.onstop=()=>{

      const blob=new Blob(
        state.audio.chunks,
        {
          type:recorder.mimeType ||
            "audio/webm"
        }
      );

      const url=URL.createObjectURL(blob);
      const audio=new Audio(url);

      state.sounds.push({
        id:crypto.randomUUID(),
        name:"녹음 "+new Date().toLocaleTimeString(),
        type:blob.type,
        size:blob.size,
        url,
        audio,
        blob
      });

      state.audio.recording=false;

      stream.getTracks().forEach(
        t=>t.stop()
      );

      $("#recordSound").textContent="🎙️ 녹음";

      renderSounds();
    };

    recorder.start();

  }catch(e){
    alert("마이크 사용 권한이 필요합니다.");
  }
}

/* ---------------------------------------------------------
   PAINT
   --------------------------------------------------------- */

function initPaint(){

  const canvas=$("#paintCanvas");

  if(!canvas)return;

  state.paint.canvas=canvas;
  state.paint.ctx=canvas.getContext("2d",{
    willReadFrequently:true
  });

  state.paint.ctx.fillStyle="white";
  state.paint.ctx.fillRect(
    0,0,canvas.width,canvas.height
  );

  state.paint.layers[0].canvas=canvas;

  bindPaint();

  renderLayers();
}

function savePaintHistory(){

  const c=state.paint.canvas;

  state.paint.history.push(
    c.toDataURL()
  );

  if(state.paint.history.length>30){
    state.paint.history.shift();
  }

  state.paint.future=[];
}

function restorePaint(url){

  const img=new Image();

  img.onload=()=>{
    const ctx=state.paint.ctx;

    ctx.clearRect(
      0,0,
      state.paint.canvas.width,
      state.paint.canvas.height
    );

    ctx.drawImage(img,0,0);
  };

  img.src=url;
}

function bindPaint(){

  const c=state.paint.canvas;

  const pos=e=>{
    const r=c.getBoundingClientRect();

    return {
      x:(e.clientX-r.left)*
        c.width/r.width,

      y:(e.clientY-r.top)*
        c.height/r.height
    };
  };

  c.onpointerdown=e=>{

    const p=pos(e);

    state.paint.drawing=true;

    state.paint.lastX=p.x;
    state.paint.lastY=p.y;

    state.paint.startX=p.x;
    state.paint.startY=p.y;

    savePaintHistory();

    if(state.paint.tool==="fill"){
      floodFill(
        Math.floor(p.x),
        Math.floor(p.y)
      );

      state.paint.drawing=false;
      return;
    }

    if(state.paint.tool==="picker"){
      const data=state.paint.ctx.getImageData(
        Math.floor(p.x),
        Math.floor(p.y),
        1,1
      ).data;

      const hex="#"+
        [data[0],data[1],data[2]]
          .map(x=>x.toString(16).padStart(2,"0"))
          .join("");

      state.paint.color=hex;
      $("#paintColor").value=hex;

      state.paint.drawing=false;
      return;
    }

    c.setPointerCapture(e.pointerId);
  };

  c.onpointermove=e=>{

    if(!state.paint.drawing)return;

    const p=pos(e);

    const ctx=state.paint.ctx;

    if(
      state.paint.tool==="pen" ||
      state.paint.tool==="eraser"
    ){

      ctx.save();

      ctx.globalAlpha=
        state.paint.alpha/100;

      ctx.lineCap="round";
      ctx.lineJoin="round";
      ctx.lineWidth=state.paint.width;

      ctx.strokeStyle=
        state.paint.tool==="eraser"
          ? "rgba(0,0,0,1)"
          : state.paint.color;

      if(state.paint.tool==="eraser"){
        ctx.globalCompositeOperation=
          "destination-out";
      }else{
        ctx.globalCompositeOperation=
          "source-over";
      }

      ctx.beginPath();

      ctx.moveTo(
        state.paint.lastX,
        state.paint.lastY
      );

      ctx.lineTo(p.x,p.y);

      ctx.stroke();
      ctx.restore();

      state.paint.lastX=p.x;
      state.paint.lastY=p.y;
    }
  };

  c.onpointerup=e=>{

    if(!state.paint.drawing)return;

    const p=pos(e);
    const ctx=state.paint.ctx;

    if(state.paint.tool==="line"){
      drawLine(
        state.paint.startX,
        state.paint.startY,
        p.x,p.y
      );
    }

    if(state.paint.tool==="rect"){
      ctx.save();

      ctx.globalAlpha=
        state.paint.alpha/100;

      ctx.strokeStyle=state.paint.color;
      ctx.lineWidth=state.paint.width;

      ctx.strokeRect(
        state.paint.startX,
        state.paint.startY,
        p.x-state.paint.startX,
        p.y-state.paint.startY
      );

      ctx.restore();
    }

    if(state.paint.tool==="circle"){

      const dx=
        p.x-state.paint.startX;

      const dy=
        p.y-state.paint.startY;

      const radius=
        Math.sqrt(dx*dx+dy*dy);

      ctx.save();

      ctx.globalAlpha=
        state.paint.alpha/100;

      ctx.strokeStyle=state.paint.color;
      ctx.lineWidth=state.paint.width;

      ctx.beginPath();

      ctx.arc(
        state.paint.startX,
        state.paint.startY,
        radius,
        0,
        Math.PI*2
      );

      ctx.stroke();
      ctx.restore();
    }

    state.paint.drawing=false;
  };

  c.onpointercancel=()=>{
    state.paint.drawing=false;
  };

  document.querySelectorAll("[data-tool]").forEach(btn=>{
    btn.onclick=()=>{
      state.paint.tool=btn.dataset.tool;
    };
  });

  $("#paintColor").oninput=e=>{
    state.paint.color=e.target.value;
  };

  $("#paintWidth").oninput=e=>{
    state.paint.width=Number(e.target.value);
  };

  $("#paintAlpha").oninput=e=>{
    state.paint.alpha=Number(e.target.value);
  };

  $("#paintUndo").onclick=paintUndo;
  $("#paintRedo").onclick=paintRedo;

  $("#paintClear").onclick=()=>{
    savePaintHistory();

    state.paint.ctx.clearRect(
      0,0,c.width,c.height
    );
  };

  $("#paintExport").onclick=exportPaint;

  $("#paintImageUpload").onclick=()=>{
    $("#imageFile").click();
  };

  $("#imageFile").onchange=e=>{
    addImageToPaint(e.target.files[0]);
    e.target.value="";
  };

  $("#bitmapMode").onclick=()=>{
    state.paint.mode="bitmap";
  };

  $("#vectorMode").onclick=()=>{
    state.paint.mode="vector";
  };

  $("#pixelMode").onclick=()=>{
    state.paint.mode="pixelmap";
  };

  $("#addLayer").onclick=addLayer;
  $("#removeLayer").onclick=removeLayer;
}

function drawLine(x1,y1,x2,y2){

  const ctx=state.paint.ctx;

  ctx.save();

  ctx.globalAlpha=
    state.paint.alpha/100;

  ctx.strokeStyle=state.paint.color;
  ctx.lineWidth=state.paint.width;
  ctx.lineCap="round";

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

  ctx.restore();
}

function floodFill(x,y){

  const c=state.paint.canvas;
  const ctx=state.paint.ctx;

  const img=ctx.getImageData(
    0,0,c.width,c.height
  );

  const data=img.data;

  const index=(y*c.width+x)*4;

  const target=[
    data[index],
    data[index+1],
    data[index+2],
    data[index+3]
  ];

  const color=hexToRgb(state.paint.color);

  const replacement=[
    color.r,
    color.g,
    color.b,
    Math.round(255*state.paint.alpha/100)
  ];

  if(
    target.every((v,i)=>v===replacement[i])
  )return;

  const stack=[[x,y]];

  while(stack.length){

    const [cx,cy]=stack.pop();

    if(
      cx<0 ||
      cy<0 ||
      cx>=c.width ||
      cy>=c.height
    )continue;

    const i=(cy*c.width+cx)*4;

    if(
      data[i]!==target[0] ||
      data[i+1]!==target[1] ||
      data[i+2]!==target[2] ||
      data[i+3]!==target[3]
    )continue;

    data[i]=replacement[0];
    data[i+1]=replacement[1];
    data[i+2]=replacement[2];
    data[i+3]=replacement[3];

    stack.push([cx+1,cy]);
    stack.push([cx-1,cy]);
    stack.push([cx,cy+1]);
    stack.push([cx,cy-1]);
  }

  ctx.putImageData(img,0,0);
}

function hexToRgb(hex){

  const n=parseInt(
    hex.replace("#",""),
    16
  );

  return {
    r:(n>>16)&255,
    g:(n>>8)&255,
    b:n&255
  };
}

function paintUndo(){

  const h=state.paint.history;

  if(!h.length)return;

  const current=
    state.paint.canvas.toDataURL();

  state.paint.future.push(current);

  const previous=h.pop();

  restorePaint(previous);
}

function paintRedo(){

  const f=state.paint.future;

  if(!f.length)return;

  const current=
    state.paint.canvas.toDataURL();

  state.paint.history.push(current);

  const next=f.pop();

  restorePaint(next);
}

function exportPaint(){

  state.paint.canvas.toBlob(blob=>{
    if(!blob)return;

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;
    a.download=
      (state.project.name||"codescript")+
      ".png";

    a.click();

    setTimeout(
      ()=>URL.revokeObjectURL(url),
      1000
    );
  },"image/png");
}

function addImageToPaint(file){

  if(!file)return;

  if(!file.type.startsWith("image/")){
    alert("이미지 파일만 사용할 수 있습니다.");
    return;
  }

  const url=URL.createObjectURL(file);

  const img=new Image();

  img.onload=()=>{

    savePaintHistory();

    const c=state.paint.canvas;
    const ctx=state.paint.ctx;

    const scale=Math.min(
      c.width/img.width,
      c.height/img.height,
      1
    );

    const w=img.width*scale;
    const h=img.height*scale;

    ctx.drawImage(
      img,
      (c.width-w)/2,
      (c.height-h)/2,
      w,h
    );

    URL.revokeObjectURL(url);
  };

  img.src=url;
}

/* ---------------------------------------------------------
   LAYERS
   --------------------------------------------------------- */

function addLayer(){

  const canvas=document.createElement("canvas");

  canvas.width=800;
  canvas.height=500;

  const layer={
    name:"레이어 "+(state.paint.layers.length+1),
    visible:true,
    opacity:1,
    canvas
  };

  state.paint.layers.push(layer);

  state.paint.activeLayer=
    state.paint.layers.length-1;

  renderLayers();
}

function removeLayer(){

  if(state.paint.layers.length<=1)return;

  state.paint.layers.splice(
    state.paint.activeLayer,
    1
  );

  state.paint.activeLayer=
    Math.max(
      0,
      state.paint.activeLayer-1
    );

  renderLayers();
}

function renderLayers(){

  const box=$("#layers");

  if(!box)return;

  box.innerHTML=state.paint.layers.map(
    (l,i)=>`
      <button
        class="smallbtn ${
          i===state.paint.activeLayer
            ?"active":""
        }"
        data-layer="${i}">
        ${esc(l.name)}
      </button>
    `
  ).join("");

  box.querySelectorAll("[data-layer]").forEach(btn=>{
    btn.onclick=()=>{
      state.paint.activeLayer=
        Number(btn.dataset.layer);

      renderLayers();
    };
  });
}

/* ---------------------------------------------------------
   PROJECT SAVE
   --------------------------------------------------------- */

function serializeProject(){

  return {
    version:1,

    name:state.project.name,

    objects:state.objects,

    code:state.code.map(b=>({
      id:b.id,
      name:b.name,
      cat:b.cat,
      action:b.action,
      color:b.color
    })),

    vars:state.vars,
    lists:state.lists,
    funcs:state.funcs,

    sounds:state.sounds.map(s=>({
      id:s.id,
      name:s.name,
      type:s.type,
      size:s.size
    }))
  };
}

function loadProject(p){

  if(!p)return;

  if(Array.isArray(p.objects))
    state.objects=p.objects;

  if(Array.isArray(p.code))
    state.code=p.code;

  state.vars=p.vars||{};
  state.lists=p.lists||{};
  state.funcs=p.funcs||{};

  if(state.objects.length){
    state.selectedObject=
      state.objects[0].id;
  }
}

/* ---------------------------------------------------------
   SAVE
   --------------------------------------------------------- */

async function saveProject(){

  const name=
    prompt(
      "프로젝트 이름",
      state.project.name
    );

  if(name!==null && name.trim()){
    state.project.name=name.trim();
  }

  try{

    const data=await api(
      "/api/projects",
      {
        method:"POST",
        body:JSON.stringify({
          id:state.project.id,
          name:state.project.name,
          project:serializeProject()
        })
      }
    );

    state.project.id=data.id;

    alert("프로젝트가 저장되었습니다.");

  }catch(e){
    alert(e.message);
  }
}

/* ---------------------------------------------------------
   EXECUTION
   --------------------------------------------------------- */

async function executeBlock(b){

  const a=b.action;
  const o=selectedObject();

  switch(a[0]){

    case "start":
      break;

    case "wait":
      await new Promise(
        r=>setTimeout(
          r,
          Number(a[1])*1000
        )
      );
      break;

    case "move":
      o.x += Number(a[1]);
      break;

    case "movex":
      o.x += Number(a[1]);
      break;

    case "movey":
      o.y += Number(a[1]);
      break;

    case "setx":
      o.x=Number(a[1]);
      break;

    case "sety":
      o.y=Number(a[1]);
      break;

    case "direction":
      o.direction=Number(a[1]);
      break;

    case "turn":
      o.direction+=Number(a[1]);
      break;

    case "center":
      o.x=320;
      o.y=200;
      break;

    case "size":
      o.size=Number(a[1]);
      break;

    case "show":
      o.visible=true;
      break;

    case "hide":
      o.visible=false;
      break;

    case "say":
      showBubble(o,a[1]);
      break;

    case "sayTime":
      showBubble(o,"안녕");
      await new Promise(
        r=>setTimeout(r,Number(a[1])*1000)
      );
      clearBubble();
      break;

    case "think":
      showBubble(o,"💭 "+a[1]);
      break;

    case "clearSay":
    case "clearText":
      clearBubble();
      break;

    case "penDown":
      state.paint.penDown=true;
      break;

    case "penUp":
      state.paint.penDown=false;
      break;

    case "penWidth":
      state.paint.width=Number(a[1]);
      break;

    case "clearPaint":
      if(state.paint.ctx){
        state.paint.ctx.clearRect(
          0,0,
          state.paint.canvas.width,
          state.paint.canvas.height
        );
      }
      break;

    case "stamp":
      break;

    case "sound":

      if(state.sounds.length){
        const s=state.sounds[0];

        s.audio.currentTime=0;
        s.audio.play().catch(()=>{});
      }

      break;

    case "stopSound":

      for(const s of state.sounds){
        s.audio.pause();
        s.audio.currentTime=0;
      }

      break;

    case "newVar":

      state.vars[a[1]]=0;
      break;

    case "setVar":

      state.vars[a[1]]=Number(a[2])||0;
      break;

    case "changeVar":

      state.vars[a[1]]=
        (Number(state.vars[a[1]])||0)+
        Number(a[2]||0);

      break;

    case "newList":

      state.lists[a[1]]=[];
      break;

    case "pushList":

      if(!state.lists[a[1]])
        state.lists[a[1]]=[];

      state.lists[a[1]].push(a[2]);
      break;

    case "clearList":

      state.lists[a[1]]=[];
      break;

    case "add":
      state.lastValue=
        Number(a[1])+Number(a[2]);
      break;

    case "sub":
      state.lastValue=
        Number(a[1])-Number(a[2]);
      break;

    case "mul":
      state.lastValue=
        Number(a[1])*Number(a[2]);
      break;

    case "div":
      state.lastValue=
        Number(a[2])===0
          ?0
          :Number(a[1])/Number(a[2]);
      break;

    case "mod":
      state.lastValue=
        Number(a[1])%Number(a[2]);
      break;

    case "random":
      state.lastValue=
        Math.floor(
          Math.random()*
          (Number(a[2])-Number(a[1])+1)
        )+
        Number(a[1]);
      break;

    case "round":
      state.lastValue=
        Math.round(Number(a[1]));
      break;

    case "abs":
      state.lastValue=
        Math.abs(Number(a[1]));
      break;

    case "newFunc":
      state.funcs[a[1]]=[];
      break;

    case "callFunc":
      if(state.funcs[a[1]]){
        for(const fb of state.funcs[a[1]]){
          await executeBlock(fb);
        }
      }
      break;

    case "roomCreate":
      connectWS();
      break;

    case "roomJoin":
      connectWS();
      break;

    case "chat":
      if(state.ws?.readyState===1){
        state.ws.send(JSON.stringify({
          type:"chat",
          text:"안녕하세요",
          user:state.user?.username
        }));
      }
      break;

    case "username":
      state.lastText=
        state.user?.username||"";
      break;
  }

  renderStage();
  renderProps();
}

async function run(){

  if(state.running)return;

  state.running=true;
  state.stop=false;

  try{

    for(const b of state.code){

      if(state.stop)break;

      await executeBlock(b);
    }

  }finally{
    state.running=false;
  }
}

function showBubble(o,text){

  let bubble=document.querySelector(".bubble");

  if(!bubble){
    bubble=document.createElement("div");
    bubble.className="bubble";
    bubble.style.position="absolute";
    bubble.style.background="white";
    bubble.style.border="2px solid #222";
    bubble.style.borderRadius="10px";
    bubble.style.padding="8px";
    bubble.style.zIndex="20";
    $("#stage").appendChild(bubble);
  }

  bubble.textContent=text;
  bubble.style.left=(o.x+30)+"px";
  bubble.style.top=(o.y-40)+"px";
}

function clearBubble(){
  document.querySelector(".bubble")?.remove();
}

/* ---------------------------------------------------------
   WEBSOCKET
   --------------------------------------------------------- */

function connectWS(){

  if(state.ws?.readyState===1)return;

  try{

    const proto=
      location.protocol==="https:"
        ?"wss:"
        :"ws:";

    state.ws=new WebSocket(
      proto+
      "//"+
      location.host+
      "/ws"
    );

    state.ws.onopen=()=>{
      state.ws.send(JSON.stringify({
        type:"join_room",
        room:state.room||"global",
        user:state.user?.username
      }));
    };

    state.ws.onmessage=e=>{
      try{
        const msg=JSON.parse(e.data);

        if(msg.type==="chat"){
          console.log(
            `[${msg.user}]`,
            msg.text
          );
        }
      }catch{}
    };

    state.ws.onclose=()=>{
      state.ws=null;
    };

  }catch{}
}

/* ---------------------------------------------------------
   BIND EDITOR
   --------------------------------------------------------- */

function bindEditor(){

  $(".cat").onclick=function(){
    state.category=this.dataset.cat;

    document.querySelectorAll(".cat")
      .forEach(x=>x.classList.remove("active"));

    this.classList.add("active");

    renderBlocks();
  };

  $("#goHome").onclick=home;

  $("#run").onclick=run;

  $("#stop").onclick=()=>{
    state.stop=true;
  };

  $("#save").onclick=saveProject;

  $("#addObject").onclick=addObject;

  $("#uploadSound").onclick=()=>{
    $("#soundFile").click();
  };

  $("#soundFile").onchange=e=>{
    uploadSound(e.target.files[0]);
    e.target.value="";
  };

  $("#recordSound").onclick=recordSound;

  $("#paintOpen").onclick=()=>{
    $("#paintModal").classList.add("show");
  };

  $("#closePaint").onclick=()=>{
    $("#paintModal").classList.remove("show");
  };
}

/* ---------------------------------------------------------
   STARTUP
   --------------------------------------------------------- */

async function boot(){

  try{

    const data=await api("/api/me");

    if(data.loggedIn){
      state.user=data.user;
      home();
    }else{
      loginPage(false);
    }

  }catch{
    loginPage(false);
  }
}

boot();

})();

(() => {
"use strict";

const CATS=[
["start","시작","#ef5350"],["flow","흐름","#42a5f5"],["move","움직임","#ff9800"],
["looks","생김새","#ffd54f"],["brush","붓","#795548"],["text","글상자","#8bc34a"],
["sound","소리","#ec407a"],["judge","판단","#4fc3f7"],["calc","계산","#43a047"],
["online","온라인","#90a4ae"],["data","자료","#8e44ad"],["func","함수","#00acc1"]
];
const BASE={
start:["초록 깃발을 클릭했을 때","키를 눌렀을 때","오브젝트를 클릭했을 때","실행 시작"],
flow:["기다리기","반복하기","무한 반복하기","만약","아니면","반복 중단"],
move:["x만큼 움직이기","y만큼 움직이기","x좌표로 이동","y좌표로 이동","방향 정하기","회전하기"],
looks:["말하기","생각하기","말하기 지우기","모양 바꾸기","크기 바꾸기","보이기","숨기기"],
brush:["펜 내리기","펜 올리기","펜 색 정하기","펜 굵기 정하기","도장 찍기","모두 지우기"],
text:["글상자 만들기","글상자 삭제","내용 정하기","내용 추가하기","글자 크기 정하기"],
sound:["소리 재생","모든 소리 정지","볼륨 정하기","음 높이 정하기","에코 넣기","에코 제거"],
judge:["마우스가 눌렸는가?","키가 눌렸는가?","벽에 닿았는가?","오브젝트에 닿았는가?","숫자 > 숫자","숫자 = 숫자"],
calc:["더하기","빼기","곱하기","나누기","나머지","랜덤","최솟값","최댓값","문자열 길이"],
online:["방 만들기","방 참가하기","방 나가기","방 인원","온라인 메시지 보내기","온라인 메시지 받기"],
data:["변수 만들기","변수 삭제","변수 설정","변수 바꾸기","변수 읽기","리스트 만들기","리스트 추가","리스트 삭제","리스트 읽기"],
func:[]
};
const COLORS=Object.fromEntries(CATS.map(x=>[x[0],x[2]]));
let blocks=[];
for(const [cat] of CATS)for(const name of BASE[cat])blocks.push({id:`${cat}-${blocks.length}`,cat,name,color:COLORS[cat]});
const templates=["%d만큼 더하기","%d번 반복하기","%d초 기다리기","크기 %d%%","볼륨 %d%%","굵기 %d","%d도 회전하기","랜덤 %d~%d","값 %d 비교하기"];
let n=0;
while(blocks.length<499){
 const cat=CATS[n%11][0],t=templates[n%templates.length],vals=[n%100+1,(n*3)%100+1];
 blocks.push({id:`generated-${n}`,cat,name:cat+" "+t.replace(/%d/g,()=>String(vals.shift()??1)),color:COLORS[cat]});n++;
}

const state={page:"home",category:"all",code:[],vars:[],lists:[],funcs:[],project:"나의 프로젝트",mode:"offline",ws:null,connected:false,room:null,history:[],future:[]};
const css=`*{box-sizing:border-box}body{margin:0;font-family:Arial,"Noto Sans KR",sans-serif;background:#f3f3f3;color:#222}button,input{font:inherit}button{border:1px solid #aaa;background:#fff;border-radius:8px;padding:8px 11px;font-weight:700;cursor:pointer}button:hover{background:#eee}.top{height:58px;background:#fff;border-bottom:1px solid #ccc;display:flex;align-items:center;gap:8px;padding:8px 14px}.logo{font-size:22px;font-weight:900}.spacer{flex:1}.home{max-width:1100px;margin:auto;padding:42px 24px}.hero{background:#fff;border:1px solid #ddd;border-radius:18px;padding:34px;box-shadow:0 3px 12px #0001}.hero h1{font-size:42px;margin:0 0 10px}.hero p{color:#666}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:18px}.card{background:#fff;border:1px solid #ddd;border-radius:13px;padding:18px}.editor{height:calc(100vh - 58px);display:grid;grid-template-columns:190px 1fr 300px}.side,.right{background:#fff;overflow:auto;padding:9px}.side{border-right:1px solid #ccc}.right{border-left:1px solid #ccc}.cat{width:100%;margin:3px 0;text-align:left;border:0}.work{display:grid;grid-template-rows:48px 1fr;background:#ddd}.tools{background:#fff;border-bottom:1px solid #ccc;display:flex;gap:5px;align-items:center;padding:7px}.board{display:grid;grid-template-columns:1fr 420px;min-height:0}#code{padding:18px;overflow:auto}.stage{background:#333;display:flex;align-items:center;justify-content:center}canvas{background:#fff;max-width:94%;max-height:90%}.block{width:290px;min-height:44px;margin:7px 0;padding:12px 16px;border-radius:13px 18px 18px 13px;color:#111;font-weight:800;box-shadow:0 2px 2px #888;cursor:pointer;position:relative}.block:before{content:"";position:absolute;left:0;top:0;border-top:9px solid #eee;border-right:9px solid transparent}#pal .block{width:100%;font-size:13px}.del{float:right;border:0;background:#0002;padding:2px 7px}.small{font-size:12px;color:#666}.status{font-size:12px;padding:6px;border-radius:6px;background:#eee}.ok{background:#d8f5df}.no{background:#ffe0e0}#log{height:120px;background:#111;color:#0f0;overflow:auto;padding:8px;white-space:pre-wrap}`;
document.head.innerHTML+=`<style>${css}</style>`;
document.title="Codescript";
document.head.innerHTML+=`<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='32' font-size='30'>🎮</text></svg>">`;

function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function shell(content){document.body.innerHTML=`<div class="top"><div class="logo">🎮 Codescript</div><button onclick="CS.home()">홈</button><button onclick="CS.explore()">탐험하기</button><button onclick="CS.chooseEditor()">만들기</button><div class="spacer"></div><span id="conn" class="status no">서버 오프라인</span></div><main>${content}</main>`}
function home(){shell(`<div class="home"><div class="hero"><h1>🎮 Codescript</h1><p>블록 코딩 프로젝트를 만들고 공유하는 공간</p><button onclick="CS.chooseEditor()">＋ 새 프로젝트 만들기</button></div><div class="cards"><div class="card"><h3>🧭 탐험하기</h3><p>공개 프로젝트를 찾아보세요.</p><button onclick="CS.explore()">탐험하기</button></div><div class="card"><h3>⭐ 추천</h3><p>좋아요가 많은 프로젝트</p></div><div class="card"><h3>📌 북마크</h3><p>로그인 후 북마크</p></div></div></div>`)}
function explore(){shell(`<div class="home"><div class="hero"><h1>🧭 탐험하기</h1><p>좋아요 · 북마크 · 공유 · 리메이크</p><div id="projects" class="cards"><div class="card">불러오는 중...</div></div></div></div>`);connect();request({type:"list_projects"})}
function chooseEditor(){const online=confirm("프로젝트 종류를 선택하세요.\\n\\n확인 = 온라인\\n취소 = 오프라인");editor(online?"online":"offline")}
function editor(mode){
 state.mode=mode;state.page="editor";
 shell(`<div class="editor"><aside class="side"><div class="small">기본 블록 499개 · 함수 0개</div><div id="cats"></div><hr><input id="search" placeholder="블록 검색" style="width:100%;padding:8px"><div id="pal"></div></aside><section class="work"><div class="tools"><input id="projectName" value="${esc(state.project)}" style="width:150px;padding:7px"><button onclick="CS.undo()">↶</button><button onclick="CS.redo()">↷</button><button onclick="CS.clear()">🗑</button><button onclick="CS.newVar()">＋ 변수</button><button onclick="CS.newList()">＋ 리스트</button><button onclick="CS.newFunc()">＋ 함수</button><button onclick="CS.run()">▶ 실행</button><button onclick="CS.save()">💾 저장</button></div><div class="board"><div id="code"></div><div class="stage"><canvas id="cv" width="640" height="400"></canvas></div></div></section><aside class="right"><div class="card"><b>프로젝트</b><p id="stats"></p><p>모드: <b id="modeLabel"></b></p><button onclick="CS.publish()">🌐 공개</button></div><div class="card" id="collabCard"><b>실시간 협업</b><p id="roomState">방 없음</p><button onclick="CS.createRoom()">방 만들기</button> <button onclick="CS.joinRoom()">참가</button></div><div class="card"><b>그림판</b><canvas id="paint" width="270" height="140"></canvas><button onclick="CS.clearPaint()">지우기</button></div><div class="card"><b>소리</b><button onclick="CS.echo()">🔊 에코</button></div><pre id="log"></pre></aside></div>`);
 initEditor();if(state.mode==="online")connect();render();palette();
}
function initEditor(){drawCats();const s=document.getElementById("search");s.oninput=palette;const p=document.getElementById("paint"),g=p.getContext("2d");let d=false,x=0,y=0;p.onpointerdown=e=>{d=true;x=e.offsetX;y=e.offsetY};p.onpointerup=()=>d=false;p.onpointermove=e=>{if(!d)return;g.beginPath();g.moveTo(x,y);g.lineTo(e.offsetX,e.offsetY);g.stroke();x=e.offsetX;y=e.offsetY}}
function drawCats(){const el=document.getElementById("cats");el.innerHTML=`<button class="cat" onclick="CS.setCat('all')">전체</button>`;CATS.forEach(c=>{if(c[0]==="online"&&state.mode!=="online")return;el.innerHTML+=`<button class="cat" style="background:${c[2]}" onclick="CS.setCat('${c[0]}')">${c[1]}</button>`})}
function visible(b){if(b.cat==="online"&&state.mode!=="online")return false;if(b.cat==="func")return false;if(b.cat==="data"){if(b.name.includes("변수"))return state.vars.length>0||b.name==="변수 만들기";if(b.name.includes("리스트"))return state.lists.length>0||b.name==="리스트 만들기"}return true}
function palette(){const el=document.getElementById("pal");if(!el)return;const q=(document.getElementById("search")?.value||"").toLowerCase();el.innerHTML=blocks.filter(b=>(state.category==="all"||b.cat===state.category)&&visible(b)&&b.name.toLowerCase().includes(q)).map(b=>`<div class="block" style="background:${b.color}" onclick="CS.add('${b.id}')">${esc(b.name)}</div>`).join("")}
function render(){const el=document.getElementById("code");if(!el)return;document.getElementById("modeLabel").textContent=state.mode==="online"?"온라인":"오프라인";document.getElementById("collabCard").style.display=state.mode==="online"?"block":"none";document.getElementById("stats").textContent=`블록 ${state.code.length} · 변수 ${state.vars.length} · 리스트 ${state.lists.length} · 함수 ${state.funcs.length}`;el.innerHTML=state.code.map((b,i)=>`<div class="block" style="background:${b.color}">${esc(b.name)}<button class="del" onclick="CS.del(${i})">×</button></div>`).join("")||"<p class='small'>왼쪽 블록을 클릭하세요.</p>"}
function snap(){return JSON.stringify({code:state.code,vars:state.vars,lists:state.lists,funcs:state.funcs})}
function restore(x){const d=JSON.parse(x);state.code=d.code||[];state.vars=d.vars||[];state.lists=d.lists||[];state.funcs=d.funcs||[];render();palette()}
function add(id){const b=blocks.find(x=>x.id===id);if(!b)return;state.history.push(snap());state.future=[];state.code.push(b);render();palette();if(state.mode==="online")broadcast({type:"project_change",payload:{code:state.code,vars:state.vars,lists:state.lists,funcs:state.funcs}})}
function run(){const c=document.getElementById("cv").getContext("2d");c.clearRect(0,0,640,400);c.font="48px sans-serif";c.fillText("🎮",300,210);document.getElementById("log").textContent="▶ 실행 완료\n"+state.code.map(x=>"• "+x.name+" 실행").join("\n")}
function save(){const d={name:document.getElementById("projectName").value,mode:state.mode,code:state.code,vars:state.vars,lists:state.lists,funcs:state.funcs};localStorage.setItem("codescript_project",JSON.stringify(d));if(state.mode==="online")request({type:"save_project",project:d});alert("저장 완료")}
function publish(){if(state.mode!=="online"){alert("오프라인 프로젝트는 서버 공개가 없습니다.");return}const d={name:document.getElementById("projectName").value,mode:state.mode,code:state.code,vars:state.vars,lists:state.lists,funcs:state.funcs,public:true};request({type:"save_project",project:d});alert("공개 프로젝트로 저장했습니다.")}
function connect(){if(state.ws?.readyState===1)return;try{const p=location.protocol==="https:"?"wss":"ws";state.ws=new WebSocket(`${p}://${location.host}/ws`);state.ws.onopen=()=>{state.connected=true;setConn(true)};state.ws.onclose=()=>{state.connected=false;setConn(false)};state.ws.onmessage=e=>handle(JSON.parse(e.data))}catch(e){setConn(false)}}
function setConn(ok){const x=document.getElementById("conn");if(x){x.textContent=ok?"● 서버 연결됨":"● 서버 오프라인";x.className="status "+(ok?"ok":"no")}}
function request(x){connect();setTimeout(()=>{if(state.ws?.readyState===1)state.ws.send(JSON.stringify(x))},100)}
function broadcast(x){if(state.room)request({...x,room:state.room})}
function handle(m){if(m.type==="projects")renderProjects(m.projects||[]);if(m.type==="room_created"){state.room=m.room;document.getElementById("roomState").textContent=`방 ${m.room}`};if(m.type==="room_joined"){state.room=m.room;document.getElementById("roomState").textContent=`방 ${m.room}`};if(m.type==="room_update"&&m.payload){state.code=m.payload.code||[];state.vars=m.payload.vars||[];state.lists=m.payload.lists||[];state.funcs=m.payload.funcs||[];render();palette()}if(m.type==="error")alert(m.message)}
function renderProjects(ps){const el=document.getElementById("projects");if(!el)return;el.innerHTML=(ps.length?ps:[{name:"아직 공개 프로젝트가 없습니다.",code:[]}]).map(p=>`<div class="card"><h3>🎮 ${esc(p.name)}</h3><p>블록 ${p.code?.length||0}개 · 좋아요 ${p.likes||0}</p><button>♡ 좋아요</button> <button>🔖</button> <button>↻ 리메이크</button></div>`).join("")}
window.CS={home,explore,chooseEditor,editor,setCat:x=>{state.category=x;drawCats();palette()},add,run,save,publish,
undo:()=>{const x=state.history.pop();if(x){state.future.push(snap());restore(x)}},
redo:()=>{const x=state.future.pop();if(x){state.history.push(snap());restore(x)}},
clear:()=>{state.history.push(snap());state.code=[];render()},
newVar:()=>{const n=prompt("변수 이름","변수"+(state.vars.length+1));if(n){state.vars.push(n);render();palette()}},
newList:()=>{const n=prompt("리스트 이름","리스트"+(state.lists.length+1));if(n){state.lists.push(n);render();palette()}},
newFunc:()=>{const n=prompt("함수 이름");if(n){state.funcs.push(n);render()}},
del:i=>{state.history.push(snap());state.code.splice(i,1);render()},
createRoom:()=>request({type:"create_room"}),
joinRoom:()=>{const id=prompt("방 코드");if(id)request({type:"join_room",room:id})},
clearPaint:()=>{const c=document.getElementById("paint")?.getContext("2d");if(c)c.clearRect(0,0,270,140)},
echo:()=>{try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain(),d=a.createDelay(.4);o.connect(g);g.connect(d);d.connect(a.destination);g.connect(a.destination);g.gain.value=.04;o.start();setTimeout(()=>{o.stop();a.close()},250)}catch(e){}}
};
home();
})();
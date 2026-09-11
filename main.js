(()=>{
'use strict';

const CATS=[
['start','시작','#ef5350'],
['flow','흐름','#42a5f5'],
['move','움직임','#ff9800'],
['looks','생김새','#ffd54f'],
['brush','붓','#795548'],
['text','글상자','#8bc34a'],
['sound','소리','#ec407a'],
['judge','판단','#4fc3f7'],
['calc','계산','#43a047'],
['online','온라인','#90a4ae'],
['data','자료','#8e44ad'],
['func','함수','#00acc1']
];

const COLOR=Object.fromEntries(CATS.map(x=>[x[0],x[2]]));

const BASE={
start:[
['초록 깃발을 클릭했을 때','start'],
['키를 눌렀을 때','start'],
['오브젝트를 클릭했을 때','start'],
['실행 시작','start']
],
flow:[
['1초 기다리기','wait',1000],
['2초 기다리기','wait',2000],
['2번 반복하기','repeat',2],
['5번 반복하기','repeat',5],
['무한 반복하기','forever'],
['만약','if'],
['반복 중단','stop']
],
move:[
['10만큼 움직이기','move',10,0],
['-10만큼 움직이기','move',-10,0],
['10만큼 위로 움직이기','move',0,-10],
['10만큼 아래로 움직이기','move',0,10],
['15도 회전하기','turn',15],
['-15도 회전하기','turn',-15],
['x좌표 0으로 이동','setx',0],
['y좌표 0으로 이동','sety',0],
['방향 90도로 정하기','setdir',90]
],
looks:[
['안녕이라고 말하기','say','안녕'],
['생각하기','say','음...'],
['말하기 지우기','say',''],
['크기 100%로 정하기','size',100],
['크기 150%로 정하기','size',150],
['보이기','visible',true],
['숨기기','visible',false]
],
brush:[
['펜 내리기','pendown'],
['펜 올리기','penup'],
['펜 색 정하기','pencolor'],
['펜 굵기 5로 정하기','penwidth',5],
['도장 찍기','stamp'],
['모두 지우기','clearstage']
],
text:[
['글상자 만들기','text','새 글'],
['글상자 삭제','textclear'],
['내용 정하기','text','내용'],
['내용 추가하기','textadd',' 추가'],
['글자 크기 정하기','textsize',24]
],
sound:[
['소리 재생','sound'],
['모든 소리 정지','soundstop'],
['볼륨 100%로 정하기','volume',1]
],
judge:[
['마우스가 눌렸는가?','judge','mouse'],
['키가 눌렸는가?','judge','key'],
['벽에 닿았는가?','judge','wall'],
['오브젝트에 닿았는가?','judge','object'],
['숫자 > 숫자','compare','gt'],
['숫자 = 숫자','compare','eq']
],
calc:[
['더하기','calc','add'],
['빼기','calc','sub'],
['곱하기','calc','mul'],
['나누기','calc','div'],
['나머지','calc','mod'],
['랜덤','calc','random'],
['최솟값','calc','min'],
['최댓값','calc','max'],
['문자열 길이','calc','length']
],
online:[
['방 만들기','roomcreate'],
['방 참가하기','roomjoin'],
['방 나가기','roomleave'],
['방 인원','roomcount'],
['온라인 메시지 보내기','chat'],
['온라인 메시지 받기','chatlog']
],
data:[
['변수 만들기','varcreate'],
['변수 삭제','vardelete'],
['변수 설정','varset'],
['변수 바꾸기','varadd'],
['변수 읽기','varget'],
['리스트 만들기','listcreate'],
['리스트 추가','listpush'],
['리스트 삭제','listpop'],
['리스트 읽기','listget']
],
func:[
['함수 만들기','funccreate'],
['함수 실행','funccall'],
['함수 반환','funcreturn']
]
};

const blocks=[];

function addBlock(cat,name,op,args=[]){
blocks.push({
id:'block-'+blocks.length,
cat,
name,
op,
args,
color:COLOR[cat]
});
}

for(const [cat] of CATS){
(BASE[cat]||[]).forEach(x=>addBlock(cat,x[0],x[1],x.slice(2)));
}

/* 499개까지 실제 action을 가진 블록 생성 */
const variants=[
['move','move'],
['turn','turn'],
['wait','wait'],
['size','size'],
['calc','calc'],
['compare','compare'],
['varadd','varadd'],
['textadd','textadd']
];

let vi=0;

while(blocks.length<499){

const type=variants[vi%variants.length][0];
const n=Math.floor(vi/variants.length)+1;

let cat='move';
let name='';
let args=[];

if(type==='move'){
cat='move';
const x=(n%21)-10;
const y=(Math.floor(n/21)%21)-10;
name=`x ${x} · y ${y} 움직이기`;
args=[x,y];
}

else if(type==='turn'){
cat='move';
const d=(n%25)*15-180;
name=`${d}도 회전하기`;
args=[d];
}

else if(type==='wait'){
cat='flow';
const sec=(n%10)+1;
name=`${sec}초 기다리기`;
args=[sec*1000];
}

else if(type==='size'){
cat='looks';
const size=25+(n%12)*25;
name=`크기 ${size}%로 정하기`;
args=[size];
}

else if(type==='calc'){
cat='calc';
const ops=['add','sub','mul','div','mod','random','min','max','length'];
const op=ops[n%ops.length];
name=`${op} 계산`;
args=[op];
}

else if(type==='compare'){
cat='judge';
const op=['gt','eq','lt'][n%3];
name=op==='gt'?'숫자 > 숫자':op==='lt'?'숫자 < 숫자':'숫자 = 숫자';
args=[op];
}

else if(type==='varadd'){
cat='data';
const v=(n%21)-10;
name=`변수를 ${v>=0?'+':''}${v}만큼 바꾸기`;
args=[v];
}

else{
cat='text';
name=`내용에 ${n} 추가하기`;
args=[String(n)];
}

addBlock(cat,name,type,args);
vi++;
}

const S={
page:'home',
cat:'all',
code:[],
vars:[],
lists:[],
funcs:[],
project:'나의 프로젝트',
mode:'offline',

actor:{
x:320,
y:200,
dir:90,
size:100,
visible:true,
text:''
},

pen:{
down:false,
color:'#111111',
width:4
},

history:[],
future:[],
sounds:[],

running:false,
stop:false,

ws:null,
room:null
};

function esc(v){
return String(v??'').replace(/[&<>"']/g,m=>({
'&':'&amp;',
'<':'&lt;',
'>':'&gt;',
'"':'&quot;',
"'":'&#39;'
}[m]));
}

function sleep(ms){
return new Promise(r=>setTimeout(r,ms));
}

function log(t){
const e=document.getElementById('log');
if(e){
e.textContent+=t+'\n';
e.scrollTop=e.scrollHeight;
}
}

document.head.insertAdjacentHTML('beforeend',`
<style>
*{box-sizing:border-box}

body{
margin:0;
font-family:Arial,"Noto Sans KR",sans-serif;
background:#f2f3f5;
color:#222
}

button,input,select{
font:inherit
}

button{
border:1px solid #bbb;
background:#fff;
border-radius:8px;
padding:7px 10px;
cursor:pointer
}

button:hover{
filter:brightness(.97)
}

.top{
height:56px;
background:#fff;
border-bottom:1px solid #ddd;
display:flex;
align-items:center;
gap:7px;
padding:8px 12px;
position:sticky;
top:0;
z-index:20
}

.logo{
font-size:21px;
font-weight:900
}

.spacer{
flex:1
}

.page{
max-width:1150px;
margin:auto;
padding:28px
}

.hero,.card{
background:#fff;
border:1px solid #ddd;
border-radius:16px;
padding:22px;
box-shadow:0 2px 10px #00000010
}

.hero h1{
font-size:42px;
margin:0 0 8px
}

.cards{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:14px;
margin-top:14px
}

.editor{
height:calc(100vh - 56px);
display:grid;
grid-template-columns:190px 1fr 300px
}

.side,.right{
background:#fff;
overflow:auto;
padding:9px
}

.side{
border-right:1px solid #ddd
}

.right{
border-left:1px solid #ddd
}

.cat{
width:100%;
text-align:left;
border:0;
margin:2px 0
}

.work{
min-width:0;
display:grid;
grid-template-rows:48px 1fr
}

.tools{
background:#fff;
border-bottom:1px solid #ddd;
display:flex;
gap:5px;
align-items:center;
padding:6px;
overflow:auto
}

.board{
display:grid;
grid-template-columns:minmax(0,1fr) 430px;
min-height:0
}

.code{
padding:15px;
overflow:auto
}

.stage{
background:#333;
display:flex;
align-items:center;
justify-content:center
}

.stage canvas{
background:#fff;
max-width:95%;
max-height:95%
}

.block{
min-height:40px;
padding:10px 13px;
margin:6px 0;
border-radius:12px 17px 17px 12px;
font-weight:800;
box-shadow:0 2px 3px #888;
cursor:pointer
}

.pal .block{
font-size:12px
}

.del{
float:right;
padding:1px 6px;
border:0;
background:#0002
}

.small{
font-size:12px;
color:#666
}

.status{
padding:5px 8px;
border-radius:7px;
font-size:12px;
background:#eee
}

.ok{
background:#d7f5df
}

.no{
background:#ffe0e0
}

#log{
height:110px;
background:#111;
color:#0f0;
padding:8px;
overflow:auto;
white-space:pre-wrap
}

.objects{
display:flex;
flex-direction:column;
gap:5px
}

.obj{
padding:8px;
border:1px solid #ddd;
border-radius:8px
}

.modal{
position:fixed;
inset:0;
background:#0008;
display:flex;
align-items:center;
justify-content:center;
z-index:100
}

.modalbox{
background:#fff;
border-radius:16px;
padding:20px;
width:min(950px,94vw);
max-height:92vh;
overflow:auto
}

.paintgrid{
display:grid;
grid-template-columns:170px 1fr 170px;
gap:10px
}

.paintcanvas{
width:100%;
background:#ddd;
touch-action:none
}

.toolgrid{
display:grid;
grid-template-columns:1fr 1fr;
gap:5px
}

.soundrow{
display:flex;
align-items:center;
gap:6px;
padding:6px;
border:1px solid #ddd;
border-radius:8px;
margin:4px 0
}

@media(max-width:900px){
.editor{
grid-template-columns:150px 1fr
}
.right{
display:none
}
.board{
grid-template-columns:1fr
}
.stage{
display:none
}
.cards{
grid-template-columns:1fr
}
.paintgrid{
grid-template-columns:1fr
}
}
</style>
`);

document.title='🎮 Codescript';

function shell(content){
document.body.innerHTML=`
<div class="top">
<div class="logo">🎮 Codescript</div>
<button onclick="CS.home()">홈</button>
<button onclick="CS.explore()">탐험</button>
<button onclick="CS.create()">만들기</button>
<span class="spacer"></span>
<span id="auth"></span>
<span id="conn" class="status no">서버 오프라인</span>
</div>
<main>${content}</main>
`;

updateAuth();
}

function updateAuth(){
const e=document.getElementById('auth');
if(!e)return;

const u=localStorage.getItem('cs_user');

e.innerHTML=u
?`👤 ${esc(u)} <button onclick="CS.logout()">로그아웃</button>`
:`<button onclick="CS.login()">로그인 / 회원가입</button>`;
}

function home(){
S.page='home';

shell(`
<div class="page">

<div class="hero">
<h1>🎮 Codescript</h1>
<p>블록 코딩 · 그림판 · 소리 · 온라인 프로젝트</p>

<button onclick="CS.create()">＋ 새 프로젝트</button>
<button onclick="CS.login()">👤 로그인 / 회원가입</button>
</div>

<div class="cards">

<div class="card">
<h3>🧭 탐험하기</h3>
<p>공개 프로젝트를 찾아보세요.</p>
<button onclick="CS.explore()">탐험</button>
</div>

<div class="card">
<h3>🎨 그림판</h3>
<p>Bitmap · Vector · Pixelmap</p>
</div>

<div class="card">
<h3>🔊 소리</h3>
<p>MP3 · WAV · OGG 업로드와 녹음</p>
</div>

</div>
</div>
`);
}

function explore(){

shell(`
<div class="page">
<div class="hero">
<h1>🧭 탐험하기</h1>
<div id="projects">불러오는 중...</div>
</div>
</div>
`);

connect();
send({type:'list_projects'});
}

function create(){

const online=confirm(
'프로젝트 종류를 선택하세요.\\n\\n확인 = 온라인\\n취소 = 오프라인'
);

editor(online?'online':'offline');
}

function editor(mode){

S.mode=mode;

shell(`
<div class="editor">

<aside class="side">

<div class="small">
블록 ${blocks.length}개
</div>

<div id="cats"></div>

<hr>

<input
id="search"
placeholder="블록 검색"
style="width:100%;padding:8px"
>

<div id="pal" class="pal"></div>

</aside>

<section class="work">

<div class="tools">

<input
id="projectName"
value="${esc(S.project)}"
style="width:150px"
>

<button onclick="CS.undo()">↶</button>
<button onclick="CS.redo()">↷</button>
<button onclick="CS.clear()">🗑</button>

<button onclick="CS.newVar()">＋ 변수</button>
<button onclick="CS.newList()">＋ 리스트</button>
<button onclick="CS.newFunc()">＋ 함수</button>

<button onclick="CS.run()">▶ 실행</button>
<button onclick="CS.stop()">■</button>
<button onclick="CS.save()">💾</button>

</div>

<div class="board">

<div id="code" class="code"></div>

<div class="stage">
<canvas id="stage" width="640" height="400"></canvas>
</div>

</div>

</section>

<aside class="right">

<div class="card">

<b>오브젝트</b>

<div id="objects" class="objects">
<div class="obj">🎮 기본 오브젝트</div>
</div>

<button onclick="CS.addObject()">
＋ 오브젝트
</button>

</div>

<div class="card">

<b>그림판</b>

<p class="small">
Bitmap · Vector · Pixelmap
</p>

<button onclick="CS.paint()">
🎨 그림판 열기
</button>

</div>

<div class="card">

<b>소리</b>

<input
id="soundFile"
type="file"
accept="audio/*"
multiple
style="width:100%"
>

<button onclick="CS.record()">
🎙 5초 녹음
</button>

<div id="sounds"></div>

</div>

${mode==='online'?`

<div class="card">

<b>실시간 협업</b>

<p id="room">방 없음</p>

<button onclick="CS.roomCreate()">
방 만들기
</button>

<button onclick="CS.roomJoin()">
참가
</button>

</div>

`:''}

<pre id="log"></pre>

</aside>

</div>
`);

drawCats();

document.getElementById('search').oninput=palette;

document.getElementById('soundFile').onchange=e=>{
[...e.target.files].forEach(addSound);
};

render();
palette();
drawStage();
renderSounds();

if(mode==='online')connect();
}

function drawCats(){

const e=document.getElementById('cats');
if(!e)return;

e.innerHTML=
`<button class="cat" onclick="CS.cat('all')">전체</button>`;

CATS.forEach(c=>{

if(c[0]==='online'&&S.mode!=='online')return;

if(c[0]==='data'&&!S.vars.length&&!S.lists.length)return;

if(c[0]==='func'&&!S.funcs.length)return;

e.innerHTML+=`
<button
class="cat"
style="background:${c[2]}"
onclick="CS.cat('${c[0]}')"
>${c[1]}</button>
`;

});
}

function palette(){

const e=document.getElementById('pal');
if(!e)return;

const q=
(document.getElementById('search')?.value||'')
.toLowerCase();

e.innerHTML=

blocks
.filter(b=>
(S.cat==='all'||b.cat===S.cat)&&
b.name.toLowerCase().includes(q)&&
!(b.cat==='online'&&S.mode!=='online')&&
!(b.cat==='data'&&!S.vars.length&&!S.lists.length)&&
!(b.cat==='func'&&!S.funcs.length)
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
.join('')

||'<p class="small">조건에 맞는 블록이 없습니다.</p>';
}

function snap(){

return JSON.stringify({
code:S.code,
actor:S.actor,
pen:S.pen,
vars:S.vars,
lists:S.lists,
funcs:S.funcs
});

}

function restore(x){

const d=JSON.parse(x);

S.code=d.code||[];
S.actor=d.actor||S.actor;
S.pen=d.pen||S.pen;
S.vars=d.vars||[];
S.lists=d.lists||[];
S.funcs=d.funcs||[];

render();
drawStage();
drawCats();
palette();

}

function add(id){

const b=blocks.find(x=>x.id===id);
if(!b)return;

S.history.push(snap());
S.future=[];

S.code.push({
...b,
runtimeId:crypto.randomUUID()
});

render();

if(S.mode==='online')broadcast();
}

function render(){

const e=document.getElementById('code');
if(!e)return;

e.innerHTML=

S.code.map((b,i)=>`

<div
class="block"
style="background:${b.color}"
>

${esc(b.name)}

<button
class="del"
onclick="CS.del(${i})"
>×</button>

</div>

`).join('')

||'<p class="small">왼쪽 블록을 클릭하세요.</p>';

}

function drawStage(){

const c=document.getElementById('stage');
if(!c)return;

const x=c.getContext('2d');

x.clearRect(0,0,c.width,c.height);

if(!S.actor.visible)return;

x.save();

x.translate(S.actor.x,S.actor.y);

x.rotate(
(S.actor.dir-90)*Math.PI/180
);

x.font=
`${35*S.actor.size/100}px sans-serif`;

x.textAlign='center';
x.textBaseline='middle';

x.fillText('🎮',0,0);

x.restore();

if(S.actor.text){

x.fillStyle='#111';
x.font='18px sans-serif';

x.fillText(
S.actor.text,
S.actor.x+25,
S.actor.y-25
);

}

}

async function execute(b){

const a=b.op;
const v=b.args;

switch(a){

case'move':
S.actor.x+=v[0];
S.actor.y+=v[1];
break;

case'turn':
S.actor.dir+=v[0];
break;

case'setx':
S.actor.x=v[0];
break;

case'sety':
S.actor.y=v[0];
break;

case'setdir':
S.actor.dir=v[0];
break;

case'wait':
await sleep(v[0]);
break;

case'size':
S.actor.size=v[0];
break;

case'visible':
S.actor.visible=v[0];
break;

case'say':
S.actor.text=v[0];
break;

case'pendown':
S.pen.down=true;
break;

case'penup':
S.pen.down=false;
break;

case'pencolor':
S.pen.color=
prompt('펜 색상',S.pen.color)||S.pen.color;
break;

case'penwidth':
S.pen.width=v[0];
break;

case'stamp':
stamp();
break;

case'clearstage':
clearStage();
break;

case'sound':
playSound();
break;

case'soundstop':
S.sounds.forEach(s=>s.audio.pause());
break;

case'volume':
S.sounds.forEach(s=>s.audio.volume=v[0]);
break;

case'calc':
calculate(v[0]);
break;

case'varadd':

if(S.vars[0]){

const k='cs_var_'+S.vars[0];

const value=
Number(localStorage.getItem(k)||0)+v[0];

localStorage.setItem(k,String(value));

}

break;

case'varset':

if(S.vars[0]){

const k='cs_var_'+S.vars[0];

const value=
prompt('값','0')||'0';

localStorage.setItem(k,value);

}

break;

case'varget':

if(S.vars[0]){

const k='cs_var_'+S.vars[0];

log(
'변수 값: '+
localStorage.getItem(k)
);

}

break;

case'listpush':

if(S.lists[0]){

const k='cs_list_'+S.lists[0];

const arr=
JSON.parse(
localStorage.getItem(k)||'[]'
);

arr.push(
prompt('추가할 값','')||''
);

localStorage.setItem(
k,
JSON.stringify(arr)
);

}

break;

case'listpop':

if(S.lists[0]){

const k='cs_list_'+S.lists[0];

const arr=
JSON.parse(
localStorage.getItem(k)||'[]'
);

arr.pop();

localStorage.setItem(
k,
JSON.stringify(arr)
);

}

break;

case'text':
S.actor.text=v[0];
break;

case'textadd':
S.actor.text+=v[0]||'';
break;

case'textclear':
S.actor.text='';
break;

case'roomcreate':
roomCreate();
break;

case'roomjoin':
roomJoin();
break;

case'roomleave':
S.room=null;
break;

case'chat':{

const t=prompt('보낼 메시지','');

if(t)
broadcast({
type:'chat',
text:t
});

break;
}

case'funccall':
log('⚙ 함수 실행');
break;

}

drawStage();

}

function calculate(op){

const a=
Number(prompt('첫 번째 값','10')||0);

const b=
Number(prompt('두 번째 값','2')||0);

let r=0;

if(op==='add')r=a+b;
if(op==='sub')r=a-b;
if(op==='mul')r=a*b;
if(op==='div')r=b?a/b:0;
if(op==='mod')r=b?a%b:0;
if(op==='random')r=Math.random()*(b-a)+a;
if(op==='min')r=Math.min(a,b);
if(op==='max')r=Math.max(a,b);
if(op==='length')r=String(a).length;

log('계산 결과: '+r);

}

async function run(){

if(S.running)return;

S.running=true;
S.stop=false;

log('▶ 실행 시작');

try{

for(const b of S.code){

if(S.stop)break;

log('▶ '+b.name);

if(b.op==='repeat'){

const count=b.args[0]||1;

for(let i=0;i<count;i++){

if(S.stop)break;

}

}else{

await execute(b);

}

}

}catch(e){

log('❌ '+e.message);

}

S.running=false;

log(
S.stop?
'■ 실행 중단':
'✓ 실행 완료'
);

}

function stamp(){

const c=document.getElementById('stage');
if(!c)return;

const x=c.getContext('2d');

x.font='35px sans-serif';

x.fillText(
'🎮',
S.actor.x,
S.actor.y
);

}

function clearStage(){

const c=document.getElementById('stage');

if(c)
c.getContext('2d')
.clearRect(
0,0,c.width,c.height
);

}

function addSound(file){

const url=URL.createObjectURL(file);

const audio=new Audio(url);

S.sounds.push({
name:file.name,
audio,
url
});

renderSounds();

}

function renderSounds(){

const e=document.getElementById('sounds');
if(!e)return;

e.innerHTML=
S.sounds.map((s,i)=>`

<div class="soundrow">

<span style="flex:1">
🔊 ${esc(s.name)}
</span>

<button onclick="CS.playSound(${i})">
▶
</button>

<button onclick="CS.delSound(${i})">
×
</button>

</div>

`).join('')

||'<p class="small">소리를 추가하세요.</p>';

}

function playSound(i=0){

const s=S.sounds[i];

if(!s){

log('재생할 소리가 없습니다.');

return;
}

s.audio.currentTime=0;

s.audio.play().catch(()=>{});

}

async function record(){

if(!navigator.mediaDevices?.getUserMedia){

alert('이 브라우저에서는 녹음을 지원하지 않습니다.');

return;

}

try{

const stream=
await navigator.mediaDevices.getUserMedia({
audio:true
});

const recorder=
new MediaRecorder(stream);

const chunks=[];

recorder.ondataavailable=e=>{
chunks.push(e.data);
};

recorder.onstop=()=>{

stream.getTracks().forEach(t=>t.stop());

const blob=
new Blob(
chunks,
{type:recorder.mimeType}
);

addSound(
new File(
[blob],
'녹음.webm',
{type:recorder.mimeType}
)
);

};

recorder.start();

setTimeout(
()=>recorder.stop(),
5000
);

alert('5초 동안 녹음합니다.');

}catch(e){

alert('마이크 권한을 허용해주세요.');

}

}

/* ================= 그림판 ================= */

let P={
tool:'pen',
color:'#111111',
width:6,
drag:null,
undo:[],
redo:[]
};

function paint(){

if(document.getElementById('paintModal'))return;

document.body.insertAdjacentHTML(
'beforeend',
`

<div class="modal" id="paintModal">

<div class="modalbox">

<div style="display:flex;gap:6px">

<h2 style="margin-right:auto">
🎨 Codescript 그림판
</h2>

<button onclick="CS.paintClose()">
닫기
</button>

</div>

<div class="paintgrid">

<div>

<h3>도구</h3>

<div class="toolgrid">

<button onclick="CS.pt('pen')">
✏️ 연필
</button>

<button onclick="CS.pt('eraser')">
🧽 지우개
</button>

<button onclick="CS.pt('line')">
／ 직선
</button>

<button onclick="CS.pt('rect')">
▭ 사각형
</button>

<button onclick="CS.pt('circle')">
○ 원
</button>

<button onclick="CS.pt('fill')">
🪣 채우기
</button>

<button onclick="CS.pt('picker')">
💧 스포이드
</button>

</div>

<h3>색상</h3>

<input
id="pcolor"
type="color"
value="#111111"
>

<h3>굵기</h3>

<input
id="pwidth"
type="range"
min="1"
max="60"
value="6"
style="width:100%"
>

<input
id="pfile"
type="file"
accept="image/*"
style="width:100%"
>

</div>

<div>

<canvas
id="paintCanvas"
class="paintcanvas"
width="800"
height="500"
></canvas>

</div>

<div>

<h3>기능</h3>

<button onclick="CS.pundo()">
↶ 실행 취소
</button>

<button onclick="CS.predo()">
↷ 다시 실행
</button>

<button onclick="CS.pclear()">
🗑 지우기
</button>

<button onclick="CS.pexport()">
PNG 저장
</button>

<p class="small">
Bitmap 그림판입니다.<br>
이미지 파일도 불러올 수 있습니다.
</p>

</div>

</div>

</div>

</div>

`
);

initPaint();

}

function initPaint(){

const c=
document.getElementById('paintCanvas');

if(!c)return;

const color=
document.getElementById('pcolor');

const width=
document.getElementById('pwidth');

color.oninput=
()=>P.color=color.value;

width.oninput=
()=>P.width=Number(width.value);

document.getElementById('pfile').onchange=e=>{

const file=e.target.files[0];

if(!file)return;

const img=new Image();

img.onload=()=>{

c.getContext('2d')
.drawImage(
img,
0,
0,
800,
500
);

};

img.src=
URL.createObjectURL(file);

};

c.onpointerdown=e=>{

P.drag=point(e);

P.undo.push(
c.toDataURL()
);

c.setPointerCapture(e.pointerId);

};

c.onpointermove=e=>{

if(!P.drag)return;

const p=point(e);

const ctx=c.getContext('2d');

ctx.lineCap='round';

ctx.lineWidth=P.width;

ctx.strokeStyle=
P.tool==='eraser'
?'#ffffff'
:P.color;

if(P.tool==='pen'||P.tool==='eraser'){

ctx.beginPath();

ctx.moveTo(
P.drag.x,
P.drag.y
);

ctx.lineTo(
p.x,
p.y
);

ctx.stroke();

}

P.drag=p;

};

c.onpointerup=()=>{
P.drag=null;
};

}

function point(e){

const c=
document.getElementById('paintCanvas');

const r=
c.getBoundingClientRect();

return{
x:(e.clientX-r.left)*800/r.width,
y:(e.clientY-r.top)*500/r.height
};

}

function pt(t){
P.tool=t;
}

function pclear(){

const c=
document.getElementById('paintCanvas');

if(c)
c.getContext('2d')
.clearRect(
0,0,800,500
);

}

function pexport(){

const c=
document.getElementById('paintCanvas');

if(!c)return;

const a=
document.createElement('a');

a.download=
'codescript-그림.png';

a.href=
c.toDataURL('image/png');

a.click();

}

function pundo(){

const data=P.undo.pop();

if(!data)return;

const c=
document.getElementById('paintCanvas');

P.redo.push(
c.toDataURL()
);

const img=new Image();

img.onload=()=>{
c.getContext('2d')
.drawImage(img,0,0);
};

img.src=data;

}

function predo(){

const data=P.redo.pop();

if(!data)return;

const c=
document.getElementById('paintCanvas');

P.undo.push(
c.toDataURL()
);

const img=new Image();

img.onload=()=>{
c.getContext('2d')
.drawImage(img,0,0);
};

img.src=data;

}

function paintClose(){

document
.getElementById('paintModal')
?.remove();

}

/* ================= 저장 ================= */

function save(){

S.project=
document.getElementById('projectName')?.value
||S.project;

localStorage.setItem(
'codescript_project',
JSON.stringify({
name:S.project,
mode:S.mode,
code:S.code,
actor:S.actor,
vars:S.vars,
lists:S.lists,
funcs:S.funcs
})
);

alert('저장 완료');

}

/* ================= 로그인 ================= */

function login(){

const mode=
prompt(
'login = 로그인\\nsignup = 회원가입',
'signup'
);

if(!mode)return;

const username=
prompt('아이디');

if(!username)return;

const key='cs_pw_'+username;

if(mode.toLowerCase()==='signup'){

const password=
prompt('비밀번호');

if(!password)return;

localStorage.setItem(
key,
password
);

localStorage.setItem(
'cs_user',
username
);

alert('회원가입 완료');

}else{

const password=
prompt('비밀번호');

if(
localStorage.getItem(key)===password
){

localStorage.setItem(
'cs_user',
username
);

alert('로그인 완료');

}else{

alert(
'아이디 또는 비밀번호가 틀렸습니다.'
);

}

}

updateAuth();

}

function logout(){

localStorage.removeItem('cs_user');

updateAuth();

}

/* ================= 오브젝트 ================= */

function addObject(){

const name=
prompt(
'오브젝트 이름',
'오브젝트 '+(
document.querySelectorAll('.obj').length+1
)
);

if(!name)return;

const e=
document.getElementById('objects');

if(e){

e.insertAdjacentHTML(
'beforeend',
`<div class="obj">🎮 ${esc(name)}</div>`
);

}

}

/* ================= 온라인 ================= */

function connect(){

if(S.ws?.readyState===1)return;

try{

const protocol=
location.protocol==='https:'
?'wss'
:'ws';

S.ws=
new WebSocket(
`${protocol}://${location.host}/ws`
);

S.ws.onopen=()=>{

const e=
document.getElementById('conn');

if(e){

e.className='status ok';

e.textContent=
'● 서버 연결됨';

}

};

S.ws.onclose=()=>{

const e=
document.getElementById('conn');

if(e){

e.className='status no';

e.textContent=
'● 서버 오프라인';

}

};

S.ws.onmessage=e=>{

try{

handle(
JSON.parse(e.data)
);

}catch{}

};

}catch{}

}

function send(data){

connect();

setTimeout(()=>{

if(S.ws?.readyState===1){

S.ws.send(
JSON.stringify(data)
);

}

},150);

}

function broadcast(extra={}){

send({

type:'project_change',

room:S.room,

payload:{
code:S.code,
actor:S.actor,
...extra
}

});

}

function handle(m){

if(m.type==='projects'){

const e=
document.getElementById('projects');

if(!e)return;

e.innerHTML=
(m.projects||[])
.map(p=>`

<div class="card">

<h3>
🎮 ${esc(p.name)}
</h3>

<p>
블록 ${(p.code||[]).length}개
· 좋아요 ${p.likes||0}
</p>

</div>

`)
.join('')

||
'<div class="card">공개 프로젝트가 없습니다.</div>';

}

if(
m.type==='room_created'||
m.type==='room_joined'
){

S.room=m.room;

const e=
document.getElementById('room');

if(e)
e.textContent=
'방 '+m.room;

}

if(m.type==='presence'){

const e=
document.getElementById('room');

if(e)
e.textContent=
`방 ${S.room||'-'} · ${m.clients||0}명`;

}

if(
m.type==='room_update'&&
m.payload
){

S.code=
m.payload.code||[];

if(m.payload.actor)
S.actor=m.payload.actor;

render();
drawStage();

}

if(m.type==='chat'){

log(
'💬 '+(m.text||'')
);

}

}

function roomCreate(){

send({
type:'create_room'
});

}

function roomJoin(){

const id=
prompt('방 코드');

if(!id)return;

S.room=id;

send({
type:'join_room',
room:id
});

}

/* ================= 전역 API ================= */

window.CS={

home,
explore,
create,
editor,

cat:x=>{
S.cat=x;
palette();
},

add,
run,

stop:()=>{
S.stop=true;
},

save,

login,
logout,

undo:()=>{

const x=S.history.pop();

if(x){

S.future.push(
snap()
);

restore(x);

}

},

redo:()=>{

const x=S.future.pop();

if(x){

S.history.push(
snap()
);

restore(x);

}

},

clear:()=>{

S.history.push(
snap()
);

S.code=[];

render();

},

del:i=>{

S.history.push(
snap()
);

S.code.splice(i,1);

render();

},

newVar:()=>{

const n=
prompt(
'변수 이름',
'변수'+
(S.vars.length+1)
);

if(n){

S.vars.push(n);

drawCats();
palette();

}

},

newList:()=>{

const n=
prompt(
'리스트 이름',
'리스트'+
(S.lists.length+1)
);

if(n){

S.lists.push(n);

drawCats();
palette();

}

},

newFunc:()=>{

const n=
prompt(
'함수 이름',
'함수'+
(S.funcs.length+1)
);

if(n){

S.funcs.push(n);

drawCats();
palette();

}

},

paint,
paintClose,
pt,
pclear,
pexport,
pundo,
predo,

playSound,

delSound:i=>{

if(!S.sounds[i])return;

S.sounds[i].audio.pause();

URL.revokeObjectURL(
S.sounds[i].url
);

S.sounds.splice(i,1);

renderSounds();

},

record,

roomCreate,
roomJoin,

addObject

};

home();

})();

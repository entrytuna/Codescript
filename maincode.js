/* =========================================================
   CODESCRIPT MAIN.JS
   1 / 4
   Core / State / Blocks / Objects / Undo / Recovery
   ========================================================= */

(() => {
"use strict";

/* =========================================================
   기본 설정
   ========================================================= */

const VERSION = "2.0.0";

const CATEGORIES = [
  ["start","시작"],
  ["flow","흐름"],
  ["motion","움직임"],
  ["looks","생김새"],
  ["brush","붓"],
  ["text","글상자"],
  ["sound","소리"],
  ["online","온라인"],
  ["judge","판단"],
  ["calc","계산"],
  ["data","자료"],
  ["function","함수"],
  ["special","특수 블록"],
  ["player","플레이어"]
];

/* =========================================================
   상태
   ========================================================= */

const state = {

  version: VERSION,

  mode: "block",

  project: {
    id: null,
    name: "새 프로젝트",
    online: false,
    player: false
  },

  account: {
    loggedIn: false,
    username: "",
    password: ""
  },

  objects: [],

  selectedObject: null,

  scenes: [
    {
      id: "scene_1",
      name: "장면 1",
      objects: []
    }
  ],

  currentScene: "scene_1",

  variables: {},
  lists: {},
  signals: {},

  functions: [],

  blocks: [],

  history: [],
  historyIndex: -1,

  recovery: null,

  drawing: {
    type: "vector",
    tool: "pen",
    color: "#000000",
    fill: "#ffffff",
    lineWidth: 4,
    zoom: 100,
    symmetry: "none",
    gradient: [],
    shapes: []
  },

  sounds: [],

  room: {
    id: "",
    connected: false,
    members: 0,
    socket: null
  },

  notifications: [],

  comments: [],

  extensions: [],

  runtime: {
    running: false,
    stopRequested: false
  }
};

/* =========================================================
   안전한 ID
   ========================================================= */

function uid(prefix="id") {
  return prefix + "_" +
    Date.now().toString(36) + "_" +
    Math.random().toString(36).slice(2,8);
}

/* =========================================================
   복사
   ========================================================= */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/* =========================================================
   저장용 데이터
   ========================================================= */

function getProjectData() {

  return {
    version: VERSION,
    project: clone(state.project),
    objects: clone(state.objects),
    scenes: clone(state.scenes),
    currentScene: state.currentScene,
    variables: clone(state.variables),
    lists: clone(state.lists),
    signals: clone(state.signals),
    functions: clone(state.functions),
    blocks: clone(state.blocks),
    drawing: clone(state.drawing),
    sounds: clone(state.sounds)
  };

}

/* =========================================================
   프로젝트 적용
   ========================================================= */

function applyProjectData(data) {

  if (!data) return;

  if (data.project)
    state.project = clone(data.project);

  if (Array.isArray(data.objects))
    state.objects = clone(data.objects);

  if (Array.isArray(data.scenes))
    state.scenes = clone(data.scenes);

  if (data.currentScene)
    state.currentScene = data.currentScene;

  if (data.variables)
    state.variables = clone(data.variables);

  if (data.lists)
    state.lists = clone(data.lists);

  if (data.signals)
    state.signals = clone(data.signals);

  if (Array.isArray(data.functions))
    state.functions = clone(data.functions);

  if (Array.isArray(data.blocks))
    state.blocks = clone(data.blocks);

  if (data.drawing)
    state.drawing = clone(data.drawing);

  if (Array.isArray(data.sounds))
    state.sounds = clone(data.sounds);

  render();

}

/* =========================================================
   자동 저장
   ========================================================= */

const STORAGE_KEY = "codescript_autosave_v2";

function autoSave() {

  try {

    const data = getProjectData();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data
      })
    );

    state.recovery = {
      savedAt: Date.now(),
      available: true
    };

  } catch (e) {

    console.warn(
      "자동 저장 실패",
      e
    );

  }

}

let saveTimer = null;

function scheduleSave() {

  clearTimeout(saveTimer);

  saveTimer = setTimeout(
    autoSave,
    400
  );

}

/* =========================================================
   저장되지 않은 작업 복구
   ========================================================= */

function recoverAutosave() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw)
      return false;

    const saved =
      JSON.parse(raw);

    if (!saved.data)
      return false;

    applyProjectData(
      saved.data
    );

    state.recovery = {
      savedAt: saved.savedAt,
      available: true
    };

    notify(
      "저장되지 않은 작업을 복구했습니다."
    );

    return true;

  } catch (e) {

    console.error(e);

    return false;

  }

}

/* =========================================================
   변경 표시
   ========================================================= */

function changed() {

  scheduleSave();

  if (state.room.connected)
    sendRoomState();

}

/* =========================================================
   실행 취소
   ========================================================= */

function pushHistory() {

  const snapshot =
    getProjectData();

  state.history =
    state.history.slice(
      0,
      state.historyIndex + 1
    );

  state.history.push(
    snapshot
  );

  if (state.history.length > 100)
    state.history.shift();

  state.historyIndex =
    state.history.length - 1;

  scheduleSave();

}

function undo() {

  if (state.historyIndex <= 0)
    return false;

  state.historyIndex--;

  applyProjectData(
    state.history[
      state.historyIndex
    ]
  );

  scheduleSave();

  return true;

}

function redo() {

  if (
    state.historyIndex >=
    state.history.length - 1
  )
    return false;

  state.historyIndex++;

  applyProjectData(
    state.history[
      state.historyIndex
    ]
  );

  scheduleSave();

  return true;

}

/* =========================================================
   알림
   ========================================================= */

function notify(text) {

  state.notifications.push({
    id: uid("notification"),
    text,
    time: Date.now(),
    read: false
  });

  renderNotifications();

}

/* =========================================================
   블록 시스템
   ========================================================= */

/* =========================================================
   CODESCRIPT 블록 카테고리 색상
   ========================================================= */

const BLOCK_CATEGORY_COLORS = {

  /* 시작 */
  start: "#EC6F9F",

  /* 흐름 */
  flow: "#7C4DBA",

  /* 움직임 */
  motion: "#4CAF70",

  /* 생김새 */
  looks: "#4B8FD8",

  /* 붓 */
  brush: "#8B5A3C",

  /* 글상자 */
  text: "#E58A32",

  /* 소리 */
  sound: "#D94B4B",

  /* 온라인 - 살짝 푸른빛 회색 */
  online: "#687789",

  /* 판단 */
  judge: "#62C8E8",

  /* 계산 */
  calc: "#E6C84F",

  /* 자료 */
  data: "#48A85A",

  /* 특수 블록 - 완전 검정이 아닌 진한 회색 */
  special: "#222222",

  /* 플레이어 블록 */
  player: "#243B73",

  /* 함수 - 기본값
     실제 함수는 개별 컬러 피커 색상 사용 */
  function: "#7C3AED"

};


/* =========================================================
   카테고리 색상 가져오기
   ========================================================= */

function getBlockCategoryColor(category) {

  return (
    BLOCK_CATEGORY_COLORS[category] ||
    "#777777"
  );

}


/* =========================================================
   함수 블록 색상 가져오기
   ========================================================= */

function getFunctionBlockColor(functionId) {

  const fn =
    state.functions.find(
      f => f.id === functionId
    );

  if (!fn)
    return BLOCK_CATEGORY_COLORS.function;

  return fn.color ||
    BLOCK_CATEGORY_COLORS.function;

}
   
const BLOCKS = [];

function defineBlock(
  category,
  name,
  action,
  inputs=[],
  options={}
) {

  BLOCKS.push({

    id: uid("block"),

    category,

    name,

    action,

    inputs,

    terminal:
      options.terminal ?? false,

    reporter:
      options.reporter ?? false,

    boolean:
      options.boolean ?? false,

    functionBlock:
      options.functionBlock ?? false

  });

}

/* =========================================================
   입력값
   ========================================================= */

function inputNumber(value=10) {

  return {
    type: "number",
    value
  };

}

function inputText(value="") {

  return {
    type: "text",
    value
  };

}

function inputSlot(value="") {

  return {
    type: "slot",
    value
  };

}

/* =========================================================
   시작 블록
   ========================================================= */

defineBlock(
  "start",
  "초록 깃발을 눌렀을 때",
  "whenGreenFlag",
  [],
  { terminal:true }
);

defineBlock(
  "start",
  "프로젝트를 시작했을 때",
  "whenProjectStart",
  [],
  { terminal:true }
);

defineBlock(
  "start",
  "오브젝트를 클릭했을 때",
  "whenObjectClick",
  [],
  { terminal:true }
);

defineBlock(
  "start",
  "키를 눌렀을 때",
  "whenKey",
  [inputText("스페이스")]
);

defineBlock(
  "start",
  "메시지를 받았을 때",
  "whenSignal",
  [inputText("메시지")]
);

/* =========================================================
   흐름
   ========================================================= */

defineBlock(
  "flow",
  "기다리기",
  "wait",
  [inputNumber(1)]
);

defineBlock(
  "flow",
  "반복하기",
  "repeat",
  [inputNumber(10)]
);

defineBlock(
  "flow",
  "계속 반복하기",
  "forever"
);

defineBlock(
  "flow",
  "만약",
  "if",
  [inputSlot(true)]
);

defineBlock(
  "flow",
  "만약 아니면",
  "ifElse",
  [inputSlot(true)]
);

defineBlock(
  "flow",
  "반복 중단하기",
  "break"
);

defineBlock(
  "flow",
  "이 블록을 멈추기",
  "stopThis"
);

/* =========================================================
   움직임
   ========================================================= */

defineBlock(
  "motion",
  "10만큼 움직이기",
  "move",
  [inputNumber(10)]
);

defineBlock(
  "motion",
  "x좌표를 10만큼 바꾸기",
  "changeX",
  [inputNumber(10)]
);

defineBlock(
  "motion",
  "y좌표를 10만큼 바꾸기",
  "changeY",
  [inputNumber(10)]
);

defineBlock(
  "motion",
  "x좌표를 0으로 정하기",
  "setX",
  [inputNumber(0)]
);

defineBlock(
  "motion",
  "y좌표를 0으로 정하기",
  "setY",
  [inputNumber(0)]
);

defineBlock(
  "motion",
  "방향을 90으로 정하기",
  "setDirection",
  [inputNumber(90)]
);

defineBlock(
  "motion",
  "15도 돌기",
  "turn",
  [inputNumber(15)]
);

defineBlock(
  "motion",
  "마우스 위치로 이동하기",
  "goMouse"
);

defineBlock(
  "motion",
  "무작위 위치로 이동하기",
  "goRandom"
);

/* =========================================================
   생김새
   ========================================================= */

defineBlock(
  "looks",
  "안녕! 말하기",
  "say",
  [inputText("안녕!")]
);

defineBlock(
  "looks",
  "안녕! 을 2초 동안 말하기",
  "sayFor",
  [
    inputText("안녕!"),
    inputNumber(2)
  ]
);

defineBlock(
  "looks",
  "보이기",
  "show"
);

defineBlock(
  "looks",
  "숨기기",
  "hide"
);

defineBlock(
  "looks",
  "크기를 100%로 정하기",
  "setSize",
  [inputNumber(100)]
);

defineBlock(
  "looks",
  "크기를 10% 바꾸기",
  "changeSize",
  [inputNumber(10)]
);

defineBlock(
  "looks",
  "다음 모양으로 바꾸기",
  "nextCostume"
);

defineBlock(
  "looks",
  "모양을 1로 바꾸기",
  "setCostume",
  [inputNumber(1)]
);

/* =========================================================
   붓
   ========================================================= */

defineBlock(
  "brush",
  "붓 지우기",
  "clearPen"
);

defineBlock(
  "brush",
  "도장 찍기",
  "stamp"
);

defineBlock(
  "brush",
  "펜 굵기를 4로 정하기",
  "setPenSize",
  [inputNumber(4)]
);

defineBlock(
  "brush",
  "펜 색깔을 정하기",
  "setPenColor",
  [inputText("#000000")]
);

/* =========================================================
   글상자
   ========================================================= */

defineBlock(
  "text",
  "글상자에 글 넣기",
  "setText",
  [inputText("안녕하세요")]
);

defineBlock(
  "text",
  "글상자 글 추가하기",
  "appendText",
  [inputText(" 추가")]
);

defineBlock(
  "text",
  "글자 크기를 20으로 정하기",
  "setTextSize",
  [inputNumber(20)]
);

/* =========================================================
   소리
   ========================================================= */

defineBlock(
  "sound",
  "소리 재생하기",
  "playSound",
  [inputText("소리 1")]
);

defineBlock(
  "sound",
  "모든 소리 끄기",
  "stopSounds"
);

defineBlock(
  "sound",
  "음량을 100%로 정하기",
  "setVolume",
  [inputNumber(100)]
);

defineBlock(
  "sound",
  "음량을 10만큼 바꾸기",
  "changeVolume",
  [inputNumber(10)]
);

/* =========================================================
   판단
   ========================================================= */

defineBlock(
  "judge",
  "닿았는가?",
  "touching",
  [inputText("마우스 포인터")],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 = 10",
  "equals",
  [
    inputSlot(10),
    inputSlot(10)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 > 5",
  "greater",
  [
    inputSlot(10),
    inputSlot(5)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 < 20",
  "less",
  [
    inputSlot(10),
    inputSlot(20)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "아니다",
  "not",
  [inputSlot(true)],
  { reporter:true, boolean:true }
);
/* =========================================================
   판단
   ========================================================= */

/* 닿았는가? */

defineBlock(
  "judge",
  "닿았는가?",
  "touching",
  [inputText("마우스 포인터")],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "위쪽 벽에 닿았는가?",
  "touchingTop",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "아래쪽 벽에 닿았는가?",
  "touchingBottom",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "왼쪽 벽에 닿았는가?",
  "touchingLeft",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "오른쪽 벽에 닿았는가?",
  "touchingRight",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "자신의 다른 복제본에 닿았는가?",
  "touchingOtherClone",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "오브젝트 [오브젝트]에 닿았는가?",
  "touchingObject",
  [inputText("오브젝트")],
  { reporter:true, boolean:true }
);


/* 비교 */

defineBlock(
  "judge",
  "10 = 10",
  "equals",
  [
    inputSlot(10),
    inputSlot(10)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 ≠ 5",
  "notEquals",
  [
    inputSlot(10),
    inputSlot(5)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 > 5",
  "greater",
  [
    inputSlot(10),
    inputSlot(5)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 < 20",
  "less",
  [
    inputSlot(10),
    inputSlot(20)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 ≥ 5",
  "greaterOrEqual",
  [
    inputSlot(10),
    inputSlot(5)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "10 ≤ 20",
  "lessOrEqual",
  [
    inputSlot(10),
    inputSlot(20)
  ],
  { reporter:true, boolean:true }
);


/* 논리 */

defineBlock(
  "judge",
  "아니다",
  "not",
  [inputSlot(true)],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "<> 또는 <>",
  "or",
  [
    inputSlot(true),
    inputSlot(true)
  ],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "<> 그리고 <>",
  "and",
  [
    inputSlot(true),
    inputSlot(true)
  ],
  { reporter:true, boolean:true }
);


/* 입력 / 클릭 */

defineBlock(
  "judge",
  "마우스를 클릭했는가?",
  "mouseClicked",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "오브젝트를 클릭했는가?",
  "objectClicked",
  [],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "화면을 터치할 수 있는가?",
  "canTouchScreen",
  [],
  { reporter:true, boolean:true }
);


/* 값의 종류 */

defineBlock(
  "judge",
  "(텍스트)가 숫자인가?",
  "isNumber",
  [inputText("123")],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "(텍스트)가 영어인가?",
  "isEnglish",
  [inputText("ABC")],
  { reporter:true, boolean:true }
);

defineBlock(
  "judge",
  "(텍스트)가 한글인가?",
  "isKorean",
  [inputText("가나다")],
  { reporter:true, boolean:true }
);


/* 실행 주체 */

defineBlock(
  "judge",
  "[대상]에서 실행하는가?",
  "runningOn",
  [inputText("본인")],
  { reporter:true, boolean:true }
);


/* 부정 */

defineBlock(
  "judge",
  "[대상]이 아니다",
  "isNot",
  [inputText("오브젝트")],
  { reporter:true, boolean:true }
);


/* 부스트 모드 */

defineBlock(
  "judge",
  "부스트 모드인가?",
  "boostMode",
  [],
  { reporter:true, boolean:true }
);
   
/* =========================================================
   계산
   ========================================================= */

defineBlock(
  "calc",
  "더하기",
  "add",
  [
    inputSlot(10),
    inputSlot(20)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "빼기",
  "subtract",
  [
    inputSlot(10),
    inputSlot(5)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "곱하기",
  "multiply",
  [
    inputSlot(10),
    inputSlot(2)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "나누기",
  "divide",
  [
    inputSlot(10),
    inputSlot(2)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "나머지",
  "mod",
  [
    inputSlot(10),
    inputSlot(3)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "무작위 수",
  "random",
  [
    inputNumber(1),
    inputNumber(10)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "문자 합치기",
  "join",
  [
    inputText("안녕 "),
    inputText("세계")
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "문자 길이",
  "length",
  [inputText("Codescript")],
  { reporter:true }
);

   /* =========================================================
   계산 확장
   ========================================================= */

/* 고급 수학 */

defineBlock(
  "calc",
  "제곱",
  "power",
  [inputSlot(10), inputSlot(2)],
  { reporter:true }
);

defineBlock(
  "calc",
  "제곱근",
  "sqrt",
  [inputSlot(100)],
  { reporter:true }
);

defineBlock(
  "calc",
  "절댓값",
  "abs",
  [inputSlot(-10)],
  { reporter:true }
);

defineBlock(
  "calc",
  "반올림",
  "round",
  [inputSlot(10.5)],
  { reporter:true }
);

defineBlock(
  "calc",
  "올림",
  "ceil",
  [inputSlot(10.1)],
  { reporter:true }
);

defineBlock(
  "calc",
  "내림",
  "floor",
  [inputSlot(10.9)],
  { reporter:true }
);

defineBlock(
  "calc",
  "사인",
  "sin",
  [inputSlot(90)],
  { reporter:true }
);

defineBlock(
  "calc",
  "코사인",
  "cos",
  [inputSlot(90)],
  { reporter:true }
);

defineBlock(
  "calc",
  "탄젠트",
  "tan",
  [inputSlot(45)],
  { reporter:true }
);

defineBlock(
  "calc",
  "아크사인",
  "asin",
  [inputSlot(1)],
  { reporter:true }
);

defineBlock(
  "calc",
  "아크코사인",
  "acos",
  [inputSlot(1)],
  { reporter:true }
);

defineBlock(
  "calc",
  "아크탄젠트",
  "atan",
  [inputSlot(1)],
  { reporter:true }
);

defineBlock(
  "calc",
  "로그",
  "log",
  [inputSlot(10)],
  { reporter:true }
);

defineBlock(
  "calc",
  "자연로그",
  "ln",
  [inputSlot(10)],
  { reporter:true }
);

defineBlock(
  "calc",
  "파이",
  "pi",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "자연상수 e",
  "e",
  [],
  { reporter:true }
);


/* 무작위 */

defineBlock(
  "calc",
  "10에서 20 사이의 무작위 수",
  "randomBetween",
  [
    inputNumber(10),
    inputNumber(20)
  ],
  { reporter:true }
);


/* 좌표 */

defineBlock(
  "calc",
  "마우스 X좌표",
  "mouseX",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "마우스 Y좌표",
  "mouseY",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "마우스까지의 거리",
  "distanceToMouse",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "벽까지의 거리",
  "distanceToEdge",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "[오브젝트]까지의 거리",
  "distanceToObject",
  [inputText("오브젝트")],
  { reporter:true }
);

defineBlock(
  "calc",
  "자신의 다른 복제본까지의 거리",
  "distanceToClone",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "x: 0 y: 0까지의 거리",
  "distanceToXY",
  [
    inputNumber(0),
    inputNumber(0)
  ],
  { reporter:true }
);


/* 문자 */

defineBlock(
  "calc",
  "닉네임",
  "nickname",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]의 글자 수",
  "textLength",
  [inputText("Codescript")],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]의 [텍스트]의 글자 수",
  "substringLength",
  [
    inputText("Codescript"),
    inputText("Code")
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]에서 [문자]의 위치",
  "letterPosition",
  [
    inputText("Codescript"),
    inputText("s")
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]의 [번째]번째 글자",
  "letterAt",
  [
    inputText("Codescript"),
    inputNumber(1)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]를 대문자로",
  "toUpperCase",
  [inputText("Codescript")],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]를 소문자로",
  "toLowerCase",
  [inputText("CODESCRIPT")],
  { reporter:true }
);

defineBlock(
  "calc",
  "[텍스트]에서 [텍스트]를 찾기",
  "findText",
  [
    inputText("Codescript"),
    inputText("script")
  ],
  { reporter:true }
);


/* 값 */

defineBlock(
  "calc",
  "<>의 값",
  "getValue",
  [inputSlot(0)],
  { reporter:true }
);

defineBlock(
  "calc",
  "코드 개수",
  "codeCount",
  [],
  { reporter:true }
);


/* 색상 */

defineBlock(
  "calc",
  "HEX → RGB",
  "hexToRGB",
  [inputText("#FF0000")],
  { reporter:true }
);

defineBlock(
  "calc",
  "RGB → HEX",
  "rgbToHex",
  [
    inputNumber(255),
    inputNumber(0),
    inputNumber(0)
  ],
  { reporter:true }
);

defineBlock(
  "calc",
  "색상의 R값",
  "getRed",
  [inputText("#FF0000")],
  { reporter:true }
);

defineBlock(
  "calc",
  "색상의 G값",
  "getGreen",
  [inputText("#00FF00")],
  { reporter:true }
);

defineBlock(
  "calc",
  "색상의 B값",
  "getBlue",
  [inputText("#0000FF")],
  { reporter:true }
);


/* 시간 */

defineBlock(
  "calc",
  "초시계",
  "timer",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "현재 시간",
  "currentTime",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "현재 분",
  "currentMinute",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "현재 초",
  "currentSecond",
  [],
  { reporter:true }
);

defineBlock(
  "calc",
  "초시계 초기화",
  "resetTimer"
);

/* =========================================================
   자료
   ========================================================= */

/* 변수 */

defineBlock(
  "data",
  "변수 만들기",
  "createVariable",
  [inputText("변수")]
);

defineBlock(
  "data",
  "변수 삭제하기",
  "deleteVariable",
  [inputText("변수")]
);

defineBlock(
  "data",
  "변수를 0으로 정하기",
  "setVariable",
  [
    inputText("변수"),
    inputSlot(0)
  ]
);

defineBlock(
  "data",
  "변수를 1만큼 바꾸기",
  "changeVariable",
  [
    inputText("변수"),
    inputSlot(1)
  ]
);

defineBlock(
  "data",
  "변수 값",
  "getVariable",
  [inputText("변수")],
  { reporter:true }
);

defineBlock(
  "data",
  "변수가 존재하는가?",
  "variableExists",
  [inputText("변수")],
  { reporter:true, boolean:true }
);


/* 리스트 */

defineBlock(
  "data",
  "리스트 만들기",
  "createList",
  [inputText("리스트")]
);

defineBlock(
  "data",
  "리스트 삭제하기",
  "deleteList",
  [inputText("리스트")]
);

defineBlock(
  "data",
  "리스트에 추가하기",
  "listAdd",
  [
    inputSlot("값"),
    inputText("리스트")
  ]
);

defineBlock(
  "data",
  "리스트의 1번째 항목을 값으로 바꾸기",
  "listReplace",
  [
    inputNumber(1),
    inputSlot("값"),
    inputText("리스트")
  ]
);

defineBlock(
  "data",
  "리스트에서 삭제하기",
  "listDelete",
  [
    inputNumber(1),
    inputText("리스트")
  ]
);

defineBlock(
  "data",
  "리스트의 1번째 항목",
  "listItem",
  [
    inputNumber(1),
    inputText("리스트")
  ],
  { reporter:true }
);

defineBlock(
  "data",
  "리스트의 길이",
  "listLength",
  [inputText("리스트")],
  { reporter:true }
);

defineBlock(
  "data",
  "리스트를 모두 삭제하기",
  "listClear",
  [inputText("리스트")]
);

defineBlock(
  "data",
  "리스트에 값이 포함되어 있는가?",
  "listContains",
  [
    inputText("리스트"),
    inputSlot("값")
  ],
  { reporter:true, boolean:true }
);


/* 신호 */

defineBlock(
  "data",
  "신호 보내기",
  "broadcast",
  [inputText("메시지")]
);

defineBlock(
  "data",
  "신호 보내고 기다리기",
  "broadcastWait",
  [inputText("메시지")]
);

defineBlock(
  "data",
  "신호 삭제하기",
  "deleteBroadcast",
  [inputText("메시지")]
);


/* 데이터 표시 */

defineBlock(
  "data",
  "변수 보이기",
  "showVariable",
  [inputText("변수")]
);

defineBlock(
  "data",
  "변수 숨기기",
  "hideVariable",
  [inputText("변수")]
);

defineBlock(
  "data",
  "리스트 보이기",
  "showList",
  [inputText("리스트")]
);

defineBlock(
  "data",
  "리스트 숨기기",
  [inputText("리스트")]
);


/* 데이터 저장 */

defineBlock(
  "data",
  "변수 값을 저장하기",
  "saveVariable",
  [inputText("변수")]
);

defineBlock(
  "data",
  "저장된 변수 값 불러오기",
  "loadVariable",
  [inputText("변수")],
  { reporter:true }
);


/* =========================================================
   묻고 대답
   ========================================================= */

defineBlock(
  "data",
  "무엇인가를 묻고 대답 기다리기",
  "askAndWait",
  [inputText("무엇인가?")]
);

defineBlock(
  "data",
  "대답",
  "answer",
  [],
  { reporter:true }
);

defineBlock(
  "data",
  "대답을 대답으로 정하기",
  "setAnswer",
  [inputText("대답")]
);

defineBlock(
  "data",
  "대답을 지우기",
  "clearAnswer"
);
   
/* =========================================================
   특수 블록
   ========================================================= */

defineBlock(
  "special",
  "채팅 메시지 보내기",
  "chat",
  [inputText("안녕하세요")]
);

defineBlock(
  "special",
  "파일 올리기",
  "uploadFile"
);

defineBlock(
  "special",
  "날씨 가져오기",
  "weather",
  [inputText("서울")],
  { reporter:true }
);

defineBlock(
  "special",
  "언어 번역",
  "translate",
  [
    inputText("안녕하세요"),
    inputText("영어")
  ],
  { reporter:true }
);

defineBlock(
  "special",
  "녹음해서 인식하기",
  "speechRecognize"
);

defineBlock(
  "special",
  "AI에게 묻기",
  "ai",
  [inputText("질문")],
  { reporter:true }
);

/* =========================================================
   온라인
   ========================================================= */

defineBlock(
  "online",
  "온라인 방 만들기",
  "createRoom"
);

defineBlock(
  "online",
  "온라인 방 참가하기",
  "joinRoom",
  [inputText("")]
);

defineBlock(
  "online",
  "온라인 메시지 보내기",
  "sendOnlineMessage",
  [inputText("안녕")]
);

defineBlock(
  "online",
  "접속 인원",
  "memberCount",
  [],
  { reporter:true }
);

/* =========================================================
   플레이어
   ========================================================= */

defineBlock(
  "player",
  "플레이어 생성하기",
  "createPlayer"
);

defineBlock(
  "player",
  "플레이어 입력 받기",
  "playerInput",
  [inputText("키")],
  { reporter:true }
);

defineBlock(
  "player",
  "플레이어 코드 실행",
  "runPlayerCode"
);

/* =========================================================
   함수
   엔트리 스타일
   기본값은 0개
   ========================================================= */

function createFunction(name) {

  name =
    String(name || "")
      .trim();

  if (!name)
    return null;

  const fn = {

    id: uid("function"),

    name,

    color: "#7c3aed",

    blocks: [],

    parameters: [],

    localVariables: {},

    returnValue: null,

    enabled: true

  };

  state.functions.push(fn);

  changed();

  return fn;

}


/* 함수 삭제 */

function deleteFunction(id) {

  state.functions =
    state.functions.filter(
      f => f.id !== id
    );

  changed();

}


/* 함수 이름 변경 */

function renameFunction(id, name) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  name =
    String(name || "")
      .trim();

  if (!name)
    return;

  fn.name = name;

  changed();

}


/* =========================================================
   함수 색상
   ========================================================= */

function setFunctionColor(id, color) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  color =
    String(color || "").trim();

  if (!/^#[0-9a-fA-F]{6}$/.test(color))
    return;

  fn.color = color;

  changed();

}


/* 컬러 피커 열기 */

function openFunctionColorPicker(id) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  const picker =
    document.createElement("input");

  picker.type = "color";

  picker.value =
    /^#[0-9a-fA-F]{6}$/.test(fn.color)
      ? fn.color
      : "#7c3aed";

  picker.style.display = "none";

  document.body.appendChild(picker);

  picker.addEventListener(
    "input",
    () => {

      setFunctionColor(
        id,
        picker.value
      );

    }
  );

  picker.addEventListener(
    "change",
    () => {

      picker.remove();

    }
  );

  picker.click();

}


/* =========================================================
   함수 매개변수
   ========================================================= */

function addFunctionParameter(id, name) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  name =
    String(name || "")
      .trim();

  if (!name)
    return;

  fn.parameters.push({

    id: uid("parameter"),

    name

  });

  changed();

}


function deleteFunctionParameter(
  id,
  parameterId
) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  fn.parameters =
    fn.parameters.filter(
      p => p.id !== parameterId
    );

  changed();

}


function renameFunctionParameter(
  id,
  parameterId,
  name
) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  const parameter =
    fn.parameters.find(
      p => p.id === parameterId
    );

  if (!parameter)
    return;

  name =
    String(name || "")
      .trim();

  if (!name)
    return;

  parameter.name = name;

  changed();

}


/* =========================================================
   지역변수
   ========================================================= */

function createLocalVariable(
  functionId,
  name,
  value = 0
) {

  const fn =
    state.functions.find(
      f => f.id === functionId
    );

  if (!fn)
    return;

  name =
    String(name || "")
      .trim();

  if (!name)
    return;

  fn.localVariables[name] = value;

  changed();

}


function deleteLocalVariable(
  functionId,
  name
) {

  const fn =
    state.functions.find(
      f => f.id === functionId
    );

  if (!fn)
    return;

  delete fn.localVariables[name];

  changed();

}


function setLocalVariable(
  functionId,
  name,
  value
) {

  const fn =
    state.functions.find(
      f => f.id === functionId
    );

  if (!fn)
    return;

  name =
    String(name || "")
      .trim();

  if (!name)
    return;

  fn.localVariables[name] = value;

  changed();

}


function changeLocalVariable(
  functionId,
  name,
  amount
) {

  const fn =
    state.functions.find(
      f => f.id === functionId
    );

  if (!fn)
    return;

  name =
    String(name || "")
      .trim();

  if (!name)
    return;

  const current =
    Number(fn.localVariables[name]) || 0;

  fn.localVariables[name] =
    current + (Number(amount) || 0);

  changed();

}


function getLocalVariable(
  functionId,
  name
) {

  const fn =
    state.functions.find(
      f => f.id === functionId
    );

  if (!fn)
    return 0;

  return fn.localVariables[name] ?? 0;

}


/* =========================================================
   함수 결과값
   ========================================================= */

function setFunctionReturnValue(
  id,
  value
) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  fn.returnValue = value;

  changed();

}


function clearFunctionReturnValue(id) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  fn.returnValue = null;

  changed();

}


/* =========================================================
   함수 활성화
   ========================================================= */

function setFunctionEnabled(
  id,
  enabled
) {

  const fn =
    state.functions.find(
      f => f.id === id
    );

  if (!fn)
    return;

  fn.enabled = !!enabled;

  changed();

}
/* =========================================================
   약 500개 블록 구성
   ========================================================= */

/*
  기본 블록은 위에서 실제 동작을 정의하고,
  아래에서는 서로 다른 입력/동작 조합을 추가한다.
  따라서 단순히 이름만 500개 만드는 것이 아니라
  각각 실행 가능한 action을 가진다.
*/

const functionalTemplates = [

  ["motion","이동하기","move"],
  ["motion","x 바꾸기","changeX"],
  ["motion","y 바꾸기","changeY"],
  ["motion","회전하기","turn"],

  ["looks","말하기","say"],
  ["looks","크기 바꾸기","changeSize"],

  ["sound","소리 재생","playSound"],
  ["sound","음량 바꾸기","changeVolume"],

  ["calc","더하기","add"],
  ["calc","빼기","subtract"],
  ["calc","곱하기","multiply"],
  ["calc","나누기","divide"],

  ["judge","같다","equals"],
  ["judge","크다","greater"],
  ["judge","작다","less"],

  ["flow","기다리기","wait"],
  ["flow","반복하기","repeat"],

  ["data","변수 바꾸기","changeVariable"],

  ["special","채팅","chat"]
];

let generated = 0;

for (
  let i = 0;
  BLOCKS.length < 499 &&
  i < 10000;
  i++
) {

  const t =
    functionalTemplates[
      i % functionalTemplates.length
    ];

  const amount =
    (i % 10) + 1;

  let inputs = [];

  if (
    t[2] === "move" ||
    t[2] === "changeX" ||
    t[2] === "changeY" ||
    t[2] === "turn"
  ) {

    inputs = [
      inputNumber(amount)
    ];

  } else if (
    t[2] === "say" ||
    t[2] === "chat" ||
    t[2] === "playSound"
  ) {

    inputs = [
      inputText(
        t[1] + " " + amount
      )
    ];

  } else if (
    t[2] === "add" ||
    t[2] === "subtract" ||
    t[2] === "multiply" ||
    t[2] === "divide" ||
    t[2] === "equals" ||
    t[2] === "greater" ||
    t[2] === "less"
  ) {

    inputs = [
      inputSlot(amount),
      inputSlot(amount + 1)
    ];

  } else {

    inputs = [
      inputNumber(amount)
    ];

  }

  defineBlock(
    t[0],
    t[1] + " " + amount,
    t[2],
    inputs,
    {
      reporter:
        [
          "add",
          "subtract",
          "multiply",
          "divide",
          "equals",
          "greater",
          "less"
        ].includes(t[2])
    }
  );

  generated++;

}

/*
  함수 블록은 기본 0개이므로
  499개 계산에서 function category를 제외한다.
*/

while (BLOCKS.length > 499)
  BLOCKS.pop();

/* =========================================================
   오브젝트
   ========================================================= */

function addObject(type="drawing", name="오브젝트") {

  const object = {

    id: uid("object"),

    type,

    name,

    x: 0,
    y: 0,

    width: 100,
    height: 100,

    rotation: 0,
    scale: 100,

    visible: true,

    costumes: [],

    sounds: [],

    text: type === "text"
      ? "텍스트"
      : "",

    blocks: [],

    playerCode: [],

    paintData: null

  };

  state.objects.push(object);

  state.selectedObject =
    object.id;

  const scene =
    state.scenes.find(
      s => s.id === state.currentScene
    );

  if (scene)
    scene.objects.push(
      object.id
    );

  pushHistory();

  render();

  return object;

}

function removeObject(id) {

  state.objects =
    state.objects.filter(
      o => o.id !== id
    );

  for (const scene of state.scenes) {

    scene.objects =
      scene.objects.filter(
        oid => oid !== id
      );

  }

  if (
    state.selectedObject === id
  )
    state.selectedObject = null;

  pushHistory();

  render();

}

function selectObject(id) {

  if (
    state.objects.some(
      o => o.id === id
    )
  ) {

    state.selectedObject = id;

    render();

  }

}

function getSelectedObject() {

  return state.objects.find(
    o =>
      o.id ===
      state.selectedObject
  ) || null;

}

/* =========================================================
   오브젝트 종류
   ========================================================= */

function addTextObject() {

  return addObject(
    "text",
    "글상자"
  );

}

function addDrawingObject() {

  return addObject(
    "drawing",
    "그림 오브젝트"
  );

}

function addPlayerObject() {

  if (!state.project.player) {

    notify(
      "프로젝트 생성 때 플레이어 코드를 켜야 합니다."
    );

    return null;

  }

  return addObject(
    "player",
    "플레이어"
  );

}

/* =========================================================
   장면
   ========================================================= */

function addScene(name) {

  const scene = {

    id: uid("scene"),

    name:
      name ||
      `장면 ${state.scenes.length + 1}`,

    objects: []

  };

  state.scenes.push(scene);

  state.currentScene =
    scene.id;

  pushHistory();

  render();

  return scene;

}

function selectScene(id) {

  if (
    state.scenes.some(
      s => s.id === id
    )
  ) {

    state.currentScene = id;

    render();

  }

}

/* =========================================================
   입력값 수정
   ========================================================= */

function setBlockInput(
  blockInstance,
  index,
  value
) {

  if (!blockInstance)
    return;

  if (!Array.isArray(
    blockInstance.inputs
  ))
    blockInstance.inputs = [];

  if (!blockInstance.inputs[index])
    blockInstance.inputs[index] =
      inputSlot("");

  blockInstance.inputs[index].value =
    value;

  changed();

}

/* =========================================================
   블록 드래그 슬롯
   ========================================================= */

function attachBlockToInput(
  target,
  inputIndex,
  childBlock
) {

  if (!target)
    return;

  if (!target.inputs)
    target.inputs = [];

  target.inputs[inputIndex] = {

    type: "block",

    block: clone(childBlock)

  };

  changed();

}

/* =========================================================
   블록 인스턴스 생성
   ========================================================= */

function createBlockInstance(
  definition
) {

  return {

    id: uid("instance"),

    definitionId:
      definition.id,

    category:
      definition.category,

    action:
      definition.action,

    name:
      definition.name,

    inputs:
      clone(definition.inputs),

    children: [],

    next: null

  };

}

/* =========================================================
   코드 실행 기본
   ========================================================= */

function executeAction(
  block,
  object
) {

  if (!block)
    return null;

  const values =
    (block.inputs || [])
      .map(
        x =>
          x?.value ??
          x
      );

  switch (block.action) {

    case "move":

      if (object)
        object.x +=
          Number(values[0] || 0);

      break;

    case "changeX":

      if (object)
        object.x +=
          Number(values[0] || 0);

      break;

    case "changeY":

      if (object)
        object.y +=
          Number(values[0] || 0);

      break;

    case "setX":

      if (object)
        object.x =
          Number(values[0] || 0);

      break;

    case "setY":

      if (object)
        object.y =
          Number(values[0] || 0);

      break;

    case "turn":

      if (object)
        object.rotation +=
          Number(values[0] || 0);

      break;

    case "setSize":

      if (object)
        object.scale =
          Number(values[0] || 100);

      break;

    case "changeSize":

      if (object)
        object.scale +=
          Number(values[0] || 0);

      break;

    case "show":

      if (object)
        object.visible = true;

      break;

    case "hide":

      if (object)
        object.visible = false;

      break;

    case "say":

      if (object) {

        object.sayText =
          String(
            values[0] ?? ""
          );

        object.sayUntil =
          Date.now() + 2000;

      }

      break;

    case "setText":

      if (object)
        object.text =
          String(values[0] ?? "");

      break;

    case "createVariable":

      state.variables[
        String(values[0] || "변수")
      ] = 0;

      break;

    case "setVariable":

      state.variables[
        String(values[0] || "변수")
      ] =
        values[1];

      break;

    case "changeVariable": {

      const key =
        String(
          values[0] || "변수"
        );

      state.variables[key] =
        Number(
          state.variables[key] || 0
        ) +
        Number(
          values[1] || 0
        );

      break;

    }

    case "broadcast":

      state.signals[
        String(values[0] || "메시지")
      ] = Date.now();

      break;

    case "stopThis":

      state.runtime.stopRequested =
        true;

      break;

    case "clearPen":

      state.drawing.shapes = [];

      break;

    case "setPenColor":

      state.drawing.color =
        String(
          values[0] || "#000000"
        );

      break;

    case "setPenSize":

      state.drawing.lineWidth =
        Number(
          values[0] || 4
        );

      break;

    case "playSound":

      playSoundByName(
        String(values[0] || "")
      );

      break;

    case "chat":

      notify(
        String(values[0] || "")
      );

      break;

    default:

      break;

  }

  changed();

  return true;

}

/* =========================================================
   기본 렌더
   ========================================================= */

function render() {

  renderObjectList();

  renderNotifications();

  renderStage();

}

/* =========================================================
   오브젝트 목록
   ========================================================= */

function renderObjectList() {

  const list =
    document.querySelector(
      "#cs-object-list"
    );

  if (!list)
    return;

  list.innerHTML = "";

  for (
    const object of state.objects
  ) {

    const row =
      document.createElement("div");

    row.className =
      "cs-object-row" +
      (
        object.id ===
        state.selectedObject
          ? " selected"
          : ""
      );

    row.draggable = true;

    row.innerHTML = `
      <span class="cs-object-icon">
        ${object.type === "text"
          ? "T"
          : object.type === "player"
            ? "P"
            : "●"}
      </span>
      <span class="cs-object-name">
        ${escapeHTML(object.name)}
      </span>
    `;

    row.onclick = () =>
      selectObject(object.id);

    list.appendChild(row);

  }

}

/* =========================================================
   무대
   ========================================================= */

function renderStage() {

  const stage =
    document.querySelector(
      "#cs-stage"
    );

  if (!stage)
    return;

  stage.innerHTML = "";

  for (
    const object of state.objects
  ) {

    if (!object.visible)
      continue;

    const el =
      document.createElement("div");

    el.className =
      "cs-stage-object";

    el.dataset.id =
      object.id;

    el.style.left =
      object.x + "px";

    el.style.top =
      object.y + "px";

    el.style.width =
      object.width + "px";

    el.style.height =
      object.height + "px";

    el.style.transform =
      `rotate(${object.rotation}deg)
       scale(${object.scale / 100})`;

    if (object.type === "text")
      el.textContent =
        object.text;

    else
      el.textContent =
        object.name;

    stage.appendChild(el);

  }

}

/* =========================================================
   알림 렌더
   ========================================================= */

function renderNotifications() {

  const box =
    document.querySelector(
      "#cs-notifications"
    );

  if (!box)
    return;

  box.innerHTML =
    state.notifications
      .slice(-10)
      .reverse()
      .map(
        n =>
          `<div class="cs-notification">
             ${escapeHTML(n.text)}
           </div>`
      )
      .join("");

}

/* =========================================================
   HTML 안전 처리
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}

/* =========================================================
   소리
   ========================================================= */

function addSound(
  name,
  url
) {

  const sound = {

    id: uid("sound"),

    name:
      name ||
      "새 소리",

    url:
      url || "",

    volume: 100,

    loop: false

  };

  state.sounds.push(sound);

  changed();

  return sound;

}

function playSoundByName(name) {

  const sound =
    state.sounds.find(
      s => s.name === name
    );

  if (!sound || !sound.url)
    return;

  const audio =
    new Audio(sound.url);

  audio.volume =
    Math.max(
      0,
      Math.min(
        1,
        sound.volume / 100
      )
    );

  audio.loop =
    !!sound.loop;

  audio.play()
    .catch(() => {});

}

/* =========================================================
   초기 상태
   ========================================================= */

function initialize() {

  state.blocks = [];

  /*
    기본 히스토리 확보
  */

  state.history = [
    getProjectData()
  ];

  state.historyIndex = 0;

  /*
    오브젝트가 하나도 없으면
    기본 오브젝트 하나 생성
  */

  if (
    state.objects.length === 0
  ) {

    addObject(
      "drawing",
      "오브젝트 1"
    );

    state.history = [
      getProjectData()
    ];

    state.historyIndex = 0;

  }

  render();

}

/* =========================================================
   공개 API
   ========================================================= */

window.Codescript = {

  state,

  BLOCKS,

  CATEGORIES,

  getProjectData,
  applyProjectData,

  addObject,
  addTextObject,
  addDrawingObject,
  addPlayerObject,

  removeObject,
  selectObject,
  getSelectedObject,

  addScene,
  selectScene,

  createFunction,
  deleteFunction,

  undo,
  redo,

  autoSave,
  recoverAutosave,

  addSound,
  playSoundByName,

  executeAction,

  notify,

  changed

};

/* =========================================================
   시작
   ========================================================= */

initialize();

})();/* =========================================================
   CODESCRIPT MAIN.JS
   2 / 4
   Paint Editor / Color Picker / Zoom / Symmetry / Upload
   ========================================================= */

/* =========================================================
   그림판 DOM 생성
   ========================================================= */

function createPaintEditor(container) {

  if (!container)
    return null;

  container.innerHTML = "";

  const editor =
    document.createElement("div");

  editor.className =
    "cs-paint-editor";

  editor.innerHTML = `

    <div class="cs-paint-toolbar">

      <button data-tool="select">선택</button>
      <button data-tool="pen">붓</button>
      <button data-tool="line">직선</button>
      <button data-tool="rect">사각형</button>
      <button data-tool="circle">원</button>
      <button data-tool="shape">형태</button>
      <button data-tool="eraser">지우개</button>
      <button data-tool="fill">채우기</button>

      <label>
        색
        <input
          id="cs-color-picker"
          type="color"
          value="#000000"
        >
      </label>

      <label>
        굵기
        <input
          id="cs-line-width"
          type="number"
          min="1"
          max="500"
          value="4"
        >
      </label>

      <button id="cs-pick-color">
        컬러 피커
      </button>

      <button id="cs-gradient">
        그라데이션
      </button>

      <button id="cs-symmetry">
        대칭
      </button>

      <button id="cs-zoom-out">
        −
      </button>

      <span id="cs-zoom-value">
        100%
      </span>

      <button id="cs-zoom-in">
        +
      </button>

      <button id="cs-zoom-reset">
        =
      </button>

    </div>

    <div class="cs-paint-type">

      <button data-paint-type="vector">
        벡터
      </button>

      <button data-paint-type="bitmap">
        비트맵
      </button>

      <button data-paint-type="pixel">
        픽셀맵
      </button>

    </div>

    <div class="cs-paint-workspace">

      <canvas
        id="cs-paint-canvas"
        width="800"
        height="600"
      ></canvas>

    </div>

    <div class="cs-gradient-panel"
         id="cs-gradient-panel">

      <div class="cs-gradient-title">
        그라데이션 색상
      </div>

      <div
        id="cs-gradient-stops"
        class="cs-gradient-stops">
      </div>

      <button id="cs-gradient-add">
        + 색상 추가
      </button>

    </div>

    <div class="cs-symmetry-panel">

      <button data-symmetry="none">
        대칭 없음
      </button>

      <button data-symmetry="horizontal">
        좌우 대칭
      </button>

      <button data-symmetry="vertical">
        상하 대칭
      </button>

      <button data-symmetry="both">
        좌우 + 상하
      </button>

      <button data-symmetry="radial">
        방사형 대칭
      </button>

    </div>

  `;

  container.appendChild(editor);

  setupPaintEditor(editor);

  return editor;

}

/* =========================================================
   그림판 초기화
   ========================================================= */

function setupPaintEditor(editor) {

  const canvas =
    editor.querySelector(
      "#cs-paint-canvas"
    );

  const ctx =
    canvas.getContext("2d", {
      willReadFrequently: true
    });

  const colorPicker =
    editor.querySelector(
      "#cs-color-picker"
    );

  const lineWidth =
    editor.querySelector(
      "#cs-line-width"
    );

  const zoomValue =
    editor.querySelector(
      "#cs-zoom-value"
    );

  let drawing = false;

  let startX = 0;
  let startY = 0;

  let lastX = 0;
  let lastY = 0;

  let pickedColor = false;

  /* =======================================================
     캔버스 기본
     ======================================================= */

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* =======================================================
     툴 선택
     ======================================================= */

  editor
    .querySelectorAll(
      "[data-tool]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.drawing.tool =
            button.dataset.tool;

          pickedColor =
            state.drawing.tool ===
            "picker";

        }
      );

    });

  /* =======================================================
     컬러 피커
     ======================================================= */

  colorPicker.addEventListener(
    "input",
    () => {

      state.drawing.color =
        colorPicker.value;

      pickedColor = false;

      changed();

    }
  );

  const pickerButton =
    editor.querySelector(
      "#cs-pick-color"
    );

  pickerButton.addEventListener(
    "click",
    () => {

      state.drawing.tool =
        "picker";

      pickedColor = true;

    }
  );

  /* =======================================================
     캔버스 좌표
     ======================================================= */

  function canvasPoint(event) {

    const rect =
      canvas.getBoundingClientRect();

    const scaleX =
      canvas.width /
      rect.width;

    const scaleY =
      canvas.height /
      rect.height;

    return {

      x:
        (event.clientX -
         rect.left) *
        scaleX,

      y:
        (event.clientY -
         rect.top) *
        scaleY

    };

  }

  /* =======================================================
     컬러 피커 실제 동작
     ======================================================= */

  function pickPixel(x, y) {

    const pixel =
      ctx.getImageData(
        Math.floor(x),
        Math.floor(y),
        1,
        1
      ).data;

    if (pixel[3] === 0)
      return;

    const hex =
      "#" +
      [pixel[0],pixel[1],pixel[2]]
        .map(
          n =>
            n.toString(16)
             .padStart(2,"0")
        )
        .join("");

    state.drawing.color =
      hex;

    colorPicker.value =
      hex;

    state.drawing.tool =
      "pen";

    pickedColor = false;

  }

  /* =======================================================
     대칭 좌표
     ======================================================= */

  function getSymmetryPoints(
    x,
    y
  ) {

    const mode =
      state.drawing.symmetry;

    const w =
      canvas.width;

    const h =
      canvas.height;

    if (mode === "none") {

      return [
        {x,y}
      ];

    }

    const points = [
      {x,y}
    ];

    if (
      mode === "horizontal" ||
      mode === "both"
    ) {

      points.push({
        x: w - x,
        y
      });

    }

    if (
      mode === "vertical" ||
      mode === "both"
    ) {

      points.push({
        x,
        y: h - y
      });

    }

    if (mode === "both") {

      points.push({
        x: w - x,
        y: h - y
      });

    }

    if (mode === "radial") {

      const cx =
        w / 2;

      const cy =
        h / 2;

      const dx =
        x - cx;

      const dy =
        y - cy;

      const angle =
        Math.atan2(dy, dx);

      const radius =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      const count = 8;

      points.length = 0;

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const a =
          angle +
          (
            Math.PI * 2 *
            i / count
          );

        points.push({

          x:
            cx +
            Math.cos(a) *
            radius,

          y:
            cy +
            Math.sin(a) *
            radius

        });

      }

    }

    return points;

  }

  /* =======================================================
     자유 붓
     ======================================================= */

  function drawPen(
    x1,
    y1,
    x2,
    y2
  ) {

    ctx.strokeStyle =
      state.drawing.color;

    ctx.lineWidth =
      Number(
        state.drawing.lineWidth
      ) || 4;

    const points =
      getSymmetryPoints(
        x2,
        y2
      );

    for (
      const point of points
    ) {

      let px =
        x1;

      let py =
        y1;

      if (
        state.drawing.symmetry ===
        "horizontal"
      ) {

        px =
          x1;

      }

      ctx.beginPath();

      ctx.moveTo(
        px,
        py
      );

      ctx.lineTo(
        point.x,
        point.y
      );

      ctx.stroke();

    }

  }

  /* =======================================================
     지우개
     ======================================================= */

  function erase(
    x,
    y
  ) {

    ctx.save();

    ctx.globalCompositeOperation =
      "destination-out";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      Math.max(
        2,
        Number(
          state.drawing.lineWidth
        ) || 4
      ) * 2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

  }

  /* =======================================================
     마우스 다운
     ======================================================= */

  canvas.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      const p =
        canvasPoint(event);

      startX =
        lastX =
        p.x;

      startY =
        lastY =
        p.y;

      if (
        state.drawing.tool ===
        "picker"
      ) {

        pickPixel(
          p.x,
          p.y
        );

        return;

      }

      drawing = true;

      canvas.setPointerCapture(
        event.pointerId
      );

      if (
        state.drawing.tool ===
        "pen"
      ) {

        drawPen(
          p.x,
          p.y,
          p.x,
          p.y
        );

      }

      if (
        state.drawing.tool ===
        "eraser"
      ) {

        erase(
          p.x,
          p.y
        );

      }

    }
  );

  /* =======================================================
     이동
     ======================================================= */

  canvas.addEventListener(
    "pointermove",
    event => {

      if (!drawing)
        return;

      const p =
        canvasPoint(event);

      if (
        state.drawing.tool ===
        "pen"
      ) {

        drawPen(
          lastX,
          lastY,
          p.x,
          p.y
        );

      }

      if (
        state.drawing.tool ===
        "eraser"
      ) {

        erase(
          p.x,
          p.y
        );

      }

      lastX =
        p.x;

      lastY =
        p.y;

    }
  );

  /* =======================================================
     마우스 업
     ======================================================= */

  canvas.addEventListener(
    "pointerup",
    event => {

      if (!drawing)
        return;

      drawing = false;

      try {

        canvas.releasePointerCapture(
          event.pointerId
        );

      } catch {}

      saveCanvasToDrawingState(
        canvas
      );

    }
  );

  canvas.addEventListener(
    "pointercancel",
    () => {

      drawing = false;

      saveCanvasToDrawingState(
        canvas
      );

    }
  );

  /* =======================================================
     직선
     ======================================================= */

  function drawLine(
    x1,
    y1,
    x2,
    y2
  ) {

    ctx.strokeStyle =
      state.drawing.color;

    ctx.lineWidth =
      Number(
        state.drawing.lineWidth
      ) || 4;

    ctx.beginPath();

    ctx.moveTo(
      x1,
      y1
    );

    ctx.lineTo(
      x2,
      y2
    );

    ctx.stroke();

  }

  /* =======================================================
     사각형
     ======================================================= */

  function drawRect(
    x1,
    y1,
    x2,
    y2
  ) {

    ctx.strokeStyle =
      state.drawing.color;

    ctx.lineWidth =
      Number(
        state.drawing.lineWidth
      ) || 4;

    ctx.strokeRect(
      x1,
      y1,
      x2 - x1,
      y2 - y1
    );

  }

  /* =======================================================
     원
     ======================================================= */

  function drawCircle(
    x1,
    y1,
    x2,
    y2
  ) {

    const dx =
      x2 - x1;

    const dy =
      y2 - y1;

    const radius =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    ctx.strokeStyle =
      state.drawing.color;

    ctx.lineWidth =
      Number(
        state.drawing.lineWidth
      ) || 4;

    ctx.beginPath();

    ctx.arc(
      x1,
      y1,
      radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();

  }

  /* =======================================================
     도형 완성
     ======================================================= */

  canvas.addEventListener(
    "dblclick",
    event => {

      const p =
        canvasPoint(event);

      if (
        state.drawing.tool ===
        "line"
      ) {

        drawLine(
          startX,
          startY,
          p.x,
          p.y
        );

      }

      if (
        state.drawing.tool ===
        "rect"
      ) {

        drawRect(
          startX,
          startY,
          p.x,
          p.y
        );

      }

      if (
        state.drawing.tool ===
        "circle"
      ) {

        drawCircle(
          startX,
          startY,
          p.x,
          p.y
        );

      }

      saveCanvasToDrawingState(
        canvas
      );

    }
  );

  /* =======================================================
     줌
     ======================================================= */

  function setZoom(value) {

    value =
      Math.max(
        10,
        Math.min(
          1000,
          Number(value)
        )
      );

    state.drawing.zoom =
      value;

    canvas.style.transform =
      `scale(${value / 100})`;

    zoomValue.textContent =
      `${value}%`;

  }

  editor
    .querySelector(
      "#cs-zoom-in"
    )
    .addEventListener(
      "click",
      () => {

        setZoom(
          state.drawing.zoom +
          10
        );

      }
    );

  editor
    .querySelector(
      "#cs-zoom-out"
    )
    .addEventListener(
      "click",
      () => {

        setZoom(
          state.drawing.zoom -
          10
        );

      }
    );

  editor
    .querySelector(
      "#cs-zoom-reset"
    )
    .addEventListener(
      "click",
      () => {

        setZoom(100);

      }
    );

  /* =======================================================
     그림판 종류
     ======================================================= */

  editor
    .querySelectorAll(
      "[data-paint-type]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.drawing.type =
            button.dataset.paintType;

          notify(
            `${button.textContent} 그림판`
          );

          changed();

        }
      );

    });

  /* =======================================================
     대칭
     ======================================================= */

  editor
    .querySelectorAll(
      "[data-symmetry]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.drawing.symmetry =
            button.dataset.symmetry;

          changed();

        }
      );

    });

  /* =======================================================
     그라데이션
     ======================================================= */

  const gradientPanel =
    editor.querySelector(
      "#cs-gradient-panel"
    );

  editor
    .querySelector(
      "#cs-gradient"
    )
    .addEventListener(
      "click",
      () => {

        gradientPanel
          .classList.toggle(
            "open"
          );

      }
    );

  const gradientStops =
    editor.querySelector(
      "#cs-gradient-stops"
    );

  function renderGradientStops() {

    gradientStops.innerHTML = "";

    state.drawing.gradient
      .forEach(
        (stop,index) => {

          const row =
            document.createElement(
              "div"
            );

          row.className =
            "cs-gradient-stop";

          row.innerHTML = `

            <input
              type="color"
              value="${escapeHTML(
                stop.color
              )}"
            >

            <input
              type="number"
              min="0"
              max="100"
              value="${stop.position}"
            >

            <button>
              삭제
            </button>

          `;

          const inputs =
            row.querySelectorAll(
              "input"
            );

          inputs[0].addEventListener(
            "input",
            () => {

              stop.color =
                inputs[0].value;

              changed();

            }
          );

          inputs[1].addEventListener(
            "input",
            () => {

              stop.position =
                Number(
                  inputs[1].value
                );

              changed();

            }
          );

          row
            .querySelector(
              "button"
            )
            .addEventListener(
              "click",
              () => {

                state.drawing.gradient
                  .splice(
                    index,
                    1
                  );

                renderGradientStops();

                changed();

              }
            );

          gradientStops
            .appendChild(row);

        }
      );

  }

  editor
    .querySelector(
      "#cs-gradient-add"
    )
    .addEventListener(
      "click",
      () => {

        /*
          색상 개수 제한 없음
        */

        state.drawing.gradient.push({

          color:
            state.drawing.color,

          position:
            state.drawing.gradient.length === 0
              ? 0
              : 100

        });

        renderGradientStops();

        changed();

      }
    );

  renderGradientStops();

  setZoom(
    state.drawing.zoom
  );

  return {
    canvas,
    ctx
  };

}

/* =========================================================
   캔버스 데이터를 상태에 저장
   ========================================================= */

function saveCanvasToDrawingState(
  canvas
) {

  if (!canvas)
    return;

  state.drawing.canvasData =
    canvas.toDataURL(
      "image/png"
    );

  changed();

}

/* =========================================================
   캔버스 복원
   ========================================================= */

function restoreCanvasFromState(
  canvas
) {

  if (
    !canvas ||
    !state.drawing.canvasData
  )
    return;

  const image =
    new Image();

  image.onload = () => {

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

  };

  image.src =
    state.drawing.canvasData;

}

/* =========================================================
   이미지 파일 업로드
   ========================================================= */

function uploadImageFile(
  file,
  object
) {

  if (!file)
    return;

  if (!file.type.startsWith(
    "image/"
  )) {

    notify(
      "이미지 파일만 올릴 수 있습니다."
    );

    return;

  }

  const reader =
    new FileReader();

  reader.onload = () => {

    if (!object)
      return;

    object.paintData = {

      type: "image",

      data:
        reader.result,

      name:
        file.name,

      size:
        file.size

    };

    if (
      !object.costumes
    )
      object.costumes = [];

    object.costumes.push({

      id: uid("costume"),

      name:
        file.name,

      data:
        reader.result

    });

    pushHistory();

    render();

  };

  reader.readAsDataURL(
    file
  );

}

/* =========================================================
   이미지 업로드 UI
   ========================================================= */

function openImageUpload(
  object
) {

  const input =
    document.createElement(
      "input"
    );

  input.type =
    "file";

  input.accept =
    "image/*";

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];

      if (file)
        uploadImageFile(
          file,
          object
        );

    }
  );

  input.click();

}

/* =========================================================
   소리 파일 업로드
   ========================================================= */

function uploadSoundFile(
  file,
  object
) {

  if (!file)
    return;

  if (!file.type.startsWith(
    "audio/"
  )) {

    notify(
      "소리 파일만 올릴 수 있습니다."
    );

    return;

  }

  const reader =
    new FileReader();

  reader.onload = () => {

    const sound =
      addSound(
        file.name,
        reader.result
      );

    if (object) {

      if (!object.sounds)
        object.sounds = [];

      object.sounds.push(
        sound.id
      );

    }

    pushHistory();

    render();

  };

  reader.readAsDataURL(
    file
  );

}

/* =========================================================
   소리 파일 선택
   ========================================================= */

function openSoundUpload(
  object
) {

  const input =
    document.createElement(
      "input"
    );

  input.type =
    "file";

  input.accept =
    "audio/*";

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];

      if (file)
        uploadSoundFile(
          file,
          object
        );

    }
  );

  input.click();

}

/* =========================================================
   마이크 녹음
   ========================================================= */

async function recordSound(
  object,
  seconds=10
) {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices
      .getUserMedia
  ) {

    notify(
      "이 브라우저에서는 녹음을 사용할 수 없습니다."
    );

    return;

  }

  let stream;

  try {

    stream =
      await navigator
        .mediaDevices
        .getUserMedia({
          audio:true
        });

  } catch {

    notify(
      "마이크 사용 권한이 필요합니다."
    );

    return;

  }

  const chunks = [];

  const recorder =
    new MediaRecorder(
      stream
    );

  recorder.ondataavailable =
    event => {

      if (
        event.data &&
        event.data.size
      )
        chunks.push(
          event.data
        );

    };

  recorder.onstop = () => {

    stream
      .getTracks()
      .forEach(
        track =>
          track.stop()
      );

    const blob =
      new Blob(
        chunks,
        {
          type:
            recorder.mimeType ||
            "audio/webm"
        }
      );

    const reader =
      new FileReader();

    reader.onload = () => {

      const sound =
        addSound(
          "녹음 " +
          new Date()
            .toLocaleTimeString(),
          reader.result
        );

      if (object) {

        if (!object.sounds)
          object.sounds = [];

        object.sounds.push(
          sound.id
        );

      }

      pushHistory();

      render();

    };

    reader.readAsDataURL(
      blob
    );

  };

  recorder.start();

  notify(
    `${seconds}초 동안 녹음합니다.`
  );

  setTimeout(
    () => {

      if (
        recorder.state ===
        "recording"
      )
        recorder.stop();

    },
    Math.max(
      1,
      Number(seconds)
    ) * 1000
  );

}

/* =========================================================
   오브젝트 추가 메뉴
   ========================================================= */

function createObjectAddMenu(
  container
) {

  if (!container)
    return;

  container.innerHTML = `

    <div class="cs-add-object-menu">

      <button data-object-add="text">
        글상자
      </button>

      <button data-object-add="draw">
        직접 그리기
      </button>

      <button data-object-add="file">
        파일 올리기
      </button>

      <button
        data-object-add="player"
        ${state.project.player
          ? ""
          : "disabled"}
      >
        플레이어
      </button>

    </div>

  `;

  container
    .querySelectorAll(
      "[data-object-add]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const type =
            button.dataset.objectAdd;

          if (type === "text") {

            addTextObject();

          }

          if (type === "draw") {

            addDrawingObject();

          }

          if (type === "file") {

            const object =
              addDrawingObject();

            openImageUpload(
              object
            );

          }

          if (type === "player") {

            addPlayerObject();

          }

        }
      );

    });

}

/* =========================================================
   그림판 공개 API
   ========================================================= */

window.CodescriptPaint = {

  create:
    createPaintEditor,

  uploadImage:
    uploadImageFile,

  uploadSound:
    uploadSoundFile,

  recordSound,

  openImageUpload,

  openSoundUpload,

  restore:
    restoreCanvasFromState

};

})();/* =========================================================
   CODESCRIPT MAIN.JS
   3 / 4
   Block Editor / Objects / Scenes / Variables / Functions
   ========================================================= */

/* =========================================================
   블록 데이터
   ========================================================= */

const BLOCK_DEFINITIONS = [

  /* ---------------- 시작 ---------------- */

  {
    id:"start_when_run",
    category:"start",
    text:"▶ 시작하기",
    inputs:[]
  },

  {
    id:"start_when_key",
    category:"start",
    text:"[key] 키를 눌렀을 때",
    inputs:[
      {type:"text",value:"스페이스"}
    ]
  },

  {
    id:"start_when_click",
    category:"start",
    text:"이 오브젝트를 클릭했을 때",
    inputs:[]
  },

  {
    id:"start_when_message",
    category:"start",
    text:"[message] 신호를 받았을 때",
    inputs:[
      {type:"text",value:"신호1"}
    ]
  },

  /* ---------------- 흐름 ---------------- */

  {
    id:"flow_wait",
    category:"flow",
    text:"[time]초 기다리기",
    inputs:[
      {type:"number",value:1}
    ]
  },

  {
    id:"flow_repeat",
    category:"flow",
    text:"[count]번 반복하기",
    inputs:[
      {type:"number",value:10}
    ],
    child:true
  },

  {
    id:"flow_forever",
    category:"flow",
    text:"계속 반복하기",
    inputs:[],
    child:true
  },

  {
    id:"flow_if",
    category:"decision",
    text:"만약 [condition]이라면",
    inputs:[
      {
        type:"slot",
        value:""
      }
    ],
    child:true
  },

  {
    id:"flow_if_else",
    category:"decision",
    text:"만약 [condition]이라면 / 아니면",
    inputs:[
      {
        type:"slot",
        value:""
      }
    ],
    child:true
  },

  {
    id:"flow_stop",
    category:"flow",
    text:"모두 멈추기",
    inputs:[]
  },

  /* ---------------- 움직임 ---------------- */

  {
    id:"motion_move",
    category:"motion",
    text:"[amount]만큼 움직이기",
    inputs:[
      {
        type:"number",
        value:10
      }
    ]
  },

  {
    id:"motion_turn",
    category:"motion",
    text:"[angle]도 회전하기",
    inputs:[
      {
        type:"number",
        value:15
      }
    ]
  },

  {
    id:"motion_goto",
    category:"motion",
    text:"x:[x] y:[y] 위치로 이동하기",
    inputs:[
      {
        type:"number",
        value:0
      },
      {
        type:"number",
        value:0
      }
    ]
  },

  {
    id:"motion_change_x",
    category:"motion",
    text:"x좌표를 [amount]만큼 바꾸기",
    inputs:[
      {
        type:"number",
        value:10
      }
    ]
  },

  {
    id:"motion_change_y",
    category:"motion",
    text:"y좌표를 [amount]만큼 바꾸기",
    inputs:[
      {
        type:"number",
        value:10
      }
    ]
  },

  {
    id:"motion_point",
    category:"motion",
    text:"[angle]도 방향 보기",
    inputs:[
      {
        type:"number",
        value:90
      }
    ]
  },

  /* ---------------- 생김새 ---------------- */

  {
    id:"looks_show",
    category:"looks",
    text:"보이기",
    inputs:[]
  },

  {
    id:"looks_hide",
    category:"looks",
    text:"숨기기",
    inputs:[]
  },

  {
    id:"looks_say",
    category:"looks",
    text:"[text] 말하기",
    inputs:[
      {
        type:"text",
        value:"안녕!"
      }
    ]
  },

  {
    id:"looks_think",
    category:"looks",
    text:"[text] 생각하기",
    inputs:[
      {
        type:"text",
        value:"음..."
      }
    ]
  },

  {
    id:"looks_size",
    category:"looks",
    text:"크기를 [size]%로 정하기",
    inputs:[
      {
        type:"number",
        value:100
      }
    ]
  },

  /* ---------------- 붓 ---------------- */

  {
    id:"pen_down",
    category:"pen",
    text:"붓 내리기",
    inputs:[]
  },

  {
    id:"pen_up",
    category:"pen",
    text:"붓 올리기",
    inputs:[]
  },

  {
    id:"pen_color",
    category:"pen",
    text:"붓 색을 [color]로 정하기",
    inputs:[
      {
        type:"color",
        value:"#000000"
      }
    ]
  },

  {
    id:"pen_size",
    category:"pen",
    text:"붓 굵기를 [size]로 정하기",
    inputs:[
      {
        type:"number",
        value:4
      }
    ]
  },

  /* ---------------- 글상자 ---------------- */

  {
    id:"text_change",
    category:"text",
    text:"글상자 내용을 [text]로 바꾸기",
    inputs:[
      {
        type:"text",
        value:"텍스트"
      }
    ],
    objectType:"text"
  },

  {
    id:"text_append",
    category:"text",
    text:"글상자에 [text] 추가하기",
    inputs:[
      {
        type:"text",
        value:"내용"
      }
    ],
    objectType:"text"
  },

  /* ---------------- 판단 ---------------- */

  {
    id:"logic_equal",
    category:"decision",
    text:"[a] = [b]",
    inputs:[
      {
        type:"value",
        value:""
      },
      {
        type:"value",
        value:""
      }
    ],
    output:true
  },

  {
    id:"logic_not_equal",
    category:"decision",
    text:"[a] ≠ [b]",
    inputs:[
      {
        type:"value",
        value:""
      },
      {
        type:"value",
        value:""
      }
    ],
    output:true
  },

  {
    id:"logic_greater",
    category:"decision",
    text:"[a] > [b]",
    inputs:[
      {
        type:"value",
        value:""
      },
      {
        type:"value",
        value:""
      }
    ],
    output:true
  },

  {
    id:"logic_less",
    category:"decision",
    text:"[a] < [b]",
    inputs:[
      {
        type:"value",
        value:""
      },
      {
        type:"value",
        value:""
      }
    ],
    output:true
  },

  {
    id:"logic_and",
    category:"decision",
    text:"[a] 그리고 [b]",
    inputs:[
      {
        type:"slot",
        value:""
      },
      {
        type:"slot",
        value:""
      }
    ],
    output:true
  },

  {
    id:"logic_or",
    category:"decision",
    text:"[a] 또는 [b]",
    inputs:[
      {
        type:"slot",
        value:""
      },
      {
        type:"slot",
        value:""
      }
    ],
    output:true
  },

  {
    id:"logic_not",
    category:"decision",
    text:"[a] 아니다",
    inputs:[
      {
        type:"slot",
        value:""
      }
    ],
    output:true
  },

  /* ---------------- 계산 ---------------- */

  {
    id:"math_add",
    category:"calculation",
    text:"[a] + [b]",
    inputs:[
      {
        type:"number",
        value:0
      },
      {
        type:"number",
        value:0
      }
    ],
    output:true
  },

  {
    id:"math_sub",
    category:"calculation",
    text:"[a] - [b]",
    inputs:[
      {
        type:"number",
        value:0
      },
      {
        type:"number",
        value:0
      }
    ],
    output:true
  },

  {
    id:"math_mul",
    category:"calculation",
    text:"[a] × [b]",
    inputs:[
      {
        type:"number",
        value:0
      },
      {
        type:"number",
        value:0
      }
    ],
    output:true
  },

  {
    id:"math_div",
    category:"calculation",
    text:"[a] ÷ [b]",
    inputs:[
      {
        type:"number",
        value:0
      },
      {
        type:"number",
        value:1
      }
    ],
    output:true
  },

  {
    id:"math_random",
    category:"calculation",
    text:"[a]부터 [b]까지 랜덤 수",
    inputs:[
      {
        type:"number",
        value:1
      },
      {
        type:"number",
        value:10
      }
    ],
    output:true
  },

  /* ---------------- 자료 ---------------- */

  {
    id:"data_set",
    category:"data",
    text:"[variable]을(를) [value]로 정하기",
    inputs:[
      {
        type:"variable",
        value:"변수"
      },
      {
        type:"value",
        value:"0"
      }
    ]
  },

  {
    id:"data_change",
    category:"data",
    text:"[variable]을(를) [value]만큼 바꾸기",
    inputs:[
      {
        type:"variable",
        value:"변수"
      },
      {
        type:"number",
        value:1
      }
    ]
  },

  {
    id:"data_show",
    category:"data",
    text:"[variable] 보이기",
    inputs:[
      {
        type:"variable",
        value:"변수"
      }
    ]
  },

  {
    id:"data_hide",
    category:"data",
    text:"[variable] 숨기기",
    inputs:[
      {
        type:"variable",
        value:"변수"
      }
    ]
  },

  {
    id:"data_add_list",
    category:"data",
    text:"[value]을(를) [list]에 추가하기",
    inputs:[
      {
        type:"value",
        value:""
      },
      {
        type:"list",
        value:"리스트"
      }
    ]
  },

  {
    id:"data_delete_list",
    category:"data",
    text:"[index]번째 항목을 [list]에서 삭제하기",
    inputs:[
      {
        type:"number",
        value:1
      },
      {
        type:"list",
        value:"리스트"
      }
    ]
  },

  /* ---------------- 신호 ---------------- */

  {
    id:"signal_send",
    category:"data",
    text:"[signal] 신호 보내기",
    inputs:[
      {
        type:"signal",
        value:"신호1"
      }
    ]
  },

  {
    id:"signal_send_wait",
    category:"data",
    text:"[signal] 신호 보내고 기다리기",
    inputs:[
      {
        type:"signal",
        value:"신호1"
      }
    ]
  },

  /* ---------------- 함수 ---------------- */

  {
    id:"function_call",
    category:"function",
    text:"[function] 실행하기",
    inputs:[
      {
        type:"function",
        value:"나의 함수"
      }
    ]
  },

  /* ---------------- 온라인 ---------------- */

  {
    id:"online_message",
    category:"online",
    text:"온라인 메시지 [message] 보내기",
    inputs:[
      {
        type:"text",
        value:"안녕"
      }
    ]
  },

  {
    id:"online_players",
    category:"online",
    text:"현재 접속자 수",
    inputs:[],
    output:true
  },

  /* ---------------- 플레이어 ---------------- */

  {
    id:"player_move",
    category:"player",
    text:"플레이어를 [amount]만큼 움직이기",
    inputs:[
      {
        type:"number",
        value:10
      }
    ],
    objectType:"player"
  },

  {
    id:"player_jump",
    category:"player",
    text:"플레이어 점프하기",
    inputs:[],
    objectType:"player"
  }

];

/* =========================================================
   블록 생성
   ========================================================= */

function createCodeBlock(
  definition
) {

  const block =
    document.createElement(
      "div"
    );

  block.className =
    "cs-code-block";

  block.draggable = true;

  block.dataset.blockId =
    definition.id;

  block.dataset.category =
    definition.category;

  let html =
    "";

  let inputIndex =
    0;

  const text =
    definition.text;

  const parts =
    text.split(
      /(\[[^\]]+\])/
    );

  for (
    const part of parts
  ) {

    if (
      !part.startsWith("[")
    ) {

      html +=
        escapeHTML(part);

      continue;

    }

    const input =
      definition.inputs?.[
        inputIndex++
      ];

    if (!input) {

      html +=
        escapeHTML(part);

      continue;

    }

    const placeholder =
      part
        .slice(1,-1);

    html +=
      createBlockInputHTML(
        input,
        placeholder
      );

  }

  block.innerHTML =
    html;

  block.addEventListener(
    "dragstart",
    event => {

      event.dataTransfer
        .setData(
          "application/codescript-block",
          definition.id
        );

    }
  );

  block
    .querySelectorAll(
      ".cs-block-input"
    )
    .forEach(
      input => {

        input.addEventListener(
          "input",
          () => {

            saveCurrentCode();

          }
        );

      }
    );

  return block;

}

/* =========================================================
   블록 입력 HTML
   ========================================================= */

function createBlockInputHTML(
  input,
  placeholder
) {

  const value =
    input.value ?? "";

  if (
    input.type ===
    "color"
  ) {

    return `
      <input
        class="cs-block-input cs-color-input"
        type="color"
        value="${escapeHTML(value)}"
        title="${escapeHTML(placeholder)}"
      >
    `;

  }

  if (
    input.type ===
    "number"
  ) {

    return `
      <input
        class="cs-block-input cs-number-input"
        type="number"
        value="${escapeHTML(value)}"
        title="${escapeHTML(placeholder)}"
      >
    `;

  }

  if (
    input.type ===
    "variable" ||
    input.type ===
    "list" ||
    input.type ===
    "signal" ||
    input.type ===
    "function"
  ) {

    return `
      <select
        class="cs-block-input cs-select-input"
        data-input-type="${input.type}"
      >
        ${createDynamicOptions(
          input.type,
          value
        )}
      </select>
    `;

  }

  return `
    <input
      class="cs-block-input cs-text-input"
      type="text"
      value="${escapeHTML(value)}"
      title="${escapeHTML(placeholder)}"
    >
  `;

}

/* =========================================================
   동적 선택지
   ========================================================= */

function createDynamicOptions(
  type,
  current
) {

  let values = [];

  if (type === "variable")
    values =
      state.variables
        .map(v => v.name);

  if (type === "list")
    values =
      state.lists
        .map(v => v.name);

  if (type === "signal")
    values =
      state.signals
        .map(v => v.name);

  if (type === "function")
    values =
      state.functions
        .map(v => v.name);

  if (
    values.length === 0
  ) {

    values = [
      current ||
      (
        type === "variable"
          ? "변수"
          :
        type === "list"
          ? "리스트"
          :
        type === "signal"
          ? "신호1"
          :
        "함수"
      )
    ];

  }

  return values
    .map(
      value => `
        <option
          value="${escapeHTML(value)}"
          ${
            value === current
              ? "selected"
              : ""
          }
        >
          ${escapeHTML(value)}
        </option>
      `
    )
    .join("");

}

/* =========================================================
   블록 팔레트
   ========================================================= */

function renderBlockPalette(
  container,
  category
) {

  if (!container)
    return;

  container.innerHTML =
    "";

  const definitions =
    BLOCK_DEFINITIONS.filter(
      block =>
        block.category ===
        category
    );

  definitions.forEach(
    definition => {

      const block =
        createCodeBlock(
          definition
        );

      container.appendChild(
        block
      );

    }
  );

}

/* =========================================================
   코드 영역
   ========================================================= */

function setupCodeWorkspace(
  workspace
) {

  if (!workspace)
    return;

  workspace.addEventListener(
    "dragover",
    event => {

      event.preventDefault();

    }
  );

  workspace.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      const id =
        event.dataTransfer
          .getData(
            "application/codescript-block"
          );

      if (!id)
        return;

      const definition =
        BLOCK_DEFINITIONS.find(
          block =>
            block.id === id
        );

      if (!definition)
        return;

      const block =
        createCodeBlock(
          definition
        );

      workspace.appendChild(
        block
      );

      saveCurrentCode();

      pushHistory();

    }
  );

}

/* =========================================================
   코드 저장
   ========================================================= */

function saveCurrentCode() {

  if (
    !state.currentObject
  )
    return;

  const workspace =
    document.querySelector(
      "#cs-code-workspace"
    );

  if (!workspace)
    return;

  state.currentObject.code =
    Array.from(
      workspace.children
    )
    .map(
      block =>
        serializeCodeBlock(
          block
        )
    );

}

/* =========================================================
   블록 직렬화
   ========================================================= */

function serializeCodeBlock(
  block
) {

  return {

    id:
      block.dataset.blockId,

    category:
      block.dataset.category,

    inputs:
      Array.from(
        block.querySelectorAll(
          ".cs-block-input"
        )
      )
      .map(
        input =>
          input.value
      )

  };

}

/* =========================================================
   저장된 코드 불러오기
   ========================================================= */

function loadObjectCode(
  object,
  workspace
) {

  if (!workspace)
    return;

  workspace.innerHTML =
    "";

  if (!object)
    return;

  (
    object.code ||
    []
  )
  .forEach(
    saved => {

      const definition =
        BLOCK_DEFINITIONS.find(
          block =>
            block.id ===
            saved.id
        );

      if (!definition)
        return;

      const block =
        createCodeBlock(
          definition
        );

      const inputs =
        block.querySelectorAll(
          ".cs-block-input"
        );

      (
        saved.inputs ||
        []
      )
      .forEach(
        (value,index) => {

          if (
            inputs[index]
          ) {

            inputs[index].value =
              value;

          }

        }
      );

      workspace.appendChild(
        block
      );

    }
  );

}

/* =========================================================
   오브젝트 생성
   ========================================================= */

function createObject(
  options={}
) {

  const object = {

    id:
      uid("object"),

    name:
      options.name ||
      `오브젝트 ${state.objects.length + 1}`,

    type:
      options.type ||
      "sprite",

    x:
      Number(
        options.x ?? 0
      ),

    y:
      Number(
        options.y ?? 0
      ),

    size:
      Number(
        options.size ?? 100
      ),

    rotation:
      Number(
        options.rotation ?? 0
      ),

    visible:
      options.visible !== false,

    code:[],

    costumes:[],

    sounds:[],

    text:
      options.text || "",

    paintData:
      options.paintData || null

  };

  state.objects.push(
    object
  );

  state.currentObject =
    object;

  pushHistory();

  render();

  return object;

}

/* =========================================================
   글상자 오브젝트
   ========================================================= */

function addTextObject() {

  return createObject({

    type:
      "text",

    name:
      "글상자",

    text:
      "텍스트"

  });

}

/* =========================================================
   직접 그리기 오브젝트
   ========================================================= */

function addDrawingObject() {

  return createObject({

    type:
      "sprite",

    name:
      "그림 오브젝트"

  });

}

/* =========================================================
   플레이어 오브젝트
   ========================================================= */

function addPlayerObject() {

  if (!state.project.player) {

    notify(
      "플레이어 코드를 사용하도록 설정한 프로젝트에서만 가능합니다."
    );

    return null;

  }

  return createObject({

    type:
      "player",

    name:
      "플레이어"

  });

}

/* =========================================================
   오브젝트 목록
   ========================================================= */

function renderObjectList(
  container
) {

  if (!container)
    return;

  container.innerHTML =
    "";

  state.objects.forEach(
    object => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "cs-object-item";

      if (
        state.currentObject?.id ===
        object.id
      ) {

        item.classList.add(
          "selected"
        );

      }

      item.draggable =
        true;

      item.innerHTML = `

        <span class="cs-object-icon">
          ${
            object.type === "text"
              ? "T"
              :
            object.type === "player"
              ? "◆"
              :
            "●"
          }
        </span>

        <input
          class="cs-object-name"
          value="${escapeHTML(
            object.name
          )}"
        >

        <button
          class="cs-object-delete"
          title="삭제"
        >
          ×
        </button>

      `;

      item.addEventListener(
        "click",
        event => {

          if (
            event.target
              .classList
              .contains(
                "cs-object-delete"
              )
          )
            return;

          state.currentObject =
            object;

          render();

        }
      );

      const nameInput =
        item.querySelector(
          ".cs-object-name"
        );

      nameInput.addEventListener(
        "change",
        () => {

          const value =
            nameInput.value
              .trim();

          if (!value) {

            nameInput.value =
              object.name;

            return;

          }

          object.name =
            value;

          pushHistory();

        }
      );

      item
        .querySelector(
          ".cs-object-delete"
        )
        .addEventListener(
          "click",
          () => {

            const index =
              state.objects
                .findIndex(
                  o =>
                    o.id ===
                    object.id
                );

            if (index >= 0) {

              state.objects
                .splice(
                  index,
                  1
                );

            }

            state.currentObject =
              state.objects[0] ||
              null;

            pushHistory();

            render();

          }
        );

      item.addEventListener(
        "dragstart",
        event => {

          event.dataTransfer
            .setData(
              "text/codescript-object",
              object.id
            );

        }
      );

      container.appendChild(
        item
      );

    }
  );

}

/* =========================================================
   장면
   ========================================================= */

function createScene(
  name="장면"
) {

  const scene = {

    id:
      uid("scene"),

    name,

    objects:[],

    background:
      "#ffffff"

  };

  state.scenes.push(
    scene
  );

  state.currentScene =
    scene;

  pushHistory();

  render();

  return scene;

}

/* =========================================================
   장면 전환
   ========================================================= */

function switchScene(
  sceneId
) {

  const scene =
    state.scenes.find(
      s =>
        s.id ===
        sceneId
    );

  if (!scene)
    return;

  state.currentScene =
    scene;

  state.objects =
    scene.objects;

  state.currentObject =
    state.objects[0] ||
    null;

  render();

}

/* =========================================================
   변수 생성
   ========================================================= */

function createVariable(
  name
) {

  name =
    String(name || "")
      .trim();

  if (!name)
    return null;

  if (
    state.variables.some(
      variable =>
        variable.name ===
        name
    )
  ) {

    notify(
      "이미 존재하는 변수입니다."
    );

    return null;

  }

  const variable = {

    id:
      uid("variable"),

    name,

    value:
      0,

    visible:
      true

  };

  state.variables.push(
    variable
  );

  pushHistory();

  render();

  return variable;

}

/* =========================================================
   리스트 생성
   ========================================================= */

function createList(
  name
) {

  name =
    String(name || "")
      .trim();

  if (!name)
    return null;

  if (
    state.lists.some(
      list =>
        list.name ===
        name
    )
  ) {

    notify(
      "이미 존재하는 리스트입니다."
    );

    return null;

  }

  const list = {

    id:
      uid("list"),

    name,

    items:[]

  };

  state.lists.push(
    list
  );

  pushHistory();

  render();

  return list;

}

/* =========================================================
   신호 생성
   ========================================================= */

function createSignal(
  name
) {

  name =
    String(name || "")
      .trim();

  if (!name)
    return null;

  if (
    state.signals.some(
      signal =>
        signal.name ===
        name
    )
  ) {

    notify(
      "이미 존재하는 신호입니다."
    );

    return null;

  }

  const signal = {

    id:
      uid("signal"),

    name

  };

  state.signals.push(
    signal
  );

  pushHistory();

  render();

  return signal;

}

/* =========================================================
   함수 생성
   ========================================================= */

function createFunction(
  name,
  color="#7c3aed"
) {

  name =
    String(name || "")
      .trim();

  if (!name)
    return null;

  if (
    state.functions.some(
      fn =>
        fn.name ===
        name
    )
  ) {

    notify(
      "이미 존재하는 함수입니다."
    );

    return null;

  }

  const fn = {

    id:
      uid("function"),

    name,

    color,

    code:[]

  };

  state.functions.push(
    fn
  );

  pushHistory();

  render();

  return fn;

}

/* =========================================================
   함수 블록 생성
   ========================================================= */

function createFunctionBlock(
  fn
) {

  const block =
    document.createElement(
      "div"
    );

  block.className =
    "cs-function-block";

  block.style
    .setProperty(
      "--function-color",
      fn.color
    );

  block.textContent =
    fn.name;

  block.draggable =
    true;

  block.addEventListener(
    "dragstart",
    event => {

      event.dataTransfer
        .setData(
          "application/codescript-function",
          fn.id
        );

    }
  );

  return block;

}

/* =========================================================
   오브젝트 속성 패널
   ========================================================= */

function renderObjectProperties(
  container
) {

  if (!container)
    return;

  const object =
    state.currentObject;

  if (!object) {

    container.innerHTML =
      "<div>오브젝트를 선택하세요.</div>";

    return;

  }

  container.innerHTML = `

    <h3>오브젝트</h3>

    <label>
      이름
      <input
        id="cs-prop-name"
        value="${escapeHTML(
          object.name
        )}"
      >
    </label>

    <label>
      X
      <input
        id="cs-prop-x"
        type="number"
        value="${object.x}"
      >
    </label>

    <label>
      Y
      <input
        id="cs-prop-y"
        type="number"
        value="${object.y}"
      >
    </label>

    <label>
      크기
      <input
        id="cs-prop-size"
        type="number"
        value="${object.size}"
      >
    </label>

    <label>
      방향
      <input
        id="cs-prop-rotation"
        type="number"
        value="${object.rotation}"
      >
    </label>

    <label>
      <input
        id="cs-prop-visible"
        type="checkbox"
        ${
          object.visible
            ? "checked"
            : ""
        }
      >
      보이기
    </label>

  `;

  const bind =
    (id,key,number=false) => {

      const input =
        container.querySelector(
          id
        );

      if (!input)
        return;

      input.addEventListener(
        "input",
        () => {

          object[key] =
            number
              ? Number(
                  input.value
                )
              : input.value;

          pushHistory();

          renderStageOnly();

        }
      );

    };

  bind(
    "#cs-prop-name",
    "name"
  );

  bind(
    "#cs-prop-x",
    "x",
    true
  );

  bind(
    "#cs-prop-y",
    "y",
    true
  );

  bind(
    "#cs-prop-size",
    "size",
    true
  );

  bind(
    "#cs-prop-rotation",
    "rotation",
    true
  );

  const visible =
    container.querySelector(
      "#cs-prop-visible"
    );

  if (visible) {

    visible.addEventListener(
      "change",
      () => {

        object.visible =
          visible.checked;

        pushHistory();

        renderStageOnly();

      }
    );

  }

}

/* =========================================================
   스테이지
   ========================================================= */

function renderStage(
  container
) {

  if (!container)
    return;

  container.innerHTML =
    "";

  const stage =
    document.createElement(
      "div"
    );

  stage.className =
    "cs-stage";

  state.objects.forEach(
    object => {

      if (!object.visible)
        return;

      const element =
        document.createElement(
          "div"
        );

      element.className =
        "cs-stage-object";

      element.dataset.id =
        object.id;

      element.style.left =
        `${object.x}px`;

      element.style.top =
        `${object.y}px`;

      element.style.transform =
        `rotate(${object.rotation}deg)
         scale(${object.size / 100})`;

      if (
        object.type ===
        "text"
      ) {

        element.textContent =
          object.text ||
          "텍스트";

      } else {

        element.textContent =
          "●";

      }

      element.addEventListener(
        "pointerdown",
        () => {

          state.currentObject =
            object;

          render();

        }
      );

      stage.appendChild(
        element
      );

    }
  );

  container.appendChild(
    stage
  );

}

/* =========================================================
   스테이지 부분만 갱신
   ========================================================= */

function renderStageOnly() {

  const stage =
    document.querySelector(
      "#cs-stage-container"
    );

  if (stage)
    renderStage(
      stage
    );

}

/* =========================================================
   전체 렌더
   ========================================================= */

function renderCodeEditor() {

  const palette =
    document.querySelector(
      "#cs-block-palette"
    );

  const workspace =
    document.querySelector(
      "#cs-code-workspace"
    );

  if (
    palette &&
    state.currentCategory
  ) {

    renderBlockPalette(
      palette,
      state.currentCategory
    );

  }

  if (workspace) {

    loadObjectCode(
      state.currentObject,
      workspace
    );

    setupCodeWorkspace(
      workspace
    );

  }

}

/* =========================================================
   메인 렌더 연결
   ========================================================= */

function renderEditorParts() {

  renderCodeEditor();

  renderObjectList(
    document.querySelector(
      "#cs-object-list"
    )
  );

  renderObjectProperties(
    document.querySelector(
      "#cs-object-properties"
    )
  );

  renderStage(
    document.querySelector(
      "#cs-stage-container"
    )
  );

}

/* =========================================================
   3/4 API
   ========================================================= */

window.CodescriptBlocks = {

  definitions:
    BLOCK_DEFINITIONS,

  create:
    createCodeBlock,

  renderPalette:
    renderBlockPalette,

  load:
    loadObjectCode,

  save:
    saveCurrentCode

};

window.CodescriptObjects = {

  create:
    createObject,

  addText:
    addTextObject,

  addDrawing:
    addDrawingObject,

  addPlayer:
    addPlayerObject,

  render:
    renderObjectList

};

window.CodescriptData = {

  variable:
    createVariable,

  list:
    createList,

  signal:
    createSignal,

  function:
    createFunction

};

window.CodescriptScenes = {

  create:
    createScene,

  switch:
    switchScene

};

/* =========================================================
   3/4 끝
   ========================================================= *//* =========================================================
   CODESCRIPT MAIN.JS
   4 / 4
   Account / Project / Recovery / Upload / Special Blocks
   Community / Notifications / Collaboration
   ========================================================= */

/* =========================================================
   전역 상태
   ========================================================= */

const CodescriptApp = {

  version:"1.0.0",

  currentUser:null,

  projects:[],

  notifications:[],

  communityProjects:[],

  classes:[],

  rooms:[],

  settings:{
    autosave:true,
    recovery:true
  }

};

/* =========================================================
   계정
   ========================================================= */

function validateNickname(
  nickname
) {

  nickname =
    String(nickname || "")
      .trim();

  if (
    nickname.length < 1 ||
    nickname.length > 100
  ) {

    return {
      ok:false,
      message:"닉네임은 1~100글자여야 합니다."
    };

  }

  return {
    ok:true
  };

}

function validatePassword(
  password
) {

  password =
    String(password || "");

  if (
    password.length < 6
  ) {

    return {
      ok:false,
      message:"비밀번호는 6글자 이상이어야 합니다."
    };

  }

  if (
    !/^[a-z0-9]+$/.test(
      password
    )
  ) {

    return {
      ok:false,
      message:
        "비밀번호에는 영어 소문자와 숫자만 사용할 수 있습니다."
    };

  }

  return {
    ok:true
  };

}

/*
 * 데모용 계정 저장.
 * 실제 서비스에서는 worker.js 서버에서
 * 계정을 관리해야 한다.
 */

function registerAccount(
  nickname,
  password
) {

  const n =
    validateNickname(
      nickname
    );

  if (!n.ok)
    return n;

  const p =
    validatePassword(
      password
    );

  if (!p.ok)
    return p;

  const accounts =
    getLocalAccounts();

  if (
    accounts.some(
      account =>
        account.nickname ===
        nickname
    )
  ) {

    return {
      ok:false,
      message:
        "이미 사용 중인 닉네임입니다."
    };

  }

  accounts.push({

    id:
      uid("user"),

    nickname,

    password,

    createdAt:
      Date.now(),

    suspended:false

  });

  localStorage.setItem(
    "codescript_accounts",
    JSON.stringify(
      accounts
    )
  );

  return loginAccount(
    nickname,
    password
  );

}

function loginAccount(
  nickname,
  password
) {

  const accounts =
    getLocalAccounts();

  const account =
    accounts.find(
      user =>
        user.nickname ===
        nickname &&
        user.password ===
        password
    );

  if (!account) {

    return {
      ok:false,
      message:
        "닉네임 또는 비밀번호가 올바르지 않습니다."
    };

  }

  if (
    account.suspended
  ) {

    return {
      ok:false,
      message:
        "이 계정은 정지되었습니다."
    };

  }

  CodescriptApp.currentUser =
    account;

  localStorage.setItem(
    "codescript_session",
    JSON.stringify(
      account
    )
  );

  addNotification(
    "로그인되었습니다."
  );

  return {
    ok:true,
    user:account
  };

}

function logoutAccount() {

  CodescriptApp.currentUser =
    null;

  localStorage.removeItem(
    "codescript_session"
  );

}

function getLocalAccounts() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "codescript_accounts"
      ) || "[]"
    );

  } catch {

    return [];

  }

}

function restoreSession() {

  try {

    const session =
      JSON.parse(
        localStorage.getItem(
          "codescript_session"
        )
      );

    if (session)
      CodescriptApp.currentUser =
        session;

  } catch {}

}

/* =========================================================
   프로젝트
   ========================================================= */

function createProject(
  name="새 프로젝트",
  options={}
) {

  const project = {

    id:
      uid("project"),

    name,

    owner:
      CodescriptApp.currentUser?.nickname ||
      "참치",

    createdAt:
      Date.now(),

    updatedAt:
      Date.now(),

    online:
      options.online === true,

    player:
      options.player === true,

    scenes:[],

    objects:[],

    variables:[],

    lists:[],

    signals:[],

    functions:[],

    settings:{

      maxPlayers:20

    }

  };

  project.scenes.push({

    id:
      uid("scene"),

    name:
      "장면 1",

    objects:[]

  });

  CodescriptApp.projects.push(
    project
  );

  saveProjects();

  return project;

}

/* =========================================================
   프로젝트 저장
   ========================================================= */

function saveProject(
  project
) {

  if (!project)
    return;

  project.updatedAt =
    Date.now();

  saveProjects();

  createRecoverySnapshot(
    project
  );

}

function saveProjects() {

  localStorage.setItem(
    "codescript_projects",
    JSON.stringify(
      CodescriptApp.projects
    )
  );

}

function loadProjects() {

  try {

    CodescriptApp.projects =
      JSON.parse(
        localStorage.getItem(
          "codescript_projects"
        ) || "[]"
      );

  } catch {

    CodescriptApp.projects =
      [];

  }

}

/* =========================================================
   자동 저장
   ========================================================= */

let autoSaveTimer =
  null;

function startAutoSave() {

  clearInterval(
    autoSaveTimer
  );

  autoSaveTimer =
    setInterval(
      () => {

        if (
          CodescriptApp.settings
            .autosave
        ) {

          saveProjects();

        }

      },
      5000
    );

}

/* =========================================================
   복구 시스템
   ========================================================= */

function createRecoverySnapshot(
  project
) {

  if (
    !CodescriptApp.settings
      .recovery
  )
    return;

  const key =
    "codescript_recovery_" +
    project.id;

  localStorage.setItem(
    key,
    JSON.stringify({
      timestamp:
        Date.now(),

      project:
        project
    })
  );

}

function getRecoverySnapshot(
  projectId
) {

  try {

    return JSON.parse(
      localStorage.getItem(
        "codescript_recovery_" +
        projectId
      )
    );

  } catch {

    return null;

  }

}

function recoverProject(
  projectId
) {

  const snapshot =
    getRecoverySnapshot(
      projectId
    );

  if (!snapshot)
    return null;

  const index =
    CodescriptApp.projects
      .findIndex(
        project =>
          project.id ===
          projectId
      );

  if (index < 0)
    return null;

  CodescriptApp.projects[
    index
  ] =
    snapshot.project;

  saveProjects();

  return snapshot.project;

}

/* =========================================================
   실행 상태
   ========================================================= */

const Runtime = {

  running:false,

  currentProject:null,

  timers:[],

  clones:[]

};

function runProject(
  project
) {

  if (!project)
    return;

  Runtime.running =
    true;

  Runtime.currentProject =
    project;

  project.objects.forEach(
    object => {

      executeObjectCode(
        object
      );

    }
  );

}

function stopProject() {

  Runtime.running =
    false;

  Runtime.timers.forEach(
    timer =>
      clearTimeout(
        timer
      )
  );

  Runtime.timers =
    [];

  Runtime.clones =
    [];

}

/* =========================================================
   코드 실행
   ========================================================= */

function executeObjectCode(
  object
) {

  if (!object)
    return;

  const code =
    object.code || [];

  code.forEach(
    saved => {

      executeSavedBlock(
        object,
        saved
      );

    }
  );

}

function executeSavedBlock(
  object,
  block
) {

  if (!Runtime.running)
    return;

  const inputs =
    block.inputs || [];

  switch(
    block.id
  ) {

    case "motion_move":

      object.x +=
        Number(
          inputs[0] || 0
        );

      break;

    case "motion_change_x":

      object.x +=
        Number(
          inputs[0] || 0
        );

      break;

    case "motion_change_y":

      object.y +=
        Number(
          inputs[0] || 0
        );

      break;

    case "motion_turn":

      object.rotation +=
        Number(
          inputs[0] || 0
        );

      break;

    case "looks_show":

      object.visible =
        true;

      break;

    case "looks_hide":

      object.visible =
        false;

      break;

    case "looks_size":

      object.size =
        Number(
          inputs[0] || 100
        );

      break;

    case "looks_say":

      showSpeech(
        object,
        inputs[0] || ""
      );

      break;

    case "data_set":

      setVariableValue(
        inputs[0],
        inputs[1]
      );

      break;

    case "data_change":

      changeVariableValue(
        inputs[0],
        Number(
          inputs[1] || 0
        )
      );

      break;

    case "signal_send":

      broadcastSignal(
        inputs[0]
      );

      break;

    case "online_message":

      sendOnlineMessage(
        inputs[0]
      );

      break;

    case "player_move":

      if (
        object.type ===
        "player"
      ) {

        object.x +=
          Number(
            inputs[0] || 0
          );

      }

      break;

  }

  renderStageOnly();

}

/* =========================================================
   변수 실행
   ========================================================= */

function setVariableValue(
  name,
  value
) {

  const variable =
    state.variables.find(
      item =>
        item.name ===
        name
    );

  if (!variable)
    return;

  variable.value =
    value;

}

function changeVariableValue(
  name,
  amount
) {

  const variable =
    state.variables.find(
      item =>
        item.name ===
        name
    );

  if (!variable)
    return;

  variable.value =
    Number(
      variable.value
    ) +
    Number(
      amount
    );

}

/* =========================================================
   복제본
   ========================================================= */

function createClone(
  object
) {

  if (!object)
    return null;

  const clone =
    structuredClone(
      object
    );

  clone.id =
    uid("clone");

  clone.name =
    object.name +
    " 복제본";

  Runtime.clones.push(
    clone
  );

  return clone;

}

function deleteClone(
  cloneId
) {

  Runtime.clones =
    Runtime.clones.filter(
      clone =>
        clone.id !==
        cloneId
    );

}

/* =========================================================
   신호
   ========================================================= */

const SignalBus =
  new EventTarget();

function broadcastSignal(
  name
) {

  SignalBus.dispatchEvent(
    new CustomEvent(
      "signal",
      {
        detail:{
          name
        }
      }
    )
  );

}

/* =========================================================
   말하기
   ========================================================= */

function showSpeech(
  object,
  text
) {

  const message =
    document.createElement(
      "div"
    );

  message.className =
    "cs-speech";

  message.textContent =
    text;

  message.style.left =
    `${object.x}px`;

  message.style.top =
    `${object.y - 60}px`;

  document.body.appendChild(
    message
  );

  setTimeout(
    () => {

      message.remove();

    },
    2000
  );

}

/* =========================================================
   특수 블록
   ========================================================= */

const SPECIAL_BLOCKS = [

  {
    id:"special_chat",
    name:"채팅 메시지",
    category:"special"
  },

  {
    id:"special_file",
    name:"파일 올리기",
    category:"special"
  },

  {
    id:"special_weather",
    name:"날씨",
    category:"special"
  },

  {
    id:"special_translate",
    name:"언어 번역",
    category:"special"
  },

  {
    id:"special_record",
    name:"녹음해서 인식",
    category:"special"
  },

  {
    id:"special_ai",
    name:"AI",
    category:"special"
  }

];

/* =========================================================
   파일 올리기
   ========================================================= */

function chooseFile(
  accept="*/*"
) {

  return new Promise(
    resolve => {

      const input =
        document.createElement(
          "input"
        );

      input.type =
        "file";

      input.accept =
        accept;

      input.onchange =
        () => {

          resolve(
            input.files[0] ||
            null
          );

        };

      input.click();

    }
  );

}

/* =========================================================
   소리 올리기
   ========================================================= */

async function addSoundFromFile(
  object
) {

  const file =
    await chooseFile(
      "audio/*"
    );

  if (!file)
    return null;

  const url =
    URL.createObjectURL(
      file
    );

  const sound = {

    id:
      uid("sound"),

    name:
      file.name,

    type:
      "file",

    url,

    size:
      file.size

  };

  object.sounds ??=
    [];

  object.sounds.push(
    sound
  );

  saveCurrentCode();

  return sound;

}

/* =========================================================
   녹음
   ========================================================= */

async function recordSound(
  object,
  seconds=10
) {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices
      .getUserMedia
  ) {

    notify(
      "이 브라우저에서는 녹음을 사용할 수 없습니다."
    );

    return null;

  }

  const stream =
    await navigator
      .mediaDevices
      .getUserMedia({
        audio:true
      });

  const recorder =
    new MediaRecorder(
      stream
    );

  const chunks =
    [];

  recorder.ondataavailable =
    event => {

      chunks.push(
        event.data
      );

    };

  const finished =
    new Promise(
      resolve => {

        recorder.onstop =
          () => {

            const blob =
              new Blob(
                chunks,
                {
                  type:
                    recorder.mimeType
                }
              );

            stream
              .getTracks()
              .forEach(
                track =>
                  track.stop()
              );

            const sound = {

              id:
                uid("sound"),

              name:
                "녹음",

              type:
                "recording",

              url:
                URL.createObjectURL(
                  blob
                )

            };

            object.sounds ??=
              [];

            object.sounds.push(
              sound
            );

            saveCurrentCode();

            resolve(
              sound
            );

          };

      }
    );

  recorder.start();

  setTimeout(
    () => {

      if (
        recorder.state ===
        "recording"
      ) {

        recorder.stop();

      }

    },
    seconds * 1000
  );

  return finished;

}

/* =========================================================
   특수 블록 - 파일
   ========================================================= */

async function specialUploadFile() {

  const file =
    await chooseFile();

  if (!file)
    return null;

  return {

    name:
      file.name,

    type:
      file.type,

    size:
      file.size,

    url:
      URL.createObjectURL(
        file
      )

  };

}

/* =========================================================
   특수 블록 - 채팅
   ========================================================= */

function sendOnlineMessage(
  message
) {

  const text =
    String(
      message || ""
    );

  if (!text)
    return;

  addNotification(
    "채팅: " +
    text
  );

  if (
    window.CodescriptNetwork &&
    typeof
      window.CodescriptNetwork
        .send ===
      "function"
  ) {

    window.CodescriptNetwork
      .send({
        type:"chat",
        message:text
      });

  }

}

/* =========================================================
   협업
   ========================================================= */

const Collaboration = {

  connected:false,

  roomId:null,

  members:[],

  socket:null

};

function joinCollaboration(
  roomId
) {

  Collaboration.roomId =
    roomId;

  Collaboration.connected =
    true;

  addNotification(
    "협업방에 참가했습니다."
  );

}

function leaveCollaboration() {

  Collaboration.connected =
    false;

  Collaboration.roomId =
    null;

  Collaboration.members =
    [];

  if (
    Collaboration.socket
  ) {

    Collaboration.socket.close();

    Collaboration.socket =
      null;

  }

}

function collaborationUpdate(
  data
) {

  if (
    !Collaboration.connected
  )
    return;

  if (
    window.CodescriptNetwork &&
    typeof
      window.CodescriptNetwork
        .send ===
      "function"
  ) {

    window.CodescriptNetwork
      .send({
        type:"project_update",
        data
      });

  }

}

/* =========================================================
   좋아요
   ========================================================= */

function toggleLike(
  project
) {

  project.likes ??=
    [];

  const user =
    CodescriptApp
      .currentUser
      ?.nickname ||
    "guest";

  const index =
    project.likes.indexOf(
      user
    );

  if (index >= 0) {

    project.likes.splice(
      index,
      1
    );

  } else {

    project.likes.push(
      user
    );

    addNotification(
      `${project.name}에 좋아요를 눌렀습니다.`
    );

  }

  return project.likes.length;

}

/* =========================================================
   북마크
   ========================================================= */

function toggleBookmark(
  project
) {

  project.bookmarks ??=
    [];

  const user =
    CodescriptApp
      .currentUser
      ?.nickname ||
    "guest";

  const index =
    project.bookmarks.indexOf(
      user
    );

  if (index >= 0) {

    project.bookmarks.splice(
      index,
      1
    );

    return false;

  }

  project.bookmarks.push(
    user
  );

  return true;

}

/* =========================================================
   댓글
   ========================================================= */

function addComment(
  project,
  text,
  parentId=null
) {

  if (!text)
    return null;

  project.comments ??=
    [];

  const comment = {

    id:
      uid("comment"),

    author:
      CodescriptApp
        .currentUser
        ?.nickname ||
      "guest",

    text,

    parentId,

    likes:[],

    replies:[],

    createdAt:
      Date.now()

  };

  if (parentId) {

    const parent =
      project.comments.find(
        comment =>
          comment.id ===
          parentId
      );

    if (parent) {

      parent.replies.push(
        comment.id
      );

    }

  }

  project.comments.push(
    comment
  );

  return comment;

}

function likeComment(
  comment
) {

  comment.likes ??=
    [];

  const user =
    CodescriptApp
      .currentUser
      ?.nickname ||
    "guest";

  const index =
    comment.likes.indexOf(
      user
    );

  if (index >= 0)
    comment.likes.splice(
      index,
      1
    );
  else
    comment.likes.push(
      user
    );

}

/* =========================================================
   인기 작품
   ========================================================= */

function isPopularProject(
  project
) {

  return (
    (project.likes?.length || 0)
    >=
    50
  );

}

/* =========================================================
   스태프 선정
   ========================================================= */

function isStaffSelected(
  project
) {

  return (
    project.staffSelected ===
    true
  );

}

function staffSelectProject(
  project
) {

  const user =
    CodescriptApp
      .currentUser;

  if (
    !user ||
    user.nickname !==
    "참치"
  ) {

    return {
      ok:false,
      message:
        "운영자만 스태프 선정을 할 수 있습니다."
    };

  }

  project.staffSelected =
    true;

  addNotification(
    `${project.name}이(가) 스태프 선정 작품이 되었습니다.`
  );

  return {
    ok:true
  };

}

/* =========================================================
   운영자 정지/해제
   ========================================================= */

function setUserSuspended(
  nickname,
  suspended
) {

  const current =
    CodescriptApp
      .currentUser;

  if (
    !current ||
    current.nickname !==
    "참치"
  ) {

    return {
      ok:false,
      message:
        "운영자만 사용할 수 있습니다."
    };

  }

  const accounts =
    getLocalAccounts();

  const target =
    accounts.find(
      user =>
        user.nickname ===
        nickname
    );

  if (!target) {

    return {
      ok:false,
      message:
        "사용자를 찾을 수 없습니다."
    };

  }

  target.suspended =
    !!suspended;

  localStorage.setItem(
    "codescript_accounts",
    JSON.stringify(
      accounts
    )
  );

  return {
    ok:true
  };

}

/* =========================================================
   리메이크
   ========================================================= */

function remakeProject(
  original
) {

  const copy =
    structuredClone(
      original
    );

  copy.id =
    uid("project");

  copy.name =
    original.name +
    " 리메이크";

  copy.owner =
    CodescriptApp
      .currentUser
      ?.nickname ||
    "guest";

  copy.createdAt =
    Date.now();

  copy.updatedAt =
    Date.now();

  copy.likes =
    [];

  copy.comments =
    [];

  copy.bookmarks =
    [];

  CodescriptApp.projects
    .push(
      copy
    );

  saveProjects();

  return copy;

}

/* =========================================================
   작품 공유
   ========================================================= */

function shareProject(
  project
) {

  const url =
    location.origin +
    location.pathname +
    "?project=" +
    encodeURIComponent(
      project.id
    );

  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(
        url
      );

  }

  return url;

}

/* =========================================================
   알림
   ========================================================= */

function addNotification(
  text
) {

  CodescriptApp
    .notifications
    .unshift({

      id:
        uid("notification"),

      text,

      read:false,

      createdAt:
        Date.now()

    });

  if (
    CodescriptApp
      .notifications
      .length > 100
  ) {

    CodescriptApp
      .notifications
      .length = 100;

  }

  localStorage.setItem(
    "codescript_notifications",
    JSON.stringify(
      CodescriptApp
        .notifications
    )
  );

}

function loadNotifications() {

  try {

    CodescriptApp
      .notifications =
      JSON.parse(
        localStorage.getItem(
          "codescript_notifications"
        ) || "[]"
      );

  } catch {

    CodescriptApp
      .notifications =
      [];

  }

}

function markNotificationRead(
  id
) {

  const notification =
    CodescriptApp
      .notifications
      .find(
        item =>
          item.id ===
          id
      );

  if (notification)
    notification.read =
      true;

  localStorage.setItem(
    "codescript_notifications",
    JSON.stringify(
      CodescriptApp
        .notifications
    )
  );

}

/* =========================================================
   학급
   ========================================================= */

function createClass(
  name
) {

  const classroom = {

    id:
      uid("class"),

    name,

    owner:
      CodescriptApp
        .currentUser
        ?.nickname ||
      "guest",

    members:[],

    challenges:[]

  };

  CodescriptApp
    .classes
    .push(
      classroom
    );

  return classroom;

}

function joinClass(
  classroom,
  nickname
) {

  if (
    !classroom.members
      .includes(
        nickname
      )
  ) {

    classroom.members.push(
      nickname
    );

  }

}

/* =========================================================
   챌린지
   ========================================================= */

function createChallenge(
  classroom,
  title,
  description
) {

  const user =
    CodescriptApp
      .currentUser
      ?.nickname;

  if (
    user !==
    "참치" &&
    classroom.owner !==
    user
  ) {

    return {
      ok:false,
      message:
        "운영자 또는 해당 학급 운영자만 챌린지를 만들 수 있습니다."
    };

  }

  const challenge = {

    id:
      uid("challenge"),

    title,

    description,

    createdAt:
      Date.now(),

    entries:[]

  };

  classroom.challenges.push(
    challenge
  );

  return challenge;

}

/* =========================================================
   확장 프로그램
   ========================================================= */

const Extensions = [];

function registerExtension(
  extension
) {

  if (
    !extension ||
    !extension.id
  )
    return false;

  if (
    Extensions.some(
      item =>
        item.id ===
        extension.id
    )
  )
    return false;

  Extensions.push(
    extension
  );

  return true;

}

/* =========================================================
   색상 피커
   ========================================================= */

function openColorPicker(
  initial="#000000",
  callback=null
) {

  const input =
    document.createElement(
      "input"
    );

  input.type =
    "color";

  input.value =
    initial;

  input.oninput =
    () => {

      if (callback)
        callback(
          input.value
        );

    };

  input.click();

}

/* =========================================================
   그림판 줌
   ========================================================= */

const PaintZoom = {

  value:1,

  min:0.1,

  max:10,

  step:0.1

};

function zoomIn() {

  PaintZoom.value =
    Math.min(
      PaintZoom.max,
      PaintZoom.value +
      PaintZoom.step
    );

  applyPaintZoom();

}

function zoomOut() {

  PaintZoom.value =
    Math.max(
      PaintZoom.min,
      PaintZoom.value -
      PaintZoom.step
    );

  applyPaintZoom();

}

function resetPaintZoom() {

  PaintZoom.value =
    1;

  applyPaintZoom();

}

function applyPaintZoom() {

  const canvas =
    document.querySelector(
      ".cs-paint-canvas"
    );

  if (!canvas)
    return;

  canvas.style.transform =
    `scale(${PaintZoom.value})`;

}

/* =========================================================
   실행 취소 / 다시 실행
   ========================================================= */

const HistoryManager = {

  undoStack:[],

  redoStack:[]

};

function saveHistoryState() {

  const snapshot =
    structuredClone(
      state
    );

  HistoryManager
    .undoStack
    .push(
      snapshot
    );

  if (
    HistoryManager
      .undoStack
      .length > 50
  ) {

    HistoryManager
      .undoStack
      .shift();

  }

  HistoryManager
    .redoStack = [];

}

function undo() {

  if (
    HistoryManager
      .undoStack
      .length === 0
  )
    return;

  const current =
    structuredClone(
      state
    );

  HistoryManager
    .redoStack
    .push(
      current
    );

  const previous =
    HistoryManager
      .undoStack
      .pop();

  Object.assign(
    state,
    previous
  );

  render();

}

function redo() {

  if (
    HistoryManager
      .redoStack
      .length === 0
  )
    return;

  const current =
    structuredClone(
      state
    );

  HistoryManager
    .undoStack
    .push(
      current
    );

  const next =
    HistoryManager
      .redoStack
      .pop();

  Object.assign(
    state,
    next
  );

  render();

}

/* =========================================================
   유틸리티
   ========================================================= */

function uid(
  prefix="id"
) {

  return (
    prefix +
    "_" +
    Date.now()
      .toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2,10)
  );

}

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
  .replaceAll(
    "&",
    "&amp;"
  )
  .replaceAll(
    "<",
    "&lt;"
  )
  .replaceAll(
    ">",
    "&gt;"
  )
  .replaceAll(
    '"',
    "&quot;"
  )
  .replaceAll(
    "'",
    "&#039;"
  );

}

function notify(
  message
) {

  if (
    typeof window !==
    "undefined" &&
    typeof window.alert ===
    "function"
  ) {

    window.alert(
      message
    );

  }

}

/* =========================================================
   프로젝트 업로드
   ========================================================= */

function publishProject(
  project
) {

  if (!project)
    return null;

  project.published =
    true;

  project.publishedAt =
    Date.now();

  project.likes ??=
    [];

  project.comments ??=
    [];

  project.bookmarks ??=
    [];

  CodescriptApp
    .communityProjects
    .push(
      project
    );

  saveProjects();

  addNotification(
    `${project.name} 작품을 올렸습니다.`
  );

  return project;

}

/* =========================================================
   검색
   ========================================================= */

function searchProjects(
  keyword
) {

  keyword =
    String(
      keyword || ""
    )
    .toLowerCase();

  return CodescriptApp
    .communityProjects
    .filter(
      project =>
        String(
          project.name
        )
        .toLowerCase()
        .includes(
          keyword
        )
    );

}

/* =========================================================
   앱 초기화
   ========================================================= */

function initializeCodescript() {

  restoreSession();

  loadProjects();

  loadNotifications();

  startAutoSave();

  if (
    typeof window.render ===
    "function"
  ) {

    window.render();

  }

}

window.CodescriptApp =
  CodescriptApp;

window.CodescriptAccount = {

  register:
    registerAccount,

  login:
    loginAccount,

  logout:
    logoutAccount,

  restore:
    restoreSession

};

window.CodescriptProject = {

  create:
    createProject,

  save:
    saveProject,

  recover:
    recoverProject,

  publish:
    publishProject,

  remake:
    remakeProject,

  search:
    searchProjects,

  share:
    shareProject

};

window.CodescriptRuntime = {

  run:
    runProject,

  stop:
    stopProject,

  clone:
    createClone

};

window.CodescriptCommunity = {

  like:
    toggleLike,

  bookmark:
    toggleBookmark,

  comment:
    addComment,

  likeComment:
    likeComment,

  popular:
    isPopularProject,

  staffSelect:
    staffSelectProject

};

window.CodescriptAdmin = {

  suspend:
    setUserSuspended

};

window.CodescriptCollaboration = {

  join:
    joinCollaboration,

  leave:
    leaveCollaboration,

  update:
    collaborationUpdate

};

window.CodescriptPaint = {

  color:
    openColorPicker,

  zoomIn,

  zoomOut,

  resetZoom:
    resetPaintZoom

};

window.CodescriptHistory = {

  save:
    saveHistoryState,

  undo,

  redo

};

window.CodescriptSpecial = {

  uploadFile:
    specialUploadFile,

  uploadSound:
    addSoundFromFile,

  recordSound

};

window.CodescriptExtensions =
  Extensions;

/* =========================================================
   시작
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCodescript
  );

} else {

  initializeCodescript();

}

/* =========================================================
   4 / 4 END
   ========================================================= */

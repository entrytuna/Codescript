export class CodescriptRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
  }

  async fetch(request) {
    return new Response("CodescriptRoom OK");
  }
}

export class CodescriptServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.db = ctx.storage.sql;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        public INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/signup" && request.method === "POST") {
      return this.signup(request);
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      return this.login(request);
    }

    if (url.pathname === "/api/logout" && request.method === "POST") {
      return this.logout(request);
    }

    if (url.pathname === "/api/me") {
      return this.me(request);
    }

    if (url.pathname === "/api/projects" && request.method === "GET") {
      return this.listProjects(request);
    }

    if (url.pathname === "/api/projects" && request.method === "POST") {
      return this.saveProject(request);
    }

    if (url.pathname === "/ws") {
      return this.websocket(request);
    }

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "Codescript",
        version: "final"
      });
    }

    if (url.pathname === "/main.js") {
      return fetch(
        "https://raw.githubusercontent.com/entrytuna/Codescript/main/main.js"
      );
    }

    if (url.pathname === "/") {
      return new Response(HTML, {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }

  json(data, status = 200, extra = {}) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "content-type": "application/json;charset=UTF-8",
        ...extra
      }
    });
  }

  async body(request) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  async hashPassword(password) {
    const enc = new TextEncoder();

    const salt = crypto.getRandomValues(new Uint8Array(16));

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 120000,
        hash: "SHA-256"
      },
      key,
      256
    );

    return (
      "v1$" +
      this.hex(salt) +
      "$" +
      this.hex(new Uint8Array(bits))
    );
  }

  async verifyPassword(password, stored) {
    try {
      const parts = stored.split("$");

      if (parts.length !== 3) return false;

      const salt = this.fromHex(parts[1]);
      const expected = parts[2];

      const enc = new TextEncoder();

      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );

      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations: 120000,
          hash: "SHA-256"
        },
        key,
        256
      );

      return this.hex(new Uint8Array(bits)) === expected;
    } catch {
      return false;
    }
  }

  hex(bytes) {
    return [...bytes]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("");
  }

  fromHex(hex) {
    const out = new Uint8Array(hex.length / 2);

    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    return out;
  }

  token() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return this.hex(bytes);
  }

  cookie(token) {
    return `codescript_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
  }

  getToken(request) {
    const cookie = request.headers.get("Cookie") || "";

    const match = cookie.match(
      /(?:^|;\s*)codescript_session=([^;]+)/
    );

    return match ? match[1] : null;
  }

  getUser(request) {
    const token = this.getToken(request);

    if (!token) return null;

    const rows = this.db
      .exec(
        `
        SELECT users.id, users.username
        FROM sessions
        JOIN users ON users.id=sessions.user_id
        WHERE sessions.token=?
        `,
        token
      )
      .toArray();

    return rows[0] || null;
  }

  async signup(request) {
    const data = await this.body(request);

    const username = String(data.username || "").trim();
    const password = String(data.password || "");

    if (!/^[A-Za-z0-9_가-힣]{2,20}$/.test(username)) {
      return this.json({
        ok: false,
        error: "아이디는 2~20자의 한글, 영문, 숫자, _만 사용할 수 있습니다."
      }, 400);
    }

    if (password.length < 6 || password.length > 100) {
      return this.json({
        ok: false,
        error: "비밀번호는 6자 이상이어야 합니다."
      }, 400);
    }

    const exists = this.db
      .exec(
        "SELECT id FROM users WHERE username=?",
        username
      )
      .toArray();

    if (exists.length) {
      return this.json({
        ok: false,
        error: "이미 사용 중인 아이디입니다."
      }, 409);
    }

    const hash = await this.hashPassword(password);
    const now = Date.now();

    this.db.exec(
      "INSERT INTO users(username,password_hash,created_at) VALUES(?,?,?)",
      username,
      hash,
      now
    );

    const row = this.db
      .exec(
        "SELECT id,username FROM users WHERE username=?",
        username
      )
      .toArray()[0];

    const token = this.token();

    this.db.exec(
      "INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)",
      token,
      row.id,
      now
    );

    return this.json(
      {
        ok: true,
        user: {
          id: row.id,
          username: row.username
        }
      },
      200,
      {
        "Set-Cookie": this.cookie(token)
      }
    );
  }

  async login(request) {
    const data = await this.body(request);

    const username = String(data.username || "").trim();
    const password = String(data.password || "");

    const rows = this.db
      .exec(
        "SELECT id,username,password_hash FROM users WHERE username=?",
        username
      )
      .toArray();

    if (!rows.length) {
      return this.json({
        ok: false,
        error: "아이디 또는 비밀번호가 올바르지 않습니다."
      }, 401);
    }

    const user = rows[0];

    const valid = await this.verifyPassword(
      password,
      user.password_hash
    );

    if (!valid) {
      return this.json({
        ok: false,
        error: "아이디 또는 비밀번호가 올바르지 않습니다."
      }, 401);
    }

    const token = this.token();

    this.db.exec(
      "INSERT INTO sessions(token,user_id,created_at) VALUES(?,?,?)",
      token,
      user.id,
      Date.now()
    );

    return this.json(
      {
        ok: true,
        user: {
          id: user.id,
          username: user.username
        }
      },
      200,
      {
        "Set-Cookie": this.cookie(token)
      }
    );
  }

  async logout(request) {
    const token = this.getToken(request);

    if (token) {
      this.db.exec(
        "DELETE FROM sessions WHERE token=?",
        token
      );
    }

    return this.json(
      { ok: true },
      200,
      {
        "Set-Cookie":
          "codescript_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
      }
    );
  }

  async me(request) {
    const user = this.getUser(request);

    return this.json({
      ok: true,
      loggedIn: !!user,
      user: user || null
    });
  }

  async listProjects(request) {
    const user = this.getUser(request);

    if (!user) {
      return this.json({
        ok: false,
        error: "로그인이 필요합니다."
      }, 401);
    }

    const rows = this.db
      .exec(
        `
        SELECT id,name,data,public,created_at,updated_at
        FROM projects
        WHERE user_id=?
        ORDER BY updated_at DESC
        `,
        user.id
      )
      .toArray();

    return this.json({
      ok: true,
      projects: rows
    });
  }

  async saveProject(request) {
    const user = this.getUser(request);

    if (!user) {
      return this.json({
        ok: false,
        error: "로그인이 필요합니다."
      }, 401);
    }

    const data = await this.body(request);

    const name =
      String(data.name || "나의 프로젝트").slice(0, 100);

    const projectData =
      JSON.stringify(data.project || {});

    const now = Date.now();

    if (data.id) {
      this.db.exec(
        `
        UPDATE projects
        SET name=?,data=?,updated_at=?
        WHERE id=? AND user_id=?
        `,
        name,
        projectData,
        now,
        Number(data.id),
        user.id
      );

      return this.json({
        ok: true,
        id: Number(data.id)
      });
    }

    this.db.exec(
      `
      INSERT INTO projects
      (user_id,name,data,public,created_at,updated_at)
      VALUES(?,?,?,?,?,?)
      `,
      user.id,
      name,
      projectData,
      0,
      now,
      now
    );

    const row = this.db
      .exec(
        "SELECT last_insert_rowid() AS id"
      )
      .toArray()[0];

    return this.json({
      ok: true,
      id: row.id
    });
  }

  async websocket(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket required", {
        status: 426
      });
    }

    const pair = new WebSocketPair();

    const client = pair[0];
    const server = pair[1];

    server.accept();

    const clients = new Set();

    server.addEventListener("message", event => {
      let msg;

      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === "ping") {
        server.send(JSON.stringify({
          type: "pong"
        }));
        return;
      }

      if (msg.type === "chat") {
        const text =
          String(msg.text || "").slice(0, 500);

        server.send(JSON.stringify({
          type: "chat",
          text,
          user: msg.user || "익명"
        }));
        return;
      }

      server.send(JSON.stringify({
        type: "ack",
        original: msg.type || null
      }));
    });

    server.addEventListener("close", () => {
      clients.delete(server);
    });

    clients.add(server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}

const HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Codescript</title>
</head>
<body>
<div id="app"></div>
<script src="/main.js"></script>
</body>
</html>`;

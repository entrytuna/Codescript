import { DurableObject } from "cloudflare:workers";

const MAX_CLIENTS_PER_ROOM = 20;

const MAIN_JS_URL =
  "https://raw.githubusercontent.com/entrytuna/Codescript/main/main.js";

/*
 * 기존에 Cloudflare에 이미 생성된 Durable Object.
 * 삭제하지 않고 그대로 유지해야 한다.
 */
export class CodescriptRoom extends DurableObject {
  async fetch(request) {
    return new Response("CodescriptRoom legacy endpoint");
  }
}

/*
 * 실제 Codescript 온라인 서버
 */
export class CodescriptServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);

    this.sessions = new Map();
    this.rooms = new Map();
  }

  async fetch(request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket endpoint");
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const socket = pair[1];

    socket.accept();

    const session = {
      socket,
      room: null,
      id: crypto.randomUUID()
    };

    this.sessions.set(socket, session);

    socket.addEventListener("message", async event => {
      try {
        const message = JSON.parse(event.data);

        await this.handleMessage(session, message);
      } catch (error) {
        this.send(socket, {
          type: "error",
          message: "잘못된 요청입니다."
        });
      }
    });

    const disconnect = () => {
      this.leaveRoom(session);
      this.sessions.delete(socket);
    };

    socket.addEventListener("close", disconnect);
    socket.addEventListener("error", disconnect);

    this.send(socket, {
      type: "connected",
      message: "Codescript 서버에 연결되었습니다."
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async handleMessage(session, message) {
    switch (message.type) {
      case "create_room":
        this.createRoom(session);
        break;

      case "join_room":
        this.joinRoom(
          session,
          String(message.room || "")
        );
        break;

      case "project_change":
        this.projectChange(session, message);
        break;

      case "save_project":
        await this.saveProject(
          session,
          message.project
        );
        break;

      case "list_projects":
        await this.listProjects(session);
        break;

      default:
        this.send(session.socket, {
          type: "error",
          message:
            `알 수 없는 요청: ${message.type}`
        });
    }
  }

  createRoom(session) {
    this.leaveRoom(session);

    let code;

    do {
      code = String(
        Math.floor(
          100000 + Math.random() * 900000
        )
      );
    } while (this.rooms.has(code));

    this.rooms.set(
      code,
      new Set([session])
    );

    session.room = code;

    this.send(session.socket, {
      type: "room_created",
      room: code,
      clients: 1,
      maxClients: MAX_CLIENTS_PER_ROOM
    });
  }

  joinRoom(session, code) {
    if (!/^\d{6}$/.test(code)) {
      this.send(session.socket, {
        type: "error",
        message:
          "방 코드는 6자리 숫자입니다."
      });

      return;
    }

    let room = this.rooms.get(code);

    if (!room) {
      room = new Set();

      this.rooms.set(
        code,
        room
      );
    }

    if (
      room.size >=
      MAX_CLIENTS_PER_ROOM
    ) {
      this.send(session.socket, {
        type: "error",
        message:
          "방이 가득 찼습니다. 최대 20명까지 접속할 수 있습니다."
      });

      return;
    }

    this.leaveRoom(session);

    room.add(session);

    session.room = code;

    this.send(session.socket, {
      type: "room_joined",
      room: code,
      clients: room.size,
      maxClients:
        MAX_CLIENTS_PER_ROOM
    });

    this.broadcastRoom(code, {
      type: "presence",
      clients: room.size
    });
  }

  leaveRoom(session) {
    if (!session.room) {
      return;
    }

    const room =
      this.rooms.get(session.room);

    if (room) {
      room.delete(session);

      if (room.size === 0) {
        this.rooms.delete(
          session.room
        );
      } else {
        this.broadcastRoom(
          session.room,
          {
            type: "presence",
            clients: room.size
          }
        );
      }
    }

    session.room = null;
  }

  projectChange(session, message) {
    if (!session.room) {
      return;
    }

    this.broadcastRoom(
      session.room,
      {
        type: "room_update",
        payload:
          message.payload || {}
      },
      session
    );
  }

  async saveProject(session, project) {
    if (!project || !project.name) {
      this.send(session.socket, {
        type: "error",
        message:
          "프로젝트 정보가 없습니다."
      });

      return;
    }

    if (project.public === true) {
      const id =
        crypto.randomUUID();

      await this.ctx.storage.put(
        `project:${id}`,
        {
          id,

          name:
            String(project.name)
              .slice(0, 100),

          mode:
            project.mode ||
            "offline",

          code:
            Array.isArray(project.code)
              ? project.code
              : [],

          vars:
            Array.isArray(project.vars)
              ? project.vars
              : [],

          lists:
            Array.isArray(project.lists)
              ? project.lists
              : [],

          funcs:
            Array.isArray(project.funcs)
              ? project.funcs
              : [],

          likes: 0,

          createdAt: Date.now()
        }
      );
    }

    this.send(session.socket, {
      type: "saved",
      message: "저장 완료"
    });
  }

  async listProjects(session) {
    const result =
      await this.ctx.storage.list({
        prefix: "project:"
      });

    const projects = [];

    for (
      const value of result.values()
    ) {
      projects.push({
        id: value.id,
        name: value.name,
        mode: value.mode,
        code: value.code || [],
        likes: value.likes || 0
      });
    }

    projects.sort(
      (a, b) =>
        b.likes - a.likes
    );

    this.send(session.socket, {
      type: "projects",
      projects:
        projects.slice(0, 100)
    });
  }

  broadcastRoom(
    roomCode,
    message,
    except = null
  ) {
    const room =
      this.rooms.get(roomCode);

    if (!room) {
      return;
    }

    for (
      const session of room
    ) {
      if (
        session !== except &&
        session.socket.readyState ===
          WebSocket.OPEN
      ) {
        this.send(
          session.socket,
          message
        );
      }
    }
  }

  send(socket, message) {
    if (
      socket.readyState ===
      WebSocket.OPEN
    ) {
      try {
        socket.send(
          JSON.stringify(message)
        );
      } catch {}
    }
  }
}

export default {
  async fetch(request, env) {
    const url =
      new URL(request.url);

    /*
     * Codescript 메인 화면
     */
    if (
      url.pathname === "/" ||
      url.pathname === "/index.html"
    ) {
      return new Response(
        `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width,initial-scale=1">
<title>Codescript</title>
</head>
<body>
<script src="/main.js"></script>
</body>
</html>`,
        {
          headers: {
            "content-type":
              "text/html; charset=UTF-8",

            "cache-control":
              "no-cache"
          }
        }
      );
    }

    /*
     * GitHub main.js 제공
     */
    if (url.pathname === "/main.js") {
      const response =
        await fetch(MAIN_JS_URL);

      if (!response.ok) {
        return new Response(
          "main.js를 불러오지 못했습니다.",
          {
            status: 502
          }
        );
      }

      return new Response(
        await response.text(),
        {
          headers: {
            "content-type":
              "application/javascript; charset=UTF-8",

            "cache-control":
              "public, max-age=60"
          }
        }
      );
    }

    /*
     * 서버 상태 확인
     */
    if (
      url.pathname === "/health"
    ) {
      return Response.json({
        ok: true,
        service: "Codescript",
        online: true
      });
    }

    /*
     * Codescript WebSocket
     */
    if (
      url.pathname === "/ws" &&
      request.headers
        .get("Upgrade")
        ?.toLowerCase() ===
        "websocket"
    ) {
      const id =
        env.CODESCRIPT_SERVER
          .idFromName("global");

      const server =
        env.CODESCRIPT_SERVER
          .get(id);

      return server.fetch(
        request
      );
    }

    return new Response(
      "Codescript 서버가 실행 중입니다.",
      {
        status: 200
      }
    );
  }
};

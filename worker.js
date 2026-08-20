import { DurableObject } from "cloudflare:workers";

const MAX_CLIENTS = 20;

export class CodescriptRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sessions = new Set();
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Codescript online room");
    }

    if (this.sessions.size >= MAX_CLIENTS) {
      return new Response(
        "방이 가득 찼습니다. 최대 20명까지 접속할 수 있습니다.",
        { status: 429 }
      );
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();
    this.sessions.add(server);

    server.send(JSON.stringify({
      type: "welcome",
      maxClients: MAX_CLIENTS,
      clients: this.sessions.size
    }));

    server.addEventListener("message", event => {
      let msg;

      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      for (const ws of this.sessions) {
        if (ws !== server && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({
              ...msg,
              from: "codescript-server"
            }));
          } catch {}
        }
      }
    });

    const close = () => {
      this.sessions.delete(server);
    };

    server.addEventListener("close", close);
    server.addEventListener("error", close);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "Codescript",
        online: true
      });
    }

    if (url.pathname.startsWith("/room/")) {
      const roomName =
        decodeURIComponent(url.pathname.slice(6)) || "main";

      const id = env.CODESCRIPT_ROOM.idFromName(roomName);

      return env.CODESCRIPT_ROOM.get(id).fetch(request);
    }

    return new Response(
      "Codescript 서버가 실행 중입니다."
    );
  }
};

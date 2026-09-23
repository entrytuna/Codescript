const MAX_CLIENTS = 20;


/* =========================================================
   CodescriptServer
   ========================================================= */

export class CodescriptServer {

  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "Codescript",
        server: true
      });
    }

    return new Response(
      "Codescript Server OK",
      {
        status: 200,
        headers: {
          "content-type":
            "text/plain;charset=UTF-8"
        }
      }
    );
  }
}


/* =========================================================
   CodescriptRoom
   ========================================================= */

export class CodescriptRoom {

  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.sessions = new Set();
  }

  async fetch(request) {

    const upgrade =
      request.headers.get("Upgrade");

    if (
      !upgrade ||
      upgrade.toLowerCase() !== "websocket"
    ) {

      return new Response(
        "Codescript Online Room",
        {
          status: 200,
          headers: {
            "content-type":
              "text/plain;charset=UTF-8"
          }
        }
      );
    }

    if (
      this.sessions.size >= MAX_CLIENTS
    ) {

      return new Response(
        "방이 가득 찼습니다. 최대 20명까지 접속할 수 있습니다.",
        {
          status: 429
        }
      );
    }

    const pair =
      new WebSocketPair();

    const client = pair[0];
    const server = pair[1];

    server.accept();

    this.sessions.add(server);

    server.send(
      JSON.stringify({
        type: "welcome",
        clients: this.sessions.size,
        maxClients: MAX_CLIENTS
      })
    );

    server.addEventListener(
      "message",
      event => {

        let data;

        try {
          data =
            JSON.parse(event.data);
        } catch {
          data = {
            type: "message",
            data: String(event.data)
          };
        }

        const message =
          JSON.stringify(data);

        for (
          const socket
          of this.sessions
        ) {

          if (socket === server)
            continue;

          if (
            socket.readyState ===
            WebSocket.OPEN
          ) {

            try {
              socket.send(message);
            } catch {}
          }
        }
      }
    );

    const remove = () => {
      this.sessions.delete(server);
    };

    server.addEventListener(
      "close",
      remove
    );

    server.addEventListener(
      "error",
      remove
    );

    return new Response(
      null,
      {
        status: 101,
        webSocket: client
      }
    );
  }
}


/* =========================================================
   HTML
   ========================================================= */

const HTML = `<!DOCTYPE html>
<html lang="ko">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>Codescript</title>

</head>

<body>

<script src="/main.js"></script>

</body>

</html>`;


/* =========================================================
   Worker
   ========================================================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /* -----------------------------------------
       메인 페이지
       ----------------------------------------- */

    if (
      url.pathname === "/" ||
      url.pathname === ""
    ) {

      return new Response(
        HTML,
        {
          status: 200,
          headers: {
            "content-type":
              "text/html;charset=UTF-8",
            "cache-control":
              "no-cache"
          }
        }
      );
    }


    /* -----------------------------------------
       main.js
       ----------------------------------------- */

    if (
      url.pathname === "/main.js"
    ) {

      try {

        const response =
          await fetch(
            "https://raw.githubusercontent.com/entrytuna/Codescript/main/main.js"
          );

        if (!response.ok) {

          return new Response(
            "GitHub에서 main.js를 불러오지 못했습니다.",
            {
              status: 502
            }
          );
        }

        return new Response(
          response.body,
          {
            status: 200,
            headers: {
              "content-type":
                "application/javascript;charset=UTF-8",
              "cache-control":
                "no-cache"
            }
          }
        );

      } catch (error) {

        return new Response(
          "main.js 연결 오류",
          {
            status: 502
          }
        );
      }
    }


    /* -----------------------------------------
       상태 확인
       ----------------------------------------- */

    if (
      url.pathname === "/health"
    ) {

      return Response.json({
        ok: true,
        service: "Codescript",
        online: true,
        maxClients: MAX_CLIENTS
      });
    }


    /* -----------------------------------------
       API 상태
       ----------------------------------------- */

    if (
      url.pathname === "/api/status"
    ) {

      return Response.json({
        ok: true,
        service: "Codescript",
        online: true,
        maxClients: MAX_CLIENTS,
        room: !!(
          env &&
          env.CODESCRIPT_ROOM
        ),
        server: !!(
          env &&
          env.CODESCRIPT_SERVER
        )
      });
    }


    /* -----------------------------------------
       온라인 방
       /room/방이름
       ----------------------------------------- */

    if (
      url.pathname.startsWith("/room/")
    ) {

      if (
        !env ||
        !env.CODESCRIPT_ROOM
      ) {

        return new Response(
          "CODESCRIPT_ROOM 바인딩이 없습니다.",
          {
            status: 500
          }
        );
      }

      const roomName =
        decodeURIComponent(
          url.pathname.substring(6)
        ) || "main";

      const id =
        env.CODESCRIPT_ROOM
          .idFromName(roomName);

      const room =
        env.CODESCRIPT_ROOM.get(id);

      return room.fetch(request);
    }


    /* -----------------------------------------
       기본 WebSocket
       ----------------------------------------- */

    if (
      url.pathname === "/ws"
    ) {

      if (
        !env ||
        !env.CODESCRIPT_ROOM
      ) {

        return new Response(
          "온라인 서버 설정이 없습니다.",
          {
            status: 500
          }
        );
      }

      const id =
        env.CODESCRIPT_ROOM
          .idFromName("main");

      const room =
        env.CODESCRIPT_ROOM.get(id);

      return room.fetch(request);
    }


    /* -----------------------------------------
       없는 주소
       ----------------------------------------- */

    return new Response(
      "Codescript: Not Found",
      {
        status: 404,
        headers: {
          "content-type":
            "text/plain;charset=UTF-8"
        }
      }
    );
  }

};

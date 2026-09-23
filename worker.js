const MAX_CLIENTS = 20;

/*
 * Codescript Durable Object
 *
 * cloudflare:workers의 DurableObject 전역 클래스에
 * 의존하지 않고, Cloudflare Workers 환경에서
 * 호환되도록 Durable Object 클래스를 정의한다.
 */

export class CodescriptRoom {

  constructor(ctx, env) {

    this.ctx = ctx;
    this.env = env;

    this.sessions = new Set();

  }

  async fetch(request) {

    const upgrade =
      request.headers.get("Upgrade");

    /*
     * 일반 HTTP 요청
     */
    if (
      !upgrade ||
      upgrade.toLowerCase() !==
      "websocket"
    ) {

      return new Response(
        "Codescript Online Room",
        {
          status:200,
          headers:{
            "content-type":
              "text/plain;charset=UTF-8"
          }
        }
      );

    }

    /*
     * 최대 20명
     */
    if (
      this.sessions.size >=
      MAX_CLIENTS
    ) {

      return new Response(
        "방이 가득 찼습니다. 최대 20명까지 접속할 수 있습니다.",
        {
          status:429
        }
      );

    }

    /*
     * WebSocket 생성
     */
    const pair =
      new WebSocketPair();

    const client =
      pair[0];

    const server =
      pair[1];

    server.accept();

    this.sessions.add(
      server
    );

    /*
     * 입장 알림
     */
    server.send(
      JSON.stringify({
        type:"welcome",
        maxClients:
          MAX_CLIENTS,
        clients:
          this.sessions.size
      })
    );

    /*
     * 메시지 전달
     */
    server.addEventListener(
      "message",
      event => {

        let message;

        try {

          message =
            JSON.parse(
              event.data
            );

        } catch {

          return;

        }

        const outgoing =
          JSON.stringify({
            ...message,
            from:
              "codescript-server"
          });

        for (
          const socket
          of this.sessions
        ) {

          if (
            socket === server
          )
            continue;

          if (
            socket.readyState ===
            WebSocket.OPEN
          ) {

            try {

              socket.send(
                outgoing
              );

            } catch {}

          }

        }

      }
    );

    /*
     * 연결 종료
     */
    const remove =
      () => {

        this.sessions.delete(
          server
        );

      };

    server.addEventListener(
      "close",
      remove
    );

    server.addEventListener(
      "error",
      remove
    );

    /*
     * WebSocket 반환
     */
    return new Response(
      null,
      {
        status:101,
        webSocket:client
      }
    );

  }

}


/* =========================================================
   Codescript Worker
   ========================================================= */

export default {

  async fetch(
    request,
    env
  ) {

    const url =
      new URL(
        request.url
      );

    /*
     * 서버 상태 확인
     */
    if (
      url.pathname ===
      "/health"
    ) {

      return Response.json({

        ok:true,

        service:
          "Codescript",

        online:true,

        version:
          "1.0.0"

      });

    }

    /*
     * 메인 페이지
     */
    if (
      url.pathname ===
      "/"
    ) {

      return new Response(

        `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1">
<title>Codescript</title>
</head>

<body>

<div id="app">
  Codescript
</div>

<script src="/main.js"></script>

</body>
</html>`,

        {
          status:200,
          headers:{
            "content-type":
              "text/html;charset=UTF-8"
          }
        }

      );

    }

    /*
     * main.js
     *
     * GitHub의 main.js를 가져온다.
     */
    if (
      url.pathname ===
      "/main.js"
    ) {

      const response =
        await fetch(
          "https://raw.githubusercontent.com/entrytuna/Codescript/main/main.js"
        );

      if (
        !response.ok
      ) {

        return new Response(
          "main.js를 불러오지 못했습니다.",
          {
            status:502
          }
        );

      }

      return new Response(
        response.body,
        {
          status:200,
          headers:{
            "content-type":
              "application/javascript;charset=UTF-8",
            "cache-control":
              "no-cache"
          }
        }
      );

    }

    /*
     * 온라인 협업방
     *
     * /room/방이름
     */
    if (
      url.pathname.startsWith(
        "/room/"
      )
    ) {

      const roomName =
        decodeURIComponent(
          url.pathname.slice(
            "/room/".length
          )
        ) ||
        "main";

      /*
       * Durable Object binding
       */
      if (
        !env ||
        !env.CODESCRIPT_ROOM
      ) {

        return new Response(
          "CODESCRIPT_ROOM 바인딩이 없습니다.",
          {
            status:500
          }
        );

      }

      const id =
        env.CODESCRIPT_ROOM
          .idFromName(
            roomName
          );

      const room =
        env.CODESCRIPT_ROOM
          .get(id);

      return room.fetch(
        request
      );

    }

    /*
     * WebSocket 직접 접속
     */
    if (
      url.pathname ===
      "/ws"
    ) {

      if (
        !env ||
        !env.CODESCRIPT_ROOM
      ) {

        return new Response(
          "온라인 서버 설정이 없습니다.",
          {
            status:500
          }
        );

      }

      const id =
        env.CODESCRIPT_ROOM
          .idFromName(
            "main"
          );

      return env.CODESCRIPT_ROOM
        .get(id)
        .fetch(request);

    }

    /*
     * 서버 정보
     */
    if (
      url.pathname ===
      "/api/status"
    ) {

      return Response.json({

        ok:true,

        service:
          "Codescript",

        online:true,

        maxClients:
          MAX_CLIENTS

      });

    }

    /*
     * 없는 주소
     */
    return new Response(
      "Codescript: Not Found",
      {
        status:404,
        headers:{
          "content-type":
            "text/plain;charset=UTF-8"
        }
      }
    );

  }

};

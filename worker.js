export class CodescriptServer {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    return new Response("Codescript Server", {
      status: 200
    });
  }
}

export class CodescriptRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    return new Response("Codescript Room", {
      status: 200
    });
  }
}

export default {
  async fetch(request, env) {
    return new Response("Codescript");
  }
};

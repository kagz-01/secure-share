import { Handlers } from "$fresh/server.ts";
import { destroySession, getSessionId } from "../../../utils/session.ts";

export const handler: Handlers = {
  async GET(req) {
    const sessionId = getSessionId(req);
    if (sessionId) {
      await destroySession(sessionId);
    }

    const headers = new Headers();
    headers.set("Set-Cookie", "sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    headers.set("Location", "/");

    return new Response("", {
      status: 302,
      headers,
    });
  },
};

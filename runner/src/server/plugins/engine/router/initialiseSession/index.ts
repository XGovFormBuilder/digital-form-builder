import { Plugin } from "hapi";
import { InitialiseSession } from "./types";
import * as token from "./handlers/token";

export const initialiseSession: Plugin<InitialiseSession> = {
  name: "initialiseSession",
  register: async function (server, _options) {
    server.route({
      method: "GET",
      path: "/session/{token}",
      handler: token.get,
      options: {
        description: `Activates a session initialised from POST /session/{formId}. Redirects a user to the {formId} stored within the token.`,
      },
    });

    server.route({
      method: "POST",
      path: "/session/{formId}",
      options: {
        description: `Accepts JSON object conforming to type InitialiseSessionSchema. Creates a session and returns JSON containing a JWT Token {"token": "example.jwt.token"}. You must configure the callback safelist in runner/config/{environment}.json`,
        plugins: {
          crumb: false,
        },
      },
      handler: token.post,
    });
  },
};

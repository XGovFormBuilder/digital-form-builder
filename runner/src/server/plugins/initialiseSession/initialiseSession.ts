import { Plugin, Request } from "@hapi/hapi";
import joi from "joi";
import { generateSessionTokenForForm, webhookToSessionData } from "./helpers";
import { InitialiseSession, InitialiseSessionOptions } from "./types";
import path from "path";
import { WebhookSchema } from "server/schemas/webhookSchema";

type InitialiseSessionRequest = {
  params: {
    formId: string;
  };
  payload: {
    options: InitialiseSessionOptions;
  } & WebhookSchema;
} & Request;

export const initialiseSession: Plugin<InitialiseSession> = {
  name: "initialiseSession",
  register: async function (
    server,
    options = {
      whitelist: [],
    }
  ) {
    const {
      whitelist = ["b4bf0fcd-1dd3-4650-92fe-d1f83885a447.mock.pstmn.io"],
    } = options;
    const callbackValidation = joi.string().custom((value, helpers) => {
      const hostname = new URL(value).hostname;

      if (!hostname) {
        return helpers.error("string.empty");
      }

      if (whitelist.includes(hostname)) {
        return value;
      }

      return helpers.error("string.hostname");
    });

    server.route({
      method: "GET",
      path: "/session/{token}",
      handler: async function (request, h) {
        const { cacheService } = request.services([]);

        try {
          const { token } = request.params;
          const { decoded } = token.decode(token);
          const { payload } = decoded;
          const { redirectPath } = await cacheService.activateSession(
            token,
            request
          );

          const redirect = path
            .join("/", payload.group, redirectPath)
            .toString();

          return h.redirect(redirect);
        } catch (e) {
          return h.response(e.message);
        }
      },
    });

    server.route({
      method: "POST",
      path: "/session/{formId}",
      handler: async function (request, h) {
        const { payload, params } = request as InitialiseSessionRequest;
        const { cacheService } = request.services([]);
        const { formId } = params;
        const { options, ...webhookData } = payload;

        const {
          callback = "https://b4bf0fcd-1dd3-4650-92fe-d1f83885a447.mock.pstmn.io/cb",
          redirectPath = "",
          message = "",
        } = options;

        const isExistingForm = server.app.forms[formId] && true;
        const { error: callbackWhitelistError } = callbackValidation.validate(
          callback,
          {
            abortEarly: false,
          }
        );

        if (!isExistingForm) {
          return h
            .response({ message: `${formId} does not exist on this instance` })
            .code(404);
        }

        if (callbackWhitelistError) {
          return h
            .response({
              message: `the callback url provided ${callback} is not allowed ${callbackWhitelistError}`,
            })
            .code(403);
        }

        const token = generateSessionTokenForForm(callback, formId);

        await cacheService.createSession(token, {
          redirectPath,
          message,
          ...webhookToSessionData(webhookData),
        });
        return h.response({ token }).code(201);
      },
    });
  },
};

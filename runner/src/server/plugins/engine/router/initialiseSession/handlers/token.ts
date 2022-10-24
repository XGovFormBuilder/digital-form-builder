import path from "path";
import Jwt from "@hapi/jwt";
import { HapiLifecycleMethod } from "server/types";
import { WebhookSchema } from "server/schemas/types";
import { Request } from "hapi";
import { InitialiseSessionOptions } from "../types";
import { ConfirmationPage } from "@xgovformbuilder/model";
import {
  callbackValidation,
  generateSessionTokenForForm,
  webhookToSessionData,
} from "./helpers";
import config from "config";

type Payload = {
  options: InitialiseSessionOptions & ConfirmationPage;
} & WebhookSchema;

interface InitialiseSessionRequest extends Request {
  payload: Payload;
  params: {
    formId: string;
  };
}

export const get: HapiLifecycleMethod = async (request, h) => {
  const { cacheService } = request.services([]);
  const { token } = request.params;
  const { decoded } = Jwt.token.decode(token);
  const { payload } = decoded;
  const { redirectPath } = await cacheService.activateSession(token, request);
  const redirect = path.join("/", payload.group, redirectPath).normalize();

  return h.redirect(redirect);
};

export const post: HapiLifecycleMethod = async (request, h) => {
  const { payload, params } = request as InitialiseSessionRequest;
  const { cacheService } = request.services([]);
  const { formId } = params;
  const { options, metadata = {}, ...webhookData } = payload;
  const { callbackUrl } = options;

  const isExistingForm = request.server.app.forms?.[formId] ?? false;
  const { error: callbackSafeListError } = callbackValidation(
    config.safelist
  ).validate(callbackUrl, {
    abortEarly: false,
  });

  if (!isExistingForm) {
    request.logger.warn(
      [`/session/${formId}`, "POST"],
      `${formId} does not exist`
    );
    return h
      .response({ message: `${formId} does not exist on this instance` })
      .code(404);
  }

  if (callbackSafeListError) {
    request.logger.warn(
      [`/session/${formId}`, "POST"],
      `${callbackUrl} was was not allowed. only ${config.safelist?.join(", ")}`
    );
    return h
      .response({
        message: `the callback URL provided ${callbackUrl} is not allowed.`,
      })
      .code(403);
  }

  if (options.htmlMessage && options.message) {
    return h
      .response({
        message:
          "Both htmlMessage and message were provided. Only one is allowed.",
      })
      .code(400);
  }

  const token = generateSessionTokenForForm(callbackUrl, formId);

  await cacheService.createSession(token, {
    callback: options,
    metadata,
    ...webhookToSessionData(webhookData),
  });

  return h.response({ token }).code(201);
};

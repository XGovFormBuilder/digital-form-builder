import { WebhookSchema } from "server/schemas/types";
import { Request } from "hapi";
import { SpecialPages } from "@xgovformbuilder/model";
export type InitialiseSession = {
  safelist: string[];
};

export type InitialiseSessionOptions = {
  callbackUrl: string;
  redirectPath?: string;
  message?: string;
  htmlMessage?: string;
  title?: string;
};

export type DecodedSessionToken = {
  /**
   * Callback url to PUT data to
   */
  cb: string;

  /**
   * 16 character randomised string
   */
  user: string;

  /**
   * alias for formId
   */
  group: string;
};

export type InitialiseSessionRequest = {
  params: {
    formId: string;
  };
  payload: {
    options: InitialiseSessionOptions & SpecialPages["confirmationPage"];
  } & WebhookSchema;
} & Request;
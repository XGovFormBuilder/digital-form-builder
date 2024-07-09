import { HapiRequest, HapiResponseToolkit } from "server/types";

import {
  getBacklinkPrehandler,
  getFormPrehandler,
  getStatePrehandler,
  parseErrorsPrehandler,
  redirectUserBackToForm,
  validateEmailPostRequest,
} from "server/plugins/engine/pluginHandlers/exit/preHandlers";
import Boom from "boom";

export const emailGet = {
  method: "get",
  path: "/{id}/exit/email",
  options: {
    pre: [
      {
        assign: "form",
        method: getFormPrehandler,
      },
      {
        assign: "errors",
        method: parseErrorsPrehandler,
      },
      {
        assign: "state",
        method: getStatePrehandler,
      },
      {
        assign: "backlink",
        method: getBacklinkPrehandler,
      },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    return h.view("exit/email", {
      errors: request.pre.errors,
      backLink: request.pre.backlink,
    });
  },
};

export const emailPost = {
  method: "post",
  path: "/{id}/exit/email",
  options: {
    pre: [
      {
        assign: "form",
        method: getFormPrehandler,
      },
      {
        method: validateEmailPostRequest,
      },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    const form = request.pre.form;
    if (!form.allowExit) {
      request.server.logger.error({
        tags: ["exit"],
        msg: `User ${request.yar.id} attempted to exit ${form.basePath} but it is not enabled for this form.`,
      });
      throw Boom.forbidden();
    }

    const { cacheService, exitService } = request.services([]);
    const state = await cacheService.getState(request);

    try {
      await exitService.exitForm(form, state);
    } catch (e) {
      throw Boom.badRequest();
    }

    return h.redirect("status");
  },
};

export const statusGet = {
  method: "get",
  path: "/{id}/exit/status",
  options: {
    pre: [
      { assign: "state", method: getStatePrehandler },
      { assign: "form", method: getFormPrehandler },
      { method: redirectUserBackToForm },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    const state = request.pre.state;
    const { exitState } = state;

    if (exitState?.result?.redirectUrl) {
      return h.redirect(exitState?.result.redirectUrl);
    }

    return h.view("exit/status", {
      errors: request.pre.errors,
      ...exitState,
    });
  },
};

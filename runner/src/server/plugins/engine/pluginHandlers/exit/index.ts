import { HapiRequest, HapiResponseToolkit } from "server/types";
import Boom from "boom";
import { getForm } from "./prehandlers/getForm";
import { parseExitEmailErrors } from "./prehandlers/parseExitEmailErrors";
import { getState } from "./prehandlers/getState";
import { getBacklink } from "./prehandlers/getBacklink";
import { validateEmailAndSave } from "./prehandlers/validateEmailAndSave";
import { checkUserIsAllowedAccess } from "./prehandlers/checkUserIsAllowedAccess";

export const emailGet = {
  method: "get",
  path: "/{id}/exit/email",
  options: {
    description: "Allows users to exit the form if enabled on the form",
    pre: [
      {
        assign: "form",
        method: getForm,
      },
      {
        assign: "state",
        method: getState,
      },
      { method: checkUserIsAllowedAccess },
      {
        assign: "errors",
        method: parseExitEmailErrors,
      },
      {
        assign: "backlink",
        method: getBacklink,
      },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    return h.view("exit/email", {
      errors: request.pre.errors,
      backLink: request.pre.backlink,
      name: request.pre.form.name,
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
        method: getForm,
      },
      {
        assign: "state",
        method: getState,
      },
      { method: checkUserIsAllowedAccess },
      {
        assign: "updatedState",
        method: validateEmailAndSave,
      },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    const { cacheService, exitService } = request.services([]);
    const form = request.pre.form;

    try {
      const exitResponse = await exitService.exitForm(
        form,
        request.pre.updatedState
      );
      await cacheService.setExitState(request, { result: exitResponse });
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
      { assign: "state", method: getState },
      { assign: "form", method: getForm },
      { method: checkUserIsAllowedAccess },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    const state = request.pre.state;
    const { exitState } = state;

    const { cacheService } = request.services([]);
    await cacheService.clearState(request);

    if (exitState?.result?.redirectUrl) {
      return h.redirect(exitState?.result.redirectUrl);
    }

    return h.view("exit/status", {
      errors: request.pre.errors,
      ...exitState,
      name: request.pre.form.name,
    });
  },
};

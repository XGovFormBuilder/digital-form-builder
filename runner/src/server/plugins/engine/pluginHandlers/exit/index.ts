import { HapiRequest, HapiResponseToolkit } from "server/types";
import Joi, { ValidationError, ValidationErrorItem } from "joi";
import {
  getBacklink,
  getFormPrehandler,
  getStatePrehandler,
} from "server/plugins/engine/pluginHandlers/exit/preHandlers";
import Boom from "boom";
import { WebhookModel } from "server/plugins/engine/models/submission";
import { post } from "wreck";

function errorListFromValidationResult(validationError: any[]) {
  if (validationError.length === 0) {
    return null;
  }

  if (!validationError[0].details) {
    return null;
  }

  const errors = validationError[0] as ValidationError;

  const errorList = errors.details.map(errorListItemToErrorVM);

  return {
    titleText: "Fix the following errors",
    errorList: errorList.filter(
      ({ text }, index) =>
        index === errorList.findIndex((err) => err.text === text)
    ),
  };
}

function errorListItemToErrorVM(error: ValidationErrorItem) {
  const name = error.path
    .map((name: string, index: number) => (index > 0 ? `__${name}` : name))
    .join("");

  return {
    path: error.path.join("."),
    href: `#${name}`,
    name: name,
    text: error.message,
  };
}

function parseErrors(request: HapiRequest, _h: HapiResponseToolkit) {
  const errors = request.yar.flash("exitEmailError");
  return errorListFromValidationResult(errors);
}

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
        method: parseErrors,
      },
      {
        assign: "state",
        method: getStatePrehandler,
      },
      {
        assign: "backlink",
        method: getBacklink,
      },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    console.log(request.pre.errors);

    return h.view("exit/email", {
      errors: request.pre.errors,
      backLink: request.pre.backlink,
    });
  },
};

const postSchema = Joi.object({
  exitEmailAddress: Joi.string().email().label("Email address"),
  crumb: Joi.string(),
});
const postSchemaValidationOptions: Joi.ValidationOptions = {
  messages: {
    "string.empty": "Enter your {{#label}}",
  },
  errors: {
    wrap: {
      label: false,
    },
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
        method: async (request, h) => {
          const { value, error } = postSchema.validate(
            request.payload,
            postSchemaValidationOptions
          );

          if (error) {
            request.yar.flash("exitEmailError", error);
            return h.redirect("email").takeover();
          }

          const { cacheService } = request.services([]);

          const { exitEmailAddress } = value;
          await cacheService.setExitState(request, { exitEmailAddress });

          return h.continue;
        },
      },
    ],
  },
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    const form = request.pre.form;
    if (!form.allowExit) {
      Boom.forbidden();
    }
    const { cacheService, exitService } = request.services([]);
    const state = await cacheService.getState(request);

    let result;
    try {
      await exitService.exitForm(form, state);
    } catch (e) {
      console.log(e);
      throw Boom.badRequest();
    }

    return h.redirect("status");
  },
};

export const statusGet = {
  method: "get",
  path: "/{id}/exit/status",
  options: {},
  handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const { exitState } = state;
    await cacheService.clearState(request);

    if (exitState?.result?.redirectUrl) {
      return h.redirect(exitState?.result.redirectUrl);
    }

    return h.view("exit/status", {
      errors: request.pre.errors,
      ...exitState,
    });
  },
};

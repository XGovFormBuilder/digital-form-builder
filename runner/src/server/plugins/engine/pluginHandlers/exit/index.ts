import { HapiRequest, HapiResponseToolkit } from "server/types";
import Joi, { ValidationError, ValidationErrorItem } from "joi";
import { getFormPrehandler } from "server/plugins/engine/pluginHandlers/exit/preHandlers";

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
    ],
  },
  handler: (request: HapiRequest, h: HapiResponseToolkit) => {
    console.log(request.pre.errors);
    return h.view("exit/email", { errors: request.pre.errors });
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
        method: (request, h) => {
          const result = postSchema.validate(
            request.payload,
            postSchemaValidationOptions
          );

          if (result.error) {
            request.yar.flash("exitEmailError", result.error);
            return h.redirect("email").takeover();
          }

          return h.continue;
        },
      },
    ],
  },
  handler: (request: HapiRequest, h: HapiResponseToolkit) => {
    return h.redirect("status");
  },
};

export const statusGet = {
  method: "get",
  path: "/{id}/exit/status",
  options: {},
  handler: (request: HapiRequest, h: HapiResponseToolkit) => {
    console.log(request.pre.errors);
    return h.view("exit/status", { errors: request.pre.errors });
  },
};

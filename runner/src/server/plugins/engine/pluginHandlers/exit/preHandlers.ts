import { HapiRequest, HapiResponseToolkit } from "server/types";
import Boom from "boom";
import Joi from "joi";
import { errorListFromValidationResult } from "server/plugins/engine/pluginHandlers/exit/utils";

export function getFormPrehandler(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const id = request.params?.id;
  const form = request.server.app.forms?.[id];
  if (!form) {
    Boom.notFound();
  }
  return form;
}
export async function getStatePrehandler(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const { cacheService } = request.services([]);
  return cacheService.getState(request);
}

export async function getBacklinkPrehandler(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const state = request.pre.state;
  const { progress } = state;
  return progress?.at?.(-1) ?? null;
}

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

export async function validateEmailPostRequest(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
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
}

export function parseErrorsPrehandler(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const errors = request.yar.flash("exitEmailError");
  return errorListFromValidationResult(errors);
}

/**
 * Attempts to redirect the user back to the start page of the form if ExitState is empty
 * This prehandler must be used **after** {@link `getFormPrehandler`} and {@link `getState`}
 */
export function redirectUserBackToForm(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
  const form = request.pre.form;
  const state = request.pre.state;
  if (!state?.exitState) {
    return h.redirect(`/${form.basePath}${form.startPage.path}`).takeover();
  }
  return h.continue;
}

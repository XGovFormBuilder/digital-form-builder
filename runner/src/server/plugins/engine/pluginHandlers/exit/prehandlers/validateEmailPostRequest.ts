import { HapiRequest, HapiResponseToolkit } from "server/types";
import Joi from "joi";

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

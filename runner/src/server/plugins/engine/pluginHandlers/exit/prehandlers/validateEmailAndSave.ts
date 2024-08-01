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

/**
 * Validates the email address submitted by the user, and stores it in the user's
 * state
 */
export async function validateEmailAndSave(
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
  return await cacheService.setExitState(request, { exitEmailAddress });
}

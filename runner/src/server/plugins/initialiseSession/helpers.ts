import { Field, WebhookSchema } from "server/schemas/webhookSchema";
import { merge } from "@hapi/hoek";
import { customAlphabet } from "nanoid";
import config from "server/config";
import Jwt from "@hapi/jwt";
import { FormSubmissionState } from "server/plugins/engine/types";
import joi from "joi";

export function fieldToValue(field: Field) {
  const { key, answer } = field;
  return { [key]: answer };
}

export function webhookToSessionData(
  webhookData: WebhookSchema
): FormSubmissionState {
  const { questions } = webhookData;
  return questions.reduce((session, currentQuestion) => {
    const { fields, category } = currentQuestion;

    const values = fields
      .map(fieldToValue)
      .reduce((prev, curr) => merge(prev, curr), {});

    if (!category) {
      return { ...session, ...values };
    }

    const existingCategoryInSession = session[category] ?? {};

    return {
      ...session,
      [category]: { ...existingCategoryInSession, ...values },
    };
  }, {});
}

export function generateSessionTokenForForm(callback, formId) {
  return Jwt.token.generate(
    {
      cb: callback,
      user: customAlphabet(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123467890",
        16
      ),
      group: formId,
    },
    {
      key: config.initialisedSessionKey,
    },
    {
      ttlSec: config.initialisedSessionTimeout / 1000,
    }
  );
}

export const callbackValidation = (safelist = config.whitelist) =>
  joi.string().custom((value, helpers) => {
    const hostname = new URL(value).hostname;
    if (!hostname) {
      return helpers.error("string.empty");
    }

    if (safelist.includes(hostname)) {
      return value;
    }

    return helpers.error("string.hostname");
  });

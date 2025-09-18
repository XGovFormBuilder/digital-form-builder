import { Field, WebhookSchema } from "server/schemas/types";
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
      algorithm: config.initialisedSessionAlgorithm,
    },
    {
      ttlSec: config.initialisedSessionTimeout / 1000,
    }
  );
}

export function verifyToken(decodedToken) {
  try {
    Jwt.token.verify(decodedToken, {
      key: config.initialisedSessionKey,
      algorithm: config.initialisedSessionAlgorithm,
    });
    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      error: `${err}`,
    };
  }
}

export const callbackValidation = (safelist = config.safelist) =>
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

export function verifyHmacToken(decodedToken, key) {
  try {
    Jwt.token.verify(decodedToken, {
      key: key,
      algorithm: config.initialisedSessionAlgorithm,
    });
    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      error: `${err}`,
    };
  }
}

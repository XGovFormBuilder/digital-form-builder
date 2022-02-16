import { Field, WebhookSchema } from "server/schemas/webhookSchema";
import { merge } from "@hapi/hoek";
import { nanoid } from "nanoid";
import config from "server/config";
import Jwt from "@hapi/jwt";

export function fieldToValue(field: Field) {
  const { key, answer } = field;
  return { [key]: answer };
}

export function webhookToSessionData(webhookData: WebhookSchema) {
  const { questions } = webhowebhookDataok;
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
      user: nanoid(16),
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

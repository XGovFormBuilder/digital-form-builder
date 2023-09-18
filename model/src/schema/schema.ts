import joi from "joi";

/**
 * If an optional key is added, CURRENT_VERSION does not need to be incremented.
 * Only breaking changes will require an increment, as well as a migration script.
 */
export const CURRENT_VERSION = 2;
const sectionsSchema = joi.object().keys({
  name: joi.string().required(),
  title: joi.string().required(),
});

const conditionFieldSchema = joi.object().keys({
  name: joi.string().required(),
  type: joi.string().required(),
  display: joi.string().required(),
});

const conditionValueSchema = joi.object().keys({
  type: joi.string().required(),
  value: joi.string().required(),
  display: joi.string().required(),
});

const relativeTimeValueSchema = joi.object().keys({
  type: joi.string().required(),
  timePeriod: joi.string().required(),
  timeUnit: joi.string().required(),
  direction: joi.string().required(),
  timeOnly: joi.boolean().required(),
});

const conditionRefSchema = joi.object().keys({
  conditionName: joi.string().required(),
  conditionDisplayName: joi.string().required(),
  coordinator: joi.string().optional(),
});

const conditionSchema = joi.object().keys({
  field: conditionFieldSchema,
  operator: joi.string().required(),
  value: joi.alternatives().try(conditionValueSchema, relativeTimeValueSchema),
  coordinator: joi.string().optional(),
});

const conditionGroupSchema = joi.object().keys({
  conditions: joi
    .array()
    .items(
      joi
        .alternatives()
        .try(
          conditionSchema,
          conditionRefSchema,
          joi.any() /** Should be a joi.link('#conditionGroupSchema') */
        )
    ),
});

const conditionsModelSchema = joi.object().keys({
  name: joi.string().required(),
  conditions: joi
    .array()
    .items(
      joi
        .alternatives()
        .try(conditionSchema, conditionRefSchema, conditionGroupSchema)
    ),
});

const conditionsSchema = joi.object().keys({
  name: joi.string().required(),
  displayName: joi.string(),
  value: joi.alternatives().try(joi.string(), conditionsModelSchema).required(),
});

const localisedString = joi
  .alternatives()
  .try(joi.object({ a: joi.any() }).unknown(), joi.string().allow(""));

export const componentSchema = joi
  .object()
  .keys({
    type: joi.string().required(),
    name: joi.string(),
    title: localisedString,
    hint: localisedString.optional(),
    options: joi.object().default({}),
    schema: joi
      .object({ min: joi.number(), max: joi.number() })
      .unknown(true)
      .default({}),
    list: joi.string().optional(),
  })
  .unknown(true);

const nextSchema = joi.object().keys({
  path: joi.string().required(),
  condition: joi.string().allow("").optional(),
});

/**
 * `/status` is a special route for providing a user's application status.
 *  It should not be configured via the designer.
 */
const pageSchema = joi.object().keys({
  path: joi.string().required().disallow("/status"),
  title: localisedString,
  section: joi.string(),
  controller: joi.string(),
  components: joi.array().items(componentSchema),
  next: joi.array().items(nextSchema),
  repeatField: joi.string().optional(),
  options: joi.object().optional(),
  backLinkFallback: joi.string().optional(),
});

const toggleableString = joi.alternatives().try(joi.boolean(), joi.string());

const confirmationPageSchema = joi.object({
  customText: joi
    .object({
      title: joi.string().default("Application complete"),
      paymentSkipped: toggleableString.default(
        "Someone will be in touch to make a payment."
      ),
      nextSteps: toggleableString.default(
        "You will receive an email with details with the next steps."
      ),
    })
    .default(),
  components: joi.array().items(componentSchema),
});

const specialPagesSchema = joi.object().keys({
  confirmationPage: confirmationPageSchema,
});

const listItemSchema = joi.object().keys({
  text: localisedString,
  value: joi.alternatives().try(joi.number(), joi.string()),
  description: localisedString.optional(),
  conditional: joi
    .object()
    .keys({
      components: joi
        .array()
        .required()
        .items(componentSchema.unknown(true))
        .unique("name"),
    })
    .allow(null)
    .optional(),
  condition: joi.string().allow(null, "").optional(),
});

const listSchema = joi.object().keys({
  name: joi.string().required(),
  title: localisedString,
  type: joi.string().required().valid("string", "number"),
  items: joi.array().items(listItemSchema),
});

const feeSchema = joi.object().keys({
  description: joi.string().required(),
  amount: joi.number().required(),
  multiplier: joi.string().optional(),
  condition: joi.string().optional(),
  prefix: joi.string().optional(),
});

const multiApiKeySchema = joi.object({
  test: joi.string().optional(),
  production: joi.string().optional(),
});

const replyToConfigurationSchema = joi.object({
  emailReplyToId: joi.string(),
  condition: joi.string().allow("").optional(),
});

const notifySchema = joi.object().keys({
  apiKey: [joi.string().allow("").optional(), multiApiKeySchema],
  templateId: joi.string(),
  emailField: joi.string(),
  personalisation: joi.array().items(joi.string()),
  personalisationFieldCustomisation: joi
    .object()
    .pattern(/./, joi.array().items(joi.string()))
    .optional(),
  addReferencesToPersonalisation: joi.boolean().optional(),
  emailReplyToIdConfiguration: joi.array().items(replyToConfigurationSchema),
});

const emailSchema = joi.object().keys({
  emailAddress: joi.string(),
});

const webhookSchema = joi.object().keys({
  url: joi.string(),
});

const savePerPageSchema = joi.object().keys({
  savePerPageUrl: joi.string(),
});

const outputSchema = joi.object().keys({
  name: joi.string(),
  title: joi.string().optional(),
  type: joi
    .string()
    .allow("notify", "email", "webhook", "savePerPage", "sheets"),
  outputConfiguration: joi
    .alternatives()
    .try(notifySchema, emailSchema, webhookSchema, savePerPageSchema),
});

const feedbackSchema = joi.object().keys({
  feedbackForm: joi.boolean().default(false),
  url: joi.when("feedbackForm", {
    is: joi.boolean().valid(false),
    then: joi.string().optional().allow(""),
  }),
  emailAddress: joi
    .string()
    .email({
      tlds: {
        allow: false,
      },
    })
    .optional(),
});

const phaseBannerSchema = joi.object().keys({
  phase: joi.string().valid("alpha", "beta"),
});

const feeOptionSchema = joi
  .object()
  .keys({
    payApiKey: [joi.string().allow("").optional(), multiApiKeySchema],
    paymentReferenceFormat: [joi.string().optional()],
    payReturnUrl: joi.string().optional(),
  })
  .default(({ payApiKey, paymentReferenceFormat }) => {
    return {
      ...(payApiKey && { payApiKey }),
      ...(paymentReferenceFormat && { paymentReferenceFormat }),
    };
  });

export const Schema = joi
  .object()
  .required()
  .keys({
    name: localisedString.optional(),
    feedback: feedbackSchema,
    startPage: joi.string().required(),
    pages: joi.array().required().items(pageSchema).unique("path"),
    sections: joi.array().items(sectionsSchema).unique("name").required(),
    conditions: joi.array().items(conditionsSchema).unique("name"),
    lists: joi.array().items(listSchema).unique("name"),
    fees: joi.array().items(feeSchema).optional(),
    paymentReferenceFormat: joi.string().optional(),
    metadata: joi.object({ a: joi.any() }).unknown().optional(),
    declaration: joi.string().allow("").optional(),
    outputs: joi.array().items(outputSchema),
    payApiKey: [joi.string().allow("").optional(), multiApiKeySchema],
    skipSummary: joi.boolean().default(false),
    version: joi.number().default(CURRENT_VERSION),
    phaseBanner: phaseBannerSchema,
    specialPages: specialPagesSchema.optional(),
    feeOptions: feeOptionSchema,
  });

/**
 *  Schema versions:
 *  Undefined / 0 - initial version as at 28/8/20. Conditions may be in object structure or string form.
 *  1 - Relevant components (radio, checkbox, select, autocomplete) now contain
 *      options as 'values' rather than referencing a data list
 *  2 - Reverse v1. Values populating radio, checkboxes, select, autocomplete are defined in Lists only.
 *  TODO:- merge fees and paymentReferenceFormat
 *  2 - 2023-05-04 `feeOptions` has been introduced. paymentReferenceFormat and payApiKey can be configured in top level or feeOptions. feeOptions will take precedent.
 *      if feeOptions are empty, it will pull values from the top level keys.
 *      WARN: Fee/GOV.UK pay configurations (apart from fees) should no longer be stored in the top level, always within feeOptions.
 **/

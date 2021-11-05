import joi from "joi";
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

const componentSchema = joi
  .object()
  .keys({
    type: joi.string().required(),
    name: joi.string(),
    title: localisedString,
    hint: localisedString.optional(),
    options: joi.object().default({}),
    schema: joi.object().default({}),
    errors: joi.object({ a: joi.any() }).optional(),
    list: joi.string(),
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
});

const confirmationPageSchema = joi.object({
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

const logicExpressionsSchema = joi.object().keys({
  label: joi.string().required(),
  variableName: joi.string().required(),
  expression: joi.string().required(),
});

const feeSchema = joi.object().keys({
  description: joi.string().required(),
  amount: joi.number().required(),
  multiplier: joi.string().optional(),
  condition: joi.string().optional(),
});

const multiApiKeySchema = joi.object({
  test: joi.string().optional(),
  production: joi.string().optional(),
});

const notifySchema = joi.object().keys({
  apiKey: [joi.string().allow("").optional(), multiApiKeySchema],
  templateId: joi.string(),
  emailField: joi.string(),
  personalisation: joi.array().items(joi.string()),
  addReferencesToPersonalisation: joi.boolean().optional(),
});

const emailSchema = joi.object().keys({
  emailAddress: joi.string(),
});

const webhookSchema = joi.object().keys({
  url: joi.string(),
});

const freshdeskSchema = joi.object().keys({
  freshdeskHost: joi.string(),
  apiKey: joi.string(),
  customFields: joi.string().allow("").optional(),
});

const outputSchema = joi.object().keys({
  name: joi.string(),
  title: joi.string().optional(),
  type: joi.string().allow("notify", "email", "webhook", "sheets", "freshdesk"),
  outputConfiguration: joi
    .alternatives()
    .try(notifySchema, emailSchema, webhookSchema, freshdeskSchema),
});

const feedbackSchema = joi.object().keys({
  feedbackForm: joi.boolean().default(false),
  url: joi.when("feedbackForm", {
    is: joi.boolean().valid(false),
    then: joi.string().optional(),
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

export const Schema = joi
  .object()
  .required()
  .keys({
    id: joi.string().allow("").optional(),
    name: localisedString.optional(),
    feedback: feedbackSchema,
    startPage: joi.string().required(),
    pages: joi.array().required().items(pageSchema).unique("path"),
    sections: joi.array().items(sectionsSchema).unique("name").required(),
    conditions: joi.array().items(conditionsSchema).unique("name"),
    lists: joi.array().items(listSchema).unique("name"),
    logicExpressions: joi
      .array()
      .items(logicExpressionsSchema)
      .unique("name")
      .optional(),
    fees: joi.array().items(feeSchema).optional(),
    metadata: joi.object({ a: joi.any() }).unknown().optional(),
    declaration: joi.string().allow("").optional(),
    outputs: joi.array().items(outputSchema),
    payApiKey: [joi.string().allow("").optional(), multiApiKeySchema],
    skipSummary: joi.boolean().default(false),
    version: joi.number().default(CURRENT_VERSION),
    phaseBanner: phaseBannerSchema,
    specialPages: specialPagesSchema.optional(),
    totalSubs: joi.number().optional(),
    createdAt: joi.string().allow("").optional(),
    updatedAt: joi.string().allow("").optional(),
  });

/**
 *  Schema versions:
 *  Undefined / 0 - initial version as at 28/8/20. Conditions may be in object structure or string form.
 *  1 - Relevant components (radio, checkbox, select, autocomplete) now contain
 *      options as 'values' rather than referencing a data list
 *  2 - Reverse v1. Values populating radio, checkboxes, select, autocomplete are defined in Lists only.
 **/

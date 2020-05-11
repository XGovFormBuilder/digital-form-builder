const joi = require('joi')

const sectionsSchema = joi.object().keys({
  name: joi.string().required(),
  title: joi.string().required()
})

const conditionsSchema = joi.object().keys({
  name: joi.string().required(),
  value: joi.string().required()
})

const localisedString = joi.alternatives().try([joi.object({ a: joi.any() }).unknown(), joi.string().allow('')])

const componentSchema = joi.object().keys({
  type: joi.string().required(),
  name: joi.string(),
  title: localisedString,
  hint: localisedString.optional(),
  options: joi.object().default({}),
  schema: joi.object().default({}),
  errors: joi.object({ a: joi.any() }).optional()
}).unknown(true)

const nextSchema = joi.object().keys({
  path: joi.string().required(),
  if: joi.string()
})

const pageSchema = joi.object().keys({
  path: joi.string().required(),
  title: localisedString,
  condition: joi.string(),
  section: joi.string(),
  controller: joi.string(),
  components: joi.array().items(componentSchema),
  next: joi.array().items(nextSchema)
})

const listItemSchema = joi.object().keys({
  text: localisedString,
  value: joi.alternatives().try(joi.number(), joi.string()),
  description: localisedString.optional(),
  conditional: joi.object().keys({
    components: joi.array().required().items(componentSchema.unknown(true)).unique('name')
  }).allow(null).optional(),
  condition: joi.string().allow('').optional()
})

const listSchema = joi.object().keys({
  name: joi.string().required(),
  title: localisedString,
  type: joi.string().required().valid('string', 'number'),
  items: joi.array().items(listItemSchema)
})

const feeSchema = joi.object().keys({
  description: joi.string().required(),
  amount: joi.number().required(),
  multiplier: joi.string().optional(),
  condition: joi.string().optional()
})

const metadataSchema = joi.object().keys({
  post: joi.string(),
  caseType: joi.string(),
  summary: joi.string()
})

const notifySchema = joi.object().keys({
  apiKey: joi.string().allow('').optional(),
  templateId: joi.string(),
  personalisation: joi.array().items(joi.string()),
  emailField: joi.string()
})

const emailSchema = joi.object().keys({
  emailAddress: joi.string()
})

const webhookSchema = joi.object().keys({
  url: joi.string()
})

const sheetItemSchema = joi.object().keys({
  name: joi.string(),
  id: joi.string()
})

const sheetsSchema = joi.object().keys({
  credentials: joi.object().keys({
    private_key: joi.string(),
    client_email: joi.string()
  }),
  project_id: joi.string(),
  scopes: joi.array().items(joi.string()),
  sheets: joi.array().items(sheetItemSchema),
  spreadsheetIdField: joi.string()
})
const outputSchema = joi.object().keys({
  name: joi.string(),
  type: joi.string().allow('confirmationEmail', 'email', 'webhook', 'sheets'),
  outputConfiguration: joi.alternatives().try(notifySchema, emailSchema, webhookSchema, sheetsSchema)
})

const schema = joi.object().required().keys({
  name: localisedString.optional(),
  startPage: joi.string().required(),
  pages: joi.array().required().items(pageSchema).unique('path'),
  sections: joi.array().items(sectionsSchema).unique('name').required(),
  conditions: joi.array().items(conditionsSchema).unique('name'),
  lists: joi.array().items(listSchema).unique('name'),
  fees: joi.array().items(feeSchema).optional(),
  metadata: joi.object({ a: joi.any() }).unknown().optional(),
  declaration: joi.string().allow('').optional(),
  outputs: joi.array().items(outputSchema),
  payApiKey: joi.string().allow('').optional(),
  skipSummary: joi.boolean().default(false)
})

module.exports = schema

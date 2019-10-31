const joi = require('joi')

const fieldSchema = joi.object({
  id: joi.string().required(),
  type: joi.string().required(),
  title: joi.string().required(),
  answer: joi.any().required()
})

const questionSchema = joi.object({
  id: joi.string().required(),
  section: joi.string().optional(),
  question: joi.string().required(),
  fields: joi.array().items(fieldSchema).unique('id')
})

const feeDetailSchema = joi.object({
  description: joi.string().required(),
  amount: joi.number().required()
})

const feesSchema = joi.object({
  detail: joi.array().items(feeDetailSchema),
  receipt: joi.string().required(),
  total: joi.number().required()
})

const casebookNotarialApplicationSchema = joi.object().required().keys({
  id: joi.string().required(),
  name: joi.string().required(),
  preferredLanguage: joi.string().optional(),
  fees: feesSchema,
  questions: joi.array().items(questionSchema)
})

module.exports = {
  casebookNotarialApplicationSchema
}

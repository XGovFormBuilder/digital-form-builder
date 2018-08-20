const Joi = require('joi')

const serverSchema = Joi.object().required().keys({
  host: Joi.string().hostname(),
  port: Joi.number().required()
})

module.exports = {
  server: serverSchema,
  logging: Joi.object(), // good logging config
  views: Joi.object({
    cache: Joi.boolean().required()
  }).required(),
  ordnanceSurveyKey: Joi.string().required()
}

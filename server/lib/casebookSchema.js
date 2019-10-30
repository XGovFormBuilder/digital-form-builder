const joi = require('joi')

const addressSchema = joi.object().required().keys({
  companyName: joi.string().optional(),
  flatNumber: joi.string().optional(),
  premises: joi.string().optional(),
  houseNumber: joi.string().optional(),
  street: joi.string().optional(),
  district: joi.string().optional(),
  town: joi.string().optional(),
  region: joi.string().optional(),
  postcode: joi.string().optional(),
  country: joi.string().optional()
})

const casebookApplicantSchema = joi.object().required().keys({
  reference: joi.string().optional(),
  forenames: joi.string().required(),
  surname: joi.string().required(),
  primaryTelephone: joi.string().optional(),
  mobileTelephone: joi.string().optional(),
  language: joi.string().optional(),
  ethnicity: joi.string().optional(),
  nationality: joi.string().optional(),
  secondNationality: joi.string().optional(),
  cityOfBirth: joi.string().optional(),
  countryOfBirth: joi.string().optional(),
  address: addressSchema.optional()
})

const casebookApplicationSchema = joi.object().required().keys({
  post: joi.string().required(),
  caseType: joi.string().valid(['Citizenship Ceremony', 'Consular Marriage', 'Local Marriage', 'Notarial or Other Service']).required(),
  summary: joi.string().required(),
  description: joi.string().optional(),
  customerInsightConsent: joi.string().valid(['Yes', 'No']).required(),
  reasonForBeingOverseas: joi.string().optional(),
  marriageCategory: joi.string().valid(['Civil Partnership', 'Conversion', 'Marriage']),
  attachments: joi.array().required()
})

const casebookNotarialApplicationSchema = joi.object().required().keys({
  applicant: casebookApplicantSchema,
  application: casebookApplicationSchema
})

module.exports = {
  casebookNotarialApplicationSchema
}

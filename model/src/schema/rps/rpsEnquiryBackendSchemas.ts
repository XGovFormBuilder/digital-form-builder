import joi from "joi";

export const rpsEnquiryRequestSchema = joi
  .object({
    uuid: joi.string().min(1).required(),
    firstName: joi.string().min(1).required(),
    lastName: joi.string().min(1).required(),
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required(),
    organisation: joi.string().min(1).optional(),
    subject: joi.string().min(1).required(),
    description: joi.string().min(1).required(),
    service: joi.string().min(1).required(),
  })
  .unknown(true);

export type RpsEnquiryRequest = {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  organisation?: string;
  subject: string;
  description: string;
  service: string;
};

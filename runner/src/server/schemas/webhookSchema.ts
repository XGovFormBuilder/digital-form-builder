import joi from "joi";
import { ComponentType } from "@xgovformbuilder/model";
import { FeeDetails } from "server/services/payService";

const fieldSchema = joi.object({
  key: joi.string().required(),
  type: joi.string().required(),
  title: joi.string().required(),
  answer: joi.any().required(),
});

export type Field = {
  key: string;
  type: ComponentType;
  title: string;
  answer: any;
};

const questionSchema = joi.object({
  category: joi.string().optional(),
  question: joi.string().required(),
  fields: joi.array().items(fieldSchema),
});

type Question = {
  category?: string;
  question: string;
  fields: Field[];
};

const feeDetailSchema = joi.object({
  description: joi.string().required(),
  amount: joi.number().required(),
});

const feesSchema = joi
  .object({
    details: joi.array().items(feeDetailSchema),
    paymentReference: joi.string().required(),
    total: joi.number().required(),
  })
  .optional();

const metadataSchema = joi.object();

export const webhookSchema = joi.object().keys({
  name: joi.string().required(),
  preferredLanguage: joi.string().optional(),
  fees: feesSchema,
  questions: joi.array().items(questionSchema),
  metadata: metadataSchema,
});

export type WebhookSchema = {
  name: string;
  preferredLanguage?: string;
  fees: FeeDetails;
  questions: Question[];
  metadata?: { [key: string]: unknown };
};

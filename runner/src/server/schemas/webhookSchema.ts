import joi from "joi";
import {
  Field,
  InitialiseSessionQuestion,
  InitialiseSessionSchema,
  WebhookSchema,
} from "server/schemas/types";
import { Question } from "server/plugins/engine/models/types";
import { componentSchema } from "@xgovformbuilder/model";

const fieldSchema: joi.ObjectSchema<Field> = joi.object({
  key: joi.string().required(),
  type: joi.string().required(),
  title: joi.string().required(),
  answer: joi.any().required(),
});

const questionSchema: joi.ObjectSchema<Question> = joi.object({
  category: joi.string().optional(),
  question: joi.string().required(),
  fields: joi.array().items(fieldSchema),
});

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

const metadataSchema = joi.object().unknown(true);

export const webhookSchema: joi.ObjectSchema<WebhookSchema> = joi.object({
  name: joi.string().required(),
  preferredLanguage: joi.string().optional(),
  fees: feesSchema,
  questions: joi.array().items(questionSchema),
  metadata: metadataSchema,
});

const sessionFieldSchema = joi.object({
  key: joi.string().required(),
  answer: joi.any().required(),
});

const sessionQuestionSchema: joi.ObjectSchema<InitialiseSessionQuestion> = joi.object(
  {
    category: joi.string().optional(),
    fields: joi.array().items(sessionFieldSchema),
  }
);

const optionsSchema: joi.ObjectSchema<
  InitialiseSessionSchema["options"]
> = joi.object({
  callbackUrl: joi
    .string()
    .required()
    .note("The endpoint to send the amended data to"),
  redirectPath: joi
    .string()
    .optional()
    .allow("")
    .note("appended to URL of formId after GET /session/${token}"),
  message: joi
    .string()
    .optional()
    .allow("")
    .note("Message to display to the user on the summary page"),
  customText: joi
    .object({
      title: joi.string().optional().allow(false, ""),
      paymentSkipped: joi.string().optional().allow(false, ""),
      nextSteps: joi.string().optional().allow(false, ""),
      hidePanel: joi.boolean().optional(),
    })
    .optional(),
  components: joi.array().items(componentSchema),
});

//TODO:- make this work with initialiseSession POST endpoint, so the endpoint can be auto-documented
export const initialiseSessionSchema: joi.ObjectSchema<InitialiseSessionSchema> = joi.object(
  {
    name: joi.string().optional().allow(""),
    options: optionsSchema,
    questions: joi.array().items(sessionQuestionSchema),
    metadata: metadataSchema.optional(),
  }
);

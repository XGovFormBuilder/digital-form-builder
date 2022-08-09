import { ComponentType, ConfirmationPage } from "@xgovformbuilder/model";
import { FeeDetails } from "server/services/payService";

export type Field = {
  key: string;
  type: ComponentType;
  title: string;
  answer: any;
};

export type Question = {
  category?: string;
  question: string;
  fields: Field[];
};

export type WebhookSchema = {
  name: string;
  preferredLanguage?: string;
  fees: FeeDetails;
  questions: Question[];
  metadata?: { [key: string]: unknown };
};

export type InitialiseSessionField = Pick<Field, "key" | "answer">;
export type InitialiseSessionQuestion = {
  fields: InitialiseSessionField[];
} & Question;

export type InitialiseSessionSchema = {
  options: {
    callbackUrl: string;
    redirectPath?: string;
    customText: ConfirmationPage["customText"];
    components: ConfirmationPage["components"];
    returnUrl?: string;
  };
  questions: InitialiseSessionQuestion[];
} & Pick<WebhookSchema, "questions" | "metadata">;

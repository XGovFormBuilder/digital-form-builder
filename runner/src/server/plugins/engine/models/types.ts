import type { Fees } from "server/services/payService";
import { FeedbackContextInfo } from "./../feedback";
import { ConditionRawData } from "@xgovformbuilder/model";

export type Fields = {
  key: string;
  title: string;
  type: string;
  answer: string | number | boolean;
}[];

export type Questions = {
  category: string | null;
  question: string;
  fields: Fields;
  index?: number;
}[];

export type WebhookData = {
  name: string;
  metadata: any;
  fees?: Fees;
  questions: Questions;
};

type FeedbackContextItem = {
  key:
    | "feedbackContextInfo_formTitle"
    | "feedbackContextInfo_pageTitle"
    | "feedbackContextInfo_url";
  display: string;
  get: (contextInfo: FeedbackContextInfo) => string;
};

export const FEEDBACK_CONTEXT_ITEMS: Readonly<FeedbackContextItem[]> = [
  {
    key: "feedbackContextInfo_formTitle",
    display: "Feedback source form name",
    get: (contextInfo) => contextInfo.formTitle,
  },
  {
    key: "feedbackContextInfo_pageTitle",
    display: "Feedback source page title",
    get: (contextInfo) => contextInfo.pageTitle,
  },
  {
    key: "feedbackContextInfo_url",
    display: "Feedback source url",
    get: (contextInfo) => contextInfo.url,
  },
];

export type ExecutableCondition = ConditionRawData & {
  fn: (state: any) => boolean;
};

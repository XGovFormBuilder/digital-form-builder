import type { Fees } from "server/services/payService";
import { FeedbackContextInfo } from "./../feedback";
import { ConditionRawData } from "@xgovformbuilder/model";
import { Page, Section } from "@xgovformbuilder/model";
import { Component } from "./../components";
export type Fields = {
  key: string;
  title: string;
  type: string;
  answer: string | number | boolean;
  columnTitles?: any;
}[];

export type Question = {
  category: string | null;
  question: string;
  fields: Fields;
  index?: number;
};

export type Questions = Question[];

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

/**
 * Used to render a row on a Summary List (check your answers)
 */

export type DetailItem = {
  /**
   * Name of the component defined in the JSON {@link FormDefinition}
   */
  name: Component["name"];

  /**
   * Title of the component defined in the JSON {@link FormDefinition}
   * Used as a human readable form of {@link Component.#name} and HTML content for HTML Label tag
   */
  label: Component["title"];

  /**
   * Path to redirect the user to if they decide to change this value
   */
  path: Page["path"];

  /**
   * String and/or display value of a field. For example, a Date will be displayed as 25 December 2022
   */
  value: string;

  /**
   * Raw value of a field. For example, a Date will be displayed as 2022-12-25
   */
  rawValue: string | number | object;
  url: string;
  pageId: string;
  type: Component["type"];
  title: Component["title"];
  dataType?: Component["dataType"];
  items: DetailItem[];
};

/**
 * Used to render a row on a Summary List (check your answers)
 */
export type Detail = {
  name: Section["name"] | undefined;
  title: Section["title"] | undefined;
  items: DetailItem[];
};

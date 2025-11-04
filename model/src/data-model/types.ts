import { ConditionRawData } from ".";
import { ComponentDef } from "../components/types";

type Toggleable<T> = boolean | T;

export interface Next {
  path: string;
  condition?: string;
}
export type Link = Next;

export interface Page {
  title: string;
  path: string;
  controller: string;
  components?: ComponentDef[];
  section?: string; // the section ID
  next?: { path: string; condition?: string }[];
}

export interface RepeatingFieldPage extends Page {
  controller: "RepeatingFieldPageController";
  options: {
    summaryDisplayMode?: {
      samePage?: boolean;
      separatePage?: boolean;
      hideRowTitles?: boolean;
    };
    customText?: {
      separatePageTitle?: string;
    };
  };
}

export interface Section {
  name: string;
  title: string;
  hideTitle: boolean;
}

export interface Item {
  text: string;
  value: string | number | boolean;
  description?: string;
  condition?: string;
}

export interface List {
  name: string;
  title: string;
  type: "string" | "number" | "boolean";
  items: Item[];
}

export interface Feedback {
  feedbackForm?: boolean;
  url?: string;
  emailAddress?: string;
}

export type PhaseBanner = {
  phase?: "alpha" | "beta";
  feedbackUrl?: string;
};

export type MultipleApiKeys = {
  test?: string;
  production?: string;
};

export enum OutputType {
  Email = "email",
  Notify = "notify",
  Webhook = "webhook",
}

export type EmailOutputConfiguration = {
  emailAddress: string;
};

export type NotifyOutputConfiguration = {
  apiKey: string;
  templateId: string;
  emailField: string;
  personalisation: string[];
  personalisationFieldCustomisation?: {
    [personalisationName: string]: string[];
  };
  addReferencesToPersonalisation?: boolean;
  emailReplyToIdConfiguration?: {
    emailReplyToId: string;
    condition?: string | undefined;
  }[];
  escapeURLs?: boolean;
};

export type WebhookOutputConfiguration = {
  url: string;
  sendAdditionalPayMetadata?: boolean;
  allowRetry?: boolean;
};

export type OutputConfiguration =
  | EmailOutputConfiguration
  | NotifyOutputConfiguration
  | WebhookOutputConfiguration;

export type Output = {
  name: string;
  title: string;
  type: OutputType;
  outputConfiguration: OutputConfiguration;
};

export type ConfirmationPage = {
  customText: {
    title: string;
    paymentSkipped: Toggleable<string>;
    nextSteps: Toggleable<string>;
  };
  components: ComponentDef[];
};

export type PaymentSkippedWarningPage = {
  customText: {
    title: string;
    caption: string;
    body: string;
  };
};

export type SpecialPages = {
  confirmationPage?: ConfirmationPage;
  paymentSkippedWarningPage?: PaymentSkippedWarningPage;
};

export function isMultipleApiKey(
  payApiKey: string | MultipleApiKeys | undefined
): payApiKey is MultipleApiKeys {
  let obj = payApiKey as MultipleApiKeys;
  return obj.test !== undefined || obj.production !== undefined;
}

export type Fee = {
  description: string;
  amount: number;
  multiplier?: string;
  condition?: string;
  prefix?: string;
};

export type AdditionalReportingColumn = {
  columnName: string;
  fieldPath?: string;
  staticValue?: string;
};

export type FeeOptions = {
  paymentReferenceFormat?: string;
  payReturnUrl?: string;
  allowSubmissionWithoutPayment: boolean;
  maxAttempts: number;
  customPayErrorMessage?: string;
  showPaymentSkippedWarningPage: boolean;
  additionalReportingColumns?: AdditionalReportingColumn[];
  payApiKey?: string | MultipleApiKeys | undefined;
};

export type ExitOptions = {
  url: string;
  redirectUrl?: string;
  format?: "STATE" | "WEBHOOK";
};

/**
 * `FormDefinition` is a typescript representation of `Schema`
 */
export type FormDefinition = {
  pages: Array<Page | RepeatingFieldPage>;
  conditions: ConditionRawData[];
  lists: List[];
  sections: Section[];
  startPage?: Page["path"] | undefined;
  name?: string | undefined;
  feedback?: Feedback;
  phaseBanner?: PhaseBanner;
  fees: Fee[];
  skipSummary?: boolean | undefined;
  outputs: Output[];
  declaration?: string | undefined;
  metadata?: Record<string, any>;
  payApiKey?: string | MultipleApiKeys | undefined;
  specialPages?: SpecialPages;
  paymentReferenceFormat?: string;
  feeOptions: FeeOptions;
  exitOptions: ExitOptions;
  confirmationSessionTimeout: number | undefined;
  returnTo?: boolean | undefined;
};

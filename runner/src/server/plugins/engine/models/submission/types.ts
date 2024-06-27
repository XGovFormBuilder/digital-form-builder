import { NotifyOutputConfiguration, OutputType } from "@xgovformbuilder/model";

export type TNotifyModel = Omit<
  NotifyOutputConfiguration,
  "emailField" | "replyToConfiguration" | "personalisation"
> & {
  emailAddress: string;
  emailReplyToId?: string;
  personalisation: {
    [key: string]: string | boolean;
  };
};

export type TEmailModel = {
  personalisation: {
    formName: string;
    formPayload: string;
  };
  apiKey: string;
  templateId: string;
  emailAddress: string;
};

type NotifyOutputData = {
  type: OutputType.Notify;
  outputData: TNotifyModel;
};

type EmailOutputData = {
  type: OutputType.Email;
  outputData: TEmailModel;
};

type WebhookOutputData = {
  type: OutputType.Webhook;
  outputData: {
    url: string;
    sendAdditionalPayMetadata?: boolean;
    allowRetry?: boolean;
  };
};

export type OutputData = NotifyOutputData | EmailOutputData | WebhookOutputData;

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
};

export type WebhookOutputConfiguration = {
  url: string;
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

export type ValidationErrors = {
  title?: boolean;
  name?: boolean;
  email?: boolean;
  templateId?: boolean;
  apiKey?: boolean;
  url?: boolean;
};

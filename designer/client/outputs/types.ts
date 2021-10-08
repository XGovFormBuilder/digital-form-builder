export enum OutputType {
  Email = "email",
  Notify = "notify",
  Webhook = "webhook",
  Freshdesk = "freshdesk",
}

export type EmailOutputConfiguration = {
  emailAddress: string;
};

export type NotifyOutputConfiguration = {
  apiKey: string;
  templateId: string;
  emailField: string;
  personalisation: string[];
  addReferencesToPersonalisation?: boolean;
};

export type WebhookOutputConfiguration = {
  url: string;
};

export type FreshdeskOutputConfiguration = {
  freshdeskHost: string;
  apiKey: string;
  customFields: string;
};

export type OutputConfiguration =
  | EmailOutputConfiguration
  | NotifyOutputConfiguration
  | WebhookOutputConfiguration
  | FreshdeskOutputConfiguration;

export type Output = {
  name: string;
  title: string;
  type: OutputType;
  outputConfiguration: OutputConfiguration;
};

export interface ValidationError {
  href?: string;
  children: string;
}

export type ValidationErrors = {
  title?: ValidationError;
  name?: ValidationError;
  email?: ValidationError;
  templateId?: ValidationError;
  freshdeskHost?: ValidationError;
  apiKey?: ValidationError;
  url?: ValidationError;
  customFields?: ValidationError;
};

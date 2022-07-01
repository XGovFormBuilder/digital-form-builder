export enum OutputType {
  Email = "email",
  Notify = "notify",
  Webhook = "webhook",
  SavePerPage = "savePerPage",
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

export type SavePerPageOutputConfiguration = {
  savePerPageUrl: string;
};

export type OutputConfiguration =
  | EmailOutputConfiguration
  | NotifyOutputConfiguration
  | WebhookOutputConfiguration
  | SavePerPageOutputConfiguration;

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
  apiKey?: ValidationError;
  url?: ValidationError;
  savePerPageUrl?: ValidationError;
};

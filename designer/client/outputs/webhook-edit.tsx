import React from "react";
import { ValidationErrors } from "./types";
import { Input } from "@govuk-jsx/input";

type Props = {
  url: string;
  errors: ValidationErrors;
};

const WebhookEdit = ({ url = "", errors }: Props) => (
  <Input
    id="webhook-url"
    name="webhook-url"
    label={{
      className: "govuk-label--s",
      children: ["Webhook url"],
    }}
    defaultValue={url}
    pattern="^\S+"
    errorMessage={errors?.url ? { children: errors?.url.children } : undefined}
  />
);

export default WebhookEdit;

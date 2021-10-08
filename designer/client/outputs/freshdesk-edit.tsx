import React from "react";
import { ValidationErrors } from "./types";
import { Input } from "@govuk-jsx/input";

type Props = {
  customFields: string;
  apiKey: string;
  freshdeskHost: string;
  errors: ValidationErrors;
};

const FreshdeskEdit = ({
  apiKey = "",
  freshdeskHost = "",
  customFields = "",
  errors,
}: Props) => (
  <React.Fragment>
    <Input
      id="freshdesk-freshdeskHost"
      name="freshdesk-freshdeskHost"
      label={{
        className: "govuk-label--s",
        children: ["Freshdesk host"],
      }}
      defaultValue={freshdeskHost}
      pattern="^\S+"
      errorMessage={
        errors?.freshdeskHost
          ? { children: errors?.freshdeskHost.children }
          : undefined
      }
    />
    <Input
      id="freshdesk-apiKey"
      name="freshdesk-apiKey"
      label={{
        className: "govuk-label--s",
        children: ["API key"],
      }}
      defaultValue={apiKey}
      pattern="^\S+"
      errorMessage={
        errors?.apiKey ? { children: errors?.apiKey.children } : undefined
      }
    />
    <Input
      id="freshdesk-customFields"
      name="freshdesk-customFields"
      label={{
        className: "govuk-label--s",
        children: ["Custom fields"],
      }}
      defaultValue={customFields}
      pattern="^\S+"
      errorMessage={
        errors?.customFields
          ? { children: errors?.customFields.children }
          : undefined
      }
    />
  </React.Fragment>
);

export default FreshdeskEdit;

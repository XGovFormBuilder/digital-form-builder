import React from "react";
import { Output, EmailOutputConfiguration, ValidationErrors } from "./types";
import { Input } from "@govuk-jsx/input";

type Props = {
  output: Output;
  errors: ValidationErrors;
};

const EmailEdit = ({ output, errors = {} }: Props) => {
  const outputConfiguration = (typeof output?.outputConfiguration === "object"
    ? output?.outputConfiguration
    : {
        emailAddress: "",
      }) as EmailOutputConfiguration;

  return (
    <div className="govuk-body email-edit">
      <Input
        id="email-address"
        name="email-address"
        label={{
          className: "govuk-label--s",
          children: ["Email Address"],
        }}
        defaultValue={outputConfiguration.emailAddress}
        errorMessage={
          errors?.email ? { children: errors?.email.children } : undefined
        }
      />
    </div>
  );
};

export default EmailEdit;

import React from "react";
import { Output, EmailOutputConfiguration } from "./types";

type Props = {
  output: Output;
};

const EmailEdit = ({ output }: Props) => {
  const outputConfiguration = (typeof output?.outputConfiguration === "object"
    ? output?.outputConfiguration
    : {
        emailAddress: "",
      }) as EmailOutputConfiguration;

  return (
    <div className="govuk-body email-edit">
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="email-address">
          Email Address
        </label>
        <input
          className="govuk-input"
          name="email-address"
          type="text"
          required
          defaultValue={outputConfiguration.emailAddress}
        />
      </div>
    </div>
  );
};

export default EmailEdit;

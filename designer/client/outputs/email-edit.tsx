import React from "react";
import { Output, EmailOutputConfiguration, ValidationErrors } from "./types";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";

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
      <div
        className={classNames({
          "govuk-form-group": true,
          "govuk-form-group--error": errors.email,
        })}
      >
        <label className="govuk-label" htmlFor="email-address">
          Email Address
        </label>
        {errors.email && <ErrorMessage>This field is required</ErrorMessage>}
        <input
          className={classNames({
            "govuk-input": true,
            "govuk-input--error": errors.email,
          })}
          name="email-address"
          type="text"
          defaultValue={outputConfiguration.emailAddress}
        />
      </div>
    </div>
  );
};

export default EmailEdit;

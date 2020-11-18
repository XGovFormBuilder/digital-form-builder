import React from "react";
import { ValidationErrors } from "./types";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";

type Props = {
  url: string;
  errors: ValidationErrors;
};

const WebhookEdit = ({ url = "", errors }: Props) => (
  <div
    className={classNames({
      "govuk-form-group": true,
      "govuk-form-group--error": errors.url,
    })}
  >
    <label className="govuk-label govuk-label--s" htmlFor="webhook-url">
      Webhook url
    </label>
    {errors.url && <ErrorMessage>Not a valid url</ErrorMessage>}
    <input
      className={classNames({
        "govuk-input": true,
        "govuk-input--error": errors.url,
      })}
      id="webhook-url"
      name="webhook-url"
      defaultValue={url}
      type="text"
      pattern="^\S+"
    />
  </div>
);

export default WebhookEdit;

import React, { Component } from "react";

import NotifyEditItems from "./notify-edit-items";
import { Output, NotifyOutputConfiguration, ValidationErrors } from "./types";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";

type State = {};

type Props = {
  data: any; // TODO: type
  output: Output;
  onEdit: ({ data: any }) => void;
  errors: ValidationErrors;
};

class NotifyEdit extends Component<Props, State> {
  usableKeys: { name: string; display: string }[];

  constructor(props: Props) {
    super(props);
    const { data } = this.props;
    this.usableKeys = data.allInputs().map((input) => ({
      name: input.propertyPath || "",
      display: input.title || "",
    }));
  }

  render() {
    const { data, output, onEdit, errors } = this.props;
    const { conditions } = data;
    const outputConfiguration = (typeof output.outputConfiguration === "object"
      ? output.outputConfiguration
      : {
          templateId: "",
          apiKey: "",
          emailField: "",
          personalisation: [],
        }) as NotifyOutputConfiguration;

    const { templateId, apiKey, emailField } = outputConfiguration;
    const personalisation = outputConfiguration.personalisation;
    const values = [
      ...conditions.map((condition) => ({
        name: condition.name,
        display: condition.displayName,
      })),
      ...this.usableKeys,
    ];

    return (
      <div className="govuk-body">
        <div
          className={classNames({
            "govuk-form-group": true,
            "govuk-form-group--error": errors.templateId,
          })}
        >
          <label className="govuk-label" htmlFor="template-id">
            Template ID
          </label>
          {errors.templateId && (
            <ErrorMessage>This field is required</ErrorMessage>
          )}
          <input
            className={classNames({
              "govuk-input": true,
              "govuk-input--error": errors.templateId,
            })}
            name="template-id"
            type="text"
            defaultValue={templateId}
            step="any"
          />
        </div>
        <div
          className={classNames({
            "govuk-form-group": true,
            "govuk-form-group--error": errors.apiKey,
          })}
        >
          <label className="govuk-label" htmlFor="api-key">
            API Key
          </label>
          {errors.apiKey && <ErrorMessage>This field is required</ErrorMessage>}
          <input
            className={classNames({
              "govuk-input": true,
              "govuk-input--error": errors.apiKey,
            })}
            name="api-key"
            type="text"
            defaultValue={apiKey}
            step="any"
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="email-field">
            Email field
          </label>
          <select
            className="govuk-select"
            id="email-field"
            name="email-field"
            defaultValue={emailField}
            required
          >
            {this.usableKeys.map((value, i) => (
              <option key={`${value.name}-${i}`} value={value.name}>
                {value.display ?? value.name}
              </option>
            ))}
          </select>
        </div>
        <NotifyEditItems
          items={personalisation}
          values={values}
          data={data}
          onEdit={onEdit}
        />
      </div>
    );
  }
}

export default NotifyEdit;

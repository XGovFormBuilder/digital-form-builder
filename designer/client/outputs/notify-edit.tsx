import React, { Component } from "react";

import NotifyEditItems from "./notify-edit-items";
import { Output, NotifyOutputConfiguration } from "./types";

type State = {};

type Props = {
  data: any; // TODO: type
  output: Output;
  onEdit: ({ data: any }) => void;
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
    const { data, output, onEdit } = this.props;
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
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="template-id">
            Template ID
          </label>
          <input
            className="govuk-input"
            name="template-id"
            type="text"
            required
            defaultValue={templateId}
            step="any"
          />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="api-key">
            API Key
          </label>
          <input
            className="govuk-input"
            name="api-key"
            type="text"
            required
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

import NotifyItems from "./notify-items";
import React from "react";

class NotifyEdit extends React.Component {
  constructor(props) {
    super(props);
    const { data } = this.props;
    this.usableKeys = data
      .allInputs()
      .map((input) => ({ name: input.propertyPath, display: input.title }));
  }

  render() {
    const { data, output } = this.props;
    const { conditions } = data;
    const outputConfiguration = output?.outputConfiguration ?? {
      templateId: "",
      apiKey: "",
      emailField: "",
      personalisation: [],
    };
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
            onBlur={this.onBlur}
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
            onBlur={this.onBlur}
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
              <option key={value + i} value={value.name} onBlur={this.onBlur}>
                {value.display ?? value.name}
              </option>
            ))}
          </select>
        </div>

        <NotifyItems items={personalisation} values={values} />
      </div>
    );
  }
}

export default NotifyEdit;

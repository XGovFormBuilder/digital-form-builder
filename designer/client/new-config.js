import React from "react";
import formConfigurationApi from "./load-form-configurations";

import { ChevronRight } from "./components/icons";

export default class NewConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configs: [],
      selected: { Key: "New" },
      newName: "",
      alreadyExistsError: true,
    };

    this.onSelect = this.onSelect.bind(this);
    this.onNewNameChange = this.onNewNameChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    formConfigurationApi.loadConfigurations().then((configs) => {
      this.setState({ configs });
    });
  }

  onSelect(e) {
    const { configs } = this.state;
    const { value } = e.target;

    if (value === "New") {
      this.setState({ selected: { Key: "" } });
    } else {
      const selected = configs.find((config) => config.Key === value);
      this.setState({ selected });
    }
  }

  onNewNameChange(e) {
    const { configs } = this.state;
    const parsed = e.target.value.replace(/\s+/g, "-");
    const alreadyExists =
      configs.find((config) => {
        const fileName = config.Key.replace(".json", "");
        return fileName === parsed;
      }) ?? false;
    this.setState({
      alreadyExistsError: alreadyExists,
      newName: parsed.replace(".json", ""),
    });
  }

  async onSubmit(e) {
    const { selected, newName } = this.state;
    const newResponse = await window.fetch("/new", {
      method: "POST",
      body: JSON.stringify({ selected, name: newName }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    window.location.replace(newResponse.url);
  }

  render() {
    const { selected, configs, newName, alreadyExistsError } = this.state;

    return (
      <div className="new-config">
        <div>
          <h1 className="govuk-heading-l">
            Create a new form or edit an existing form
          </h1>
          <div
            className={`govuk-form-group ${
              alreadyExistsError ? "govuk-form-group--error" : ""
            }`}
          >
            <label className="govuk-label govuk-label--m" htmlFor="formName">
              Create a new form
            </label>
            <div className="govuk-hint">
              Enter the name for your form, for example Applying for visitors
              pass
            </div>
            {alreadyExistsError && (
              <span className="govuk-error-message">
                <span id="error-already-exists" className="govuk-error-message">
                  A configuration with this name already exists.
                </span>
              </span>
            )}
            <input
              type="text"
              name="formName"
              className={`govuk-input govuk-input--width-10 ${
                alreadyExistsError ? "govuk-input--error" : ""
              }`}
              value={newName}
              onChange={this.onNewNameChange}
            />
          </div>
          <div className="govuk-form-group">
            <label
              className="govuk-label govuk-label--m"
              htmlFor="configuration"
            >
              Select an existing form to edit
            </label>
            <select
              className="govuk-select"
              id="link-source"
              name="configuration"
              value={selected.Key}
              required
              onChange={this.onSelect}
            >
              {configs.length === 0 && <option>No existing forms found</option>}
              {configs.length &&
                configs.map((config, i) => (
                  <option key={config.Key + i} value={config.Key}>
                    {config.DisplayName}
                  </option>
                ))}
            </select>
          </div>
          <button
            className="govuk-button govuk-button--start"
            onClick={this.onSubmit}
            disabled={alreadyExistsError}
          >
            Start <ChevronRight />
          </button>
        </div>
      </div>
    );
  }
}

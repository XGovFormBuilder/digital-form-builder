import React, { Component, ChangeEvent, MouseEvent } from "react";
import startCase from "lodash/startCase";

import * as formConfigurationApi from "../../load-form-configurations";
import { ChevronRightIcon } from "../Icons";
import { withI18n } from "../../i18n";
import "./NewConfig.scss";

type Props = {
  i18n(text: string): string;
};

type State = {
  configs: { Key: string; DisplayName: string }[];
  selected: { Key: string };
  newName: string;
  alreadyExistsError: boolean;
  nameIsRequiredError: boolean;
};

const parseNewName = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-");
};

export class NewConfig extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configs: [],
      selected: { Key: "New" },
      newName: "",
      alreadyExistsError: false,
      nameIsRequiredError: false,
    };
  }

  componentDidMount() {
    formConfigurationApi.loadConfigurations().then((configs) => {
      this.setState({
        configs,
      });
    });
  }

  onSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { configs } = this.state;
    const { value } = event.target;
    const selected = configs.find((config) => config.Key === value)!;
    this.setState({ selected, newName: "", alreadyExistsError: false });
  };

  onNewNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { configs } = this.state;
    const newName = event.target.value;
    const parsedName = parseNewName(newName);

    const alreadyExists =
      configs.find((config) => {
        const fileName = config.Key.toLowerCase().replace(".json", "");
        return fileName === parsedName;
      }) ?? false;

    this.setState({
      newName,
      alreadyExistsError: !!alreadyExists,
      selected: { Key: "New" },
    });
  };

  onSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const { selected, newName, alreadyExistsError } = this.state;
    const selectedConfig = selected || { Key: "New" };

    if (alreadyExistsError) {
      return;
    }

    if (selectedConfig.Key === "New" && !newName) {
      return this.setState({
        nameIsRequiredError: true,
      });
    }

    const newResponse = await window.fetch("/new", {
      method: "POST",
      body: JSON.stringify({
        selected: selectedConfig,
        name: parseNewName(newName),
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    window.location.href = newResponse.url;
  };

  render() {
    const { i18n } = this.props;
    const {
      selected,
      configs,
      newName,
      alreadyExistsError,
      nameIsRequiredError,
    } = this.state;

    const hasError = alreadyExistsError || nameIsRequiredError;

    return (
      <div className="new-config">
        <div>
          {hasError && (
            <div
              className="govuk-error-summary"
              aria-labelledby="error-summary-title"
              role="alert"
              tabIndex={-1}
              data-module="govuk-error-summary"
            >
              <h2
                className="govuk-error-summary__title"
                id="error-summary-title"
              >
                {i18n("There is a problem")}
              </h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {alreadyExistsError && (
                    <li>
                      <a href="#formName">
                        {i18n("A form with this name already exists")}
                      </a>
                    </li>
                  )}
                  {nameIsRequiredError && (
                    <li>
                      <a href="#formName">{i18n("Enter form name")}</a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <h1 className="govuk-heading-l">
            {i18n("Create a new form or edit an existing form")}
          </h1>
          <div
            className={`govuk-form-group ${
              hasError ? "govuk-form-group--error" : ""
            }`}
          >
            <label className="govuk-label govuk-label--m" htmlFor="formName">
              {i18n("Create a new form")}
            </label>
            <div className="govuk-hint">
              {i18n(
                "Enter the name for your form, for example Applying for visitors pass"
              )}
            </div>
            {alreadyExistsError && (
              <span className="govuk-error-message">
                <span id="error-already-exists" className="govuk-error-message">
                  {i18n("A form with this name already exists")}
                </span>
              </span>
            )}
            {nameIsRequiredError && (
              <span className="govuk-error-message">
                <span id="error-name-required" className="govuk-error-message">
                  {i18n("Enter form name")}
                </span>
              </span>
            )}
            <input
              type="text"
              id="formName"
              name="formName"
              className={`govuk-input govuk-input--width-10 ${
                hasError ? "govuk-input--error" : ""
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
              {i18n("Select an existing form to edit")}
            </label>
            <select
              className="govuk-select"
              id="link-source"
              name="configuration"
              value={selected.Key}
              required
              onChange={this.onSelect}
            >
              <option>{configs.length ? "" : "No existing forms found"}</option>
              {configs.length &&
                configs.map((config, i) => (
                  <option key={config.Key + i} value={config.Key}>
                    {startCase(config.DisplayName)}
                  </option>
                ))}
            </select>
          </div>
          <button
            className="govuk-button govuk-button--start"
            onClick={this.onSubmit}
          >
            {i18n("Start")} <ChevronRightIcon />
          </button>
        </div>
      </div>
    );
  }
}

export default withI18n(NewConfig);

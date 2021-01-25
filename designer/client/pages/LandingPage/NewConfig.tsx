import React, { Component, MouseEvent } from "react";
import * as formConfigurationApi from "../../load-form-configurations";
import { withRouter } from "react-router-dom";
import { BackLink } from "../../components/BackLink";
import { i18n } from "../../i18n";
import "./LandingPage.scss";

type Props = {
  history: any;
};

type State = {
  configs: { Key: string; DisplayName: string }[];
  newName: string;
  alreadyExistsError: boolean;
  nameIsRequiredError: boolean;
  notAvalidPatternError: boolean;
};

const parseNewName = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-");
};

export class NewConfig extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configs: [],
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

  onSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const { newName, configs } = this.state;
    if (!newName) {
      return this.setState({
        nameIsRequiredError: true,
      });
    }

    if (!newName.match(/^[a-zA-Z0-9 ]+$/)) {
      return this.setState({
        notAvalidPatternError: true,
      });
    }

    const parsedName = parseNewName(newName);
    const alreadyExists =
      configs.find((config) => {
        const fileName = config.Key.toLowerCase().replace(".json", "");
        return fileName === parsedName;
      }) ?? false;

    if (alreadyExists) {
      return this.setState({
        alreadyExistsError: true,
      });
    }

    const newResponse = await window
      .fetch("/api/new", {
        method: "POST",
        body: JSON.stringify({
          selected: { Key: "New" },
          name: parseNewName(newName),
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.json());
    this.props.history.push(`designer/${newResponse.id}`);
  };

  goBack = (event) => {
    event.preventDefault();
    this.props.history.goBack();
  };

  render() {
    const {
      newName,
      alreadyExistsError,
      nameIsRequiredError,
      notAvalidPatternError,
    } = this.state;

    const hasError =
      alreadyExistsError || nameIsRequiredError || notAvalidPatternError;

    return (
      <div className="new-config">
        <div>
          <BackLink onClick={this.goBack}>
            {i18n("Back to previous page")}
          </BackLink>

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
                  {notAvalidPatternError && (
                    <li>
                      <a href="#formName">
                        {i18n(
                          "Form name should not contain special characters"
                        )}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-l">
            {i18n("Enter a name for your form")}
          </h1>

          <div
            className={`govuk-form-group ${
              hasError ? "govuk-form-group--error" : ""
            }`}
          >
            <label className="govuk-visually-hidden" htmlFor="formName">
              {i18n("Form name")}
            </label>
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
            {notAvalidPatternError && (
              <span className="govuk-error-message">
                <span id="error-name-not-valid" className="govuk-error-message">
                  {i18n("Form name should not contain special characters")}
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
              onChange={(e) => this.setState({ newName: e.target.value })}
            />
          </div>
          <button
            className="govuk-button govuk-button--start"
            onClick={this.onSubmit}
          >
            {i18n("Next")}
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(NewConfig);

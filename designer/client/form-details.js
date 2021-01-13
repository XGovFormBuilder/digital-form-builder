import React from "react";
import { Radios } from "@govuk-jsx/radios";
import { Input } from "@govuk-jsx/input";
import { clone } from "@xgovformbuilder/model";

import { validateTitle, hasValidationErrors } from "./validations";
import * as formConfigurationApi from "./load-form-configurations";
import ErrorSummary from "./error-summary";
import { DataContext } from "./context";

class FormDetails extends React.Component {
  static contextType = DataContext;

  constructor(props, context) {
    super(props, context);
    const { data } = this.context;
    const { feedbackForm, feedbackUrl } = data;
    const selectedFeedbackForm = feedbackUrl?.substr(1) || "";
    this.state = {
      title: data.name || "",
      feedbackForm: feedbackForm,
      formConfigurations: [],
      selectedFeedbackForm,
      errors: {},
    };
    this.onSelectFeedbackForm = this.onSelectFeedbackForm.bind(this);
  }

  async componentDidMount() {
    const formConfigurations = await formConfigurationApi.loadConfigurations();
    this.setState({
      formConfigurations: formConfigurations.filter((it) => it.feedbackForm),
    });
  }

  onSubmit = async (e) => {
    e?.preventDefault();
    const validationErrors = this.validate();

    if (hasValidationErrors(validationErrors)) return;

    const { data, save } = this.context;
    const { title, feedbackForm, selectedFeedbackForm } = this.state;
    const copy = data.clone();
    copy.name = title;
    copy.feedbackForm = feedbackForm;
    copy.setFeedbackUrl(
      selectedFeedbackForm ? `/${selectedFeedbackForm}` : undefined
    );

    try {
      const saved = await save(copy);
      if (this.props.onCreate) {
        this.props.onCreate(saved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  validate = () => {
    const { title } = this.state;
    const errors = validateTitle("form-title", title);
    this.setState({ errors });
    return errors;
  };

  onSelectFeedbackForm(e) {
    const selectedFeedbackForm = e.target.value;
    this.setState({ selectedFeedbackForm });
  }

  handleIsFeedbackFormRadio = (e) => {
    const isFeedbackForm = e.target.value === "true";

    if (isFeedbackForm) {
      this.setState({ feedbackForm: true, selectedFeedbackForm: undefined });
    } else {
      this.setState({ feedbackForm: false });
    }
  };

  render() {
    const {
      title,
      feedbackForm,
      selectedFeedbackForm,
      formConfigurations,
      errors,
    } = this.state;

    return (
      <>
        {Object.keys(errors).length > 0 && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={this.onSubmit} autoComplete="off">
          <Radios
            name="feedbackForm"
            value={feedbackForm}
            onChange={this.handleIsFeedbackFormRadio}
            required={true}
            fieldset={{
              legend: {
                children: ["Is this a feedback form?"],
              },
            }}
            hint={{
              children: [
                "A feedback form is used to gather feedback from users about another form",
              ],
            }}
            items={[
              {
                children: ["Yes"],
                value: true,
              },
              {
                children: ["No"],
                value: false,
              },
            ]}
          />
          <Input
            id="form-title"
            name="title"
            label={{
              className: "govuk-label--s",
              children: ["Title"],
            }}
            onBlur={(e) => this.setState({ title: e.target.value })}
            defaultValue={title}
            errorMessage={
              errors?.title ? { children: errors.title.children } : undefined
            }
          />
          {!feedbackForm && (
            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-label--s"
                htmlFor="target-feedback-form"
              >
                Feedback form
              </label>
              {formConfigurations.length === 0 && (
                <div className="govuk-hint" id="target-feedback-form-hint">
                  <p>No available feedback form configurations found</p>
                  <p>
                    Only forms marked as being a feedback form are listed here
                  </p>
                </div>
              )}

              {formConfigurations.length > 0 && (
                <div>
                  <div id="target-feedback-form-hint" className="govuk-hint">
                    <p>
                      This is the form to use for gathering feedback about this
                      form
                    </p>
                    <p>
                      Only forms marked as being a feedback form are listed here
                    </p>
                  </div>
                  <select
                    className="govuk-select"
                    id="target-feedback-form"
                    name="targetFeedbackForm"
                    value={selectedFeedbackForm}
                    required
                    onChange={this.onSelectFeedbackForm}
                  >
                    <option />
                    {formConfigurations.map((config, index) => (
                      <option key={config.Key + index} value={config.Key}>
                        {config.DisplayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="govuk-button">
            Save
          </button>
        </form>
      </>
    );
  }
}

export default FormDetails;

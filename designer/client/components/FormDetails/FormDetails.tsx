import React, { ChangeEvent } from "react";

import { Input } from "@govuk-jsx/input";

import { validateTitle, hasValidationErrors } from "../../validations";
import * as formConfigurationApi from "../../load-form-configurations";
import ErrorSummary from "../../error-summary";
import { DataContext } from "../../context";
import { FormDetailsFeedback } from "./FormDetailsFeedback";

export class FormDetails extends React.Component {
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

  onSelectFeedbackForm = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFeedbackForm = event.target.value;
    this.setState({ selectedFeedbackForm });
  };

  handleIsFeedbackFormRadio = (event: ChangeEvent<HTMLInputElement>) => {
    const isFeedbackForm = event.target.value === "true";

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
          <FormDetailsFeedback
            feedbackForm={feedbackForm}
            selectedFeedbackForm={selectedFeedbackForm}
            formConfigurations={formConfigurations}
            handleIsFeedbackFormRadio={this.handleIsFeedbackFormRadio}
            onSelectFeedbackForm={this.onSelectFeedbackForm}
          />
          <button type="submit" className="govuk-button">
            Save
          </button>
        </form>
      </>
    );
  }
}

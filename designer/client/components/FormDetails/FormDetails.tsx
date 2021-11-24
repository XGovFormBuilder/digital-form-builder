import React, { Component, ChangeEvent, ContextType, FormEvent } from "react";
import { FormConfiguration, FormDefinition } from "@xgovformbuilder/model";
import isFunction from "lodash/isFunction";

import { validateTitle, hasValidationErrors } from "../../validations";
import * as formConfigurationApi from "../../load-form-configurations";
import ErrorSummary from "../../error-summary";
import { DataContext } from "../../context";
import { i18n } from "../../i18n";

import { FormDetailsTitle } from "./FormDetailsTitle";
import { FormDetailsFeedback } from "./FormDetailsFeedback";
import { FormDetailsPhaseBanner } from "./FormDetailsPhaseBanner";
import "./FormDetails.scss";
import logger from "../../plugins/logger";
type PhaseBanner = Exclude<FormDefinition["phaseBanner"], undefined>;
type Phase = PhaseBanner["phase"];

interface Props {
  onCreate?: () => void;
}

interface State {
  title: string;
  phase: Phase;
  feedbackForm: boolean;
  formConfigurations: FormConfiguration[];
  selectedFeedbackForm?: string;
  errors: any;
}

export class FormDetails extends Component<Props, State> {
  static contextType = DataContext;
  context!: ContextType<typeof DataContext>;
  isUnmounting = false;

  constructor(props, context) {
    super(props, context);
    const { data } = context;
    const selectedFeedbackForm = data.feedback?.url?.substr(1) ?? "";
    this.state = {
      title: data.name || "",
      feedbackForm: data.feedback?.feedbackForm ?? false,
      formConfigurations: [],
      selectedFeedbackForm,
      phase: data.phaseBanner?.phase,
      errors: {},
    };
  }

  onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = this.validate();

    if (hasValidationErrors(validationErrors)) return;

    const { data, save } = this.context;
    const {
      title,
      feedbackForm = false,
      selectedFeedbackForm,
      phase,
    } = this.state;
    const { phaseBanner = {} } = data;

    let copy: FormDefinition = { ...data };
    copy.name = title;
    copy.feedback = {
      feedbackForm,
      url: selectedFeedbackForm ? `/${selectedFeedbackForm}` : "",
    };

    copy.phaseBanner = {
      ...phaseBanner,
      phase,
    };

    try {
      await save(copy);
      this.props.onCreate?.();
    } catch (err) {
      logger.error("FormDetails", err);
    }
  };

  validate = () => {
    const { title } = this.state;
    const errors = validateTitle("form-title", title);
    this.setState({ errors });
    return errors;
  };

  onSelectFeedbackForm = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedFeedbackForm = event.target.value;
    this.setState({ selectedFeedbackForm });
  };

  handleIsFeedbackFormRadio = (event: ChangeEvent<HTMLSelectElement>) => {
    const isFeedbackForm = event.target.value === "true";
    logger.info("FormDetails", "handle is feedback");

    if (isFeedbackForm) {
      this.setState({ feedbackForm: true, selectedFeedbackForm: undefined });
    } else {
      this.setState({ feedbackForm: false });
    }
  };

  handlePhaseBannerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const phase = event.target.value as Phase;
    this.setState({ phase: phase || undefined });
  };

  handleTitleInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  };

  render() {
    const {
      title,
      phase,
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
          <FormDetailsTitle
            title={title}
            errors={errors}
            handleTitleInputBlur={this.handleTitleInputBlur}
          />
          <FormDetailsPhaseBanner
            phase={phase}
            handlePhaseBannerChange={this.handlePhaseBannerChange}
          />
          <FormDetailsFeedback
            feedbackForm={feedbackForm}
            selectedFeedbackForm={selectedFeedbackForm}
            formConfigurations={formConfigurations}
            handleIsFeedbackFormRadio={this.handleIsFeedbackFormRadio}
            onSelectFeedbackForm={this.onSelectFeedbackForm}
          />
          <button type="submit" className="govuk-button">
            {i18n("Save")}
          </button>
        </form>
      </>
    );
  }
}

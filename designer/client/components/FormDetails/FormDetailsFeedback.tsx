import React, { ChangeEvent } from "react";
import { Radios } from "@govuk-jsx/radios";
import { Label } from "@govuk-jsx/label";
import { FormConfiguration } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";

type Props = {
  feedbackForm: any;
  handleIsFeedbackFormRadio: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSelectFeedbackForm: (event: ChangeEvent<HTMLSelectElement>) => void;
  formConfigurations: FormConfiguration[];
  selectedFeedbackForm: string | undefined;
};

export const FormDetailsFeedback = (props: Props) => {
  const {
    feedbackForm = false,
    handleIsFeedbackFormRadio,
    onSelectFeedbackForm,
    formConfigurations,
    selectedFeedbackForm,
  } = props;

  return (
    <div className="govuk-form-group">
      <Radios
        name="feedbackForm"
        value={feedbackForm}
        onChange={handleIsFeedbackFormRadio}
        required={true}
        fieldset={{
          legend: {
            children: (
              <Label
                className="govuk-label--s"
                htmlFor="#field-form-phase-banner"
              >
                {i18n("formDetails.feedbackForm.fieldTitle")}
              </Label>
            ),
          },
        }}
        hint={{
          children: [i18n("formDetails.feedbackForm.fieldHint")],
        }}
        items={[
          {
            children: [i18n("yes")],
            value: true,
          },
          {
            children: [i18n("no")],
            value: false,
          },
        ]}
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
              <p>Only forms marked as being a feedback form are listed here</p>
            </div>
          )}

          {formConfigurations.length > 0 && (
            <div>
              <div id="target-feedback-form-hint" className="govuk-hint">
                <p>
                  This is the form to use for gathering feedback about this form
                </p>
                <p>
                  Only forms marked as being a feedback form are listed here
                </p>
              </div>
              <select
                className="govuk-select"
                id="target-feedback-form"
                data-testid="target-feedback-form"
                name="targetFeedbackForm"
                value={selectedFeedbackForm}
                required
                onChange={onSelectFeedbackForm}
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
    </div>
  );
};

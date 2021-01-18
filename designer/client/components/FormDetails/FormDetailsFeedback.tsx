import React, { ChangeEvent } from "react";
import { Radios } from "@govuk-jsx/radios";
import { FormConfiguration } from "@xgovformbuilder/model";

type Props = {
  feedbackForm: any;
  handleIsFeedbackFormRadio: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectFeedbackForm: (event: ChangeEvent<HTMLInputElement>) => void;
  formConfigurations: FormConfiguration[];
  selectedFeedbackForm: string;
};

export const FormDetailsFeedback = (props: Props) => {
  const {
    feedbackForm,
    handleIsFeedbackFormRadio,
    onSelectFeedbackForm,
    formConfigurations,
    selectedFeedbackForm,
  } = props;

  return (
    <>
      <Radios
        name="feedbackForm"
        value={feedbackForm}
        onChange={handleIsFeedbackFormRadio}
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
    </>
  );
};

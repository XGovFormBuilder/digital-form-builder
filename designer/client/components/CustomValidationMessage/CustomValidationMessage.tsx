import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { i18n } from "../../i18n";
import { TelephoneNumberFieldComponent } from "@xgovformbuilder/model";

export function CustomValidationMessage() {
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent as TelephoneNumberFieldComponent;

  return (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-label--s"
        htmlFor="field-options-custom-validation-message"
      >
        {i18n("common.customValidation.title")}
      </label>
      <span className="govuk-hint">
        {i18n("common.customValidation.helpText")}
      </span>
      <input
        className="govuk-input"
        id="field-options-custom-validation-message"
        name="options.customValidation"
        type="text"
        value={options?.customValidation ?? ""}
        onChange={(e) =>
          dispatch({
            type: Actions.EDIT_OPTIONS_CUSTOM_MESSAGE,
            payload: e.target.value,
          })
        }
      />
    </div>
  );
}

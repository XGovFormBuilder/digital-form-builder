import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { i18n } from "../../i18n";

export function Autocomplete() {
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

  return (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-label--s"
        htmlFor="field-options-autocomplete"
      >
        {i18n("common.autocomplete.title")}
      </label>
      <span className="govuk-hint">{i18n("common.autocomplete.helpText")}</span>
      <input
        className="govuk-input"
        id="field-options-autocomplete"
        name="options.autocomplete"
        type="text"
        value={options.autocomplete || ""}
        onChange={(e) =>
          dispatch({
            type: Actions.EDIT_OPTIONS_AUTOCOMPLETE,
            payload: e.target.value,
          })
        }
      />
    </div>
  );
}

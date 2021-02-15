import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { i18n } from "../../i18n";

export function CssClasses() {
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

  return (
    <div className="govuk-form-group">
      <label
        className="govuk-label govuk-label--s"
        htmlFor="field-options-classes"
      >
        {i18n("common.classes.title")}
      </label>
      <span className="govuk-hint">{i18n("common.classes.helpText")}</span>
      <input
        className="govuk-input"
        id="field-options-classes"
        name="options.classes"
        type="text"
        value={options.classes || ""}
        onChange={(e) =>
          dispatch({
            type: Actions.EDIT_OPTIONS_CLASSES,
            payload: e.target.value,
          })
        }
      />
    </div>
  );
}

import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";

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
        Classes
      </label>
      <span className="govuk-hint">
        Additional CSS classes to add to the field
        <br />
        E.g. govuk-input--width-2 (or 3, 4, 5, 10, 20) or govuk-!-width-one-half
        (two-thirds, three-quarters etc.)
      </span>
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

import React, { useContext } from "react";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";

import { TextFieldEdit } from "./component-editors/text-field-edit";

export function MultilineTextFieldEdit({ context }) {
  const [{ selectedComponent }, dispatch] = useContext(
    !!context ? context : ComponentContext
  );
  const { schema = {}, options = {} } = selectedComponent;
  return (
    <TextFieldEdit>
      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-options-rows"
        >
          Rows
        </label>
        <input
          className="govuk-input govuk-input--width-3"
          id="field-options-rows"
          name="options.rows"
          type="text"
          data-cast="number"
          value={options?.rows}
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_SCHEMA_ROWS,
              payload: e.target.value,
            })
          }
        />
      </div>
    </TextFieldEdit>
  );
}

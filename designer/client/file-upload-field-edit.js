import React, { useContext } from "react";
import {
  ComponentActions,
  ComponentContext,
} from "./reducers/componentReducer";
import { Classes } from "./classes";

export function FileUploadFieldEdit({ context }) {
  const [{ selectedComponent }] = useContext(
    !!context ? context : ComponentContext
  );
  const { options } = selectedComponent;

  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">more</span>
      </summary>

      <div className="govuk-checkboxes govuk-form-group">
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id="field-options.multiple"
            name="options.multiple"
            type="checkbox"
            checked={options.multiple === false}
            onChange={(e) =>
              dispatch({
                type: ComponentActions.EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE,
                payload: !options.multiple,
              })
            }
          />
          <label
            className="govuk-label govuk-checkboxes__label"
            htmlFor="field-options.multiple"
          >
            Allow multiple files to be selected
          </label>
        </div>
      </div>

      <Classes context={context} />
    </details>
  );
}

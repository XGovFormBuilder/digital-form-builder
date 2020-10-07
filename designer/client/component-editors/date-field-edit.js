import React, { useContext } from "react";
import {
  ComponentActions,
  ComponentContext,
} from "./../reducers/componentReducer";
import { Classes } from "./../classes";

export function DateFieldEdit({ context }) {
  const [{ selectedComponent }, dispatch] = useContext(
    !!context ? context : ComponentContext
  );
  const { options } = selectedComponent;

  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">more</span>
      </summary>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-options-maxDaysInPast"
        >
          Maximum days in the past
        </label>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-options-maxDaysInPast"
          name="options.maxDaysInPast"
          value={options.maxDaysInPast}
          type="number"
          onChange={(e) =>
            dispatch({
              type: ComponentActions.EDIT_OPTIONS_MAX_DAYS_IN_PAST,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-options-maxDaysInFuture"
        >
          Maximum days in the future
        </label>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-options-maxDaysInFuture"
          name="options.maxDaysInFuture"
          value={options.maxDaysInFuture}
          type="number"
          onChange={(e) =>
            dispatch({
              type: ComponentActions.EDIT_OPTIONS_MAX_DAYS_IN_FUTURE,
              payload: e.target.value,
            })
          }
        />
      </div>

      <Classes context={context} />
    </details>
  );
}

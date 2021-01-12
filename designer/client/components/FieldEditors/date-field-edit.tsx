import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { CssClasses } from "../CssClasses";

type Props = {
  context: any; // TODO
};

export function DateFieldEdit({ context = ComponentContext }: Props) {
  // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
  // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

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
              type: Actions.EDIT_OPTIONS_MAX_DAYS_IN_PAST,
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
              type: Actions.EDIT_OPTIONS_MAX_DAYS_IN_FUTURE,
              payload: e.target.value,
            })
          }
        />
      </div>

      <CssClasses />
    </details>
  );
}

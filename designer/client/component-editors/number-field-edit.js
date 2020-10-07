import React, { useContext } from "react";
import {
  ComponentActions,
  ComponentContext,
} from "./../reducers/componentReducer";
import { Classes } from "./../classes";

export function NumberFieldEdit({ context }) {
  const [{ selectedComponent }, dispatch] = useContext(
    !!context ? context : ComponentContext
  );
  const { schema = {} } = selectedComponent;

  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">more</span>
      </summary>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-min"
        >
          Min
        </label>
        <span className="govuk-hint">Specifies the minimum value</span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-min"
          name="schema.min"
          value={schema.min}
          type="number"
          onChange={(e) =>
            dispatch({
              type: ComponentActions.EDIT_SCHEMA_MIN,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-max"
        >
          Max
        </label>
        <span className="govuk-hint">Specifies the maximum value</span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-max"
          name="schema.max"
          value={schema.max}
          type="number"
          onBlur={(e) =>
            dispatch({
              type: ComponentActions.EDIT_SCHEMA_MAX,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-precision"
        >
          Precision
        </label>
        <span className="govuk-hint">
          How many decimal places can users enter?
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-precision"
          name="schema.precision"
          value={schema.precision || 0}
          type="number"
          onBlur={(e) =>
            dispatch({
              type: ComponentActions.EDIT_SCHEMA_PRECISION,
              payload: e.target.value,
            })
          }
        />
      </div>

      <Classes context={context} />
    </details>
  );
}

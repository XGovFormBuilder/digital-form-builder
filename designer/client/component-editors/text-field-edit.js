import React, { useContext } from "react";
import {
  ComponentActions,
  ComponentContext,
} from "./../reducers/componentReducer";
import { Classes } from "./../classes";

export function TextFieldEdit({ children, context }) {
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
          htmlFor="field-schema-max"
        >
          Max length
        </label>
        <span className="govuk-hint">
          Specifies the maximum number of characters
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-max"
          name="schema.max"
          value={schema.max}
          type="number"
          onChange={(e) =>
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
          htmlFor="field-schema-min"
        >
          Min length
        </label>
        <span className="govuk-hint">
          Specifies the minimum number of characters
        </span>
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
          htmlFor="field-schema-length"
        >
          Length
        </label>
        <span className="govuk-hint">Specifies the exact text length</span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-length"
          name="schema.length"
          value={schema.length}
          type="number"
          onChange={(e) =>
            dispatch({
              type: ComponentActions.EDIT_SCHEMA_LENGTH,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-regex"
        >
          Regex
        </label>
        <span className="govuk-hint">
          Specifies a regex against which input will be validated
        </span>
        <input
          className="govuk-input"
          id="field-schema-regex"
          name="schema.regex"
          value={schema.regex}
          onChange={(e) =>
            dispatch({
              type: ComponentActions.EDIT_SCHEMA_REGEX,
              payload: e.target.value,
            })
          }
        />
      </div>

      {children}

      <Classes context={context} />
    </details>
  );
}

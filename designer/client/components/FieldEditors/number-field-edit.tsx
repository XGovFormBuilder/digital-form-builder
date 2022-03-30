import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";

import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";

type Props = {
  context: any; // TODO
};

export function NumberFieldEdit({ context = ComponentContext }: Props) {
  // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
  // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { schema = {} } = selectedComponent;

  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          {i18n("common.detailsLink.title")}
        </span>
      </summary>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-min"
        >
          {i18n("numberFieldEditComponent.minField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("numberFieldEditComponent.minField.helpText")}
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
              type: Actions.EDIT_SCHEMA_MIN,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-prefix"
        >
          {i18n("numberFieldEditComponent.prefixField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("numberFieldEditComponent.prefixField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="strubg"
          id="field-schema-prefix"
          name="schema.prefix"
          value={schema.prefix}
          type="string"
          onBlur={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_PREFIX,
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
          {i18n("numberFieldEditComponent.maxField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("numberFieldEditComponent.maxField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-max"
          name="schema.max"
          value={schema.max}
          type="number"
          onBlur={(e) =>
            dispatch({
              type: Actions.EDIT_SCHEMA_MAX,
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
          {i18n("numberFieldEditComponent.precisionField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("numberFieldEditComponent.precisionField.helpText")}
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
              type: Actions.EDIT_SCHEMA_PRECISION,
              payload: e.target.value,
            })
          }
        />
      </div>

      <CssClasses />
    </details>
  );
}

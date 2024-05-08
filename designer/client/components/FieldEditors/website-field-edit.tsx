import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";

import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";

type Props = {
  context: any; // TODO
};

export function WebsiteFieldEdit({ context = ComponentContext }: Props) {
  // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
  // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

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
          htmlFor="field-options-prefix"
        >
          {i18n("websiteFieldEditComponent.prefixField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("websiteFieldEditComponent.prefixField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="string"
          id="field-options-prefix"
          name="opions.prefix"
          value={options.prefix}
          type="string"
          onBlur={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_PREFIX,
              payload: e.target.value,
            })
          }
        />
      </div>

      <CssClasses />
    </details>
  );
}

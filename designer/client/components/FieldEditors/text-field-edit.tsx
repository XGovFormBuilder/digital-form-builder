import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
import { CssClasses } from "../CssClasses";
import { i18n } from "../../i18n";
import { Autocomplete } from "../Autocomplete";
import { CustomValidationMessage } from "../CustomValidationMessage";

type Props = {
  context: any; // TODO
  children: React.ReactNode;
};

export function TextFieldEdit({ children, context = ComponentContext }: Props) {
  // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
  // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { schema = {}, options = {} } = selectedComponent;

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
          {i18n("textFieldEditComponent.minLengthField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("textFieldEditComponent.minLengthField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-min"
          name="schema.min"
          value={schema.min || ""}
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
          htmlFor="field-schema-max"
        >
          {i18n("textFieldEditComponent.maxLengthField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("textFieldEditComponent.maxLengthField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-max"
          name="schema.max"
          value={schema.max || ""}
          type="number"
          onChange={(e) =>
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
          htmlFor="field-schema-maxwords"
        >
          {i18n("textFieldEditComponent.maxWordField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("textFieldEditComponent.maxWordField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-maxwords"
          name="schema.maxwords"
          value={options.maxWords || ""}
          type="number"
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_MAX_WORDS,
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
          {i18n("textFieldEditComponent.lengthField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("textFieldEditComponent.lengthField.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-length"
          name="schema.length"
          value={schema.length || ""}
          type="number"
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_SCHEMA_LENGTH,
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
          {i18n("textFieldEditComponent.regexField.title")}
        </label>
        <span className="govuk-hint">
          {i18n("textFieldEditComponent.regexField.helpText")}
        </span>
        <input
          className="govuk-input"
          id="field-schema-regex"
          name="schema.regex"
          value={schema.regex || ""}
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_SCHEMA_REGEX,
              payload: e.target.value,
            })
          }
        />
      </div>

      {children}

      <Autocomplete />

      <CssClasses />

      {selectedComponent.type === "TelephoneNumberField" && (
        // Remove type check when fully integrated into all runner components
        <CustomValidationMessage />
      )}
    </details>
  );
}

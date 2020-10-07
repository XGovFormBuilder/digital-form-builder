import React, { useContext } from "react";
import {
  ComponentActions,
  ComponentContext,
} from "./../reducers/componentReducer";
import { DataContext } from "./../context";
import Editor from "./../editor";

export function ParaEdit({ context }) {
  const [{ selectedComponent }, dispatch] = useContext(
    !!context ? context : ComponentContext
  );
  const { data } = useContext(DataContext);
  const { options } = selectedComponent;
  const { conditions } = data;

  return (
    <div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="para-content">
          Content
        </label>
        <span className="govuk-hint">
          The content can include HTML and the `govuk-prose-scope` css class is
          available. Use this on a wrapping element to apply default govuk
          styles.
        </span>
        <Editor
          name="content"
          value={selectedComponent.content}
          valueCallback={(content) => {
            dispatch({
              type: ComponentActions.EDIT_CONTENT,
              payload: content,
            });
          }}
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="condition">
          Condition (optional)
        </label>
        <span className="govuk-hint">
          Only show this content if the condition is truthy.{" "}
        </span>
        <select
          className="govuk-select"
          id="condition"
          name="options.condition"
          value={options.conditions}
          onChange={(e) =>
            dispatch({
              type: ComponentActions.EDIT_OPTIONS_CONDITION,
              payload: e.target.value,
            })
          }
        >
          <option value="" />
          {conditions.map((condition) => (
            <option key={condition.name} value={condition.name}>
              {condition.displayName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";

type Props = {
  context: any; // TODO
};

export function ListContentEdit({ context = ComponentContext }: Props) {
  // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
  // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;

  return (
    <div>
      <div className="govuk-checkboxes govuk-form-group">
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id="field-options-type"
            name="options.type"
            value="numbered"
            type="checkbox"
            checked={options.type === "numbered"}
            onChange={() =>
              dispatch({
                type: Actions.EDIT_OPTIONS_TYPE,
                payload: options.type === "numbered" ? undefined : "numbered",
              })
            }
          />
          <label
            className="govuk-label govuk-checkboxes__label"
            htmlFor="field-options-type"
          >
            Numbered
          </label>
        </div>
      </div>
    </div>
  );
}

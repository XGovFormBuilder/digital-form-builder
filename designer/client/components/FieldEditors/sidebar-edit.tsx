import React, { useContext } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { DataContext } from "../../context";
import Editor from "../../editor";
import { Actions } from "../../reducers/component/types";
import { ContentOptions } from "@xgovformbuilder/model";
import { i18n } from "../../i18n";
import { Actions as ComponentActions } from "./../../reducers/component/types";

type Props = {
  context: any; // TODO
};

export function SidebarEdit({ context = ComponentContext }: Props) {
  // If you are editing a component, the default context will be ComponentContext because props.context is undefined,
  // but if you editing a component which is a children of a list based component, then the props.context is the ListContext.
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { data } = useContext(DataContext);
  const { options = {} }: { options: ContentOptions } = selectedComponent;
  const { conditions } = data;

  const alignOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    options.align = e.target.value;
    dispatch({
      type: ComponentActions.EDIT_OPTIONS_ALIGN,
      payload: e.target.value,
    });
  };

  return (
    <div>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="para-content">
          Content
        </label>
        <span className="govuk-hint">{i18n("fieldEdit.para.hint")}</span>
        <Editor
          id="field-content"
          name="content"
          value={selectedComponent.content}
          valueCallback={(content) => {
            dispatch({
              type: Actions.EDIT_CONTENT,
              payload: content,
            });
          }}
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="sidebaralign">
          Select Alignment
        </label>
        <span className="govuk-hint">{i18n("sidebar.align.hint")} </span>
        <select
          className="govuk-select"
          id="align"
          name="options.align"
          value={options.align}
          onChange={(e) => alignOnChange(e)}
        >
          <option value="left">Left</option> {" "}
          <option value="right">Right</option>
        </select>

        <label className="govuk-label govuk-label--s" htmlFor="condition">
          Condition (optional)
        </label>
        <span className="govuk-hint">{i18n("fieldEdit.conditions.hint")} </span>
        <select
          className="govuk-select"
          id="condition"
          name="options.condition"
          value={options.condition}
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_CONDITION,
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

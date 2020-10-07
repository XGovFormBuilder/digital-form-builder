import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import ComponentTypeEdit from "./component-type-edit";
import { clone, ComponentTypes } from "@xgovformbuilder/model";
import { DataContext } from "./context";
import { nanoid } from "nanoid";
import { ListContext } from "./reducers/listReducer";
import {
  ComponentActions,
  ComponentContext,
} from "./reducers/componentReducer";

function ComponentCreate(props) {
  useEffect(() => {
    dispatch({ type: ComponentActions.SET_PAGE, payload: page.path });
  }, []);

  const { data, save } = useContext(DataContext);
  const [state, dispatch] = useContext(ComponentContext);
  const { selectedComponent } = state;
  const { page, toggleAddComponent } = props;

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { isNew, ...selectedComponent } = state.selectedComponent;
    data.addComponent(page.path, { ...selectedComponent });
    await save(data.toJSON());
    toggleAddComponent();
  };

  const handleTypeChange = (e) => {
    dispatch({ type: ComponentActions.EDIT_TYPE, payload: e.target.value });
  };
  const { type } = selectedComponent;

  return (
    <form onSubmit={handleSubmit}>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="type">
          Type
        </label>
        <select
          className="govuk-select"
          id="type"
          name="type"
          required
          onChange={handleTypeChange}
          value={type}
        >
          <option />
          {ComponentTypes.sort((a, b) =>
            (a.title ?? "").localeCompare(b.title)
          ).map((type) => {
            return (
              <option key={type.name} value={type.name}>
                {type.title}
              </option>
            );
          })}
        </select>
      </div>
      {type && <ComponentTypeEdit />}
      <button type="submit" className="govuk-button" disabled={isSaving}>
        Save
      </button>
    </form>
  );
}

export default ComponentCreate;

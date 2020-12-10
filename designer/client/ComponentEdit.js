import React, { memo, useContext, useLayoutEffect, useState } from "react";
import ComponentTypeEdit from "./componentTypeEdit";
import { clone } from "@xgovformbuilder/model";
import { DataContext } from "./context";
import {
  ComponentActions,
  ComponentContext,
} from "./reducers/componentReducer";
import { validateComponent } from "./reducers/componentReducer.validations";
import { hasValidationErrors } from "./validations";
import { ErrorSummary } from "./error-summary";

export function ComponentEdit(props) {
  const { data, save } = useContext(DataContext);
  const [{ selectedComponent, initialName }, dispatch] = useContext(
    props.context || ComponentContext
  );
  const [errors, setErrors] = useState({});
  const { page, toggleShowEditor } = props;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate;

    const updatedData = data.updateComponent(
      page.path,
      initialName,
      selectedComponent
    );
    await save(updatedData.toJSON());
    toggleShowEditor();
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    dispatch({ action: ComponentActions.DELETE });
  };

  return (
    <>
      {errors && <ErrorSummary errorList={Object.values(errors)} />}
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="govuk-form-group">
          <span className="govuk-label govuk-label--s" htmlFor="type">
            Type
          </span>
          <span className="govuk-body">{selectedComponent.type}</span>
        </div>
        <ComponentTypeEdit context={props.context} page={page} />
        <button className="govuk-button" type="submit">
          Save
        </button>{" "}
        <a
          href="#"
          onClick={(event) => event.preventDefault()}
          className="govuk-link"
        >
          Delete
        </a>
      </form>
    </>
  );
}

export default memo(ComponentEdit);

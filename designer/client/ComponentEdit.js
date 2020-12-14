import React, {
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import ComponentTypeEdit from "./ComponentTypeEdit";
import { DataContext } from "./context";
import {
  ComponentActions,
  ComponentContext,
} from "./reducers/componentReducer";
import ErrorSummary from "./error-summary";

export function ComponentEdit(props) {
  const { data, save } = useContext(DataContext);
  const [
    { selectedComponent, initialName, errors = {}, hasValidated },
    dispatch,
  ] = useContext(props.context || ComponentContext);
  const { page, toggleShowEditor } = props;
  const hasErrors = Object.values(errors).length > 0;

  useLayoutEffect(() => {
    if (hasValidated && !hasErrors) {
      handleSubmit();
    }
  }, [hasValidated]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!hasValidated) {
      dispatch({ type: ComponentActions.VALIDATE });
      return;
    }

    if (hasErrors) {
      return;
    }

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
    const copy = data.toJSON();
    const indexOfPage = copy.pages;
    dispatch({ action: ComponentActions.DELETE });
  };

  return (
    <>
      {hasErrors && <ErrorSummary errorList={Object.values(errors)} />}
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
        <a href="#" onClick={handleDelete} className="govuk-link">
          Delete
        </a>
      </form>
    </>
  );
}

export default memo(ComponentEdit);

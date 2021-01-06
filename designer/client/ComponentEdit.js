import React, { memo, useContext, useLayoutEffect } from "react";
import ComponentTypeEdit from "./ComponentTypeEdit";
import { DataContext } from "./context";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";
import ErrorSummary from "./error-summary";
import { hasValidationErrors } from "./validations";

export function ComponentEdit(props) {
  const { data, save } = useContext(DataContext);
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent, initialName, errors = {}, hasValidated } = state;
  const { page, toggleShowEditor } = props;
  const hasErrors = hasValidationErrors(errors);

  useLayoutEffect(() => {
    if (hasValidated && !hasErrors) {
      handleSubmit();
    }
  }, [hasValidated]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!hasValidated) {
      dispatch({ type: Actions.VALIDATE });
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
    const indexOfPage = copy.pages.findIndex((p) => p.path === page.path);
    const indexOfComponent = copy.pages[indexOfPage]?.components.findIndex(
      (component) => component.name === selectedComponent.initialName
    );
    copy.pages[indexOfPage].components.splice(indexOfComponent, 1);
    await save(copy);
    toggleShowEditor();
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
        <ComponentTypeEdit page={page} />
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

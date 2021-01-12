import React, { useEffect, useContext, useState, useLayoutEffect } from "react";
import { ComponentDef } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";
import { ErrorSummary } from "../../error-summary";
import { hasValidationErrors } from "../../validations";
import ComponentTypeEdit from "../../ComponentTypeEdit";
import { ComponentCreateList } from "./ComponentCreateList";
import { BackLink } from "../BackLink";
import "./ComponentCreate.scss";
import { Actions } from "../../reducers/component/types";
import { DataContext } from "../../context";
import { ComponentContext } from "../../reducers/component/componentReducer";

function useComponentCreate(props) {
  const { data, save } = useContext(DataContext);
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent, errors = {}, hasValidated } = state;
  const { page, toggleAddComponent = () => {} } = props;

  const [isSaving, setIsSaving] = useState(false);
  const hasErrors = hasValidationErrors(errors);

  useEffect(() => {
    dispatch({ type: Actions.SET_PAGE, payload: page.path });
  }, [page.path]);

  useLayoutEffect(() => {
    if (hasValidated && !hasErrors) {
      handleSubmit()
        .then()
        .catch((err) => {
          console.error(err);
        });
    }
  }, [hasValidated, hasErrors]);

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault();

    if (!hasValidated) {
      dispatch({ type: Actions.VALIDATE });
      return;
    }

    if (hasErrors) {
      return;
    }

    setIsSaving(true);
    const { isNew, ...selectedComponent } = state.selectedComponent;
    data.addComponent(page.path, { ...selectedComponent });
    await save(data.toJSON());
    toggleAddComponent();
  };

  const handleTypeChange = (component: ComponentDef) => {
    dispatch({ type: Actions.EDIT_TYPE, payload: component.type });
  };

  const reset = (e) => {
    e.preventDefault();
    dispatch({ type: Actions.SET_COMPONENT });
  };

  return {
    handleSubmit,
    handleTypeChange,
    hasErrors,
    errors: Object.values(errors),
    component: selectedComponent,
    isSaving,
    reset,
  };
}

export function ComponentCreate(props) {
  const {
    handleSubmit,
    handleTypeChange,
    reset,
    hasErrors,
    errors,
    component,
    isSaving,
  } = useComponentCreate(props);
  const type = component?.type;

  return (
    <div className="component-create">
      {hasErrors && <ErrorSummary errorList={errors} />}
      {!type && <h4 className="govuk-heading-m">{i18n("Create component")}</h4>}
      {type && (
        <>
          <BackLink onClick={reset}>
            {i18n("Back to create component list")}
          </BackLink>
          <h4 className="govuk-heading-m">
            {component?.["title"]} {i18n("component")}
          </h4>
        </>
      )}
      <form onSubmit={handleSubmit}>
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="type">
            Type
          </label>
          {!type && (
            <ComponentCreateList onSelectComponent={handleTypeChange} />
          )}
        </div>
        {type && <ComponentTypeEdit />}
        <button type="submit" className="govuk-button" disabled={isSaving}>
          Save
        </button>
      </form>
    </div>
  );
}

export default ComponentCreate;

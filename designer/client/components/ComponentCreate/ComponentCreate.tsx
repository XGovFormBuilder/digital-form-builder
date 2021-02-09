import React, {
  useEffect,
  useContext,
  useState,
  useLayoutEffect,
  FormEvent,
} from "react";
import { ComponentDef } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";
import { ErrorSummary } from "../../error-summary";
import { hasValidationErrors } from "../../validations";
import ComponentTypeEdit from "../../ComponentTypeEdit";
import { ComponentCreateList } from "./ComponentCreateList";
import { BackLink } from "../BackLink";

import { Actions } from "../../reducers/component/types";
import { DataContext } from "../../context";
import { ComponentContext } from "../../reducers/component/componentReducer";

import "./ComponentCreate.scss";

function useComponentCreate(props) {
  const [renderTypeEdit, setRenderTypeEdit] = useState<boolean>(false);
  const { data, save } = useContext(DataContext);
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent, errors = {}, hasValidated } = state;
  const { page, toggleAddComponent = () => {} } = props;

  const [isSaving, setIsSaving] = useState(false);
  const hasErrors = hasValidationErrors(errors);

  useEffect(() => {
    // render in the next re-paint to allow the DOM to reflow without the list
    // thus resetting the Flyout wrapper scrolling position
    // This is a quick work around the bug in small screens
    // where once user scrolls down the components list and selects one of the bottom components
    // then the component edit screen renders already scrolled to the bottom
    let isMounted = true;

    if (selectedComponent?.type) {
      window.requestAnimationFrame(() => {
        if (isMounted) setRenderTypeEdit(true);
      });
    } else {
      setRenderTypeEdit(false);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedComponent?.type]);

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

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
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
    dispatch({
      type: Actions.EDIT_TYPE,
      payload: {
        type: component.type,
      },
    });
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
    renderTypeEdit,
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
    renderTypeEdit,
  } = useComponentCreate(props);

  const type = component?.type;

  return (
    <div className="component-create">
      {!type && <h4 className="govuk-heading-m">{i18n("component.create")}</h4>}
      {type && (
        <>
          <BackLink onClick={reset}>
            {i18n("Back to create component list")}
          </BackLink>
          <h4 className="govuk-heading-m">
            {i18n(`fieldTypeToName.${component?.["type"]}`)}{" "}
            {i18n("component.component")}
          </h4>
        </>
      )}
      {hasErrors && <ErrorSummary errorList={errors} />}
      {!type && <ComponentCreateList onSelectComponent={handleTypeChange} />}
      {type && renderTypeEdit && (
        <form onSubmit={handleSubmit}>
          {type && <ComponentTypeEdit />}
          <button type="submit" className="govuk-button" disabled={isSaving}>
            Save
          </button>
        </form>
      )}
    </div>
  );
}

export default ComponentCreate;

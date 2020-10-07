import React, { memo, useContext } from "react";
import ComponentTypeEdit from "./component-type-edit";
import { clone } from "@xgovformbuilder/model";
<<<<<<< HEAD
import { hasValidationErrors } from "./validations";
import { ErrorSummary } from "./error-summary";

class ComponentEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      component: props.component,
      errors: {},
    };
    this.typeEditRef = React.createRef();
  }

  async onSubmit(e) {
    e.preventDefault();
    let validationErrors = this.validate();
    if (hasValidationErrors(validationErrors)) return;

    const { data, page, component } = this.props;
    const copy = clone(data);
    const updatedComponent = this.state.component;

    const updatedData = copy.updateComponent(
=======
import { DataContext } from "./context";
import {
  ComponentActions,
  ComponentContext,
} from "./reducers/componentReducer";

export function ComponentEdit(props) {
  const { data, save } = useContext(DataContext);
  const [{ selectedComponent, initialName }, dispatch] = useContext(
    props.context || ComponentContext
  );
  const { page, toggleShowEditor } = props;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = data.updateComponent(
>>>>>>> rename files (+1 squashed commit)
      page.path,
      initialName,
      selectedComponent
    );
    await save(updatedData.toJSON());
    toggleShowEditor();
  };

<<<<<<< HEAD
  validate = () => {
    if (this.typeEditRef.current) {
      const errors = this.typeEditRef.current.validate();
      this.setState({ errors });
      return errors;
    }
    return {};
  };

  onClickDelete = (e) => {
=======
  const handleDelete = async (e) => {
>>>>>>> rename files (+1 squashed commit)
    e.preventDefault();

    dispatch({ action: ComponentActions.DELETE });
  };

<<<<<<< HEAD
  render() {
    const { page, data } = this.props;
    const { component, errors } = this.state;

    const copyComp = JSON.parse(JSON.stringify(component));

    return (
      <div>
        {hasValidationErrors(errors) && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form autoComplete="off" onSubmit={(e) => this.onSubmit(e)}>
          <div className="govuk-form-group">
            <span className="govuk-label govuk-label--s" htmlFor="type">
              Type
            </span>
            <span className="govuk-body">{component.type}</span>
          </div>
          <ComponentTypeEdit
            page={page}
            component={copyComp}
            data={data}
            updateModel={this.storeComponent}
            ref={this.typeEditRef}
          />
          <button className="govuk-button" type="submit">
            Save
          </button>{" "}
          <button
            className="govuk-button"
            type="button"
            onClick={this.onClickDelete}
          >
            Delete
          </button>
        </form>
=======
  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <div className="govuk-form-group">
        <span className="govuk-label govuk-label--s" htmlFor="type">
          Type
        </span>
        <span className="govuk-body">{selectedComponent.type}</span>
>>>>>>> rename files (+1 squashed commit)
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
  );
}

export default memo(ComponentEdit);

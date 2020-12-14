import React from "react";
import ComponentTypeEdit from "./component-type-edit";
import { clone, ComponentTypes } from "@xgovformbuilder/model";
import { hasValidationErrors } from "./validations";
import ErrorSummary from "../error-summary";
class ComponentCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSaving: false,
      errors: {},
    };
    this.typeEditRef = React.createRef();
  }

  async componentDidMount() {
    const { data } = this.props;
    const id = await data.getId();
    this.setState({ id });
  }

  async onSubmit(e) {
    e.preventDefault();

    if (this.state.isSaving) {
      return;
    }

    let validationErrors = this.validate();
    if (hasValidationErrors(validationErrors)) return false;

    this.setState({ isSaving: true });

    const { page, data } = this.props;
    const { component } = this.state;
    const copy = clone(data);

    const updated = copy.addComponent(page.path, component);

    const saved = await data.save(updated);
    this.props.onCreate({ data: saved });
  }

  validate = () => {
    if (this.typeEditRef.current) {
      const errors = this.typeEditRef.current.validate();
      this.setState({ errors });
      return errors;
    }
    return {};
  };

  storeComponent = (component) => {
    this.setState({ component });
  };

  onChangeComponentType = (e) => {
    this.setState({
      component: { type: e.target.value, name: this.state.id },
      errors: {},
    });
  };

  render() {
    const { page, data } = this.props;
    const { id, isSaving, errors } = this.state;

    return (
      <div>
        {hasValidationErrors(errors) && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="type">
              Type
            </label>
            <select
              className="govuk-select"
              id="type"
              name="type"
              required
              onChange={this.onChangeComponentType}
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

          {this.state?.component?.type && (
            <div>
              <ComponentTypeEdit
                page={page}
                data={data}
                component={this.state.component}
                updateModel={this.storeComponent}
                ref={this.typeEditRef}
              />
              <button
                type="submit"
                className="govuk-button"
                disabled={isSaving}
              >
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default ComponentCreate;

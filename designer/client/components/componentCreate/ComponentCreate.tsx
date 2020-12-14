import React, { Component, ChangeEvent } from "react";
import { clone } from "@xgovformbuilder/model";

import { ErrorSummary } from "../../error-summary";
import { hasValidationErrors } from "../../validations";
import ComponentTypeEdit from "../../component-type-edit";
import { ComponentCreateList } from "./ComponentCreateList";

type Props = {
  data: any;
};

type State = {
  isSaving: boolean;
  errors: {};
};

class ComponentCreate extends Component<Props, State> {
  typeEditRef = React.createRef();

  state = {
    isSaving: false,
    errors: {},
  };

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

  onChangeComponentType = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      component: { type: event.target.value, name: this.state.id },
      errors: {},
    });
  };

  render() {
    const { page, data } = this.props;
    const { id, isSaving, errors } = this.state;
    <ComponentCreateList onChangeComponentType={this.onChangeComponentType} />;
    return (
      <div>
        {hasValidationErrors(errors) && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
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

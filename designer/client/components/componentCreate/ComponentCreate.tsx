import React, { Component, ChangeEvent } from "react";
import { clone } from "@xgovformbuilder/model";

import { withI18n, I18n } from "../../i18n";
import { ErrorSummary } from "../../error-summary";
import { hasValidationErrors } from "../../validations";
import ComponentTypeEdit from "../../component-type-edit";
import ComponentCreateList from "./ComponentCreateList";

import "./ComponentCreate.scss";

type Props = {
  data: any;
  onCreate: any;
  page: any;
  i18n: I18n;
};

type State = {
  id: string;
  isSaving: boolean;
  component?: { type: string; name: string };
  errors: any;
};

export class ComponentCreate extends Component<Props, State> {
  typeEditRef = React.createRef<ComponentTypeEdit>();

  state = {
    id: "",
    errors: {},
    component: undefined,
    isSaving: false,
  };

  async componentDidMount() {
    const { data } = this.props;
    const id = await data.getId();
    this.setState({ id });
  }

  async onSubmit(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!this.state.isSaving) {
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

    return true;
  }

  validate = () => {
    if (this.typeEditRef.current) {
      const errors = this.typeEditRef.current.validate();
      this.setState({ errors });
      return errors;
    }

    return {};
  };

  storeComponent = (component: State["component"]) => {
    this.setState({ component });
  };

  onSelectComponent = (type: string) => {
    this.setState({
      component: { type, name: `${this.state.id}` },
      errors: {},
    });
  };

  render() {
    const { page, data, i18n } = this.props;
    const { component, isSaving, errors } = this.state;

    return (
      <div className="component-create">
        {hasValidationErrors(errors) && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}

        <form onSubmit={this.onSubmit} autoComplete="off">
          <ComponentCreateList onSelectComponent={this.onSelectComponent} />
          {component && (
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
                {i18n("Save")}
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default withI18n(ComponentCreate);

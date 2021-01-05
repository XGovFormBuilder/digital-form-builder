import React, { Component, ChangeEvent, MouseEvent } from "react";
import { clone, ComponentDef } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";
import { ErrorSummary } from "../../error-summary";
import { hasValidationErrors } from "../../validations";
import ComponentTypeEdit from "../../component-type-edit";
import { ComponentCreateList } from "./ComponentCreateList";
import { BackLink } from "../backLink";

import "./ComponentCreate.scss";

type Props = {
  data: any;
  onCreate: any;
  page: any;
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

  componentDidMount = async () => {
    const { data } = this.props;
    const id = await data.getId();
    this.setState({ id });
  };

  onSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (this.state.isSaving) return false;

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
  };

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

  onSelectComponent = (component: ComponentDef) => {
    this.setState({
      component: {
        ...component,
        name: `${this.state.id}`,
      },
      errors: {},
    });
  };

  reset = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    this.setState({
      errors: {},
      component: undefined,
      isSaving: false,
    });
  };

  render() {
    const { page, data } = this.props;
    const { component, isSaving, errors } = this.state;

    return (
      <div className="component-create">
        {!component && (
          <h4 className="govuk-heading-m">{i18n("Create component")}</h4>
        )}
        {component && (
          <>
            <BackLink onClick={this.reset}>
              {i18n("Back to create component list")}
            </BackLink>
            <h4 className="govuk-heading-m">
              {component?.["title"]} {i18n("component")}
            </h4>
          </>
        )}
        {hasValidationErrors(errors) && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={this.onSubmit} autoComplete="off">
          {!component && (
            <ComponentCreateList onSelectComponent={this.onSelectComponent} />
          )}
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

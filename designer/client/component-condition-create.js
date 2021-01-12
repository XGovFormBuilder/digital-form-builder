import React from "react";
import ComponentTypeEdit from "./component-type-edit";
import { ConditionalComponentTypes } from "@xgovformbuilder/model";

class ComponentConditionCreate extends React.Component {
  constructor(props) {
    super(props);

    const { conditional } = this.props;
    const { components } = conditional || {};

    this.state = {
      component: components && components.length ? components[0] : null,
    };
  }

  render() {
    const { component } = this.state;
    const { idHelper } = this.props;
    const selectedType = component ? component.type : "";

    return (
      <div>
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="type">
            Type
          </label>
          <select
            className="govuk-select"
            id={`${idHelper || ""}'type`}
            name="cond-type"
            defaultValue={selectedType}
            onChange={(e) =>
              this.setState({ component: { type: e.target.value } })
            }
          >
            <option />
            {ConditionalComponentTypes.map((type) => {
              return (
                <option key={type.name} value={type.name}>
                  {type.title}
                </option>
              );
            })}
          </select>
        </div>
        {selectedType && (
          <div>
            <ComponentTypeEdit
              component={this.state.component}
              updateModel={(component) => this.setState({ component })}
            />
          </div>
        )}
      </div>
    );
  }
}

export default ComponentConditionCreate;

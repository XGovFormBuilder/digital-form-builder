import React, { useState } from "react";
import ComponentTypeEdit from "./component-type-edit";
import { ConditionalComponentTypes } from "@xgovformbuilder/model";

const ComponentConditionCreate = (props) => {
  const { conditional, idHelper } = props;
  const { components } = conditional || {};

  const [component, setComponent] = useState(
    components && components.length ? components[0] : null
  );
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
            setComponent({ component: { type: e.target.value } })
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
            component={component}
            updateModel={(component) => setComponent(component)}
          />
        </div>
      )}
    </div>
  );
};

export default ComponentConditionCreate;
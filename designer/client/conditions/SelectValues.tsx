import React from "react";
import { ConditionValue } from "@xgovformbuilder/model";

export const SelectValues = (props) => {
  const { fieldDef, updateValue, value } = props;

  const onChangeSelect = (e) => {
    const input = e.target;
    const newValue = input.value;

    let value;
    if (newValue && newValue?.trim() !== "") {
      const option = fieldDef.values?.find(
        (value) => String(value.value) === newValue
      );
      value = new ConditionValue(String(option.value), option.label);
    }
    updateValue(value);
  };

  return (
    <select
      className="govuk-select"
      id="cond-value"
      name="cond-value"
      value={value?.value ?? ""}
      onChange={onChangeSelect}
      data-testid={"cond-value"}
    >
      <option />
      {fieldDef.values.map((option) => {
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};

import React from "react";
import {
  timeUnits,
  absoluteDateOrTimeOperatorNames,
  getOperatorConfig,
  relativeDateOrTimeOperatorNames,
  ConditionValue,
} from "@xgovformbuilder/model";
import RelativeTimeValues from "./inline-conditions-relative-dates";
import { AbsoluteDateValues } from "./AbsoluteDateValues";
import { AbsoluteDateTimeValues } from "./AbsoluteDateTimeValues";
import { AbsoluteTimeValues } from "./AbsoluteTimeValues";
import { TextValues } from "./TextValues";
import { SelectValues } from "./SelectValues";
import { tryParseInt } from "./inline-condition-helpers";

function DateTimeComponent(fieldType, operator) {
  const operatorConfig = getOperatorConfig(fieldType, operator);
  const absoluteDateTimeRenderFunctions = {
    DateField: AbsoluteDateValues,
    DatePartsField: AbsoluteDateValues,
    DateTimeField: AbsoluteDateTimeValues,
    DateTimePartsField: AbsoluteDateTimeValues,
    TimeField: AbsoluteTimeValues,
  };
  if (fieldType in absoluteDateTimeRenderFunctions) {
    if (absoluteDateOrTimeOperatorNames.includes(operator)) {
      //since these are all classes return a function which creates new class comp
      let CustomRendering = absoluteDateTimeRenderFunctions[fieldType];
      const pad = (num: number) => num.toString().padStart(2, "0");

      return function CustomRenderingWrapper({ value, updateValue }) {
        const transformUpdatedValue = (value) => {
          let transformed;
          switch (CustomRendering) {
            case AbsoluteDateTimeValues:
              transformed = value.toISOString();
              break;
            case AbsoluteDateValues:
              const { year, month, day } = value;
              transformed = `${pad(year)}-${pad(month)}-${pad(day)}`;
              break;
            case AbsoluteTimeValues:
              const { hour, minute } = value;
              transformed = `${pad(hour)}:${pad(minute)}`;
          }
          updateValue(new ConditionValue(transformed));
        };
        const transformInputValue = (condition?: ConditionValue) => {
          if (condition && condition.value) {
            switch (CustomRendering) {
              case AbsoluteDateTimeValues:
                // value should be an ISO format date string
                return new Date(condition.value);
              case AbsoluteDateValues:
                const [year, month, day] = condition.value.split("-");
                return {
                  year: tryParseInt(year),
                  month: tryParseInt(month),
                  day: tryParseInt(day),
                };
              case AbsoluteTimeValues:
                const [hour, minute] = condition.value.split(":");
                return { hour: tryParseInt(hour), minute: tryParseInt(minute) };
            }
          }
          return undefined;
        };
        return (
          <CustomRendering
            value={transformInputValue(value)}
            updateValue={transformUpdatedValue}
          />
        );
      };
    } else if (relativeDateOrTimeOperatorNames.includes(operator)) {
      const units = operatorConfig.units;
      return function RelativeTimeValuesWrapper({ value, updateValue }) {
        return (
          <RelativeTimeValues
            value={value}
            updateValue={updateValue}
            units={units}
            timeOnly={units === timeUnits}
          />
        );
      };
    }
  }
  return null;
}

interface FieldDef {
  label: string;
  name: string;
  type: string;
  values?: any[];
}

interface Props {
  fieldDef: FieldDef;
  operator: string;
  value?: any;
  updateValue: (any) => void;
}

export const InlineConditionsDefinitionValue = ({
  fieldDef,
  operator,
  value,
  updateValue,
}: Props) => {
  const CustomComponent = DateTimeComponent(fieldDef.type, operator);
  if (CustomComponent) {
    return <CustomComponent value={value} updateValue={updateValue} />;
  }
  return (fieldDef?.values?.length ?? 0) > 0 ? (
    <SelectValues
      fieldDef={fieldDef}
      operator={operator}
      value={value}
      updateValue={updateValue}
    />
  ) : (
    <TextValues
      fieldDef={fieldDef}
      operator={operator}
      value={value}
      updateValue={updateValue}
    />
  );
};

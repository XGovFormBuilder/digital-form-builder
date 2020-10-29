import { ComponentType, Component } from "../components";
import { AbstractConditionValue } from "./inline-condition-values";

import {
  timeUnits,
  dateUnits,
  dateTimeUnits,
  ConditionValue,
  DateDirections,
  RelativeTimeValue,
} from "./inline-condition-values";

type Operator = "==" | "!=" | ">=" | "<=" | "<" | ">";

const defaultOperators = {
  is: inline("=="),
  "is not": inline("!="),
};

function withDefaults<T>(param: T) {
  return Object.assign({}, param, defaultOperators);
}

const textBasedFieldCustomisations = {
  "is longer than": lengthIs(">"),
  "is shorter than": lengthIs("<"),
  "has length": lengthIs("=="),
};

const absoluteDateTimeOperators = {
  is: absoluteDateTime("=="),
  "is not": absoluteDateTime("!="),
  "is before": absoluteDateTime("<"),
  "is after": absoluteDateTime(">"),
};

const relativeTimeOperators = (units) => ({
  "is at least": relativeTime("<=", ">=", units),
  "is at most": relativeTime(">=", "<=", units),
  "is less than": relativeTime(">", "<", units),
  "is more than": relativeTime("<", ">", units),
});

export const customOperators = {
  CheckboxesField: {
    contains: reverseInline("in"),
    "does not contain": not(reverseInline("in")),
  },
  NumberField: withDefaults({
    "is at least": inline(">="),
    "is at most": inline("<="),
    "is less than": inline("<"),
    "is more than": inline(">"),
  }),
  DateField: Object.assign(
    {},
    absoluteDateTimeOperators,
    relativeTimeOperators(dateUnits)
  ),
  TimeField: Object.assign(
    {},
    absoluteDateTimeOperators,
    relativeTimeOperators(timeUnits)
  ),
  DatePartsField: Object.assign(
    {},
    absoluteDateTimeOperators,
    relativeTimeOperators(dateUnits)
  ),
  DateTimeField: Object.assign(
    {},
    absoluteDateTimeOperators,
    relativeTimeOperators(dateTimeUnits)
  ),
  DateTimePartsField: Object.assign(
    {},
    absoluteDateTimeOperators,
    relativeTimeOperators(dateTimeUnits)
  ),
  TextField: withDefaults(textBasedFieldCustomisations),
  MultilineTextField: withDefaults(textBasedFieldCustomisations),
  EmailAddressField: withDefaults(textBasedFieldCustomisations),
};

export function getOperatorNames(fieldType) {
  return Object.keys(getConditionals(fieldType)).sort();
}

export function getExpression(
  fieldType: ComponentType,
  fieldName: string,
  operator: string,
  value: AbstractConditionValue
) {
  return getConditionals(fieldType)[operator].expression(
    { type: fieldType, name: fieldName },
    value
  );
}

export function getOperatorConfig(fieldType: ComponentType, operator) {
  return getConditionals(fieldType)[operator];
}

function getConditionals(fieldType: ComponentType) {
  return customOperators[fieldType] || defaultOperators;
}

function inline(operator: Operator) {
  return {
    expression: (field: Component, value) =>
      `${field.name} ${operator} ${formatValue(field.type, value.value)}`,
  };
}

function lengthIs(operator: Operator) {
  return {
    expression: (field: Component, value) =>
      `length(${field.name}) ${operator} ${value.value}`,
  };
}

function reverseInline(operator: "in") {
  return {
    expression: (field: Component, value) =>
      `${formatValue(field.type, value.value)} ${operator} ${field.name}`,
  };
}

function not(operatorDefinition) {
  return {
    expression: (field: Component, value) =>
      `not (${operatorDefinition.expression(field, value)})`,
  };
}

function formatValue(fieldType: ComponentType, value) {
  if (fieldType === "NumberField" || fieldType === "YesNoField") {
    return value;
  }
  return `'${value}'`;
}

export const absoluteDateOrTimeOperatorNames = Object.keys(
  absoluteDateTimeOperators
);
export const relativeDateOrTimeOperatorNames = Object.keys(
  relativeTimeOperators(dateTimeUnits)
);

function absoluteDateTime(operator: Operator) {
  return {
    expression: (field: Component, value) => {
      if (value instanceof ConditionValue) {
        return `${field.name} ${operator} '${value.toExpression()}'`;
      }
      throw Error("only Value types are supported");
    },
  };
}

function relativeTime(pastOperator, futureOperator, units) {
  return {
    units: units,
    expression: (field: Component, value) => {
      if (value instanceof RelativeTimeValue) {
        const operator =
          value.direction === DateDirections.PAST
            ? pastOperator
            : futureOperator;
        return `${field.name} ${operator} ${value.toExpression()}`;
      }
      throw Error("time shift requires a TimeShiftValue");
    },
  };
}

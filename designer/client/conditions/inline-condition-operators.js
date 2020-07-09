import { timeShift } from './inline-condition-date-model'

const defaultOperators = {
  is: inline('=='),
  'is not': inline('!=')
}

function withDefaults (param) {
  return Object.assign(param, defaultOperators)
}

const textBasedFieldCustomisations = {
  'is longer than': lengthIs('>'),
  'is shorter than': lengthIs('<'),
  'has length': lengthIs('==')
}

const dateTimeOperators = {
  'is at least': timeShift('<=', '>='),
  'is at most': timeShift('>=', '<='),
  'is less than': timeShift('>', '<'),
  'is more than': timeShift('<', '>')
}

export const customOperators = {
  'CheckboxesField': {
    contains: reverseInline('in'),
    'does not contain': not(reverseInline('in'))
  },
  NumberField: withDefaults({
    'is at least': inline('>='),
    'is at most': inline('<='),
    'is less than': inline('<'),
    'is more than': inline('>')
  }),
  DateField: dateTimeOperators,
  TimeField: dateTimeOperators,
  DatePartsField: dateTimeOperators,
  DateTimeField: dateTimeOperators,
  DateTimePartsField: dateTimeOperators,
  TextField: withDefaults(textBasedFieldCustomisations),
  MultilineTextField: withDefaults(textBasedFieldCustomisations),
  EmailAddressField: withDefaults(textBasedFieldCustomisations)
}

export function getOperatorNames (fieldType) {
  return Object.keys(getConditionals(fieldType)).sort()
}

export function getExpression (fieldType, fieldName, operator, value) {
  return getConditionals(fieldType)[operator].expression({ type: fieldType, name: fieldName }, value)
}

function getConditionals (fieldType) {
  return customOperators[fieldType] || defaultOperators
}

function inline (operator) {
  return {
    expression: (field, value) => `${field.name} ${operator} ${formatValue(field.type, value.value)}`
  }
}

function lengthIs (operator) {
  return {
    expression: (field, value) => `length(${field.name}) ${operator} ${value.value}`
  }
}

function reverseInline (operator) {
  return {
    expression: (field, value) => `${formatValue(field.type, value.value)} ${operator} ${field.name}`
  }
}

function not (operatorDefinition) {
  return {
    expression: (field, value) => `not (${operatorDefinition.expression(field, value)})`
  }
}

function formatValue (fieldType, value) {
  if (fieldType === 'NumberField' || fieldType === 'YesNoField') {
    return value
  }
  return `'${value}'`
}

import { dateTimeUnits, dateUnits, timeUnits, relativeTime } from './inline-conditions-relative-dates'

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

const relativeTimeOperators = (units) => ({
  'is at least': relativeTime('<=', '>=', units),
  'is at most': relativeTime('>=', '<=', units),
  'is less than': relativeTime('>', '<', units),
  'is more than': relativeTime('<', '>', units)
})

const absoluteTimeOperators = {
  is: inline('==', 'e.g 13:46'),
  'is not': inline('!=', 'e.g 13:46'),
  'is before': inline('<', 'e.g 13:46'),
  'is after': inline('>', 'e.g 13:46')
}

const absoluteDateOperators = {
  is: inline('==', 'e.g 2020-02-13'),
  'is not': inline('!=', 'e.g 2020-02-13'),
  'is before': inline('<', 'e.g 2020-02-13'),
  'is after': inline('>', 'e.g 2020-02-13')
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
  DateField: Object.assign(absoluteDateOperators, relativeTimeOperators(dateUnits)),
  TimeField: Object.assign(absoluteTimeOperators, relativeTimeOperators(timeUnits)),
  DatePartsField: Object.assign(absoluteDateOperators, relativeTimeOperators(dateUnits)),
  DateTimeField: Object.assign(absoluteDateOperators, relativeTimeOperators(dateTimeUnits)),
  DateTimePartsField: Object.assign(absoluteDateOperators, relativeTimeOperators(dateTimeUnits)),
  TextField: withDefaults(textBasedFieldCustomisations),
  MultilineTextField: withDefaults(textBasedFieldCustomisations),
  EmailAddressField: withDefaults(textBasedFieldCustomisations)
}

export const relativeTimeOperatorNames = Object.keys(relativeTimeOperators)

export function getOperatorNames (fieldType) {
  return Object.keys(getConditionals(fieldType)).sort()
}

export function getExpression (fieldType, fieldName, operator, value) {
  return getConditionals(fieldType)[operator].expression({ type: fieldType, name: fieldName }, value)
}

export function getOperatorConfig (fieldType, operator) {
  return !!getConditionals(fieldType)[operator]
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

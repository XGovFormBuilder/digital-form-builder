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

export const customOperators = {
  'CheckboxesField': {
    contains: reverseInline('in'),
    'does not contain': not(reverseInline('in'))
  },
  NumberField: withDefaults({
    'is at least': inline('>='),
    'is at most': inline('<='),
    'is less than': inline('<'),
    'is greater than': inline('>')
  }),
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
    expression: (field, value) => `${field.name} ${operator} ${formatValue(field.type, value)}`
  }
}

function lengthIs (operator) {
  return {
    expression: (field, value) => `length(${field.name}) ${operator} ${value}`
  }
}

function reverseInline (operator) {
  return {
    expression: (field, value) => `${formatValue(field.type, value)} ${operator} ${field.name}`
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

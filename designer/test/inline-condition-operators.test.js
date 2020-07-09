import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'

import ComponentTypes from 'digital-form-builder-engine/src/component-types'
import { getExpression, getOperatorNames } from '../client/conditions/inline-condition-operators'
import { dateDirections, dateUnits, TimeShiftValue, timeUnits } from '../client/conditions/inline-condition-date-model'
import { Value } from '../client/conditions/inline-condition-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, describe, test } = lab

suite('Inline condition operators', () => {
  const inputFieldComponents = ComponentTypes.filter(it => it.subType === 'field')

  function dateTimeOperatorExpectations (futureUnit, pastUnit) {
    return [
      {
        testValue: new TimeShiftValue('17', futureUnit, dateDirections.FUTURE),
        operators: {
          'is at least': (field) => `${field} >= dateForComparison(17, '${futureUnit}')`,
          'is at most': (field) => `${field} <= dateForComparison(17, '${futureUnit}')`,
          'is less than': (field) => `${field} < dateForComparison(17, '${futureUnit}')`,
          'is more than': (field) => `${field} > dateForComparison(17, '${futureUnit}')`
        }
      },
      {
        testValue: new TimeShiftValue('17', pastUnit, dateDirections.PAST),
        operators: {
          'is at least': (field) => `${field} <= dateForComparison(-17, '${pastUnit}')`,
          'is at most': (field) => `${field} >= dateForComparison(-17, '${pastUnit}')`,
          'is less than': (field) => `${field} > dateForComparison(-17, '${pastUnit}')`,
          'is more than': (field) => `${field} < dateForComparison(-17, '${pastUnit}')`
        }
      }
    ]
  }

  // I expect this list to grow as time goes on.
  const componentTypesWithCustomValidators = {
    'NumberField': {
      cases: [
        {
          operators: {
            'is': (field, value) => `${field} == ${value.value}`,
            'is at least': (field, value) => `${field} >= ${value.value}`,
            'is at most': (field, value) => `${field} <= ${value.value}`,
            'is less than': (field, value) => `${field} < ${value.value}`,
            'is more than': (field, value) => `${field} > ${value.value}`,
            'is not': (field, value) => `${field} != ${value.value}`
          }
        }
      ]

    },
    'DateField': {
      cases: dateTimeOperatorExpectations(dateUnits.MONTHS.value, dateUnits.DAYS.value)
    },
    'DatePartsField': {
      cases: dateTimeOperatorExpectations(dateUnits.YEARS.value, dateUnits.DAYS.value)
    },
    'TimeField': {
      cases: dateTimeOperatorExpectations(timeUnits.HOURS.value, timeUnits.SECONDS.value)
    },
    'DateTimeField': {
      cases: dateTimeOperatorExpectations(dateUnits.YEARS.value, timeUnits.SECONDS.value)
    },
    'DateTimePartsField': {
      cases: dateTimeOperatorExpectations(dateUnits.YEARS.value, timeUnits.MINUTES.value)
    },
    // here because the formatting of value is different to the standard quoted string
    'YesNoField': {
      cases: [
        {
          operators: {
            'is': (field, value) => `${field} == ${value.value}`,
            'is not': (field, value) => `${field} != ${value.value}`
          }
        }
      ]
    },
    'CheckboxesField': {
      cases: [
        {
          operators: {
            'contains': (field, value) => `'${value.value}' in ${field}`,
            'does not contain': (field, value) => `not ('${value.value}' in ${field})`
          }
        }
      ]
    },
    'TextField': {
      cases: [
        {
          operators: {
            'has length': (field, value) => `length(${field}) == ${value.value}`,
            'is': (field, value) => `${field} == '${value.value}'`,
            'is longer than': (field, value) => `length(${field}) > ${value.value}`,
            'is not': (field, value) => `${field} != '${value.value}'`,
            'is shorter than': (field, value) => `length(${field}) < ${value.value}`
          }
        }
      ]
    },
    'MultilineTextField': {
      cases: [
        {
          operators: {
            'has length': (field, value) => `length(${field}) == ${value.value}`,
            'is': (field, value) => `${field} == '${value.value}'`,
            'is longer than': (field, value) => `length(${field}) > ${value.value}`,
            'is not': (field, value) => `${field} != '${value.value}'`,
            'is shorter than': (field, value) => `length(${field}) < ${value.value}`
          }
        }
      ]
    },
    'EmailAddressField': {
      cases: [
        {
          operators: {
            'has length': (field, value) => `length(${field}) == ${value.value}`,
            'is': (field, value) => `${field} == '${value.value}'`,
            'is longer than': (field, value) => `length(${field}) > ${value.value}`,
            'is not': (field, value) => `${field} != '${value.value}'`,
            'is shorter than': (field, value) => `length(${field}) < ${value.value}`
          }
        }
      ]
    }
  }

  const defaultValidators = {
    'is': (field, value) => `${field} == '${value.value}'`,
    'is not': (field, value) => `${field} != '${value.value}'`
  }

  describe('getOperatorNames', () => {
    inputFieldComponents
      .filter(it => !Object.keys(componentTypesWithCustomValidators).includes(it.name))
      .forEach(type => {
        test(`should apply default operators for ${type.name}`, () => {
          const operatorNames = getOperatorNames(type.name)
          expect(operatorNames).to.equal(Object.keys(defaultValidators))
        })
      })

    Object.keys(componentTypesWithCustomValidators).forEach(type => {
      test(`should apply expected operators for ${type}`, () => {
        const operatorNames = getOperatorNames(type)
        expect(operatorNames).to.equal(Object.keys(componentTypesWithCustomValidators[type].cases[0].operators))
      })
    })
  })

  describe('getExpression', () => {
    inputFieldComponents
      .filter(it => !Object.keys(componentTypesWithCustomValidators).includes(it.name))
      .forEach(type => {
        Object.keys(defaultValidators).forEach(operator => {
          test(`'${operator}' is correct for ${type.name}`, () => {
            const value = new Value('monkey')
            const expression = getExpression(type.name, 'badger', operator, value)
            expect(expression).to.equal(defaultValidators[operator]('badger', value))
          })
        })
      })

    Object.entries(componentTypesWithCustomValidators).forEach(([type, config]) => {
      config.cases.forEach(testConfig => {
        const value = testConfig.testValue || new Value('monkey')
        Object.keys(testConfig.operators).forEach(operator => {
          const fieldName = 'someField'
          test(`'${operator}' is correct for ${type} with value ${value.toPresentationString()}`, () => {
            const expression = getExpression(type, fieldName, operator, value)
            const expectedExpression = testConfig.operators[operator]
            expect(expression).to.equal(expectedExpression(fieldName, value))
          })
        })
      })
    })
  })
})

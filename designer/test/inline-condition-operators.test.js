import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'

import ComponentTypes from 'digital-form-builder-engine/src/component-types'
import { getExpression, getOperatorNames } from '../client/conditions/inline-condition-operators'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, describe, test } = lab

suite('Inline condition operators', () => {
  const inputFieldComponents = ComponentTypes.filter(it => it.subType === 'field')

  // I expect this list to grow as time goes on.
  // If you're adding to it please ensure you add tests for the type(s) you're adding
  const componentTypesWithCustomValidators = {
    'NumberField': {
      'is': (field, value) => `${field} == ${value}`,
      'is at least': (field, value) => `${field} >= ${value}`,
      'is at most': (field, value) => `${field} <= ${value}`,
      'is greater than': (field, value) => `${field} > ${value}`,
      'is less than': (field, value) => `${field} < ${value}`,
      'is not': (field, value) => `${field} != ${value}`
    },
    // here because the formatting of value is different to the standard quoted string
    'YesNoField': {
      'is': (field, value) => `${field} == ${value}`,
      'is not': (field, value) => `${field} != ${value}`
    },
    'CheckboxesField': {
      'contains': (field, value) => `'${value}' in ${field}`,
      'does not contain': (field, value) => `not ('${value}' in ${field})`
    },
    'TextField': {
      'has length': (field, value) => `length(${field}) == ${value}`,
      'is': (field, value) => `${field} == '${value}'`,
      'is longer than': (field, value) => `length(${field}) > ${value}`,
      'is not': (field, value) => `${field} != '${value}'`,
      'is shorter than': (field, value) => `length(${field}) < ${value}`
    },
    'MultilineTextField': {
      'has length': (field, value) => `length(${field}) == ${value}`,
      'is': (field, value) => `${field} == '${value}'`,
      'is longer than': (field, value) => `length(${field}) > ${value}`,
      'is not': (field, value) => `${field} != '${value}'`,
      'is shorter than': (field, value) => `length(${field}) < ${value}`
    },
    'EmailAddressField': {
      'has length': (field, value) => `length(${field}) == ${value}`,
      'is': (field, value) => `${field} == '${value}'`,
      'is longer than': (field, value) => `length(${field}) > ${value}`,
      'is not': (field, value) => `${field} != '${value}'`,
      'is shorter than': (field, value) => `length(${field}) < ${value}`
    }
  }

  const defaultValidators = {
    'is': (field, value) => `${field} == '${value}'`,
    'is not': (field, value) => `${field} != '${value}'`
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
        expect(operatorNames).to.equal(Object.keys(componentTypesWithCustomValidators[type]))
      })
    })
  })

  describe('getExpression', () => {
    inputFieldComponents
      .filter(it => !Object.keys(componentTypesWithCustomValidators).includes(it.name))
      .forEach(type => {
        Object.keys(defaultValidators).forEach(operator => {
          test(`'${operator}' is correct for ${type.name}`, () => {
            const expression = getExpression(type.name, 'badger', operator, 'monkey')
            expect(expression).to.equal(defaultValidators[operator]('badger', 'monkey'))
          })
        })
      })

    Object.keys(componentTypesWithCustomValidators).forEach(type => {
      Object.keys(componentTypesWithCustomValidators[type]).forEach(operator => {
        test(`'${operator}' is correct for ${type}`, () => {
          const expression = getExpression(type, 'badger', operator, 'monkey')
          expect(expression).to.equal(componentTypesWithCustomValidators[type][operator]('badger', 'monkey'))
        })
      })
    })
  })
})

import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import {
  assertLink,
  assertRequiredTextInput,
  assertSelectInput
} from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditionsDefinition from '../client/conditions/inline-conditions-definition'
import { Condition, Field, Value } from '../client/conditions/inline-condition-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { before, beforeEach, describe, suite, test } = lab

suite('Inline conditions definition section', () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    listFor: sinon.stub(),
    hasConditions: false,
    getConditions: sinon.stub()
  }
  const textFieldOperators = ['is', 'is not', 'matches']
  const path = '/'

  describe('when fields are present', () => {
    const selectFieldOperators = ['is', 'is not']
    let fields
    let expectedFields
    const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]
    let saveCallback

    before(() => {
      fields = [
        { name: 'field1', title: 'Something', type: 'TextField' },
        { name: 'field2', title: 'Something else', type: 'TextField' },
        { name: 'field3', title: 'Another thing', type: 'SelectField' }
      ]
      expectedFields = {
        field1: {
          label: 'Something',
          name: 'field1',
          type: 'TextField',
          values: undefined
        },
        field2: {
          label: 'Something else',
          name: 'field2',
          type: 'TextField',
          values: undefined
        },
        field3: {
          label: 'Another thing',
          name: 'field3',
          type: 'SelectField',
          values: values
        }
      }
      data.inputsAccessibleAt.withArgs(path).returns(fields)
      data.listFor.returns(undefined)
      data.listFor.withArgs(fields[2]).returns({ items: values })
    })

    beforeEach(() => {
      saveCallback = sinon.spy()
    })

    describe('adding conditions', () => {
      test('Only the field input is displayed initially for the first condition', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
        expect(wrapper.find('#cond-coordinator-group').exists()).to.equal(false)
        expect(wrapper.find('#condition-definition-inputs').exists()).to.equal(true)
        expect(wrapper.find('#cond-field').exists()).to.equal(true)
        assertFieldInputPresent(wrapper, fields)
        assertOperatorInputNotPresent(wrapper)
        assertValueInputNotPresent(wrapper)
        assertNoSaveConditionLink(wrapper)
      })

      test('Only the coordinator input is displayed initially for later conditions', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions fields={expectedFields} />)
        expect(wrapper.find('#cond-coordinator-group').exists()).to.equal(true)
        expect(wrapper.find('#condition-definition-inputs').exists()).to.equal(false)
        assertFieldInputNotPresent(wrapper)
        assertOperatorInputNotPresent(wrapper)
        assertValueInputNotPresent(wrapper)
        assertNoSaveConditionLink(wrapper)
      })

      test('Selecting a field displays the relevant operators', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
        wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })

        assertFieldInputPresent(wrapper, fields, fields[0].name)

        assertOperatorInputPresent(wrapper, textFieldOperators)
        assertValueInputNotPresent(wrapper)

        assertNoSaveConditionLink(wrapper)
      })

      describe('for a field which does not have an options list', () => {
        textFieldOperators.forEach(operator => {
          test('selecting an operator creates a text value input for ' + operator, () => {
            const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
            wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
            wrapper.find('#cond-operator').simulate('change', { target: { value: operator } })

            assertFieldInputPresent(wrapper, fields, fields[0].name)
            assertOperatorInputPresent(wrapper, textFieldOperators, operator)
            assertTextValueInputPresent(wrapper)
            assertNoSaveConditionLink(wrapper)
          })
        })

        test('populating a value makes the \'save condition\' link appear', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')
          assertFieldInputPresent(wrapper, fields, fields[0].name)
          assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[0])
          assertTextValueInputPresent(wrapper, 'M')
          assertSaveConditionLink(wrapper)
        })

        test('changing to a blank value makes the \'save condition\' link disappear', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-value').simulate('change', { target: { value: '' } })

          assertFieldInputPresent(wrapper, fields, fields[0].name)
          assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[0])
          assertTextValueInputPresent(wrapper)
          assertNoSaveConditionLink(wrapper)
        })

        test('removing a value makes the \'save condition\' link disappear', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-value').simulate('change', { target: { value: undefined } })

          assertFieldInputPresent(wrapper, fields, fields[0].name)
          assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[0])
          assertTextValueInputPresent(wrapper)
          assertNoSaveConditionLink(wrapper)
        })

        test('Clicking the \'save condition\' link stores the condition', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')

          expect(saveCallback.calledOnce).to.equal(true)
          expect(saveCallback.firstCall.args[0]).to.equal(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
        })
      })

      describe('for a field which has an options list', () => {
        let field

        before(() => {
          field = fields[2]
        })

        selectFieldOperators.forEach(operator => {
          test(`selecting an operator creates a select input for ${operator}`, () => {
            const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
            wrapper.find('#cond-field').simulate('change', { target: { value: field.name } })
            wrapper.find('#cond-operator').simulate('change', { target: { value: operator } })

            assertFieldInputPresent(wrapper, fields, field.name)
            assertOperatorInputPresent(wrapper, selectFieldOperators, operator)
            assertSelectValueInputPresent(wrapper, values)
          })
        })

        values.forEach(value => {
          test(`selecting value '${value.text}' makes the 'save condition' link appear`, () => {
            const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
            fillConditionInputs(wrapper, field.name, selectFieldOperators[0], value.value)

            assertFieldInputPresent(wrapper, fields, field.name)
            assertOperatorInputPresent(wrapper, selectFieldOperators, selectFieldOperators[0])
            assertSelectValueInputPresent(wrapper, values, value.value)
            assertSaveConditionLink(wrapper)
          })
        })

        test('changing a value leaves the \'save condition\' link in place', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          fillConditionInputs(wrapper, field.name, selectFieldOperators[0], values[0].value)
          wrapper.find('#cond-value').simulate('change', { target: { value: values[1].value } })

          assertFieldInputPresent(wrapper, fields, field.name)
          assertOperatorInputPresent(wrapper, selectFieldOperators, selectFieldOperators[0])
          assertSelectValueInputPresent(wrapper, values, values[1].value)
          assertSaveConditionLink(wrapper)
        })

        test('Removing a value removes the \'save condition\' link', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          fillConditionInputs(wrapper, field.name, selectFieldOperators[0], values[0].value)
          wrapper.find('#cond-value').simulate('change', { target: { value: undefined } })

          assertFieldInputPresent(wrapper, fields, field.name)
          assertOperatorInputPresent(wrapper, selectFieldOperators, selectFieldOperators[0])
          assertSelectValueInputPresent(wrapper, values)
          assertNoSaveConditionLink(wrapper)
        })

        test('Selecting a blank value removes the \'save condition\' link', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          fillConditionInputs(wrapper, field.name, selectFieldOperators[0], values[0].value)
          wrapper.find('#cond-value').simulate('change', { target: { value: '' } })

          assertFieldInputPresent(wrapper, fields, field.name)
          assertOperatorInputPresent(wrapper, selectFieldOperators, selectFieldOperators[0])
          assertSelectValueInputPresent(wrapper, values)
          assertNoSaveConditionLink(wrapper)
        })

        test('Clicking the \'save condition\' link stores the condition', () => {
          const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
          saveCondition(wrapper, field.name, selectFieldOperators[0], values[0].value)

          expect(saveCallback.calledOnce).to.equal(true)
          expect(saveCallback.firstCall.args[0]).to.equal(new Condition(new Field(field.name, field.title), selectFieldOperators[0], new Value(values[0].value, values[0].text)))
        })
      })

      test('Change field erases operator and value if neither is relevant anymore', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
        wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
        wrapper.find('#cond-operator').simulate('change', { target: { value: textFieldOperators[2] } })
        wrapper.find('#cond-value').simulate('change', { target: { value: 'M' } })

        assertFieldInputPresent(wrapper, fields, fields[0].name)
        assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[2])
        assertTextValueInputPresent(wrapper, 'M')

        wrapper.find('#cond-field').simulate('change', { target: { value: fields[2].name } })

        assertFieldInputPresent(wrapper, fields, fields[2].name)
        assertOperatorInputPresent(wrapper, selectFieldOperators)
        assertValueInputNotPresent(wrapper)
        assertNoSaveConditionLink(wrapper)

        wrapper.find('#cond-operator').simulate('change', { target: { value: selectFieldOperators[0] } })

        assertSelectValueInputPresent(wrapper, values)
        assertNoSaveConditionLink(wrapper)
      })

      test('Change field erases value but keeps operator if operator is still relevant', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
        wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
        wrapper.find('#cond-operator').simulate('change', { target: { value: textFieldOperators[0] } })
        wrapper.find('#cond-value').simulate('change', { target: { value: 'M' } })

        assertFieldInputPresent(wrapper, fields, fields[0].name)
        assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[0])
        assertTextValueInputPresent(wrapper, 'M')
        assertSaveConditionLink(wrapper)

        wrapper.find('#cond-field').simulate('change', { target: { value: fields[2].name } })

        assertFieldInputPresent(wrapper, fields, fields[2].name)
        assertOperatorInputPresent(wrapper, selectFieldOperators, selectFieldOperators[0])
        assertSelectValueInputPresent(wrapper, values)
      })

      test('Clearing field erases all values', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions={false} fields={expectedFields} />)
        wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
        wrapper.find('#cond-operator').simulate('change', { target: { value: textFieldOperators[0] } })
        wrapper.find('#cond-value').simulate('change', { target: { value: 'M' } })

        assertFieldInputPresent(wrapper, fields, fields[0].name)
        assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[0])
        assertTextValueInputPresent(wrapper, 'M')

        wrapper.find('#cond-field').simulate('change', { target: { value: undefined } })

        assertFieldInputPresent(wrapper, fields)
      })

      test('Adding subsequent conditions', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions fields={expectedFields} />)
        wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
        saveCondition(wrapper, fields[1].name, textFieldOperators[1], 'N')

        expect(saveCallback.calledOnce).to.equal(true)
        expect(saveCallback.firstCall.args[0]).to.equal(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[1], new Value('N'), 'and'))
      })

      test('Changing to a blank coordinator', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions fields={expectedFields} />)
        wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
        wrapper.find('#cond-coordinator').simulate('change', { target: { value: '' } })

        assertConditionCoordinatorInput(wrapper)
        assertNoFieldsGroup(wrapper)
      })

      test('Changing to an undefined coordinator', () => {
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions fields={expectedFields} />)
        wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
        wrapper.find('#cond-coordinator').simulate('change', { target: { value: undefined } })

        assertConditionCoordinatorInput(wrapper)
        assertNoFieldsGroup(wrapper)
      })

      test('Amending the first condition ', () => {
        const condition = new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[1], new Value('N'))
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions fields={expectedFields} editingIndex={0} condition={condition} />)
        assertNoConditionCoordinatorInput(wrapper)

        assertFieldInputPresent(wrapper, fields, fields[1].name)
        assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[1])
        assertTextValueInputPresent(wrapper, 'N')
        assertSaveConditionLink(wrapper)
      })

      test('Amending a later condition ', () => {
        const condition = new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[1], new Value('N'), 'and')
        const wrapper = shallow(<InlineConditionsDefinition saveCallback={saveCallback} hasConditions fields={expectedFields} editingIndex={1} condition={condition} />)

        assertConditionCoordinatorInput(wrapper, 'and')
        assertFieldInputPresent(wrapper, fields, fields[1].name)
        assertOperatorInputPresent(wrapper, textFieldOperators, textFieldOperators[1])
        assertTextValueInputPresent(wrapper, 'N')
        assertSaveConditionLink(wrapper)
      })
    })
  })
})

function assertOperatorInputPresent (wrapper, operators, expectedOperator) {
  assertSelectInput(wrapper.find('#cond-operator'), 'cond-operator', operators.map(operator => ({
    value: operator,
    text: operator
  })), expectedOperator || '')
}

function assertOperatorInputNotPresent (wrapper) {
  expect(wrapper.find('#cond-operator').exists()).to.equal(false)
}

function assertSelectValueInputPresent (wrapper, values, expected) {
  assertSelectInput(wrapper.find('#cond-value'), 'cond-value', values, expected || '')
}

function assertTextValueInputPresent (wrapper, expected) {
  assertRequiredTextInput(wrapper.find('#cond-value'), 'cond-value', expected)
}

function assertValueInputNotPresent (wrapper) {
  expect(wrapper.find('#cond-value').exists()).to.equal(false)
}

function assertFieldInputPresent (wrapper, fields, expectedField) {
  assertSelectInput(wrapper.find('#cond-field'), 'cond-field', fields.map(field => ({
    value: field.name,
    text: field.title
  })), expectedField || '')
}

function assertFieldInputNotPresent (wrapper) {
  expect(wrapper.find('#cond-field').exists()).to.equal(false)
}

function assertNoFieldsGroup (wrapper) {
  expect(wrapper.find('#condition-definition-inputs').exists()).to.equal(false)
}

function assertSaveConditionLink (wrapper) {
  assertLink(wrapper.find('#save-condition'), 'save-condition', 'Save condition')
}

function assertNoSaveConditionLink (wrapper) {
  expect(wrapper.find('#save-condition').exists()).to.equal(false)
}

function assertConditionCoordinatorInput (wrapper, expectedValue) {
  const conditionCoordinatorGroup = wrapper.find('#cond-coordinator-group')
  expect(conditionCoordinatorGroup.hasClass('govuk-form-group')).to.equal(true)

  assertSelectInput(conditionCoordinatorGroup.find('select'), 'cond-coordinator', [{ value: 'and', text: 'And' }, { value: 'or', text: 'Or' }], expectedValue || '')
}

function assertNoConditionCoordinatorInput (wrapper) {
  expect(wrapper.find('#cond-coordinator').exists()).to.equal(false)
}

function saveCondition (wrapper, fieldName, operator, value) {
  fillConditionInputs(wrapper, fieldName, operator, value)
  wrapper.find('#save-condition').simulate('click')
}

function fillConditionInputs (wrapper, fieldName, operator, value) {
  wrapper.find('#cond-field').simulate('change', { target: { value: fieldName } })
  wrapper.find('#cond-operator').simulate('change', { target: { value: operator } })
  wrapper.find('#cond-value').simulate('change', { target: { value: value } })
}

import React from 'react'
import { shallow } from 'enzyme'
import * as Lab from '@hapi/lab'
import * as Code from '@hapi/code'
import { assertRequiredTextInput, assertSelectInput } from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditionsDefinitionValue from '../client/conditions/inline-conditions-definition-values'
import { ConditionValue } from '../client/conditions/inline-condition-values'
import {
  dateTimeUnits,
  dateUnits,
  relativeTimeOperators,
  RelativeTimeValue,
  timeUnits
} from '../client/conditions/inline-conditions-relative-dates'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test } = lab

suite('Inline conditions definition value inputs', () => {
  const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]
  const selectedValues = values.map(it => new ConditionValue(it.value, it.text))
  let updateValueCallback

  beforeEach(() => {
    updateValueCallback = sinon.spy()
  })

  test('should display a text input for fields without custom mappings or options', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      type: 'TextField'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} value={new ConditionValue('my-value')} fieldDef={fieldDef} operator='is' />)

    assertRequiredTextInput(wrapper.find('input'), 'cond-value', 'my-value')
  })

  test('Inputting a text value should call update value', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      type: 'TextField'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} operator='is' />)

    wrapper.find('#cond-value').simulate('change', { target: { value: 'My thing' } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(new ConditionValue('My thing'))
  })

  test('Inputting a blank text value should call update value with undefined', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      type: 'TextField'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} operator='is' />)

    wrapper.find('#cond-value').simulate('change', { target: { value: '  ' } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(undefined)
  })

  test('should display a select input for fields without custom mappings and with options', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values,
      type: 'SelectField'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} value={selectedValues[0]} fieldDef={fieldDef} operator='is' />)

    const expectedFieldOptions = [...values]
    expectedFieldOptions.unshift({ text: '' })
    assertSelectInput(wrapper.find('select'), 'cond-value', expectedFieldOptions, values[0].value)
  })

  test('selecting a value from the select list should call update value', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values,
      type: 'SelectField'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} operator='is' />)

    wrapper.find('#cond-value').simulate('change', { target: { value: values[0].value } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(selectedValues[0])
  })

  test('selecting a blank value from the select list should call update value with undefined', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values,
      type: 'SelectField'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} operator='is' />)

    wrapper.find('#cond-value').simulate('change', { target: { value: '  ' } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(undefined)
  })

  const relativeTimeOperatorNames = Object.keys(relativeTimeOperators(dateUnits))
  const dateAndTimeMappings = [
    { type: 'DateField', units: dateUnits, relativeOperators: relativeTimeOperatorNames },
    { type: 'DatePartsField', units: dateUnits, relativeOperators: relativeTimeOperatorNames },
    { type: 'TimeField', units: timeUnits, timeOnly: true, relativeOperators: relativeTimeOperatorNames },
    { type: 'DateTimeField', units: dateTimeUnits, relativeOperators: relativeTimeOperatorNames },
    { type: 'DateTimePartsField', units: dateTimeUnits, relativeOperators: relativeTimeOperatorNames }
  ]

  dateAndTimeMappings.forEach(mapping => {
    mapping.relativeOperators.forEach(operator => {
      test(`Should display custom component for ${mapping.type} component type and '${operator}' operator`, () => {
        const fieldDef = {
          label: 'Something',
          name: 'field1',
          type: mapping.type
        }
        const expectedValue = new RelativeTimeValue('18', 'months', 'in the future')
        const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} value={expectedValue} fieldDef={fieldDef} operator={operator} />)

        const timeShiftValues = wrapper.find('RelativeTimeValues')
        expect(timeShiftValues.exists()).to.equal(true)
        expect(timeShiftValues.prop('value')).to.equal(expectedValue)
        expect(timeShiftValues.prop('updateValue')).to.equal(updateValueCallback)
        expect(timeShiftValues.prop('units')).to.equal(mapping.units)
        expect(timeShiftValues.prop('timeOnly')).to.equal(mapping.timeOnly || false)
        expect(Object.keys(timeShiftValues.props()).length).to.equal(4)
      })
    })
  })
})

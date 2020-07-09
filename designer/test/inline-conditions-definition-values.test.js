import React from 'react'
import { shallow } from 'enzyme'
import * as Lab from '@hapi/lab'
import * as Code from '@hapi/code'
import { assertRequiredTextInput, assertSelectInput } from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditionsDefinitionValue from '../client/conditions/inline-conditions-definition-values'
import { Value } from '../client/conditions/inline-condition-model'
import { dateTimeUnits, dateUnits, TimeShiftValue, timeUnits } from '../client/conditions/inline-condition-date-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test } = lab

suite('Inline conditions definition value inputs', () => {
  const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]
  const selectedValues = values.map(it => new Value(it.value, it.text))
  let updateValueCallback

  beforeEach(() => {
    updateValueCallback = sinon.spy()
  })

  test('should display a text input for fields without custom mappings or options', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} value={new Value('my-value')} fieldDef={fieldDef} />)

    assertRequiredTextInput(wrapper.find('input'), 'cond-value', 'my-value')
  })

  test('Inputting a text value should call update value', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: 'My thing' } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('My thing'))
  })

  test('Inputting a blank text value should call update value with undefined', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: '  ' } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(undefined)
  })

  test('should display a select input for fields without custom mappings and with options', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} value={selectedValues[0]} fieldDef={fieldDef} />)

    const expectedFieldOptions = [...values]
    expectedFieldOptions.unshift({ text: '' })
    assertSelectInput(wrapper.find('select'), 'cond-value', expectedFieldOptions, values[0].value)
  })

  test('selecting a value from the select list should call update value', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: values[0].value } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(selectedValues[0])
  })

  test('selecting a blank value from the select list should call update value with undefined', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: '  ' } })
    expect(updateValueCallback.calledOnce).to.equal(true)
    expect(updateValueCallback.firstCall.args[0]).to.equal(undefined)
  })

  const dateAndTimeMappings = [
    { type: 'DateField', units: dateUnits },
    { type: 'DatePartsField', units: dateUnits },
    { type: 'TimeField', units: timeUnits },
    { type: 'DateTimeField', units: dateTimeUnits },
    { type: 'DateTimePartsField', units: dateTimeUnits }
  ]

  dateAndTimeMappings.forEach(mapping => {
    test(`should display the expected components for ${mapping.type} component type`, () => {
      const fieldDef = {
        label: 'Something',
        name: 'field1',
        type: mapping.type
      }
      const expectedValue = new TimeShiftValue('18', 'months', 'in the future')
      const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValueCallback} value={expectedValue} fieldDef={fieldDef} />)

      const timeShiftValues = wrapper.find('TimeShiftValues')
      expect(timeShiftValues.exists()).to.equal(true)
      expect(timeShiftValues.prop('value')).to.equal(expectedValue)
      expect(timeShiftValues.prop('updateValue')).to.equal(updateValueCallback)
      expect(timeShiftValues.prop('units')).to.equal(mapping.units)
      expect(Object.keys(timeShiftValues.props()).length).to.equal(3)
    })
  })
})

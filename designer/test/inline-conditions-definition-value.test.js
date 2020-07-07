import React from 'react'
import { shallow } from 'enzyme'
import * as Lab from '@hapi/lab'
import * as Code from '@hapi/code'
import { assertRequiredTextInput, assertSelectInput } from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditionsDefinitionValue from '../client/conditions/inline-conditions-definition-value'
import { Value } from '../client/conditions/inline-condition-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test } = lab

suite('Inline conditions definition value inputs', () => {
  const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]
  const selectedValues = values.map(it => new Value(it.value, it.text))
  let updateValue

  beforeEach(() => {
    updateValue = sinon.spy()
  })

  test('should display a text input for fields without custom mappings or options', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValue} value={new Value('my-value')} fieldDef={fieldDef} />)

    assertRequiredTextInput(wrapper.find('input'), 'cond-value', 'my-value')
  })

  test('Inputting a text value should call update value', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValue} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: 'My thing' } })
    expect(updateValue.calledOnce).to.equal(true)
    expect(updateValue.firstCall.args[0]).to.equal(new Value('My thing'))
  })

  test('Inputting a blank text value should call update value with undefined', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1'
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValue} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: '  ' } })
    expect(updateValue.calledOnce).to.equal(true)
    expect(updateValue.firstCall.args[0]).to.equal(undefined)
  })

  test('should display a select input for fields without custom mappings and with options', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValue} value={selectedValues[0]} fieldDef={fieldDef} />)

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
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValue} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: values[0].value } })
    expect(updateValue.calledOnce).to.equal(true)
    expect(updateValue.firstCall.args[0]).to.equal(selectedValues[0])
  })

  test('selecting a blank value from the select list should call update value with undefined', () => {
    const fieldDef = {
      label: 'Something',
      name: 'field1',
      values: values
    }
    const wrapper = shallow(<InlineConditionsDefinitionValue updateValue={updateValue} fieldDef={fieldDef} />)

    wrapper.find('#cond-value').simulate('change', { target: { value: '  ' } })
    expect(updateValue.calledOnce).to.equal(true)
    expect(updateValue.firstCall.args[0]).to.equal(undefined)
  })
})

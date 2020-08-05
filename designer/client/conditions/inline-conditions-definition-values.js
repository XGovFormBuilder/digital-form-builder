import React from 'react'
import { ConditionValue } from './inline-condition-values'
import { getOperatorConfig } from './inline-condition-operators'

function TextValues (props) {
  const { updateValue, value } = props

  const onChangeTextInput = e => {
    const input = e.target
    const newValue = input.value

    let value
    if (newValue && newValue?.trim() !== '') {
      value = new ConditionValue(newValue)
    }
    updateValue(value)
  }

  return (
    <input className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
      type='text' defaultValue={value?.value} required
      onChange={onChangeTextInput} />
  )
}

function SelectValues (props) {
  const { fieldDef, updateValue, value } = props

  const onChangeSelect = e => {
    const input = e.target
    const newValue = input.value

    let value
    if (newValue && newValue?.trim() !== '') {
      const option = fieldDef.values?.find(value => String(value.value) === newValue)
      value = new ConditionValue(String(option.value), option.text)
    }
    updateValue(value)
  }

  return (
    <select className='govuk-select' id='cond-value' name='cond-value' value={value?.value??''}
      onChange={onChangeSelect}>
      <option />
      {fieldDef.values.map(option => {
        return <option key={option.value} value={option.value}>{option.text}</option>
      })}
    </select>
  )
}

class InlineConditionsDefinitionValue extends React.Component {
  render () {
    const { fieldDef, operator, value, updateValue } = this.props

    const operatorConfig = getOperatorConfig(fieldDef.type, operator)
    const customRendering = operatorConfig.renderComponent
    if (customRendering) {
      return customRendering(value, updateValue)
    }
    return (fieldDef?.values?.length??0) > 0 ? SelectValues(this.props) : TextValues(this.props)
  }
}

export default InlineConditionsDefinitionValue

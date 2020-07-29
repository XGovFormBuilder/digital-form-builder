import React from 'react'
import { ConditionValue, timeUnits } from 'digital-form-builder-model/lib/conditions/inline-condition-values'
import {
  absoluteDateOrTimeOperatorNames,
  getOperatorConfig, relativeDateOrTimeOperatorNames
} from 'digital-form-builder-model/lib/conditions/inline-condition-operators'

import RelativeTimeValues from './inline-conditions-relative-dates'
import { AbsoluteDateValues, AbsoluteDateTimeValues, AbsoluteTimeValues } from './inline-conditions-absolute-dates'

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
      const option = fieldDef.values?.find(value => value.value === newValue)
      value = new ConditionValue(option.value, option.text)
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

function customValueComponent (fieldType, operator) {
  const operatorConfig = getOperatorConfig(fieldType, operator)
  const absoluteDateTimeRenderFunctions = {
    'DateField': (value, updateValue) => <AbsoluteDateValues value={value} updateValue={updateValue} />,
    'DatePartsField': (value, updateValue) => <AbsoluteDateValues value={value} updateValue={updateValue} />,
    'DateTimeField': (value, updateValue) => <AbsoluteDateTimeValues value={value} updateValue={updateValue} />,
    'DateTimePartsField': (value, updateValue) => <AbsoluteDateTimeValues value={value} updateValue={updateValue} />,
    'TimeField': (value, updateValue) => <AbsoluteTimeValues value={value} updateValue={updateValue} />
  }
  const dateTimeFieldTypes = Object.keys(absoluteDateTimeRenderFunctions).includes(fieldType)
  if (dateTimeFieldTypes) {
    if (absoluteDateOrTimeOperatorNames.includes(operator)) {
      return absoluteDateTimeRenderFunctions[fieldType]
    } else if (relativeDateOrTimeOperatorNames.includes(operator)) {
      const units = operatorConfig.units
      return (value, updateValue) => <RelativeTimeValues value={value} updateValue={updateValue} units={units} timeOnly={units === timeUnits} />
    }
  }
}

class InlineConditionsDefinitionValue extends React.Component {
  render () {
    const { fieldDef, operator, value, updateValue } = this.props

    const customRendering = customValueComponent(fieldDef.type, operator)
    if (customRendering) {
      return customRendering(value, updateValue)
    }
    return (fieldDef?.values?.length??0) > 0 ? SelectValues(this.props) : TextValues(this.props)
  }
}

export default InlineConditionsDefinitionValue

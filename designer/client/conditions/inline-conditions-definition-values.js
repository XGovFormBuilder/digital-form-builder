import React from 'react'
import { ConditionValue, timeUnits } from '@xgovformbuilder/model'
import {
  absoluteDateOrTimeOperatorNames,
  getOperatorConfig, relativeDateOrTimeOperatorNames
} from '@xgovformbuilder/model'

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
    <input
      className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
      type='text' defaultValue={value?.value} required
      onChange={onChangeTextInput}
    />
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
      value = new ConditionValue(String(option.value), option.display)
    }
    updateValue(value)
  }

  return (
    <select
      className='govuk-select' id='cond-value' name='cond-value' value={value?.value ?? ''}
      onChange={onChangeSelect}
    >
      <option />
      {fieldDef.values.map(option => {
        return <option key={option.value} value={option.value}>{option.display}</option>
      })}
    </select>
  )
}

function customValueComponent (fieldType, operator) {
  const operatorConfig = getOperatorConfig(fieldType, operator)
  const absoluteDateTimeRenderFunctions = {
    DateField: AbsoluteDateValues,
    DatePartsField: AbsoluteDateValues,
    DateTimeField: AbsoluteDateTimeValues,
    DateTimePartsField: AbsoluteDateTimeValues,
    TimeField: AbsoluteTimeValues
  }
  if (fieldType in absoluteDateTimeRenderFunctions) {
    if (absoluteDateOrTimeOperatorNames.includes(operator)) {
      return absoluteDateTimeRenderFunctions[fieldType]
    } else if (relativeDateOrTimeOperatorNames.includes(operator)) {
      const units = operatorConfig.units
      return function RelativeTimeValuesWrapper (value, updateValue) {
        return <RelativeTimeValues
          value={value}
          updateValue={updateValue}
          units={units}
          timeOnly={units === timeUnits}
        />
      }
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
    return (fieldDef?.values?.length ?? 0) > 0 ? SelectValues(this.props) : TextValues(this.props)
  }
}

export default InlineConditionsDefinitionValue

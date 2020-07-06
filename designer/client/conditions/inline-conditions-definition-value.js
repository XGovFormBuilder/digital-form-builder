import React from 'react'
import { Value } from './inline-condition-model'

class InlineConditionsDefinitionValue extends React.Component {
  updateValue (newValue) {
    const { fieldDef, updateValue } = this.props
    let value
    if (newValue && newValue?.trim() !== '') {
      const option = fieldDef.values?.find(value => value.value === newValue)
      value = option ? new Value(option.value, option.text) : new Value(newValue)
    }
    updateValue(value)
  }

  render () {
    const { fieldDef, value } = this.props

    return (
      <div>
        {(fieldDef?.values?.length??0) > 0 &&
          <select className='govuk-select' id='cond-value' name='cond-value' value={value??''}
            onChange={e => this.updateValue(e.target.value)}>
            <option />
            {fieldDef.values.map(option => {
              return <option key={option.value} value={option.value}>{option.text}</option>
            })}
          </select>
        }

        {(fieldDef?.values?.length??0) === 0 &&
          <input className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
            type='text' defaultValue={value} required
            onChange={e => this.updateValue(e.target.value)} />
        }
      </div>
    )
  }
}

export default InlineConditionsDefinitionValue

import React from 'react'

class InlineConditionsDefinitionValue extends React.Component {
  render () {
    const { fieldDef, updateValue, value } = this.props

    return (
      <div>
        {(fieldDef?.values?.length??0) > 0 &&
          <select className='govuk-select' id='cond-value' name='cond-value' value={value??''}
            onChange={e => updateValue(e.target.value)}>
            <option />
            {fieldDef.values.map(option => {
              return <option key={option.value} value={option.value}>{option.text}</option>
            })}
          </select>
        }

        {(fieldDef?.values?.length??0) === 0 &&
          <input className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
            type='text' defaultValue={value} required
            onChange={e => updateValue(e.target.value)} />
        }
      </div>
    )
  }
}

export default InlineConditionsDefinitionValue

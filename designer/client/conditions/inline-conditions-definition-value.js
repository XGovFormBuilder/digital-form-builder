import React from 'react'
import { dateDirections, dateTimeUnits, dateUnits, TimeShiftValue, timeUnits, Value } from './inline-condition-model'

class TimeShiftValues extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timePeriod: props.value?.timePeriod,
      timeUnits: props.value?.timeUnits,
      direction: props.value?.direction
    }
  }

  setState (state, callback) {
    super.setState(state, () => {
      this.conditionalUpdate()
      callback()
    })
  }

  conditionalUpdate () {
    const { timePeriod, timeUnits, direction } = this.state
    if (timePeriod && timeUnits && direction) {
      this.props.updateValue(new TimeShiftValue(timePeriod, timeUnits, direction))
    }
  }

  render () {
    const { timePeriod, timeUnits, direction } = this.state

    return <div>
      <input className='govuk-input govuk-input--width-20' id='cond-value-period' name='cond-value-period'
             type='text' defaultValue={timePeriod} required
             onChange={e => this.setState({ timePeriod: e.target.value })} />

      <select className='govuk-select' id='cond-value-units' name='cond-value-units' value={timeUnits??''}
              onChange={e => this.setState({ timeUnits: e.target.value })}>
        <option />
        {Object.values(this.props.units).map(unit => {
          return <option key={unit} value={unit}>{unit}</option>
        })}
      </select>

      <select className='govuk-select' id='cond-value-direction' name='cond-value-direction' value={direction??''}
              onChange={e => this.setState({ direction: e.target.value })}>
        <option />
        {Object.values(dateDirections).map(direction => {
          return <option key={direction} value={direction}>{direction}</option>
        })}
      </select>
    </div>
  }
}

function SelectValues (props) {
  const { fieldDef, updateValue, value } = props

  const processValue = e => {
    const input = e.target
    const newValue = input.value

    let value
    if (newValue && newValue?.trim() !== '') {
      const option = fieldDef.values?.find(value => value.value === newValue)
      value = new Value(option.value, option.text)
    }
    updateValue(value)
  }

  return <select className='govuk-select' id='cond-value' name='cond-value' value={value?.value??''}
    onChange={processValue}>
    <option />
    {fieldDef.values.map(option => {
      return <option key={option.value} value={option.value}>{option.text}</option>
    })}
  </select>
}

function TextValues (props) {
  const { updateValue, value } = props

  const processValue = e => {
    const input = e.target
    const newValue = input.value

    let value
    if (newValue && newValue?.trim() !== '') {
      value = new Value(newValue)
    }
    updateValue(value)
  }
  return <input className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
    type='text' defaultValue={value?.value} required
    onChange={processValue} />
}


class InlineConditionsDefinitionValue extends React.Component {

  componentTypeValueDefinitions = {
    'DateField': this.DateFieldValues,
    'TimeField': this.TimeFieldValues,
    'DateTimeField': this.DateTimeFieldValues,
    'DatePartsField': this.DateFieldValues,
    'DateTimePartsField': this.DateTimeFieldValues
  }

  DateTimeFieldValues (props) {
    return <TimeShiftValues value={props.value} updateValue={props.updateValue} units={dateTimeUnits} />
  }

  DateFieldValues (props) {
    return <TimeShiftValues value={props.value} updateValue={props.updateValue} units={dateUnits} />
  }

  TimeFieldValues (props) {
    return <TimeShiftValues value={props.value} updateValue={props.updateValue} units={timeUnits} />
  }

  render () {
    const { fieldDef } = this.props
    const customConfig = this.componentTypeValueDefinitions[fieldDef.type]
    if (customConfig) {
      return customConfig(this.props)
    } else {
      return (fieldDef?.values?.length??0) > 0 ? SelectValues(this.props) : TextValues(this.props)
    }
  }
}

export default InlineConditionsDefinitionValue

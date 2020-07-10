import React from 'react'
import { Value } from './inline-condition-model'

export const absoluteTimeOperators = {
  is: absoluteTime('=='),
  'is not': absoluteTime('!='),
  'is before': absoluteTime('<'),
  'is after': absoluteTime('>')
}

export const absoluteDateTimeOperators = {
  is: absoluteDateTime('=='),
  'is not': absoluteDateTime('!='),
  'is before': absoluteDateTime('<'),
  'is after': absoluteDateTime('>')
}

export const absoluteDateOperators = {
  is: absoluteDate('=='),
  'is not': absoluteDate('!='),
  'is before': absoluteDate('<'),
  'is after': absoluteDate('>')
}

function applyOperator (operator) {
  return (field, value) => {
    if (value instanceof Value) {
      return `${field.name} ${operator} '${value.toExpression()}'`
    }
    throw Error('only Value types are supported')
  }
}

function absoluteTime (operator) {
  return {
    expression: applyOperator(operator),
    renderComponent: (value, updateValue) => <AbsoluteTimeValues value={value} updateValue={updateValue} />
  }
}

function absoluteDate (operator) {
  return {
    expression: applyOperator(operator),
    renderComponent: (value, updateValue) => <AbsoluteDateValues value={value} updateValue={updateValue} />
  }
}

function absoluteDateTime (operator) {
  return {
    expression: applyOperator(operator),
    renderComponent: (value, updateValue) => <AbsoluteDateTimeValues value={value} updateValue={updateValue} />
  }
}

class AbsoluteTimeValues extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hours: props.value?.value.split(':')[0],
      minutes: props.value?.value.split(':')[1]
    }
  }

  updateState (state) {
    this.setState(state, () => {
      this.passValueToParentComponentIfComplete()
    })
  }

  passValueToParentComponentIfComplete () {
    const { hours, minutes } = this.state
    if (hours && minutes) {
      this.props.updateValue(new Value(`${hours}:${minutes}`))
    }
  }

  render () {
    const { hours, minutes } = this.state

    return (
      <div className='govuk-date-input'>
        <div className='govuk-date-input__item'>
          <div className='govuk-form-group'>
            <label htmlFor='cond-value-hours' className='govuk-label govuk-label--s'>HH</label>
            <input className='govuk-input govuk-input--width-2' id='cond-value-hours' name='cond-value-hours'
              type='number' maxLength={2} defaultValue={hours} required
              onChange={e => this.updateState({ hours: e.target.value.padStart(2, '0') })} />
          </div>
        </div>

        <div className='govuk-date-input__item'>
          <div className='govuk-form-group'>
            <label htmlFor='cond-value-minutes' className='govuk-label govuk-label--s'>mm</label>
            <input className='govuk-input govuk-input--width-2' id='cond-value-minutes' name='cond-value-minutes'
              type='number' maxLength={2} defaultValue={minutes} required
              onChange={e => this.updateState({ minutes: e.target.value.padStart(2, '0') })} />
          </div>
        </div>
      </div>
    )
  }
}

class AbsoluteDateValues extends React.Component {
  constructor (props) {
    super(props)
    if (props.value) {
      const dateComponents = props.value.value.split('-')
      this.state = {
        year: dateComponents[0],
        month: dateComponents[1],
        day: dateComponents[2]
      }
    } else {
      this.state = {}
    }
  }

  updateState (state) {
    this.setState(state, () => {
      this.passValueToParentComponentIfComplete()
    })
  }

  passValueToParentComponentIfComplete () {
    const { year, month, day } = this.state
    if (year && month && day) {
      this.props.updateValue(new Value(`${year}-${month}-${day}`))
    }
  }

  render () {
    const { year, month, day } = this.state

    return (
      <div className='govuk-date-input'>
        <div className='govuk-date-input__item'>
          <div className='govuk-form-group'>
            <label htmlFor='cond-value-year' className='govuk-label govuk-label--s'>yyyy</label>
            <input className='govuk-input govuk-input--width-4' id='cond-value-year' name='cond-value-year'
              type='number' maxLength={4} minLength={4} defaultValue={year} required
              onChange={e => this.updateState({ year: e.target.value })} />
          </div>
        </div>

        <div className='govuk-date-input__item'>
          <div className='govuk-form-group'>
            <label htmlFor='cond-value-month' className='govuk-label govuk-label--s'>MM</label>
            <input className='govuk-input govuk-input--width-2' id='cond-value-month' name='cond-value-month'
              type='number' maxLength={2} defaultValue={month} required
              onChange={e => this.updateState({ month: e.target.value.padStart(2, '0') })} />
          </div>
        </div>
        <div className='govuk-date-input__item'>
          <div className='govuk-form-group'>
            <label htmlFor='cond-value-day' className='govuk-label govuk-label--s'>dd</label>
            <input className='govuk-input govuk-input--width-2' id='cond-value-day' name='cond-value-day'
              type='number' maxLength={2} defaultValue={day} required
              onChange={e => this.updateState({ day: e.target.value.padStart(2, '0') })} />
          </div>
        </div>
      </div>
    )
  }
}

class AbsoluteDateTimeValues extends React.Component {
  constructor (props) {
    super(props)
    if (props.value) {
      const dateTimeComponents = props.value.value.split('T')
      const timeComponents = dateTimeComponents[1].split(':')
      this.state = {
        date: new Value(dateTimeComponents[0]),
        // throw away any second / millis values
        time: new Value(`${timeComponents[0]}:${timeComponents[1]}`)
      }
    } else {
      this.state = {}
    }
  }

  updateState (state) {
    this.setState(state, () => {
      this.passValueToParentComponentIfComplete()
    })
  }

  passValueToParentComponentIfComplete () {
    const { date, time } = this.state
    if (date && time) {
      this.props.updateValue(new Value(`${date.value}T${time.value}:00.000Z`))
    }
  }

  render () {
    const { date, time } = this.state
    return (
      <div>
        <AbsoluteDateValues value={date} updateValue={dateValue => this.updateState({ date: dateValue })} />
        <AbsoluteTimeValues value={time} updateValue={timeValue => this.updateState({ time: timeValue })} />
      </div>
    )
  }
}

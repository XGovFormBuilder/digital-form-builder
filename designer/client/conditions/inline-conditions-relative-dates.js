import React from 'react'
import { AbstractConditionValue } from './inline-condition-values'

export const relativeTimeOperators = (units) => ({
  'is at least': relativeTime('<=', '>=', units),
  'is at most': relativeTime('>=', '<=', units),
  'is less than': relativeTime('>', '<', units),
  'is more than': relativeTime('<', '>', units)
})

export function relativeTime (pastOperator, futureOperator, units) {
  return {
    expression: (field, value) => {
      if (value instanceof RelativeTimeValue) {
        const operator = value.direction === dateDirections.PAST ? pastOperator : futureOperator
        return `${field.name} ${operator} ${value.toExpression()}`
      }
      throw Error('time shift requires a TimeShiftValue')
    },
    renderComponent: (value, updateValue) => <RelativeTimeValues value={value} updateValue={updateValue} units={units} timeOnly={units === timeUnits} />
  }
}

class RelativeTimeValues extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timePeriod: props.value?.timePeriod,
      timeUnits: props.value?.timeUnit,
      direction: props.value?.direction
    }
  }

  updateState (state) {
    this.setState(state, () => {
      this.passValueToParentComponentIfComplete()
    })
  }

  passValueToParentComponentIfComplete () {
    const { timePeriod, timeUnits, direction } = this.state
    if (timePeriod && timeUnits && direction) {
      this.props.updateValue(new RelativeTimeValue(timePeriod, timeUnits, direction, this.props.timeOnly || false))
    }
  }

  render () {
    const { timePeriod, timeUnits, direction } = this.state

    return (
      <div>
        <input className='govuk-input govuk-input--width-20' id='cond-value-period' name='cond-value-period'
          type='text' defaultValue={timePeriod} required
          onChange={e => this.updateState({ timePeriod: e.target.value })} />

        <select className='govuk-select' id='cond-value-units' name='cond-value-units' value={timeUnits??''}
          onChange={e => this.updateState({ timeUnits: e.target.value })}>
          <option />
          {Object.values(this.props.units).map(unit => {
            return <option key={unit.value} value={unit.value}>{unit.display}</option>
          })}
        </select>

        <select className='govuk-select' id='cond-value-direction' name='cond-value-direction' value={direction??''}
          onChange={e => this.updateState({ direction: e.target.value })}>
          <option />
          {Object.values(dateDirections).map(direction => {
            return <option key={direction} value={direction}>{direction}</option>
          })}
        </select>
      </div>
    )
  }
}

export const dateDirections = {
  FUTURE: 'in the future',
  PAST: 'in the past'
}

export const dateUnits = {
  YEARS: { display: 'year(s)', value: 'years' },
  MONTHS: { display: 'month(s)', value: 'months' },
  DAYS: { display: 'day(s)', value: 'days' }
}

export const timeUnits = {
  HOURS: { display: 'hour(s)', value: 'hours' },
  MINUTES: { display: 'minute(s)', value: 'minutes' },
  SECONDS: { display: 'second(s)', value: 'seconds' }
}

export const dateTimeUnits = Object.assign({}, dateUnits, timeUnits)

export class RelativeTimeValue extends AbstractConditionValue {
  constructor (timePeriod, timeUnit, direction, timeOnly = false) {
    super('RelativeTime', obj => RelativeTimeValue.from(obj))
    if (typeof timePeriod !== 'string') {
      throw Error(`time period ${timePeriod} is not valid`)
    }
    if (!Object.values(dateTimeUnits).map(it => it.value).includes(timeUnit)) {
      throw Error(`time unit ${timeUnit} is not valid`)
    }
    if (!Object.values(dateDirections).includes(direction)) {
      throw Error(`direction ${direction} is not valid`)
    }
    this.timePeriod = timePeriod
    this.timeUnit = timeUnit
    this.direction = direction
    this.timeOnly = timeOnly
  }

  toPresentationString () {
    return `${this.timePeriod} ${this.timeUnit} ${this.direction}`
  }

  toExpression () {
    const timePeriod = this.direction === dateDirections.PAST ? 0 - Number(this.timePeriod) : this.timePeriod
    return this.timeOnly ? `timeForComparison(${timePeriod}, '${this.timeUnit}')` : `dateForComparison(${timePeriod}, '${this.timeUnit}')`
  }

  static from (obj) {
    return new RelativeTimeValue(obj.timePeriod, obj.timeUnit, obj.direction, obj.timeOnly)
  }

  clone () {
    return RelativeTimeValue.from(this)
  }
}

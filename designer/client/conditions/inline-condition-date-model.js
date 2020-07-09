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

export class TimeShiftValue {
  constructor (timePeriod, timeUnit, direction, timeOnly = false) {
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
    return new TimeShiftValue(obj.timePeriod, obj.timeUnit, obj.direction, obj.timeOnly)
  }

  clone () {
    return TimeShiftValue.from(this)
  }
}

export function timeShift (pastOperator, futureOperator) {
  return {
    expression: (field, value) => {
      if (value instanceof TimeShiftValue) {
        const operator = value.direction === dateDirections.PAST ? pastOperator : futureOperator
        return `${field.name} ${operator} ${value.toExpression()}`
      }
      throw Error('time shift requires a TimeShiftValue')
    }
  }
}

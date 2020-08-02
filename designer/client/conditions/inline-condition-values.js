const conditionValueFactories = {}

export class AbstractConditionValue {
  constructor (type, factory) {
    if (new.target === AbstractConditionValue) {
      throw new TypeError('Cannot construct ConditionValue instances directly')
    }
    if (!conditionValueFactories[type]) {
      conditionValueFactories[type] = factory
    }
    this.type = type
  }
  toPresentationString () {}
  toExpression () {}
}

export class ConditionValue extends AbstractConditionValue {
  constructor (value, display) {
    super('Value', obj => ConditionValue.from(obj))
    if (!value || typeof value !== 'string') {
      throw Error(`value ${value} is not valid`)
    }
    if (display && typeof display !== 'string') {
      throw Error(`display ${display} is not valid`)
    }
    this.value = value
    this.display = display || value
  }

  toPresentationString () {
    return this.display
  }

  toExpression () {
    return this.value
  }

  static from (obj) {
    return new ConditionValue(obj.value, obj.display)
  }

  clone () {
    return ConditionValue.from(this)
  }
}

export function valueFrom (obj) {
  return conditionValueFactories[obj.type](obj)
}

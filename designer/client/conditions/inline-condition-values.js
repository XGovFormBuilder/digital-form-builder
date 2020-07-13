const conditionValueFactories = {}

export class ConditionValue {
  constructor (type, factory) {
    if (new.target === ConditionValue) {
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

export class Value extends ConditionValue {
  constructor (value, display) {
    super('Value', obj => Value.from(obj))
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
    return new Value(obj.value, obj.display)
  }

  clone () {
    return Value.from(this)
  }
}

export function valueFrom (obj) {
  return conditionValueFactories[obj.type](obj)
}

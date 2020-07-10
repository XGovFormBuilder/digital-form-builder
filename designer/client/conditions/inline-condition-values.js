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

export function valueFrom (obj) {
  return conditionValueFactories[obj.type](obj)
}

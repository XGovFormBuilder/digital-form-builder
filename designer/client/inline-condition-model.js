const coordinators = {
  AND: 'and',
  OR: 'or'
}

class ConditionsModel {
  constructor () {
    this.conditions = []
  }

  add (condition) {
    const coordinatorExpected = this.conditions.length !== 0
    if (condition.coordinator && !coordinatorExpected) {
      throw Error('No coordinator allowed on the first condition')
    } else if (!condition.coordinator && coordinatorExpected) {
      throw Error('Coordinator must be present on subsequent conditions')
    }
    this.conditions.push(condition)
    return this
  }

  asArray () {
    return [...this.conditions]
  }

  hasConditions () {
    return this.conditions.length > 0
  }

  toPresentationString () {
    const hasOr = this.conditions.find(condition => condition.coordinator === coordinators.OR)
    return this.conditions.map((condition, index, conditions) => {
      const nextCoordinator = conditions.length > index + 1 ? conditions[index + 1].coordinator : undefined

      if (hasOr) {
        if (nextCoordinator === coordinators.AND && condition.coordinator !== coordinators.AND) {
          return `${condition.coordinatorString()}(${condition.conditionString()}`
        } else if (condition.coordinator === coordinators.AND && nextCoordinator !== coordinators.AND) {
          return `${condition.coordinatorString()}${condition.conditionString()})`
        }
      }
      return `${condition.coordinatorString()}${condition.conditionString()}`
    }).join(' ')
  }
}

class Condition {
  constructor (field, operator, value, coordinator) {
    if (!field || !(field instanceof Field)) {
      throw Error(`field ${field} is not a valid Field object`)
    }
    if (!operator || typeof operator !== 'string') {
      throw Error(`operator ${operator} is not a valid operator`)
    }
    if (!value || !(value instanceof Value)) {
      throw Error(`field ${field} is not a valid Field object`)
    }
    if (coordinator && !Object.values(coordinators).includes(coordinator)) {
      throw Error(`coordinator ${coordinator} is not a valid coordinator`)
    }
    this.field = field
    this.operator = operator
    this.value = value
    this.coordinator = coordinator
  }

  conditionString () {
    return `${this.field.display} ${this.operator} ${this.value.display}`
  }

  coordinatorString () {
    return this.coordinator ? `${this.coordinator} ` : ''
  }
}

class Field {
  constructor (name, display) {
    if (!name || typeof name !== 'string') {
      throw Error(`name ${name} is not valid`)
    }
    if (!display || typeof display !== 'string') {
      throw Error(`display ${display} is not valid`)
    }
    this.name = name
    this.display = display
  }

  static from (obj) {
    return new Field(obj.name, obj.display)
  }
}

class Value {
  constructor (value, display) {
    if (!value || typeof value !== 'string') {
      throw Error(`value ${value} is not valid`)
    }
    if (display && typeof display !== 'string') {
      throw Error(`display ${display} is not valid`)
    }
    this.value = value
    this.display = display || value
  }

  static from (obj) {
    return new Value(obj.value, obj.display)
  }
}

export { Condition, ConditionsModel, Field, Value }

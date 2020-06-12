const coordinators = {
  AND: 'and',
  OR: 'or'
}

export class ConditionsModel {
  constructor () {
    this.conditions = []
    this.groups = []
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
    return this._applyGroups().map(condition => condition.toPresentationString()).join(' ')
  }

  _applyGroups () {
    const groupDefs = this.groups.length > 0 ? this.groups : this._autoGroupDefs()
    return this.conditions.reduce((groups, condition, index, conditions) => {
      const groupDef = groupDefs.find(groupDef => groupDef.contains(index))
      if (groupDef) {
        if (groupDef.startsWith(index)) {
          const groupConditions = groupDef.applyTo(conditions)
          groups.push(new ConditionGroup(groupConditions))
        }
      } else {
        groups.push(condition)
      }
      return groups
    }, [])
  }

  _autoGroupDefs () {
    const orPositions = []
    this.conditions.forEach((condition, index) => {
      if (condition.coordinator === 'or') {
        orPositions.push(index)
      }
    })
    const hasAnd = this.conditions.find(condition => condition.coordinator === coordinators.AND)
    const hasOr = orPositions.length > 0
    if (hasAnd && hasOr) {
      let start = 0
      const groupDefs = []
      orPositions.forEach((position, index) => {
        if (start < position - 1) {
          groupDefs.push(new GroupDef(start, position - 1))
        } else {
          const thisIsTheLastOr = orPositions.length === index + 1
          const thereAreMoreConditions = this.conditions.length - 1 > position
          if (thisIsTheLastOr && thereAreMoreConditions) {
            groupDefs.push(new GroupDef(position, this.conditions.length - 1))
          }
        }
        start = position
      })
      return groupDefs
    }
    return []
  }
}

class GroupDef {
  constructor (first, last) {
    if (typeof first !== 'number' || typeof last !== 'number') {
      throw Error(`Cannot construct a group from ${first} and ${last}`)
    }
    this.first = first
    this.last = last
  }

  contains (index) {
    return this.first <= index && this.last >= index
  }

  startsWith (index) {
    return this.first === index
  }

  applyTo (conditions) {
    return [...conditions].splice(this.first, (this.last - this.first) + 1)
  }
}

class ConditionGroup {
  constructor (conditions) {
    if (!Array.isArray(conditions) || conditions.length < 2) {
      throw Error(`Cannot construct a condition group from ${conditions}`)
    }
    this.conditions = conditions
  }

  toPresentationString () {
    const copy = [...this.conditions]
    copy.splice(0, 1)
    return `${this.conditions[0].coordinatorString()}(${this.conditions[0].conditionString()} ${copy.map(condition => condition.toPresentationString()).join(' ')})`
  }
}

export class Condition {
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

  toPresentationString () {
    return `${this.coordinatorString()}${this.conditionString()}`
  }

  conditionString () {
    return `${this.field.display} ${this.operator} ${this.value.display}`
  }

  coordinatorString () {
    return this.coordinator ? `${this.coordinator} ` : ''
  }
}

export class Field {
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

export class Value {
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

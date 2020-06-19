const coordinators = {
  AND: 'and',
  OR: 'or'
}

export class ConditionsModel {
  #groupedConditions
  #userGroupedConditions
  #conditionName

  constructor () {
    this.#groupedConditions = []
    this.#userGroupedConditions = []
  }

  clone () {
    const toReturn = new ConditionsModel()
    toReturn.#groupedConditions = this.#groupedConditions.map(it => it.clone())
    toReturn.#userGroupedConditions = this.#userGroupedConditions.map(it => it.clone())
    toReturn.#conditionName = this.#conditionName
    return toReturn
  }

  name (name) {
    this.#conditionName = name || this.#conditionName
    return this.#conditionName
  }

  add (condition) {
    const coordinatorExpected = this.#userGroupedConditions.length !== 0
    if (condition.getCoordinator() && !coordinatorExpected) {
      throw Error('No coordinator allowed on the first condition')
    } else if (!condition.getCoordinator() && coordinatorExpected) {
      throw Error('Coordinator must be present on subsequent conditions')
    }
    this.#userGroupedConditions.push(condition)
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    return this
  }

  replace (index, condition) {
    const coordinatorExpected = index !== 0
    if (condition.getCoordinator() && !coordinatorExpected) {
      throw Error('No coordinator allowed on the first condition')
    } else if (!condition.getCoordinator() && coordinatorExpected) {
      throw Error('Coordinator must be present on subsequent conditions')
    } else if (index >= this.#userGroupedConditions.length) {
      throw Error(`Cannot replace condition ${index} as no such condition exists`)
    }
    this.#userGroupedConditions.splice(index, 1, condition)
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    return this
  }

  remove (indexes) {
    this.#userGroupedConditions = this.#userGroupedConditions.filter((condition, index) => !indexes.includes(index))
      .map((condition, index) => index === 0 ? condition.asFirstCondition() : condition)

    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    return this
  }

  addGroups (groupDefs) {
    this.#userGroupedConditions = this._group(this.#userGroupedConditions, groupDefs)
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    return this
  }

  splitGroup (index) {
    this.#userGroupedConditions = this._ungroup(this.#userGroupedConditions, index)
    this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    return this
  }

  moveEarlier (index) {
    if (index > 0 && index < (this.#userGroupedConditions.length)) {
      this.#userGroupedConditions.splice(index - 1, 0, this.#userGroupedConditions.splice(index, 1)[0])
      if (index === 1) {
        this.switchCoordinators()
      }
      this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    }
    return this
  }

  moveLater (index) {
    if (index >= 0 && index < (this.#userGroupedConditions.length - 1)) {
      this.#userGroupedConditions.splice(index + 1, 0, this.#userGroupedConditions.splice(index, 1)[0])
      if (index === 0) {
        this.switchCoordinators()
      }
      this.#groupedConditions = this._applyGroups(this.#userGroupedConditions)
    }
    return this
  }

  switchCoordinators () {
    this.#userGroupedConditions[1].setCoordinator(this.#userGroupedConditions[0].getCoordinator())
    this.#userGroupedConditions[0].setCoordinator(undefined)
  }

  get asPerUserGroupings () {
    return [...this.#userGroupedConditions]
  }

  get hasConditions () {
    return this.#userGroupedConditions.length > 0
  }

  get lastIndex () {
    return this.#userGroupedConditions.length - 1
  }

  toPresentationString () {
    return this.#groupedConditions.map(condition => condition.toPresentationString()).join(' ')
  }

  _applyGroups (userGroupedConditions) {
    const correctedUserGroups = userGroupedConditions
      .map(condition =>
        condition instanceof ConditionGroup && condition.conditions.length > 2
          ? new ConditionGroup(this._group(condition.conditions, this._autoGroupDefs(condition.conditions)))
          : condition
      )
    return this._group(correctedUserGroups, this._autoGroupDefs(correctedUserGroups))
  }

  _group (conditions, groupDefs) {
    return conditions.reduce((groups, condition, index, conditions) => {
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

  _ungroup (conditions, splitIndex) {
    if (conditions[splitIndex].isGroup()) {
      const copy = [...conditions]
      copy.splice(splitIndex, 1, ...(conditions[splitIndex].conditions))
      return copy
    }
    return conditions
  }

  _autoGroupDefs (conditions) {
    const orPositions = []
    conditions.forEach((condition, index) => {
      if (condition.getCoordinator() === coordinators.OR) {
        orPositions.push(index)
      }
    })
    const hasAnd = !!conditions.find(condition => condition.getCoordinator() === coordinators.AND)
    const hasOr = orPositions.length > 0
    if (hasAnd && hasOr) {
      let start = 0
      const groupDefs = []
      orPositions.forEach((position, index) => {
        if (start < position - 1) {
          groupDefs.push(new GroupDef(start, position - 1))
        }
        const thisIsTheLastOr = orPositions.length === index + 1
        const thereAreMoreConditions = conditions.length - 1 > position
        if (thisIsTheLastOr && thereAreMoreConditions) {
          groupDefs.push(new GroupDef(position, conditions.length - 1))
        }
        start = position
      })
      return groupDefs
    }
    return []
  }
}

export class GroupDef {
  constructor (first, last) {
    if (typeof first !== 'number' || typeof last !== 'number') {
      throw Error(`Cannot construct a group from ${first} and ${last}`)
    } else if (first >= last) {
      throw Error(`Last (${last}) must be greater than first (${first})`)
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
    return `${this.coordinatorString()}${this.conditionString()}`
  }

  coordinatorString () {
    return this.conditions[0].coordinatorString()
  }

  conditionString () {
    const copy = [...this.conditions]
    copy.splice(0, 1)
    return `(${this.conditions[0].conditionString()} ${copy.map(condition => condition.toPresentationString()).join(' ')})`
  }

  asFirstCondition () {
    this.conditions[0].asFirstCondition()
    return this
  }

  getCoordinator () {
    return this.conditions[0].getCoordinator()
  }

  setCoordinator (coordinator) {
    this.conditions[0].setCoordinator(coordinator)
  }

  isGroup () {
    return true
  }

  clone () {
    return new ConditionGroup(this.conditions.map(condition => condition.clone()))
  }
}

export class Condition {
  constructor (field, operator, value, coordinator) {
    if (!(field instanceof Field)) {
      throw Error(`field ${field} is not a valid Field object`)
    }
    if (typeof operator !== 'string') {
      throw Error(`operator ${operator} is not a valid operator`)
    }
    if (!(value instanceof Value)) {
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

  getCoordinator () {
    return this.coordinator
  }

  setCoordinator (coordinator) {
    this.coordinator = coordinator
  }

  asFirstCondition () {
    delete this.coordinator
    return this
  }

  isGroup () {
    return false
  }

  clone () {
    return new Condition(Field.from(this.field), this.operator, Value.from(this.value), this.coordinator)
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

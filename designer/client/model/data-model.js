import { serialiseAndDeserialise, clone } from '../helpers'

const yesNoList = {
  name: '__yesNo',
  title: 'Yes/No',
  type: 'boolean',
  items: [
    {
      text: 'Yes',
      value: true
    },
    {
      text: 'No',
      value: false
    }
  ]
}

export class Data {
  #conditions

  constructor (rawData) {
    const rawDataClone = Object.assign({}, rawData)
    delete rawDataClone.conditions
    Object.assign(this, rawDataClone)
    this.#conditions = (rawData.conditions || []).map(it => new Condition(it))
  }

  allInputs () {
    return (this.pages || []).flatMap(page => (page.components || []).filter(component => component.name).map(it => new Input(it, page)))
  }

  inputsAccessibleAt (path) {
    const precedingPages = this._allPathsLeadingTo(path)
    return this.allInputs().filter(it => precedingPages.includes(it.page.path) || path === it.page.path)
  }

  findPage (path) {
    return this.getPages().find(p => p.path === path)
  }

  getPages () {
    return this.pages || []
  }

  listFor (input) {
    return (this.lists || []).find(it => it.name === (input.options || {}).list) || (input.type === 'YesNoField' ? yesNoList : undefined)
  }

  _allPathsLeadingTo (path) {
    return (this.pages || []).filter(page => page.next && page.next.find(next => next.path === path))
      .flatMap(page => [page.path].concat(this._allPathsLeadingTo(page.path)))
  }

  addCondition (name, displayName, value) {
    this.#conditions = this.#conditions || []
    if (this.#conditions.find(it => it.name === name)) {
      throw Error(`A condition already exists with name ${name}`)
    }
    this.#conditions.push({ name, displayName, value })
  }

  updateCondition (name, displayName, value) {
    const condition = this.#conditions.find(condition => condition.name === name)
    if (condition) {
      condition.displayName = displayName
      condition.value = value
    }
  }

  removeCondition (name) {
    const condition = this.findCondition(name)
    if (condition) {
      this.#conditions.splice(this.#conditions.findIndex(condition => condition.name === name), 1)
      // Update any references to the condition
      this.getPages().forEach(p => {
        Array.isArray(p.next) && p.next.forEach(n => {
          if (n.if === name) {
            delete n.if
          }
        })
      })
    }
  }

  findCondition (name) {
    return this.conditions.find(condition => condition.name === name)
  }

  get hasConditions () {
    return this.conditions.length > 0
  }

  get conditions () {
    return this.#conditions.map(it => clone(it))
  }

  clone () {
    return new Data(JSON.parse(this.toJson()))
  }

  toJson () {
    const toSerialize = serialiseAndDeserialise(this)
    toSerialize.conditions = this.conditions
    return JSON.stringify(toSerialize)
  }
}

class Input {
  constructor (rawData, page) {
    Object.assign(this, rawData)
    const myPage = clone(page)
    delete myPage.components
    this.page = myPage
    this.propertyPath = page.section ? `${page.section}.${this.name}` : this.name
  }
}

class Condition {
  constructor (rawData) {
    Object.assign(this, rawData)
    this.displayName = rawData.displayName || rawData.name
  }
}

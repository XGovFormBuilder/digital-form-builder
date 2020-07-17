import { clone } from '../helpers'

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
  /* eslint-disable-next-line */
  #listInputsFor(page, input) {
    const list = this.listFor(input);
    return list ? list.items.flatMap(listItem =>listItem.conditional?.components
        ?.filter(it => it.name)
        ?.map(it => new Input(it, page, listItem.text))??[]) : []
  }

  allInputs () {
    const inputs = (this.pages || [])
      .flatMap(page => (page.components || [])
        .filter(component => component.name)
        .flatMap(it => [new Input(it, page)].concat(this.#listInputsFor(page, it)))
      )
    const names = new Set()
    return inputs.filter(input => {
      const isPresent = !names.has(input.propertyPath)
      names.add(input.propertyPath)
      return isPresent
    })
  }

  inputsAccessibleAt (path) {
    const precedingPages = this._allPathsLeadingTo(path)
    return this.allInputs().filter(it => precedingPages.includes(it.page.path) || path === it.page.path)
  }

  findPage (path) {
    return this.getPages().find(p => p.path === path)
  }

  addLink (from, to, condition) {
    const fromPage = this.pages.find(p => p.path === from)
    const toPage = this.pages.find(p => p.path === to)
    if (fromPage && toPage) {
      const existingLink = fromPage.next?.find(it => it.path === to)
      if (!existingLink) {
        const link = { path: to }
        if (condition) {
          link.condition = condition
        }

        fromPage.next = fromPage.next || []
        fromPage.next.push(link)
      }
    }
    return this
  }

  updateLink (from, to, condition) {
    const fromPage = this.findPage(from)
    const toPage = this.pages.find(p => p.path === to)
    if (fromPage && toPage) {
      const existingLink = fromPage.next?.find(it => it.path === to)
      if (existingLink) {
        if (condition) {
          existingLink.condition = condition
        } else {
          delete existingLink.condition
        }
      }
    }
    return this
  }

  addPage (page) {
    this.pages = this.pages || []
    this.pages.push(page)
    return this
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
    return this
  }

  updateCondition (name, displayName, value) {
    const condition = this.#conditions.find(condition => condition.name === name)
    if (condition) {
      condition.displayName = displayName
      condition.value = value
    }
    return this
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
    return this
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
    return new Data(this._exposePrivateFields())
  }

  toJSON () {
    const withoutFunctions = Object.filter(this._exposePrivateFields(), field => typeof field !== 'function')
    return Object.assign({}, withoutFunctions)
  }

  _exposePrivateFields () {
    const toSerialize = Object.assign({}, this)
    toSerialize.conditions = this.conditions.map(it => clone(it))
    return toSerialize
  }
}

Object.filter = function (obj, predicate) {
  const result = {}
  let key
  for (key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key])) {
      result[key] = obj[key]
    }
  }
  return result
}

class Input {
  #parentItemName

  constructor (rawData, page, parentItemName) {
    Object.assign(this, rawData)
    const myPage = clone(page)
    delete myPage.components
    this.page = myPage
    this.propertyPath = page.section ? `${page.section}.${this.name}` : this.name
    this.#parentItemName = parentItemName
  }

  get displayName () {
    const titleWithContext = this.#parentItemName ? `${this.title} under ${this.#parentItemName}` : this.title
    return this.page.section ? `${titleWithContext} in ${this.page.section}` : titleWithContext
  }
}

class Condition {
  constructor (rawData) {
    Object.assign(this, rawData)
    this.displayName = rawData.displayName || rawData.name
  }
}

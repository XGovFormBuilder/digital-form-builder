import { yesNoValues, valuesFrom } from './values/values'
import { DataModel } from './data-model-interface'

const { clone } = require('./helpers')
const { ConditionsModel } = require('./conditions/inline-condition-model')

class Data implements DataModel {
  /**
   * FIXME: Ideally I'd have made this part of feedback-context-info.js and moved that inside model
   * That, however uses relative-url.js, which utilises a URL and the shims for that don't work
   */
  static FEEDBACK_CONTEXT_ITEMS = [
    { key: 'feedbackContextInfo_formTitle', display: 'Feedback source form name', get: contextInfo => contextInfo.formTitle },
    { key: 'feedbackContextInfo_pageTitle', display: 'Feedback source page title', get: contextInfo => contextInfo.pageTitle },
    { key: 'feedbackContextInfo_url', display: 'Feedback source url', get: contextInfo => contextInfo.url }
  ]

  #conditions
  #name
  #feedback

  constructor (rawData) {
    const rawDataClone = rawData instanceof Data ? rawData._exposePrivateFields() : Object.assign({}, rawData)
    this.#conditions = (rawDataClone.conditions || []).map(it => new Condition(it))
    this.#feedback = rawDataClone.feedback
    delete rawDataClone.conditions
    delete rawDataClone.feedback
    Object.assign(this, rawDataClone)
  }

  /* eslint-disable-next-line */
  #listInputsFor(page, input) {
    const values = this.valuesFor(input);
    return values ? values.items.flatMap(listItem => listItem.children
        ?.filter(it => it.name)
        ?.map(it => new Input(it, page, {parentItemName: listItem.display}))??[]) : []
  }

  allInputs () {
    const inputs = (this.pages || [])
      .flatMap(page => (page.components || [])
        .filter(component => component.name)
        .flatMap(it => [new Input(it, page)].concat(this.#listInputsFor(page, it)))
      )
    if (this.feedbackForm) {
      const startPage = this.findPage(this.startPage)
      const options = { ignoreSection: true }
      Data.FEEDBACK_CONTEXT_ITEMS.forEach(it => {
        inputs.push(new Input({ type: 'TextField', title: it.display, name: it.key }, startPage, options))
      })
    }
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

  findList (listName) {
    return (this.lists ?? []).find(list => list.name === listName)
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

  addSection (name, title) {
    this.sections = this.sections || []
    if (!this.sections.find(s => s.name === name)) {
      this.sections.push({ name, title })
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

  updateLinksTo = function (oldPath, newPath) {
    this.pages.filter(p => p.next && p.next.find(link => link.path === oldPath))
      .forEach(page => {
        page.next.find(link => link.path === oldPath).path = newPath
      })
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

  valuesFor (input) {
    if (input.type === 'YesNoField') {
      return yesNoValues
    }
    if (input.values) {
      return valuesFrom(input.values, this)
    }
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

  addComponent (pagePath, component) {
    const page = this.findPage(pagePath)
    if (page) {
      page.components = page.components || []
      page.components.push(component)
    } else {
      throw Error(`No page exists with path ${pagePath}`)
    }
    return this
  }

  updateComponent (pagePath, componentName, component) {
    const page = this.findPage(pagePath)
    if (page) {
      page.components = page.components || []
      const index = page.components.findIndex(it => it.name === componentName)
      if (index < 0) {
        throw Error(`No component exists with name ${componentName} with in page with path ${pagePath}`)
      }
      page.components[index] = component
    } else {
      throw Error(`No page exists with path ${pagePath}`)
    }
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

  get name () {
    return this.#name
  }

  set name (name) {
    if (typeof name === 'string' || name === undefined) {
      this.#name = name
    } else {
      throw Error('name must be a string')
    }
  }

  get feedbackForm () {
    return this.#feedback?.feedbackForm ?? false
  }

  set feedbackForm (feedbackForm) {
    if (typeof feedbackForm === 'boolean') {
      this.#feedback = this.#feedback || {}
      this.#feedback.feedbackForm = feedbackForm
    } else {
      throw Error('feedbackForm must be a boolean')
    }
  }

  setFeedbackUrl (feedbackUrl) {
    this.#setFeedbackUrl(feedbackUrl)
  }

  get feedbackUrl () {
    return this.#feedback?.url
  }

  /* eslint-disable-next-line */
  #setFeedbackUrl (feedbackUrl) {
    if(feedbackUrl && this.feedbackForm) {
      throw Error('Cannot set a feedback url on a feedback form')
    }
    if (typeof feedbackUrl === 'string' || feedbackUrl === undefined) {
      this.#feedback = this.#feedback || {}
      this.#feedback.url = feedbackUrl
    } else {
      throw Error('feedbackUrl must be a string')
    }
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
    toSerialize.name = this.name
    toSerialize.feedback = this.#feedback
    return toSerialize
  }
}

Object.filter = function (obj, predicate) {
  const result = {}
  let key
  for (key in obj) {
    if (obj[key] && predicate(obj[key])) {
      result[key] = obj[key]
    }
  }
  return result
}

class Input {
  #parentItemName

  constructor (rawData, page, options = {}) {
    Object.assign(this, rawData)
    const myPage = clone(page)
    delete myPage.components
    this.page = myPage
    this.propertyPath = !options.ignoreSection && page.section ? `${page.section}.${this.name}` : this.name
    this.#parentItemName = options.parentItemName
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

  get expression () {
    if (typeof this.value === 'string') {
      return this.value
    } else {
      return ConditionsModel.from(this.value).toExpression()
    }
  }

  clone () {
    return new Condition(this)
  }
}

module.exports.Data = Data
module.exports.Condition = Condition

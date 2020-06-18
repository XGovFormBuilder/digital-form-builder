const joi = require('joi')
const { proceed } = require('./helpers')
const { ComponentCollection } = require('../components')
import { merge, reach } from '@hapi/hoek'
import * as querystring from 'querystring'

const FORM_SCHEMA = Symbol('FORM_SCHEMA')
const STATE_SCHEMA = Symbol('STATE_SCHEMA')

class Page {
  constructor (model, pageDef) {
    const { def } = model

    // Properties
    this.def = def
    this.name = def.name
    this.model = model
    this.pageDef = pageDef
    this.path = pageDef.path
    this.title = pageDef.title
    this.condition = pageDef.condition
    this.repeatField = pageDef.repeatField

    // Resolve section
    this.section = pageDef.section &&
      model.sections.find(s => s.name === pageDef.section)

    // Components collection
    const components = new ComponentCollection(pageDef.components, model)
    const conditionalFormComponents = components.formItems.filter(c => c.conditionalComponents)

    this.components = components
    this.hasFormComponents = !!components.formItems.length
    this.hasConditionalFormComponents = !!conditionalFormComponents.length

    this[FORM_SCHEMA] = this.components.formSchema
    this[STATE_SCHEMA] = this.components.stateSchema
  }

  getViewModel (formData, iteration, errors) {
    let showTitle = true
    let pageTitle = this.title
    let sectionTitle = this.section && this.section.title
    if (sectionTitle && iteration !== undefined) {
      sectionTitle = `${sectionTitle} ${iteration}`
    }
    const components = this.components.getViewModel(formData, errors)

    const formComponents = components.filter(c => c.isFormComponent)
    const hasSingleFormComponent = formComponents.length === 1
    const singleFormComponent = hasSingleFormComponent && formComponents[0]
    const singleFormComponentIsFirst = singleFormComponent && singleFormComponent === components[0]

    if (hasSingleFormComponent && singleFormComponentIsFirst) {
      const label = singleFormComponent.model.label

      if (pageTitle) {
        label.text = pageTitle
      }

      if (this.section) {
        label.html =
          `<span class="govuk-caption-xl">${sectionTitle}</span> ${label.text}`
      }

      label.isPageHeading = true
      label.classes = 'govuk-label--xl'
      pageTitle = pageTitle || label.text
      showTitle = false
    }

    return { page: this, name: this.name, pageTitle, sectionTitle, showTitle, components, errors, isStartPage: false }
  }

  get hasNext () {
    return Array.isArray(this.pageDef.next) && this.pageDef.next.length > 0
  }

  get next () {
    return (this.pageDef.next || []).map(next => {
      const { path } = next
      const page = this.model.pages.find(page => {
        return path === page.path
      })
      if (!page) {
        return null
      }
      return {
        ...next,
        page
      }
    }).filter(v => !!v)
  }

  getNextPage (state, suppressRepetition = false) {
    if (this.repeatField && !suppressRepetition) {
      const requiredCount = reach(state, this.repeatField)
      const otherRepeatPagesInSection = this.model.pages.filter(page => page.section === this.section && page.repeatField)
      const sectionState = state[this.section.name] || {}
      if (Object.keys(sectionState[sectionState.length -1]).length === otherRepeatPagesInSection.length) { //iterated all pages at least once
        const lastIteration = sectionState[sectionState.length - 1]
        if (otherRepeatPagesInSection.length === this.#objLength(lastIteration)) { //this iteration is 'complete'
          if (sectionState.length < requiredCount) {
            return this.findPageByPath(Object.keys(lastIteration)[0])
          }
        }
      }
    }

    let defaultLink
    const nextLink = this.next.find(link => {
      const { condition } = link
      if (condition) {
        return this.model.conditions[condition] &&
          this.model.conditions[condition].fn(state)
      }
      defaultLink = link
      return false
    })
    return nextLink?.page ?? defaultLink?.page
  }

  getNext (state) {
    const nextPage = this.getNextPage(state)
    let query = { num: 0 }
    let queryString = ''
    if(nextPage.repeatField) {
      const requiredCount = reach(state, nextPage.repeatField)
      const otherRepeatPagesInSection = this.model.pages.filter(page => page.section === this.section && page.repeatField)
      const sectionState = state[nextPage.section.name]
      const lastInSection = sectionState?.[sectionState.length -1] ?? {}
      const isLastComplete =  Object.keys(lastInSection).length === otherRepeatPagesInSection.length
      query.num = sectionState ? isLastComplete ? this.#objLength(sectionState) + 1 : this.#objLength(sectionState): 1

      if(query.num <= requiredCount) {
        queryString = `?${querystring.encode(query)}`
      }
    }

    if (nextPage) {
      return `/${this.model.basePath || ''}${nextPage.path}${queryString}`
    }
    return this.defaultNextPath
  }

  getFormDataFromState (state, atIndex) {
    const pageState = this.section ? state[this.section.name] : state
    if (this.repeatField) {
      let repeatedPageState = pageState?.[atIndex ?? (pageState.length - 1 || 0)] ?? {}
      let values = Object.values(repeatedPageState)
      return this.components.getFormDataFromState(values.length ? values.reduce((acc, page) => ({...acc, ...page})) : {})
    }

    return this.components.getFormDataFromState(pageState || {})
  }

  getStateFromValidForm (formData) {
    return this.components.getStateFromValidForm(formData)
  }

  getErrors (validationResult) {
    if (validationResult && validationResult.error) {
      return {
        titleText: this.errorSummaryTitle,
        errorList: validationResult.error.details.map(err => {
          const name = err.path.map((name, index) => index > 0 ? `__${name}` : name).join('')

          return {
            path: err.path.join('.'),
            href: `#${name}`,
            name: name,
            text: err.message
          }
        })
      }
    }
  }

  validate (value, schema) {
    const result = joi.validate(value, schema, this.validationOptions)
    const errors = result.error ? this.getErrors(result) : null

    return { value: result.value, errors }
  }

  validateForm (payload) {
    return this.validate(payload, this.formSchema)
  }

  validateState (newState) {
    return this.validate(newState, this.stateSchema)
  }

  langFromRequest (request) {
    const lang = request.query.lang || request.yar.get('lang') || 'en'
    if (lang !== request.yar.get('lang')) {
      request.i18n.setLocale(lang)
      request.yar.set('lang', lang)
    }
    return request.yar.get('lang')
  }

  #objLength (object) {
    return Object.keys(object).length ?? 0
  }

  makeGetRouteHandler () {
    return async (request, h) => {
      const { cacheService } = request.services([])
      const lang = this.langFromRequest(request)
      const state = await cacheService.getState(request)
      const progress = state.progress || []
      const { num } = request.query
      const currentPath = `/${this.model.basePath}${this.path}${num ? '?num=' + num : ''}`
      const startPage = this.model.def.startPage
      const formData =  this.getFormDataFromState(state, num - 1)

      if (!this.model.options.previewMode && progress.length === 0 && this.path !== `${startPage}`) {
        return startPage.startsWith('http') ? h.redirect(startPage) : h.redirect(`/${this.model.basePath}${startPage}`)
      }

      formData.lang = lang
      const { originalFilenames } = state
      if (originalFilenames) {
        Object.entries(formData).forEach(([key, value]) => {
          if (value && value === (originalFilenames[key] || {}).location) {
            formData[key] = originalFilenames[key].originalFilename
          }
        })
      }

      const viewModel = this.getViewModel(formData, num)
      viewModel.startPage = startPage.startsWith('http') ? h.redirect(startPage) : h.redirect(`/${this.model.basePath}${startPage}`)
      viewModel.currentPath = `${currentPath}${request.query.returnUrl ? '?returnUrl=' + request.query.returnUrl : ''}`
      viewModel.components = viewModel.components.filter(component => {
        if ((component.model.content || component.type === 'Details') && component.model.condition) {
          const condition = this.model.conditions[component.model.condition]
          return condition.fn(state)
        }
        return true
      })
      viewModel.components = viewModel.components.map(component => {
        const evaluatedComponent = component
        const content = evaluatedComponent.model.content
        if (content instanceof Array) {
          evaluatedComponent.model.content = content.filter(item => item.condition ? this.model.conditions[item.condition].fn(state) : true)
        }
        // apply condition to items for radios, checkboxes etc
        const items = evaluatedComponent.model.items
        if (items instanceof Array) {
          evaluatedComponent.model.items = items.filter(item => item.condition ? this.model.conditions[item.condition].fn(state) : true)
        }
        return evaluatedComponent
      })

      const lastVisited = progress[progress.length - 1]
      if (!lastVisited || !lastVisited.startsWith(currentPath)) {
        if (progress[progress.length - 2] === currentPath) {
          progress.pop()
        } else {
          progress.push(currentPath)
        }
      }

      await cacheService.mergeState(request, { progress })
      viewModel.backLink = progress[progress.length - 2]
      return h.view(this.viewName, viewModel)
    }
  }

  makePostRouteHandler () {
    return async (request, h) => {
      const { cacheService } = request.services([])
      const hasFilesizeError = request.payload === null
      const preHandlerErrors = request.pre.errors
      const payload = request.payload || {}
      const formResult = this.validateForm(payload)
      const state = await cacheService.getState(request)
      const originalFilenames = (state || {}).originalFilenames || {}
      const fileFields = this.getViewModel(formResult).components.filter(component => component.type === 'FileUploadField').map(component => component.model)
      const progress = state.progress || []
      const { num } = request.query

      // TODO:- Refactor this into a validation method
      if (hasFilesizeError) {
        const reformattedErrors = fileFields.map(field => {
          return {
            path: field.name, href: `#${field.name}`, name: field.name, text: 'The file you uploaded was too big'
          }
        })

        formResult.errors = Object.is(formResult.errors, null) ? { titleText: 'Fix the following errors' } : formResult.errors
        formResult.errors.errorList = reformattedErrors
      }

      /**
       * @code other file related errors.. assuming file fields will be on their own page. This will replace all other errors from the page if not..
       */
      if (preHandlerErrors) {
        const reformattedErrors = []
        preHandlerErrors.forEach(error => {
          const reformatted = error
          const fieldMeta = fileFields.find(field => field.id === error.name)
          if (typeof reformatted.text === 'string') {
            /**
             * @code if it's not a string it's probably going to be a stack trace.. don't want to show that to the user. A problem for another day.
             */
            reformatted.text = reformatted.text.replace(/%s/, fieldMeta ? fieldMeta.label.text.trim() : 'the file')
            reformattedErrors.push(reformatted)
          }
        })

        formResult.errors = Object.is(formResult.errors, null) ? { titleText: 'Fix the following errors' } : formResult.errors
        formResult.errors.errorList = reformattedErrors
      }

      Object.entries(payload).forEach(([key, value]) => {
        if (value && value === (originalFilenames[key] || {}).location) {
          payload[key] = originalFilenames[key].originalFilename
        }
      })

      if (formResult.errors) {
        const viewModel = this.getViewModel(payload, num, formResult.errors)
        viewModel.backLink = progress[progress.length - 2]
        return h.view(this.viewName, viewModel)
      }

      const newState = this.getStateFromValidForm(formResult.value)
      const stateResult = this.validateState(newState)

      if (stateResult.errors) {
        const viewModel = this.getViewModel(payload, num, stateResult.errors)
        viewModel.backLink = progress[progress.length - 2]
        return h.view(this.viewName, viewModel)
      }


      let update = this.getPartialMergeState(stateResult.value)
      if (this.repeatField) {
        let updateValue = {[this.path]: update[this.section.name]}
        let sectionState = state[this.section.name]
        if (!sectionState) {
          update = { [this.section.name]: [updateValue] }
        } else if(!sectionState[num-1]) {
          sectionState.push(updateValue)
          update = { [this.section.name]: sectionState }

        } else {
          sectionState[num-1] = merge(sectionState[num-1] ?? {}, updateValue)
          update = { [this.section.name]: sectionState }
        }
      }
      const savedState = await cacheService.mergeState(request, update, !!this.repeatField)
      return this.proceed(request, h, savedState)
    }
  }

  makeGetRoute (getState) {
    return {
      method: 'get',
      path: this.path,
      options: this.getRouteOptions,
      handler: this.makeGetRouteHandler(getState)
    }
  }

  makePostRoute (mergeState) {
    return {
      method: 'post',
      path: this.path,
      options: this.postRouteOptions,
      handler: this.makePostRouteHandler(mergeState)
    }
  }

  findPageByPath (path) {
    return this.model.pages.find(page => page.path === path)
  }

  proceed (request, h, state) {
    return proceed(request, h, this.getNext(state))
  }

  getPartialMergeState (value) {
    return this.section ? { [this.section.name]: value } : value
  }

  localisedString (description, lang) {
    let string
    if (typeof description === 'string') {
      string = description
    } else {
      string = description[lang]
        ? description[lang]
        : description.en
    }
    return string
  }

  get viewName () { return 'index' }

  get defaultNextPath () { return `${this.model.basePath || ''}/summary` }

  get validationOptions () { return { abortEarly: false } }

  get conditionOptions () { return this.model.conditionOptions }

  get errorSummaryTitle () { return 'Fix the following errors' }

  get getRouteOptions () { return {} }

  get postRouteOptions () { return {} }

  get formSchema () { return this[FORM_SCHEMA] }

  set formSchema (value) { this[FORM_SCHEMA] = value }

  get stateSchema () { return this[STATE_SCHEMA] }

  set stateSchema (value) { this[STATE_SCHEMA] = value }
}

module.exports = Page

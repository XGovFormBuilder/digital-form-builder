const joi = require('joi')
const { proceed } = require('./helpers')
const { ComponentCollection } = require('./components')

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

    // Resolve section
    const section = pageDef.section &&
      model.sections.find(s => s.name === pageDef.section)

    this.section = section

    // Components collection
    const components = new ComponentCollection(pageDef.components, model)
    this.components = components
    const conditionalFormComponents = components.formItems.filter(c => c.conditionalComponents)
    // this.hasFormComponents = !!components.formItems.length
    this.hasFormComponents = true
    this.hasConditionalFormComponents = !!conditionalFormComponents.length

    // Schema
    this[FORM_SCHEMA] = this.components.formSchema
    this[STATE_SCHEMA] = this.components.stateSchema
  }

  getViewModel (formData, errors) {
    let showTitle = true
    let pageTitle = this.title
    const sectionTitle = this.section && this.section.title
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
          `<span class="govuk-caption-xl">${this.section.title}</span> ${label.text}`
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
    if (this.hasNext) {
      const nextPagePaths = this.pageDef.next.map(next => next.path)
      return this.def.pages.filter(page => {
        return nextPagePaths.includes(page.path)
      })
    }
  }

  getNext (state) {
    if (this.hasNext) {
      let nextPageWithoutCondition = this.next.find(page => {
        return !page.condition
      }) || this.defaultNextPath

      let nextPage = this.next.find(page => {
        const value = page.section ? state[page.section.name] : state

        let condition = this.model.conditions[page.condition]

        const isRequired = page.condition
          ? condition.fn(state)
          : false

        if (isRequired) {
          if (!page.hasFormComponents) {
            return true
          } else {
            const error = joi.validate(value || {}, page.stateSchema.required(), this.model.conditionOptions).error
            const isValid = !error

            return !isValid
          }
        }
      })
      let path = nextPage ? nextPage.path : nextPageWithoutCondition.path
      if (this.model.basePath) {
        path = `/${this.model.basePath}${path}`
      }
      return path
    } else {
      return this.defaultNextPath
    }
  }

  getFormDataFromState (state) {
    const pageState = this.section ? state[this.section.name] : state
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
    let lang = request.query.lang || request.yar.get('lang') || 'en'
    if (lang !== request.yar.get('lang')) {
      request.i18n.setLocale(lang)
      request.yar.set('lang', lang)
    }
    return request.yar.get('lang')
  }

  makeGetRouteHandler () {
    return async (request, h) => {
      const { cacheService } = request.services([])
      const lang = this.langFromRequest(request)
      const state = await cacheService.getState(request)
      const formData = this.getFormDataFromState(state)
      const progress = state.progress || []
      const currentPath = `/${this.model.basePath}${this.path}`
      const startPage = this.model.def.startPage
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
      const viewModel = this.getViewModel(formData)
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
        return evaluatedComponent
      })

      const lastVisited = progress[progress.length - 1]
      if (!lastVisited || !lastVisited.startsWith(currentPath)) {
        if ('back' in request.query) {
          progress.pop()
        } else {
          progress.push(`${currentPath}?back`)
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
      let hasFilesizeError = request.payload === null
      const preHandlerErrors = request.pre.errors
      const payload = request.payload || {}
      let formResult = this.validateForm(payload)
      const state = await cacheService.getState(request)
      let originalFilenames = (state || {}).originalFilenames || {}
      let fileFields = this.getViewModel(formResult).components.filter(component => component.type === 'FileUploadField').map(component => component.model)

      // TODO:- Refactor this into a validation method
      if (hasFilesizeError) {
        let reformattedErrors = fileFields.map(field => {
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
        let reformattedErrors = []
        preHandlerErrors.forEach(error => {
          let reformatted = error
          let fieldMeta = fileFields.find(field => field.id === error.name)
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
        return h.view(this.viewName, this.getViewModel(payload, formResult.errors))
      } else {
        const newState = this.getStateFromValidForm(formResult.value)
        const stateResult = this.validateState(newState)

        if (stateResult.errors) {
          return h.view(this.viewName, this.getViewModel(payload, stateResult.errors))
        } else {
          const update = this.getPartialMergeState(stateResult.value)
          const state = await cacheService.mergeState(request, update)
          return this.proceed(request, h, state)
        }
      }
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
        : description['en']
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

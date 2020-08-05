import SummaryPage from './summary'
import querystring from 'querystring'
import joi from 'joi'
const { clone, reach } = require('hoek')

class SummaryViewModel {
  constructor (pageTitle, model, state, section) {
    this.pageTitle = pageTitle

    const relevantPages = []
    const details = []

    const items = []
    let sectionState = section
      ? (state[section.name] || {})
      : state

    const sectionPages = model.pages.filter(page => page.pageDef.section === section.name)

    const repeatablePage = sectionPages.find(page => !!page.pageDef.repeatField)
    const isUnspecifiedRepeatable = sectionPages.find(page => !!page.isRepeatable)
    // Currently can't handle repeatable page outside a section.
    // In fact currently if any page in a section is repeatable it's expected that all pages in that section will be
    // repeatable
    if (section) {
      if (!state[section.name]) {
        state[section.name] = sectionState = []
      }
      // Make sure the right number of items
      if (repeatablePage) {
        const requiredIterations = reach(state, repeatablePage.repeatField)
        if (requiredIterations < sectionState.length) {
          state[section.name] = sectionState.slice(0, requiredIterations)
        } else {
          for (let i = sectionState.length; i < requiredIterations; i++) {
            sectionState.push({})
          }
        }
      }
    }

    sectionPages.forEach(page => {
      for (const component of page.components.formItems) {
        const item = this.Item(component, sectionState, page, model)
        items.push(item)
        if (component.items) {
          const selectedValue = sectionState[component.name]
          const selectedItem = component.items.filter(i => i.value === selectedValue)[0]
          if (selectedItem && selectedItem.conditional) {
            for (const cc of selectedItem.conditional.componentCollection.formItems) {
              const cItem = this.Item(cc, sectionState, page, model)
              items.push(cItem)
            }
          }
        }
      }
    })

    if (items.length > 0) {
      if (Array.isArray(sectionState)) {
        let repeatItems = []
        if (repeatablePage) {
          repeatItems = [...Array(reach(state, repeatablePage.repeatField))].map((x, i) => {
            return items.map(item => item[i])
          })
        } else if (isUnspecifiedRepeatable) {
          repeatItems = [...Array(sectionState.length)].map((x, i) => {
            return items.map(item => item[i])
          })
        }
        details.push({
          name: section?.name,
          title: section?.title,
          items: repeatItems
        })
      } else {
        details.push({
          name: section?.name,
          title: section?.title,
          items
        })
      }
    }

    const schema = model.makeFilteredSchema(sectionState, sectionPages)

    const collatedRepeatPagesState = clone(state)
    delete collatedRepeatPagesState.progress
    Object.entries(collatedRepeatPagesState).forEach(([key, section]) => {
      if (Array.isArray(section)) {
        collatedRepeatPagesState[key] = section.map(pages => Object.values(pages).reduce((acc, p) => ({ ...acc, ...p }), {}))
      }
    })

    const result = joi.validate(collatedRepeatPagesState, schema, { abortEarly: false, stripUnknown: true })

    if (result.error) {
      this.errors = result.error.details.map(err => {
        const name = err.path[err.path.length - 1]

        return {
          path: err.path.join('.'),
          name: name,
          message: err.message
        }
      })
      this.hasErrors = true

      details.forEach(detail => {
        const sectionErr = this.errors.find(err => err.path === detail.name)

        detail.items.forEach(item => {
          if (sectionErr) {
            item.inError = true
            return
          }

          const err = this.errors.find(err => err.path === (detail.name ? (detail.name + '.' + item.name) : item.name))
          if (err) {
            item.inError = true
          }
        })
      })
    }

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  notifyModel (model, outputConfiguration, state) {
  }

  emailModel (outputOptions) {
  }

  sheetsModel (model, outputConfiguration, state) { }

  toEnglish (localisableString) {

  }

  parseDataForWebhook (model, relevantPages, details) { }

  get validatedWebhookData () { }

  set webhookDataPaymentReference (paymentReference) { }

  get outputs () {
  }

  set outputs (value) {
  }

  get payApiKey () {
  }

  addDeclarationAsQuestion () {
    this._webhookData.questions.push({
      category: null,
      question: 'Declaration',
      fields: [
        {
          key: 'declaration',
          title: 'Declaration',
          type: 'boolean',
          answer: true
        }
      ]
    })
  }

  Item (component, sectionState, page, model, queryString = '') {
    const isRepeatable = !!page.repeatField || !!page.isRepeatable
    const query = {
      returnUrl: `/${model.basePath}/summary`
    }

    if (isRepeatable && Array.isArray(sectionState)) {
      return sectionState.map((state, i) => {
        const collated = Object.values(state).reduce((acc, p) => ({ ...acc, ...p }), {})
        const qs = `${querystring.encode({ ...query, num: i + 1 })}`
        return this.Item(component, collated, page, model, qs)
      })
    }

    return {
      name: component.name,
      path: component.path,
      label: component.localisedString(component.title),
      value: component.getDisplayStringFromState(sectionState),
      rawValue: sectionState[component.name],
      url: `/${model.basePath}${page.path}?${queryString || querystring.encode(query)}`,
      pageId: `/${model.basePath}${page.path}`,
      type: component.type,
      title: component.title,
      dataType: component.dataType
    }
  }
}

export default class MiniSummary extends SummaryPage {
  makeGetRouteHandler () {
    return async (request, h) => {
      const { cacheService } = request.services([])
      const model = this.model

      const state = await cacheService.getState(request)
      const viewModel = new SummaryViewModel(this.title, model, state, this.section)
      viewModel.currentPath = `/${model.basePath}${this.path}`

      if (viewModel.endPage) {
        return h.redirect(`/${model.basePath}${viewModel.endPage.path}`)
      }

      if (viewModel.errors) {
        const errorToFix = viewModel.errors[0]
        const { path } = errorToFix
        const parts = path.split('.')
        const section = parts[0]
        const property = parts.length > 1 ? parts[parts.length - 1] : null
        const iteration = parts.length === 3 ? Number(parts[1]) + 1 : null
        const pageWithError = model.pages.filter(page => {
          if (page.section && page.section.name === section) {
            let propertyMatches = true
            let conditionMatches = true
            if (property) {
              propertyMatches = page.components.formItems.filter(item => item.name === property).length > 0
            }
            if (propertyMatches && page.condition && model.conditions[page.condition]) {
              conditionMatches = model.conditions[page.condition].fn(state)
            }
            return propertyMatches && conditionMatches
          }
          return false
        })[0]
        if (pageWithError) {
          const query = {
            returnUrl: viewModel.currentPath,
            num: iteration && pageWithError.repeatField ? iteration : null
          }
          return h.redirect(`/${model.basePath}${pageWithError.path}?${querystring.encode(query)}`)
        }
      }

      const declarationError = request.yar.flash('declarationError')
      if (declarationError.length) {
        viewModel.declarationError = declarationError[0]
      }
      return h.view('summary', viewModel)
    }
  }
}

module.exports = MiniSummary

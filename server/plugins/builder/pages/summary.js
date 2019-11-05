const joi = require('joi')
const Page = require('.')
const shortid = require('shortid')
const { payRequest } = require('../../pay')
const { caseManagementPostRequest } = require('../../../lib/caseManagement')
const { serviceName } = require('./../../../config')
const { casebookSchema } = require('./../../../lib/caseManagementSchema')
class SummaryViewModel {
  constructor (model, state) {
    const details = []
    let relevantPages = []
      ;[undefined].concat(model.sections).forEach((section, index) => {
      const items = []
      const sectionState = section
        ? (state[section.name] || {})
        : state
      let isRelevantPage = true
      model.pages.forEach(page => {
        if (page.section === section) {
          page.components.formItems.forEach(component => {
            if (page.condition && model.conditions[page.condition]) {
              if (!model.conditions[page.condition].fn(state)) {
                isRelevantPage = false
                return
              }
            }
            items.push({
              name: component.name,
              path: component.path,
              label: component.localisedString(component.title),
              value: component.getDisplayStringFromState(sectionState),
              url: `/${model.basePath}${page.path}?returnUrl=/${model.basePath}/summary`,
              pageId: `/${model.basePath}${page.path}`,
              type: component.type
            })
          })
          if (isRelevantPage && page.components.formItems.length > 0) {
            relevantPages.push(page)
          }
        }
      })
      details.push({
        name: section && section.name,
        title: section && section.title,
        items
      })
    })
    let applicableFees = []

    if (model.def.fees) {
      applicableFees = model.def.fees.filter(fee => {
        return model.conditions[fee.condition].fn(state)
      })
    }

    const schema = model.makeFilteredSchema(state, relevantPages)
    const result = joi.validate(state, schema, { abortEarly: false })

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
    if (applicableFees.length) {
      this.fees = { detail: applicableFees, total: Object.values(applicableFees).map(fee => fee.amount).reduce((a, b) => a + b) }
    }

    try {
      this.parseDataForCasebook(model, relevantPages, details)
    } catch (e) {
      console.log(e)
    }

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  parseDataForCasebook (model, relevantPages, details) {
    let questions = relevantPages.map(page => {
      let category = page.section.name || ''
      let fields = []
      page.components.formItems.forEach(item => {
        let detail = details.find(d => d.name === category)
        fields.push({
          name: detail.name,
          title: typeof item.title === 'string' ? item.title : item.title.en,
          type: item.type,
          answer: detail.items.find(detailItem => detailItem.name === item.name).value
        })
      })
      return {
        id: `/${model.basePath}${page.path}`,
        category,
        question: page.title || page.components.formItems.map(item => item.title).join(', ') || '',
        fields
      }
    })

    // default name if no name is provided
    let englishName = `${serviceName} ${model.basePath}`
    if (model.name) {
      englishName = typeof model.name === 'string' ? model.name : model.name.en
    }

    let casebookData = {
      id: model.basePath,
      name: englishName,
      questions: questions,
      fees: this.fees || {}
    }
    try {
      let result = joi.validate(casebookSchema, casebookData, { abortEarly: false })
      this.casebookData = result.value
    } catch (e) {
      throw e
    }
  }
}

class SummaryPage extends Page {
  makeGetRouteHandler (getState) {
    return async (request, h) => {
      this.langFromRequest(request)
      const model = this.model

      model.basePath = h.realm.pluginOptions.basePath || ''
      const state = await model.getState(request)
      const viewModel = new SummaryViewModel(model, state)
      return h.view('summary', viewModel)
    }
  }
  makePostRouteHandler (getState) {
    return async (request, h) => {
      let lang = this.langFromRequest(request)
      const model = this.model
      model.basePath = h.realm.pluginOptions.basePath || ''
      const state = await model.getState(request)
      const summaryViewModel = new SummaryViewModel(model, state)
      const reference = `FCO-${shortid.generate()}`
      let lang = this.langFromRequest(request)
      if (!summaryViewModel.fees) {
        try {
          caseManagementPostRequest(summaryViewModel.casebookData)
        } catch (e) {
          console.log(e)
        }
        return h.redirect(`/confirmation/${reference}`)
      } else {
        try {
          let description = model.def.name ? this.localisedString(model.def.name, lang) : `${serviceName} ${this.model.basePath}`
          let res = await payRequest(summaryViewModel.fees.total, reference, description)
          request.yar.set('pay', { payId: res.payment_id, reference, self: res._links.self.href })
          return h.redirect(res._links.next_url.href)
        } catch (ex) {
          // error with payRequest
          console.log(ex)
        }
      }
    }
  }
}

module.exports = SummaryPage

const joi = require('joi')
const Page = require('.')
const shortid = require('shortid')
const { payRequest } = require('../../pay')
const { caseManagementPostRequest } = require('../../../lib/caseManagement')
const { caseManagementSchema } = require('./../../../lib/caseManagementSchema')
const { serviceName } = require('./../../../config')

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
        name: section && section.name ? section.name : null,
        title: section && section.title ? section.title : null,
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
      this.fees = { details: applicableFees, total: Object.values(applicableFees).map(fee => fee.amount).reduce((a, b) => a + b) }
    }

    this.parseDataForCasebook(model, relevantPages, details)

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  toEnglish (localisableString) {
    let englishString = ''
    if (localisableString) {
      if (typeof localisableString === 'string') {
        englishString = localisableString
      } else {
        englishString = localisableString.en
      }
    }
    return englishString
  }

  parseDataForCasebook (model, relevantPages, details) {
    let questions = relevantPages.map(page => {
      let category = page.section && page.section.name ? page.section.name : null
      let fields = []
      page.components.formItems.forEach(item => {
        let detail = details.find(d => d.name === category)
        fields.push({
          id: item.name,
          title: this.toEnglish(item.title),
          type: item.dataType,
          answer: detail.items.find(detailItem => detailItem.name === item.name).value
        })
      })

      let question = ''
      if (page.title) {
        question = this.toEnglish(page.title)
      } else {
        question = page.components.formItems.map(item => this.toEnglish(item.title)).join(', ')
      }

      return {
        id: `/${model.basePath}${page.path}`,
        category,
        question,
        fields
      }
    })

    // default name if no name is provided
    let englishName = `${serviceName} ${model.basePath}`
    if (model.name) {
      englishName = typeof model.name === 'string' ? model.name : model.name.en
    }

    this._caseManagementData = {
      metadata: model.def.metadata,
      id: model.basePath,
      name: englishName,
      questions: questions
    }
    if (this.fees) {
      this._caseManagementData.fees = this.fees
    }
  }
  get validatedCaseManagementData () {
    let result = caseManagementSchema.validate(this._caseManagementData, { abortEarly: false, stripUnknown: true })
    return result.value
  }

  set caseManagementDataPaymentReference (paymentReference) {
    this._caseManagementData.fees.paymentReference = paymentReference
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
      const lang = this.langFromRequest(request)
      const model = this.model
      model.basePath = h.realm.pluginOptions.basePath || ''
      const state = await model.getState(request)
      const summaryViewModel = new SummaryViewModel(model, state)

      if (!summaryViewModel.fees) {
        const { reference } = caseManagementPostRequest(summaryViewModel._caseManagementData)
        return h.redirect(`/confirmation/${reference}`)
      } else {
        const paymentReference = `FCO-${shortid.generate()}`
        const description = model.def.name ? this.localisedString(model.def.name, lang) : `${serviceName} ${this.model.basePath}`
        const res = await payRequest(summaryViewModel.fees.total, paymentReference, description)

        request.yar.set('pay', { payId: res.payment_id, reference: paymentReference, self: res._links.self.href })

        summaryViewModel.caseManagementDataPaymentReference = paymentReference
        request.yar.set('caseManagementData', summaryViewModel.validatedCaseManagementData)

        return h.redirect(res._links.next_url.href)
      }
    }
  }
  get postRouteOptions () {
    return {
      ext: {
        onPreHandler: {
          method: async (request, h) => {
            return h.continue
          }
        }
      }
    }
  }
}

module.exports = SummaryPage

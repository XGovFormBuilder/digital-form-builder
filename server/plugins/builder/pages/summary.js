const joi = require('joi')
const Page = require('.')
const shortid = require('shortid')
const { payRequest } = require('../../pay')
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
              url: `/${model.basePath}${page.path}?returnUrl=/${model.basePath}/summary`
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
      this.applicableFees = { fees: applicableFees, total: Object.values(applicableFees).map(fee => fee.amount).reduce((a, b) => a + b) }
    }
    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }
}

class SummaryPage extends Page {
  makeGetRouteHandler (getState) {
    return async (request, h) => {
      this.setLangFromRequest(request)
      const model = this.model

      model.basePath = h.realm.pluginOptions.basePath || ''
      const state = await model.getState(request)
      const viewModel = new SummaryViewModel(model, state)
      return h.view('summary', viewModel)
    }
  }
  makePostRouteHandler (getState) {
    return async (request, h) => {
      const model = this.model
      model.basePath = h.realm.pluginOptions.basePath || ''
      const state = await model.getState(request)
      const { applicableFees } = new SummaryViewModel(model, state)
      const reference = `FCO-${shortid.generate()}`
      if (!applicableFees) {
        return h.redirect(`/confirmation/${reference}`)
      } else {
        try {
          let description = model.def.name ? this.localisedString(model.def.name) : `${serviceName} ${this.model.basePath}`
          let res = await payRequest(applicableFees.total, reference, description)
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

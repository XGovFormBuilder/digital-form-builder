const joi = require('joi')
const Page = require('.')

class SummaryViewModel {
  constructor (model, state) {
    const details = []

    ;[undefined].concat(model.sections).forEach((section, index) => {
      const items = []
      const sectionState = section
        ? (state[section.name] || {})
        : state

      model.pages.forEach(page => {
        if (page.section === section) {
          page.components.formItems.forEach(component => {
            items.push({
              name: component.name,
              path: component.path,
              label: component.title,
              value: component.getDisplayStringFromState(sectionState),
              url: `${page.path}?returnUrl=/summary`
            })
          })
        }
      })

      details.push({
        name: section && section.name,
        title: section && section.title,
        items
      })
    })

    const schema = model.makeSchema(state)
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

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }
}

class SummaryPage extends Page {
  makeGetRouteHandler (getState) {
    return async (request, h) => {
      const model = this.model
      const state = await model.getState(request)
      const viewModel = new SummaryViewModel(model, state)
      return h.view('summary', viewModel)
    }
  }

  // get stateSchema () {
  //   const keys = this.components.getStateSchemaKeys()
  //   const name = this.components.formItems[0].name
  //   const d = new Date()
  //   d.setDate(d.getDate() + 28)
  //   const max = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`

  //   // Extend the key to validate that the date is
  //   // greater than today and less than today+28 days
  //   keys[name] = keys[name].min('now').max(max)

  //   return joi.object().keys(keys)
  // }
}

module.exports = SummaryPage

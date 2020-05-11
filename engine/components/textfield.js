const { FormComponent } = require('.')
const helpers = require('./helpers')

class TextField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options, schema } = this

    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
    }

    if (!schema.regex) {
      schema.regex = '^[^"\\/\\#;]*$'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getStateSchemaKeys () {
    return helpers.getStateSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const { schema } = this
    const viewModel = super.getViewModel(formData, errors)

    if (typeof schema.max === 'number') {
      viewModel.attributes = {
        maxlength: schema.max
      }
    }
    return viewModel
  }
}

module.exports = TextField

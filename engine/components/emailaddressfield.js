const { FormComponent } = require('.')
const helpers = require('./helpers')

class EmailAddressField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options, schema } = this

    schema.email = true
    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getStateSchemaKeys () {
    return helpers.getStateSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const schema = this.schema
    const viewModel = super.getViewModel(formData, errors)

    if (typeof schema.max === 'number') {
      viewModel.attributes = {
        maxlength: schema.max
      }
    }

    viewModel.type = 'email'

    return viewModel
  }
}

module.exports = EmailAddressField

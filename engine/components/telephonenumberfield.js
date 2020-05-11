const { FormComponent } = require('.')
const helpers = require('./helpers')

const PATTERN = '^[0-9\\s\\+\\(\\)]*$'

class TelephoneNumberField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options, schema } = this

    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }

    schema.regex = PATTERN
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

    viewModel.type = 'tel'

    return viewModel
  }
}

module.exports = TelephoneNumberField

const { FormComponent } = require('.')
const helpers = require('./helpers')

const PATTERN = 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)'

class UrlField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options, schema } = this

    if (!options.classes) {
      options.classes = 'govuk-input--width-30'
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
    const viewModel = super.getViewModel(formData, errors)

    viewModel.type = 'url'

    return viewModel
  }
}

module.exports = UrlField

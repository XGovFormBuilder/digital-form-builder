const { FormComponent } = require('.')
const helpers = require('./helpers')

const PATTERN = '^(?!BG|GB|NK|KN|TN|NT|ZZ)[ABCEGHJ-PRSTW-Z][ABCEGHJ-NPRSTW-Z]\\s*\\d{2}\\s*\\d{2}\\s*\\d{2}\\s*[A-D]$'

class NationalInsuranceNumberField extends FormComponent {
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

    viewModel.type = 'ni'

    return viewModel
  }
}

module.exports = NationalInsuranceNumberField

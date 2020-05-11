const { FormComponent } = require('.')
const helpers = require('./helpers')

class NumberField extends FormComponent {
  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'number', this)
  }

  getStateSchemaKeys () {
    return helpers.getStateSchemaKeys(this.name, 'number', this)
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)
    viewModel.type = 'number'
    return viewModel
  }
}

module.exports = NumberField

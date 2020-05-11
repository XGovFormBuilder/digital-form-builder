const moment = require('moment')
const { FormComponent } = require('.')
const helpers = require('./helpers')

class DateField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options } = this

    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }
  }

  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'date', this)
  }

  getStateSchemaKeys () {
    return helpers.getStateSchemaKeys(this.name, 'date', this)
  }

  getFormValueFromState (state) {
    const name = this.name
    const value = state[name]
    return value ? moment(value).format('YYYY-MM-DD') : value
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]
    return value
      ? moment(value).format('D MMMM YYYY')
      : ''
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)
    viewModel.type = 'date'
    return viewModel
  }

  get dataType() {
    return 'date'
  }
}

module.exports = DateField

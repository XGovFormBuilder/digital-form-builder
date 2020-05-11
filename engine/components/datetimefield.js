const moment = require('moment')
const { FormComponent } = require('.')
const helpers = require('./helpers')

class DateTimeField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options } = this

    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
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
    return value
      ? moment(value).format('YYYY-MM-DDTHH:mm')
      : value
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]
    return value
      ? moment(value).format('D MMMM YYYY h:mma')
      : ''
  }

  getViewModel (formData, errors) {
    const viewModel = super.getViewModel(formData, errors)
    viewModel.type = 'datetime-local'
    return viewModel
  }
}

module.exports = DateTimeField

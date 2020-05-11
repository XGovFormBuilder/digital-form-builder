const moment = require('moment')
const { FormComponent, ComponentCollection } = require('.')
const helpers = require('./helpers')

class DateTimePartsField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { name, options } = this
    const stateSchema = helpers.buildStateSchema('date', this)

    const children = new ComponentCollection([
      { type: 'NumberField', name: `${name}__day`, title: 'Day', schema: { min: 1, max: 31 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__month`, title: 'Month', schema: { min: 1, max: 12 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__year`, title: 'Year', schema: { min: 1000, max: 3000 }, options: { required: options.required, classes: 'govuk-input--width-4' } },
      { type: 'NumberField', name: `${name}__hour`, title: 'Hour', schema: { min: 0, max: 23 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__minute`, title: 'Minute', schema: { min: 0, max: 59 }, options: { required: options.required, classes: 'govuk-input--width-2' } }
    ], def)

    this.children = children
    this.stateSchema = stateSchema
  }

  getFormSchemaKeys () {
    return this.children.getFormSchemaKeys()
  }

  getStateSchemaKeys () {
    return { [this.name]: this.stateSchema }
  }

  getFormDataFromState (state) {
    const name = this.name
    const value = state[name]
    return {
      [`${name}__day`]: value && value.getDate(),
      [`${name}__month`]: value && value.getMonth() + 1,
      [`${name}__year`]: value && value.getFullYear(),
      [`${name}__hour`]: value && value.getHours(),
      [`${name}__minute`]: value && value.getMinutes()
    }
  }

  getStateValueFromValidForm (payload) {
    const name = this.name
    // Use `moment` to parse the date as
    // opposed to the Date constructor.
    // `moment` will check that the individual date
    // parts together constitute a valid date.
    // E.g. 31 November is not a valid date
    return payload[`${name}__year`]
      ? moment([
        payload[`${name}__year`],
        payload[`${name}__month`] - 1,
        payload[`${name}__day`],
        payload[`${name}__hour`],
        payload[`${name}__minute`]
      ]).toDate()
      : null
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

    // Todo: Remove after next
    // release on govuk-frontend
    viewModel.name = undefined

    // Use the component collection to generate the subitems
    const componentViewModels = this.children.getViewModel(formData, errors).map(vm => vm.model)

    // Remove the labels and apply error classes to the items
    componentViewModels.forEach(componentViewModel => {
      componentViewModel.label = componentViewModel.label.text.replace(' (optional)', '')
      if (componentViewModel.errorMessage) {
        componentViewModel.classes += ' govuk-input--error'
      }
    })

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: componentViewModels
    })

    return viewModel
  }
}

module.exports = DateTimePartsField

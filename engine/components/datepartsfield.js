const moment = require('moment')
const { FormComponent, ComponentCollection } = require('.')
const helpers = require('./helpers')

class DatePartsField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { name, options } = this
    const stateSchema = helpers.buildStateSchema('date', this)

    const children = new ComponentCollection([
      { type: 'NumberField', name: `${name}__day`, title: 'Day', schema: { min: 1, max: 31 }, options: { required: options.required, optionalText: options.optionalText, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__month`, title: 'Month', schema: { min: 1, max: 12 }, options: { required: options.required, optionalText: options.optionalText, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__year`, title: 'Year', schema: { min: 1000, max: 3000 }, options: { required: options.required, optionalText: options.optionalText, classes: 'govuk-input--width-4' } }
    ], def)

    this.children = children
    this.stateSchema = stateSchema
  }

  getFormSchemaKeys () {
    return this.children.getFormSchemaKeys()
  }

  getStateSchemaKeys () {
    const { options } = this
    const { maxDaysInPast, maxDaysInFuture } = options

    let schema = this.stateSchema

    if (maxDaysInPast !== undefined) {
      const d = new Date()
      d.setDate(d.getDate() - maxDaysInPast)
      const min = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`
      schema = schema.min(min)
    }
    if (maxDaysInFuture !== undefined) {
      const d = new Date()
      d.setDate(d.getDate() + maxDaysInFuture)
      const max = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`
      schema = schema.max(max)
    }
    return { [this.name]: schema }
  }

  getFormDataFromState (state) {
    const name = this.name
    const value = state[name]
    const dateValue = new Date(value)
    return {
      [`${name}__day`]: value && dateValue.getDate(),
      [`${name}__month`]: value && dateValue.getMonth() + 1,
      [`${name}__year`]: value && dateValue.getFullYear()
    }
  }

  getStateValueFromValidForm (payload) {
    // Use `moment` to parse the date as
    // opposed to the Date constructor.
    // `moment` will check that the individual date
    // parts together constitute a valid date.
    // E.g. 31 November is not a valid date
    const name = this.name
    return payload[`${name}__year`]
      ? moment([
        payload[`${name}__year`],
        payload[`${name}__month`] - 1,
        payload[`${name}__day`]
      ]).toDate()
      : null
  }

  getDisplayStringFromState (state) {
    const name = this.name
    const value = state[name]
    return value ? moment(value).format('D MMMM YYYY') : ''
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

  get dataType() {
    return 'date'
  }
}

module.exports = DatePartsField

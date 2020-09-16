const { Data } = require('@xgovformbuilder/model')

const { FormComponent } = require('.')
const helpers = require('./helpers')

class YesNoField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    this.values = new Data(model.def).valuesFor(def).toStaticValues()

    const { options, values } = this

    if (!options.classes) {
      options.classes = 'govuk-radios--inline'
    }
    const validValues = values.items.map(item => item.value)
    const formSchema = helpers.buildFormSchema(values.valueType, this, options.required !== false).valid(validValues)
    const stateSchema = helpers.buildStateSchema(values.valueType, this).valid(validValues)

    this.formSchema = formSchema
    this.stateSchema = stateSchema
  }

  getFormSchemaKeys () {
    return { [this.name]: this.formSchema }
  }

  getStateSchemaKeys () {
    return { [this.name]: this.stateSchema }
  }

  getDisplayStringFromState (state) {
    const { name, values } = this
    const value = state[name]
    const item = values.items.find(item => item.value === value)
    return item ? item.label : ''
  }

  getViewModel (formData, errors) {
    const { name, values } = this
    const viewModel = super.getViewModel(formData, errors)

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: values.items.map(item => {
        return {
          text: item.label,
          value: item.value,
          // Do a loose string based check as state may or
          // may not match the item value types.
          checked: '' + item.value === '' + formData[name]
        }
      })
    })

    return viewModel
  }
}

module.exports = YesNoField

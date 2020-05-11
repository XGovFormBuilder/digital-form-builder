const { FormComponent } = require('.')
const helpers = require('./helpers')

class SelectField extends FormComponent {
  constructor (def, model) {
    super(def, model)

    const { options } = this
    const list = model.lists.find(list => list.name === options.list)
    const items = list.items
    const values = items.map(item => item.value)
    const formSchema = helpers.buildFormSchema('string'/* list.type */, this) // .valid(values)
    const stateSchema = helpers.buildStateSchema(list.type, this).valid(values)

    this.list = list
    this.items = items
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
    const { name, items } = this
    const value = state[name]
    const item = items.find(item => item.value === value)
    return item ? item.text : ''
  }

  getViewModel (formData, errors) {
    const { name, items } = this
    const viewModel = super.getViewModel(formData, errors)

    Object.assign(viewModel, {
      items: [{ text: '' }].concat(items.map(item => {
        return {
          text: this.localisedString(item.text),
          value: item.value,
          // Do a loose check as state may or
          // may not match the item value types
          selected: '' + item.value === '' + formData[name]
        }
      }))
    })

    return viewModel
  }
}

module.exports = SelectField

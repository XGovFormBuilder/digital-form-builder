const { ConditionalFormComponent } = require('.')
const helpers = require('./helpers')

class RadiosField extends ConditionalFormComponent {
  constructor (def, model) {
    super(def, model)

    const { list, options, values } = this

    if (list.items.length === 2) {
      options.classes = options.classes ? [...options.classes, 'govuk-radios--inline'] : ['govuk-radios--inline']
    }

    const formSchema = helpers.buildFormSchema(list.type, this, options.required !== false).valid(values)
    const stateSchema = helpers.buildStateSchema(list.type, this).valid(values)

    this.formSchema = formSchema
    this.stateSchema = stateSchema
  }

  getDisplayStringFromState (state) {
    const { name, items } = this
    const value = state[name]
    const item = items.find(item => item.value === value)
    return item ? item.text : value
  }

  getViewModel (formData, errors) {
    const { name, items, options } = this
    const viewModel = super.getViewModel(formData, errors)

    Object.assign(viewModel, {
      fieldset: {
        legend: viewModel.label
      },
      items: items.map((item) => {
        const itemModel = {
          html: this.localisedString(item.text),
          value: item.value,
          // Do a loose string based check as state may or
          // may not match the item value types.
          checked: '' + item.value === '' + formData[name]
        }

        if (options.bold) {
          itemModel.label = {
            classes: 'govuk-label--s'
          }
        }

        if (item.description) {
          itemModel.hint = {
            html: this.localisedString(item.description)
          }
        }

        return super.addConditionalComponents(item, itemModel, formData, errors)
      })
    })

    return viewModel
  }
}

module.exports = RadiosField

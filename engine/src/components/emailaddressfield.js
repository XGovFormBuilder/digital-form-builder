import FormComponent from './formcomponent'
import { getStateSchemaKeys, getFormSchemaKeys } from './helpers'

export default class EmailAddressField extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options, schema } = this

    schema.email = true
    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
    }
  }

  getFormSchemaKeys () {
    return getFormSchemaKeys(this.name, 'string', this)
  }

  getStateSchemaKeys () {
    return getStateSchemaKeys(this.name, 'string', this)
  }

  getViewModel (formData, errors) {
    const schema = this.schema
    const viewModel = super.getViewModel(formData, errors)

    if (typeof schema.max === 'number') {
      viewModel.attributes = {
        maxlength: schema.max
      }
    }

    viewModel.type = 'email'

    return viewModel
  }
}

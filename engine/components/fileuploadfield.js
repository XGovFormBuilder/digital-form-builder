const { FormComponent } = require('.')
const helpers = require('./helpers')

class FileUploadField extends FormComponent {
  getFormSchemaKeys () {
    return helpers.getFormSchemaKeys(this.name, 'string', this)
  }

  getStateSchemaKeys () {
    return helpers.getStateSchemaKeys(this.name, 'string', this)
  }

  get attributes () {
    return {
      accept: 'image/jpeg,image/gif,image/png,application/pdf'
    }
  }

  getViewModel (formData, errors) {
    const { options } = this
    const viewModel = { ...super.getViewModel(formData, errors), attributes: this.attributes }

    if (options.multiple) {
      viewModel.attributes.multiple = 'multiple'
    }

    return viewModel
  }

  get dataType() {
    return 'file'
  }
}

module.exports = FileUploadField

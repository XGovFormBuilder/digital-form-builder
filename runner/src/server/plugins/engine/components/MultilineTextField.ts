import FormComponent from "./formcomponent";
import * as helpers from "./helpers";

export default class MultilineTextField extends FormComponent {
  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "string", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "string", this);
  }

  getViewModel(formData, errors) {
    const { schema, options } = this;
    const viewModel = super.getViewModel(formData, errors);

    if (typeof schema.max === "number") {
      viewModel.attributes = {
        maxlength: schema.max,
      };
    }

    if (options.rows) {
      viewModel.rows = options.rows;
    }

    return viewModel;
  }
}

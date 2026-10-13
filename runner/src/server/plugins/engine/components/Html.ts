import { FormData, FormSubmissionErrors } from "../types";
import { ComponentBase } from "./ComponentBase";

export class Html extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;
    const content = this.renderUserTemplate(this.content, formData);
    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: content,
    };

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

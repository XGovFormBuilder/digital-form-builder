import { ComponentBase } from "./ComponentBase";
import { FormData, FormSubmissionErrors } from "../types";

export class Para extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;

    const content = this.renderUserTemplate(this.content, formData);

    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: content,
    };

    if (options.condition) {
      viewModel.condition = options.condition;
    }

    if (options.inset) {
      viewModel.attributes.inset = true;
    }

    return viewModel;
  }
}

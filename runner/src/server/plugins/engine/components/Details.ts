import { FormData, FormSubmissionErrors } from "../types";
import { ComponentBase } from "./ComponentBase";

export class Details extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;

    const viewModel = {
      ...super.getViewModel(formData, errors),
      summaryHtml: this.renderUserTemplate(this.title, formData),
      html: this.renderUserTemplate(this.content, formData),
    };

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

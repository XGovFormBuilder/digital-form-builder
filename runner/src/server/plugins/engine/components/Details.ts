import { FormData, FormSubmissionErrors } from "../types";
import { ComponentBase } from "./ComponentBase";

export class Details extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;

    const viewModel = {
      ...super.getViewModel(formData, errors),
      summaryHtml: this.title,
      html: this.content,
    };

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

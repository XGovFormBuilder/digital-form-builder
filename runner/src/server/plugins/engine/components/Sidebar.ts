import { ComponentBase } from "./ComponentBase";
import { FormData, FormSubmissionErrors } from "../types";

export class Sidebar extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;
    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: this.content,
    };

    if (options.condition) {
      viewModel.condition = options.condition;
    }
    return viewModel;
  }
}

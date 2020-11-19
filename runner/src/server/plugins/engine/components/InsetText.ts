import { ComponentBase } from "./ComponentBase";
import { ViewModel } from "./types";
import { FormData, FormSubmissionErrors } from "../types";

export class InsetText extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors): ViewModel {
    return {
      ...super.getViewModel(formData, errors),
      content: this.content,
    };
  }
}

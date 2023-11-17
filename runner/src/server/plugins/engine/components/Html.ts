import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ComponentBase } from "./ComponentBase";
import { getVarsForTemplate } from "server/plugins/engine/components/helpers";

export class Html extends ComponentBase {
  getViewModel(
    formData: FormData,
    errors: FormSubmissionErrors,
    state: FormSubmissionState
  ) {
    const { options } = this;

    const content = getVarsForTemplate(this.content, state);
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

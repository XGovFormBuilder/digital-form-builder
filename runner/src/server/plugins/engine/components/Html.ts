import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ComponentBase } from "./ComponentBase";
import {
  getTemplateVarsFromContentVars,
  getVarsFromContent,
} from "server/plugins/engine/components/helpers";

export class Html extends ComponentBase {
  getViewModel(
    formData: FormData,
    errors: FormSubmissionErrors,
    state: FormSubmissionState
  ) {
    const { options } = this;
    const contentVars = getVarsFromContent(this.content);
    const additionalTemplateVars = getTemplateVarsFromContentVars(
      contentVars,
      state
    );
    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: this.content,
      ...additionalTemplateVars,
    };

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

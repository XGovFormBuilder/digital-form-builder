import { ComponentBase } from "./ComponentBase";
import { FormData, FormSubmissionErrors } from "../types";
import config from "../../../config";
import nunjucks from "nunjucks";

export class Para extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;

    let content = this.content;
    if (config.allowUserTemplates) {
      content = nunjucks.renderString(content, { ...formData });
    }
    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: content,
    };

    if (options.condition) {
      viewModel.condition = options.condition;
    }
    return viewModel;
  }
}

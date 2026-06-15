import { FormData, FormSubmissionErrors } from "../types";
import { ComponentBase } from "./ComponentBase";
import config from "../../../config";
import nunjucks from "nunjucks";

export class Details extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;

    const viewModel = {
      ...super.getViewModel(formData, errors),
      summaryHtml: this.title,
      html: this.content,
    };

    if (config.allowUserTemplates) {
      viewModel.html = nunjucks.renderString(viewModel.html, { ...formData });
    }

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

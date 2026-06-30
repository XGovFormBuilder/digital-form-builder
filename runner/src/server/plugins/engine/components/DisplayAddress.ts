import { ComponentBase } from "./ComponentBase";
import { FormData, FormSubmissionErrors } from "../types";
import config from "../../../config";
import nunjucks from "nunjucks";

export class DisplayAddress extends ComponentBase {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;

    let content = this.content;
  
    if (config.allowUserTemplates) {
      content = nunjucks.renderString(content, { ...formData });
    }

    const displayAddress = content.replaceAll(",", "<br>");
    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: displayAddress,
    };

    if (options.condition) {
      viewModel.condition = options.condition;
    }
    return viewModel;
  }
}

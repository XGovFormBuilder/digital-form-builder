import { ComponentBase } from "./ComponentBase";

export class Details extends ComponentBase {
  getViewModel() {
    const { options } = this;

    const viewModel = {
      ...super.getViewModel(),
      summaryHtml: this.title,
      html: this.content,
    };

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

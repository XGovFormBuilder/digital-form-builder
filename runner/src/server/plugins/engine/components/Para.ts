import { ComponentBase } from "./ComponentBase";

export class Para extends ComponentBase {
  getViewModel() {
    const { options } = this;
    const viewModel = super.getViewModel();

    viewModel.content = this.content;

    if ("condition" in options && options.condition) {
      viewModel.condition = options.condition;
    }

    return viewModel;
  }
}

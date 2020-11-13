import { Component } from "./Component";

export class Details extends Component {
  getViewModel() {
    const viewModel = {
      ...super.getViewModel(),
      summaryHtml: this.title,
      html: this.content,
    };

    if (this.options.condition) {
      viewModel.condition = this.options.condition;
    }

    return viewModel;
  }
}

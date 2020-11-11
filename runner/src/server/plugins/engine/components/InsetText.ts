import { Component } from "./Component";

export class InsetText extends Component {
  getViewModel() {
    const viewModel = super.getViewModel();
    viewModel.content = this.content;
    return viewModel;
  }
}

import Component from "./component";

export default class Html extends Component {
  getViewModel() {
    const viewModel = super.getViewModel();

    viewModel.content = this.content;

    if (this.options.condition) {
      viewModel.condition = this.options.condition;
    }

    return viewModel;
  }
}

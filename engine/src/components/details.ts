import Component from "./component";

export default class Details extends Component {
  getViewModel() {
    const viewModel = super.getViewModel();

    viewModel.summaryHtml = this.title;
    viewModel.html = this.content;

    if (this.options.condition) {
      viewModel.condition = this.options.condition;
    }

    return viewModel;
  }
}

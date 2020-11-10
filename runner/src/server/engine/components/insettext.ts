import Component from "./component";

export default class InsetText extends Component {
  getViewModel() {
    const viewModel = super.getViewModel();
    viewModel.content = this.content;
    return viewModel;
  }
}

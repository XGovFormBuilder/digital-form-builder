import Component from "./component";

export default class List extends Component {
  getViewModel() {
    const { values } = this;
    const viewModel = super.getViewModel();

    if (this.options.type) {
      viewModel.type = this.options.type;
    }

    viewModel.content = values.items.map((item) => {
      const contentItem: { text: string; condition?: any } = {
        text: item.hint || item.label,
      };
      if (item.condition) {
        contentItem.condition = item.condition;
      }
      return contentItem;
    });

    return viewModel;
  }
}

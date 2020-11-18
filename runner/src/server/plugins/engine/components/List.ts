import { ComponentBase } from "./ComponentBase";

export class List extends ComponentBase {
  getViewModel() {
    const { values, options } = this;
    const viewModel = super.getViewModel();

    if ("type" in options && options.type) {
      viewModel.type = options.type;
    }

    viewModel.content = values?.items.map((item) => {
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

import { ComponentBase } from "./ComponentBase";

export class FlashCard extends ComponentBase {
  getViewModel() {
    const { values } = this;
    const viewModel = super.getViewModel();

    viewModel.content = values?.items.map((item) => {
      const contentItem: { title: string; text: string; condition?: any } = {
        title: item.label,
        text: item.hint || "",
      };

      if (item.condition) {
        contentItem.condition = item.condition;
      }

      return contentItem;
    });

    return viewModel;
  }
}

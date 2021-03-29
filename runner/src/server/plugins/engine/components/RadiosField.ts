import { FormData, FormSubmissionErrors } from "../types";
import { ListFormComponent } from "./ListFormComponent";

export class RadiosField extends ListFormComponent {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = items.map((item) => {
      const itemModel: any = {
        text: item.text,
        value: item.value,
        checked: `${item.value}` === `${formData[name]}`,
      };

      if (options.bold) {
        itemModel.label = {
          classes: "govuk-label--s",
        };
      }

      if (item.description) {
        itemModel.hint = {
          html: this.localisedString(item.description),
        };
      }

      return itemModel;

      // FIXME:- add this back when GDS fix accessibility issues involving conditional reveal fields
      //return super.addConditionalComponents(item, itemModel, formData, errors);
    });

    return viewModel;
  }
}

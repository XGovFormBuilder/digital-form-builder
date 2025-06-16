import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { Label, ListItem } from "server/plugins/engine/components/types";

/**
 * "Selection controls" are checkboxes and radios (and switches), as per Material UI nomenclature.
 */
export class SelectionControlField extends ListFormComponent {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    const { label } = viewModel;

    viewModel.fieldset = {
      legend: {
        ...label,
        classes: "govuk-fieldset__legend govuk-fieldset__legend--s",
      },
    };

    viewModel.items = items.map((item) => {
      const itemModel: ListItem = {
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

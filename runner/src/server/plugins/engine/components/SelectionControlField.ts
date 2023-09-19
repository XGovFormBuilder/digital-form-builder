import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { ListItem } from "server/plugins/engine/components/types";

/**
 * "Selection controls" are checkboxes and radios (and switches), as per Material UI nomenclature.
 */
export class SelectionControlField extends ListFormComponent {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    // Avoids double title issue when using the multi input component
    if (!options.isMultiInput) {
      viewModel.fieldset = {
        legend: viewModel.label,
      };
    }

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

import { ListFormComponent } from "./ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { SelectFieldComponent } from "@xgovformbuilder/model";

export class SelectField extends ListFormComponent {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: SelectFieldComponent["options"] = this.options;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.items = [{ value: "" }, ...(viewModel.items ?? [])];

    if (options.autocomplete) {
      viewModel.attributes.autocomplete = options.autocomplete;
    }
    return viewModel;
  }
}

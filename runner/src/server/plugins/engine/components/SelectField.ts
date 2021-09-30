import { ListFormComponent } from "./ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { SelectFieldComponent } from "@xgovformbuilder/model";
import { DataType } from "./types";

export class SelectField extends ListFormComponent {
  dataType = "list" as DataType;
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

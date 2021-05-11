import { ListFormComponent } from "./ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";

export class SelectField extends ListFormComponent {
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    if (options.autocomplete) {
      viewModel.autocomplete = options.autocomplete;
    }
    return viewModel;
  }
}

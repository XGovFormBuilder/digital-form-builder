import { FormData, FormSubmissionErrors } from "../types";
import { PageController } from "./PageController";

export class MultiStartPageController extends PageController {
  get viewName() {
    return "multi-start-page";
  }
  getViewModel(formData: FormData, errors?: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const { showContinueButton, startPageNavigation } = this.pageDef;
    return {
      ...viewModel,
      continueButtonText: showContinueButton && this.pageDef.continueButtonText,
      startPageNavigation,
      isMultiStartPageController: true,
    };
  }
}

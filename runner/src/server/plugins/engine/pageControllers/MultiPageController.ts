import { FormData, FormSubmissionErrors } from "../types";
import { PageController } from "./PageController";

export class MultiPageController extends PageController {
  get viewName() {
    return "multi-page";
  }
  getViewModel(formData: FormData, errors?: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const { showContinueButton, startPageNavigation } = this.pageDef;
    return {
      ...viewModel,
      continueButtonText: showContinueButton && this.pageDef.continueButtonText,
      prevButton: startPageNavigation.previous,
      nextButton: startPageNavigation.next,
      isMultiPageController: true,
    };
  }
}

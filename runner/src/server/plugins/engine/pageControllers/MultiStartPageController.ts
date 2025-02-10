import { FormData, FormSubmissionErrors } from "../types";
import { PageController } from "./PageController";

export class MultiStartPageController extends PageController {
  get viewName() {
    if (this.relatedContent) {
      return "multi-start-page-with-related-content";
    } else {
      return "multi-start-page";
    }
  }
  getViewModel(formData: FormData, errors?: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const {
      showContinueButton,
      startPageNavigation,
      relatedContent,
    } = this.pageDef;
    return {
      ...viewModel,
      continueButtonText: showContinueButton && this.pageDef.continueButtonText,
      startPageNavigation,
      relatedContent,
      isMultiStartPageController: true,
    };
  }
}

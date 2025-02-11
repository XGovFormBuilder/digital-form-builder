import { FormData, FormSubmissionErrors } from "../types";
import { PageController } from "./PageController";

export class MultiStartPageController extends PageController {
  get viewName() {
    if (this.sidebarContent) {
      return "multi-start-page-with-sidebar-content";
    } else {
      return "multi-start-page";
    }
  }
  getViewModel(formData: FormData, errors?: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const {
      showContinueButton,
      startPageNavigation,
      sidebarContent,
    } = this.pageDef;
    return {
      ...viewModel,
      continueButtonText: showContinueButton && this.pageDef.continueButtonText,
      startPageNavigation,
      sidebarContent,
      isMultiStartPageController: true,
    };
  }
}

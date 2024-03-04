import { FormData, FormSubmissionErrors } from "../types";
import { PageController } from "./PageController";
import config from "server/config";
import nunjucks from "nunjucks";

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
      startPageNavigation,
      isMultiPageController: true,
    };
  }
}

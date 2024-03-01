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
    if (config.allowUserTemplates) {
      if (startPageNavigation.previous) {
        startPageNavigation.previous.labelText = nunjucks.renderString(
          startPageNavigation.previous.labelText,
          { ...formData }
        );
      }
      if (startPageNavigation.next) {
        startPageNavigation.next.labelText = nunjucks.renderString(
          startPageNavigation.next.labelText,
          { ...formData }
        );
      }
    }
    return {
      ...viewModel,
      continueButtonText: showContinueButton && this.pageDef.continueButtonText,
      prevButton: startPageNavigation.previous,
      nextButton: startPageNavigation.next,
      isMultiPageController: true,
    };
  }
}

import { FormData, FormSubmissionErrors } from "../types";
import { PageController } from "./pageController";

export class StartPageController extends PageController {
  getViewModel(formData: FormData, errors?: FormSubmissionErrors) {
    return {
      ...super.getViewModel(formData, errors),
      isStartPage: true,
      skipTimeoutWarning: true,
    };
  }
}

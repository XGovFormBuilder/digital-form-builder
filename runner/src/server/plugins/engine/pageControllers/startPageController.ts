import { PageErrors } from "../types";
import { PageController } from "./pageController";

export class StartPageController extends PageController {
  getViewModel(formData, errors: PageErrors) {
    return {
      ...super.getViewModel(formData, errors),
      isStartPage: true,
      skipTimeoutWarning: true,
    };
  }
}

import { PageController } from "./pageController";

export class StartPageController extends PageController {
  getViewModel(formData, errors) {
    return {
      ...super.getViewModel(formData, errors),
      isStartPage: true,
      skipTimeoutWarning: true,
    };
  }
}

import { MagicLinkSubmissionPageController } from "./MagicLinkSubmissionPageController";

// Original MagicLinkFirstSubmitPageController as a child class
export class MagicLinkFirstSubmitPageController extends MagicLinkSubmissionPageController {
  get timeRemainingRedirect() {
    return `/${this.model.basePath}/email`;
  }

  get redirectAfterSubmission() {
    return `/${this.request.params.id}/check-your-email`;
  }
}

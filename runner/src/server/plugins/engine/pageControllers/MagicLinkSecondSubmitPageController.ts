import { MagicLinkSubmissionPageController } from "./MagicLinkSubmissionPageController";

// MagicLinkSecondSubmitPageController as a child class
export class MagicLinkSecondSubmitPageController extends MagicLinkSubmissionPageController {
  get timeRemainingRedirect() {
    return `/${this.model.basePath}/check-your-email`;
  }

  get redirectAfterSubmission() {
    return `/${this.request.params.id}/resubmit-email`;
  }
}

import { MagicLinkSubmissionPageController } from "./MagicLinkSubmissionPageController";

// MagicLinkSecondSubmitPageController as a child class
export class MagicLinkSecondSubmitPageController extends MagicLinkSubmissionPageController {
  get timeRemainingTemplate() {
    return "magic-link-time-remaining";
  }

  get redirectAfterSubmission() {
    return `/${this.request.params.id}/resubmit-email`;
  }
}

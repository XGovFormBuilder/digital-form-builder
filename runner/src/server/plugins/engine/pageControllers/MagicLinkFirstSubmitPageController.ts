import { MagicLinkSubmissionPageController } from "./MagicLinkSubmissionPageController";

// Original MagicLinkFirstSubmitPageController as a child class
export class MagicLinkFirstSubmitPageController extends MagicLinkSubmissionPageController {
  get timeRemainingTemplate() {
    return "email-time-remaining";
  }

  get redirectAfterSubmission() {
    return `/${this.request.params.id}/check-your-email`;
  }
}

import { FormDefinition } from "@xgovformbuilder/model";

export const DEFAULT_FEE_OPTIONS: FormDefinition["feeOptions"] = {
  /**
   * If a payment is required, but the user fails, allow the user to skip payment
   * and submit the form. this is the default behaviour.
   *
   * Any versions AFTER (and not including) v3.25.61-rc.920 allows this behaviour
   * to be configurable. If you do not want payment to be skippable, set
   * `allowSubmissionWithoutPayment: false`
   */
  allowSubmissionWithoutPayment: true,

  /**
   * The maximum number of times a user can attempt to pay before the form is auto submitted.
   * There is no limit when allowSubmissionWithoutPayment is false. (The user can retry as many times as they like).
   */
  maxAttempts: 3,

  /**
   * A supplementary error message (`customPayErrorMessage`) may also be configured if allowSubmissionWithoutPayment is false.
   */
  // customPayErrorMessage: "Custom error message",

  /**
   * Shows a link (button) below the "Submit and pay" button on the summary page. Clicking this will take the user to a page
   * that provides additional messaging, you can warn the user that this may delay their application for example.
   * allowSubmissionWithoutPayment must be true for this to be shown.
   */
  showPaymentSkippedWarningPage: false,
};

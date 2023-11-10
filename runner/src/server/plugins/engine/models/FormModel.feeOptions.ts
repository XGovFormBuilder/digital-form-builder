export const DEFAULT_FEE_OPTIONS = {
  /**
   * If a payment is required, but the user fails, allow the user to skip payment
   * and submit the form. this is the default behaviour.
   *
   * Any versions AFTER (and not including) v3.25.61-rc.920 allows this behaviour
   * to be configurable. If you do not want payment to be skippable, set
   * `allowSubmissionWithoutPayment: false`
   */
  allowSubmissionWithoutPayment: true,
  maxAttempts: 3,
};

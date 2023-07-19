export type InitialiseSession = {
  safelist: string[];
};

export type InitialiseSessionOptions = {
  callbackUrl: string;
  redirectPath?: string;
  message?: string;
  htmlMessage?: string;
  title?: string;
  skipSummary?: {
    redirectUrl: string;
  };
};

export type DecodedSessionToken = {
  /**
   * Callback url to PUT data to
   */
  cb: string;

  /**
   * 16 character randomised string
   */
  user: string;

  /**
   * alias for formId
   */
  group: string;
};

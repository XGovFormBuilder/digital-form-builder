import { FormDefinition } from "@xgovformbuilder/model";

export type InitialiseSession = {
  whitelist: string[];
};

export type InitialiseSessionOptions = {
  callback: string;
  redirectPath?: string;
  message?: string;
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

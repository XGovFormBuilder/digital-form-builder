import { SecureFormSubmissionConfig } from "@xgovformbuilder/model";
import { MsalAuthorizer } from "./msalAuthorizerService";

export class SecureFormSubmissionService {
  private readonly auth: MsalAuthorizer;

  constructor(config: SecureFormSubmissionConfig) {
    this.auth = new MsalAuthorizer(config);
  }

  async getAuthHeader() {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await this.auth.getToken()}`,
    };

    return headers;
  }
}

export const getSecureFormSubmissionServiceInstance = (formId: string) => {
  if (!formId || !formId.trim().length) {
    throw new Error(
      `Failed to get secure form submission service instance name for : ${formId}`
    );
  }

  return `secureFormSubmissionServiceInstance:${formId}`;
};

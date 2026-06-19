import { HapiRequest, HapiServer } from "../types";

import { createHmacRaw } from "../utils/hmac";
import {
  getSecureFormSubmissionServiceInstance,
  SecureFormSubmissionService,
} from "./secureFormSubmissionService";

export class FormSecurityService {
  /**
   * Service responsible for securing form submissions. This service has been registered by {@link #createServer}
   */

  logger: HapiServer["logger"];
  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  async getSecurityHeaders(request: HapiRequest) {
    const formId = request.params?.id as string;
    if (!formId) {
      return;
    }

    const form = request.server?.app?.forms?.[formId];
    if (!form) {
      return;
    }

    let customSecurityHeaders: Record<string, string> = {};

    if (form.def.webhookHmacSharedKey) {
      /**
       * If the config contains the OPTIONAL webhookHmacSharedKey, then we send HMAC Auth headers
       * This is used to confirm ONLY X-Gov's backend is sending data to our API
       * Everyone else will be Rejected
       * (Used by KLS)
       */
      const hmacKey = form.def.webhookHmacSharedKey;

      const [hmacSignature, requestTime, hmacExpiryTime] = await createHmacRaw(
        request.yar.id,
        hmacKey
      );
      customSecurityHeaders = {
        "X-Request-ID": request.yar.id.toString(),
        "X-HMAC-Signature": hmacSignature.toString(),
        "X-HMAC-Time": requestTime.toString(),
      };
    } else if (form.def.secureFormSubmissionConfig) {
      /** Secure form submissions facilitated through a form specific instance of the secureFormSubmissionService
       * We resolve the named service instance for the form
       * If it exists, it's implementation will return a headers object \{ Authorization: "Bearer <Token>"\}
       * For more information @see secure-form-submissions.md
       */

      const instanceName = getSecureFormSubmissionServiceInstance(formId);
      if (instanceName) {
        const serviceInstance = request.services([])[
          instanceName
        ] as SecureFormSubmissionService;

        if (serviceInstance) {
          const headers = await serviceInstance.getAuthHeader();
          if (headers) {
            const {
              useAwsWafUserAgentWorkaround,
            } = form.def.secureFormSubmissionConfig;

            if (useAwsWafUserAgentWorkaround == true) {
              /* AWS WAF forces User-Agent as part of auth, provide one to prevent 403 */
              headers["User-Agent"] = "X-GOV Forms/v1.0";
            }

            customSecurityHeaders = headers;
          }
        }
      }
    }

    return customSecurityHeaders;
  }
}

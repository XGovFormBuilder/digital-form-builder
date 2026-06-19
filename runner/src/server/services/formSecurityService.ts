import { HapiRequest, HapiServer } from "../types";

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

    /* Insert your custom security headers logic here
     *
     * You can access the form definition and options via the `form` variable, which is an instance of {@link FormModel}
     *
     * The operation is async to allow for any necessary asynchronous authentication operations, such as fetching additional data from a database or an external API or authenticating with an external service.
     *
     *
     * For example you could set a custom Authorization header based on the forms name:
     * if (form.name === "my-secure-form") {
     *   customSecurityHeaders["Authorization"] = "Bearer my-secure-token";
     * }
     *
     *
     * Or you could extend the form definition and fetch additional data from an external API and set a custom header based on the response:
     * if (form.def.useMyCustomApiAuth) {
     *   const apiToken = await fetchTokenFromExternalService();
     *   customSecurityHeaders["Api-Token"] = apiToken;
     * }
     */

    return customSecurityHeaders;
  }
}

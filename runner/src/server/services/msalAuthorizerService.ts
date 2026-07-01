import { ConfidentialClientApplication } from "@azure/msal-node";
import { MsalAuthorizerConfig } from "@xgovformbuilder/model";

export class MsalAuthorizer {
  private readonly msal: ConfidentialClientApplication;
  private readonly scopes: string[];

  constructor(config: MsalAuthorizerConfig) {
    this.scopes = config.scopes;
    this.msal = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
      },
    });
  }

  async getToken(): Promise<string> {
    const token = await this.msal.acquireTokenByClientCredential({
      scopes: this.scopes,
    });
    if (!token?.accessToken) throw new Error("Failed to acquire access token");
    return token.accessToken;
  }
}

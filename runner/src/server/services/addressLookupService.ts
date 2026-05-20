import { MsalAuthorizer, MsalAuthorizerConfig } from "./MsalAuthorizerService";

export interface AddressLookupConfig extends MsalAuthorizerConfig {
  apimBaseUrl: string;
  callingApplication: string;
  subscriptionKey?: string;
}

export interface AddressLookupOptions {
  maxResults?: number;
  fuzzy?: boolean;
  dataset?: "DPA" | "LPI";
}

export interface Address {
  [key: string]: unknown;
}

export interface AddressLookupResponse {
  addresses: Address[];
}

export class AddressLookupService {
  private readonly auth: MsalAuthorizer;
  private readonly config: AddressLookupConfig;

  constructor(config: AddressLookupConfig) {
    this.config = config;
    this.auth = new MsalAuthorizer(config);
  }

  async lookupByPostcode(
    postcode: string,
    {
      maxResults = 100,
      fuzzy = false,
      dataset = "DPA",
    }: AddressLookupOptions = {}
  ): Promise<AddressLookupResponse> {
    const params = new URLSearchParams({
      operationId: "matchAddress",
      callingApplication: this.config.callingApplication,
      address: postcode.replace(/\s/g, ""),
      maxResults: String(maxResults),
      fuzzy: String(fuzzy),
      dataset,
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${await this.auth.getToken()}`,
      ...(this.config.subscriptionKey && {
        "Ocp-Apim-Subscription-Key": this.config.subscriptionKey,
      }),
    };

    const res = await fetch(
      `${this.config.apimBaseUrl}/matchAddress?${params}`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`Request failed with status code ${res.status}`);
    }

    return res.json();
  }
}
import config from "../config";
import { get, postJson } from "./httpService";
import { nanoid } from "nanoid";

export type FeeDetails = {
  description: string;
  amount: number;
  condition: string;
  multiplier: string; // this points to sectionName.fieldName
  multiplyBy?: number; // the value retrieved from multiplier field above (see summary page retrieveFees method)
};

export type Fees = {
  details: FeeDetails[];
  total: number;
  paymentReference?: string;
};

const currencyFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export class PayService {
  /**
   * Service responsible for handling requests to GOV.UK Pay. This service has been registered by {@link createServer}
   */

  /**
   * utility method that returns the headers for a Pay request.
   */
  options(apiKey: string) {
    return {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
    };
  }

  payRequestData(amount: number, description: string, returnUrl: string) {
    return {
      amount,
      reference: nanoid(10),
      description,
      return_url: returnUrl,
    };
  }

  async payRequest(
    amount: number,
    description: string,
    apiKey: string,
    returnUrl: string
  ) {
    const data = {
      ...this.options(apiKey),
      payload: this.payRequestData(amount, description, returnUrl),
    };
    const { payload } = await postJson(`${config.payApiUrl}/payments`, data);
    return payload;
  }

  async payStatus(url: string, apiKey: string) {
    const { payload } = await get(url, {
      ...this.options(apiKey),
      json: true,
    });

    return payload;
  }

  /**
   * Returns a string with a textual description of what a user will pay.
   */
  descriptionFromFees(fees: Fees): string {
    return fees.details
      .map((detail) => {
        const { multiplier, multiplyBy, description, amount } = detail;

        if (multiplier && multiplyBy) {
          return `${multiplyBy} x ${description}: ${currencyFormat.format(
            multiplyBy * amount
          )}`;
        }

        return `${detail.description}: ${currencyFormat.format(detail.amount)}`;
      })
      .join(", ");
  }
}

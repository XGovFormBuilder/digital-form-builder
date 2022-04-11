import config from "../config";
import { get, postJson } from "./httpService";
import { nanoid } from "nanoid";
import { Fee } from "@xgovformbuilder/model";
import { FeesModel } from "server/plugins/engine/models/submission";
import { HapiServer } from "server/types";
import { format } from "date-fns";

export type FeeDetails = Fee & {
  multiplyBy?: number; // the value retrieved from multiplier field above (see summary page retrieveFees method)
};

export type FeeState = {
  payId: string;
  reference: string;
  self: string;
  returnUrl: string;

  /**
   * FeeState#meta is used to generate a new payment link for GOV.UK Pay.
   */
  meta: {
    amount: Fees["total"];
    attempts: number;
    payApiKey: string;
    description: string;
  };
  paymentSkipped: boolean;
  state?: {
    status: string;
    finished: boolean;
    message: string;
    code: string;
  } /** This is the state object from GOV.UK Pay */;
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

/**
 * A REFERENCE_TAG is a regular expression used by {@link PayService#referenceFromFees}
 */
const REFERENCE_TAG = {
  DATE: /{{(DATE(?:))(.*?)}}/,
  PREFIX: /{{PREFIX}}/,
} as const;

export class PayService {
  /**
   * Service responsible for handling requests to GOV.UK Pay. This service has been registered by {@link createServer}
   */

  logger: HapiServer["logger"];
  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

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

  payRequestData(feesModel: FeesModel, returnUrl: string) {
    const { total, prefixes, referenceFormat } = feesModel;
    return {
      amount: total,
      reference: this.referenceFromFees(prefixes, referenceFormat),
      description: this.descriptionFromFees(feesModel),
      return_url: returnUrl,
    };
  }

  referenceFromFees(prefixes = [], referenceFormat = "") {
    this.logger.info(
      ["payService", "referenceFromFees"],
      `requested pay reference format ${referenceFormat}`
    );
    if (!referenceFormat) {
      return nanoid(10);
    }

    let reference = referenceFormat;
    reference = reference.replace(REFERENCE_TAG.PREFIX, prefixes.join("-"));

    const dateSearch = reference.match(REFERENCE_TAG.DATE);
    if (dateSearch) {
      const dateTag = dateSearch[0];
      const dateFormat = `${dateSearch[2].replace(":", "")}` || "ddMMyyyy";
      reference = reference.replace(dateTag, format(new Date(), dateFormat));
    }

    reference = `${reference}-${nanoid(10)}`;
    this.logger.info(
      ["payService", "referenceFromFees"],
      `generated pay request format ${reference}`
    );

    return reference;
  }

  async retryPayRequest(feeState: FeeState) {
    const { reference, meta, returnUrl } = feeState;
    const { payApiKey, amount, description } = meta;
    let newReference = `${reference.slice(0, -11)}-${nanoid(10)}`;

    const { payload } = await postJson(`${config.payApiUrl}/payments`, {
      ...this.options(payApiKey),
      payload: {
        reference: newReference,
        return_url: returnUrl,
        description,
        amount,
      },
    });
    return payload;
  }

  async payRequest(feesModel: FeesModel, apiKey: string, returnUrl: string) {
    const data = {
      ...this.options(apiKey),
      payload: this.payRequestData(feesModel, returnUrl),
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
  descriptionFromFees(fees: FeesModel): string {
    return fees.details
      .map((detail) => {
        const { multiplyBy, description, amount } = detail;

        if (multiplyBy) {
          return `${multiplyBy} x ${description}: ${currencyFormat.format(
            (multiplyBy * amount) / 100
          )}`;
        }

        return `${detail.description}: ${currencyFormat.format(
          detail.amount / 100
        )}`;
      })
      .join(", ");
  }
}

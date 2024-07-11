import { FormModel } from "server/plugins/engine/models";
import Boom from "boom";
import { WebhookModel } from "server/plugins/engine/models/submission";
import wreck from "@hapi/wreck";
import { format, parseISO } from "date-fns";
import { callbackValidation } from "server/plugins/initialiseSession/helpers";
import Joi from "joi";
import { ExitState, FormSubmissionState } from "server/plugins/engine/types";
import { HapiServer } from "server/types";
import { WebhookData } from "server/plugins/engine/models/types";

export type ExitResponse = {
  expiry?: string;
  redirectUrl?: string;
};

type WebhookDataWithExitState = WebhookData & {
  exitState: ExitState;
};

/**
 * Service to handle exiting a form.
 */
export class ExitService {
  static expirySchema = Joi.string().isoDate().optional();
  static redirectUrlSchema = callbackValidation().optional();

  logger: HapiServer["logger"];

  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  async postToExitUrl(
    url: string,
    payload: FormSubmissionState | WebhookDataWithExitState
  ) {
    try {
      const response = await wreck.post<ExitResponse>(url, {
        payload,
        json: "force",
      });
      return response.payload;
    } catch (e: unknown) {
      if (e.data?.isResponseError) {
        this.logger.error(
          {
            service: "ExitService",
            method: "POST",
            url,
            reqBody: payload,
            statusCode: e.data.res.statusCode,
          },
          `${url} responded with an error when exiting form for ${payload?.exitState?.exitEmailAddress}.`
        );
      }
      throw e;
    }
  }

  async exitForm(form: FormModel, state: FormSubmissionState) {
    if (!form.allowExit) {
      throw Boom.forbidden();
    }

    const options = form.exitOptions;
    let body = { ...state, metadata: form.def.metadata ?? {} };
    if (options.format === "WEBHOOK") {
      body = {
        ...WebhookModel(form, state),
        exitState: state.exitState,
      };
    }

    const payload = await this.postToExitUrl(options.url, body);
    const sanitisedResponse = this.sanitiseResponse(payload);
    const expiry = this.getParsedExpiry(sanitisedResponse);

    return {
      ...sanitisedResponse,
      ...(expiry && { expiry }),
    };
  }

  getParsedExpiry(result: ExitResponse) {
    const { expiry } = result;
    if (!expiry) {
      return;
    }
    try {
      return format(parseISO(expiry), "d MMMM yyyy");
    } catch (e) {
      this.logger.warn(
        { tags: ["ExitService"], err: e },
        `Expiry date ${expiry} was returned but could not be parsed to d MMMM yyyy`
      );
      return;
    }
  }

  /**
   * Removes any invalid or unknown fields from the response.
   */
  sanitiseResponse(response: ExitResponse) {
    const sanitisedResponse: ExitResponse = {};
    const {
      value: expiryValue,
      error: expiryError,
    } = ExitService.expirySchema.validate(response.expiry, {
      abortEarly: false,
    });

    if (expiryValue && !expiryError) {
      sanitisedResponse.expiry = expiryValue;
    }

    const {
      value: redirectValue,
      error: redirectError,
    } = ExitService.redirectUrlSchema.validate(response.redirectUrl, {
      abortEarly: false,
    });

    if (redirectValue && !redirectError) {
      sanitisedResponse.redirectUrl = redirectValue;
    }

    return sanitisedResponse;
  }
}

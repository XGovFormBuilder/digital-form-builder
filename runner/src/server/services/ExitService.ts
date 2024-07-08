import { FormModel } from "server/plugins/engine/models";
import Boom from "boom";
import { WebhookModel } from "server/plugins/engine/models/submission";
import wreck from "@hapi/wreck";
import pino from "pino";
import { format, parseISO } from "date-fns";
import { callbackValidation } from "server/plugins/initialiseSession/helpers";
import Joi from "joi";
import { FormSubmissionState } from "server/plugins/engine/types";
import { HapiServer } from "server/types";

export type ExitResponse = {
  expiry?: string;
  redirectUrl?: string;
};

const logger = pino().child({ service: "ExitService" });
export class ExitService {
  responseSchema = Joi.object({
    expiry: Joi.string().isoDate().optional(),
    redirectUrl: callbackValidation().optional(),
  });
  logger: HapiServer["logger"];

  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  async post(url: string, payload: FormSubmissionState) {
    try {
      const response = await wreck.post<ExitResponse>(url, {
        payload,
        json: "force",
      });
      return response.payload;
    } catch (e) {
      if (!e.data) {
        logger.error(e);
      }
      if (e.data?.isResponseError) {
        this.logger.error(`Exiting form for ${payload}`);
      }
      throw e;
    }
  }

  async exitForm(form: FormModel, state: FormSubmissionState) {
    if (!form.allowExit) {
      Boom.forbidden();
    }

    const options = form.exitOptions;
    let body = { ...state };

    if (options.format === "WEBHOOK") {
      body = {
        ...WebhookModel(form, state),
        exitState: state.exitState,
      };
    }
    const payload = await this.post(options.url, body);

    const { value } = this.responseSchema.validate(payload, {
      stripUnknown: true,
      abortEarly: false,
    });

    const result = {
      ...value,
    };
    const { expiry } = value;

    if (expiry) {
      const parsedExpiry = this.parseExpiry(expiry);
      if (parsedExpiry) {
        result.expiry = parsedExpiry;
      }
    }

    return result;
  }

  parseExpiry(expiry: string) {
    try {
      return format(parseISO(new Date().toISOString()), "d MMMM yyyy");
    } catch (e) {
      this.logger.error(
        ["ExitService"],
        `Expiry date ${expiry} was returned but could not be parsed to d MMMM yyyy`
      );
      return;
    }
  }
}

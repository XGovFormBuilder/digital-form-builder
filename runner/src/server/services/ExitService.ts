import { HapiRequest, HapiServer } from "../types";
import { FormModel } from "server/plugins/engine/models";
import Boom from "boom";
import { WebhookModel } from "server/plugins/engine/models/submission";
import wreck from "@hapi/wreck";
import pino from "pino";
import { format, parseISO } from "date-fns";
import { callbackValidation } from "server/plugins/initialiseSession/helpers";
import config from "server/config";
import Joi from "joi";

type ExitResponse = {
  expiry?: string;
  redirectUrl?: string;
};

const logger = pino().child({ service: "ExitService" });
export class ExitService {
  constructor(server: HapiServer) {}

  async exitForm(form: FormModel, state) {
    if (!form.allowExit) {
      Boom.forbidden();
    }

    const options = form.exitOptions;
    let body = { ...state };

    if (options.format === "WEBHOOK") {
      body = WebhookModel(form, state);
    }
    console.log(body);
    console.log(state);
    try {
      const { payload } = await wreck.post<ExitResponse>(options.url, {
        payload: body,
        json: "force",
      });

      const { expiry, redirectUrl } = payload;
      const schema = Joi.string().custom(callbackValidation(config.safelist));
      const { error } = callbackValidation("notallowed.com");
      console.log(error);

      return {
        expiry: format(parseISO(new Date().toISOString()), "d MMMM yyyy"),
      };

      // return {
      //   ...{ expiry },
      //   ...{ redirectUrl },
      // };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

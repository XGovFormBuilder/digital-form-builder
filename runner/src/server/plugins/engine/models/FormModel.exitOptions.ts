import { FormModel } from "server/plugins/engine/models/FormModel";
import pino from "pino";
import config from "server/config";
const logger = pino().child({ class: "ExitOptions" });
export class ExitOptions {
  url: string;
  format?: "STATE" | "WEBHOOK";
  constructor(exitOptions: FormModel["exitOptions"]) {
    this.url = ExitOptions.validatedUrl(exitOptions.url, "url");
    this.format = exitOptions.format;
  }

  private static validatedUrl(url: string, propName?: string) {
    let urlHostname;
    try {
      urlHostname = new URL(url).hostname;
    } catch (err) {
      logger.error(err, `${propName} (${url}) is not a valid URL`);
      throw err;
    }

    if (!config.safelist.includes(urlHostname)) {
      logger.error(`${propName} (${url}) is not on the allowlist`);
      throw new Error(`${propName} (${url}) is not on the allowlist`);
    }

    return url;
  }
}

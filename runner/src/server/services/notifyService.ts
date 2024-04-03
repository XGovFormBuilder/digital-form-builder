import { NotifyClient } from "notifications-node-client/client/notification";
import { HapiServer } from "server/types";
import { isMultipleApiKey, MultipleApiKeys } from "@xgovformbuilder/model";
import config from "server/config";

type Personalisation = {
  [propName: string]: any;
};

type SendEmailOptions = {
  personalisation: Personalisation;
  reference: string;
  emailReplyToId?: string;
};

export type SendNotificationArgs = {
  apiKey: string | MultipleApiKeys;
  templateId: string;
  emailAddress: string;
  personalisation: Personalisation;
  reference: string;
  emailReplyToId?: string;
  escapeURLs?: boolean;
};

export class NotifyService {
  /**
   * This service is responsible for sending emails via {@link https://www.notifications.service.gov.uk }. This service has been registered by {@link createServer}
   */
  logger: HapiServer["logger"];
  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  escapeURLs(value: string): string {
    const specialCharactersPattern = new RegExp(/\[([^\[\]]*)]\(([^\(\)]*)\)/g);
    const matches = [...value.matchAll(specialCharactersPattern)];
    matches.forEach(([link, linkText, href]) => {
      const newText = `\\[${linkText}\\]\\(${href})`;
      value = value.replace(link, newText);
    });
    return value;
  }

  parsePersonalisations(
    options: Personalisation,
    escapeURLs: boolean
  ): Personalisation {
    const entriesWithReplacedBools = Object.entries(options).map(
      ([key, value]) => {
        if (typeof value === "boolean") {
          return [key, value ? "yes" : "no"];
        }
        if (typeof value === "string" && escapeURLs) {
          value = this.escapeURLs(value);
        }
        return [key, value];
      }
    );

    return Object.fromEntries(entriesWithReplacedBools);
  }

  sendNotification(args: SendNotificationArgs) {
    const {
      templateId,
      emailAddress,
      personalisation,
      reference,
      emailReplyToId,
      escapeURLs,
    } = args;
    let { apiKey } = args;

    if (isMultipleApiKey(apiKey)) {
      apiKey = (config.apiEnv === "production"
        ? apiKey.production ?? apiKey.test
        : apiKey.test ?? apiKey.production) as string;
    }

    console.log("escape urls the level up: ", escapeURLs);

    const parsedOptions: SendEmailOptions = {
      personalisation: this.parsePersonalisations(personalisation, escapeURLs),
      reference,
      emailReplyToId,
    };

    const notifyClient: any = new NotifyClient(apiKey);

    try {
      notifyClient
        .sendEmail(templateId, emailAddress, parsedOptions)
        .then(() => {
          this.logger.info(
            ["NotifyService", "sendNotification"],
            "Email sent successfully"
          );
        });
    } catch (error) {
      this.logger.error(
        ["NotifyService", "sendNotification"],
        `Error processing output: ${error.message}`
      );
    }
  }
}

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
  replyToEmailId?: string;
};

export class NotifyService {
  /**
   * This service is responsible for sending emails via {@link https://www.notifications.service.gov.uk }. This service has been registered by {@link createServer}
   */
  logger: HapiServer["logger"];
  constructor(server: HapiServer) {
    this.logger = server.logger;
  }

  parsePersonalisations(options: Personalisation): Personalisation {
    const entriesWithReplacedBools = Object.entries(options).map(
      ([key, value]) => {
        if (typeof value === "boolean") {
          return [key, value ? "yes" : "no"];
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
    } = args;
    let { apiKey } = args;

    if (isMultipleApiKey(apiKey)) {
      apiKey = (config.apiEnv === "production"
        ? apiKey.production ?? apiKey.test
        : apiKey.test ?? apiKey.production) as string;
    }

    const parsedOptions: SendEmailOptions = {
      personalisation: this.parsePersonalisations(personalisation),
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

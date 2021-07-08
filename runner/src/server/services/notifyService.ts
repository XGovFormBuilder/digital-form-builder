import { NotifyClient } from "notifications-node-client/client/notification";
import { HapiServer } from "server/types";

type Personalisation = {
  [propName: string]: any;
};

type SendEmailOptions = {
  personalisation: Personalisation;
  reference: string;
  emailReplyToId?: string;
};

export type SendNotificationArgs = {
  apiKey: string;
  templateId: string;
  emailAddress: string;
  personalisation: Personalisation;
  reference: string;
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
      apiKey,
      templateId,
      emailAddress,
      personalisation,
      reference,
    } = args;

    const parsedOptions: SendEmailOptions = {
      personalisation: this.parsePersonalisations(personalisation),
      reference,
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
      throw error;
    }
  }
}

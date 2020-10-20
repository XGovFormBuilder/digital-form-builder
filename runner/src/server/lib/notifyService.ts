import { NotifyClient } from "notifications-node-client/client/notification";

type Personalisation = {
  [propName: string]: any;
};

type SendEmailOptions = {
  personalisation: Personalisation;
  reference: string;
  emailReplyToId?: string;
};

type SendNotificationArgs = {
  apiKey: string;
  templateId: string;
  emailAddress: string;
  personalisation?: Personalisation;
  reference: string;
};

export class NotifyService {
  parsePersonalisations(options: Personalisation): Personalisation {
    const parsed = {};

    Object.assign(
      parsed,
      ...Object.keys(options).map((key) => {
        parsed[key] =
          typeof options[key] === "boolean"
            ? options[key]
              ? "yes"
              : "no"
            : options[key];
      })
    );

    return parsed;
  }

  sendNotification(args: SendNotificationArgs): Promise<any> {
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

    return notifyClient.sendEmail(templateId, emailAddress, parsedOptions);
  }
}

import { NotifyClient } from "notifications-node-client";

export class NotifyService {
  parsePersonalisations(options) {
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

  notifyClient(apiKey) {
    if (apiKey) {
      return new NotifyClient(apiKey);
    } else {
      return { sendEmail() {} };
    }
  }

  sendNotification(apiKey, templateId, emailAddress, reference, options) {
    const parsedOptions = {};
    parsedOptions.personalisation = this.parsePersonalisations(options);
    if (!reference) {
      parsedOptions.personalisation.reference = "";
      parsedOptions.personalisation.hasReference = "no";
    } else {
      parsedOptions.reference = reference;
      parsedOptions.personalisation.reference = reference;
      parsedOptions.personalisation.hasReference = "yes";
    }

    return this.notifyClient(apiKey).sendEmail(
      templateId,
      emailAddress,
      parsedOptions
    );
  }
}

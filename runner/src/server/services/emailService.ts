// import AWS from "aws-sdk";
// import MailComposer from "nodemailer/lib/mail-composer";
import config from "../config";

import { HapiServer } from "../types";
import { UploadService } from "./upload";

/**
 * @deprecated This service is not in use currently. If you would like to send emails to users, use
 * the email or Notify output which both use the NotifyService
 */
export class EmailService {
  /**
   * This service is responsible for sending emails. It is currently only designed to work with AWS SES, which is not available in EU West 2. You must also have a verified domain for SES.
   * @experimental
   */
  uploadService: UploadService;

  constructor(server: HapiServer) {
    const { uploadService } = server.services([]);
    this.uploadService = uploadService;
  }

  /**
   * TODO:- This should work but no guarantee. AWS needs a verified domain for sending. Sorry folks!
   * TODO:- Set 'from' email address.
   * @param emailAddress - Recipient of the email
   * @param subject - subject line
   * @param options["attachments"] - url(s) of the attachments
   * @param options["message"] - Message to be sent in email body
   */
  async sendEmail(
    emailAddress: string,
    subject: string,
    options: { message?: string; attachments?: any } = {}
  ) {
    const mailOptions: {
      from: any;
      to: string;
      subject: string;
      text: string;
      attachments?: any;
    } = {
      from: config.fromEmailAddress,
      to: emailAddress,
      subject,
      text: options.message || "",
    };

    if (options.attachments) {
      mailOptions.attachments = await this.uploadService.downloadDocuments(
        options.attachments
      );
    }

    // const mailComposer = new MailComposer(mailOptions);
    // const message = await mailComposer.compile().build();

    // SES is not available in eu-west-2
    // return new AWS.SES({ apiVersion: "2010-12-01", region: "eu-west-1" })
    //   .sendRawEmail({ RawMessage: { Data: message } })
    //   .promise();
  }
}

const AWS = require('aws-sdk')
const MailComposer = require('nodemailer/lib/mail-composer')
const config = require('../config')

class EmailService {
  constructor (server, options) {
    this.documentService = server.services([])
  }

  /**
   * TODO:- This should work but no guarantee. AWS needs a verified domain for sending. Sorry folks!
   * TODO:- Set 'from' email address.
   * @param emailAddress {string} - Recipient of the email
   * @param options {object}
   * @param subject {string}
   * @param [options.attachments] {string[]} - url(s) of the attachments
   * @param [options.message] {string} - Message to be sent in email body
   */
  async sendEmail (emailAddress, subject, options = {}) {
    let mailOptions = {
      from: config.fromEmailAddress,
      to: emailAddress,
      subject,
      text: options.message || ''
    }
    if (options.attachments) {
      mailOptions.attachments = await Promise.all(this.documentService.downloadDocuments(options.attachments))
    }

    let mailComposer = new MailComposer(mailOptions)
    let message = await mailComposer.compile().build()
    // SES is not available in eu-west-2
    return new AWS.SES({ apiVersion: '2010-12-01', region: 'eu-west-1' })
      .sendRawEmail({ RawMessage: { Data: message } })
      .promise()
  }
}

module.exports = {
  EmailService
}

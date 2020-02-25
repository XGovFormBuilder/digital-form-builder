const AWS = require('aws-sdk')
AWS.config.update({ region: 'eu-west-2' })
const MailComposer = require('nodemailer/lib/mail-composer')

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
      from: '',
      to: emailAddress,
      subject,
      text: options.message || ''
    }
    if (options.attachments) {
      mailOptions.attachments = await Promise.all(this.documentService.downloadDocuments(options.attachments))
    }

    let mailComposer = new MailComposer(mailOptions)
    let message = await mailComposer.compile().build()
    return new AWS.SES({ apiVersion: '2010-12-01' }).sendRawEmail({ RawMessage: { Data: message } }).promise()
  }
}

module.exports = {
  EmailService
}

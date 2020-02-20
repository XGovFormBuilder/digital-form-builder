import { sesAccessKeyId, sesRegion, sesSecretAccessKey, sesSender } from './../config'
import * as aws from 'aws-sdk'
import MailComposer from 'nodemailer/lib/mail-composer'

class EmailService {
  constructor (server, options) {
    this.aws = require('aws-sdk')
    aws.config.update({
      accessKeyId: sesAccessKeyId,
      secretAccessKey: sesSecretAccessKey,
      region: sesRegion
    })
    this.ses = new aws.SES()
    this.documentService = server.services([])
  }

  /**
   * @param emailAddress {string} - Recipient of the email
   * @param options {object}
   * @param subject {string}
   * @param [options.attachments] {string[]} - url(s) of the attachments
   * @param [options.message] {string} - Message to be sent in email body
   */
  async sendEmail (emailAddress, subject, options = {}) {
    let mailOptions = {
      from: sesSender,
      to: emailAddress,
      subject,
      text: options.message || ''
    }
    if (options.attachments) {
      mailOptions.attachments = await Promise.all(this.documentService(options.attachments))
    }

    let mailComposer = new MailComposer(mailOptions)
    let rawEmail = await mailComposer.compile().build()

    this.ses.sendRawEmail(rawEmail)
  }
}

module.exports = {
  EmailService
}

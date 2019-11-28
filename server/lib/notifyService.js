const { NotifyClient } = require('notifications-node-client')
const { notifyApiKey } = require('./../config')

class NotifyService {
  constructor () {
    this.notifyClient = new NotifyClient(notifyApiKey)
  }

  sendNotification (templateId, emailAddress, reference, personalisation) {
    return this.notifyClient.sendEmail(templateId, emailAddress, { reference, personalisation: { ...personalisation, reference } })
  }
}

module.exports = {
  NotifyService
}

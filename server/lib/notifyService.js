const { NotifyClient } = require('notifications-node-client')
const { notifyApiKey } = require('./../config')

class NotifyService {
  constructor () {
    this.notifyClient = new NotifyClient(notifyApiKey)
  }

  sendNotification (templateId, emailAddress, personalisation) {
    let options = personalisation
    if (!personalisation.reference) {
      options['reference'] = ''
      options['hasReference'] = 'no'
    }

    return this.notifyClient.sendEmail(templateId, emailAddress, options)
  }
}

module.exports = {
  NotifyService
}

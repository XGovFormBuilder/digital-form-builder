const { NotifyClient } = require('notifications-node-client')
const { notifyApiKey } = require('./../config')

class NotifyService {
  constructor () {
    this.notifyClient = new NotifyClient(notifyApiKey)
  }

  parsePersonalisations (options) {
    let parsed = {}
    Object.assign(parsed, ...Object.keys(options).map(key => {
      parsed[key] = typeof options[key] === 'boolean' ? (options[key] ? 'yes' : 'no') : options[key]
    }))
    return parsed
  }

  sendNotification (templateId, emailAddress, reference, options) {
    let parsedOptions = {}
    parsedOptions.personalisation = this.parsePersonalisations(options)
    if (!reference) {
      parsedOptions.personalisation.reference = ''
      parsedOptions.personalisation.hasReference = 'no'
    } else {
      parsedOptions.reference = reference
      parsedOptions.personalisation.reference = reference
      parsedOptions.personalisation.hasReference = 'yes'
    }

    return this.notifyClient.sendEmail(templateId, emailAddress, parsedOptions)
  }
}

module.exports = {
  NotifyService
}

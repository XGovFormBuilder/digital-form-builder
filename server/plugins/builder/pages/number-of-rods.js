const joi = require('joi')
const Page = require('.')

class NumberOfRodsPage extends Page {
  get stateSchema () {
    const keys = this.components.getStateSchemaKeys()
    const name = this.components.formItems[0].name

    // Extend the key to validate that the date is
    // greater than today and less than today+28 days
    keys[name] = keys[name].when('licenceType', {
      is: 'troutAndCourse',
      then: joi.optional(),
      otherwise: joi.strip()
    })

    return joi.object().keys(keys)
  }
}

module.exports = NumberOfRodsPage

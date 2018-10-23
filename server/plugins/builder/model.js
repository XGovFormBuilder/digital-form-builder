const joi = require('joi')
const EngineModel = require('digital-form-builder-engine/model')

class Model extends EngineModel {
  get schema () {
    // Get entire model schema
    const keys = {}
    const sectionSchema = {}
    ;[undefined].concat(this.sections).forEach(section => {
      const sectionPages = this.pages.filter(page => page.section === section)

      if (section) {
        const sectionKeys = {}
        sectionPages.forEach(sectionPage => {
          Object.assign(sectionKeys, sectionPage.components.getStateSchemaKeys())
        })
        sectionSchema[section.name] = keys[section.name] = joi.object().required().keys(sectionKeys)
      } else {
        sectionPages.forEach(sectionPage => {
          Object.assign(keys, sectionPage.components.getStateSchemaKeys())
        })
      }
    })

    this.sectionSchema = sectionSchema
    return joi.object().required().keys(keys)
  }
}

module.exports = Model

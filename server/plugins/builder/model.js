const joi = require('joi')
const EngineModel = require('digital-form-builder-engine/model')

class Model extends EngineModel {
  makeSchema (state) {
    const schema = super.makeSchema(state)

    // Now apply business logic by
    // overriding parts of the schema
    const isSalmon = this.conditions.isSalmon.fn(state)
    const isFull = this.conditions.isFull.fn(state)
    const isAnnualAndFull = this.conditions.isAnnualAndFull.fn(state)
    const hasPIPorDLA = this.conditions.hasPIPorDLA.fn(state)
    const hasBlueBadge = this.conditions.hasBlueBadge.fn(state)
    const overrides = joi.object().keys({
      licenceDetails: joi.object().keys({
        // Strip startTime for full licences
        startTime: isFull ? joi.optional().strip() : joi.any(),
        // Strip numberOfRods for salmon licences
        numberOfRods: isSalmon ? joi.optional().strip() : joi.any()
      }),
      concessions: isAnnualAndFull
        ? joi.object().keys({
          // Strip nationalInsuranceNumber unless hasPIPorDLA
          nationalInsuranceNumber: hasPIPorDLA ? joi.any() : joi.optional().strip(),
          // Strip hasBlueBadge unless !hasPIPorDLA
          hasBlueBadge: !hasPIPorDLA ? joi.any() : joi.optional().strip(),
          // Strip blueBadgeNumber unless hasBlueBadge
          blueBadgeNumber: hasBlueBadge ? joi.any() : joi.optional().strip()
        })
        // Strip concessions unless it's an Annual + Full licence
        : joi.optional().strip()
    })

    return schema.concat(overrides)
  }
}

module.exports = Model

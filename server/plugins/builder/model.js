const joi = require('joi')
const EngineModel = require('digital-form-builder-engine/model')

class Model extends EngineModel {
  makeSchema (state) {
    const schema = super.makeSchema(state)

    // Now apply business logic by
    // overriding parts of the schema
    const conditions = this.conditions
    const isSalmon = conditions.isSalmon.fn(state)
    const isAbsolute = conditions.isAbsolute.fn(state)
    const isAbsoluteAndShortTerm = conditions.isAbsoluteAndShortTerm.fn(state)
    const isAnnualAndFull = conditions.isAnnualAndFull.fn(state)
    const hasPIPorDLA = conditions.hasPIPorDLA.fn(state)
    const hasBlueBadge = conditions.hasBlueBadge.fn(state)

    const overrides = joi.object().keys({
      licenceDetails: joi.object().keys({
        // Strip startTime/startTime
        startDate: !isAbsolute ? joi.optional().strip() : joi.any(),
        startTime: !isAbsoluteAndShortTerm ? joi.optional().strip() : joi.any(),
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
        : joi.object().keys({
          hasPIPorDLA: joi.optional(),
          nationalInsuranceNumber: joi.optional(),
          hasBlueBadge: joi.optional(),
          blueBadgeNumber: joi.optional()
        }).optional().strip()
    })

    return schema.concat(overrides)
  }
}

module.exports = Model

import joi from 'joi'
import Page from './index'

class DobPage extends Page {
  constructor (defs, pageDef) {
    super(defs, pageDef)

    this.stateSchema = this.stateSchema.append({
      ageGroup: joi.string().required().valid('junior', 'full', 'senior')
    })
  }

  getStateFromValidForm (formData) {
    const state = super.getStateFromValidForm(formData)
    const age = ~~((Date.now() - state.dob) / (31557600000))

    state.ageGroup = age < 13
      ? 'junior'
      : age > 65
        ? 'senior'
        : 'full'

    return state
  }
}

export default DobPage

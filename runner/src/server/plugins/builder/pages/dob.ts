import joi from "joi";
import Page from "./page";

class DobPage extends Page {
  // TODO: improve type, see Page once types mature
  constructor(model: any = {}, pageDef: any = {}) {
    super(model, pageDef);

    this.stateSchema = this.stateSchema.append({
      ageGroup: joi.string().required().valid("junior", "full", "senior"),
    });
  }

  getStateFromValidForm(formData) {
    const state = super.getStateFromValidForm(formData);
    const age = Math.floor((Date.now() - state.dob) / 31557600000);

    state.ageGroup = age < 13 ? "junior" : age > 65 ? "senior" : "full";

    return state;
  }
}

export default DobPage;

// Keep module.exports until https://github.com/XGovFormBuilder/digital-form-builder/issues/162
module.exports = DobPage;

import joi from "joi";
import { FormPayload } from "../types";
import { PageController } from "./PageController";

/**
 * DobPageController adds to the state a users ageGroup
 *
 * @deprecated FCDO and HO do not use this controller. No guarantee this will work!
 */
export class DobPageController extends PageController {
  // TODO: improve type, see Page once types mature
  constructor(model: any = {}, pageDef: any = {}) {
    super(model, pageDef);

    this.stateSchema = this.stateSchema.append({
      ageGroup: joi.string().required().valid("junior", "full", "senior"),
    });
  }

  getStateFromValidForm(formData: FormPayload) {
    const state = super.getStateFromValidForm(formData);
    const age = Math.floor((Date.now() - state.dob) / 31557600000);

    state.ageGroup = age < 13 ? "junior" : age > 65 ? "senior" : "full";

    return state;
  }
}

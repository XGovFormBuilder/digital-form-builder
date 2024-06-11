import { FormComponent } from "server/plugins/engine/components/FormComponent";
import { ComponentDef } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";

export class ContextComponent extends FormComponent {
  section: string;
  constructor(def: ComponentDef, model: FormModel) {
    super(def, model);
    this.section = def.section;
  }

  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const section = this.section;
    let path = "";

    if (section && section in state) {
      path = `${section}.`;
      state = {
        ...state[section],
      };
    }

    if (name in state) {
      return {
        [`${path}${name}`]: this.getFormValueFromState(state),
      };
    }

    return undefined;
  }
}

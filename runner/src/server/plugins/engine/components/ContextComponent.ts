import { FormComponent } from "server/plugins/engine/components/FormComponent";
import { ComponentDef, Page } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import _ from "lodash";

export class ContextComponent extends FormComponent {
  section: Page["section"];
  constructor(def: ComponentDef, model: FormModel) {
    super(def, model);
    this.section = def.section;
  }

  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const section = this.section;
    let path = "";
    const result = {};

    if (section && section in state) {
      path = `${section}.`;
      state = {
        ...state[section],
      };
    }

    if (name in state) {
      _.set(result, `${path}${name}`, this.getFormValueFromState(state));
      return result;
    }

    return undefined;
  }
}

import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import config from "../../../config";
import nunjucks from "nunjucks";
import { FormComponent } from "./FormComponent";
import _ from "lodash";

export class ContentWithState extends FormComponent {
  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const section = this.section;
    let path = "";
    const result = {};
    const options: any = this.options || {};
    const stateVariable = options.stateVariable;

    if (section && section in state) {
      path = `${section}.`;
      state = {
        ...state[section],
      };
    }

    if (name in state) {
      _.set(result, `${path}${name}`, this.getFormValueFromState(state));
    }

    // Use the configurable stateVariable from options
    if (stateVariable in state) {
      _.set(result, `${path}${stateVariable}`, state[stateVariable].toString());
    }

    return result;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;

    let content = this.content;
    if (config.allowUserTemplates) {
      content = nunjucks.renderString(content, {
        ...formData,
      });
    }

    const viewModel = {
      ...super.getViewModel(formData, errors),
      content: content,
    };

    if (options.condition) {
      viewModel.condition = options.condition;
    }
    return viewModel;
  }
}

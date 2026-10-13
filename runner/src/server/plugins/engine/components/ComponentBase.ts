import { Schema as JoiSchema } from "joi";
import nunjucks from "nunjucks";
import {
  ComponentDef,
  ContentComponentsDef,
  InputFieldsComponentsDef,
} from "@xgovformbuilder/model";

import config from "../../../config";
import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { DataType, ViewModel } from "./types";

export class ComponentBase {
  type: ComponentDef["type"];
  name: ComponentDef["name"];
  title: ComponentDef["title"];
  schema: ComponentDef["schema"];
  options: ComponentDef["options"];
  hint?: InputFieldsComponentsDef["hint"];
  content?: ContentComponentsDef["content"];
  /**
   * This is passed onto webhooks, see {@link answerFromDetailItem}
   */
  dataType?: DataType = "text";
  model: FormModel;

  /** joi schemas based on a component defined in the form JSON. This validates a user's answer and is generated from {@link ComponentDef} */
  formSchema?: JoiSchema;
  stateSchema?: JoiSchema;

  constructor(def: ComponentDef, model: FormModel) {
    // component definition properties
    this.type = def.type;
    this.name = def.name;
    this.title = def.title;
    this.schema = def.schema || {};
    this.options = def.options;
    this.hint = "hint" in def ? def.hint : undefined;
    this.content = "content" in def ? def.content : undefined;
    this.model = model;
  }

  /**
   * parses FormData and returns an object provided to a govuk-frontend template to render
   */
  getViewModel(_formData: FormData, _errors?: FormSubmissionErrors): ViewModel {
    return {
      attributes: {},
    };
  }

  /**
   * Renders a user-authored string (title, content, hint, label) as a nunjucks
   * template against the current form data. No-op unless templating is enabled
   * and the string actually contains a `{{ }}` token.
   */
  renderUserTemplate(value: string, formData: FormData): string {
    if (
      !config.allowUserTemplates ||
      typeof value !== "string" ||
      !value.includes("{{")
    ) {
      return value;
    }
    return nunjucks.renderString(value, { ...formData });
  }
}

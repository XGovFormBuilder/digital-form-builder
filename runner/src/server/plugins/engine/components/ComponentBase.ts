import { Schema as JoiSchema } from "joi";
import {
  Data,
  ComponentDef,
  ContentComponentsDef,
  InputFieldsComponentsDef,
  StaticValues,
} from "@xgovformbuilder/model";

import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { ViewModel } from "./types";

export class ComponentBase {
  type: ComponentDef["type"];
  name: ComponentDef["name"];
  title: ComponentDef["title"];
  schema: ComponentDef["schema"];
  options: ComponentDef["options"];
  hint?: InputFieldsComponentsDef["hint"];
  content?: ContentComponentsDef["content"];

  model: FormModel;
  values?: StaticValues;

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

    // model values
    this.model = model;

    // static values
    const data = new Data(model.def);
    this.values = data.valuesFor(def)?.toStaticValues();
  }

  getViewModel(_formData: FormData, _errors?: FormSubmissionErrors): ViewModel {
    return {
      attributes: {},
    };
  }
}

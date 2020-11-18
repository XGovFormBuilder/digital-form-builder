import { Schema as JoiSchema } from "joi";
import {
  Data,
  Component as ComponentType,
  ContentComponents,
  InputFieldsComponents,
  StaticValues,
} from "@xgovformbuilder/model";

import { FormModel } from "../formModel";
import { FormSubmissionErrors } from "../types";
import { ViewModel } from "./types";
import { ComponentCollection } from "./ComponentCollection";

interface Values extends StaticValues {
  childrenCollection?: ComponentCollection;
}

export class ComponentBase {
  type: ComponentType["type"];
  name: ComponentType["name"];
  title: ComponentType["title"];
  schema: ComponentType["schema"];
  options: ComponentType["options"];
  hint?: InputFieldsComponents["hint"];
  content?:
    | {
        title: string;
        text: string;
        condition?: any;
      }
    | ContentComponents["content"];

  model: FormModel;
  values?: Values;

  formSchema?: JoiSchema;
  stateSchema?: JoiSchema;

  constructor(def: ComponentType, model: FormModel) {
    console.log("DEF", def);
    // component definition properties
    this.type = def.type;
    this.name = def.name;
    this.title = def.title;
    this.schema = def.schema || {};
    this.options = def.options;
    this.hint = "hint" in def ? def.hint : undefined;
    // this.content = "content" in def ? def.content : undefined;

    // model values
    this.model = model;

    // static values
    const data = new Data(model.def);
    this.values = data.valuesFor(def)?.toStaticValues();
  }

  getViewModel(_formData?: any, _errors?: FormSubmissionErrors): ViewModel {
    return {
      attributes: {},
    };
  }
}

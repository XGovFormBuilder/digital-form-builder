import { Data } from "@xgovformbuilder/model";
import { PageErrors } from "../types";

import { ViewModel } from "./types";

export class Component {
  // TODO: types
  name: any;
  title: string | undefined; // TODO: remove undefined fix in constructor (remove code smell Object.assign(this, def))
  values: any;
  model: any;
  options: any;
  itemValues: any;
  formSchema: any;
  stateSchema: any;
  hint: string | undefined;
  schema: {
    max?: number | string;
    error?: any;
    regex?: string;
    precision?: number;
    email?: boolean;
  };
  content: any;
  items: any;

  constructor(def, model) {
    // TODO explicitly assign to proper initialize props expected
    Object.assign(this, def);
    this.model = model;
    const data = new Data(model.def);
    const values = data.valuesFor(def);
    this.values = values?.toStaticValues();
    this.schema = def.schema || {};
  }

  getViewModel(_formData?: any, _errors?: PageErrors): ViewModel {
    return {
      attributes: {},
    };
  }
}

import { StaticValues } from "../values";
import type { ComponentValues } from "../values";
import { Data } from "./data-model";

export class ValuesWrapper {
  values: ComponentValues;
  data: Data;

  constructor(values: ComponentValues, data: Data) {
    this.values = values;
    this.data = data;
  }

  toStaticValues(): StaticValues {
    return this.values.toStaticValues(this.data);
  }
}

import { Data } from "@xgovformbuilder/model";

export default class Component {
  constructor(def, model) {
    Object.assign(this, def);
    this.model = model;
    const data = new Data(model.def);
    const values = data.valuesFor(def);
    this.values = values ? values.toStaticValues() : undefined;
  }

  getViewModel() {
    return {};
  }
}

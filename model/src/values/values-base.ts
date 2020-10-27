import type { DataModel } from "../data-model-interface";
import { ValuesType } from "./types";

export class ValuesBase {
  type: ValuesType;

  constructor(type: ValuesType) {
    this.type = type;
  }

  toStaticValues(_data: DataModel): ValuesBase {
    throw Error(
      "Unsupported Operation. Method toStaticValues have not been implemented"
    );
  }
}

import { Data } from "../data-model/data-model";
import { ValuesType } from "./types";

export class ValuesBase {
  type: ValuesType;

  constructor(type: ValuesType) {
    this.type = type;
  }

  toStaticValues(_data: Data): ValuesBase {
    throw Error(
      "Unsupported Operation. Method toStaticValues have not been implemented"
    );
  }
}

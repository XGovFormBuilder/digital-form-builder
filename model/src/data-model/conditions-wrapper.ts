import { Condition } from "../conditions/condition";
import { ConditionsModel } from "../conditions/inline-condition-model";

type ConditionWrapperValue =
  | string
  | {
      name: string;
      conditions: Condition[];
    };

export class ConditionsWrapper {
  name: string;
  displayName: string;
  value: ConditionWrapperValue;

  constructor(rawData: {
    name: string;
    displayName: string;
    value: ConditionWrapperValue;
  }) {
    const { name, displayName, value } = rawData;
    this.displayName = displayName || name;
    this.value = value;
    this.name = name;
  }

  get expression() {
    if (typeof this.value === "string") {
      // Previously conditions were defined as strings, e.g: "section.age < 18"
      // keep this so application can support legacy forms exports.
      return this.value;
    }

    return ConditionsModel.from(this.value).toExpression();
  }

  clone(): ConditionsWrapper {
    return new ConditionsWrapper(this);
  }
}

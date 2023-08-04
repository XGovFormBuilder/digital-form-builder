import { Condition } from "../conditions/condition";
import { ConditionsModel } from "../conditions/condition-model";

export type ApiConditionWrapperValue = {
  url: string;
  values: { [k: string]: string };
};

export type ConditionWrapperValue =
  | StaticConditionWrapperValue
  | ApiConditionWrapperValue;

export type ConditionRawData = {
  name: string;
  displayName: string;
  value: ConditionWrapperValue;
};

export type StaticConditionRawData = ConditionRawData & {
  value: StaticConditionWrapperValue;
};

export type ApiConditionRawData = ConditionRawData & {
  value: ApiConditionWrapperValue;
};

export type StaticConditionWrapperValue =
  | string
  | {
      name: string;
      conditions: Condition[];
    };
export class ConditionsWrapper {
  name: string;
  displayName: string;
  value: StaticConditionWrapperValue;

  constructor(rawData: StaticConditionRawData) {
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

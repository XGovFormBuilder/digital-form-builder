import { Data } from "../data-model/data-model";
import { ValuesBase } from "./values-base";
import { ConcreteValueTypes, ValueTypes } from "./types";
import { Component } from "../components/types";

export class StaticValue {
  label: string;
  value: ConcreteValueTypes;
  hint: string | undefined;
  condition: string | undefined;
  children: Array<Component>;

  constructor(
    label: string,
    value: ConcreteValueTypes,
    hint?: string,
    condition?: string,
    children: Array<any> = []
  ) {
    this.label = label;
    this.value = value;
    this.hint = hint;
    this.condition = condition;
    this.children = children;
  }

  static from(obj: Omit<StaticValue, "from">): StaticValue {
    return new StaticValue(
      obj.label,
      obj.value,
      obj.hint,
      obj.condition,
      obj.children
    );
  }
}

export class StaticValues extends ValuesBase {
  valueType: ValueTypes;
  items: Array<StaticValue>;

  constructor(valueType: ValueTypes, items: Array<StaticValue>) {
    super("static");
    this.valueType = valueType;
    this.items = items;
  }

  toStaticValues(_data: Data): StaticValues {
    return this;
  }

  static from(
    obj: Pick<StaticValues, "type" | "valueType" | "items">
  ): StaticValues {
    if (obj.type === "static") {
      return new StaticValues(
        obj.valueType,
        (obj.items ?? []).map((it) => StaticValue.from(it))
      );
    }

    throw Error(
      `Cannot create from non static values object ${JSON.stringify(obj)}`
    );
  }
}

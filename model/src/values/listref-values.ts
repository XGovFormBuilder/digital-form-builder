import { Data } from "../data-model/data-model";
import { ConcreteValueTypes } from "./types";
import { StaticValue, StaticValues } from "./static-values";
import { Component } from "../components/types";

export class ValueChildren {
  value: ConcreteValueTypes;
  children: Array<Component>;

  constructor(value: ConcreteValueTypes, children: Array<any>) {
    this.value = value;
    this.children = children;
  }

  static from(obj: Pick<ValueChildren, "value" | "children">) {
    return new ValueChildren(obj.value, obj.children);
  }
}

export class ListRefValues {
  type: "listRef" = "listRef";
  list: string;
  valueChildren: Array<ValueChildren>;

  constructor(list: string, valueChildren: Array<ValueChildren>) {
    this.list = list;
    this.valueChildren = valueChildren;
  }

  toStaticValues(data: Data): StaticValues {
    if (this.list) {
      const list = data.findList(this.list);
      if (list) {
        return new StaticValues(
          list.type,
          list.items.map(
            (item) =>
              new StaticValue(
                item.text,
                item.value,
                item.description,
                item.condition,
                this.valueChildren.find((it) => it.value === item.value)
                  ?.children ?? []
              )
          )
        );
      } else {
        throw Error(`Could not find list with name ${this.list}`);
      }
    }
    // just return some default values as we're not a completely defined component yet (used in the designer)
    return new StaticValues("string", []);
  }

  toJSON() {
    return { list: this.list, valueChildren: this.valueChildren };
  }

  static from(
    obj: Pick<ListRefValues, "type" | "list" | "valueChildren">
  ): ListRefValues {
    if (obj.type === "listRef") {
      return new ListRefValues(
        obj.list,
        (obj.valueChildren ?? []).map((it) => ValueChildren.from(it))
      );
    }
    throw Error(
      `Cannot create from non listRef values object ${JSON.stringify(obj)}`
    );
  }
}

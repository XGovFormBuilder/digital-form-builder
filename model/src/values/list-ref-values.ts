import type { DataModel } from "../data-model-interface";
import { ConcreteValueTypes } from "./types";
import { ValuesBase } from "./values-base";
import { StaticValue, StaticValues } from "./static-values";

export type ListRefValuesLikeObject = {
  type: "listRef";
  list: string;
  valueChildren: Array<ValueChildren>;
};

export class ValueChildren {
  value: ConcreteValueTypes;
  children: Array<any>; // should be Array<Component> whenever someone introduces the appropriate class

  constructor(value: ConcreteValueTypes, children: Array<any>) {
    this.value = value;
    this.children = children;
  }

  static from(obj: { value: ConcreteValueTypes; children: Array<any> }) {
    return new ValueChildren(obj.value, obj.children);
  }
}

export class ListRefValues extends ValuesBase {
  list: string;
  valueChildren: Array<ValueChildren>;

  constructor(list: string, valueChildren: Array<ValueChildren>) {
    super("listRef");
    this.list = list;
    this.valueChildren = valueChildren;
  }

  toStaticValues(data: DataModel): StaticValues {
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

  static from(obj: ListRefValuesLikeObject): ListRefValues {
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

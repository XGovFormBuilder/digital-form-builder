import { ListRefValues, ListRefValuesLikeObject } from "./list-ref-values";
import { StaticValues, StaticValuesLikeObject } from "./static-values";

interface ValuesFrom {
  (obj: StaticValuesLikeObject | ListRefValuesLikeObject):
    | StaticValues
    | ListRefValues
    | never;
}

export const valuesFrom: ValuesFrom = (obj) => {
  switch (obj?.type) {
    case "static":
      return StaticValues.from(obj);
    case "listRef":
      return ListRefValues.from(obj);
    default:
      throw Error(`No constructor found for object ${JSON.stringify(obj)}`);
  }
};

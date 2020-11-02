import { ListRefValues } from "./listref-values";
import { StaticValues } from "./static-values";

type StaticValuesObj = Pick<StaticValues, "type" | "valueType" | "items">;
type ListRefValuesObj = Pick<ListRefValues, "type" | "list" | "valueChildren">;

interface ValuesFrom {
  (obj: StaticValuesObj | ListRefValuesObj):
    | StaticValues
    | ListRefValues
    | never;
}

export const valuesFrom: ValuesFrom = (obj) => {
  switch (obj?.type) {
    case "static":
      return StaticValues.from(obj as StaticValuesObj);
    case "listRef":
      return ListRefValues.from(obj as ListRefValuesObj);
    default:
      throw Error(`No constructor found for object ${JSON.stringify(obj)}`);
  }
};

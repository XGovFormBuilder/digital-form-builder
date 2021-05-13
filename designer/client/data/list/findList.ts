import { FormDefinition, List } from "@xgovformbuilder/model";
import { Found } from "../types";

export function findList(
  data: FormDefinition,
  name: List["name"]
): Found<List> {
  const index = data.lists.findIndex((list) => list.name === name);
  if (index < 0) {
    throw Error(`No list found with the name ${name}`);
  }
  return [data.lists[index], index];
}

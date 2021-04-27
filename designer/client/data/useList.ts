import { FormDefinition, List } from "@xgovformbuilder/model";

type FoundList = [List, number];
export function findList(data: FormDefinition, name: List["name"]): FoundList {
  const index = data.lists.findIndex((list) => list.name === name);
  if (index < 0) {
    throw Error(`No list found with the name ${name}`);
  }
  return [data.lists[index], index];
}

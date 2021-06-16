import { FormDefinition, List } from "@xgovformbuilder/model";

export function addList(data: FormDefinition, list: List): FormDefinition {
  const index = data.lists.findIndex((l) => l.name === list.name);
  if (index > -1) {
    throw Error(`A list with the name ${list.name} already exists`);
  }
  return {
    ...data,
    lists: [...data.lists, list],
  };
}

import { FormDefinition } from "@xgovformbuilder/model";

export function hasConditions(data: FormDefinition): boolean {
  return data.conditions.length > 0;
}

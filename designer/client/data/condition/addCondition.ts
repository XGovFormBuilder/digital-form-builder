import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";

export function addCondition(
  data: FormDefinition,
  condition: ConditionRawData
): FormDefinition {
  return {
    ...data,
    conditions: [...data.conditions, condition],
  };
}

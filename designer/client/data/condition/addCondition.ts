import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";

export function addCondition(
  data: FormDefinition,
  condition: ConditionRawData
): FormDefinition {
  if (data.conditions.find((c) => condition.name === c.name)) {
    throw Error(`A condition with the name ${condition.name} already exists`);
  }
  return {
    ...data,
    conditions: [...data.conditions, condition],
  };
}

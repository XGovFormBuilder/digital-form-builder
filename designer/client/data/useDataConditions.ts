import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";

type ConditionName = Pick<ConditionsWrapper, "name">;
type ConditionDisplayName = Pick<ConditionsWrapper, "displayName">;

export function addCondition(
  data: FormDefinition,
  condition: ConditionRawData
) {
  return {
    ...data,
    conditions: [...data.conditions, condition],
  };
}

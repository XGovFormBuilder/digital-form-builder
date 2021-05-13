import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";

/**
 * @param data
 * @param conditionName
 * @param updatedPartial The condition name cannot be changed, hence Omit<ConditionRawData, "name">
 */
export function updateCondition(
  data: FormDefinition,
  conditionName: ConditionRawData["name"],
  updatedPartial: Partial<Omit<ConditionRawData, "name">>
): FormDefinition {
  const conditions = [...data.conditions!];
  const conditionIndex = conditions.findIndex(
    (condition) => condition.name === conditionName
  );
  if (conditionIndex < 0) {
    throw Error(`No condition found with name ${conditionName}`);
  }
  const condition = data.conditions[conditionIndex];
  const {
    displayName = condition.displayName,
    value: conditionValue = condition.value,
  } = updatedPartial;

  const updatedCondition = {
    ...condition,
    displayName,
    value: conditionValue,
  };

  return {
    ...data,
    conditions: conditions.map((condition, i) =>
      i === conditionIndex ? updatedCondition : condition
    ),
  };
}

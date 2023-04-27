import { ConditionData } from "./SelectConditions";

export const isObjectCondition = (condition: ConditionData) => {
  return typeof condition.value !== "string";
};

export const isStringCondition = (condition: ConditionData) => {
  return typeof condition.value === "string";
};

export const hasConditionName = (condition: any) => {
  return !!condition?.conditionName;
};

export const hasNestedCondition = (condition: ConditionData) => {
  if (typeof condition.value === "string") {
    return false;
  }
  return condition.value.conditions?.find?.(hasConditionName) ?? false;
};

export const isDuplicateCondition = (
  conditions: any[],
  conditionName: string
) => {
  return !!conditions.find((condition) => condition.name === conditionName);
};

export const getFieldNameSubstring = (sectionFieldName: string) => {
  return sectionFieldName.substring(sectionFieldName.indexOf("."));
};

export function conditionsByType(conditions: ConditionData[]) {
  return conditions.reduce(
    (conditionsByType, currentValue) => {
      if (isStringCondition(currentValue)) {
        conditionsByType.string.push(currentValue);
      } else if (!!hasNestedCondition(currentValue)) {
        conditionsByType.nested.push(currentValue);
      } else if (isObjectCondition(currentValue)) {
        conditionsByType.object.push(currentValue);
      }
      return conditionsByType;
    },
    {
      string: [],
      nested: [],
      object: [],
    } as ConditionByTypeMap
  );
}

type ConditionByTypeMap = {
  string: ConditionData[];
  nested: ConditionData[];
  object: ConditionData[];
};

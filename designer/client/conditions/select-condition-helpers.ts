import { ConditionData } from "./SelectConditions";

// return whether the current condition has an object value
export const isObjectCondition = (condition: ConditionData) => {
  return typeof condition.value !== "string";
};

// return whether the current condition value has the conditionName property
export const hasConditionName = (condition: any) => {
  return !!condition?.conditionName;
};

// return whether the current condition has a nested condition as a value
export const hasNestedCondition = (condition: ConditionData) => {
  return condition.value.conditions?.find?.(hasConditionName);
};

// return whether the current condition is already in the supplied condition array
export const isDuplicateCondition = (
  conditions: any[],
  conditionName: string
) => {
  return !!conditions.find((condition) => condition.name === conditionName);
};

// return the substring of the field name from the combined section and field name
export const getFieldNameSubstring = (sectionFieldName: string) => {
  return sectionFieldName.substring(sectionFieldName.indexOf("."));
};

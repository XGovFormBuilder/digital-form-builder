import { ConditionData } from "./SelectConditions";
import { ConditionRef } from "@xgovformbuilder/model";

export function isStringCondition(condition: ConditionData) {
  return typeof condition.value === "string";
}

export function isConditionRef(condition): condition is ConditionRef {
  return condition?.conditionName !== undefined;
}

export function hasNestedCondition(condition: ConditionData) {
  if (typeof condition.value === "string") {
    return false;
  }
  return condition.value.conditions?.find?.(isConditionRef) ?? false;
}

export function getConditionType(condition: ConditionData) {
  if (isStringCondition(condition)) {
    return "string";
  }
  if (!!hasNestedCondition(condition)) {
    return "nested";
  }
  return "object";
}

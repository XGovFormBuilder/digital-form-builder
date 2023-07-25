import { ConditionData, ConditionObject } from "./SelectConditions";
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

export function validateSimpleCondition(
  condition: ConditionData,
  fields: string[]
) {
  if (isStringCondition(condition)) {
    return checkStringCondition(condition, fields);
  }
  return checkCondition(condition, fields);
}

export function validateNestedCondition(
  condition: ConditionData,
  fields: string[],
  validConditions: ConditionData[],
  allConditions: ConditionData[]
) {
  let conditionsToAdd: ConditionData[] = [];
  let toBeAdded = true;
  let conditionValue = condition.value as ConditionObject;
  let validConditionNames = validConditions.map(
    (validCondition) => validCondition.name
  );

  conditionValue.conditions.forEach((innerCondition) => {
    let isReferenceToCondition = isConditionRef(innerCondition);
    const conditionAlreadyValid = validConditionNames.includes(
      innerCondition.conditionName
    );
    if (isReferenceToCondition && !conditionAlreadyValid) {
      const conditionToCheck = allConditions.find(
        (checkCondition) => checkCondition.name === innerCondition.conditionName
      );
      if (!conditionToCheck) {
        throw new Error(
          `There was an error processing a condition. The condition with the name ${condition.name} referenced a condition ${innerCondition.conditionName}, but no such condition exists.`
        );
      }
      let newConditionsToAdd = validateNestedCondition(
        conditionToCheck,
        fields,
        validConditions,
        allConditions
      );
      const shouldConditionBeAdded =
        newConditionsToAdd.find(
          (newCondition) => newCondition.name === conditionToCheck.name
        ) !== undefined;
      if (!shouldConditionBeAdded) {
        toBeAdded = false;
      }
      conditionsToAdd = conditionsToAdd.concat(newConditionsToAdd);
    }
    if (
      !isReferenceToCondition &&
      !fields.includes(innerCondition.field.name)
    ) {
      toBeAdded = false;
    }
  });
  if (toBeAdded) {
    conditionsToAdd.push(condition);
  }
  return conditionsToAdd;
}

function checkCondition(condition: ConditionData, fields: string[]) {
  let conditionValue = condition.value as ConditionObject;
  return conditionValue.conditions.every((innerCondition) =>
    fields.includes(innerCondition.field.name)
  );
}

function checkStringCondition(condition: ConditionData, fields: string[]) {
  const conditionValue: string = condition.value as string;
  const operators = ["==", "!=", ">", "<"];
  if (!operators.some((operator) => conditionValue.includes(operator))) {
    return false;
  }
  let conditionFieldName = conditionValue.substring(
    0,
    conditionValue.lastIndexOf(
      operators.find((operator) => conditionValue.includes(operator)) as string
    )
  );
  return fields.includes(conditionFieldName.trim());
}

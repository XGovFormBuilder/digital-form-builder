import randomId from "../randomId";
import { addCondition, hasConditions } from "./../data";

/**
 * @param data
 * @param conditions {ConditionsModel}
 * @returns {FormDefinition, String?}
 */
function storeConditionIfNecessary(data, conditions) {
  let condition;
  let updated;
  if (conditions?.hasConditions) {
    condition = randomId();
    const { conditions: conditionsArray } = conditions;
    updated = addCondition(
      data,
      conditions.toJSON?.() ?? {
        name: condition,
        conditions: [...conditionsArray],
      }
    );
  }

  return { data: updated ?? data, condition };
}

export default {
  storeConditionIfNecessary: storeConditionIfNecessary,
};

export const tryParseInt = (val) => {
  let parsed = parseInt(val, 10);
  return isNaN(parsed) ? undefined : parsed;
};

export const isInt = (val) => {
  const int = parseInt(val, 10);
  return !isNaN(int);
};

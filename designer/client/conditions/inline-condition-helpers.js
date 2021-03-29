import { nanoid } from "nanoid";

async function storeConditionIfNecessary(data, conditions) {
  let condition;

  if (conditions && conditions.hasConditions) {
    condition = nanoid();
    data = data.addCondition(condition, conditions.name, conditions);
  }

  return { data, condition };
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

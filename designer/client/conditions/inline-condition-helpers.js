export const storeConditionIfNecessary = async (data, conditions) => {
  let condition;
  if (conditions && conditions.hasConditions) {
    condition = await data.getId();
    data = data.addCondition(condition, conditions.name, conditions);
  }
  return { data, condition };
};

export const tryParseInt = (val) => {
  let parsed = parseInt(val, 10);
  return isNaN(parsed) ? undefined : parsed;
};

export const isInt = (val) => {
  const int = parseInt(val, 10);
  return !isNaN(int);
};

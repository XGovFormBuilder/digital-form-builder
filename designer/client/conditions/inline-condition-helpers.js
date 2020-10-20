async function storeConditionIfNecessary(data, conditions) {
  let condition;
  if (conditions && conditions.hasConditions) {
    condition = await data.getId();
    data = data.addCondition(condition, conditions.name, conditions);
  }
  return { data, condition };
}

export default {
  storeConditionIfNecessary: storeConditionIfNecessary,
};

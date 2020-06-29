async function storeConditionIfNecessary (data, selectedCondition, conditions) {
  let condition
  if (conditions && conditions.hasConditions) {
    condition = await data.getId()
    data = data.addCondition(condition, conditions.name, conditions.toExpression())
  } else {
    condition = selectedCondition
  }
  return { data, condition }
}

export default {
  storeConditionIfNecessary: storeConditionIfNecessary
}

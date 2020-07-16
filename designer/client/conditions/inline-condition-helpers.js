export async function storeConditionIfNecessary (data, conditions) {
  let condition
  if (conditions && conditions.hasConditions) {
    condition = await data.getId()
<<<<<<< HEAD
    data = data.addCondition(condition, conditions.name, conditions.toExpression())
=======
    data = data.addCondition(condition, conditions.name, conditions)
  } else {
    condition = selectedCondition
>>>>>>> Send the conditions model across to the runner
  }
  return { data, condition }
}

export default {
  storeConditionIfNecessary: storeConditionIfNecessary
}

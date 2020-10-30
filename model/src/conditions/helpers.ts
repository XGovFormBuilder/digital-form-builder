export function toPresentationString(condition) {
  return `${condition.coordinatorString()}${condition.conditionString()}`;
}

export function toExpression(condition) {
  return `${condition.coordinatorString()}${condition.conditionExpression()}`;
}

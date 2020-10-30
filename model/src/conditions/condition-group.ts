import { toPresentationString, toExpression } from "./helpers";
import { Coordinator, ConditionsArray } from "./types";

export class ConditionGroup {
  conditions: ConditionsArray;

  constructor(conditions: ConditionsArray = []) {
    if (!Array.isArray(conditions) || conditions.length < 2) {
      throw Error("Cannot construct a condition group from a single condition");
    }

    this.conditions = conditions;
  }

  coordinatorString() {
    return this.conditions[0].coordinatorString();
  }

  conditionString() {
    const copy = [...this.conditions];
    copy.splice(0, 1);
    return `(${this.conditions[0].conditionString()} ${copy
      .map((condition) => toPresentationString(condition))
      .join(" ")})`;
  }

  conditionExpression() {
    const copy = [...this.conditions];
    copy.splice(0, 1);
    return `(${this.conditions[0].conditionExpression()} ${copy
      .map((condition) => toExpression(condition))
      .join(" ")})`;
  }

  asFirstCondition() {
    this.conditions[0].asFirstCondition();
    return this;
  }

  getCoordinator() {
    return this.conditions[0].getCoordinator();
  }

  setCoordinator(coordinator: Coordinator | undefined) {
    this.conditions[0].setCoordinator(coordinator);
  }

  isGroup() {
    return true;
  }

  getGroupedConditions() {
    return this.conditions.map((condition) => condition.clone());
  }

  clone() {
    return new ConditionGroup(
      this.conditions.map((condition) => condition.clone())
    );
  }
}

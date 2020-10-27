import { AbstractCondition } from "./condition";
import { Coordinator } from "./helpers";

export class ConditionRef extends AbstractCondition {
  conditionName: string;
  conditionDisplayName: string;

  constructor(
    conditionName: string,
    conditionDisplayName: string,
    coordinator: Coordinator | undefined
  ) {
    super(coordinator);

    if (typeof conditionName !== "string") {
      throw Error(`condition name ${conditionName} is not valid`);
    }

    if (typeof conditionDisplayName !== "string") {
      throw Error(
        `condition display name ${conditionDisplayName} is not valid`
      );
    }

    this.conditionName = conditionName;
    this.conditionDisplayName = conditionDisplayName;
  }

  asFirstCondition() {
    this._asFirstCondition();
    return this;
  }

  conditionString() {
    return `'${this.conditionDisplayName}'`;
  }

  conditionExpression() {
    return this.conditionName;
  }

  clone() {
    return new ConditionRef(
      this.conditionName,
      this.conditionDisplayName,
      this.coordinator
    );
  }
}

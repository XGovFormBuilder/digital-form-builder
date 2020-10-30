import { ConditionField } from "./condition-field";
import { ConditionAbstract } from "./condition-abstract";
import { getExpression } from "./condition-operators";
import { ConditionValue, RelativeTimeValue } from "./condition-values";
import { ConditionValueAbstract } from "./condition-value-abstract";
import { Coordinator } from "./types";

export class Condition extends ConditionAbstract {
  field: ConditionField;
  operator: string;
  value: ConditionValue | RelativeTimeValue;

  constructor(
    field: ConditionField,
    operator: string,
    value: ConditionValue | RelativeTimeValue,
    coordinator?: Coordinator
  ) {
    super(coordinator);

    if (!(field instanceof ConditionField)) {
      throw Error(`field ${field} is not a valid ConditionField object`);
    }
    if (typeof operator !== "string") {
      throw Error(`operator ${operator} is not a valid operator`);
    }
    if (!(value instanceof ConditionValueAbstract)) {
      throw Error(`value ${value} is not a valid value type`);
    }

    this.field = field;
    this.operator = operator;
    this.value = value;
  }

  asFirstCondition() {
    this._asFirstCondition();
    return this;
  }

  conditionString() {
    return `'${this.field.display}' ${
      this.operator
    } '${this.value.toPresentationString()}'`;
  }

  conditionExpression() {
    return getExpression(
      this.field.type,
      this.field.name,
      this.operator,
      this.value
    );
  }

  clone() {
    return new Condition(
      ConditionField.from(this.field),
      this.operator,
      this.value.clone(),
      this.coordinator
    );
  }
}

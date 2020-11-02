import { Registration } from "./condition-value-registration";

export class ConditionValueAbstract {
  type: string;

  constructor(registration: Registration) {
    if (new.target === ConditionValueAbstract) {
      throw new TypeError("Cannot construct ConditionValue instances directly");
    }

    if (!(registration instanceof Registration)) {
      throw new TypeError(
        "You must register your value type! Call registerValueType!"
      );
    }

    this.type = registration.type;
  }

  toPresentationString() {
    throw new Error(
      "Unsupported Operation. Method toPresentationString have not been implemented"
    );
  }
  toExpression() {
    throw new Error(
      "Unsupported Operation. Method toExpression have not been implemented"
    );
  }
}

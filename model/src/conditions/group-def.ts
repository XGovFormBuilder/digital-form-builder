import { Condition } from "./condition";
import { ConditionRef } from "./condition-ref";
import { ConditionGroup } from "./condition-group";

type ConditionsArray = (Condition | ConditionGroup | ConditionRef)[];

export class GroupDef {
  first: number;
  last: number;

  constructor(first: number, last: number) {
    if (typeof first !== "number" || typeof last !== "number") {
      throw Error(`Cannot construct a group from ${first} and ${last}`);
    } else if (first >= last) {
      throw Error(`Last (${last}) must be greater than first (${first})`);
    }

    this.first = first;
    this.last = last;
  }

  contains(index: number) {
    return this.first <= index && this.last >= index;
  }

  startsWith(index: number) {
    return this.first === index;
  }

  applyTo(conditions: ConditionsArray) {
    return [...conditions].splice(this.first, this.last - this.first + 1);
  }
}

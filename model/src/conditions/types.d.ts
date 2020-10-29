import { Condition } from "./condition";
import { ConditionRef } from "./condition-ref";
import { ConditionGroup } from "./condition-group";

export type ConditionsArray = (Condition | ConditionGroup | ConditionRef)[];

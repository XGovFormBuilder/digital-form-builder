import { Condition } from "./condition";
import { ConditionRef } from "./condition-ref";
import { ConditionGroup } from "./condition-group";

export type ConditionsArray = (Condition | ConditionGroup | ConditionRef)[];

export enum Coordinator {
  AND = "and",
  OR = "or",
}

export type DateTimeUnitValues =
  | "years"
  | "months"
  | "days"
  | "hours"
  | "minutes"
  | "seconds";

export type DateUnits = {
  YEARS: { display: "year(s)"; value: "years" };
  MONTHS: { display: "month(s)"; value: "months" };
  DAYS: { display: "day(s)"; value: "days" };
};

export type TimeUnits = {
  HOURS: { display: "hour(s)"; value: "hours" };
  MINUTES: { display: "minute(s)"; value: "minutes" };
  SECONDS: { display: "second(s)"; value: "seconds" };
};

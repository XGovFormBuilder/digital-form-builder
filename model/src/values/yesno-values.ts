import { StaticValue, StaticValues } from "./static-values";

export const yesNoValues: StaticValues = new StaticValues("boolean", [
  new StaticValue("Yes", true),
  new StaticValue("No", false),
]);

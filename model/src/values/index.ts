import { ListRefValues } from "./listref-values";
import { StaticValues } from "./static-values";

export { yesNoValues } from "./yesno-values";
export { valuesFrom } from "./helpers";
export { StaticValues, StaticValue } from "./static-values";

export type ComponentValues = StaticValues | ListRefValues;

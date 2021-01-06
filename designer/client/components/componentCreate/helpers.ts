import { i18n } from "../../i18n";

export function typeToFieldName(type: string = "") {
  const isField = type.includes("Field");
  const [name] = type.split(/field/i);
  return `${name}${isField ? ` ${i18n("field")}` : ""}`;
}

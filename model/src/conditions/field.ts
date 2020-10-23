import ComponentTypes, { ComponentName } from "../component-types";

export class Field {
  name: string;
  type: ComponentName;
  display: string;

  constructor(name: string, type: ComponentName, display: string) {
    if (!name || typeof name !== "string") {
      throw Error(`name ${name} is not valid`);
    }
    if (!ComponentTypes.find((componentType) => componentType.name === type)) {
      throw Error(`type ${type} is not valid`);
    }
    if (!display || typeof display !== "string") {
      throw Error(`display ${display} is not valid`);
    }
    this.name = name;
    this.type = type;
    this.display = display;
  }

  static from(obj: { name: string; type: ComponentName; display: string }) {
    return new Field(obj.name, obj.type, obj.display);
  }
}

import { ComponentTypes, ComponentType } from "../components";

export class ConditionField {
  name: string;
  type: ComponentType;
  display: string;

  constructor(name: string, type: ComponentType, display: string) {
    if (!name || typeof name !== "string") {
      throw Error(`name ${name} is not valid`);
    }

    if (!ComponentTypes.find((componentType) => componentType.type === type)) {
      throw Error(`type ${type} is not valid`);
    }

    if (!display || typeof display !== "string") {
      throw Error(`display ${display} is not valid`);
    }

    this.name = name;
    this.type = type;
    this.display = display;
  }

  static from(obj: { name: string; type: ComponentType; display: string }) {
    return new ConditionField(obj.name, obj.type, obj.display);
  }
}

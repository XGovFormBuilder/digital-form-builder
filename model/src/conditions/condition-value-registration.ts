const conditionValueFactories = {};

export class Registration {
  type: string;

  constructor(type: string, factory: (obj: any) => Registration) {
    conditionValueFactories[type] = factory;
    this.type = type;
  }

  static register(type: string, factory: (obj: any) => Registration) {
    return new Registration(type, factory);
  }

  static conditionValueFrom(obj: { type: string; [prop: string]: any }) {
    return conditionValueFactories[obj.type](obj);
  }
}

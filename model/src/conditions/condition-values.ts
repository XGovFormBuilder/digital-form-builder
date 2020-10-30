const conditionValueFactories = {};

class Registration {
  type: string;

  constructor(type: string, factory) {
    conditionValueFactories[type] = factory;
    this.type = type;
  }
}

export class AbstractConditionValue {
  type: string;

  constructor(registration) {
    if (new.target === AbstractConditionValue) {
      throw new TypeError("Cannot construct ConditionValue instances directly");
    }

    if (!(registration instanceof Registration)) {
      throw new TypeError(
        "You must register your value type! Call registerValueType!"
      );
    }

    this.type = registration.type;
  }

  toPresentationString() {}
  toExpression() {}
}

export class ConditionValue extends AbstractConditionValue {
  value: string;
  display: string;

  constructor(value: string, display?: string) {
    super(valueType);

    if (!value || typeof value !== "string") {
      throw Error(`value ${value} is not valid`);
    }

    if (display && typeof display !== "string") {
      throw Error(`display ${display} is not valid`);
    }

    this.value = value;
    this.display = display || value;
  }

  toPresentationString() {
    return this.display;
  }

  toExpression() {
    return this.value;
  }

  static from(obj: { value: string; display?: string }) {
    return new ConditionValue(obj.value, obj.display);
  }

  clone() {
    return ConditionValue.from(this);
  }
}

const valueType = registerValueType("Value", (obj) => ConditionValue.from(obj));

export enum DateDirections {
  FUTURE = "in the future",
  PAST = "in the past",
}

type DateTimeUnitValues =
  | "years"
  | "months"
  | "days"
  | "hours"
  | "minutes"
  | "seconds";

type DateUnits = {
  YEARS: { display: "year(s)"; value: "years" };
  MONTHS: { display: "month(s)"; value: "months" };
  DAYS: { display: "day(s)"; value: "days" };
};

type TimeUnits = {
  HOURS: { display: "hour(s)"; value: "hours" };
  MINUTES: { display: "minute(s)"; value: "minutes" };
  SECONDS: { display: "second(s)"; value: "seconds" };
};

export const dateUnits: DateUnits = {
  YEARS: { display: "year(s)", value: "years" },
  MONTHS: { display: "month(s)", value: "months" },
  DAYS: { display: "day(s)", value: "days" },
};

export const timeUnits: TimeUnits = {
  HOURS: { display: "hour(s)", value: "hours" },
  MINUTES: { display: "minute(s)", value: "minutes" },
  SECONDS: { display: "second(s)", value: "seconds" },
};

export const dateTimeUnits: DateUnits & TimeUnits = Object.assign(
  {},
  dateUnits,
  timeUnits
);

export class RelativeTimeValue extends AbstractConditionValue {
  timePeriod: string;
  timeUnit: DateTimeUnitValues;
  direction: DateDirections;
  timeOnly: boolean;

  constructor(
    timePeriod: string,
    timeUnit: DateTimeUnitValues,
    direction: DateDirections,
    timeOnly = false
  ) {
    super(relativeTimeValueType);

    if (typeof timePeriod !== "string") {
      throw Error(`time period ${timePeriod} is not valid`);
    }

    if (
      !Object.values(dateTimeUnits)
        .map((unit) => unit.value)
        .includes(timeUnit)
    ) {
      throw Error(`time unit ${timeUnit} is not valid`);
    }

    if (!Object.values(DateDirections).includes(direction)) {
      throw Error(`direction ${direction} is not valid`);
    }

    this.timePeriod = timePeriod;
    this.timeUnit = timeUnit;
    this.direction = direction;
    this.timeOnly = timeOnly;
  }

  toPresentationString() {
    return `${this.timePeriod} ${this.timeUnit} ${this.direction}`;
  }

  toExpression(): string {
    const timePeriod =
      this.direction === DateDirections.PAST
        ? 0 - Number(this.timePeriod)
        : this.timePeriod;
    return this.timeOnly
      ? `timeForComparison(${timePeriod}, '${this.timeUnit}')`
      : `dateForComparison(${timePeriod}, '${this.timeUnit}')`;
  }

  static from(obj) {
    return new RelativeTimeValue(
      obj.timePeriod,
      obj.timeUnit,
      obj.direction,
      obj.timeOnly
    );
  }

  clone() {
    return RelativeTimeValue.from(this);
  }
}

export const relativeTimeValueType = registerValueType(
  "RelativeTime",
  (obj): RelativeTimeValue => RelativeTimeValue.from(obj)
);

/**
 * All value types should call this, and should be located in this file.
 * Furthermore the types should be registered without the classes needing to be instantiated.
 *
 * Otherwise we can't guarantee they've been registered for deserialization before
 * valueFrom is called
 */
function registerValueType(type: string, factory: (obj: any) => Registration) {
  return new Registration(type, factory);
}

export function valueFrom(obj) {
  return conditionValueFactories[obj.type](obj);
}

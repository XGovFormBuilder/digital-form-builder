import joi from "joi";
import { add, startOfToday, sub } from "date-fns";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * FIXME:- this code is bonkers. buildFormSchema and buildState schema are duplicates.
 * The xxField classes should be responsible for generating their own schemas.
 */
export function buildSchema(type, keys) {
  let schema = type?.isJoi ? type : joi[type?.type ?? type]();

  Object.keys(keys).forEach((key) => {
    let val = keys[key];
    if (key === "regex") {
      val = new RegExp(val);
    }
    schema[key](typeof val === "boolean" ? undefined : val);
  });

  return schema;
}

export function buildFormSchema(schemaType, component, isRequired = true) {
  let schema = buildSchema(schemaType, component.schema);

  if (isRequired) {
    schema = schema.required();
  }

  if (component.title) {
    schema = schema.label(
      typeof component.title === "string" ? component.title : component.title.en
    );
  }

  if (component.options.required === false) {
    schema = schema.allow(null, "").optional();
  }

  if (schema.trim && component.schema.trim !== false) {
    schema = schema.trim();
  }

  return schema;
}

export function buildStateSchema(schemaType, component) {
  let schema = buildSchema(schemaType, component.schema);

  if (component.title) {
    schema = schema.label(
      typeof component.title === "string"
        ? component.title.toLowerCase()
        : component.title.en.toLowerCase()
    );
  }

  if (component.options.required !== false) {
    schema = schema.required();
  }

  if (component.options.required === false) {
    schema = schema.allow(null, "").optional();
  }

  if (component.options.errorLabel) {
    schema = schema.label(component.options.errorLabel);
  }

  if (schema.trim && component.schema.trim !== false) {
    schema = schema.trim();
  }

  return schema;
}

export function getFormSchemaKeys(_name, schemaType, component) {
  const schema = buildFormSchema(schemaType, component);

  return { [component.name]: schema };
}

export function getStateSchemaKeys(name, schemaType, component) {
  const schema = buildStateSchema(schemaType, component);

  return { [name]: schema };
}

export const addClassOptionIfNone = (
  options: { classes?: string; [prop: string]: any },
  className: string
) => {
  if (!options.classes) {
    options.classes = className;
  }
};

export function getCustomDateValidator(
  maxDaysInPast?: number,
  maxDaysInFuture?: number
) {
  return (value: Date, helpers: joi.CustomHelpers) => {
    if (maxDaysInPast) {
      const minDate = sub(startOfToday(), { days: maxDaysInPast });
      if (value < minDate) {
        return helpers.error("date.min", {
          label: helpers.state.key,
          limit: minDate,
        });
      }
    }

    if (maxDaysInFuture) {
      const maxDate = add(startOfToday(), { days: maxDaysInFuture });
      if (value > maxDate) {
        return helpers.error("date.max", {
          label: helpers.state.key,
          limit: maxDate,
        });
      }
    }
    const year = value.getFullYear();

    // Workaround to force an error on optional date parts fields
    switch (year) {
      case 1899:
        return helpers.error("date.base", { label: helpers.state.key });
      case 100:
        return helpers.error("date.year", { label: helpers.state.key });
      case 200:
        return helpers.error("date.month", { label: helpers.state.key });
      case 300:
        return helpers.error("date.day", { label: helpers.state.key });
      case 400:
        return helpers.error("date.dayYear", { label: helpers.state.key });
      case 500:
        return helpers.error("date.monthYear", { label: helpers.state.key });
      case 600:
        return helpers.error("date.dayMonth", { label: helpers.state.key });
      default:
        break;
    }

    if (year < 1000) {
      return helpers.error("date.year4digits", { label: helpers.state.key });
    }

    return value;
  };
}

export function internationalPhoneValidator(
  value: string,
  _helpers: joi.CustomHelpers
) {
  const phone = phoneUtil.parseAndKeepRawInput(value);
  return phoneUtil.format(phone, PhoneNumberFormat.INTERNATIONAL);
}

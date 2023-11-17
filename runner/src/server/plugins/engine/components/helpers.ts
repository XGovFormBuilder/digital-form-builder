import joi from "joi";
import { add, startOfToday, sub } from "date-fns";
import { FormSubmissionState } from "server/plugins/engine/types";
import nunjucks from "nunjucks";

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
      typeof component.title === "string"
        ? component.title.toLowerCase()
        : component.title.en.toLowerCase()
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
    return value;
  };
}
export function getVarsForTemplate(
  content: string,
  state: FormSubmissionState
) {
  // This regex will match field names that are used explicitly in templates e.g. {{ contentToDisplay }}
  const fieldsUsedAtTopLevelRegex = new RegExp(
    /\{\{([a-zA-Z0-9\s_-]*)}}/,
    "gm"
  );
  // This regex will match additional context variables e.g {{ additionalContexts.example[contentToDisplay].value }}
  const fieldsUsedByTemplateRegex = new RegExp(
    /\{\{\s*[\.a-zA-Z0-9]*\[([a-zA-Z0-9\s]*)][\.a-zA-Z0-9_-]*\s*[\| a-zA-Z]*}}/,
    "gm"
  );
  const matchResult = [
    ...content.matchAll(fieldsUsedAtTopLevelRegex),
    ...content.matchAll(fieldsUsedByTemplateRegex),
  ];
  matchResult.forEach((match) => {
    const templateVal = match[0];
    const variableName = match[1];
    const fieldValue = state[variableName] ?? "";
    const renderedTemplate = nunjucks.renderString(templateVal, {
      [variableName]: fieldValue,
    });
    content = content.replace(templateVal, renderedTemplate);
  });
  return content;
}

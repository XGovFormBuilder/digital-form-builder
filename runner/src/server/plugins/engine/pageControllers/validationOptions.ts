import { ValidationOptions } from "joi";
/**
 * see @link https://joi.dev/api/?v=17.4.2#template-syntax for template syntax
 */
const messageTemplate = {
  required: "Enter {{#label}}",
  selectRequired: "Select {{#label}}",
  max: "{{#label}} must be {{#limit}} characters or less",
  min: "{{#label}} must be {{#limit}} characters or more",
  regex: "enter a valid {{#label}}",
  email: "{{#label}} must be a valid email address",
  number: "{{#label}} must be a number",
  numberMin: "{{#label}} must be {{#limit}} or higher",
  numberMax: "{{#label}} must be {{#limit}} or lower",
  format: "Enter a valid {{#label}}",
  maxWords: "{{#label}} must be {{#limit}} words or fewer",
  dateRequired: "{{#label}} must be a real date",
  dateFormat: "{{#label}} must be a real date",
  dateMin: "{{#label}} must be the same as or after {{#limit}}",
  dateMax: "{{#label}} must be the same as or before {{#limit}}",
};

export const messages: ValidationOptions["messages"] = {
  "string.base": messageTemplate.required,
  "string.min": messageTemplate.min,
  "string.empty": messageTemplate.required,
  "string.max": messageTemplate.max,
  "string.email": messageTemplate.email,
  "string.regex.base": messageTemplate.format,
  "string.maxWords": messageTemplate.maxWords,

  "number.base": messageTemplate.number,
  "number.empty": messageTemplate.required,
  "number.required": messageTemplate.required,
  "number.min": messageTemplate.numberMin,
  "number.max": messageTemplate.numberMax,

  "any.required": messageTemplate.selectRequired,
  "any.empty": messageTemplate.required,

  "date.base": messageTemplate.dateRequired,
  "date.format": messageTemplate.dateFormat,
  "date.min": messageTemplate.dateMin,
  "date.max": messageTemplate.dateMax,
};

export const validationOptions: ValidationOptions = {
  abortEarly: false,
  messages,
  dateFormat: "iso",
  errors: {
    wrap: {
      label: false,
    },
  },
};

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
  date: "{{#label}} must be a valid date",
  dateMin: "{{#label}} must be on or after {{#limit}}",
  dateMax: "{{#label}} must be on or before {{#limit}}",
  number: "{{#label}} must be a number",
  numberMin: "{{#label}} must be {{#limit}} or higher",
  numberMax: "{{#label}} must be {{#limit}} or lower",
  format: "Enter a valid {{#label}}",
  maxWords: "{{#label}} must be {{#limit}} words or fewer",
  dateRequired: "{{#label}} must be a real date",
  dateFormat: "{{#label}} must be a real date",
};

export const messages: ValidationOptions["messages"] = {
  "string.base": messageTemplate.required,
  "string.min": messageTemplate.min,
  "string.empty": messageTemplate.required,
  "string.max": messageTemplate.max,
  "string.email": messageTemplate.email,
  "string.regex.base": messageTemplate.format,
  "string.maxWords": messageTemplate.maxWords,

  "date.base": messageTemplate.date,
  "date.empty": messageTemplate.required,
  "date.required": messageTemplate.required,
  "date.min": messageTemplate.dateMin,
  "date.max": messageTemplate.dateMax,
  "date.format": messageTemplate.dateFormat,
  "number.base": messageTemplate.number,
  "number.empty": messageTemplate.required,
  "number.required": messageTemplate.required,
  "number.min": messageTemplate.numberMin,
  "number.max": messageTemplate.numberMax,

  "any.required": messageTemplate.selectRequired,
  "any.empty": messageTemplate.required,
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

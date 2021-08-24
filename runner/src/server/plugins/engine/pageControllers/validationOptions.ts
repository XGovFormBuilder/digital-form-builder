import { ValidationOptions } from "joi";

/**
 * see @link https://joi.dev/api/?v=17.4.2#template-syntax for template syntax
 */
const messageTemplate = {
  required: "{{#label}} is required",
  max: "{{#label}} must be {{#limit}} characters or fewer",
  min: "{{#label}} must be at least {{#limit}} characters",
  regex: "enter a valid {{#label}}",
  email: "{{#label}} must be a valid email address",
  number: "{{#label}} must be a number",
  format: "Enter a valid {{#label}}",
};

export const messages: ValidationOptions["messages"] = {
  "string.base": messageTemplate.required,
  "string.min": messageTemplate.min,
  "string.empty": messageTemplate.required,
  "string.max": messageTemplate.max,
  "string.email": messageTemplate.email,
  "string.regex.base": messageTemplate.format,

  "number.base": messageTemplate.number,
  "number.empty": messageTemplate.required,
  "number.required": messageTemplate.required,

  "any.required": messageTemplate.required,
  "any.empty": messageTemplate.required,

  "date.min": "{{#label}} must be in the future",
  "date.max": "{{#label}} must be in the past",
};

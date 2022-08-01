export function getFormData(form) {
  const formData = new window.FormData(form);
  const data = {
    options: {},
    schema: {},
  };

  function cast(name, val) {
    const el = form.elements[name];
    const cast = el && el.dataset.cast;

    if (!val) {
      return undefined;
    }

    if (cast === "number") {
      return Number(val);
    } else if (cast === "boolean") {
      return val === "on";
    }
    if (val === "true" || val === "false") {
      return Boolean(val);
    }
    return val;
  }

  formData.forEach((value, key) => {
    const optionsPrefix = "options.";
    const schemaPrefix = "schema.";

    value = value.toString().trim();

    if (value) {
      if (key.startsWith(optionsPrefix)) {
        if (key === `${optionsPrefix}required` && value === "on") {
          data.options.required = false;
        } else if (key === `${optionsPrefix}optionalText` && value === "on") {
          data.options.optionalText = false;
        } else {
          data.options[key.slice(optionsPrefix.length)] = cast(key, value);
        }
      } else if (key.startsWith(schemaPrefix)) {
        data.schema[key.slice(schemaPrefix.length)] = cast(key, value);
      } else if (value) {
        data[key] = value;
      }
    }
  });

  // Cleanup
  if (!Object.keys(data.schema).length) delete data.schema;
  if (!Object.keys(data.options).length) delete data.options;

  return data;
}

export function toUrl(title) {
  return `/${(title?.replace(/[^a-zA-Z0-9- ]/g, "") ?? "")
    .trim()
    .replace(/ +/g, "-")
    .toLowerCase()}`;
}

export function camelCase(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s-_]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

export function isEmpty(str = "") {
  return `${str}`.trim().length < 1;
}

export function arrayMove(arr, from, to) {
  const elm = arr.splice(from, 1)[0];
  arr.splice(to, 0, elm);
  return arr;
}

export function getFormData (form) {
  const formData = new window.FormData(form)
  const data = {
    options: {},
    schema: {}
  }

  function cast (name, val) {
    const el = form.elements[name]
    const cast = el && el.dataset.cast

    if (!val) {
      return undefined
    }

    if (cast === 'number') {
      return Number(val)
    } else if (cast === 'boolean') {
      return val === 'on'
    }

    return val
  }

  formData.forEach((value, key) => {
    const optionsPrefix = 'options.'
    const schemaPrefix = 'schema.'

    value = value.trim()

    if (value) {
      if (key.startsWith(optionsPrefix)) {
        if (key === `${optionsPrefix}required` && value === 'on') {
          data.options.required = false
        } else if (key === `${optionsPrefix}optionalText` && value === 'on') {
          data.options.optionalText = false
        } else {
          data.options[key.substr(optionsPrefix.length)] = cast(key, value)
        }
      } else if (key.startsWith(schemaPrefix)) {
        data.schema[key.substr(schemaPrefix.length)] = cast(key, value)
      } else if (value) {
        data[key] = value
      }
    }
  })

  // Cleanup
  if (!Object.keys(data.schema).length) delete data.schema
  if (!Object.keys(data.options).length) delete data.options

  return data
}

export function clone (obj) {
  if (typeof obj.clone === 'function') {
    return obj.clone()
  }
  return serialiseAndDeserialise(obj)
}

export function serialiseAndDeserialise (obj) {
  return JSON.parse(JSON.stringify(obj))
}

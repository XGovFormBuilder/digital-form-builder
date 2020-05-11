const joi = require('joi')

function buildSchema (type, keys) {
  let schema = type.isJoi ? type : joi[type]()

  Object.keys(keys).forEach(key => {
    let val = keys[key]
    if (key === 'regex') {
      val = new RegExp(val)
    }
    schema = schema[key](typeof val === 'boolean' ? undefined : val)
  })

  return schema
}

function buildFormSchema (schemaType, component, isRequired = true) {
  let schema = buildSchema(schemaType, component.schema)

  if (isRequired) {
    schema = schema.required()
  }

  if (component.title) {
    schema = schema.label(typeof component.title === 'string' ? component.title : component.title.en)
  }

  if (component.options.required === false) {
    schema = schema.allow('')
  }

  if (schema.trim && component.schema.trim !== false) {
    schema = schema.trim()
  }

  return schema
}

function buildStateSchema (schemaType, component) {
  let schema = buildSchema(schemaType, component.schema)

  if (component.title) {
    schema = schema.label(typeof component.title === 'string' ? component.title : component.title.en)
  }

  if (component.options.required !== false) {
    schema = schema.required()
  }

  if (component.options.required === false) {
    schema = schema.allow(null)
  }

  if (schema.trim && component.schema.trim !== false) {
    schema = schema.trim()
  }

  return schema
}

function getFormSchemaKeys (name, schemaType, component) {
  const schema = buildFormSchema(schemaType, component)

  return { [component.name]: schema }
}

function getStateSchemaKeys (name, schemaType, component) {
  const schema = buildStateSchema(schemaType, component)

  return { [name]: schema }
}

module.exports = {
  buildSchema,
  buildFormSchema,
  buildStateSchema,
  getFormSchemaKeys,
  getStateSchemaKeys
}

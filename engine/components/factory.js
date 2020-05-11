const joi = require('joi')
const moment = require('moment')
const componentTypes = require('../component-types')
const formComponents = componentTypes.filter(t => t.subType === 'field').map(t => t.name)
const { buildFormSchema, buildStateSchema } = require('./helpers')
const makeComponentCollection = require('./collection')

function getFormSchemaKeys (name, schemaType, component) {
  const schema = buildFormSchema(schemaType, component)

  return function () {
    return { [name]: schema }
  }
}

function getStateSchemaKeys (name, schemaType, component) {
  const schema = buildStateSchema(schemaType, component)

  return function () {
    return { [name]: schema }
  }
}

function getBaseFormFieldViewModel (component, formData, errors) {
  const options = component.options
  const isOptional = options.required === false
  const label = component.title + (isOptional ? ' (optional)' : '')

  const name = component.name
  const model = {
    label: {
      text: label,
      classes: 'govuk-label--s'
    },
    id: name,
    name: name,
    value: formData[name]
  }

  if (component.hint) {
    model.hint = {
      html: component.hint
    }
  }

  if (options.classes) {
    model.classes = options.classes
  }

  if (errors) {
    errors.errorList.forEach(err => {
      if (err.name === name) {
        model.errorMessage = {
          text: err.text
        }
      }
    })
  }

  return model
}

const makeComponentTypes = {
  DateField (component) {
    const { name, options } = component

    if (!options.classes) {
      options.classes = 'govuk-input--width-10'
    }

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'date', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'date', component),
      getFormDataFromState (state) {
        const value = state[name]
        return {
          [name]: value instanceof Date
            ? moment(value).format('YYYY-MM-DD')
            : value
        }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        return value instanceof Date
          ? moment(value).format('D MMMM YYYY')
          : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)
        viewModel.type = 'date'
        return viewModel
      }
    }
  },
  DateTimeField (component) {
    const { name, options } = component

    if (!options.classes) {
      options.classes = 'govuk-input--width-20'
    }

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'date', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'date', component),
      getFormDataFromState (state) {
        const value = state[name]
        return {
          [name]: value instanceof Date
            ? moment(value).format('YYYY-MM-DDTHH:mm')
            : value
        }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        return value instanceof Date
          ? moment(value).format('D MMMM YYYY h:mma')
          : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)
        viewModel.type = 'datetime-local'
        return viewModel
      }
    }
  },
  TextField (component) {
    const { name, schema } = component

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'string', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'string', component),
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        if (typeof schema.max === 'number') {
          viewModel.attributes = {
            maxlength: schema.max
          }
        }

        return viewModel
      }
    }
  },
  MultilineTextField (component) {
    const { name, schema, options } = component

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'string', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'string', component),
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        if (typeof schema.max === 'number') {
          viewModel.attributes = {
            maxlength: schema.max
          }
        }

        if (options.rows) {
          viewModel.rows = options.rows
        }

        return viewModel
      }
    }
  },
  NumberField (component) {
    const { name } = component

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'number', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'number', component),
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)
        viewModel.type = 'number'
        return viewModel
      }
    }
  },
  EmailAddressField (component) {
    // Defaults
    component.schema.email = true

    if (!component.options.classes) {
      component.options.classes = 'govuk-input--width-20'
    }

    const { name, schema } = component

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'string', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'string', component),
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        if (typeof schema.max === 'number') {
          viewModel.attributes = {
            maxlength: schema.max
          }
        }

        viewModel.type = 'email'

        return viewModel
      }
    }
  },
  DatePartsField (component, def) {
    const { name, options } = component
    const stateSchema = buildStateSchema('date', component)

    const components = makeComponentCollection([
      { type: 'NumberField', name: `${name}__day`, title: 'Day', schema: { min: 1, max: 31 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__month`, title: 'Month', schema: { min: 1, max: 12 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__year`, title: 'Year', schema: { min: 1000, max: 3000 }, options: { required: options.required, classes: 'govuk-input--width-4' } }
    ], def)

    return {
      getFormSchemaKeys () {
        return components.getFormSchemaKeys()
      },
      getStateSchemaKeys (keys) {
        return { [name]: stateSchema }
      },
      getFormDataFromState (state) {
        const value = state[name]
        return {
          [`${name}__day`]: value && value.getDate(),
          [`${name}__month`]: value && value.getMonth() + 1,
          [`${name}__year`]: value && value.getFullYear()
        }
      },
      getStateFromValidForm (payload) {
        // Use `moment` to parse the date as
        // opposed to the Date constructor.
        // `moment` will check that the individual date
        // parts together constitute a valid date.
        // E.g. 31 November is not a valid date
        return {
          [name]: payload[`${name}__year`]
            ? moment([
              payload[`${name}__year`],
              payload[`${name}__month`] - 1,
              payload[`${name}__day`]
            ]).toDate()
            : null
        }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        return value instanceof Date
          ? moment(value).format('D MMMM YYYY')
          : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        // Todo: Remove after next
        // release on govuk-frontend
        viewModel.name = undefined

        // Use the component collection to generate the subitems
        const componentViewModels = components.getViewModel(formData, errors).map(vm => vm.model)

        // Remove the labels and apply error classes to the items
        componentViewModels.forEach(componentViewModel => {
          componentViewModel.label = componentViewModel.label.text.replace(' (optional)', '')
          if (componentViewModel.errorMessage) {
            componentViewModel.classes += ' govuk-input--error'
          }
        })

        Object.assign(viewModel, {
          fieldset: {
            legend: viewModel.label
          },
          items: componentViewModels
        })

        return viewModel
      }
    }
  },
  DateTimePartsField (component, def) {
    const { name, options } = component
    const stateSchema = buildStateSchema('date', component)

    const components = makeComponentCollection([
      { type: 'NumberField', name: `${name}__day`, title: 'Day', schema: { min: 1, max: 31 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__month`, title: 'Month', schema: { min: 1, max: 12 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__year`, title: 'Year', schema: { min: 1000, max: 3000 }, options: { required: options.required, classes: 'govuk-input--width-4' } },
      { type: 'NumberField', name: `${name}__hour`, title: 'Hour', schema: { min: 0, max: 23 }, options: { required: options.required, classes: 'govuk-input--width-2' } },
      { type: 'NumberField', name: `${name}__minute`, title: 'Minute', schema: { min: 0, max: 59 }, options: { required: options.required, classes: 'govuk-input--width-2' } }
    ], def)

    return {
      getFormSchemaKeys () {
        return components.getFormSchemaKeys()
      },
      getStateSchemaKeys (keys) {
        return { [name]: stateSchema }
      },
      getFormDataFromState (state) {
        const value = state[name]
        return {
          [`${name}__day`]: value && value.getDate(),
          [`${name}__month`]: value && value.getMonth() + 1,
          [`${name}__year`]: value && value.getFullYear(),
          [`${name}__hour`]: value && value.getHours(),
          [`${name}__minute`]: value && value.getMinutes()
        }
      },
      getStateFromValidForm (payload) {
        // Use `moment` to parse the date as
        // opposed to the Date constructor.
        // `moment` will check that the individual date
        // parts together constitute a valid date.
        // E.g. 31 November is not a valid date
        return {
          [name]: payload[`${name}__year`]
            ? moment([
              payload[`${name}__year`],
              payload[`${name}__month`] - 1,
              payload[`${name}__day`],
              payload[`${name}__hour`],
              payload[`${name}__minute`]
            ]).toDate()
            : null
        }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        return value instanceof Date
          ? moment(value).format('D MMMM YYYY h:mma')
          : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        // Todo: Remove after next
        // release on govuk-frontend
        viewModel.name = undefined

        // Use the component collection to generate the subitems
        const componentViewModels = components.getViewModel(formData, errors).map(vm => vm.model)

        // Remove the labels and apply error classes to the items
        componentViewModels.forEach(componentViewModel => {
          componentViewModel.label = componentViewModel.label.text.replace(' (optional)', '')
          if (componentViewModel.errorMessage) {
            componentViewModel.classes += ' govuk-input--error'
          }
        })

        Object.assign(viewModel, {
          fieldset: {
            legend: viewModel.label
          },
          items: componentViewModels
        })

        return viewModel
      }
    }
  },
  RadiosField (component, def) {
    const { name, options } = component
    const list = def.lists.find(list => list.name === options.list)
    const items = list.items
    const values = items.map(item => item.value)
    const formSchema = buildFormSchema(list.type, component, options.required !== false).valid(values)
    const stateSchema = buildStateSchema(list.type, component).valid(values)

    return {
      getFormSchemaKeys: function () {
        return { [name]: formSchema }
      },
      getStateSchemaKeys: function () {
        return { [name]: stateSchema }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        const item = items.find(item => item.value === value)
        return item ? item.text : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        Object.assign(viewModel, {
          fieldset: {
            legend: viewModel.label
          },
          items: items.map(item => {
            const itemModel = {
              html: item.text,
              value: item.value,
              // Do a loose string based check as state may or
              // may not match the item value types.
              checked: '' + item.value === '' + formData[name]
            }

            if (options.bold) {
              itemModel.label = {
                classes: 'govuk-label--s'
              }
            }

            if (item.description) {
              itemModel.hint = {
                html: item.description
              }
            }

            return itemModel
          })
        })

        return viewModel
      }
    }
  },
  CheckboxesField (component, def) {
    const { name, options } = component
    const list = def.lists.find(list => list.name === options.list)
    const items = list.items
    const values = items.map(item => item.value)
    const itemSchema = joi[list.type]().valid(values)
    const itemsSchema = joi.array().items(itemSchema)
    const alternatives = joi.alternatives([itemSchema, itemsSchema])
    const formSchema = buildFormSchema(alternatives, component, options.required !== false)
    const stateSchema = buildStateSchema(alternatives, component)

    return {
      getFormSchemaKeys: function () {
        return { [name]: formSchema }
      },
      getStateSchemaKeys: function () {
        return { [name]: stateSchema }
      },
      getDisplayStringFromState (state) {
        if (name in state) {
          const value = state[name]

          if (value === null) {
            return ''
          }

          const checked = Array.isArray(value) ? value : [value]
          return checked.map(check => items.find(item => item.value === check).text).join(', ')
        }
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)
        let formDataItems = []

        if (name in formData) {
          formDataItems = Array.isArray(formData[name])
            ? formData[name]
            : formData[name].split(',')
        }

        Object.assign(viewModel, {
          fieldset: {
            legend: viewModel.label
          },
          items: items.map(item => {
            const itemModel = {
              text: item.text,
              value: item.value,
              // Do a loose string based check as state may or
              // may not match the item value types.
              checked: !!formDataItems.find(i => '' + item.value === i)
            }

            if (options.bold) {
              itemModel.label = {
                classes: 'govuk-label--s'
              }
            }

            if (item.description) {
              itemModel.hint = {
                html: item.description
              }
            }

            return itemModel
          })
        })

        return viewModel
      }
    }
  },
  SelectField (component, def) {
    const { name, options } = component
    const list = def.lists.find(list => list.name === options.list)
    const items = list.items
    const values = items.map(item => item.value)
    const formSchema = buildFormSchema('string'/* list.type */, component) // .valid(values)
    const stateSchema = buildStateSchema(list.type, component).valid(values)

    return {
      getFormSchemaKeys: function () {
        return { [name]: formSchema }
      },
      getStateSchemaKeys: function () {
        return { [name]: stateSchema }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        const item = items.find(item => item.value === value)
        return item ? item.text : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        Object.assign(viewModel, {
          items: [{ text: '' }].concat(items.map(item => {
            return {
              text: item.text,
              value: item.value,
              // Do a loose check as state may or
              // may not match the item value types
              selected: '' + item.value === '' + formData[name]
            }
          }))
        })

        return viewModel
      }
    }
  },
  YesNoField (component, def) {
    const { name, options } = component

    // Defaults
    options.list = '__yesNo'

    if (!options.classes) {
      options.classes = 'govuk-radios--inline'
    }

    const list = def.lists.find(list => list.name === options.list)
    const items = list.items
    const values = items.map(item => item.value)
    const formSchema = buildFormSchema(list.type, component, options.required !== false).valid(values)
    const stateSchema = buildStateSchema(list.type, component).valid(values)

    return {
      getFormSchemaKeys: function () {
        return { [name]: formSchema }
      },
      getStateSchemaKeys: function () {
        return { [name]: stateSchema }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        const item = items.find(item => item.value === value)
        return item ? item.text : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        Object.assign(viewModel, {
          fieldset: {
            legend: viewModel.label
          },
          items: items.map(item => {
            return {
              text: item.text,
              value: item.value,
              // Do a loose string based check as state may or
              // may not match the item value types.
              checked: '' + item.value === '' + formData[name]
            }
          })
        })

        return viewModel
      }
    }
  },
  TelephoneNumberField (component) {
    // Defaults
    if (!component.options.classes) {
      component.options.classes = 'govuk-input--width-10'
    }

    const { name, schema } = component

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'string', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'string', component),
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        if (typeof schema.max === 'number') {
          viewModel.attributes = {
            maxlength: schema.max
          }
        }

        viewModel.type = 'tel'

        return viewModel
      }
    }
  },
  TimeField (component) {
    // Defaults
    if (!component.options.classes) {
      component.options.classes = 'govuk-input--width-4'
    }

    const { name } = component

    return {
      getFormSchemaKeys: getFormSchemaKeys(name, 'string', component),
      getStateSchemaKeys: getStateSchemaKeys(name, 'string', component),
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)
        viewModel.type = 'time'
        return viewModel
      }
    }
  },
  UkAddressField (component, def) {
    const { name, options } = component

    // Component collection
    const childFormComponentList = [
      { type: 'TextField', name: `premises`, title: 'Premises', schema: { max: 100 }, options: { required: options.required } },
      { type: 'TextField', name: `street`, title: 'Street', schema: { max: 100, allow: '' }, options: { required: false } },
      { type: 'TextField', name: `locality`, title: 'Locality', schema: { max: 100, allow: '' }, options: { required: false } },
      { type: 'TextField', name: `town`, title: 'Town', schema: { max: 100 }, options: { required: options.required } },
      { type: 'TextField', name: `postcode`, title: 'Postcode', schema: { max: 10 }, options: { required: options.required } }
    ]
    const stateComponents = makeComponentCollection(childFormComponentList, def)

    // Modify the name to add a prefix and reuse
    // the children to create the formComponents
    childFormComponentList.forEach(child => (child.name = `${name}__${child.name}`))

    const formComponents = makeComponentCollection(childFormComponentList, def)

    return {
      children: formComponents,
      getFormSchemaKeys () {
        return formComponents.getFormSchemaKeys()
      },
      getStateSchemaKeys () {
        return {
          [name]: options.required === false
            ? joi.object().keys(stateComponents.getStateSchemaKeys()).allow(null)
            : joi.object().keys(stateComponents.getStateSchemaKeys()).required()
        }
      },
      getFormDataFromState (state) {
        const value = state[name]
        return {
          [`${name}__premises`]: value && value.premises,
          [`${name}__street`]: value && value.street,
          [`${name}__locality`]: value && value.locality,
          [`${name}__town`]: value && value.town,
          [`${name}__postcode`]: value && value.postcode
        }
      },
      getStateFromValidForm (payload) {
        return {
          [name]: payload[`${name}__premises`] ? {
            premises: payload[`${name}__premises`],
            street: payload[`${name}__street`],
            locality: payload[`${name}__locality`],
            town: payload[`${name}__town`],
            postcode: payload[`${name}__postcode`]
          } : null
        }
      },
      getDisplayStringFromState (state) {
        const value = state[name]
        return value ? [
          value.premises,
          value.street,
          value.locality,
          value.town,
          value.postcode
        ].filter(p => {
          return !!p
        }).join(', ') : ''
      },
      getViewModel (formData, errors) {
        const viewModel = getBaseFormFieldViewModel(component, formData, errors)

        Object.assign(viewModel, {
          fieldset: {
            legend: viewModel.label
          },
          children: formComponents.getViewModel(formData, errors)
        })

        return viewModel
      }
    }
  },
  Para (component) {
    return {
      getViewModel () {
        return {
          content: component.content
        }
      }
    }
  },
  Html (component) {
    return {
      getViewModel () {
        return {
          content: component.content
        }
      }
    }
  },
  Details (component) {
    return {
      getViewModel () {
        return {
          summaryHtml: component.title,
          html: component.content
        }
      }
    }
  },
  InsetText (component) {
    return {
      getViewModel () {
        return {
          content: component.content
        }
      }
    }
  },
  FlashCard (component) {
    return {
      getViewModel () {
        return {
          content: component.content
        }
      }
    }
  },
  List (component) {
    return {
      getViewModel () {
        return {
          content: component.content
        }
      }
    }
  }
}

function isFormComponent (component) {
  return formComponents.indexOf(component.type) > -1
}

function makeComponentType (component, def) {
  return makeComponentTypes[component.type](component, def)
}

function makeComponent (componentDef, def) {
  const component = {
    type: componentDef.type,
    isFormComponent: isFormComponent(componentDef),
    options: componentDef.options,
    getViewModel () { return {} }
  }

  if (component.isFormComponent) {
    const name = componentDef.name
    const schema = componentDef.schema

    Object.assign(component, {
      name: name,
      hint: componentDef.hint,
      title: componentDef.title,
      schema: schema,
      getFormSchemaKeys () { return { [name]: joi.any() } },
      getStateSchemaKeys () { return { [name]: joi.any() } },
      getFormDataFromState (state) {
        if (name in state) {
          return { [name]: state[name] === null ? '' : state[name].toString() }
        }
      },
      getStateFromValidForm (payload) {
        return {
          [name]: (name in payload && payload[name] !== '') ? payload[name] : null
        }
      },
      getDisplayStringFromState (state) { return state[name] }
    })
  }

  const componentType = makeComponentType(componentDef, def)

  Object.assign(component, componentType)

  return component
}

module.exports = makeComponent

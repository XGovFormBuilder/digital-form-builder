const joi = require('joi')
const componentTypes = require('../component-types')
const nunjucks = require('nunjucks')
const path = require('path')
const createConditionalComponents = Symbol('createConditionalComponents')
const getSchemaKeys = Symbol('getSchemaKeys')

class Component {
  constructor (def, model) {
    Object.assign(this, def)
    this.model = model
  }

  getViewModel () {
    return {}
  }
}

class FormComponent extends Component {
  constructor (def, model) {
    super(def, model)
    this.isFormComponent = true
    this.__lang = 'en' // set default language

    const { schema } = this

    schema.error = errors => {
      errors.forEach(err => {
        const { limit } = err.context
        const today = new Date()
        const limitIsToday = limit && limit.getDate && limit.getDate() === today.getDate() && limit.getMonth() === today.getMonth() && limit.getFullYear() === today.getFullYear()

        switch (err.type) {
          case 'any.empty':
            err.message = `${err.context.label} is required`
            break
          case 'any.required':
            err.message = `${err.context.label} is required`
            break
          case 'number.base':
            err.message = `${err.context.label} must be a number`
            break
          case 'string.base':
            err.message = `${err.context.label} is required`
            break
          case 'string.email':
            err.message = `${err.context.label} must be a valid email address`
            break
          case 'string.regex.base':
            err.message = `Enter a valid ${err.context.label.toLowerCase()}`
            break
          case 'date.min':
            if (limitIsToday) {
              err.message = `${err.context.label} must be in the future`
            } else {
              err.message = `${err.context.label} can be no earlier than ${limit.getDate()}/${limit.getMonth() + 1}/${limit.getFullYear()}`
            }
            break
          case 'date.max':
            if (limitIsToday) {
              err.message = `${err.context.label} must be in the past`
            } else {
              err.message = `${err.context.label} can be no later than ${limit.getDate()}/${limit.getMonth() + 1}/${limit.getFullYear()}`
            }
            break
          default:
            break
        }
      })
      return errors
    }
  }

  get lang () {
    return this.__lang
  }

  set lang (lang) {
    if (lang) {
      this.__lang = lang
    }
  }

  getFormDataFromState (state) {
    const name = this.name

    if (name in state) {
      return {
        [name]: this.getFormValueFromState(state)
      }
    }
  }

  getFormValueFromState (state) {
    const name = this.name

    if (name in state) {
      return state[name] === null ? '' : state[name].toString()
    }
  }

  getStateFromValidForm (payload) {
    const name = this.name

    return {
      [name]: this.getStateValueFromValidForm(payload)
    }
  }

  getStateValueFromValidForm (payload) {
    const name = this.name

    return name in payload && payload[name] !== '' ? payload[name] : null
  }

  localisedString (description) {
    let string
    if (typeof description === 'string') {
      string = description
    } else {
      string = description[this.lang]
        ? description[this.lang]
        : description['en']
    }
    return string
  }

  getViewModel (formData, errors) {
    const options = this.options
    const isOptional = options.required === false
    let optionalText = isOptional ? ' (Optional)' : ''
    if (isOptional && options.optionalText === false) {
      optionalText = ''
    }
    this.lang = formData.lang
    let label = `${this.localisedString(this.title)}${optionalText}`

    const name = this.name
    const model = {
      label: {
        text: label,
        classes: 'govuk-label--s'
      },
      id: name,
      name: name,
      value: formData[name]
    }

    if (this.hint) {
      model.hint = {
        html: this.localisedString(this.hint)
      }
    }

    if (options.classes) {
      model.classes = options.classes
    }

    if (options.condition) {
      model.condition = options.condition
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

  getFormSchemaKeys () {
    return { [this.name]: joi.any() }
  }
  getStateSchemaKeys () {
    return { [this.name]: joi.any() }
  }
  getDisplayStringFromState (state) {
    return state[this.name]
  }

  get dataType () {
    return 'text'
  }
}

let Types = null
function getType (name) {
  if (Types === null) {
    Types = {}
    componentTypes.forEach(componentType => {
      Types[componentType.name] = require(`./${componentType.name.toLowerCase()}`)
    })
  }

  return Types[name]
}

// An ES 6 class providing conditional reveal support for radio buttons (https://design-system.service.gov.uk/components/radios/)
// and checkboxes (https://design-system.service.gov.uk/components/checkboxes/)
class ConditionalFormComponent extends FormComponent {
  constructor (def, model) {
    super(def, model)
    const { options } = this
    const list = model.lists.find(list => list.name === options.list)
    const items = list.items
    const values = items.map(item => item.value)
    this.list = list
    this.items = items
    this.values = values
    this[createConditionalComponents](def, model)
  }

  addConditionalComponents (item, itemModel, formData, errors) {
    // The gov.uk design system Nunjucks examples for conditional reveal reference variables from macros. There does not appear to
    // to be a way to do this in JavaScript. As such, render the conditional components with Nunjucks before the main view is rendered.
    // The conditional html tag used by the gov.uk design system macro will reference HTML rarther than one or more additional
    // gov.uk design system macros.
    if (item.conditional) {
      itemModel.conditional = {
        html: nunjucks.render('conditional-components.html', {
          components: item.conditional.componentCollection.getViewModel(
            formData,
            errors
          )
        })
      }
    }
    return itemModel
  }

  getFormDataFromState (state) {
    const formData = super.getFormDataFromState(state)
    if (formData) {
      const itemsWithConditionalComponents = this.list.items.filter(
        item => item.conditional && item.conditional.components
      )
      itemsWithConditionalComponents.forEach(item => {
        const itemFormDataFromState = item.conditional.componentCollection.getFormDataFromState(
          state
        )
        if (
          itemFormDataFromState &&
          Object.keys(itemFormDataFromState).length > 0
        ) {
          Object.assign(formData, itemFormDataFromState)
        }
      })
    }
    return formData
  }

  getFormSchemaKeys () {
    return this[getSchemaKeys]('form')
  }

  getStateFromValidForm (payload) {
    const state = super.getStateFromValidForm(payload)
    const itemsWithConditionalComponents = this.list.items.filter(
      item => item.conditional && item.conditional.components
    )

    const selectedItemsWithConditionalComponents = itemsWithConditionalComponents.filter(
      item => {
        if (payload[this.name] && Array.isArray(payload[this.name])) {
          return payload[this.name].find(
            nestedItem => item.value === nestedItem
          )
        } else {
          return item.value === payload[this.name]
        }
      }
    )

    // Add selected form data associated with conditionally revealed content to the state.
    selectedItemsWithConditionalComponents.forEach(item =>
      Object.assign(
        state,
        item.conditional.componentCollection.getStateFromValidForm(payload)
      )
    )

    // Add null values to the state for unselected form data associated with conditionally revealed content.
    // This will allow changes in the visibility of onditionally revealed content to be reflected in state correctly.
    const unselectedItemsWithConditionalComponents = itemsWithConditionalComponents.filter(
      item => !selectedItemsWithConditionalComponents.includes(item)
    )
    unselectedItemsWithConditionalComponents.forEach(item => {
      const stateFromValidForm = item.conditional.componentCollection.getStateFromValidForm(
        payload
      )
      Object.values(item.conditional.componentCollection.items)
        .filter(conditionalItem => stateFromValidForm[conditionalItem.name])
        .forEach(key => {
          const conditionalItemToNull = key.name
          Object.assign(stateFromValidForm, { [conditionalItemToNull]: null })
        })
      Object.assign(state, stateFromValidForm)
    })
    return state
  }

  getStateSchemaKeys () {
    return this[getSchemaKeys]('state')
  }

  [createConditionalComponents] (def, model) {
    const filteredItems = this.list.items.filter(
      item => item.conditional && item.conditional.components
    )
    // Create a collection of conditional components that can be converted to a view model and rendered by Nunjucks
    // before primary view model rendering takes place.
    filteredItems.map(item => {
      item.conditional.componentCollection = new ComponentCollection(
        item.conditional.components,
        model
      )
    })
  }

  [getSchemaKeys] (schemaType) {
    const schemaName = `${schemaType}Schema`
    const schemaKeysFunctionName = `get${schemaType
      .substring(0, 1)
      .toUpperCase()}${schemaType.substring(1)}SchemaKeys`
    const filteredItems = this.items.filter(
      item => item.conditional && item.conditional.componentCollection
    )
    const conditionalName = this.name
    const schemaKeys = { [conditionalName]: this[schemaName] }
    const schema = this[schemaName]
    // All conditional component values are submitted regardless of their visibilty.
    // As such create Joi validation rules such that:
    // a) When a conditional component is visible it is required.
    // b) When a conditional component is not visible it is optional.
    filteredItems.forEach(item => {
      const conditionalSchemaKeys = item.conditional.componentCollection[
        schemaKeysFunctionName
      ]()
      // Iterate through the set of components handled by conditional reveal adding Joi validation rules
      // based on whether or not the component controlling the conditional reveal is selected.
      Object.keys(conditionalSchemaKeys).forEach(key => {
        Object.assign(schemaKeys, {
          [key]: joi.alternatives().when(conditionalName, {
            is: item.value,
            then: conditionalSchemaKeys[key].required(),
            // If multiple checkboxes are selected their values will be held in an array. In this
            // case conditionally revealed content is required to be entered if the controlliing
            // checkbox value is a member of the array of selected checkbox values.
            otherwise: joi.alternatives().when(conditionalName, {
              is: joi
                .array()
                .items(schema.only(item.value), joi.any())
                .required(),
              then: conditionalSchemaKeys[key].required(),
              otherwise: conditionalSchemaKeys[key]
                .optional()
                .allow('')
                .allow(null)
            })
          })
        })
      })
    })
    return schemaKeys
  }
}

class ComponentCollection {
  constructor (items, model) {
    const itemTypes = items.map(def => {
      const Type = getType(def.type)
      return new Type(def, model)
    })

    const formItems = itemTypes.filter(component => component.isFormComponent)

    this.items = itemTypes
    this.formItems = formItems
    this.formSchema = joi
      .object()
      .keys(this.getFormSchemaKeys()).required()
      .keys({ crumb: joi.string().optional().allow('') })

    this.stateSchema = joi
      .object()
      .keys(this.getStateSchemaKeys())
      .required()
  }

  getFormSchemaKeys () {
    const keys = {}

    this.formItems.forEach(item => {
      Object.assign(keys, item.getFormSchemaKeys())
    })

    return keys
  }

  getStateSchemaKeys () {
    const keys = {}

    this.formItems.forEach(item => {
      Object.assign(keys, item.getStateSchemaKeys())
    })

    return keys
  }

  getFormDataFromState (state) {
    const formData = {}

    this.formItems.forEach(item => {
      Object.assign(formData, item.getFormDataFromState(state))
    })

    return formData
  }

  getStateFromValidForm (payload) {
    const state = {}

    this.formItems.forEach(item => {
      Object.assign(state, item.getStateFromValidForm(payload))
    })

    return state
  }

  getViewModel (formData, errors) {
    return this.items.map(item => {
      return {
        type: item.type,
        isFormComponent: item.isFormComponent,
        model: item.getViewModel(formData, errors)
      }
    })
  }
}

// Configure Nunjucks to allow rendering of content that is revealed conditionally.
nunjucks.configure([
  'node_modules/govuk-frontend/govuk/',
  'node_modules/govuk-frontend/govuk/components/',
  'node_modules/digital-form-builder-engine/views',
  'node_modules/digital-form-builder-engine/views/partials',
  'node_modules/digital-form-builder-designer/views',
  'node_modules/hmpo-components/components'
])
module.exports = {
  Component,
  FormComponent,
  ConditionalFormComponent,
  ComponentCollection
}

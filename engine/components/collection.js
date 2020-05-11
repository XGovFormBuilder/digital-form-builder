const joi = require('joi')

function makeComponentCollection (list, def) {
  const makeComponent = require('./factory')
  const items = list.map(componentDef => makeComponent(componentDef, def))
  const formItems = items.filter(component => component.isFormComponent)

  const collection = {}

  collection.items = items
  collection.formItems = formItems

  collection.getFormSchemaKeys = function () {
    const keys = {}

    formItems.forEach(item => {
      Object.assign(keys, item.getFormSchemaKeys())
    })

    return keys
  }

  collection.getStateSchemaKeys = function () {
    const keys = {}

    formItems.forEach(item => {
      Object.assign(keys, item.getStateSchemaKeys())
    })

    return keys
  }

  collection.getFormDataFromState = function (state) {
    const formData = {}

    formItems.forEach(item => {
      Object.assign(formData, item.getFormDataFromState(state))
    })

    // return Object.assign.apply(Object, [{}].concat(formItems.map(item =>
    //   item.getFormDataFromState(state))))
    return formData
  }

  collection.getStateFromValidForm = function (payload) {
    const state = {}

    formItems.forEach(item => {
      Object.assign(state, item.getStateFromValidForm(payload))
    })

    return state
  }

  collection.getViewModel = function (formData, errors) {
    return items.map(item => {
      return {
        type: item.type,
        isFormComponent: item.isFormComponent,
        model: item.getViewModel(formData, errors)
      }
    })
  }

  collection.formSchema = joi.object().keys(collection.getFormSchemaKeys())
  collection.stateSchema = joi.object().keys(collection.getStateSchemaKeys())

  return collection
}

module.exports = makeComponentCollection

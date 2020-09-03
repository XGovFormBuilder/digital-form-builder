import React from 'react'

function updateComponent (component, modifier, updateModel) {
  modifier(component)
  updateModel(component)
}

function addListValuesTo (component, data, listName) {
  const list = data.lists.find(list => list.name === listName)

  function itemFrom (item) {
    const toReturn = {
      display: item.text,
      value: item.value
    }
    Object.assign(toReturn, item.description && { hint: item.description })
    Object.assign(toReturn, item.condition && { condition: item.condition })
    Object.assign(toReturn, item.conditional?.components && { children: item.conditional?.components })
    return toReturn
  }

  if (list) {
    component.values = {
      type: 'static',
      valueType: list.type,
      items: list.items.map(item => itemFrom(item))
    }
    component.options.list = listName
    return component
  } else {
    throw Error(`No list found with name ${listName}`)
  }
}

export class ComponentValues extends React.Component {
  render () {
    const { data, component, updateModel } = this.props
    const { lists } = data

    return <div className='govuk-form-group'>
      <label className='govuk-label govuk-label--s' htmlFor='field-options-list'>List</label>
      <select
        className='govuk-select govuk-input--width-10' id='field-options-list' name='options.list'
        value={component.options?.list} required
        onChange={e => updateComponent(component, component => addListValuesTo(component, data, e.target.value), updateModel)}
      >
        <option />
        {lists.map(list => {
          return <option key={list.name} value={list.name}>{list.title}</option>
        })}
      </select>
    </div>
  }
}

import React from 'react'
import { icons } from '../icons'
import Flyout from '../flyout'
import DefineComponentValue from './define-component-value'
import { clone } from '@xgovformbuilder/model'
import { RenderInPortal } from './render-in-portal'
import { Radios } from '@xgovformbuilder/govuk-react-jsx'

function updateComponent (component, modifier, updateModel) {
  modifier(component)
  updateModel(component)
}

function addListValuesTo (component, data, listName) {
  const list = data.lists.find(list => list.name === listName)

  if (list) {
    component.values = {
      type: 'listRef',
      list: listName
    }
    return component
  } else {
    component.values = {
      type: 'listRef'
    }
  }
}

function initialiseStaticValuesFrom (component, data, listName) {
  const list = data.lists.find(list => list.name === listName)

  function itemFrom (item) {
    const newItem = {
      label: item.text,
      value: item.value,
      children: item.conditional?.components ?? []
    }

    Object.assign(newItem, item.description && { hint: item.description })
    Object.assign(newItem, item.condition && { condition: item.condition })

    return newItem
  }

  if (list) {
    component.values = {
      type: 'static',
      valueType: list.type,
      items: list.items.map(itemFrom)
    }
    return component
  } else {
    component.values = {
      type: 'static'
    }
  }
}

export default class ComponentValues extends React.Component {
  constructor (props) {
    super(props)
    const values = props.component.values
    this.state = {
      component: clone(props.component),
      listName: values?.list
    }

    this.formAddItem = React.createRef()
    this.formEditItem = React.createRef()
  }

  showAddItem = () => this.setState({ showAddItem: true })

  cancelAddItem = () => this.setState({ showAddItem: false })

  showEditItem = (index) => this.setState({ editingIndex: index })

  removeItem = (index) => {
    const { updateModel } = this.props
    const { component } = this.state
    updateComponent(
      component,
      component => component.values.items.splice(index, 1),
      updateModel)
    this.setState(
      component
    )
  }

  addItem = item => {
    const { updateModel } = this.props
    const { component } = this.state
    const isFormValid = this.formAddItem.current.reportValidity()

    if (isFormValid) {
      updateComponent(
        component,
        component => {
          component.values.items = component.values.items || []
          component.values.items.push(item)
        },
        updateModel
      )
      this.setState({
        showAddItem: false
      })
    }
  }

  updateItem = item => {
    const { updateModel } = this.props
    const { component, editingIndex } = this.state
    const isFormValid = this.formEditItem.current.reportValidity()

    if (isFormValid) {
      updateComponent(
        component,
        component => {
          component.values.items = component.values.items || []
          component.values.items[editingIndex] = item
        },
        updateModel
      )
      this.setState({ editingIndex: undefined })
    }
  }

  initialiseValues = e => {
    const { component } = this.state
    component.values = { type: e.target.value }
    this.setState({ component })
  };

  cancelEditItem = () => this.setState({ editingIndex: undefined })

  handleSubmit = (e) => {
    console.log('Form Submitted')
  }

  render () {
    const { data, updateModel, page } = this.props
    const { lists } = data
    const { listName, showAddItem, editingIndex, component } = this.state
    const staticValues = data.valuesFor(component)?.toStaticValues()
    const type = component.values?.type

    const listSelectionOnChangeFunctions = {
      listRef: e => {
        updateComponent(component, component => addListValuesTo(component, data, e.target.value), updateModel)
        this.setState({ listName: e.target.value })
      },
      static: e => {
        updateComponent(component, component => initialiseStaticValuesFrom(component, data, e.target.value), updateModel)
        this.setState({ listName: e.target.value })
      }
    }

    return (
      <div>
        <Radios
          id="population-type-list"
          name="definitionType"
          value={type}
          onChange={this.initialiseValues}
          fieldset={{
            legend: {
              children: [
                'How would you like to populate the options?'
              ]
            }
          }}
          items={[
            {
              children: [
                'From a list'
              ],
              value: 'listRef',
              hint: {
                children: [
                  'Any changes to the list will be reflected in the options presented to users.'
                ]
              }
            },
            {
              children: [
                'I\'ll populate my own entries'
              ],
              value: 'static',
              hint: {
                children: [
                  'You can still select a list to get you started, but any changes to the list later won\'t be reflected in the options presented to users.'
                ]
              }
            }
          ]}
        />
        {type &&
          <div>
            <div className='govuk-form-group'>
              <label className='govuk-label govuk-label--s' htmlFor='field-options-list'>List</label>
              <select
                className='govuk-select govuk-input--width-10' id='field-options-list' name='options.list'
                value={listName} required={type === 'listRef'}
                onChange={listSelectionOnChangeFunctions[type]}
              >
                <option/>
                {lists.map(list => {
                  return <option key={list.name} value={list.name}>{list.title}</option>
                })}
              </select>
            </div>

            <div>
              <table className='govuk-table'>
                <caption className='govuk-table__caption'>Items</caption>
                <thead className='govuk-table__head'>
                  <tr className='govuk-table__row'>
                    <th className='govuk-table__header' scope='col' colSpan='2'></th>
                    <th className='govuk-table__header' scope='col'>
                      {type === 'static' && <a id='add-value-link' className='pull-right' href='#' onClick={this.showAddItem}>Add</a>}
                    </th>
                  </tr>
                </thead>
                <tbody className='govuk-table__body'>
                  {staticValues && staticValues.items.map((item, index) => (
                    <tr key={`item-row-${index}`} className='govuk-table__row' scope='row'>
                      <td className='govuk-table__cell'>
                        <h2 className='govuk-label' id={`item-details-${index}`}>{item.label}</h2>
                        <div className="govuk-hint"> {item.hint}</div>
                        {item.condition && <p><strong>Condition:</strong> {item.condition}</p>}
                        <p><strong>Children:</strong> {item.children.length}</p>
                      </td>
                      <td className='govuk-table__cell'>
                        <a className='list-item-delete' id={`edit-item-${index}`} onClick={ () => this.showEditItem(index) }>{icons.edit(false)}</a>
                      </td>
                      <td className='govuk-table__cell'>
                        {type === 'static' &&
                          <a className='list-item-delete' id={`remove-item-${index}`} onClick={() => this.removeItem(index)}>&#128465;</a>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <RenderInPortal>
                <Flyout title='Add Item' show={!!showAddItem}
                  onHide={this.cancelAddItem}>
                  <form ref={this.formAddItem}>
                    <DefineComponentValue
                      data={data}
                      page={page}
                      saveCallback={this.addItem}
                      cancelCallback={this.cancelAddItem}
                      EditComponentView={this.props.EditComponentView}
                    />
                  </form>
                </Flyout>
              </RenderInPortal>

              <RenderInPortal>
                <Flyout title='Edit Item' show={editingIndex !== undefined}
                  onHide={this.cancelEditItem}>
                  <form ref={this.formEditItem}>
                    <DefineComponentValue
                      data={data}
                      value={staticValues.items[editingIndex]}
                      page={page}
                      saveCallback={this.updateItem}
                      cancelCallback={this.cancelEditItem}
                      EditComponentView={this.props.EditComponentView}
                    />
                  </form>
                </Flyout>
              </RenderInPortal>
            </div>
          </div>
        }
      </div>
    )
  }
}

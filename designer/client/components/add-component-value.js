import React from 'react'
import { textAreaGroup, textGroup } from '../govuk-react-components/text'
import SelectConditions from '../conditions/select-conditions'
import { icons } from '../icons'
import Flyout from '../flyout'
import { InputOptions } from '../govuk-react-components/helpers'

export default class AddComponentValue extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      children: []
    }
  }

  saveItem = () => {
    const { label, value, hint, condition, children } = this.state

    this.props.addItemCallback({
      label,
      value,
      hint,
      condition,
      children
    })
  }

  onClickCancel = () => {
    this.props.cancelCallback()
  }

  showAddChild = () => this.setState({ showAddChild: true })

  cancelAddChild = () => this.setState({ showAddChild: false })

  showEditChild = (index) => this.setState({ editingItem: index })

  cancelEditChild = () => this.setState({ editingItem: undefined })

  removeChild = (index) => {
    const { children } = this.state
    children.splice(index, 1)
    this.setState(
      { children: children }
    )
  }

  conditionSelected = (condition) => {
    this.setState({
      condition: condition
    })
  }

  render () {
    const { label, value, hint, condition, children, showAddChild, editingIndex } = this.state
    const { data, page } = this.props

    return <div>
      { textGroup(
        'item-label',
        'label',
        'Label',
        label,
        e => this.setState({ label: e.target.value }),
        new InputOptions(true)
      )
      }
      { textGroup(
        'item-value',
        'value',
        'Value',
        value,
        e => this.setState({ value: e.target.value }),
        new InputOptions(true)
      )
      }
      { textAreaGroup(
        'item-hint',
        'hint',
        'Hint (optional)',
        hint,
        2,
        e => this.setState({ hint: e.target.value })
      )
      }
      <SelectConditions
        data={data}
        path={page.path}
        selectedCondition={condition}
        conditionsChange={this.conditionSelected}
        hints={['The item will only be displayed if the selected condition holds']}
      />
      {
        <div>
          <table className='govuk-table'>
            <caption className='govuk-table__caption'>Children</caption>
            <thead className='govuk-table__head'>
              <tr className='govuk-table__row'>
                <th className='govuk-table__header' scope='col' colSpan='2'></th>
                <th className='govuk-table__header' scope='col'>
                  {<a className='pull-right' href='#' onClick={this.showAddChild}>Add</a>}
                </th>
              </tr>
            </thead>
            <tbody className='govuk-table__body'>
              {children.map((item, index) => (
                <tr key={`item-row-${index}`} className='govuk-table__row' scope='row'>
                  <td className='govuk-table__cell'>
                    <h2 className='govuk-label'>{item.title || item.name} (item.type)</h2>
                  </td>
                  <td className='govuk-table__cell'>
                    <a className='list-item-delete' onClick={ () => this.showEditChild(index) }>{icons.edit(false)}</a>
                  </td>
                  <td className='govuk-table__cell'>
                    <a className='list-item-delete' onClick={() => this.removeChild(index)}>&#128465;</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a
            href='#' id='cancel-add-component-value-link' className='govuk-button'
            onClick={this.saveItem}
          >Save
          </a>
          <a
            href='#' id='cancel-add-component-value-link' className='govuk-link'
            onClick={this.onClickCancel}
          >Cancel
          </a>
          <Flyout title='Add Child' show={!!showAddChild}
            onHide={this.cancelAddChild}>
            {/* <AddComponentValue */}
            {/*  data={data} */}
            {/*  component={component} */}
            {/*  page={page} */}
            {/*  addItemCallback={item => updateComponent(component, component => component.items.push(item), updateModel)} */}
            {/*  cancelCallback={this.cancelAddItem} */}
            {/* /> */}
          </Flyout>
          <Flyout title='Edit Child' show={editingIndex !== undefined}
            onHide={this.cancelEditChild}>
            {/* <AddComponentValue */}
            {/*  data={data} */}
            {/*  component={component} */}
            {/*  page={page} */}
            {/*  addItemCallback={item => updateComponent(component, component => component.items.push(item), updateModel)} */}
            {/*  cancelCallback={this.cancelAddItem} */}
            {/* /> */}
          </Flyout>
        </div>
      }
    </div>
  }
}

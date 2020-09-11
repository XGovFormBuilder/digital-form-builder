import React from 'react'
import { textAreaGroup, textGroup } from '../govuk-react-components/text'
import SelectConditions from '../conditions/select-conditions'
import { icons } from '../icons'
import Flyout from '../flyout'
import { InputOptions } from '../govuk-react-components/helpers'
import { clone } from '@xgovformbuilder/model'
import DefineChildComponent from "./define-child-component";

export default class DefineComponentValue extends React.Component {
  constructor (props) {
    super(props)
    const value = props.value
    this.state = value ? clone(value) : {children:[]}
    if(!this.state.children) {
      this.state.children = []
    }
  }

  saveItem = () => {
    const { label, value, hint, condition, children } = this.state

    this.props.saveCallback({
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

  showEditChild = (index) => this.setState({ editingIndex: index })

  cancelEditChild = () => this.setState({ editingIndex: undefined })

  addChild = (component) => {
    const { children } = this.state
    children.push(component)
    this.setState(
      { children: children }
    )
  }

  updateChild = (component) => {
    const { children, editingIndex } = this.state
    children[editingIndex] = component
    this.setState(
    {
        children,
        editingIndex: undefined
      }
    )
  }

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
    const child = children[editingIndex]

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
                  {<a className='pull-right' id='add-child-link' href='#' onClick={this.showAddChild}>Add</a>}
                </th>
              </tr>
            </thead>
            <tbody className='govuk-table__body'>
              {children.map((item, index) => (
                <tr key={`item-row-${index}`} className='govuk-table__row' scope='row'>
                  <td className='govuk-table__cell'>
                    <h2 id={`child-details-${index}`} className='govuk-label'>{item.title || item.name} ({item.type})</h2>
                  </td>
                  <td className='govuk-table__cell'>
                    <a className='list-item-delete' id={`edit-child-${index}`} onClick={ () => this.showEditChild(index) }>{icons.edit(false)}</a>
                  </td>
                  <td className='govuk-table__cell'>
                    <a className='list-item-delete' id={`remove-child-${index}`} onClick={() => this.removeChild(index)}>&#128465;</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a
            href='#' id='save-component-value-link' className='govuk-button'
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
             <DefineChildComponent
              data={data}
              page={page}
              saveCallback={this.addChild}
              cancelCallback={this.cancelAddChild}
             />
          </Flyout>
          <Flyout title='Edit Child' show={editingIndex !== undefined}
            onHide={this.cancelEditChild}>
             <DefineChildComponent
              data={data}
              component={child}
              page={page}
              saveCallback={this.updateChild}
              cancelCallback={this.cancelEditChild}
             />
          </Flyout>
        </div>
      }
    </div>
  }
}

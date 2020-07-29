import React from 'react'
import { clone } from 'digital-form-builder-model/lib/helpers'

function headDuplicate (arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] === arr[i]) {
        return j
      }
    }
  }
}

class FeeItems extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      items: props.items ? clone(props.items) : []
    }
  }

  onClickAddItem = e => {
    this.setState({
      items: this.state.items.concat({ description: '', amount: 0, condition: '' })
    })
  }

  removeItem = idx => {
    this.setState({
      items: this.state.items.filter((s, i) => i !== idx)
    })
  }

  onClickDelete = e => {
    e.preventDefault()

    if (!window.confirm('Confirm delete')) {
      return
    }

    const { data, fee } = this.props
    const copy = clone(data)

    // Remove the list
    copy.fees.splice(data.fees.indexOf(fee), 1)

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onBlur = e => {
    const form = e.target.form
    const formData = new window.FormData(form)
    const descriptions = formData.getAll('description').map(t => t.trim())
    const conditions = formData.getAll('condition').map(t => t.trim())

    // Only validate dupes if there is more than one item
    if (descriptions.length < 2) {
      return
    }

    form.elements.condition.forEach(el => el.setCustomValidity(''))

    // Validate uniqueness
    const dupeCondition = headDuplicate(conditions)
    if (dupeCondition) {
      form.elements.condition[dupeCondition].setCustomValidity('Duplicate conditions found in the list items')
    }
  }

  render () {
    const { items } = this.state
    const { conditions } = this.props

    return (
      <table className='govuk-table'>
        <caption className='govuk-table__caption'>Items</caption>
        <thead className='govuk-table__head'>
          <tr className='govuk-table__row'>
            <th className='govuk-table__header' scope='col'>Description</th>
            <th className='govuk-table__header' scope='col'>Cost</th>
            <th className='govuk-table__header' scope='col'>Condition</th>
            <th className='govuk-table__header' scope='col'>
              <a className='pull-right' href='#' onClick={this.onClickAddItem}>Add</a>
            </th>
          </tr>
        </thead>
        <tbody className='govuk-table__body'>
          {items.map((item, index) => (
            <tr key={item.description + index} className='govuk-table__row' scope='row'>
              <td className='govuk-table__cell'>
                <input className='govuk-input' name='description'
                  type='text' required defaultValue={item.description}
                  onBlur={this.onBlur} />
              </td>
              <td className='govuk-table__cell'>
                <input className='govuk-input' name='amount'
                  type='number' required defaultValue={item.amount}
                  onBlur={this.onBlur} step='any' />
              </td>
              <td className='govuk-table__cell'>
                <select className='govuk-select' id='link-source' name='condition' defaultValue={item.condition} required>
                  {conditions.map((condition, i) => (<option key={condition.name + i} value={condition.name} onBlur={this.onBlur}>{condition.displayName}</option>))}
                </select>
              </td>
              <td className='govuk-table__cell' width='20px'>
                <a className='list-item-delete' onClick={() => this.removeItem(index)}>&#128465;</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}

export default FeeItems

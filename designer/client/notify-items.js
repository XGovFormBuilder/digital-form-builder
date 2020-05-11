import React from 'react'
import { clone } from './helpers'

function headDuplicate (arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] === arr[i]) {
        return j
      }
    }
  }
}

class NotifyItems extends React.Component {
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

    const { data } = this.props
    const copy = clone(data)

    // Remove the list

    data.save(copy)
      .then(data => {
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onBlur = e => {
    const form = e.target.form
    const formData = new window.FormData(form)
    const personalisation = formData.getAll('personalisation').map(t => t.trim())

    // Only validate dupes if there is more than one item
    if (personalisation.length < 2) {
      return
    }
    console.log('form elements', form.elements)
    form.elements.personalisation.forEach(el => el.setCustomValidity(''))

    // Validate uniqueness
    const dupeCondition = headDuplicate(personalisation)
    if (dupeCondition) {
      form.elements.personalisation[dupeCondition].setCustomValidity('Duplicate conditions found in the list items')
    }
  }

  render () {
    const { items } = this.state
    const { values } = this.props

    return (
      <table className='govuk-table'>
        <caption className='govuk-table__caption'>
          Notify personalisations
          <span className='govuk-hint'>
            These values must match the personalisations in the GOV.UK Notify template.
          </span>
        </caption>
        <thead className='govuk-table__head'>
          <tr className='govuk-table__row'>
            <th className='govuk-table__header' scope='col'>Description</th>
            <th className='govuk-table__header' scope='col'>
              <a className='pull-right' href='#' onClick={this.onClickAddItem}>Add</a>
            </th>
          </tr>
        </thead>
        <tbody className='govuk-table__body'>
          {items.map((item, index) => (
            <tr key={item + index} className='govuk-table__row' scope='row'>
              <td className='govuk-table__cell'>
                <select className='govuk-select' id='link-source' name='personalisation' defaultValue={item} required>
                  {values.map((value, i) => (<option key={value + i} value={value} onBlur={this.onBlur}>{value}</option>))}
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

export default NotifyItems

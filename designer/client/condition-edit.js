import React from 'react'
import Editor from './editor'
import { clone } from './helpers'

class ConditionEdit extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const newName = formData.get('name').trim()
    const newValue = formData.get('value').trim()
    const { data, condition } = this.props

    const copy = clone(data)
    const nameChanged = newName !== condition.name
    const copyCondition = copy.conditions[data.conditions.indexOf(condition)]

    if (nameChanged) {
      copyCondition.name = newName

      // Update any references to the condition
      copy.pages.forEach(p => {
        Array.isArray(p.next) && p.next.forEach(n => {
          if (n.if === condition.name) {
            n.if = newName
          }
        })
      })
    }

    copyCondition.value = newValue

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onClickDelete = e => {
    e.preventDefault()

    if (!window.confirm('Confirm delete')) {
      return
    }

    const { data, condition } = this.props
    const copy = clone(data)

    // Remove the condition
    copy.conditions.splice(data.conditions.indexOf(condition), 1)

    // Update any references to the condition
    copy.pages.forEach(p => {
      Array.isArray(p.next) && p.next.forEach(n => {
        if (n.if === condition.name) {
          delete n.if
        }
      })
    })

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onBlurName = e => {
    const input = e.target
    const { data, condition } = this.props
    const newName = input.value.trim()

    // Validate it is unique
    if (data.conditions.find(s => s !== condition && s.name === newName)) {
      input.setCustomValidity(`Name '${newName}' already exists`)
    } else {
      input.setCustomValidity('')
    }
  }

  render () {
    const { condition } = this.props

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <a className='govuk-back-link' href='#'
          onClick={e => this.props.onCancel(e)}>Back</a>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='condition-name'>Name</label>
          <input className='govuk-input' id='condition-name' name='name'
            type='text' defaultValue={condition.name} required pattern='^\S+'
            onBlur={this.onBlurName} />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='condition-value'>Value</label>
          <Editor name='value' required value={condition.value} />
        </div>
        <button className='govuk-button' type='submit'>Save</button>{' '}
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }
}

export default ConditionEdit

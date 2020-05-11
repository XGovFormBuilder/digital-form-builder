import React from 'react'
import { clone } from './helpers'
import Editor from './editor'

class ConditionCreate extends React.Component {
  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const name = formData.get('name').trim()
    const value = formData.get('value').trim()
    const { data } = this.props
    const copy = clone(data)

    const condition = { name, value }
    copy.conditions.push(condition)

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onCreate({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onBlurName = e => {
    const input = e.target
    const { data } = this.props
    const newName = input.value.trim()

    // Validate it is unique
    if (data.conditions.find(s => s.name === newName)) {
      input.setCustomValidity(`Name '${newName}' already exists`)
    } else {
      input.setCustomValidity('')
    }
  }

  render () {
    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <a className='govuk-back-link' href='#'
          onClick={e => this.props.onCancel(e)}>Back</a>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='condition-name'>Name</label>
          <span className='govuk-hint'>Use `camelCasing` e.g. isSenior or hasClaims</span>
          <input className='govuk-input govuk-!-width-three-quarters' id='condition-name' name='name'
            type='text' required pattern='^\S+'
            onBlur={this.onBlurName} />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='condition-value'>Value</label>
          <span className='govuk-hint'>This can be any <a href='https://www.npmjs.com/package/expr-eval' target='_blank'>matching expression</a></span>
          <Editor name='value' required />
        </div>
        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default ConditionCreate

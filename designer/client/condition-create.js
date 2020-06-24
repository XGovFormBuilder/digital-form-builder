import React from 'react'
import { clone } from './helpers'

import Editor from './editor'

class ConditionCreate extends React.Component {
  onSubmit = e => {
    e.preventDefault()
    const displayName = this.state.displayName.trim()
    const value = this.state.value.trim()
    const { data } = this.props
    const copy = clone(data)

    data.getId()
      .then(id => {
        copy.addCondition(id, displayName, value)
        return copy
      })
      .then(copy => data.save(copy)
        .then(data => {
          console.log(data)
          this.props.onCreate({ data })
        })
        .catch(err => {
          console.error(err)
        })
      ).catch(err => {
        console.error(err)
      })
  }

  onBlurName = e => {
    const input = e.target
    const { data } = this.props
    const newName = input.value.trim()

    // Validate it is unique
    if (data.conditions.find(s => s.displayName === newName)) {
      input.setCustomValidity(`Display name '${newName}' already exists`)
    } else {
      input.setCustomValidity('')
    }
    this.setState({
      displayName: newName
    })
  }

  onValueChange = value => {
    this.setState({
      value: value
    })
  }

  render () {
    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <a className='govuk-back-link' href='#'
          onClick={e => this.props.onCancel(e)}>Back</a>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='condition-name'>Display Name</label>
          <input className='govuk-input govuk-!-width-three-quarters' id='condition-name' name='displayName'
            type='text'
            onBlur={this.onBlurName} required />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='condition-value'>Value</label>
          <span className='govuk-hint'>This can be any <a href='https://www.npmjs.com/package/expr-eval' target='_blank'>matching expression</a></span>
          <Editor name='value' required valueCallback={this.onValueChange} />
        </div>
        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default ConditionCreate

import React from 'react'
import { clone } from 'digital-form-builder-model/src/helpers'

class SectionCreate extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const name = formData.get('name').trim()
    const title = formData.get('title').trim()
    const { data } = this.props
    const copy = clone(data)

    const section = { name, title }
    copy.sections.push(section)

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
    if (data.sections.find(s => s.name === newName)) {
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
          <label className='govuk-label govuk-label--s' htmlFor='section-name'>Name</label>
          <span className='govuk-hint'>This is used as a namespace in the JSON output for all pages in this section. Use `camelCasing` e.g. checkBeforeStart or personalDetails.</span>
          <input className='govuk-input' id='section-name' name='name'
            type='text' required pattern='^\S+'
            onBlur={this.onBlurName} />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='section-title'>Title</label>
          <span className='govuk-hint'>This text displayed on the page above the main title.</span>
          <input className='govuk-input' id='section-title' name='title'
            type='text' required />
        </div>
        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default SectionCreate

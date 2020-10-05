import React from 'react'
import { clone } from '@xgovformbuilder/model'

class SectionEdit extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const newName = formData.get('name').trim()
    const newTitle = formData.get('title').trim()
    const { data, section } = this.props

    const copy = clone(data)
    const nameChanged = newName !== section.name
    const copySection = copy.sections[data.sections.indexOf(section)]

    if (nameChanged) {
      copySection.name = newName

      // Update any references to the section
      copy.pages.forEach(p => {
        if (p.section === section.name) {
          p.section = newName
        }
      })
    }

    copySection.title = newTitle

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

    const { data, section } = this.props
    const copy = clone(data)

    // Remove the section
    copy.sections.splice(data.sections.indexOf(section), 1)

    // Update any references to the section
    copy.pages.forEach(p => {
      if (p.section === section.name) {
        delete p.section
      }
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
    const { data, section } = this.props
    const newName = input.value.trim()

    // Validate it is unique
    if (data.sections.find(s => s !== section && s.name === newName)) {
      input.setCustomValidity(`Name '${newName}' already exists`)
    } else {
      input.setCustomValidity('')
    }
  }

  render () {
    const { section } = this.props

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <a
          className='govuk-back-link' href='#'
          onClick={e => this.props.onCancel(e)}
        >Back
        </a>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='section-name'>Name</label>
          <input
            className='govuk-input' id='section-name' name='name'
            type='text' defaultValue={section.name} required pattern='^\S+'
            onBlur={this.onBlurName}
          />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='section-title'>Title</label>
          <input
            className='govuk-input' id='section-title' name='title'
            type='text' defaultValue={section.title} required
          />
        </div>
        <button className='govuk-button' type='submit'>Save</button>{' '}
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }
}

export default SectionEdit

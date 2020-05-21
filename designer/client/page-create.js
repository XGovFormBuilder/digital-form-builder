import React from 'react'
import { clone } from './helpers'

class PageCreate extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const { data } = this.props
    const title = formData.get('title').trim()
    const path = '/'.concat(title.replace(/[^a-zA-Z ]/g, '').replace(' ', '-')).toLowerCase()

    // Validate
    if (data.pages.find(page => page.path === path)) {
      form.elements.path.setCustomValidity(`Path '${path}' already exists`)
      form.reportValidity()
      return
    }

    const value = {
      path: path
    }

    const section = formData.get('section').trim()
    const pageType = formData.get('page-type').trim()

    value.title = title

    if (section) {
      value.section = section
    }

    if (pageType) {
      value.controller = pageType
    }

    // Apply
    Object.assign(value, {
      components: [],
      next: []
    })

    const copy = clone(data)

    copy.pages.push(value)

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onCreate({ value })
      })
      .catch(err => {
        console.error(err)
      })
  }

  // onBlurName = e => {
  //   const input = e.target
  //   const { data } = this.props
  //   const newName = input.value.trim()

  //   // Validate it is unique
  //   if (data.lists.find(l => l.name === newName)) {
  //     input.setCustomValidity(`List '${newName}' already exists`)
  //   } else {
  //     input.setCustomValidity('')
  //   }
  // }

  render () {
    const { data } = this.props
    const { sections } = data

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-type'>Page Type</label>
          <select className='govuk-select' id='page-type' name='page-type'>
            <option value='./pages/start.js'>Start Page</option>
            <option value=''>Question Page</option>
            <option value='./pages/summary.js'>Summary Page</option>
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-title'>Title</label>
          <span id='page-title-hint' className='govuk-hint'>
            If not supplied, the title of the first question will be used.
          </span>
          <input className='govuk-input' id='page-title' name='title'
            type='text' aria-describedby='page-title-hint' required onChange={e => e.target.setCustomValidity('')} />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-section'>Section (optional)</label>
          <select className='govuk-select' id='page-section' name='section'>
            <option />
            {sections.map(section => (<option key={section.name} value={section.name}>{section.title}</option>))}
          </select>
        </div>

        <button type='submit' className='govuk-button'>Save</button>
      </form>
    )
  }
}

export default PageCreate

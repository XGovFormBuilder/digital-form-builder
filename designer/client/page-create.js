import React from 'react'
import { clone } from './helpers'
import { addLinkToPage, createNext } from './link-create'

class PageCreate extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const { data } = this.props

    const title = formData.get('title').trim()
    const linkFrom = formData.get('from').trim()
    const section = formData.get('section').trim()
    const pageType = formData.get('page-type').trim()

    let path = '/' + title
      .replace(/[^a-zA-Z ]/g, '')
      .replace(/\s/g, '-')
      .toLowerCase()

    let count = 1
    while (data.findPage(path)) {
      if (count > 1) {
        path = path.substr(0, path.length - 2)
      }
      path = `${path}-${count}`
      count++
    }

    const value = {
      path,
      title,
      components: [],
      next: []
    }

    if (section) {
      value.section = section
    }

    if (pageType) {
      value.controller = pageType
    }

    let copy = clone(data)

    copy.pages.push(value)

    if (linkFrom) {
      copy = addLinkToPage(copy, linkFrom, createNext(path))
    }

    data.save(copy)
      .then(data => {
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

  onChangeLinkFrom = e => {
    const input = e.target
    this.setState({
      linkFrom: input.value
    })
  }

  saveConditions = conditions => {
    this.setState({
      conditions: conditions
    })
  }

  render () {
    const { data } = this.props
    const { sections, pages } = data

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-type'>Page Type</label>
          <select className='govuk-select' id='page-type' name='page-type'>
            <option value=''>Question Page</option>
            <option value='./pages/start.js'>Start Page</option>
            <option value='./pages/summary.js'>Summary Page</option>
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-from'>Link from (optional)</label>
          <select className='govuk-select' id='link-from' name='from' onChange={this.onChangeLinkFrom}>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.path}</option>))}
          </select>

        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-title'>Title</label>
          <input className='govuk-input' id='page-title' name='title'
            type='text' aria-describedby='page-title-hint' required />
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

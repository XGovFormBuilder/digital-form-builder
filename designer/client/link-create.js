import React from 'react'
import { clone } from './helpers'

class LinkCreate extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const from = formData.get('path')
    const to = formData.get('page')
    const condition = formData.get('if')

    // Apply
    const { data } = this.props
    const copy = clone(data)
    const page = copy.pages.find(p => p.path === from)

    const next = { path: to }

    if (condition) {
      next.if = condition
    }

    if (!page.next) {
      page.next = []
    }

    page.next.push(next)

    console.log(data)
    data.save(copy)
      .then(() => {
        this.props.onCreate({ next })
      })
  }

  render () {
    const { data } = this.props
    const { pages } = data

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-source'>From</label>
          <select className='govuk-select' id='link-source' name='path' required>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.path}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-target'>To</label>
          <select className='govuk-select' id='link-target' name='page' required>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.path}</option>))}
          </select>
        </div>

        {/* <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-condition'>Condition (optional)</label>
          <span id='link-condition-hint' className='govuk-hint'>
            The link will only be used if the expression evaluates to truthy.
          </span>
          <Editor name='if' /> */}

        {/* <input className='govuk-input' id='link-condition' name='if'
            type='text' aria-describedby='link-condition-hint' /> */}
        {/* </div> */}

        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default LinkCreate

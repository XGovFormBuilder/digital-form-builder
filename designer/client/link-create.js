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
    const condition = formData.get('condition')

    // Apply
    const { data } = this.props
    const next = createNext(to, condition)
    const copy = addLinkToPage(data, from, next)

    data.save(copy)
      .then(() => {
        this.props.onCreate({ next })
      })
  }

  render () {
    const { data } = this.props
    const { pages, conditions } = data

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-source'>From</label>
          <select className='govuk-select' id='link-source' name='path' required>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-target'>To</label>
          <select className='govuk-select' id='link-target' name='page' required>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-condition'>Condition (optional)</label>
          <span id='link-condition-hint' className='govuk-hint'>
            The link will only be used if the expression evaluates to true.
          </span>
          <select className='govuk-select' id='link-condition' name='condition' aria-describedby='link-condition-hint'>
            <option value='' />
            {conditions.map(condition => (<option key={condition.name} value={condition.name}>{condition.displayName}</option>))}
          </select>
        </div>

        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default LinkCreate

export function addLinkToPage (data, from, next) {
  const copy = clone(data)
  const page = copy.findPage(from)

  if (!page.next) {
    page.next = []
  }

  page.next.push(next)
  return copy
}

export function createNext (to, condition) {
  const next = { path: to }
  if (condition) {
    next.condition = condition
  }
  return next
}

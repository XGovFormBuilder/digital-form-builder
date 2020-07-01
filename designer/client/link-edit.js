import React from 'react'
import { clone } from './helpers'

class LinkEdit extends React.Component {
  constructor (props) {
    super(props)

    const { data, edge } = this.props
    const page = data.findPage(edge.source)
    const link = page.next.find(n => n.path === edge.target)

    console.log(edge, link)

    this.state = {
      page: page,
      link: link
    }
  }

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const condition = formData.get('condition')
    const { data } = this.props
    const { link, page } = this.state

    const copy = clone(data)
    const copyPage = copy.findPage(page.path)
    const copyLink = copyPage.next.find(n => n.path === link.path)

    if (condition) {
      copyLink.condition = condition
    } else {
      delete copyLink.condition
    }

    data.save(copy)
      .then(data => {
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

    const { data } = this.props
    const { link, page } = this.state

    const copy = clone(data)
    const copyPage = copy.findPage(page.path)
    const copyLinkIdx = copyPage.next.findIndex(n => n.path === link.path)
    copyPage.next.splice(copyLinkIdx, 1)

    data.save(copy)
      .then(data => {
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render () {
    const { data, edge } = this.props
    const { pages, conditions } = data
    const { link } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-source'>From</label>
          <select defaultValue={edge.source} className='govuk-select' id='link-source' disabled>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-target'>To</label>
          <select defaultValue={edge.target} className='govuk-select' id='link-target' disabled>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-condition'>Condition (optional)</label>
          <span id='link-condition-hint' className='govuk-hint'>
            The link will only be used if the expression evaluates to true.
          </span>
          <select className='govuk-select' id='link-condition' name='condition' defaultValue={link.condition} aria-describedby='link-condition-hint'>
            <option value='' />
            {conditions.map(condition => (<option key={condition.name} value={condition.name}>{condition.displayName}</option>))}
          </select>
        </div>

        <button className='govuk-button' type='submit'>Save</button>&nbsp;
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }
}

export default LinkEdit

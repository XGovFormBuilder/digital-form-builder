import React from 'react'
import { clone } from './helpers'
import SelectConditions from './conditions/select-conditions'
import InlineConditionHelpers from './conditions/inline-condition-helpers'

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

  onSubmit = async e => {
    e.preventDefault()
    const { link, page, selectedCondition, conditions } = this.state
    const { data } = this.props

    const copy = clone(data)
    const conditionResult = await InlineConditionHelpers.storeConditionIfNecessary(copy, selectedCondition, conditions)
    const updatedData = conditionResult.data.updateLink(page.path, link.path, conditionResult.condition)

    data.save(updatedData)
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
    const { pages } = data
    const { link } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-source'>From</label>
          <select value={edge.source} className='govuk-select' id='link-source' disabled>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-target'>To</label>
          <select value={edge.target} className='govuk-select' id='link-target' disabled>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <SelectConditions data={data} path={edge.source} selectedCondition={link.condition} conditionsChange={this.saveConditions} />

        <button className='govuk-button' type='submit'>Save</button>&nbsp;
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }

  saveConditions = (conditions, selectedCondition) => {
    this.setState({
      conditions: conditions,
      selectedCondition: selectedCondition
    })
  }
}

export default LinkEdit

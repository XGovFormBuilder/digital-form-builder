import React from 'react'
import SelectConditions from './conditions/select-conditions'
import { toUrl } from './helpers'

class PageCreate extends React.Component {
  state = {}

  onSubmit = async e => {
    e.preventDefault()
    const { data } = this.props

    const title = this.state.title?.trim()
    const linkFrom = this.state.linkFrom?.trim()
    const section = this.state.section?.trim()
    const pageType = this.state.pageType?.trim()
    const selectedCondition = this.state.selectedCondition?.trim()
    const path = this.generatePath(title, data)

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

    let copy = data.clone()

    copy = copy.addPage(value)

    if (linkFrom) {
      copy = copy.addLink(linkFrom, path, selectedCondition)
    }
    try {
      await data.save(copy)
      this.props.onCreate({ value })
    } catch (err) {
      console.error(err)
    }
  }

  generatePath (title, data) {
    let path = toUrl(title)

    let count = 1
    while (data.findPage(path)) {
      if (count > 1) {
        path = path.substr(0, path.length - 2)
      }
      path = `${path}-${count}`
      count++
    }
    return path
  }

  render () {
    const { data } = this.props
    const { sections, pages } = data
    const { pageType, linkFrom, title, section } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-type'>Page Type</label>
          <select className='govuk-select' id='page-type' name='page-type' value={pageType} onChange={this.onChangePageType}>
            <option value=''>Question Page</option>
            <option value='./pages/start.js'>Start Page</option>
            <option value='./pages/summary.js'>Summary Page</option>
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-from'>Link from (optional)</label>
          <select className='govuk-select' id='link-from' name='from' value={linkFrom} onChange={this.onChangeLinkFrom}>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.path}</option>))}
          </select>
        </div>

        {linkFrom && linkFrom.trim() !== '' && <SelectConditions data={data} path={linkFrom} conditionsChange={this.conditionSelected} />}

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-title'>Title</label>
          <input className='govuk-input' id='page-title' name='title'
            type='text' aria-describedby='page-title-hint' required onBlur={this.onBlurTitle}
            defaultValue={title} />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-section'>Section (optional)</label>
          <select className='govuk-select' id='page-section' name='section' value={section} onChange={this.onChangeSection}>
            <option />
            {sections.map(section => (<option key={section.name} value={section.name}>{section.title}</option>))}
          </select>
        </div>

        <button type='submit' className='govuk-button'>Save</button>
      </form>
    )
  }

  onChangeLinkFrom = e => {
    const input = e.target
    this.setState({
      linkFrom: input.value
    })
  }

  onChangePageType = e => {
    const input = e.target
    this.setState({
      pageType: input.value
    })
  }

  onBlurTitle = e => {
    const input = e.target
    this.setState({
      title: input.value
    })
  }

  onChangeSection = e => {
    const input = e.target
    this.setState({
      section: input.value
    })
  }

  conditionSelected = (selectedCondition) => {
    this.setState({
      selectedCondition: selectedCondition
    })
  }
}

export default PageCreate

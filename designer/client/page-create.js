import React from 'react'
import SelectConditions from './conditions/select-conditions'
import { toUrl } from './helpers'
import { RenderInPortal } from './components/render-in-portal'
import Flyout from './flyout'
import SectionEdit from './section/section-edit'

class PageCreate extends React.Component {
  constructor (props) {
    super(props)
    const { page } = this.props
    this.state = {
      path: '/',
      controller: page?.controller ?? '',
      title: page?.title,
      section: page?.section ?? {},
      isEditingSection: false
    }
  }

  onSubmit = async e => {
    e.preventDefault()
    const { data } = this.props

    const title = this.state.title?.trim()
    const linkFrom = this.state.linkFrom?.trim()
    const section = this.state.section?.name?.trim()
    const pageType = this.state.pageType?.trim()
    const selectedCondition = this.state.selectedCondition?.trim()
    const path = this.state.path || this.state.path

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

  findSectionWithName (name) {
    const { data } = this.props
    const { sections } = data
    return sections.find(section => section.name === name)
  }

  onChangeSection = (e) => {
    this.setState({
      section: this.findSectionWithName(e.target.value)
    })
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

  onChangeTitle = e => {
    const { data } = this.props
    const input = e.target
    const title = input.value
    this.setState({
      title: title,
      path: this.generatePath(title, data)
    })
  }

  onChangePath = e => {
    const input = e.target
    const path = input.value.startsWith('/') ? input.value : `/${input.value}`
    const sanitisedPath = path.replace(/\s/g, '-')
    this.setState({
      path: sanitisedPath
    })
  }

  conditionSelected = (selectedCondition) => {
    this.setState({
      selectedCondition: selectedCondition
    })
  }

  editSection = (e, section) => {
    e.preventDefault()
    this.setState({
      section,
      isEditingSection: true
    })
  }

  closeFlyout = (sectionName) => {
    const propSection = this.state.section ?? {}
    this.setState({ isEditingSection: false, section: sectionName ? this.findSectionWithName(sectionName) : propSection })
  }

  render () {
    const { data } = this.props
    const { sections, pages } = data
    const { pageType, linkFrom, title, section, path, isEditingSection } = this.state

    return (
      <div>
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
            <input
              className='govuk-input' id='page-title' name='title'
              type='text' aria-describedby='page-title-hint' required onChange={this.onChangeTitle}
              value={title || ''}
            />
          </div>

          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='page-path'>Path</label>
            <span className='govuk-hint'>The path of this page e.g. &apos;/personal-details&apos;.</span>
            <input
              className='govuk-input' id='page-path' name='path'
              type='text' aria-describedby='page-path-hint' required
              value={path} onChange={this.onChangePath}
            />
          </div>

          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='page-section'>Section (optional)</label>
            <span className='govuk-hint'>The section title is shown above the page title. If the page and the section title are the same, the section title wont show.</span>
            {sections.length > 0 &&
            <select
              className='govuk-select' id='page-section' name='section' value={section?.name}
              onChange={this.onChangeSection}
            >
              <option/>
              {sections.map(section => (<option key={section.name} value={section.name}>{section.title}</option>))}
            </select>
            }
            {section?.name &&
            <a href='#' className="govuk-link govuk-!-display-block" onClick={this.editSection}>Edit section</a>
            }
            <a href='#' className="govuk-link govuk-!-display-block" onClick={this.editSection}>Create section</a>
          </div>

          <button type='submit' className='govuk-button'>Save</button>
        </form>
        { isEditingSection &&
        <RenderInPortal>
          <Flyout title={`${section?.name ? `Editing ${section.name}` : 'Add a new section'}`}
            onHide={this.closeFlyout} show={true}>
            <SectionEdit
              section={section}
              data={data}
              closeFlyout={this.closeFlyout}
            />
          </Flyout>
        </RenderInPortal>
        }
      </div>

    )
  }
}

export default PageCreate

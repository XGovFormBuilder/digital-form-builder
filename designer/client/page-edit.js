import React from 'react'
import { toUrl } from './helpers'
import { clone } from '@xgovformbuilder/model/lib/helpers'
import { RenderInPortal } from './components/render-in-portal'
import SectionEdit from './section/section-edit'
import { nanoid } from 'nanoid'
import Flyout from './flyout'

class PageEdit extends React.Component {
  constructor (props) {
    super(props)
    const { page } = this.props
    const path = page?.path !== this.generatePath(page.title) ? props.page.path : ''
    this.state = {
      path,
      controller: page?.controller ?? '',
      title: page?.title,
      section: page?.section ?? {},
      isEditingSection: false
    }
    this.formEditSection = React.createRef()
  }

  onSubmit = async e => {
    e.preventDefault()
    const form = e.target
    const { title, path, section, controller } = this.state
    const { data, page } = this.props

    const copy = clone(data)
    const pageIndex = data.pages.indexOf(page)
    const copyPage = copy.pages[pageIndex]
    const pathChanged = path !== page.path

    if (pathChanged) {
      // `path` has changed - validate it is unique
      if (data.findPage(path)) {
        form.elements.path.setCustomValidity(`Path '${path}' already exists`)
        form.reportValidity()
        return
      }
      data.updateLinksTo(page.path, path)
      copyPage.path = path
      if (pageIndex === 0) {
        copy.startPage = path
      }
    }

    copyPage.title = title
    section ? copyPage.section = section : delete copyPage.section
    controller ? copyPage.controller = controller : delete copyPage.controller

    copy.pages[pageIndex] = copyPage
    try {
      await data.save(copy)
      this.props.onEdit({ data })
    } catch (err) {
      console.error(err)
    }
  }

  onClickDelete = async e => {
    e.preventDefault()

    if (!window.confirm('Confirm delete')) {
      return
    }

    const { data, page } = this.props
    const copy = clone(data)

    const copyPageIdx = copy.pages.findIndex(p => p.path === page.path)

    // Remove all links to the page
    copy.pages.forEach((p, index) => {
      if (index !== copyPageIdx && Array.isArray(p.next)) {
        for (let i = p.next.length - 1; i >= 0; i--) {
          const next = p.next[i]
          if (next.path === page.path) {
            p.next.splice(i, 1)
          }
        }
      }
    })

    copy.pages.splice(copyPageIdx, 1)
    try {
      await data.save(copy)
    } catch (error) {
      console.error(error)
    }
  }

  onClickDuplicate = async e => {
    e.preventDefault()

    const { data, page } = this.props
    const copy = clone(data)
    const duplicatedPage = clone(page)
    duplicatedPage.path = `${duplicatedPage.path}-${nanoid(6)}`
    duplicatedPage.components.forEach(component => {
      component.name = `${duplicatedPage.path}-${nanoid(6)}`
    })
    copy.pages.push(duplicatedPage)
    try {
      await data.save(copy)
    } catch (err) {
      console.error(err)
    }
  }

  onChangeTitle = e => {
    const input = e.target
    const title = input.value
    this.setState({
      title: title,
      path: this.generatePath(title)
    })
  }

  onChangePath = e => {
    const input = e.target.value
    const path = input.startsWith('/') ? input : `/${input}`
    this.setState({
      path: path.replace(/\s/g, '-')
    })
  }

  generatePath (title) {
    let path = toUrl(title)
    const { data, page } = this.props
    if (data.findPage(path) && page.title !== title) {
      path = `${path}-${nanoid(6)}`
    }
    return path
  }

  editSection = (e) => {
    e.preventDefault()
    this.setState({ isEditingSection: true })
  }

  createSection = (e) => {
    e.preventDefault()
    this.setState({ isEditingSection: true })
  }

  closeFlyout = (sectionName) => {
    const propSection = this.state.section ?? this.props.page?.section ?? {}
    this.setState({ isEditingSection: false, section: sectionName ? this.findSectionWithName(sectionName) : propSection })
  }

  onChangeSection = (e) => {
    console.log('looking for', e.target.value)
    this.setState({
      section: this.findSectionWithName(e.target.value)
    })
  }

  findSectionWithName (name) {
    const { data } = this.props
    const { sections } = data
    return sections.find(section => section.name === name)
  }

  render () {
    const { data } = this.props
    const { sections } = data
    const { title, path, controller, section, isEditingSection } = this.state

    return (
      <div>
        <form onSubmit={this.onSubmit} autoComplete='off'>
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='page-type'>Page Type</label>
            <select
              className='govuk-select' id='page-type' name='page-type' value={controller}
              onChange={e => this.setState({ controller: e.target.value })}
            >
              <option value=''>Question Page</option>
              <option value='./pages/start.js'>Start Page</option>
              <option value='./pages/summary.js'>Summary Page</option>
            </select>
          </div>

          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='page-title'>Page Title</label>
            <input
              className='govuk-input' id='page-title' name='title' type='text' value={title}
              aria-describedby='page-title-hint' required onChange={this.onChangeTitle}
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
            <a href='#' className="govuk-link govuk-!-display-block" onClick={this.createSection}>Create section</a>
          </div>

          <button className='govuk-button' type='submit'>Save</button>{' '}
          <button className='govuk-button' type='button' onClick={this.onClickDuplicate}>Duplicate</button>{' '}
          <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
        </form>
        { isEditingSection &&
        <RenderInPortal>
          <Flyout title={`${section?.name ? `Editing ${section.name}` : 'Add a new section'}`}
            onHide={this.closeFlyout} show={isEditingSection}>
            <form ref={this.formEditSection}>
              <SectionEdit
                section={section}
                data={data}
                closeFlyout={this.closeFlyout}
              />
            </form>
          </Flyout>
        </RenderInPortal>
        }
      </div>

    )
  }
}

export default PageEdit

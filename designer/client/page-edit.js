import React from 'react'
import { toUrl } from './helpers'
import { clone } from '@xgovformbuilder/model/lib/helpers'
import { RenderInPortal } from './components/render-in-portal'
import Flyout from './flyout'
import SectionsEdit from './section/sections-edit'
import SectionEdit from './section/section-edit'

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
      isCreatingSection: false
    }
    this.formEditSection = React.createRef()
  }

  onSubmit = async e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    /*    const title = formData.get('title').trim()
    const newPath = formData.get('path').trim()
    const section = formData.get('section').trim()
    const pageType = formData.get('page-type').trim() */
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

    if (section) {
      copyPage.section = section
    } else {
      delete copyPage.section
    }

    if (controller) {
      copyPage.controller = controller
    } else {
      delete copyPage.controller
    }

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
    const id = Math.floor(100 + Math.random() * 900)
    duplicatedPage.path = `${duplicatedPage.path}-${id}`
    duplicatedPage.components.forEach(component => {
      component.name = `${duplicatedPage.path}-${id}`
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
    const input = e.target
    const path = input.value.startsWith('/') ? input.value : `/${input.value}`
    const sanitizedPath = path.replace(/\s/g, '-')
    this.setState({
      path: sanitizedPath
    })
  }

  generatePath (title) {
    let path = toUrl(title)
    const { data, page } = this.props

    let count = 1
    while (data.findPage(path) && page.title !== title) {
      if (count > 1) {
        path = path.substr(0, path.length - 2)
      }
      path = `${path}-${count}`
      count++
    }
    return path
  }

  editSection = (e) => {
    e.preventDefault()
    this.setState({ isCreatingSection: true })
  }

  createSection = (e) => {
    e.preventDefault()
    this.setState({ isCreatingSection: true, section: {} })
  }

  closeFlyout = (sectionName) => {
    const propSection = this.state.section ?? this.props.page?.section ?? {}
    this.setState({ isCreatingSection: false, section: sectionName ? this.findSectionWithName(sectionName) : propSection })
  }

  onChangeSection = (e) => {
    const { data } = this.props
    const { sections } = data
    console.log('val', e.target.value)
    console.log('find section', sections.find(section => section.name === e.target.value))
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
    const { title, path, controller, section, isCreatingSection } = this.state

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
            {sections.length > 0 &&
              <a href='#' className="govuk-link govuk-!-display-block" onClick={this.editSection}>Edit section</a>
            }
            <a href='#' className="govuk-link govuk-!-display-block" onClick={this.createSection}>Create section</a>
          </div>

          <button className='govuk-button' type='submit'>Save</button>{' '}
          <button className='govuk-button' type='button' onClick={this.onClickDuplicate}>Duplicate</button>{' '}
          <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
        </form>
        { isCreatingSection &&
        <RenderInPortal>
          <Flyout title='Add Item' show={isCreatingSection} offset={1}
            onHide={this.closeFlyout}>
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

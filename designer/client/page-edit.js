import React from 'react'
import { toUrl } from './helpers'
import { clone } from '@xgovformbuilder/model/lib/helpers'

class PageEdit extends React.Component {
  constructor (props) {
    super(props)
    this.state = props.page.path !== this.generatePath(props.page.title) ? { path: props.page.path } : {}
  }

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const formData = new window.FormData(form)
    const title = formData.get('title').trim()
    const newPath = formData.get('path').trim()
    const section = formData.get('section').trim()
    const pageType = formData.get('page-type').trim()
    const { data, page } = this.props

    const copy = clone(data)
    const pathChanged = newPath !== page.path
    const pageIndex = data.pages.indexOf(page)
    const copyPage = copy.pages[pageIndex]

    if (pathChanged) {
      // `path` has changed - validate it is unique
      if (data.findPage(newPath)) {
        form.elements.path.setCustomValidity(`Path '${newPath}' already exists`)
        form.reportValidity()
        return
      }

      data.updateLinksTo(page.path, newPath)

      copyPage.path = newPath

      if (pageIndex === 0) {
        copy.startPage = newPath
      }
    }

    copyPage.title = title

    if (section) {
      copyPage.section = section
    } else {
      delete copyPage.section
    }

    if (pageType) {
      copyPage.controller = pageType
    } else {
      delete copyPage.controller
    }

    copy.pages[pageIndex] = copyPage
    data.save(copy)
      .then(data => {
        console.log(data)
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

    const { data, page } = this.props
    const copy = clone(data)

    const copyPageIdx = copy.pages.findIndex(p => p.path === page.path)

    // Remove all links to the page
    copy.pages.forEach((p, index) => {
      if (index !== copyPageIdx && Array.isArray(p.next)) {
        for (var i = p.next.length - 1; i >= 0; i--) {
          const next = p.next[i]
          if (next.path === page.path) {
            p.next.splice(i, 1)
          }
        }
      }
    })

    // Remove the page itself
    copy.pages.splice(copyPageIdx, 1)

    data.save(copy)
      .then(data => {
        console.log(data)
        // this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onClickDuplicate = e => {
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

    data.save(copy)
      .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  onChangeTitle = e => {
    const input = e.target
    const title = input.value
    this.setState({
      title: title,
      generatedPath: this.generatePath(title)
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

  render () {
    const { data, page } = this.props
    const { sections } = data
    const { title, path, generatedPath, controller, section } = this.state

    const configuredController = controller || page.controller || ''
    const configuredPath = path || generatedPath || page.path || ''
    const configuredTitle = title || page.title || ''
    const configuredSection = section || page.section || ''

    return (
      <form onSubmit={this.onSubmit} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-type'>Page Type</label>
          <select
            className='govuk-select' id='page-type' name='page-type' value={configuredController}
            onChange={e => this.setState({ controller: e.target.value })}
          >
            <option value=''>Question Page</option>
            <option value='./pages/start.js'>Start Page</option>
            <option value='./pages/summary.js'>Summary Page</option>
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-title'>Title</label>
          <input
            className='govuk-input' id='page-title' name='title' type='text' value={configuredTitle}
            aria-describedby='page-title-hint' required onChange={this.onChangeTitle}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-path'>Path</label>
          <span className='govuk-hint'>The path of this page e.g. '/personal-details'.</span>
          <input
            className='govuk-input' id='page-path' name='path'
            type='text' aria-describedby='page-path-hint' required
            value={configuredPath} onChange={this.onChangePath}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-section'>Section (optional)</label>
          <select
            className='govuk-select' id='page-section' name='section' value={configuredSection}
            onChange={e => this.setState({ section: e.target.value })}
          >
            <option />
            {sections.map(section => (<option key={section.name} value={section.name}>{section.title}</option>))}
          </select>
        </div>

        <button className='govuk-button' type='submit'>Save</button>{' '}
        <button className='govuk-button' type='button' onClick={this.onClickDuplicate}>Duplicate</button>{' '}
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }
}

export default PageEdit

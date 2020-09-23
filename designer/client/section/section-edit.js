import React from 'react'
import { clone } from '@xgovformbuilder/model/lib/helpers'
import { camelCase } from '../helpers'

class SectionEdit extends React.Component {
  constructor (props) {
    super(props)
    this.onCancel = props.onCancel
    const { section } = props

    this.state = {
      name: section?.name ?? '',
      title: section?.name ?? ''
    }
  }

  onSubmit = async e => {
    e.preventDefault()
    const { name, title } = this.state
    const { data } = this.props
    const { generatedName } = this.state
    const copy = clone(data)

    const updated = copy.addSection(name || generatedName, title.trim())

    try {
      const savedData = await data.save(updated)
      this.props.onCreate(savedData)
    } catch (err) {
      console.error(err)
    }
    const form = e.target
    const formData = new window.FormData(form)
    const newName = formData.get('name').trim()
    const newTitle = formData.get('title').trim()
    const section = { name, title }
    const nameChanged = newName !== name
    const copySection = copy.sections[data.sections.indexOf(section)]

    if (nameChanged) {
      copySection.name = newName

      // Update any references to the section
      copy.pages.forEach(p => {
        if (p.section === name) {
          p.section = newName
        }
      })
    }

    copySection.title = newTitle

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

    const { data, section } = this.props
    const copy = clone(data)

    // Remove the section
    copy.sections.splice(data.sections.indexOf(section), 1)

    // Update any references to the section
    copy.pages.forEach(p => {
      if (p.section === name) {
        delete p.section
      }
    })

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onBlurName = e => {
    const input = e.target
    const { data, section } = this.props
    const newName = input.value.trim()

    // Validate it is unique
    if (data.sections.find(s => s !== section && s.name === newName)) {
      input.setCustomValidity(`Name '${newName}' already exists`)
    } else {
      input.setCustomValidity('')
    }
  }

  onChangeTitle = e => {
    const input = e.target
    const { data } = this.props
    const newTitle = input.value
    const generatedName = camelCase(newTitle).trim()
    let newName = generatedName

    let i = 1
    while (data.sections.find(s => s.name === newName)) {
      newName = generatedName + i
      i++
    }

    this.setState({
      generatedName: newName,
      title: newTitle
    })
  }

  render () {
    const { name, title } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <a
          className='govuk-back-link' href='#'
          onClick={e => this.props.onCancel(e)}
        >Back
        </a>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='section-title'>Title</label>
          <input
            className='govuk-input' id='section-title' name='title'
            type='text'
            value={title}
            onChange={this.onChangeTitle}
            required
          />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='section-name'>Name</label>
          <input
            className='govuk-input' id='section-name' name='name'
            type='text' value={name} required pattern='^\S+'
            onBlur={this.onBlurName}
          />
        </div>
        <button className='govuk-button' type='submit'>Save</button>{' '}
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }
}

export default SectionEdit

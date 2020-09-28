import React from 'react'
import { clone } from '@xgovformbuilder/model/lib/helpers'
import Name from '../name'
import { nanoid } from 'nanoid'

class SectionEdit extends React.Component {
  constructor (props) {
    super(props)
    this.closeFlyout = props.closeFlyout
    const { section } = props
    this.isNewSection = !section?.name

    this.state = {
      name: section?.name ?? nanoid(6),
      title: section?.title ?? ''
    }
  }

  async onSubmit (e) {
    e.preventDefault()
    const { name, title } = this.state
    const { data } = this.props
    const copy = clone(data)
    if (this.isNewSection) {
      copy.addSection(name, title.trim())
    } else {
      const previousName = this.props.section?.name
      const nameChanged = previousName !== name
      const copySection = copy.sections.find(section => section.name === previousName)

      if (nameChanged) {
        copySection.name = name
        /**
         * @code removing any references to the section
         */
        copy.pages.forEach(p => {
          if (p.section === previousName) {
            p.section = name
          }
        })
      }
      copySection.title = title
    }

    try {
      await data.save(copy)
      this.closeFlyout(name)
    } catch (err) {
      console.error(err)
    }
  }

  onChangeTitle = e => {
    this.setState({
      title: e.target.value
    })
  }

  onClickDelete = async e => {
    e.preventDefault()
    const { name } = this.state

    if (!window.confirm('Confirm delete')) {
      return
    }

    const { data, section } = this.props
    const copy = clone(data)

    // Remove the section
    copy.sections.splice(data.sections.indexOf(section), 1)

    // Update any references to the section
    copy.pages.forEach(p => {
      if (p.section.name === name) {
        delete p.section
      }
    })

    try {
      await data.save(copy)
    } catch (error) {
      // TODO:- we should really think about handling these errors properly.
      console.log(error)
    }
  }

  render () {
    const { title, name } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
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
        <Name id='section-name' labelText='Section name' name={ name }
        />

        <button className='govuk-button' type='submit'>Save</button>{' '}
        <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
      </form>
    )
  }
}

export default SectionEdit

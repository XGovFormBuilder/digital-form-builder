import React from 'react'
import { clone } from '@xgovformbuilder/model/dist/helpers'
import Name from '../name'
import { nanoid } from 'nanoid'
import { withI18n } from '../i18n'

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
    if (!window.confirm('Confirm delete')) {
      return
    }

    const { data, section } = this.props
    const copy = clone(data)
    const previousName = this.props.section?.name

    copy.sections.splice(data.sections.indexOf(section), 1)

    // Update any references to the section
    copy.pages.forEach(p => {
      if (p.section === previousName) {
        delete p.section
      }
    })

    try {
      await data.save(copy)
      this.closeFlyout({})
    } catch (error) {
      // TODO:- we should really think about handling these errors properly.
      console.log(error)
    }
  }

  render () {
    const { i18n } = this.props
    const { title, name } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='section-title'>{i18n('title')}</label>
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
        {!this.isNewSection &&
          <button className='govuk-button' type='button' onClick={this.onClickDelete}>{i18n('delete')}</button>
        }
      </form>
    )
  }
}

export default withI18n(SectionEdit)

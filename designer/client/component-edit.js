import React from 'react'
import { getFormData } from './helpers'
import ComponentTypeEdit from './component-type-edit'
import { clone } from 'digital-form-builder-model/lib/helpers'

class ComponentEdit extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const { data, page, component } = this.props
    const formData = getFormData(form)
    const copy = clone(data)
    const copyPage = copy.findPage(page.path)

    // Apply
    const componentIndex = page.components.indexOf(component)
    copyPage.components[componentIndex] = formData
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

    const { data, page, component } = this.props
    const componentIdx = page.components.findIndex(c => c === component)
    const copy = clone(data)

    const copyPage = copy.findPage(page.path)
    const isLast = componentIdx === page.components.length - 1

    // Remove the component
    copyPage.components.splice(componentIdx, 1)

    data.save(copy)
      .then(data => {
        console.log(data)
        if (!isLast) {
          // We dont have an id we can use for `key`-ing react <Component />'s
          // We therefore need to conditionally report `onEdit` changes.
          this.props.onEdit({ data })
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  render () {
    const { page, component, data } = this.props

    const copyComp = JSON.parse(JSON.stringify(component))

    return (
      <div>
        <form autoComplete='off' onSubmit={e => this.onSubmit(e)}>
          <div className='govuk-form-group'>
            <span className='govuk-label govuk-label--s' htmlFor='type'>Type</span>
            <span className='govuk-body'>{component.type}</span>
            <input id='type' type='hidden' name='type' defaultValue={component.type} />
          </div>

          <ComponentTypeEdit
            page={page}
            component={copyComp}
            data={data} />

          <button className='govuk-button' type='submit'>Save</button>{' '}
          <button className='govuk-button' type='button' onClick={this.onClickDelete}>Delete</button>
        </form>
      </div>
    )
  }
}

export default ComponentEdit

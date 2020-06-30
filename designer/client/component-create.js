import React from 'react'
import { clone, getFormData } from './helpers'
import ComponentTypeEdit from './component-type-edit'
import componentTypes from 'digital-form-builder-engine/component-types'

class ComponentCreate extends React.Component {
  state = {}

  onSubmit = e => {
    e.preventDefault()
    const form = e.target
    const { page, data } = this.props
    const formData = getFormData(form)
    const copy = clone(data)
    const copyPage = copy.findPage(page.path)

    // Apply
    copyPage.components.push(formData)

    data.save(copy)
      .then(data => {
        console.log(data)
        this.props.onCreate({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render () {
    const { page, data } = this.props

    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='type'>Type</label>
            <select className='govuk-select' id='type' name='type' required
              onChange={e => this.setState({ component: { type: e.target.value } })}>
              <option />
              {componentTypes.sort((a, b) => (a.title??'').localeCompare(b.title))
                .map(type => {
                  return <option key={type.name} value={type.name}>{type.title}</option>
                })}
            </select>
          </div>

          {this.state.component && this.state.component.type && (
            <div>
              <ComponentTypeEdit
                page={page}
                component={this.state.component}
                data={data} />

              <button type='submit' className='govuk-button'>Save</button>
            </div>
          )}

        </form>
      </div>
    )
  }
}

export default ComponentCreate

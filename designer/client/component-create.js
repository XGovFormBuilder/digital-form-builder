import React from 'react'
import ComponentTypeEdit from './component-type-edit'
import ComponentTypes from '@xgovformbuilder/model/lib/component-types'
import { clone } from '@xgovformbuilder/model/lib/helpers'

class ComponentCreate extends React.Component {
  state = {
    isSaving: false
  }

  async componentDidMount () {
    const { data } = this.props
    const id = await data.getId()
    this.setState({ id })
  }

  async onSubmit (e) {
    e.preventDefault()

    if (this.state.isSaving) {
      return
    }

    this.setState({ isSaving: true })

    const { page, data } = this.props
    const { component } = this.state
    const copy = clone(data)

    const updated = copy.addComponent(page.path, component)

    const saved = await data.save(updated)
    this.props.onCreate({ data: saved })
  }

  storeComponent = (component) => {
    this.setState({ component })
  }

  render () {
    const { page, data } = this.props
    const { id, isSaving } = this.state

    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='type'>Type</label>
            <select
              className='govuk-select' id='type' name='type' required
              onChange={e => this.setState({ component: { type: e.target.value, name: id } })}
            >
              <option />
              {ComponentTypes.sort((a, b) => (a.title ?? '').localeCompare(b.title)).map(type => {
                return <option key={type.name} value={type.name}>{type.title}</option>
              })}
            </select>
          </div>

          {this.state?.component?.type && (
            <div>
              <ComponentTypeEdit
                page={page}
                data={data}
                component={this.state.component}
                updateModel={this.storeComponent}
              />
              <button
                type='submit'
                className='govuk-button'
                disabled={isSaving}
              >Save</button>
            </div>
          )}
        </form>
      </div>
    )
  }
}

export default ComponentCreate

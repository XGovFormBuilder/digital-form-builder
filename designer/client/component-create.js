import React from 'react'
import ComponentTypeEdit from './component-type-edit'
import ComponentTypes from '@xgovformbuilder/model/lib/component-types'
import { clone } from '@xgovformbuilder/model/lib/helpers'

class ComponentCreate extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.storeComponent = this.storeComponent.bind(this)
  }

  async componentDidMount () {
    const { data } = this.props
    const id = await data.getId()
    this.setState({ id })
  }

  async onSubmit (e) {
    e.preventDefault()
    const { page, data } = this.props
    const { component } = this.state
    const copy = clone(data)

    const updated = copy.addComponent(page.path, component)

    const saved = await data.save(updated)
    this.props.onCreate({ data: saved })
  }

  render () {
    const { page, data } = this.props
    const { id } = this.state

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

          {this.state.component && this.state.component.type && (
            <div>
              <ComponentTypeEdit
                page={page}
                component={this.state.component}
                data={data}
                updateModel={this.storeComponent}
              />

              <button type='submit' className='govuk-button'>Save</button>
            </div>
          )}

        </form>
      </div>
    )
  }

  storeComponent (component) {
    this.setState({ component })
  }
}

export default ComponentCreate

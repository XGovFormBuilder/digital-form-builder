import React from 'react'
import ComponentTypeEdit from './component-type-edit'
import { ConditionalComponentTypes } from 'digital-form-builder-engine'
//
// conditional-component-types is a cut down version of /component-types containing only one component i.e. TextField
//
// import componentTypes from 'digital-form-builder-engine/component-types'

class ComponentConditionCreate extends React.Component {
  constructor (props) {
    super(props)

    const { conditional } = this.props
    const { components } = conditional || {}

    this.state = {
      component: components && components.length ? components[0] : null
    }
  }

  render () {
    const { component } = this.state
    const { idHelper } = this.props
    const selectedType = component ? component.type : ''

    return (
      <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='type'>Type</label>
          <select className='govuk-select' id={`${idHelper || ''}'type`} name='cond-type' defaultValue={selectedType}
            onChange={e => this.setState({ component: { type: e.target.value } })}>
            <option />
            {ConditionalComponentTypes.map(type => {
              return <option key={type.name} value={type.name}>{type.title}</option>
            })}
          </select>
        </div>
        { selectedType &&
          <div>
            <ComponentTypeEdit data={{}}
              component={this.state.component} />
          </div>
        }
      </div>
    )
  }
}

export default ComponentConditionCreate

import React from 'react'
import ComponentTypeEdit from '../component-type-edit'
import ComponentTypes from '@xgovformbuilder/model/lib/component-types'

class DefineChildComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      component: props.component
    }
  }

  async componentDidMount () {
    const { data } = this.props
    const { component } = this.state
    this.setState({id: component?.name || await data.getId()})
  }

  render () {
    const { page, data } = this.props
    const { id, component } = this.state

    return (
      <div>
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

        {component && component.type && (
          <div>
            <ComponentTypeEdit
              page={page}
              component={component}
              data={data}
              updateModel={this.props.saveCallback}
            />
            <a
              href='#' id='cancel-add-component-link' className='govuk-link'
              onClick={this.props.cancelCallback}
            >Cancel
            </a>
          </div>
        )}
      </div>
    )
  }
}

export default DefineChildComponent

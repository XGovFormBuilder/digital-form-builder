import React from 'react'
import { ComponentTypes } from '@xgovformbuilder/model'

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
    this.setState({ id: component?.name || await data.getId() })
  }

  render () {
    const { page, data, EditComponentView } = this.props
    const { id, component } = this.state

    return (
      <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='type'>Type</label>
          <select
            className='govuk-select' id='type' name='type' required
            onChange={e => this.setState({ component: { type: e.target.value, name: id } })}
            defaultValue={component?.type}
          >
            <option />
            {ComponentTypes.sort((a, b) => (a.title ?? '').localeCompare(b.title)).map(type => {
              return <option key={type.name} value={type.name}>{type.title}</option>
            })}
          </select>
        </div>

        {component && component.type && (
          <div>
            <EditComponentView
              page={page}
              component={component}
              data={data}
              updateModel={this.storeComponent}
            />
            <a
              href='#' id='save-child-component-link' className='govuk-button'
              onClick={() => this.props.saveCallback(component)}
            >Save
            </a>
            <a
              href='#' id='cancel-child-component-link' className='govuk-link'
              onClick={this.props.cancelCallback}
            >Cancel
            </a>
          </div>
        )}
      </div>
    )
  }

  storeComponent = (component) => {
    this.setState({ component })
  }
}

export default DefineChildComponent

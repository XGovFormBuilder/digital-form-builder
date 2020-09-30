// @flow

import React from 'react'

type Props = {
  updateModel: ?(any) => {},
  component: ?any,
  hint: ?string,
  name: string,
  id: string,
  labelText: string
}

type State = {
  name: ?string,
  nameHasError: boolean
}

export default class Name extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    const { name, component } = this.props

    this.state = {
      name: component?.name ?? name,
      nameHasError: false
    }
  }

  onChangeName = (event: any) => {
    const inputValue = event.target.value
    this.setState({
      name: inputValue,
      nameHasError: (/\s/g).test(inputValue)
    }, () => this.updateGlobalState())
  }

  updateGlobalState = () => {
    const { updateModel, component } = this.props
    const { name, nameHasError } = this.state
    if (updateModel && !nameHasError) {
      updateModel({ ...component, name })
    }
  }

  render () {
    const { id, labelText, hint } = this.props
    const { name, nameHasError } = this.state

    return (
      <div className={`govuk-form-group ${nameHasError ? 'govuk-form-group--error' : ''}`}>
        <label className='govuk-label govuk-label--s' htmlFor={id}>{labelText}</label>
        <span className='govuk-hint'>
          { hint || 'This has been generated automatically, it will not show on the page. You usually wont need to change it unless an integration requires it. It must not contain spaces.' }
        </span>
        { nameHasError &&
        <span
          className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> Name must not contain spaces
        </span>
        }
        <input
          className={`govuk-input govuk-input--width-20 ${nameHasError ? 'govuk-input--error' : ''}`} id={id}
          name='name' type='text' required pattern='^\S+'
          value={name}
          onChange={this.onChangeName}
        />
      </div>
    )
  }
}

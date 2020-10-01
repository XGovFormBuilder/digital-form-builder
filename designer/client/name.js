// @flow

import React from 'react'
import { withI18n } from './i18n'

type Props = {
  updateModel: ?(any) => {},
  component: ?any,
  hint: ?string,
  name: string,
  id: string,
  labelText: string,
  i18n: (string) => any
}

type State = {
  name: ?string,
  nameHasError: boolean
}

export class Name extends React.Component<Props, State> {
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
    const { id, labelText, hint, i18n } = this.props
    const { name, nameHasError } = this.state

    return (
      <div className={`govuk-form-group ${nameHasError ? 'govuk-form-group--error' : ''}`}>
        <label className='govuk-label govuk-label--s' htmlFor={id}>{labelText}</label>
        <span className='govuk-hint'>
          { hint || i18n('name.hint') }
        </span>
        { nameHasError &&
        <span
          className="govuk-error-message">
          <span className="govuk-visually-hidden">{i18n('error')}</span> {i18n('name.errors.whitespace')}
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

export default withI18n(Name)

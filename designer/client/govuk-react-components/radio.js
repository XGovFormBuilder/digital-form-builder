import React from 'react'
import { renderHints } from './helpers'

// TODO: Replace with govuk-react-jsx component

export class RadioGroup extends React.Component {
  radioId = Date.now()

  render () {
    const { name, heading, children, options, value, onClick } = this.props

    return (
      <fieldset className='govuk-fieldset' aria-describedby={`${name}-hint`}>
        <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
          <h1 className='govuk-fieldset__heading'>
            {heading}
          </h1>
        </legend>

        { renderHints(name, options?.hints) }

        <div className='govuk-radios govuk-radios--inline'>
          {children.map(child => (
            React.cloneElement(child, {
              name,
              id: `radio-${this.radioId}`,
              key: `key-${child.props.value}`,
              required: options?.required,
              defaultChecked: value === child.props.value,
              onClick
            })
          ))}
        </div>
      </fieldset>
    )
  }
}

export function RadioOption (props) {
  const { id, text, value, checked, onClick, hint, name } = props
  const inputId = `${id}-${value}`

  return (
    <div className='govuk-radios__item'>
      <input
        id={inputId}
        className='govuk-radios__input'
        name={name}
        type='radio'
        value={value}
        defaultChecked={checked}
        onClick={onClick}
        aria-describedby={`${inputId}-hint`}
      />
      <label className='govuk-label govuk-radios__label' htmlFor={inputId}>
        {text}
      </label>
      {hint && (
        <div id={`${inputId}-hint`} className="govuk-hint govuk-radios__hint">
          {hint}
        </div>
      )}
    </div>
  )
}

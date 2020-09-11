// @flow
import React from 'react'
import { InputOptions, renderHints } from './helpers'

export function radioGroup (name: string, heading: string, items: Array<RadioOption>, options: ?InputOptions) {
  return <fieldset className='govuk-fieldset' aria-describedby={`${name}-hint`}>
    <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
      <h1 className='govuk-fieldset__heading'>
        {heading}
      </h1>
    </legend>
    { renderHints(name, options?.hints) }

    <div className='govuk-radios govuk-radios--inline'>
      {items.map((option, index) =>
        <div key={`${option.id}-${index}`} className='govuk-radios__item'>
          <input className='govuk-radios__input' id={option.id} name={name} type='radio' value={option.value} defaultChecked={option.checked} onClick={option.onClick} aria-describedby={`${option.id}-hint`} required={options?.required}/>
          <label className='govuk-label govuk-radios__label' htmlFor={option.id}>
            {option.text}
          </label>
          {option.hint &&
            <div id={`${option.id}-hint`} className="govuk-hint govuk-radios__hint">
              {option.hint}
            </div>
          }
        </div>
      )}
    </div>
  </fieldset>
}

export class RadioOption {
  id: string;
  text: string;
  value: string;
  checked: boolean;
  onClick: function;
  hint: ?string;

  constructor (id: string, text: string, value: string, checked: boolean, onClick: function, hint: ?string) {
    this.id = id
    this.text = text
    this.value = value
    this.checked = checked
    this.onClick = onClick
    this.hint = hint
  }
}

// @flow
import React from 'react'

export function radio (name: string, heading: string, hint: ?string, options: Array<Option>) {
  return <fieldset className='govuk-fieldset' aria-describedby={`${name}-hint`}>
    <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
      <h1 className='govuk-fieldset__heading'>
        {heading}
      </h1>
    </legend>
    {hint &&
      <div id={`${name}-hint`} className='govuk-hint'>
        {hint}
      </div>
    }

    <div className='govuk-radios govuk-radios--inline'>
      {options.map((option, index) =>
        <div key={`${option.id}-${index}`} className='govuk-radios__item'>
          <input className='govuk-radios__input' id={option.id} name={name} type='radio' value={option.value} defaultChecked={option.checked} onClick={option.onClick} />
          <label className='govuk-label govuk-radios__label' htmlFor={option.id}>
            {option.text}
          </label>
        </div>
      )}
    </div>
  </fieldset>
}

export class Option {
  id: string;
  text: string;
  value: string;
  checked: boolean;
  onClick: function;

  constructor (id: string, text: string, value: string, checked: boolean, onClick: function) {
    this.id = id
    this.text = text
    this.value = value
    this.checked = checked
    this.onClick = onClick
  }
}

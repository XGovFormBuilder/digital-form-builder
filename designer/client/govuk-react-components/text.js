// @flow
import React from 'react'
import { InputOptions, renderHints } from './helpers'

export function textGroup (id: string, name: string, label: string, defaultValue: ?string, onBlur: function, options: ?InputOptions) {
  return <div className='govuk-form-group'>
    <label className='govuk-label govuk-label--s' htmlFor={id} aria-describedby={`${id}-hint`}>{ label }</label>
    { renderHints(id, options?.hints) }
    {text(id, name, defaultValue, onBlur, options)}
  </div>
}

export function text (id: string, name: string, defaultValue: ?string, onBlur: function, options: ?InputOptions) {
  return <input
    className='govuk-input' id={id} name={name} type='text'
    defaultValue={defaultValue}
    onBlur={onBlur}
    required={options?.required}
  />
}

export function textAreaGroup (id: string, name: string, label: string, defaultValue: ?string, rows: number, onBlur: function, options: ?InputOptions) {
  return <div className='govuk-form-group'>
    <label className='govuk-label govuk-label--s' htmlFor={id}>{label}</label>
    { renderHints(id, options?.hints) }
    <textarea
      className='govuk-textarea' id={id} name={name}
      defaultValue={defaultValue} rows={rows}
      onBlur={onBlur}
    />
  </div>
}

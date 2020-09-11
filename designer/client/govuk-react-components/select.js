import React from 'react'
import { InputOptions, renderHints } from './helpers'

export function selectGroup (id: string, name: string, label: string, defaultValue: string, items: Array<SelectOption>, onChange: function, options: ?SelectInputOptions) {
  return <div className='govuk-form-group' id={options.groupId}>
    <label className='govuk-label govuk-label--s' htmlFor={id}>{label}</label>
    { renderHints(id, options?.hints) }
    <select className='govuk-select' id={id} name={name} onChange={onChange} value={defaultValue}>
      {options?.includeBlankOption && <option/>}
      {items.map((option, index) => (<option key={`${option.value}-${index}`} value={option.value} >{option.text}</option>))}
    </select>
  </div>
}

export class SelectInputOptions extends InputOptions {
  includeBlankOption: boolean;
  groupId: ?string;

  constructor (required: boolean, includeBlankOption: boolean, hints: ?Array<string>, groupId: ?string) {
    super(required, hints)
    this.includeBlankOption = includeBlankOption
    this.groupId = groupId
  }
}

export class SelectOption {
  text: string;
  value: string;

  constructor (text: string, value: string) {
    this.text = text
    this.value = value
  }
}

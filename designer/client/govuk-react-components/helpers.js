// @flow
import React from 'react'

export function renderHints (id: string, hints: ?Array<string>) {
  return <span className='govuk-hint' id={`${id}-hint`}>
    { hints && hints.map((hint, index) => {
      if (index !== hints.length - 1) {
        return <span key={`${id}-hint-${index}`}>{hint} <br /></span>
      }
      return <span key={`${id}-hint-${index}`}>{hint}</span>
    })
    }
  </span>
}

export class InputOptions {
  hints: ?Array<string>;
  required: boolean;

  constructor (required: boolean, hints: ?Array<string> = []) {
    this.required = required
    this.hints = hints
  }
}

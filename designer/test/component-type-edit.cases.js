export function casesForAllInputs (type, modelCustomisation = {}) {
  return [
    { type, name: 'populating title', fieldId: 'field-title', event: 'onBlur', value: 'My title', expectedModel: { ...modelCustomisation, type, title: 'My title', options: {} } },
    { type, name: 'populating hint', fieldId: 'field-hint', event: 'onChange', value: 'My hint', expectedModel: { ...modelCustomisation, type, hint: 'My hint', options: {} } },
    { type, name: 'selecting hide title', fieldId: 'field-options-hideTitle', event: 'onChange', value: '', expectedModel: { ...modelCustomisation, type, options: { hideTitle: true } } },
    { type, name: 'selecting unhide title', fieldId: 'field-options-hideTitle', event: 'onChange', value: '', componentInitialState: { options: { hideTitle: true } }, expectedModel: { ...modelCustomisation, type, options: { hideTitle: false } } }
  ]
}

export function casesForAllExceptFileUpload (type, modelCustomisation = {}) {
  return [
    ...casesForAllInputs(type, modelCustomisation),
    { type, name: 'selecting optional', fieldId: 'field-options-required', event: 'onChange', value: '', expectedModel: { ...modelCustomisation, type, options: { required: false } } },
    { type, name: 'selecting optional when required is explicitly true', fieldId: 'field-options-required', event: 'onChange', value: '', componentInitialState: { options: { required: true } }, expectedModel: { ...modelCustomisation, type, options: { required: false } } },
    { type, name: 'deselecting optional', fieldId: 'field-options-required', event: 'onChange', value: '', componentInitialState: { options: { required: false } }, expectedModel: { ...modelCustomisation, type, options: { required: undefined } } },
    { type, name: 'selecting hide optional text', fieldId: 'field-options-optionalText', event: 'onChange', value: '', expectedModel: { ...modelCustomisation, type, options: { optionalText: false } } },
    { type, name: 'selecting hide optional text when explicitly true', fieldId: 'field-options-optionalText', event: 'onChange', value: '', componentInitialState: { options: { optionalText: true } }, expectedModel: { ...modelCustomisation, type, options: { optionalText: false } } },
    { type, name: 'deselecting hide optional text', fieldId: 'field-options-optionalText', event: 'onChange', value: '', componentInitialState: { options: { optionalText: false } }, expectedModel: { ...modelCustomisation, type, options: { optionalText: undefined } } }
  ]
}

export function classesCases (type, modelCustomisation = {}) {
  return [{ type, name: 'populating classes', fieldId: 'field-options-classes', event: 'onBlur', value: 'my-class', expectedModel: { ...modelCustomisation, type, options: { classes: 'my-class' } } }]
}

export function textFieldCases (type) {
  return [
    ...casesForAllExceptFileUpload(type, { schema: {} }),
    { type, name: 'populating max length', fieldId: 'field-schema-max', event: 'onBlur', value: '236', expectedModel: { type, schema: { max: '236' }, options: {} } },
    { type, name: 'populating min length', fieldId: 'field-schema-min', event: 'onBlur', value: '236', expectedModel: { type, schema: { min: '236' }, options: {} } },
    { type, name: 'populating exact length', fieldId: 'field-schema-length', event: 'onBlur', value: '236', expectedModel: { type, schema: { length: '236' }, options: {} } },
    { type, name: 'populating regex', fieldId: 'field-schema-regex', event: 'onBlur', value: '[a-z0-9]', expectedModel: { type, schema: { regex: '[a-z0-9]' }, options: {} } },
    ...classesCases(type, { schema: {} })
  ]
}

export const componentCases = [
  ...casesForAllInputs('FileUploadField'),
  ...classesCases('FileUploadField'),
  ...textFieldCases('TextField'),
  ...textFieldCases('EmailAddressField'),
  ...textFieldCases('TelephoneNumberField'),
  ...casesForAllExceptFileUpload('MultilineTextField', { schema: {} }),
  { type: 'MultilineTextField', name: 'populating max length', fieldId: 'field-schema-max', event: 'onBlur', value: '236', expectedModel: { type: 'MultilineTextField', schema: { max: '236' }, options: {} } },
  { type: 'MultilineTextField', name: 'populating min length', fieldId: 'field-schema-min', event: 'onBlur', value: '236', expectedModel: { type: 'MultilineTextField', schema: { min: '236' }, options: {} } },
  { type: 'MultilineTextField', name: 'populating number of rows', fieldId: 'field-options-rows', event: 'onBlur', value: '236', expectedModel: { type: 'MultilineTextField', schema: { }, options: { rows: '236' } } },
  ...classesCases('MultilineTextField', { schema: {} }),
  ...casesForAllExceptFileUpload('NumberField', { schema: {} }),
  { type: 'NumberField', name: 'populating max value', fieldId: 'field-schema-max', event: 'onBlur', value: '236', expectedModel: { type: 'NumberField', schema: { max: '236' }, options: {} } },
  { type: 'NumberField', name: 'populating min value', fieldId: 'field-schema-min', event: 'onBlur', value: '236', expectedModel: { type: 'NumberField', schema: { min: '236' }, options: {} } },
  { type: 'NumberField', name: 'populating precision', fieldId: 'field-schema-precision', event: 'onBlur', value: '236', expectedModel: { type: 'NumberField', schema: { precision: '236' }, options: {} } },
  ...classesCases('NumberField', { schema: {} }),
  ...casesForAllExceptFileUpload('DateField'),
  ...casesForAllExceptFileUpload('DatePartsField'),
  { type: 'DatePartsField', name: 'populating max days in past', fieldId: 'field-options-maxDaysInPast', event: 'onBlur', value: '236', expectedModel: { type: 'DatePartsField', options: { maxDaysInPast: '236' } } },
  { type: 'DatePartsField', name: 'populating max days in future', fieldId: 'field-options-maxDaysInFuture', event: 'onBlur', value: '236', expectedModel: { type: 'DatePartsField', options: { maxDaysInFuture: '236' } } },
  ...classesCases('DatePartsField'),
  ...casesForAllExceptFileUpload('SelectField'),
  ...classesCases('SelectField'),
  ...casesForAllExceptFileUpload('RadiosField'),
  { type: 'RadiosField', name: 'selecting bold labels', fieldId: 'field-options-bold', event: 'onChange', value: '', expectedModel: { type: 'RadiosField', options: { bold: true } } },
  { type: 'RadiosField', name: 'deselecting bold labels', fieldId: 'field-options-bold', event: 'onChange', value: '', componentInitialState: { options: { bold: true } }, expectedModel: { type: 'RadiosField', options: { bold: false } } },
  ...casesForAllExceptFileUpload('CheckboxesField'),
  { type: 'CheckboxesField', name: 'selecting bold labels', fieldId: 'field-options-bold', event: 'onChange', value: '', expectedModel: { type: 'CheckboxesField', options: { bold: true } } },
  { type: 'CheckboxesField', name: 'deselecting bold labels', fieldId: 'field-options-bold', event: 'onChange', value: '', componentInitialState: { options: { bold: true } }, expectedModel: { type: 'CheckboxesField', options: { bold: false } } },
  { type: 'List', name: 'selecting numbered', fieldId: 'field-options-type', event: 'onChange', value: 'numbered', expectedModel: { type: 'List', options: { type: 'numbered' } } },
  { type: 'List', name: 'deselecting numbered', fieldId: 'field-options-type', event: 'onChange', value: 'numbered', componentInitialState: { options: { type: 'numbered' } }, expectedModel: { type: 'List', options: { type: undefined } } },
  { type: 'Details', name: 'populating title', fieldId: 'details-title', event: 'onBlur', value: '236', expectedModel: { type: 'Details', title: '236' } },
  { type: 'Details', name: 'populating content', fieldId: 'details-content', event: 'onBlur', value: '236', expectedModel: { type: 'Details', content: '236' } }
]

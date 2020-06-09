import React from 'react'
import componentTypes from 'digital-form-builder-engine/component-types'
import Editor from './editor'

function Classes (props) {
  const { component } = props
  const options = component.options || {}

  return (
    <div className='govuk-form-group'>
      <label className='govuk-label govuk-label--s' htmlFor='field-options.classes'>Classes</label>
      <span className='govuk-hint'>Additional CSS classes to add to the field<br />
      E.g. govuk-input--width-2 (or 3, 4, 5, 10, 20) or govuk-!-width-one-half (two-thirds, three-quarters etc.)</span>
      <input className='govuk-input' id='field-options.classes' name='options.classes' type='text'
        defaultValue={options.classes} />
    </div>
  )
}
class FieldEdit extends React.Component {
  constructor (props) {
    super(props)
    const { component } = this.props

    const options = component.options || {}
    this.state = {
      hidden: options.required !== false
    }
  }

  checkOptionalBox () {
    this.setState({ hidden: !this.state.hidden })
  }

  render () {
    const { component } = this.props
    const isFileUploadField = component.type === 'FileUploadField'
    const options = component.options || {}

    return (
      <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-name'>Name</label>
          <span className='govuk-hint'>This is used as the key in the JSON output. Use `camelCasing` e.g. dateOfBirth or
            fullName.</span>
          <input className='govuk-input govuk-input--width-20' id='field-name'
            name='name' type='text' defaultValue={component.name} required pattern='^\S+' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-title'>Title</label>
          <span className='govuk-hint'>This is the title text displayed on the page</span>
          <input className='govuk-input' id='field-title' name='title' type='text'
            defaultValue={component.title} required />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-hint'>Hint (optional)</label>
          <span className='govuk-hint'>The hint can include HTML</span>
          <textarea className='govuk-textarea' id='field-hint' name='hint'
            defaultValue={component.hint} rows='2' />
        </div>
        <div className='govuk-checkboxes govuk-form-group'>
          <div className='govuk-checkboxes__item'>
            <input className={`govuk-checkboxes__input ${isFileUploadField ? 'disabled' : ''}`} id='field-options.required'
              name='options.required' type='checkbox' defaultChecked={isFileUploadField}
              onChange={(e) => this.checkOptionalBox(e)}
              />
            <label className='govuk-label govuk-checkboxes__label'
              htmlFor='field-options.required'>Optional</label>
            {isFileUploadField && (
              <span className='govuk-hint govuk-checkboxes__label'>All file upload fields are optional to mitigate possible upload errors</span>
            )}
            {!isFileUploadField && (
              <span className='govuk-hint'>The hint can include HTML</span>
            )}

          </div>
        </div>

        <div className={`govuk-checkboxes govuk-form-group`} hidden={this.state.hidden}>
          <div className='govuk-checkboxes__item'>
            <input className='govuk-checkboxes__input' id='field-options.optionalText'
              name='options.optionalText' type='checkbox' defaultChecked={options.optionalText === false} />
            <label className='govuk-label govuk-checkboxes__label'
              htmlFor='field-options.optionalText'>Hide '(Optional)' text</label>
          </div>
        </div>

        {this.props.children}
      </div>
    )
  }
}

function FileUploadFieldEdit (props) {
  const { component } = props
  const options = component.options || {}

  return (
    <FieldEdit component={component}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-checkboxes govuk-form-group'>
          <div className='govuk-checkboxes__item'>
            <input className='govuk-checkboxes__input' id='field-options.multiple'
              name='options.multiple' type='checkbox' defaultChecked={options.multiple === false} />
            <label className='govuk-label govuk-checkboxes__label'
              htmlFor='field-options.multiple'>Allow multiple</label>
          </div>
        </div>

        <Classes component={component} />
      </details>
    </FieldEdit>
  )
}

function TextFieldEdit (props) {
  const { component } = props
  const schema = component.schema || {}

  return (
    <FieldEdit component={component}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.max'>Max length</label>
          <span className='govuk-hint'>Specifies the maximum number of characters</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.max' name='schema.max'
            defaultValue={schema.max} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.min'>Min length</label>
          <span className='govuk-hint'>Specifies the minimum number of characters</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.min' name='schema.min'
            defaultValue={schema.min} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.length'>Length</label>
          <span className='govuk-hint'>Specifies the exact text length</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.length' name='schema.length'
            defaultValue={schema.length} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.regex'>Regex</label>
          <span className='govuk-hint'>Specifies a regex against which input will be validated</span>
          <input className='govuk-input'
            id='field-schema.regex' name='schema.regex'
            defaultValue={schema.regex} />
        </div>

        <Classes component={component} />
      </details>
    </FieldEdit>
  )
}

function MultilineTextFieldEdit (props) {
  const { component } = props
  const schema = component.schema || {}
  const options = component.options || {}

  return (
    <FieldEdit component={component}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.max'>Max length</label>
          <span className='govuk-hint'>Specifies the maximum number of characters</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.max' name='schema.max'
            defaultValue={schema.max} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.min'>Min length</label>
          <span className='govuk-hint'>Specifies the minimum number of characters</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.min' name='schema.min'
            defaultValue={schema.min} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options.rows'>Rows</label>
          <input className='govuk-input govuk-input--width-3' id='field-options.rows' name='options.rows' type='text'
            data-cast='number' defaultValue={options.rows} />
        </div>

        <Classes component={component} />
      </details>
    </FieldEdit>
  )
}

function NumberFieldEdit (props) {
  const { component } = props
  const schema = component.schema || {}

  return (
    <FieldEdit component={component}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.min'>Min</label>
          <span className='govuk-hint'>Specifies the minimum value</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.min' name='schema.min'
            defaultValue={schema.min} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.max'>Max</label>
          <span className='govuk-hint'>Specifies the maximum value</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema.max' name='schema.max'
            defaultValue={schema.max} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema.precision'>Precision</label>
          <span className='govuk-hint'>How many decimal places can users enter?</span>
          <input className='govuk-input govuk-input--width-3' data-cast='number' id='field-schema.precision'
            name='schema.precision' defaultValue={schema.precision || 0} type='number' />
        </div>

        <Classes component={component} />
      </details>
    </FieldEdit>
  )
}

function DateFieldEdit (props) {
  const { component } = props
  const options = component.options || {}

  return (
    <FieldEdit component={component}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options.maxDaysInPast'>Maximum days in the past</label>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-options.maxDaysInPast' name='options.maxDaysInPast'
            defaultValue={options.maxDaysInPast} type='number' />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options.maxDaysInFuture'>Maximum days in the future</label>
          <input className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-options.maxDaysInFuture' name='options.maxDaysInFuture'
            defaultValue={options.maxDaysInFuture} type='number' />
        </div>

        <Classes component={component} />
      </details>
    </FieldEdit>
  )
}

function SelectFieldEdit (props) {
  const { component, data } = props
  const options = component.options || {}
  const lists = data.lists

  return (
    <FieldEdit component={component}>
      <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options.list'>List</label>
          <select className='govuk-select govuk-input--width-10' id='field-options.list' name='options.list'
            defaultValue={options.list} required>
            <option />
            {lists.map(list => {
              return <option key={list.name} value={list.name}>{list.title}</option>
            })}
          </select>
        </div>

        <Classes component={component} />
      </div>
    </FieldEdit>
  )
}

function RadiosFieldEdit (props) {
  const { component, data } = props
  const options = component.options || {}
  const lists = data.lists

  return (
    <FieldEdit component={component}>
      <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options.list'>List</label>
          <select className='govuk-select govuk-input--width-10' id='field-options.list' name='options.list'
            defaultValue={options.list} required>
            <option />
            {lists.map(list => {
              return <option key={list.name} value={list.name}>{list.title}</option>
            })}
          </select>
        </div>
      </div>

      <div className='govuk-checkboxes govuk-form-group'>
        <div className='govuk-checkboxes__item'>
          <input className='govuk-checkboxes__input' id='field-options.bold' data-cast='boolean'
            name='options.bold' type='checkbox' defaultChecked={options.bold === true} />
          <label className='govuk-label govuk-checkboxes__label'
            htmlFor='field-options.bold'>Bold labels</label>
        </div>
      </div>
    </FieldEdit>
  )
}

function CheckboxesFieldEdit (props) {
  const { component, data } = props
  const options = component.options || {}
  const lists = data.lists

  return (
    <FieldEdit component={component}>
      <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options.list'>List</label>
          <select className='govuk-select govuk-input--width-10' id='field-options.list' name='options.list'
            defaultValue={options.list} required>
            <option />
            {lists.map(list => {
              return <option key={list.name} value={list.name}>{list.title}</option>
            })}
          </select>
        </div>
      </div>

      <div className='govuk-checkboxes govuk-form-group'>
        <div className='govuk-checkboxes__item'>
          <input className='govuk-checkboxes__input' id='field-options.bold' data-cast='boolean'
            name='options.bold' type='checkbox' defaultChecked={options.bold === true} />
          <label className='govuk-label govuk-checkboxes__label'
            htmlFor='field-options.bold'>Bold labels</label>
        </div>
      </div>
    </FieldEdit>
  )
}

function ParaEdit (props) {
  const { component, data } = props
  let options = component.options || {}
  let componentCondition = options.condition || ''
  const { conditions } = data

  return (
    <div>
      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='para-content'>Content</label>
        <span className='govuk-hint'>The content can include HTML and the `govuk-prose-scope` css class is available. Use this on a wrapping element to apply default govuk styles.</span>
        {/* <textarea className='govuk-textarea' id='para-content' name='content'
          defaultValue={component.content} rows='10' required /> */}
        <Editor name='content' value={component.content} />
      </div>
      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='condition'>Condition (optional)</label>
        <span className='govuk-hint'>Only show this content if the condition is truthy. </span>
        <select className='govuk-select' id='condition' name='options.condition' defaultValue={componentCondition}>
          <option value='' />
          {conditions.map(condition => (<option key={condition.name} value={condition.name}>{condition.name}</option>))}
        </select>
      </div>
    </div>
  )
}

function ListContentEdit (props) {
  const { component, data } = props
  const options = component.options || {}
  const { lists } = data

  return (
    <div>
      <div className='govuk-form-group'>
        <label className='govuk-label govuk-label--s' htmlFor='field-options.list'>List</label>
        <select className='govuk-select govuk-input--width-10' id='field-options.list' name='options.list'
          defaultValue={options.list} required>
          <option />
          {lists.map(list => {
            return <option key={list.name} value={list.name}>{list.title}</option>
          })}
        </select>
      </div>
      <div className='govuk-checkboxes govuk-form-group'>
        <div className='govuk-checkboxes__item'>
          <input className='govuk-checkboxes__input' id='options.type'
            name='options.type' value='numbered' type='checkbox' defaultChecked={options.type === 'numbered'} />
          <label className='govuk-label govuk-checkboxes__label'
            htmlFor='field-options.type'>Numbered</label>
        </div>
      </div>
    </div>
  )
}

function FlashCardEdit (props) {
  const { component, data } = props
  const options = component.options || {}
  const { lists } = data

  return (
    <div className='govuk-form-group'>
      <label className='govuk-label' htmlFor='para-content'>List</label>
      <div className='govuk-form-group'>
        <label className='govuk-label govuk-label--s' htmlFor='field-options.list'>List</label>
        <select className='govuk-select govuk-input--width-10' id='field-options.list' name='options.list'
          defaultValue={options.list} required>
          <option />
          {lists.map(list => {
            return <option key={list.name} value={list.name}>{list.title}</option>
          })}
        </select>
      </div>
    </div>
  )
}

const InsetTextEdit = ParaEdit
const WarningTextEdit = ParaEdit
const HtmlEdit = ParaEdit

function DetailsEdit (props) {
  const { component } = props

  return (
    <div>

      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='details-title'>Title</label>
        <input className='govuk-input' id='details-title' name='title'
          defaultValue={component.title} required />
      </div>

      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='details-content'>Content</label>
        <span className='govuk-hint'>The content can include HTML and the `govuk-prose-scope` css class is available. Use this on a wrapping element to apply default govuk styles.</span>
        <textarea className='govuk-textarea' id='details-content' name='content'
          defaultValue={component.content} rows='10' required />
      </div>
    </div>
  )
}

const componentTypeEditors = {
  'TextFieldEdit': TextFieldEdit,
  'EmailAddressFieldEdit': TextFieldEdit,
  'TelephoneNumberFieldEdit': TextFieldEdit,
  'NumberFieldEdit': NumberFieldEdit,
  'MultilineTextFieldEdit': MultilineTextFieldEdit,
  'AutocompleteFieldEdit': SelectFieldEdit,
  'SelectFieldEdit': SelectFieldEdit,
  'RadiosFieldEdit': RadiosFieldEdit,
  'CheckboxesFieldEdit': CheckboxesFieldEdit,
  'ParaEdit': ParaEdit,
  'HtmlEdit': HtmlEdit,
  'InsetTextEdit': InsetTextEdit,
  'WarningTextEdit': WarningTextEdit,
  'DetailsEdit': DetailsEdit,
  'FlashCardEdit': FlashCardEdit,
  'FileUploadFieldEdit': FileUploadFieldEdit,
  'DatePartsFieldEdit': DateFieldEdit,
  'ListEdit': ListContentEdit
}

class ComponentTypeEdit extends React.Component {
  render () {
    const { component, data } = this.props

    const type = componentTypes.find(t => t.name === component.type)
    if (!type) {
      return ''
    } else {
      const TagName = componentTypeEditors[`${component.type}Edit`] || FieldEdit
      return <TagName component={component} data={data} />
    }
  }
}

export default ComponentTypeEdit

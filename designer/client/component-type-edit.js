import React from 'react'
import Editor from './editor'
import Name from './name'
import { ComponentTypes } from '@xgovformbuilder/model'
import ComponentValues from './components/component-values'
import { textAreaGroup } from './govuk-react-components/text'
import { InputOptions } from './govuk-react-components/helpers'

function updateComponent (component, modifier, updateModel) {
  modifier(component)
  updateModel(component)
}

function Classes (props) {
  const { component, updateModel } = props
  component.options = component.options || {}

  return (
    <div className='govuk-form-group'>
      <label className='govuk-label govuk-label--s' htmlFor='field-options-classes'>Classes</label>
      <span className='govuk-hint'>Additional CSS classes to add to the field<br />
      E.g. govuk-input--width-2 (or 3, 4, 5, 10, 20) or govuk-!-width-one-half (two-thirds, three-quarters etc.)
      </span>
      <input
        className='govuk-input' id='field-options-classes' name='options.classes' type='text'
        defaultValue={component.options.classes}
        onBlur={e => updateComponent(component, component => { component.options.classes = e.target.value }, updateModel)}
      />
    </div>
  )
}

class FieldEdit extends React.Component {
  constructor (props) {
    super(props)
    const { component } = this.props
    const options = component.options || {}
    this.isFileUploadField = component.type === 'FileUploadField'

    this.state = {
      hidden: options.required !== false,
      name: component.name
    }
  }

  checkOptionalBox () {
    if (this.isFileUploadField) { return }
    this.setState({ hidden: !this.state.hidden })
  }

  onChangeName = (event) => {
    const inputValue = event.target.value
    this.setState({
      name: inputValue,
      nameHasError: (/\s/g).test(inputValue)
    })
  }

  render () {
    const { component, updateModel } = this.props
    component.options = component.options || {}
    return (
      <div>
        <div data-test-id='standard-inputs'>
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='field-title'>Title</label>
            <span className='govuk-hint'>This is the title text displayed on the page</span>
            <input
              className='govuk-input' id='field-title' name='title' type='text'
              defaultValue={component.title} required
              onBlur={e => updateComponent(component, component => { component.title = e.target.value }, updateModel)}
            />
          </div>

          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='field-hint'>Help Text (optional)</label>
            <span className='govuk-hint'>Text can include HTML</span>
            <textarea
              className='govuk-textarea' id='field-hint' name='hint'
              defaultValue={component.hint} rows='2'
              onBlur={e => updateComponent(component, component => { component.hint = e.target.value }, updateModel)}
            />
          </div>

          {textAreaGroup(
            'field-hint',
            'hint',
            'Help Text (optional)',
            component.hint,
            2,
            e => updateComponent(component, component => { component.hint = e.target.value }, updateModel),
            new InputOptions(false, ['Text can include HTML'])
          )}

          <div className='govuk-checkboxes govuk-form-group'>
            <div className='govuk-checkboxes__item'>
              <input
                className='govuk-checkboxes__input' id='field-options-hideTitle'
                name='options.hideTitle' type='checkbox' value checked={component.options.hideTitle || false}
                onChange={() => updateComponent(component, component => { component.options.hideTitle = !component.options.hideTitle }, updateModel)}
              />
              <label
                className='govuk-label govuk-checkboxes__label'
                htmlFor='field-options-hideTitle'
              >Hide title
              </label>
              <span className='govuk-hint'>Hide the title of the component</span>
            </div>
          </div>

          <Name component={component} id='field-name' labelText='Component name' updateComponent={updateComponent} updateModel={updateModel}/>

          <div className='govuk-checkboxes govuk-form-group'>
            <div className='govuk-checkboxes__item'>
              <input
                className={`govuk-checkboxes__input ${this.isFileUploadField ? 'disabled' : ''}`} id='field-options-required'
                name='options.required' type='checkbox' checked={this.isFileUploadField || component.options.required === false}
                onChange={(e) => {
                  updateComponent(component, component => { component.options.required = component.options.required === false ? undefined : false }, updateModel)
                  this.checkOptionalBox(e)
                }
                }
              />
              <label
                className='govuk-label govuk-checkboxes__label'
                htmlFor='field-options-required'
              >{`Make ${ComponentTypes.find(type => type.name === component.type)?.title ?? ''} optional`}
              </label>
              {this.isFileUploadField && (
                <span className='govuk-hint govuk-checkboxes__label'>All file upload fields are optional to mitigate possible upload errors</span>
              )}
            </div>
          </div>

          <div className='govuk-checkboxes govuk-form-group' data-test-id='field-options.optionalText-wrapper' hidden={this.state.hidden}>
            <div className='govuk-checkboxes__item'>
              <input
                className='govuk-checkboxes__input' id='field-options-optionalText'
                name='options.optionalText' type='checkbox' checked={component.options.optionalText === false}
                onChange={e => updateComponent(component, component => { component.options.optionalText = component.options.optionalText === false ? undefined : false }, updateModel)}
              />
              <label
                className='govuk-label govuk-checkboxes__label'
                htmlFor='field-options-optionalText'
              >Hide &apos;(Optional)&apos; text
              </label>
            </div>
          </div>
        </div>

        {this.props.children}
      </div>
    )
  }
}

function FileUploadFieldEdit (props) {
  const { component, updateModel } = props
  component.options = component.options || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-checkboxes govuk-form-group'>
          <div className='govuk-checkboxes__item'>
            <input
              className='govuk-checkboxes__input' id='field-options.multiple'
              name='options.multiple' type='checkbox' checked={component.options.multiple === false}
              onChange={() => updateComponent(component, component => { component.options.multiple = !component.options.multiple }, updateModel)}
            />
            <label
              className='govuk-label govuk-checkboxes__label'
              htmlFor='field-options.multiple'
            >Allow multiple
            </label>
          </div>
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  )
}

function TextFieldEdit (props) {
  const { component, updateModel } = props
  component.schema = component.schema || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-max'>Max length</label>
          <span className='govuk-hint'>Specifies the maximum number of characters</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-max' name='schema.max'
            defaultValue={component.schema.max} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.max = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-min'>Min length</label>
          <span className='govuk-hint'>Specifies the minimum number of characters</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-min' name='schema.min'
            defaultValue={component.schema.min} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.min = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-length'>Length</label>
          <span className='govuk-hint'>Specifies the exact text length</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-length' name='schema.length'
            defaultValue={component.schema.length} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.length = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-regex'>Regex</label>
          <span className='govuk-hint'>Specifies a regex against which input will be validated</span>
          <input
            className='govuk-input'
            id='field-schema-regex' name='schema.regex'
            defaultValue={component.schema.regex}
            onBlur={e => updateComponent(component, component => { component.schema.regex = e.target.value }, updateModel)}
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  )
}

function MultilineTextFieldEdit (props) {
  const { component, updateModel } = props
  component.schema = component.schema || {}
  component.options = component.options || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-max'>Max length</label>
          <span className='govuk-hint'>Specifies the maximum number of characters</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-max' name='schema.max'
            defaultValue={component.schema.max} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.max = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-min'>Min length</label>
          <span className='govuk-hint'>Specifies the minimum number of characters</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-min' name='schema.min'
            defaultValue={component.schema.min} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.min = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options-rows'>Rows</label>
          <input
            className='govuk-input govuk-input--width-3' id='field-options-rows' name='options.rows' type='text'
            data-cast='number' defaultValue={component.options.rows}
            onBlur={e => updateComponent(component, component => { component.options.rows = e.target.value }, updateModel)}
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  )
}

function NumberFieldEdit (props) {
  const { component, updateModel } = props
  component.schema = component.schema || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-min'>Min</label>
          <span className='govuk-hint'>Specifies the minimum value</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-min' name='schema.min'
            defaultValue={component.schema.min} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.min = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-max'>Max</label>
          <span className='govuk-hint'>Specifies the maximum value</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-schema-max' name='schema.max'
            defaultValue={component.schema.max} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.max = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-schema-precision'>Precision</label>
          <span className='govuk-hint'>How many decimal places can users enter?</span>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number' id='field-schema-precision'
            name='schema.precision'
            defaultValue={component.schema.precision || 0} type='number'
            onBlur={e => updateComponent(component, component => { component.schema.precision = e.target.value }, updateModel)}
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  )
}

function DateFieldEdit (props) {
  const { component, updateModel } = props
  component.options = component.options || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <details className='govuk-details'>
        <summary className='govuk-details__summary'>
          <span className='govuk-details__summary-text'>more</span>
        </summary>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options-maxDaysInPast'>Maximum days in the past</label>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-options-maxDaysInPast' name='options.maxDaysInPast'
            defaultValue={component.options.maxDaysInPast} type='number'
            onBlur={e => updateComponent(component, component => { component.options.maxDaysInPast = e.target.value }, updateModel)}
          />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field-options-maxDaysInFuture'>Maximum days in the future</label>
          <input
            className='govuk-input govuk-input--width-3' data-cast='number'
            id='field-options-maxDaysInFuture' name='options.maxDaysInFuture'
            defaultValue={component.options.maxDaysInFuture} type='number'
            onBlur={e => updateComponent(component, component => { component.options.maxDaysInFuture = e.target.value }, updateModel)}
          />
        </div>

        <Classes component={component} updateModel={updateModel} />
      </details>
    </FieldEdit>
  )
}

function SelectFieldEdit (props) {
  const { component, data, updateModel, page } = props
  component.options = component.options || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <div>
        <ComponentValues data={data} component={component} updateModel={updateModel} page={page} EditComponentView={ComponentTypeEdit}/>

        <Classes component={component} updateModel={updateModel} />
      </div>
    </FieldEdit>
  )
}

function RadiosFieldEdit (props) {
  const { component, data, updateModel, page } = props
  component.options = component.options || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <ComponentValues data={data} component={component} updateModel={updateModel} page={page} EditComponentView={ComponentTypeEdit}/>

      <div className='govuk-checkboxes govuk-form-group'>
        <div className='govuk-checkboxes__item'>
          <input
            className='govuk-checkboxes__input' id='field-options-bold' data-cast='boolean'
            name='options.bold' type='checkbox' checked={component.options.bold === true}
            onChange={() => updateComponent(component, component => { component.options.bold = !component.options.bold }, updateModel)}
          />
          <label
            className='govuk-label govuk-checkboxes__label'
            htmlFor='field-options-bold'
          >Bold labels
          </label>
        </div>
      </div>
    </FieldEdit>
  )
}

function CheckboxesFieldEdit (props) {
  const { component, data, updateModel, page } = props
  component.options = component.options || {}

  return (
    <FieldEdit component={component} updateModel={updateModel}>
      <ComponentValues data={data} component={component} updateModel={updateModel} page={page} EditComponentView={ComponentTypeEdit}/>

      <div className='govuk-checkboxes govuk-form-group'>
        <div className='govuk-checkboxes__item'>
          <input
            className='govuk-checkboxes__input' id='field-options-bold' data-cast='boolean'
            name='options.bold' type='checkbox' checked={component.options.bold === true}
            onChange={() => updateComponent(component, component => { component.options.bold = !component.options.bold }, updateModel)}
          />
          <label
            className='govuk-label govuk-checkboxes__label'
            htmlFor='field-options-bold'
          >Bold labels
          </label>
        </div>
      </div>
    </FieldEdit>
  )
}

function ParaEdit (props) {
  const { component, data, updateModel } = props
  component.options = component.options || {}
  const componentCondition = component.options.condition || ''
  const { conditions } = data

  return (
    <div>
      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='para-content'>Content</label>
        <span className='govuk-hint'>The content can include HTML and the `govuk-prose-scope` css class is available. Use this on a wrapping element to apply default govuk styles.</span>
        <Editor name='content' value={component.content}
          valueCallback={content => updateComponent(component, component => { component.content = content }, updateModel)}/>
      </div>
      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='condition'>Condition (optional)</label>
        <span className='govuk-hint'>Only show this content if the condition is truthy. </span>
        <select className='govuk-select' id='condition' name='options.condition' value={componentCondition}
          onChange={e => updateComponent(component, component => { component.options.condition = e.target.value }, updateModel)}>
          <option value='' />
          {conditions.map(condition => (<option key={condition.name} value={condition.name}>{condition.displayName}</option>))}
        </select>
      </div>
    </div>
  )
}

function ListContentEdit (props) {
  const { component, data, updateModel, page } = props
  component.options = component.options || {}

  return (
    <div>
      <ComponentValues data={data} component={component} updateModel={updateModel} page={page} EditComponentView={ComponentTypeEdit}/>

      <div className='govuk-checkboxes govuk-form-group'>
        <div className='govuk-checkboxes__item'>
          <input
            className='govuk-checkboxes__input' id='field-options-type'
            name='options.type' value='numbered' type='checkbox' checked={component.options.type === 'numbered'}
            onChange={() => updateComponent(component, component => { component.options.type = component.options.type === 'numbered' ? undefined : 'numbered' }, updateModel)}
          />
          <label
            className='govuk-label govuk-checkboxes__label'
            htmlFor='field-options-type'
          >Numbered
          </label>
        </div>
      </div>
    </div>
  )
}

function FlashCardEdit (props) {
  const { component, data, updateModel, page } = props
  component.options = component.options || {}

  return (
    <ComponentValues data={data} component={component} updateModel={updateModel} page={page} EditComponentView={ComponentTypeEdit}/>
  )
}

const InsetTextEdit = ParaEdit
const WarningTextEdit = ParaEdit
const HtmlEdit = ParaEdit

function DetailsEdit (props) {
  const { component, updateModel } = props

  return (
    <div>

      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='details-title'>Title</label>
        <input
          className='govuk-input' id='details-title' name='title'
          defaultValue={component.title} required
          onBlur={e => updateComponent(component, component => { component.title = e.target.value }, updateModel)}
        />
      </div>

      <div className='govuk-form-group'>
        <label className='govuk-label' htmlFor='details-content'>Content</label>
        <span className='govuk-hint'>The content can include HTML and the `govuk-prose-scope` css class is available. Use this on a wrapping element to apply default govuk styles.</span>
        <textarea
          className='govuk-textarea' id='details-content' name='content'
          defaultValue={component.content} rows='10' required
          onBlur={e => updateComponent(component, component => { component.content = e.target.value }, updateModel)}
        />
      </div>
    </div>
  )
}

const componentTypeEditors = {
  TextFieldEdit: TextFieldEdit,
  EmailAddressFieldEdit: TextFieldEdit,
  TelephoneNumberFieldEdit: TextFieldEdit,
  NumberFieldEdit: NumberFieldEdit,
  MultilineTextFieldEdit: MultilineTextFieldEdit,
  AutocompleteFieldEdit: SelectFieldEdit,
  SelectFieldEdit: SelectFieldEdit,
  RadiosFieldEdit: RadiosFieldEdit,
  CheckboxesFieldEdit: CheckboxesFieldEdit,
  ParaEdit: ParaEdit,
  HtmlEdit: HtmlEdit,
  InsetTextEdit: InsetTextEdit,
  WarningTextEdit: WarningTextEdit,
  DetailsEdit: DetailsEdit,
  FlashCardEdit: FlashCardEdit,
  FileUploadFieldEdit: FileUploadFieldEdit,
  DatePartsFieldEdit: DateFieldEdit,
  ListEdit: ListContentEdit
}

class ComponentTypeEdit extends React.Component {
  render () {
    const { component, data, updateModel, page } = this.props

    const type = ComponentTypes.find(t => t.name === component.type)
    if (!type) {
      return ''
    } else {
      const TagName = componentTypeEditors[`${component.type}Edit`] || FieldEdit
      return <TagName component={component} data={data} updateModel={updateModel} page={page}/>
    }
  }
}

export default ComponentTypeEdit

import React from 'react'
import InlineConditions from './inline-conditions'
import { ConditionsModel } from '@xgovformbuilder/model/lib/conditions/inline-condition-model'
import Flyout from '../flyout'
import { selectGroup, SelectInputOptions, SelectOption } from '../govuk-react-components/select'
import { renderHints } from '../govuk-react-components/helpers'

class SelectConditions extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      fields: this.fieldsForPath(props.path),
      inline: false,
      selectedCondition: props.selectedCondition
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.path !== prevProps.path) {
      const fields = this.fieldsForPath(this.props.path)

      this.setState({
        conditions: new ConditionsModel(),
        fields: fields,
        editView: false
      })
    }
  }

  fieldsForPath (path) {
    const { data } = this.props
    const inputs = path ? data.inputsAccessibleAt(path) : data.allInputs()
    return inputs
      .map(input => ({
        label: input.title,
        name: input.propertyPath,
        type: input.type,
        values: data.valuesFor(input)?.toStaticValues()?.items
      }))
      .reduce((obj, item) => {
        obj[item.name] = item
        return obj
      }, {})
  }

  onClickDefineCondition = () => {
    this.setState({
      inline: true
    })
  }

  setState (state, callback) {
    if (state.selectedCondition !== undefined) {
      this.props.conditionsChange(state.selectedCondition)
    }
    super.setState(state, callback)
  }

  onChangeConditionSelection = e => {
    const input = e.target
    this.setState({
      selectedCondition: input.value
    })
  }

  onCancelInlineCondition = () => {
    this.setState({
      inline: false
    })
  }

  onSaveInlineCondition = (createdCondition) => {
    this.setState({
      inline: false,
      selectedCondition: createdCondition
    })
  }

  render () {
    const { selectedCondition, inline } = this.state
    const { data, hints } = this.props
    const hasConditions = data.hasConditions || selectedCondition

    return (
      <div className='conditions'>
        <div className='govuk-form-group' id='conditions-header-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-conditions'>Conditions (optional)</label>
          {renderHints('conditions-header-group', hints)}
        </div>
        {this.state.fields && Object.keys(this.state.fields).length > 0
          ? <div>
            {hasConditions &&
              selectGroup(
                'cond-select',
                'cond-select',
                'Select a condition',
                selectedCondition ?? '',
                this.props.data.conditions.map((it, index) => (new SelectOption(it.displayName, it.name))),
                this.onChangeConditionSelection,
                new SelectInputOptions(false, true, undefined, 'select-condition')
              )
            }
            {!inline &&
              <div className='govuk-form-group'>
                <a
                  href='#' id='inline-conditions-link' className='govuk-link'
                  onClick={this.onClickDefineCondition}
                >Define
                  a new condition
                </a>
              </div>}
            <Flyout
              title='Define condition' show={inline}
              onHide={this.onCancelInlineCondition}
            >
              <InlineConditions
                data={this.props.data} path={this.props.path}
                conditionsChange={this.onSaveInlineCondition}
                cancelCallback={this.onCancelInlineCondition}
              />
            </Flyout>
          </div>
          : <div className='govuk-body'>
                You cannot add any conditions as there are no available fields
          </div>}
      </div>
    )
  }
}

export default SelectConditions

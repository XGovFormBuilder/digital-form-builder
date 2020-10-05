import React from 'react'
import InlineConditions from './inline-conditions'
import { ConditionsModel } from '@xgovformbuilder/model'
import Flyout from '../flyout'
import { Hint, Select } from '@xgovformbuilder/govuk-react-jsx'

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
    const { data, hints = [] } = this.props
    const hasConditions = data.hasConditions || selectedCondition

    return (
      <div className='conditions'>
        <div className='govuk-form-group' id='conditions-header-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-conditions'>Conditions (optional)</label>
          {hints.map((hint, index) => <Hint key={`conditions-header-group-hint-${index}`}>{hint}</Hint>)}
        </div>
        {this.state.fields && Object.keys(this.state.fields).length > 0
          ? <div>
            {hasConditions &&
              <Select
                id="select-condition"
                name="cond-select"
                value={selectedCondition ?? ''}
                items={[
                  {
                    children: [''],
                    value: ''
                  },
                  ...this.props.data.conditions.map((it, index) => ({
                    children: [it.displayName],
                    value: it.name
                  }))
                ]}
                label={{
                  className: 'govuk-label--s',
                  children: [
                    'Select a condition'
                  ]
                }}
                onChange={this.onChangeConditionSelection}
                required={false}
              />
            }
            {/* {selectGroup(
                'cond-select',
                'cond-select',
                'Select a condition',
                selectedCondition ?? '',
                this.props.data.conditions.map((it, index) => (new SelectOption(it.displayName, it.name))), // (text: string, value: string)
                this.onChangeConditionSelection,
                new SelectInputOptions(false, true, undefined, 'select-condition')
                                      (required: boolean, includeBlankOption: boolean, hints: ?Array<string>, groupId: ?string)
              )} */}
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

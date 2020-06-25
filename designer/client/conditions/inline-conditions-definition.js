import React from 'react'
import { Condition, Field, Value, getOperatorNames } from './inline-condition-model'
import { clone } from '../helpers'

class InlineConditionsDefinition extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      condition: clone(props.condition) || {}
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.expectsCoordinator !== prevProps.expectsCoordinator ||
        this.props.fields !== prevProps.fields) {
      const { condition } = this.state
      const newCondition = this.props.fields[condition?.field?.name] ? this.state.condition : {}
      this.setState({
        condition: newCondition
      })
    }
  }

  onChangeCoordinator = e => {
    const input = e.target
    let newCondition = {}

    if (input.value && input.value.trim() !== '') {
      newCondition = clone(this.state.condition ?? {})
      newCondition.coordinator = input.value
    }
    this.setState({
      condition: newCondition
    })
  }

  onClickFinalise = () => {
    const { condition } = this.state
    this.setState({
      condition: {}
    })
    this.props.saveCallback(new Condition(Field.from(condition.field), condition.operator, Value.from(condition.value), condition.coordinator))
  }

  onChangeField = e => {
    const input = e.target
    const fieldName = input.value

    const { condition } = this.state

    const currentField = condition.field?.name
    const currentOperator = condition.operator

    const fieldDef = this.props.fields[fieldName]

    this._updateCondition(condition, c => {
      if (fieldName) {
        if (currentField && this.props.fields[currentField].values !== fieldDef.values) {
          delete c.value
        }
        if (currentOperator && !getOperatorNames(fieldName).includes(currentOperator)) {
          delete c.operator
        }
        c.field = new Field(fieldName, fieldDef.type, fieldDef.label)
      } else {
        delete c.field
        delete c.operator
        delete c.value
      }
    })
  }

  _updateCondition (condition, updates) {
    const copy = clone(condition)
    updates(copy)
    this.setState({
      condition: copy
    })
  }

  onChangeOperator = e => {
    const input = e.target
    const { condition } = this.state

    this._updateCondition(condition, c => { c.operator = input.value })
  }

  onChangeValue = e => {
    const input = e.target
    const { condition } = this.state

    const fieldDef = this.props.fields[condition?.field?.name]

    let value
    if (input.value && input.value?.trim() !== '') {
      const option = fieldDef.values?.find(value => value.value === input.value)
      value = option ? new Value(option.value, option.text) : new Value(input.value)
    }

    this._updateCondition(condition, c => { c.value = value })
  }

  setState (state, callback) {
    if (state.conditions || state.selectedCondition !== undefined) {
      this.props.conditionsChange(state.conditions, state.selectedCondition)
    }
    super.setState(state, callback)
  }

  render () {
    const { expectsCoordinator, fields } = this.props
    const { condition } = this.state
    const fieldDef = fields[condition.field?.name]

    return (<div className='govuk-form-group' id='condition-definition-group'>
      {expectsCoordinator &&
        <div className='govuk-form-group' id='cond-coordinator-group'>
          <select className='govuk-select' id='cond-coordinator' name='cond-coordinator' value={condition?.coordinator??''}
            onChange={this.onChangeCoordinator}>
            <option />
            <option key='and' value='and'>And</option>
            <option key='or' value='or'>Or</option>
          </select>
        </div>
      }
      {(condition.coordinator || !expectsCoordinator) &&
        <div id='condition-definition-inputs'>
          <select className='govuk-select' id='cond-field' name='cond-field'
            value={(condition?.field?.name)??''}
            onChange={this.onChangeField}>
            <option />
            {
              Object.values(this.props.fields).map(field =>
                <option key={field.name} value={field.name}>{field.label}</option>)
            }
          </select>

          {fieldDef &&
          <select className='govuk-select' id='cond-operator' name='cond-operator' value={condition.operator??''}
            onChange={this.onChangeOperator}>
            <option />
            {
              getOperatorNames(fieldDef.type).map(conditional => {
                return <option key={`${condition.field}-${conditional}`}
                  value={conditional}>{conditional}</option>
              })
            }
          </select>
          }

          {condition.operator && (fieldDef?.values?.length??0) > 0 &&
          <select className='govuk-select' id='cond-value' name='cond-value' value={condition.value?.value??''}
            onChange={this.onChangeValue}>
            <option />
            {fieldDef.values.map(option => {
              return <option key={option.value} value={option.value}>{option.text}</option>
            })}
          </select>
          }

          {condition.operator && (fieldDef?.values?.length??0) === 0 &&
          <input className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
            type='text' defaultValue={condition.value?.display} required
            onChange={this.onChangeValue} />
          }
          {condition.value &&
          <div className='govuk-form-group'>
            <a href='#' id='save-condition' className='govuk-link' onClick={this.onClickFinalise}>Save condition</a>
          </div>
          }
        </div>
      }
    </div>)
  }
}

export default InlineConditionsDefinition

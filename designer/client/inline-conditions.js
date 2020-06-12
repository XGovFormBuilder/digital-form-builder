import React from 'react'
import { ConditionsModel, Condition, Field, Value } from './inline-condition-model'
import { clone } from './helpers'

const conditionalOperators = {
  'default': {
    is: {},
    'is not': {}
  },
  'TextField': {
    matches: {}
  },

  getConditionals: (fieldType) => {
    return Object.assign(conditionalOperators[fieldType] || {}, conditionalOperators['default'])
  }
}

class InlineConditions extends React.Component {
  constructor (props) {
    super(props)

    const { data } = this.props

    this.fields = [].concat.apply([],
      data.pages.map(page => page.components.filter(component => component.name)
        .map(component => ({ label: component.title, name: component.name, type: component.type, values: component.options && component.options.list ? data.lists.find(it => it.name === component.options.list).items : [] })))
    ).reduce((obj, item) => {
      obj[item.name] = item
      return obj
    }, {})

    this.state = {
      conditions: new ConditionsModel()
    }
  }

  onClickAddItem = e => {
    this.setState({
      condition: {}
    })
  }

  onClickAnd = e => {
    this.setState({
      condition: {
        coordinator: 'and'
      }
    })
  }

  onClickOr = e => {
    this.setState({
      condition: {
        coordinator: 'or'
      }
    })
  }

  onClickFinalize = e => {
    const { conditions, condition } = this.state

    this.setState({
      conditions: conditions.add(new Condition(Field.from(condition.field), condition.operator, Value.from(condition.value), condition.coordinator)),
      condition: undefined
    })
  }

  conditionFieldId (id, fieldName) {
    return `conditions.${id}.${fieldName}`
  }

  parseConditionId (fieldId) {
    return fieldId.split('.')[1]
  }

  onChangeField = e => {
    const input = e.target
    const fieldName = input.value

    const { condition } = this.state

    const currentField = condition.field ? condition.field.name : undefined
    const currentOperator = condition.operator

    this._updateCondition(condition, c => {
      if (fieldName) {
        if (currentField && this.fields[currentField].values !== this.fields[fieldName].values) {
          delete c.value
        }
        if (currentOperator && !conditionalOperators.getConditionals(fieldName)[currentOperator]) {
          delete c.operator
        }
        c.field = new Field(fieldName, this.fields[fieldName].label)
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

    this._updateCondition(condition, c => { c.value = new Value(input.value) })
  }

  render () {
    const { conditions, condition } = this.state

    const fieldDef = condition && condition.field && this.fields[condition.field.name]

    const hasConditions = conditions.hasConditions()

    return (
      <div>
        { hasConditions &&
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='condition-string'>When</label>
            <div key='condition-string' >
              {conditions.toPresentationString()}
            </div>
          </div>
        }
        { condition &&
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='field'>{hasConditions ? condition.coordinator : 'When'}</label>
          <select className='govuk-select' id='cond-field' name='cond-field' value={condition && condition.field ? condition.field.name : undefined}
            onChange={this.onChangeField}>
            <option />
            {Object.values(this.fields).map(field => {
              return <option key={field.name} value={field.name}>{field.label}</option>
            })}
          </select>

          { fieldDef &&
          <select className='govuk-select' id='cond-operator' name='cond-operator' value={condition.operator}
            onChange={this.onChangeOperator}>
            <option />
            {
              Object.keys(conditionalOperators.getConditionals(fieldDef.type)).map(conditional => {
                return <option key={`${condition.field}-${conditional}`} value={conditional}>{conditional}</option>
              })
            }
          </select>
          }

          { condition.operator && fieldDef && fieldDef.values && fieldDef.values.length > 0 &&
          <select className='govuk-select' id='cond-value' name='cond-value' value={condition.value ? condition.value.value : undefined}
            onChange={this.onChangeValue}>
            <option />
            {fieldDef.values.map(option => {
              return <option key={option.value} value={option.value}>{option.text}</option>
            })}
          </select>
          }

          { condition.operator && fieldDef && (!fieldDef.values || fieldDef.values.length === 0) &&
          <input className='govuk-input govuk-input--width-20' id='cond-value' name='cond-value'
            type='text' defaultValue={condition.value} required
            onChange={this.onChangeValue} />
          }
        </div>
        }
        { condition && condition.value &&
          <div className='govuk-form-group'>
            <a href='#' onClick={this.onClickFinalize}>Save condition</a>
          </div>
        }
        {!condition && !hasConditions &&
          <a href='#' onClick={this.onClickAddItem}>Add</a>
        }
        {!condition && hasConditions &&
          <div className='govuk-form-group'>
            <a href='#' onClick={this.onClickAnd}>And</a> / <a href='#' onClick={this.onClickOr}>Or</a>
          </div>
        }
      </div>
    )
  }
}

export default InlineConditions

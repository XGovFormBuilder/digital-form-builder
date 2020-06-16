import React from 'react'
import { ConditionsModel, Condition, Field, Value, GroupDef } from './inline-condition-model'
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

    const { path } = this.props

    this.state = {
      conditions: new ConditionsModel(),
      fields: this.fieldsForPath(path)
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.path !== prevProps.path) {
      const fields = this.fieldsForPath(this.props.path)

      const { condition } = this.state

      const newCondition = condition && fields[condition.field] ? this.state.condition : {}
      this.setState({
        conditions: new ConditionsModel(),
        condition: newCondition,
        fields: fields
      })
    }
  }

  fieldsForPath (path) {
    const { data } = this.props
    return data.inputsAccessibleAt(path)
      .map(input => ({
        label: input.title,
        name: input.name,
        type: input.type,
        values: input.options && input.options.list ? data.listFor(input).items : [] }
      ))
      .reduce((obj, item) => {
        obj[item.name] = item
        return obj
      }, {})
  }

  onClickAddItem = e => {
    this.setState({
      condition: {}
    })
  }

  onChangeCoordinator = e => {
    const input = e.target

    if (input.value && input.value.trim() !== '') {
      const copy = clone(this.state.condition || {})
      copy.coordinator = input.value
      this.setState({
        condition: copy
      })
    } else {
      this.setState({
        condition: undefined
      })
    }
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
        if (currentField && this.state.fields[currentField].values !== this.state.fields[fieldName].values) {
          delete c.value
        }
        if (currentOperator && !conditionalOperators.getConditionals(fieldName)[currentOperator]) {
          delete c.operator
        }
        c.field = new Field(fieldName, this.state.fields[fieldName].label)
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

    const fieldDef = condition && condition.field && this.state.fields[condition.field.name]

    let value
    if (input.value && input.value.trim !== '') {
      const option = fieldDef.values ? fieldDef.values.find(value => value.value === input.value) : undefined
      value = option ? new Value(option.value, option.text) : new Value(input.value)
    }

    this._updateCondition(condition, c => { c.value = value })
  }

  onClickEdit = e => {
    this.setState({
      editing: true,
      selectedConditions: []
    })
  }

  onClickCancelEditing = e => {
    this.setState({
      editing: false,
      selectedConditions: null
    })
  }

  render () {
    const { conditions, condition, editing } = this.state

    const fieldDef = condition && condition.field && this.state.fields[condition.field.name]

    const hasConditions = conditions.hasConditions()

    return (
      this.state.fields && Object.keys(this.state.fields).length > 0 && <div>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='page-conditions'>Conditions (optional)</label>
          {!condition && !hasConditions &&
            <a href='#' onClick={this.onClickAddItem}>Add</a>
          }
          { (condition || hasConditions) &&
            <label className='govuk-label govuk-label--s' htmlFor='condition-string'>When</label>
          }

          { hasConditions && <div>
            <div key='condition-string' >
              {conditions.toPresentationString()}
            </div>
            <div>
              { !editing && <a href='#' onClick={this.onClickEdit}>Not what you meant?</a> }
            </div>
          </div>
          }
        </div>

        {hasConditions && !editing &&
          <div className='govuk-form-group'>
            <select className='govuk-select' id='cond-coordinator' name='cond-coordinator' value={condition && condition.coordinator ? condition.coordinator : ''}
              onChange={this.onChangeCoordinator}>
              <option />
              <option key='and' value='and'>And</option>
              <option key='or' value='or'>Or</option>
            </select>
          </div>
        }
        { condition && !editing &&
          <div className='govuk-form-group'>
            <select className='govuk-select' id='cond-field' name='cond-field' value={condition && condition.field ? condition.field.name : ''}
              onChange={this.onChangeField}>
              <option />
              {Object.values(this.state.fields).map(field => {
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
        {this.renderEditingView()}
      </div>
    )
  }

  renderEditingView () {
    if (this.state.editing) {
      return (
        <div>
          <fieldset className='govuk-fieldset'>
            <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
               Select conditions to group / remove
            </legend>
            <div className='govuk-form-group'>
              <a href='#' onClick={this.onClickCancelEditing}>Exit</a>
            </div>
            {this.state.editingError &&
              <span id='conditions-error' className='govuk-error-message'>
                <span className='govuk-visually-hidden'>Error:</span> {this.state.editingError}
              </span>
            }
            <div className='govuk-checkboxes'>
              {
                this.state.conditions.asPerUserGroupings().map((condition, index) => {
                  return <div key={`condition-checkbox-${index}`} className='govuk-checkboxes__item'>
                    <input type='checkbox' className='govuk-checkboxes__input' id={`condition-${index}`} name={`condition-${index}`}
                      value={index} onChange={this.onChangeCheckbox} checked={(this.state.selectedConditions && this.state.selectedConditions.includes(index)) || ''} />
                    <label className='govuk-label govuk-checkboxes__label' htmlFor={`condition-${index}`}>
                      {condition.toPresentationString()}
                    </label>
                  </div>
                })
              }
            </div>
          </fieldset>
          <div className='govuk-form-group'>
            {this.state.selectedConditions.length > 1 && <span><a href='#' onClick={this.onClickGroup}>Group</a> /</span>}
            {this.state.selectedConditions.length > 0 && <a href='#' onClick={this.onClickRemove}>Remove</a> }
          </div>
        </div>
      )
    }
    return <div />
  }

  onChangeCheckbox = e => {
    let copy = this.state.selectedConditions ? clone(this.state.selectedConditions) : []
    const index = Number(e.target.value)
    if (e.target.checked) {
      copy.push(index)
    } else {
      copy = copy.filter(it => it !== index)
    }
    this.setState({
      selectedConditions: copy
    })
  }

  onClickGroup = e => {
    if (!this.state.selectedConditions || this.state.selectedConditions.length < 2) {
      this.setState({
        editingError: 'Please select at least 2 items for grouping'
      })
    } else {
      const groups = this.groupWithConsecutiveConditions(this.state.selectedConditions)
      if (groups.find(group => group.length === 1)) {
        this.setState({
          editingError: 'Please select consecutive items to group'
        })
      } else {
        this.setState({
          editingError: undefined,
          selectedConditions: [],
          conditions: this.state.conditions.addGroups(groups.sort((a, b) => a - b)
            .reduce((groupDefs, group) => {
              groupDefs.push(new GroupDef(group[0], group[group.length - 1]))
              return groupDefs
            }, [])
          )
        })
      }
    }
  }

  onClickRemove = e => {
    if (!this.state.selectedConditions || this.state.selectedConditions.length < 1) {
      this.setState({
        editingError: 'Please select at least 1 item to remove'
      })
    } else {
      this.setState({
        editingError: undefined,
        selectedConditions: [],
        conditions: this.state.conditions.remove(this.state.selectedConditions)
      })
    }
  }

  groupWithConsecutiveConditions (selectedConditions) {
    let result = []
    selectedConditions.sort((a, b) => a - b)
    selectedConditions.forEach(condition => {
      const groupForCondition = result.find(group => group.includes(condition - 1) || group.includes(condition + 1))
      if (groupForCondition) {
        groupForCondition.push(condition)
      } else {
        result.push([condition])
      }
    })
    return result
  }
}

export default InlineConditions

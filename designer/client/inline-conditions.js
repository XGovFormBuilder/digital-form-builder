import React from 'react'
import componentTypes from 'digital-form-builder-engine/component-types'

const conditionalOperators = {
  'default': {
    is : {},
    'is not': {}
  },
  'TextField': {
    matches: {}
  },

  getConditionals: (fieldType) =>  {
    return Object.assign(conditionalOperators[fieldType] || {}, conditionalOperators['default'])
  }
}

class ConditionsModel {
  constructor () {
    this.conditions = {}
  }

  uniqueId() {
    var id = Date.now();
    if(this.conditions[id]) {
      return this.uniqueId();
    }
    return id;
  }

  and() {
    const id = this.uniqueId();
    this.conditions[id] = {id: id};
    return this;
  }

  setField(id, fieldName) {
    this._getCondition(id).field = fieldName;
    return this;
  }

  getField(id) {
    return this._getCondition(id).field;
  }

  setOperator(id, operator) {
    this._getCondition(id).operator = operator;
    return this;
  }

  getOperator(id) {
    return this._getCondition(id).operator;
  }

  setValue(id, value) {
    this._getCondition(id).value = value;
    return this;
  }

  getValue(id) {
    return this._getCondition(id).value;
  }

  asArray() {
   return Object.values(this.conditions)
  }

  _getCondition(id) {
    if (!this.conditions[id]) {
      throw Error("no such condition "+id)
    }
    return this.conditions[id];
  }
}

class InlineConditions extends React.Component {
  constructor (props) {
    super(props)

    const { data } = this.props
    this.fields = [].concat.apply([],
      data.pages.map(page => page.components.filter(component => component.name)
        .map(component => ({label: component.title, name: component.name, type: component.type, values: component.options.list ? data.lists.find(it => it.name === component.options.list).items : []})))
    ).reduce((obj, item) => {
      obj[item.name] = item
      return obj
    }, {});

    this.state = {
      conditions: new ConditionsModel()
    }
  }

  onClickAddItem = e => {
    this.setState({
      conditions: this.state.conditions.and()
    })
  }

  conditionFieldId(id, fieldName) {
    return `conditions.${id}.${fieldName}`
  }

  parseConditionId(fieldId) {
    return fieldId.split('.')[1]
  }

  onChangeField = e => {
    const input = e.target
    const conditionIdentifier = this.parseConditionId(input.name)
    const fieldName = input.value;

    const currentField = this.state.conditions.getField(conditionIdentifier);

    if (currentField && this.fields[currentField].values !== this.fields[fieldName].values) {
      this.state.conditions.setValue(conditionIdentifier, undefined)
    }

    const currentOperator = this.state.conditions.getOperator(conditionIdentifier);
    if(currentOperator && !conditionalOperators.getConditionals(fieldName)[currentOperator]) {
      this.state.conditions.setOperator(conditionIdentifier, undefined);
    }

    this.setState({
      conditions: this.state.conditions.setField(conditionIdentifier, fieldName)
    })
  }

  onChangeOperator = e => {
    const input = e.target
    const conditionIdentifier = this.parseConditionId(input.name)
    this.setState({
      conditions: this.state.conditions.setOperator(conditionIdentifier, input.value)
    })
  }

  onChangeValue = e => {
    const input = e.target
    const conditionIdentifier = this.parseConditionId(input.name)
    this.setState({
      conditions: this.state.conditions.setValue(conditionIdentifier, input.value)
    })
  }

  render () {
    const conditions = this.state.conditions.asArray();

    return (
      <div>
      { conditions.map((condition, index) => (
          <div key={condition.id} >
            <div className='govuk-form-group'>
              <label className='govuk-label govuk-label--s' htmlFor='field'>{index == 0 ? 'When' : 'And'}</label>
              <select className='govuk-select' id={this.conditionFieldId(condition.id, 'field')} name={this.conditionFieldId(condition.id, 'field')} value={condition.field}
                onChange={this.onChangeField}>
                <option />
                {Object.values(this.fields).map(field => {
                  return <option key={field.name} value={field.name}>{field.label}</option>
                })}
              </select>

              { condition.field &&
                <select className='govuk-select' id={this.conditionFieldId(condition.id, 'operator')} name={this.conditionFieldId(condition.id, 'operator')} value={condition.operator}
                  onChange={this.onChangeOperator}>
                  <option />
                  {
                    Object.keys(conditionalOperators.getConditionals(this.fields[condition.field].type)).map(conditional => {
                      return <option key={condition.field + '-' + conditional} value={conditional}>{conditional}</option>
                    })
                  }
                </select>
              }

              { condition.operator && this.fields[condition.field].values && this.fields[condition.field].values.length > 0 &&
                <select className='govuk-select' id={this.conditionFieldId(condition.id, 'value')} name={this.conditionFieldId(condition.id, 'value')} value={condition.value}
                  onChange={this.onChangeValue}>
                  <option />
                  {this.fields[condition.field].values.map(option => {
                    return <option key={option.value} value={option.value}>{option.text}</option>
                  })}
                </select>
              }

              { condition.operator && (!this.fields[condition.field].values || this.fields[condition.field].values.length === 0) &&
                <input className='govuk-input govuk-input--width-20' id={this.conditionFieldId(condition.id, 'value')} name={this.conditionFieldId(condition.id, 'value')}
                  type='text' defaultValue={condition.value} required
                  onBlur={this.onChangeValue} />
              }
            </div>
          </div>
        ))
       }
       <a href='#' onClick={this.onClickAddItem}>Add</a>
       </div>
    )
  }

}

export default InlineConditions
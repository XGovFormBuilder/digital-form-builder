import React from 'react'
import { ConditionsModel, GroupDef } from './inline-condition-model'
import { clone } from '../helpers'
import { icons } from '../icons'
import InlineConditionsDefinition from './inline-conditions-definition'

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

      const newCondition = fields[condition?.field] ? this.state.condition : {}
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
        values: (data.listFor(input)??{}).items
      }))
      .reduce((obj, item) => {
        obj[item.name] = item
        return obj
      }, {})
  }

  onClickAddItem = () => {
    this.setState({
      condition: {}
    })
  }

  onClickDefineCondition = () => {
    this.setState({
      inline: true,
      condition: {},
      selectedCondition: null
    })
  }

  onClickEditView = () => {
    this.setState({
      editView: true,
      selectedConditions: []
    })
  }

  onClickCancelEditView = () => {
    this.setState({
      editView: false,
      selectedConditions: null,
      editing: undefined
    })
  }

  onClickSplit (index) {
    this.setState({
      conditions: this.state.conditions.splitGroup(index)
    })
  }

  onClickEdit (index) {
    const conditions = this.state.conditions.asPerUserGroupings
    if (conditions.length > index) {
      this.setState({
        editing: index,
        editView: false,
        condition: Object.assign({}, conditions[index])
      })
    }
  }

  onClickMoveEarlier (index) {
    this.setState({
      conditions: this.state.conditions.moveEarlier(index),
      selectedConditions: []
    })
  }

  onClickMoveLater (index) {
    this.setState({
      conditions: this.state.conditions.moveLater(index),
      selectedConditions: []
    })
  }

  setState (state, callback) {
    if (state.conditions || state.selectedCondition !== undefined) {
      this.props.conditionsChange(state.conditions, state.selectedCondition)
    }
    super.setState(state, callback)
  }

  onChangeConditionSelection = e => {
    const input = e.target
    this.setState({
      selectedCondition: input.value
    })
  }

  onClickCancel = () => {
    this.setState({
      inline: false,
      condition: undefined,
      conditions: this.state.conditions.clear()
    })
  }

  saveCondition = (condition) => {
    if (this.state.editing || this.state.editing === 0) {
      this.setState({
        conditions: this.state.conditions.replace(this.state.editing, condition),
        condition: undefined,
        editView: true,
        editing: undefined
      })
    } else {
      this.setState({
        conditions: this.state.conditions.add(condition),
        condition: undefined
      })
    }
  }

  render () {
    const { conditions, condition, editView, editing, selectedCondition } = this.state

    const hasConditions = conditions.hasConditions

    const inline = this.state.inline || !this.props.data.hasConditions

    return (
      this.state.fields && Object.keys(this.state.fields).length > 0 &&
        <div className='conditions'>
          <div className='govuk-form-group' id='conditions-header-group'>
            <label className='govuk-label govuk-label--s' htmlFor='page-conditions'>Conditions (optional)</label>
          </div>
          {!inline &&
            <div id='select-condition'>
              <div className='govuk-form-group' id='cond-selection-group'>
                <label className='govuk-label' htmlFor='cond-select'>
                  Select a condition
                </label>
                <select className='govuk-select' id='cond-select' name='cond-select' value={selectedCondition??''}
                  onChange={this.onChangeConditionSelection}>
                  <option />
                  {
                    this.props.data.getConditions().map((it, index) =>
                      <option key={`select-condition-${index}`} value={it.name}>{it.name}</option>)
                  }
                </select>
              </div>
              <div className='govuk-form-group'>
                <a href='#' id='inline-conditions-link' className='govuk-link' onClick={this.onClickDefineCondition}>Define a new condition</a>
              </div>
            </div>
          }
          {inline &&
            <div id='inline-conditions'>
              <div id='inline-condition-header'>
                {!condition && !hasConditions &&
                  <a href='#' id='add-item' className='govuk-link' onClick={this.onClickAddItem}>Add</a>
                }
                {(condition || hasConditions) &&
                  <div className='govuk-form-group'>
                    <label className='govuk-label' htmlFor='condition-string'>When</label>
                  </div>
                }
                {hasConditions &&
                  <div id='conditions-display' className='govuk-body'>
                    <div key='condition-string' id='condition-string'>
                      {conditions.toPresentationString()}
                    </div>
                    {!editView && !editing && editing !== 0 &&
                      <div>
                        <a href='#' id='edit-conditions-link' className='govuk-link' onClick={this.onClickEditView}>Not what
                          you meant?</a>
                      </div>
                    }
                  </div>
                }
              </div>
              { !editView && <InlineConditionsDefinition hasConditions={hasConditions} editingIndex={editing} fields={this.state.fields} condition={condition} saveCallback={this.saveCondition} /> }
              {this.renderEditingView()}
              <div className='govuk-form-group'>
                <a href='#' id='cancel-inline-conditions-link' className='govuk-link' onClick={this.onClickCancel}>Cancel</a>
              </div>
            </div>
          }
        </div>
    )
  }

  renderEditingView () {
    if (this.state.editView) {
      return (
        <div id='edit-conditions'>
          <fieldset className='govuk-fieldset'>
            <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
               Select conditions to group / remove
            </legend>
            <div className='govuk-form-group'>
              <a href='#' id='exit-edit-link' className='govuk-link' onClick={this.onClickCancelEditView}>Exit</a>
            </div>
            {this.state.editingError &&
              <span id='conditions-error' className='govuk-error-message'>
                <span className='govuk-visually-hidden'>Error:</span> {this.state.editingError}
              </span>
            }
            <div id='editing-checkboxes' className='govuk-checkboxes'>
              {
                this.state.conditions.asPerUserGroupings.map((condition, index) => {
                  return <div key={`condition-checkbox-${index}`} className='govuk-checkboxes__item' style={{ display: 'flex' }}>
                    <input type='checkbox' className='govuk-checkboxes__input' id={`condition-${index}`} name={`condition-${index}`}
                      value={index} onChange={this.onChangeCheckbox} checked={this.state.selectedConditions?.includes(index) || ''} />
                    <label className='govuk-label govuk-checkboxes__label' htmlFor={`condition-${index}`}>
                      {condition.toPresentationString()}
                    </label>
                    <span id={`condition-${index}-actions`} style={{ display: 'inline-flex', flexGrow: 1 }}>
                      {condition.isGroup() && <span style={{ flexGrow: 1 }}>  <a href='#' id={`condition-${index}-split`} className='govuk-link' onClick={() => this.onClickSplit(index)}>Split</a></span>}
                      {!condition.isGroup() && <span style={{ flexGrow: 1 }}>  <a href='#' id={`condition-${index}-edit`} className='govuk-link' onClick={() => this.onClickEdit(index)}>
                        {icons.edit}
                      </a>
                      </span>
                      }
                      {index > 0 && <span>  <a href='#' id={`condition-${index}-move-earlier`} onClick={() => this.onClickMoveEarlier(index)}>
                        {icons.moveUp}
                      </a></span>}
                      {index < this.state.conditions.lastIndex && <span>  <a href='#' id={`condition-${index}-move-later`} className='govuk-link' onClick={() => this.onClickMoveLater(index)}>
                        {icons.moveDown}
                      </a></span>}
                    </span>
                  </div>
                })
              }
            </div>
          </fieldset>
          <div className='govuk-form-group' id='group-and-remove'>
            {this.state.selectedConditions?.length > 1 && <span><a href='#' id='group-conditions' className='govuk-link' onClick={this.onClickGroup}>Group</a> /</span>}
            {this.state.selectedConditions?.length > 0 && <a href='#' id='remove-conditions' className='govuk-link' onClick={this.onClickRemove}>Remove</a> }
          </div>
        </div>
      )
    }
  }

  onChangeCheckbox = e => {
    let copy = clone(this.state.selectedConditions??[])
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

  onClickGroup = () => {
    if (this.state.selectedConditions?.length < 2) {
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

  onClickRemove = () => {
    if (this.state.selectedConditions?.length < 1) {
      this.setState({
        editingError: 'Please select at least 1 item to remove'
      })
    } else {
      this.setState({
        editingError: undefined,
        selectedConditions: [],
        conditions: this.state.conditions.remove(this.state.selectedConditions),
        editView: this.state.conditions.hasConditions
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

import React from 'react'
import { ConditionsModel } from './inline-condition-model'
import InlineConditionsDefinition from './inline-conditions-definition'
import InlineConditionsEdit from './inline-conditions-edit'

class InlineConditions extends React.Component {
  constructor (props) {
    super(props)

    const { path } = this.props

    this.state = {
      conditions: new ConditionsModel(),
      fields: this.fieldsForPath(path),
      inline: !props.data.hasConditions
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
    return data.inputsAccessibleAt(path)
      .map(input => ({
        label: input.title,
        name: input.propertyPath,
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
      adding: true
    })
  }

  onClickDefineCondition = () => {
    this.setState({
      inline: true,
      adding: true,
      selectedCondition: null
    })
  }

  toggleEdit = () => {
    this.setState({
      editView: !this.state.editView
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
      inline: !this.props.data.hasConditions,
      adding: false,
      conditions: this.state.conditions.clear(),
      editView: false
    })
  }

  saveCondition = (condition) => {
    this.setState({
      conditions: this.state.conditions.add(condition)
    })
  }

  editCallback = (conditions) => {
    this.setState({
      conditions: conditions
    })
  }

  render () {
    const { conditions, adding, editView, selectedCondition, inline } = this.state
    const hasConditions = conditions.hasConditions
    const definingCondition = adding || hasConditions

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
                {!definingCondition &&
                  <a href='#' id='add-item' className='govuk-link' onClick={this.onClickAddItem}>Add</a>
                }
                {definingCondition &&
                  <div className='govuk-form-group'>
                    <label className='govuk-label' htmlFor='condition-string'>When</label>
                  </div>
                }
                {hasConditions &&
                  <div id='conditions-display' className='govuk-body'>
                    <div key='condition-string' id='condition-string'>
                      {conditions.toPresentationString()}
                    </div>
                    {!editView &&
                      <div>
                        <a href='#' id='edit-conditions-link' className='govuk-link' onClick={this.toggleEdit}>
                          Not what you meant?
                        </a>
                      </div>
                    }
                  </div>
                }
              </div>
              { !editView && definingCondition &&
                <div>
                  <InlineConditionsDefinition expectsCoordinator={hasConditions} fields={this.state.fields} saveCallback={this.saveCondition} />
                  <div className='govuk-form-group'>
                    <a href='#' id='cancel-inline-conditions-link' className='govuk-link' onClick={this.onClickCancel}>Cancel</a>
                  </div>
                </div>
              }
              {editView && <InlineConditionsEdit conditions={conditions} fields={this.state.fields} saveCallback={this.editCallback} exitCallback={this.toggleEdit} />}
            </div>
          }
        </div>
    )
  }
}

export default InlineConditions

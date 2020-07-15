import React from 'react'
import ConditionEdit from './condition-edit'
import InlineConditions from './conditions/inline-conditions'
import Flyout from './flyout'

class ConditionsEdit extends React.Component {
  state = {}

  onClickCondition = (e, condition) => {
    e.preventDefault()

    this.setState({
      condition: condition
    })
  }

  onClickAddCondition = (e) => {
    e.preventDefault()

    this.setState({
      showAddCondition: true
    })
  }

  render () {
    const { data } = this.props
    const { conditions } = data
    const condition = this.state.condition

    return (
      <div className='govuk-body'>
        {!condition ? (
          <div>
            <Flyout title='Edit Conditions' show={!!this.state.showAddCondition}
              onHide={this.cancelInlineCondition}>
              <InlineConditions data={data}
                conditionsChange={this.cancelInlineCondition}
                cancelCallback={this.cancelInlineCondition}
                hideAddLink />
            </Flyout>
            <ul className='govuk-list'>
              {conditions.map((condition) => (
                <li key={condition.name}>
                  <a href='#' onClick={e => this.onClickCondition(e, condition)}>
                    {condition.displayName}
                  </a>
                  {' '}
                  <small>{condition.name}</small>
                  {'   ('}
                  <small>{condition.value}</small>
                  {')'}
                </li>
              ))}
              <li>
                <hr />
                { data.allInputs().length > 0
                  ? <a href='#' id='add-condition-link' onClick={e => this.onClickAddCondition(e)}>Add condition</a>
                  : <div className='govuk-body'>
                      You cannot add any conditions as there are no available fields
                  </div>
                }
              </li>
            </ul>
          </div>
        ) : (
          <ConditionEdit condition={condition} data={data}
            onEdit={this.editFinished}
            onCancel={this.editFinished} />
        )}
      </div>
    )
  }

  editFinished = () => this.setState({ condition: null })

  cancelInlineCondition = () => this.setState({ showAddCondition: false })
}

export default ConditionsEdit

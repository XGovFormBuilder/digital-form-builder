import React from 'react'
import ConditionEdit from './condition-edit'
import ConditionCreate from './condition-create'

class ConditionsEdit extends React.Component {
  state = {}

  onClickCondition = (e, condition) => {
    e.preventDefault()

    this.setState({
      condition: condition
    })
  }

  onClickAddCondition = (e, condition) => {
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
            {this.state.showAddCondition ? (
              <ConditionCreate data={data}
                onCreate={e => this.setState({ showAddCondition: false })}
                onCancel={e => this.setState({ showAddCondition: false })} />
            ) : (
              <ul className='govuk-list'>
                {conditions.map((condition, index) => (
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
                    ? <a href='#' onClick={e => this.onClickAddCondition(e)}>Add condition</a>
                    : <div className='govuk-body'>
                      You cannot add any conditions as there are no available fields
                    </div>
                  }
                </li>
              </ul>
            )}
          </div>
        ) : (
          <ConditionEdit condition={condition} data={data}
            onEdit={e => this.setState({ condition: null })}
            onCancel={e => this.setState({ condition: null })} />
        )}
      </div>
    )
  }
}

export default ConditionsEdit

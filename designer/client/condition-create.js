import React from 'react'
import { clone } from './helpers'

import InlineConditions from './conditions/inline-conditions'
import InlineConditionHelpers from './conditions/inline-condition-helpers'

class ConditionCreate extends React.Component {
  onSubmit = async e => {
    e.preventDefault()
    const { conditions } = this.state
    const { data } = this.props
    const copy = clone(data)

    try {
      const withCondition = await InlineConditionHelpers.storeConditionIfNecessary(copy, undefined, conditions)
      const saved = await data.save(withCondition.data)
      this.props.onCreate({ data: saved })
    } catch (e) {
      console.error(e)
    }
  }

  saveConditions = (conditions) => {
    this.setState({
      conditions: conditions
    })
  }

  render () {
    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <a className='govuk-back-link' href='#'
          onClick={e => this.props.onCancel(e)}>Back</a>
        <InlineConditions data={this.props.data} conditionsChange={this.saveConditions} hideAddLink />
        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default ConditionCreate

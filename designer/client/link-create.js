import React from 'react'
import SelectConditions from './conditions/select-conditions'

class LinkCreate extends React.Component {
  state = {}

  onSubmit = async e => {
    e.preventDefault()
    const { from, to, selectedCondition } = this.state
    // Apply
    const { data } = this.props
    const copy = data.clone()
    const updatedData = copy.addLink(from, to, selectedCondition)
    console.log(from, to, selectedCondition)
    const savedData = await data.save(updatedData)
    this.props.onCreate({ data: savedData })
  }

  conditionSelected = (selectedCondition) => {
    this.setState({
      selectedCondition: selectedCondition
    })
  }

  storeValue = (e, key) => {
    const input = e.target
    const stateUpdate = {}
    stateUpdate[key] = input.value
    this.setState(stateUpdate)
  }

  render () {
    const { data } = this.props
    const { pages } = data
    const { from } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-source'>From</label>
          <select className='govuk-select' id='link-source' name='path' onChange={e => this.storeValue(e, 'from')} required>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-target'>To</label>
          <select className='govuk-select' id='link-target' name='page' onChange={e => this.storeValue(e, 'to')} required>
            <option />
            {pages.map(page => (<option key={page.path} value={page.path}>{page.title}</option>))}
          </select>
        </div>

        {from && from.trim() !== '' && <SelectConditions data={data} path={from} conditionsChange={this.conditionSelected} />}

        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }
}

export default LinkCreate

import React from 'react'

class LinkCreate extends React.Component {
  onSubmit = async e => {
    e.preventDefault()
    const { from, to, condition } = this.state
    // Apply
    const { data } = this.props
    const copy = data.clone()
    const updatedData = copy.addLink(from, to, condition)

    const savedData = await data.save(updatedData)
    this.props.onCreate({ data: savedData })
  }

  render () {
    const { data } = this.props
    const { pages, conditions } = data

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

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='link-condition'>Condition (optional)</label>
          <span id='link-condition-hint' className='govuk-hint'>
            The link will only be used if the expression evaluates to true.
          </span>
          <select className='govuk-select' id='link-condition' name='condition' onChange={e => this.storeValue(e, 'condition')} aria-describedby='link-condition-hint'>
            <option value='' />
            {conditions.map(condition => (<option key={condition.name} value={condition.name}>{condition.displayName}</option>))}
          </select>
        </div>

        <button className='govuk-button' type='submit'>Save</button>
      </form>
    )
  }

  storeValue = (e, key) => {
    const input = e.target
    const stateUpdate = {}
    stateUpdate[key] = input.value
    this.setState(stateUpdate)
  }
}

export default LinkCreate

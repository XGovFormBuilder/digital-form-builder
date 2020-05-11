import NotifyItems from './notify-items'
import React from 'react'

class NotifyEdit extends React.Component {
  constructor (props) {
    super(props)
    let { data } = this.props
    this.usableKeys = [].concat.apply([], data.pages.map(page => page.components.filter(component => component.name).map(component => `${page.section ? page.section + '.' : ''}${component.name}`)))
  }

  render () {
    const { data, output } = this.props
    const { conditions } = data
    const outputConfiguration = output ? output.outputConfiguration : { templateId: '', apiKey: '', emailField: '' }
    const { templateId, apiKey, emailField } = outputConfiguration
    const personalisation = output ? output.outputConfiguration.personalisation : []
    const values = [...conditions.map(condition => condition.name), ...this.usableKeys]

    return (
      <div className='govuk-body'>
        <div className='govuk-form-group'>
          <label className='govuk-label' htmlFor='template-id'>Template ID</label>
          <input className='govuk-input' name='template-id'
            type='text' required defaultValue={templateId}
            onBlur={this.onBlur} step='any' />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label' htmlFor='api-key'>API Key</label>
          <input className='govuk-input' name='api-key'
            type='text' required defaultValue={apiKey}
            onBlur={this.onBlur} step='any' />
        </div>
        <div className='govuk-form-group'>
          <label className='govuk-label' htmlFor='email-field'>Email field</label>
          <select className='govuk-select' id='email-field' name='email-field' defaultValue={emailField} required>
            {this.usableKeys.map((value, i) => (<option key={value + i} value={value} onBlur={this.onBlur}>{value}</option>))}
          </select>
        </div>

        <NotifyItems items={personalisation} values={values} />
      </div>
    )
  }
}

export default NotifyEdit

import React from 'react'

class EmailEdit extends React.Component {
  render () {
    const { output } = this.props
    const outputConfiguration = output ? output.outputConfiguration : {
      emailAddress: ''
    }

    return (
      <div className='govuk-body email-edit'>
        <div className='govuk-form-group'>
          <label className='govuk-label' htmlFor='email-address'>Email Address</label>
          <input className='govuk-input' name='email-address'
            type='text' required defaultValue={outputConfiguration.emailAddress} />
        </div>
      </div>
    )
  }
}

export default EmailEdit

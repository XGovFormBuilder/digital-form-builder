import React from 'react'

class FormDetails extends React.Component {
  constructor (props) {
    super(props)
    const feedbackForm = props.data.feedbackForm;
    this.state = {
      title: props.data.name,
      feedbackForm: feedbackForm
    }
  }

  onSubmit = async e => {
    e.preventDefault()
    const { data } = this.props
    const { title } = this.state

    let copy = data.clone()
    copy.name = title

    try {
      const saved = await data.save(copy)
      this.props.onCreate(saved)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { title, feedbackForm } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='form-title'>Title</label>
          <input className='govuk-input' id='form-title' name='title'
            type='text' required onBlur={this.onBlurTitle}
            defaultValue={title} />
        </div>

        <fieldset className="govuk-fieldset" aria-describedby="changed-name-hint">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
            <h1 className="govuk-fieldset__heading">
              Is this a feedback form?
            </h1>
          </legend>
          <div id="changed-name-hint" className="govuk-hint">
            A feedback form is used to gather feedback from users about another form
          </div>
          <div className="govuk-radios govuk-radios--inline">
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="feedback-yes" name="feedbackForm" type="radio" value="true" defaultChecked={feedbackForm}>
                <label className="govuk-label govuk-radios__label" htmlFor="feedback-yes">
                  Yes
                </label>
              </input>
            </div>
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="feedback-no" name="feedbackForm" type="radio" value="false" defaultChecked={!feedbackForm}>
                <label className="govuk-label govuk-radios__label" htmlFor="feedback-no">
                  No
                </label>
              </input>
            </div>
          </div>
        </fieldset>

        <button type='submit' className='govuk-button'>Save</button>
      </form>
    )
  }

  onBlurTitle = e => {
    const input = e.target
    this.setState({
      title: input.value
    })
  }
}

export default FormDetails

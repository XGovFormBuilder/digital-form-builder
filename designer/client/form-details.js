import React from 'react'

class FormDetails extends React.Component {
  constructor (props) {
    super(props)
    const { feedbackForm, feedbackUrl, sendFeedbackContext } = props.data
    this.state = {
      title: props.data.name,
      feedbackForm: feedbackForm,
      feedbackUrl: feedbackUrl,
      sendFeedbackContext: sendFeedbackContext
    }
  }

  onSubmit = async e => {
    e.preventDefault()
    const { data } = this.props
    const { title, feedbackForm, feedbackUrl, sendFeedbackContext } = this.state

    let copy = data.clone()
    copy.name = title
    copy.feedbackForm = feedbackForm
    copy.setFeedbackUrl(feedbackUrl, sendFeedbackContext)

    try {
      const saved = await data.save(copy)
      this.props.onCreate(saved)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { title, feedbackForm, feedbackUrl, sendFeedbackContext } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='form-title'>Title</label>
          <input className='govuk-input' id='form-title' name='title'
            type='text' required onBlur={e => this.setState({ title: e.target.value })}
            defaultValue={title} />
        </div>

        <fieldset className='govuk-fieldset' aria-describedby='feedback-form-hint'>
          <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
            <h1 className='govuk-fieldset__heading'>
              Is this a feedback form?
            </h1>
          </legend>
          <div id='feedback-form-hint' className='govuk-hint'>
            A feedback form is used to gather feedback from users about another form
          </div>
          <div className='govuk-radios govuk-radios--inline'>
            <div className='govuk-radios__item'>
              <input className='govuk-radios__input' id='feedback-yes' name='feedbackForm' type='radio' value='true' defaultChecked={feedbackForm} onClick={() => this.setState({ feedbackForm: true, feedbackUrl: undefined, sendFeedbackContext: undefined })} />
              <label className='govuk-label govuk-radios__label' htmlFor='feedback-yes'>
                Yes
              </label>
            </div>
            <div className='govuk-radios__item'>
              <input className='govuk-radios__input' id='feedback-no' name='feedbackForm' type='radio' value='false' defaultChecked={!feedbackForm} onClick={() => this.setState({ feedbackForm: false })} />
              <label className='govuk-label govuk-radios__label' htmlFor='feedback-no'>
                No
              </label>
            </div>
          </div>
        </fieldset>

        {!feedbackForm &&
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='feedback-url' aria-describedby='feedback-url-hint'>Feedback form url</label>
            <div id='feedback-url-hint' className='govuk-hint'>
              Url's can start with http://, https:// or '/'.
              Those starting with a '/' should relate to another form on the same digital-form-builder instance
            </div>
            <input className='govuk-input' id='feedback-url' name='feedbackUrl'
              type='text' onChange={e => this.setState({ feedbackUrl: e.target.value })}
              defaultValue={feedbackUrl} />
          </div>
        }

        {feedbackUrl &&
          <fieldset className='govuk-fieldset' aria-describedby='feedback-context-hint'>
            <legend className='govuk-fieldset__legend govuk-fieldset__legend--l'>
              <h1 className='govuk-fieldset__heading'>
                Send the feedback context?
              </h1>
            </legend>
            <div id='feedback-context-hint' className='govuk-hint'>
              <p>Sending the feedback context to your feedback form allows you to use details of where the user
              was in this form when they provided feedback.</p>
              <p>Note that this is only likely to be useful if you have created your feedback form in this designer.</p>
            </div>
            <div className='govuk-radios govuk-radios--inline'>
              <div className='govuk-radios__item'>
                <input className='govuk-radios__input' id='send-feedback-context-yes' name='sendContext' type='radio' value='true' defaultChecked={sendFeedbackContext} onClick={() => this.setState({ sendFeedbackContext: true })} />
                <label className='govuk-label govuk-radios__label' htmlFor='feedback-context-yes'>
                  Yes
                </label>
              </div>
              <div className='govuk-radios__item'>
                <input className='govuk-radios__input' id='send-feedback-context-no' name='sendContext' type='radio' value='false' defaultChecked={!sendFeedbackContext} onClick={() => this.setState({ sendFeedbackContext: false })} />
                <label className='govuk-label govuk-radios__label' htmlFor='feedback-context-no'>
                  No
                </label>
              </div>
            </div>
          </fieldset>
        }

        <button type='submit' className='govuk-button'>Save</button>
      </form>
    )
  }
}

export default FormDetails

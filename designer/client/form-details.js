import React from 'react'

class FormDetails extends React.Component {
  constructor (props) {
    super(props)
    const { feedbackForm, feedbackUrl } = props.data
    this.state = {
      title: props.data.name,
      feedbackForm: feedbackForm,
      feedbackUrl: feedbackUrl
    }
  }

  onSubmit = async e => {
    e.preventDefault()
    const { data } = this.props
    const { title, feedbackForm, feedbackUrl } = this.state

    let copy = data.clone()
    copy.name = title
    copy.feedbackForm = feedbackForm
    copy.setFeedbackUrl(feedbackUrl)

    try {
      const saved = await data.save(copy)
      if (this.props.onCreate) {
        this.props.onCreate(saved)
      }
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { title, feedbackForm, feedbackUrl } = this.state

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
              <input className='govuk-radios__input' id='feedback-yes' name='feedbackForm' type='radio' value='true' defaultChecked={feedbackForm} onClick={() => this.setState({ feedbackForm: true, feedbackUrl: undefined })} />
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
              Url's must be relative and should start with '/'. They should relate to another form on the same digital-form-builder instance
            </div>
            <input className='govuk-input' id='feedback-url' name='feedbackUrl'
              type='text' onChange={e => this.setState({ feedbackUrl: e.target.value })}
              defaultValue={feedbackUrl} />
          </div>
        }

        <button type='submit' className='govuk-button'>Save</button>
      </form>
    )
  }
}

export default FormDetails

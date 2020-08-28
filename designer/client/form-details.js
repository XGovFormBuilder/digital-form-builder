import React from 'react'
import formConfigurationApi from './load-form-configurations'

class FormDetails extends React.Component {
  constructor (props) {
    super(props)
    const { feedbackForm, feedbackUrl } = props.data
    const selectedFeedbackForm = feedbackUrl?.substr(1)
    this.state = {
      title: props.data.name,
      feedbackForm: feedbackForm,
      formConfigurations: [],
      selectedFeedbackForm
    }
    this.onSelectFeedbackForm = this.onSelectFeedbackForm.bind(this)
  }

  async componentDidMount () {
    const formConfigurations = await formConfigurationApi.loadConfigurations()
    this.setState({ formConfigurations: formConfigurations.filter(it => it.feedbackForm) })
  }

  onSubmit = async e => {
    e.preventDefault()
    const { data } = this.props
    const { title, feedbackForm, selectedFeedbackForm } = this.state

    const copy = data.clone()
    copy.name = title
    copy.feedbackForm = feedbackForm
    copy.setFeedbackUrl(selectedFeedbackForm ? `/${selectedFeedbackForm}` : undefined)

    try {
      const saved = await data.save(copy)
      if (this.props.onCreate) {
        this.props.onCreate(saved)
      }
    } catch (err) {
      console.error(err)
    }
  }

  onSelectFeedbackForm (e) {
    const selectedFeedbackForm = e.target.value
    this.setState({ selectedFeedbackForm })
  }

  render () {
    const { title, feedbackForm, selectedFeedbackForm, formConfigurations } = this.state

    return (
      <form onSubmit={this.onSubmit} autoComplete='off'>
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
              <input className='govuk-radios__input' id='feedback-yes' name='feedbackForm' type='radio' value='true' defaultChecked={feedbackForm} onClick={() => this.setState({ feedbackForm: true, selectedFeedbackForm: undefined })} />
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

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='form-title' aria-describedby='feedback-form-hint'>Title</label>
          <input className='govuk-input' id='form-title' name='title'
            type='text' required onBlur={e => this.setState({ title: e.target.value })}
            defaultValue={title} />
        </div>
        {!feedbackForm &&
          <div className='govuk-form-group'>
            <label className='govuk-label govuk-label--s' htmlFor='target-feedback-form'>Feedback form</label>
            {!formConfigurations.length && (
              <div className='govuk-hint' id='target-feedback-form-hint'>
                <p>No available feedback form configurations found</p>
                <p>Only forms marked as being a feedback form are listed here</p>
              </div>
            )}

            {formConfigurations.length && (
              <div>
                <div id='target-feedback-form-hint' className='govuk-hint'>
                  <p>This is the form to use for gathering feedback about this form</p>
                  <p>Only forms marked as being a feedback form are listed here</p>
                </div>
                <select className='govuk-select' id='target-feedback-form' name='targetFeedbackForm' value={selectedFeedbackForm} required onChange={this.onSelectFeedbackForm}>
                  <option/>
                  {formConfigurations.map((config, index) => (<option key={config.Key + index} value={config.Key}>{config.DisplayName}</option>))}
                </select>
              </div>
            )}
          </div>
        }

        <button type='submit' className='govuk-button'>Save</button>
      </form>
    )
  }
}

export default FormDetails

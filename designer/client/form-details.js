import React from 'react'

class FormDetails extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: props.data.name
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
    const { title } = this.state

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='form-title'>Title</label>
          <input className='govuk-input' id='form-title' name='title'
            type='text' required onBlur={this.onBlurTitle}
            defaultValue={title} />
        </div>

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

import React from 'react'
import { clone } from './helpers'
import NotifyEdit from './notify-edit'
import EmailEdit from './email-edit'

class OutputEdit extends React.Component {
  constructor (props) {
    super(props)
    this.state = { outputType: props.output ? props.output.type : 'confirmationEmail' }
  }

  onSubmit = e => {
    e.preventDefault()
    let output = this.props.output || { name: '', type: '' }
    const form = e.target
    const formData = new window.FormData(form)
    const { data } = this.props
    let copy = clone(data)
    const outputType = formData.get('output-type') || output.type
    const outputName = formData.get('output-name')
    let outputIndex
    if (output.name) {
      outputIndex = data.outputs.indexOf(output)
    }

    let outputConfiguration = output.outputConfiguration || {}
    switch (outputType) {
      case 'confirmationEmail':
        outputConfiguration = {
          personalisation: formData.getAll('personalisation').map(t => t.trim()),
          templateId: formData.get('template-id'),
          apiKey: formData.get('api-key'),
          emailField: formData.get('email-field')
        }
        break
      case 'email':
        outputConfiguration = {
          emailAddress: formData.get('email-address')
        }
        break
      case 'webhook':
        outputConfiguration = {
          url: formData.get('webhook-url')
        }
        break
    }

    output = {
      name: outputName,
      type: outputType,
      outputConfiguration
    }

    if (outputIndex >= 0) {
      copy.outputs[outputIndex] = output
    } else {
      copy.outputs = copy.outputs || []
      copy.outputs.push(output)
    }

    data.save(copy)
      .then(data => {
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onChangeOutputType = e => {
    this.setState({ outputType: e.target.value })
  }

  onClickDelete = e => {
    e.preventDefault()

    if (!window.confirm('Confirm delete')) {
      return
    }

    const { data, output } = this.props
    let copy = clone(data)
    const outputIndex = data.outputs.indexOf(output)
    copy.outputs.splice(outputIndex, 1)

    data.save(copy)
      .then(data => {
        this.props.onEdit({ data })
      })
      .catch(err => {
        console.error(err)
      })
  }

  render () {
    const { data, output } = this.props
    const state = this.state
    let outputEdit
    if (state.outputType === 'confirmationEmail') {
      outputEdit = <NotifyEdit data={data} output={output} />
    } else if (state.outputType === 'email') {
      outputEdit = <EmailEdit output={output} />
    } else if (state.outputType === 'webhook') {
      outputEdit = (<div className='govuk-form-group'>
        <label className='govuk-label govuk-label--s' htmlFor='webhook-url'>Webhook url</label>
        <input className='govuk-input' id='webhook-url' name='webhook-url' defaultValue={output ? output.outputConfiguration.url : ''}
          type='text' required pattern='^\S+' />
      </div>)
    }

    return (
      <form onSubmit={e => this.onSubmit(e)} autoComplete='off'>
        { this.props.onCancel &&
          <a className='govuk-back-link' href='#'
            onClick={e => this.props.onCancel(e)}>Back</a>
        }
        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='output-name'>Name</label>
          <input className='govuk-input' id='output-name' name='output-name'
            type='text' required pattern='^\S+' defaultValue={output ? output.name : ''}
            onBlur={this.onBlurName} />
        </div>

        <div className='govuk-form-group'>
          <label className='govuk-label govuk-label--s' htmlFor='output-type'>Output type</label>
          <select className='govuk-select' id='output-type' name='output-type' disabled={output}
            value={state.outputType}
            onChange={this.onChangeOutputType}>
            <option value='confirmationEmail'>Confirmation email</option>
            <option value='email'>Email</option>
            <option value='webhook'>Webhook</option>
          </select>
        </div>

        {outputEdit}
        <div className='govuk-form-group'>
          <button className='govuk-button' type='submit'>Save</button>
        </div>
        { output &&
          <div className='govuk-form-group'>
            <a onClick={this.onClickDelete} href={'#'}>Delete</a>
          </div>
        }
      </form>
    )
  }
}

export default OutputEdit

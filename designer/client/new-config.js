import React from 'react'

export default class NewConfig extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      configs: [],
      selected: { Key: 'New' },
      newName: '',
      alreadyExistsError: false
    }

    this.onSelect = this.onSelect.bind(this)
    this.onNewNameChange = this.onNewNameChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  fetchConfigurations () {
    return window.fetch('/configurations', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.ok) {
        return res.json()
      } else {
        throw res.error
      }
    })
  }

  loadConfigurations () {
    this.fetchConfigurations().then(data => {
      this.setState({ configs: Object.values(data) || [] })
    }).catch(error => {
      console.log(error)
    })
  }

  componentWillMount () {
    this.loadConfigurations()
  }

  onSelect (e) {
    const { configs } = this.state
    const { value } = e.target

    if (value === 'New') {
      this.setState({ selected: { Key: 'New' } })
    } else {
      const selected = configs.find(config => config.Key === value)
      this.setState({ selected })
    }
  }

  onNewNameChange (e) {
    const { configs } = this.state
    const parsed = e.target.value.replace(/\s+/g, '-')
    const alreadyExists = configs.find(config => {
      const fileName = config.Key.replace('.json', '')
      return fileName === parsed
    }) ?? false
    this.setState({
      alreadyExistsError: alreadyExists,
      newName: parsed.replace('.json', '')
    })
  }

  async onSubmit (e) {
    const { selected, newName } = this.state
    const newResponse = await window.fetch('/new', {
      method: 'POST',
      body: JSON.stringify({ selected, name: newName }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    window.location.replace(newResponse.url)
  }

  render () {
    const { selected, configs, newName, alreadyExistsError } = this.state

    return (
      <div>
        <label className='govuk-label govuk-label--s' htmlFor='configuration'>Start a new configuration or select from a previous configuration</label>
        {!configs.length && (
          <span className='govuk-hint' id='hint-none-found'>No existing configurations found</span>
        )}

        <select className='govuk-select' id='link-source' name='configuration' value={selected.Key} required onChange={this.onSelect}>
          <option key={0} value='New'>New</option>
          {configs.length && (
            configs.map((config, i) => (<option key={config.Key + i} value={config.Key}>{config.Key}</option>))
          )}
        </select>

        {selected.Key !== 'New' && (
          <div>
            <p className='govuk-body govuk-!-margin-0'>name: {selected.Key} </p>
            <p className='govuk-body'>{selected.LastModified ? `last modified at ${new Date(selected.LastModified).toLocaleDateString()}` : ''}</p>
          </div>
        )}
        {' '}
        <div className='govuk-form-group govuk-body' style={{ marginTop: 20 }}>
          <label htmlFor='formName' className='govuk-label govuk-label--s'>New name (Optional)</label>
          <span className='govuk-hint'>If no name is provided, one will be generated</span>
          <input type='text' name='formName' className='govuk-input govuk-input--width-10' value={newName} onChange={this.onNewNameChange} />.json
        </div>
        {alreadyExistsError && (
          <span id='error-already-exists' className='govuk-error-message'>
            A configuration with the name {newName} already exists.
          </span>
        )}

        <button className='govuk-button' style={{ marginTop: 20 }} onClick={this.onSubmit} disabled={alreadyExistsError}>Start</button>
      </div>
    )
  }
}

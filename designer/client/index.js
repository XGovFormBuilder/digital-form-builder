import React from 'react'
import ReactDOM from 'react-dom'
import Menu from './menu'
import Visualisation from './visualisation'
import NewConfig from './new-config'
import { Data } from '@xgovformbuilder/model'
import { customAlphabet } from 'nanoid'
import { FlyoutContext } from './context'
import './index.scss'
import { initI18n, i18n } from './i18n'

initI18n(i18n)

/**
 * Custom alphabet is required because '-' is used as a symbol in
 * expr-eval (condition logic) so components which include a '-' in the name
 * result in broken conditions
 */
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 10)

export class App extends React.Component {
  state = {
    id: '',
    flyoutCount: 0
  }

  componentDidMount () {
    this.setState({ newConfig: window.newConfig ?? false },
      () => {
        if (!this.state.loaded && !this.state.newConfig) {
          this.setState({ id: window.id, previewUrl: window.previewUrl }, () => {
            window.fetch(`${this.state.id}/api/data`)
              .then(res => res.json())
              .then(data => {
                this.setFunctions(data)
                this.setState({ loaded: true, data })
              })
          })
        }
      })
  }

  save = (updatedData) => {
    return window.fetch(`${this.state.id}/api/data`, {
      method: 'put',
      // dodgy hack to ensure get methods are called
      body: JSON.stringify(updatedData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        throw Error(res.statusText)
      }
    }).catch(() => {
      // Not connected to preview environment
    }).finally(() => {
      this.setFunctions(updatedData)
      this.setState({ data: updatedData, updatedAt: (new Date().toLocaleTimeString()) })
      return updatedData
    })
  }

  getId = () => {
    return nanoid()
  }

  setFunctions (data) {
    data.save = this.save
    data.getId = this.getId
  }

  updateDownloadedAt = (time) => {
    this.setState({ downloadedAt: time })
  }

  setStateId = (id) => {
    this.setState({ id })
  }

  incrementFlyoutCounter = (callback = () => {}) => {
    let currentCount = this.state.flyoutCount
    this.setState({ flyoutCount: ++currentCount }, callback())
  }

  decrementFlyoutCounter = (callback = () => {}) => {
    let currentCount = this.state.flyoutCount
    this.setState({ flyoutCount: --currentCount }, callback())
  }

  render () {
    const { previewUrl, id, flyoutCount, newConfig } = this.state
    const flyoutContextProviderValue = { flyoutCount, increment: this.incrementFlyoutCounter, decrement: this.decrementFlyoutCounter }

    if (newConfig) {
      return (
        <div id='app'>
          <NewConfig setStateId={this.setStateId} />
        </div>
      )
    }
    if (this.state.loaded) {
      const data = new Data(this.state.data)
      return (
        <FlyoutContext.Provider value={flyoutContextProviderValue}>
          <div id='app'>
            <Menu data={data} id={this.state.id} updateDownloadedAt={this.updateDownloadedAt} updatePersona={this.updatePersona} />
            <Visualisation data={data} downloadedAt={this.state.downloadedAt} updatedAt={this.state.updatedAt} persona={this.state.persona} id={id} previewUrl={previewUrl} />
          </div>
        </FlyoutContext.Provider>
      )
    } else {
      return <div>Loading...</div>
    }
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)

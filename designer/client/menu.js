import React from 'react'
import Flyout from './flyout'
import DataModel from './data-model'
import PageCreate from './page-create'
import LinkCreate from './link-create'
import ListsEdit from './lists-edit'
import SectionsEdit from './sections-edit'
import ConditionsEdit from './conditions-edit'
import FeeEdit from './fee-edit'
import NotifyEdit from './notify-edit'
import DeclarationEdit from './declaration-edit'
import OutputsEdit from './outputs-edit'
import FormDetails from './form-details'

export default class Menu extends React.Component {
  state = {
    tab: 'model'
  }

  onClickUpload = (e) => {
    e.preventDefault()
    document.getElementById('upload').click()
  }

  onFileUpload = (e) => {
    const { data } = this.props
    const file = e.target.files.item(0)
    const reader = new window.FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = function (evt) {
      const content = JSON.parse(evt.target.result)

      console.log('Converting form format')

      for (const page of content.pages) {
        if (!page.title && page.components && page.components.length > 0) {
          page.title = page.components[0].title
        }
        for (const link of (page.next || [])) {
          const nextPage = content.pages.find(np => np.path === link.path)
          if (nextPage && nextPage.condition) {
            console.log(`Moving condition ${nextPage.condition} to link`)
            link.condition = nextPage.condition
          }
        }
      }

      for (const page of content.pages) {
        delete page.condition
      }

      console.log('Converted', content)

      data.save(content)
    }
  }

  onClickDownload = (e) => {
    const { updateDownloadedAt, data, id } = this.props
    e.preventDefault()
    const encodedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))
    updateDownloadedAt((new Date()).toLocaleTimeString())
    const link = document.createElement('a')
    link.download = `${id}.json`
    link.href = `data:${encodedData}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  setTab (e, name) {
    e.preventDefault()
    this.setState({ tab: name })
  }

  toggleShowState = (key) => {
    const currentState = this.state[key]
    this.setState({ [key]: !currentState })
  }

  render () {
    const { data } = this.props
    const { tab } = this.state

    return (
      <div className='menu'>
        <span className='menu-inner'>
          <button
            className='govuk-button govuk-!-font-size-14 govuk-!-margin-bottom-1'
            onClick={() => this.setState({ showFormConfig: true })}
          >Form Details
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14 govuk-!-margin-bottom-1'
            onClick={() => this.setState({ showAddPage: true })}
          >Add Page
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showAddLink: true })}
          >Add Link
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditSections: true })}
          >Edit Sections
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditConditions: true })}
          >Edit Conditions
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditLists: true })}
          >Edit Lists
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditOutputs: true })}
          >Edit Outputs
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditFee: true })}
          >Edit Fees
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditSummaryBehaviour: true })}
          >Edit summary behaviour
          </button>
          {' '}

          <button
            className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showSummary: true })}
          >Summary
          </button>
          {' '}

          <div className='govuk-!-margin-top-4'>
            <a
              className='govuk-link govuk-!-font-size-16'
              onClick={this.onClickDownload} href='#'
            >
              Download JSON
            </a>{' '}
            <a
              className='govuk-link govuk-link--no-visited-state govuk-!-font-size-16' href='#'
              onClick={this.onClickUpload}
            >Upload JSON
            </a>{' '}
            <input type='file' id='upload' hidden onChange={this.onFileUpload} />
          </div>

          <Flyout title='Form Details' show={this.state.showFormConfig}
            onHide={() => this.setState({ showFormConfig: false })}>
            <FormDetails data={data} onCreate={() => this.setState({ showFormConfig: false })} />
          </Flyout>

          <Flyout
            title='Add Page' show={this.state.showAddPage}
            onHide={() => this.setState({ showAddPage: false })}
          >
            <PageCreate data={data} onCreate={() => this.setState({ showAddPage: false })} />
          </Flyout>

          <Flyout
            title='Add Link' show={this.state.showAddLink}
            onHide={() => this.setState({ showAddLink: false })}
          >
            <LinkCreate data={data} onCreate={() => this.setState({ showAddLink: false })} />
          </Flyout>

          <Flyout
            title='Edit Sections' show={this.state.showEditSections}
            onHide={() => this.setState({ showEditSections: false })}
          >
            <SectionsEdit data={data} onCreate={() => this.setState({ showEditSections: false })} />
          </Flyout>

          <Flyout
            title='Edit Conditions' show={this.state.showEditConditions}
            onHide={() => this.setState({ showEditConditions: false })} width='large'
          >
            <ConditionsEdit data={data} onCreate={() => this.setState({ showEditConditions: false })} />
          </Flyout>

          <Flyout
            title='Edit Lists' show={this.state.showEditLists}
            onHide={() => this.setState({ showEditLists: false })} width='xlarge'
          >
            <ListsEdit data={data} onCreate={() => this.setState({ showEditLists: false })} />
          </Flyout>

          <Flyout
            title='Edit Fees' show={this.state.showEditFee}
            onHide={() => this.setState({ showEditFee: false })} width='xlarge'
          >
            <FeeEdit data={data} onCreate={() => this.setState({ showEditFee: false })} />
          </Flyout>

          <Flyout
            title='Edit Notify' show={this.state.showEditNotify}
            onHide={() => this.setState({ showEditNotify: false })} width='xlarge'
          >
            <NotifyEdit data={data} onCreate={() => this.setState({ showEditNotify: false })} />
          </Flyout>

          <Flyout
            title='Edit Declaration' show={this.state.showEditDeclaration}
            onHide={() => this.setState({ showEditDeclaration: false })} width='xlarge'
          >
            <DeclarationEdit data={data} toggleShowState={this.toggleShowState} onCreate={() => this.setState({ showEditDeclaration: false })} />
          </Flyout>

          <Flyout
            title='Edit Outputs' show={this.state.showEditOutputs}
            onHide={() => this.setState({ showEditOutputs: false })} width='xlarge'
          >
            <OutputsEdit data={data} toggleShowState={this.toggleShowState} onCreate={() => this.setState({ showEditOutputs: false })} />
          </Flyout>

          <Flyout
            title='Edit Summary behaviour' show={this.state.showEditSummaryBehaviour}
            onHide={() => this.setState({ showEditSummaryBehaviour: false })} width='xlarge'
          >
            <DeclarationEdit data={data} toggleShowState={this.toggleShowState} onCreate={() => this.setState({ showEditSummaryBehaviour: false })} />
          </Flyout>

          <Flyout
            title='Summary' show={this.state.showSummary} width='large'
            onHide={() => this.setState({ showSummary: false })}
          >
            <div className='js-enabled' style={{ paddingTop: '3px' }}>
              <div className='govuk-tabs' data-module='tabs'>
                <h2 className='govuk-tabs__title'>Summary</h2>
                <ul className='govuk-tabs__list'>
                  <li className='govuk-tabs__list-item'>
                    <a
                      className='govuk-tabs__tab' href='#'
                      aria-selected={`${tab === 'model'}`}
                      onClick={e => this.setTab(e, 'model')}
                    >Data Model
                    </a>
                  </li>
                  <li className='govuk-tabs__list-item'>
                    <a
                      className='govuk-tabs__tab' href='#'
                      aria-selected={`${tab === 'json'}`}
                      onClick={e => this.setTab(e, 'json')}
                    >JSON
                    </a>
                  </li>
                  <li className='govuk-tabs__list-item'>
                    <a
                      className='govuk-tabs__tab' href='#'
                      aria-selected={`${tab === 'summary'}`}
                      onClick={e => this.setTab(e, 'summary')}
                    >Summary
                    </a>
                  </li>
                </ul>
                {tab === 'model' &&
                  <section className='govuk-tabs__panel'>
                    <DataModel data={data} />
                  </section>}
                {tab === 'json' &&
                  <section className='govuk-tabs__panel'>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                  </section>}
                {tab === 'summary' &&
                  <section className='govuk-tabs__panel'>
                    <pre>{JSON.stringify(data.pages.map(page => page.path), null, 2)}</pre>
                  </section>}
              </div>
            </div>
          </Flyout>
        </span>
      </div>
    )
  }
}

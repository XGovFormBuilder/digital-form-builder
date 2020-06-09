import React from 'react'
import ReactDOM from 'react-dom'
import dagre from 'dagre'
import Page from './page'
import Flyout from './flyout'
import DataModel from './data-model'
import PageCreate from './page-create'
import LinkEdit from './link-edit'
import LinkCreate from './link-create'
import ListsEdit from './lists-edit'
import SectionsEdit from './sections-edit'
import ConditionsEdit from './conditions-edit'
import FeeEdit from './fee-edit'
import NotifyEdit from './notify-edit'
import DeclarationEdit from './declaration-edit'
import OutputsEdit from './outputs-edit'

function getLayout (pages, el) {
  // Create a new directed graph
  var g = new dagre.graphlib.Graph()

  // Set an object for the graph label
  g.setGraph({
    rankdir: 'LR',
    marginx: 50,
    marginy: 150,
    ranksep: 160
  })

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {}
  })

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each node
  pages.forEach((page, index) => {
    const pageEl = el.children[index]

    g.setNode(page.path, { label: page.path, width: pageEl.offsetWidth, height: pageEl.offsetHeight })
  })

  // Add edges to the graph.
  pages.forEach(page => {
    if (Array.isArray(page.next)) {
      page.next.forEach(next => {
        // The linked node (next page) may not exist if it's filtered
        const exists = pages.find(page => page.path === next.path)
        if (exists) {
          g.setEdge(page.path, next.path, next)
        }
      })
    }
  })

  dagre.layout(g)

  const pos = {
    nodes: [],
    edges: []
  }

  const output = g.graph()
  pos.width = output.width + 'px'
  pos.height = output.height + 'px'
  g.nodes().forEach((v, index) => {
    const node = g.node(v)
    const pt = { node }
    pt.top = (node.y - node.height / 2) + 'px'
    pt.left = (node.x - node.width / 2) + 'px'
    pos.nodes.push(pt)
  })

  g.edges().forEach((e, index) => {
    const edge = g.edge(e)
    pos.edges.push({
      source: e.v,
      target: e.w,
      label: edge.condition || '',
      points: edge.points.map(p => {
        const pt = {}
        pt.y = p.y
        pt.x = p.x
        return pt
      })
    })
  })

  return { g, pos }
}

class Lines extends React.Component {
  state = {}

  editLink = (edge) => {
    this.setState({
      showEditor: edge
    })
  }

  render () {
    const { layout, data } = this.props

    return (
      <div>
        <svg height={layout.height} width={layout.width}>
          {
            layout.edges.map(edge => {
              const points = edge.points.map(points => `${points.x},${points.y}`).join(' ')

              const xs = edge.points.map(p => p.x)
              const ys = edge.points.map(p => p.y)
              const minX = Math.min(...xs)
              const minY = Math.min(...ys)
              const maxX = Math.max(...xs)
              const maxY = Math.max(...ys)

              const textX = ((maxX - minX) / 2) + minX
              const textY = ((maxY - minY) / 2) + minY

              return (
                <g key={points}>
                  <polyline
                    onClick={() => this.editLink(edge)}
                    points={points} />
                  { edge.label && (<text text-anchor="middle" x={textX} y={textY} fill="black" pointer-events="none">{edge.label}</text>) }
                </g>
              )
            })
          }
        </svg>

        <Flyout title='Edit Link' show={this.state.showEditor}
          onHide={e => this.setState({ showEditor: false })}>
          <LinkEdit edge={this.state.showEditor} data={data}
            onEdit={e => this.setState({ showEditor: false })} />
        </Flyout>
      </div>
    )
  }
}

class SaveNotification extends React.Component {
  render () {
    const { updatedAt, downloadedAt } = this.props
    return (
      <div className='notification' style={{ position: 'fixed', bottom: 0 }}>
        <p className='govuk-body'>last downloaded at {downloadedAt}</p>
        <p className='govuk-body'>last updated at {updatedAt}</p>
      </div>
    )
  }
}

class Minimap extends React.Component {
  state = {}

  render () {
    const { layout, scale = 0.05 } = this.props

    return (
      <div className='minimap'>
        <svg height={parseFloat(layout.height) * scale} width={parseFloat(layout.width) * scale}>
          {
            layout.edges.map(edge => {
              const points = edge.points.map(points => `${points.x * scale},${points.y * scale}`).join(' ')
              return (
                <g key={points}>
                  <polyline points={points} />
                </g>
              )
            })
          }
          {
            layout.nodes.map((node, index) => {
              return (
                <g key={node + index}>
                  <a xlinkHref={`#${node.node.label}`}>
                    <rect x={parseFloat(node.left) * scale}
                      y={parseFloat(node.top) * scale}
                      width={node.node.width * scale}
                      height={node.node.height * scale}
                      title={node.node.label} />
                  </a>
                </g>
              )
            })
          }
        </svg>
      </div>
    )
  }
}

class Visualisation extends React.Component {
  state = {}

  constructor () {
    super()
    this.ref = React.createRef()
  }

  scheduleLayout () {
    setTimeout(() => {
      const { data } = this.props
      const { pages } = data
      const layout = getLayout(pages, this.ref.current)

      this.setState({
        layout: layout.pos
      })
    }, 200)
  }

  componentDidMount () {
    this.scheduleLayout()
  }

  componentWillReceiveProps () {
    this.scheduleLayout()
  }

  render () {
    const { data, id, updatedAt, downloadedAt, previewUrl } = this.props
    const { pages } = data

    return (
      <div ref={this.ref} className='visualisation' style={this.state.layout &&
        { width: this.state.layout.width, height: this.state.layout.height }}>
        {pages.map((page, index) => <Page
          key={index} data={data} page={page} id={id} previewUrl={previewUrl}
          layout={this.state.layout && this.state.layout.nodes[index]} />
        )}
        {this.state.layout &&
        <Lines layout={this.state.layout} data={data} />}

        {this.state.layout &&
        <SaveNotification layout={this.state.layout} downloadedAt={downloadedAt} updatedAt={updatedAt} />}

        {this.state.layout &&
        <Minimap layout={this.state.layout} data={data} />}
      </div>
    )
  }
}

class Menu extends React.Component {
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
        for (const link of (page.next || [])) {
          const nextPage = content.pages.find(np => np.path === link.path)
          if (nextPage && nextPage.condition) {
            console.log(`Moving condition ${nextPage.condition} to link`)
            link.condition = nextPage.condition
            delete nextPage.condition
          }
        }
      }
      console.log('Converted', content)

      data.save(content)
    }
  }

  onClickDownload = (e) => {
    let { updateDownloadedAt, data, id } = this.props
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
    let currentState = this.state[key]
    this.setState({ [key]: !currentState })
  }

  render () {
    const { data } = this.props
    return (
      <div className='menu'>
        <span className='menu-inner'>
          <button className='govuk-button govuk-!-font-size-14 govuk-!-margin-bottom-1'
            onClick={() => this.setState({ showAddPage: true })}>Add Page
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showAddLink: true })}>Add Link
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditSections: true })}>Edit Sections
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditConditions: true })}>Edit Conditions
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditLists: true })}>Edit Lists
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditOutputs: true })}>Edit Outputs
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditFee: true })}>Edit Fees
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showEditSummaryBehaviour: true })}>Edit summary behaviour
          </button>
          {' '}

          <button className='govuk-button govuk-!-font-size-14'
            onClick={() => this.setState({ showSummary: true })}>Summary
          </button>

          <div className='govuk-!-margin-top-4'>
            <a className='govuk-link govuk-!-font-size-16'
              onClick={this.onClickDownload} href='#'>
      Download JSON</a>{' '}
            <a className='govuk-link govuk-link--no-visited-state govuk-!-font-size-16' href='#'
              onClick={this.onClickUpload}>Upload JSON</a>{' '}
            <input type='file' id='upload' hidden onChange={this.onFileUpload} />
          </div>

          <Flyout title='Add Page' show={this.state.showAddPage}
            onHide={() => this.setState({ showAddPage: false })}>
            <PageCreate data={data} onCreate={() => this.setState({ showAddPage: false })} />
          </Flyout>

          <Flyout title='Add Link' show={this.state.showAddLink}
            onHide={() => this.setState({ showAddLink: false })}>
            <LinkCreate data={data} onCreate={() => this.setState({ showAddLink: false })} />
          </Flyout>

          <Flyout title='Edit Sections' show={this.state.showEditSections}
            onHide={() => this.setState({ showEditSections: false })}>
            <SectionsEdit data={data} onCreate={() => this.setState({ showEditSections: false })} />
          </Flyout>

          <Flyout title='Edit Conditions' show={this.state.showEditConditions}
            onHide={() => this.setState({ showEditConditions: false })} width='large'>
            <ConditionsEdit data={data} onCreate={() => this.setState({ showEditConditions: false })} />
          </Flyout>

          <Flyout title='Edit Lists' show={this.state.showEditLists}
            onHide={() => this.setState({ showEditLists: false })} width='xlarge'>
            <ListsEdit data={data} onCreate={() => this.setState({ showEditLists: false })} />
          </Flyout>

          <Flyout title='Edit Fees' show={this.state.showEditFee}
            onHide={() => this.setState({ showEditFee: false })} width='xlarge'>
            <FeeEdit data={data} onCreate={() => this.setState({ showEditFee: false })} />
          </Flyout>

          <Flyout title='Edit Notify' show={this.state.showEditNotify}
            onHide={() => this.setState({ showEditNotify: false })} width='xlarge'>
            <NotifyEdit data={data} onCreate={() => this.setState({ showEditNotify: false })} />
          </Flyout>

          <Flyout title='Edit Declaration' show={this.state.showEditDeclaration}
            onHide={() => this.setState({ showEditDeclaration: false })} width='xlarge'>
            <DeclarationEdit data={data} toggleShowState={this.toggleShowState} onCreate={() => this.setState({ showEditDeclaration: false })} />
          </Flyout>

          <Flyout title='Edit Outputs' show={this.state.showEditOutputs}
            onHide={() => this.setState({ showEditOutputs: false })} width='xlarge'>
            <OutputsEdit data={data} toggleShowState={this.toggleShowState} onCreate={() => this.setState({ showEditOutputs: false })} />
          </Flyout>

          <Flyout title='Edit Summary behaviour' show={this.state.showEditSummaryBehaviour}
            onHide={() => this.setState({ showEditSummaryBehaviour: false })} width='xlarge'>
            <DeclarationEdit data={data} toggleShowState={this.toggleShowState} onCreate={() => this.setState({ showEditSummaryBehaviour: false })} />
          </Flyout>

          <Flyout title='Summary' show={this.state.showSummary} width='large'
            onHide={() => this.setState({ showSummary: false })}>
            <div className='js-enabled' style={{ paddingTop: '3px' }}>
              <div className='govuk-tabs' data-module='tabs'>
                <h2 className='govuk-tabs__title'>Summary</h2>
                <ul className='govuk-tabs__list'>
                  <li className='govuk-tabs__list-item'>
                    <a className='govuk-tabs__tab' href='#'
                      aria-selected={this.state.tab === 'model' ? 'true' : 'false'}
                      onClick={e => this.setTab(e, 'model')}>Data Model</a>
                  </li>
                  <li className='govuk-tabs__list-item'>
                    <a className='govuk-tabs__tab' href='#'
                      aria-selected={this.state.tab === 'json' ? 'true' : 'false'}
                      onClick={e => this.setTab(e, 'json')}>JSON</a>
                  </li>
                  <li className='govuk-tabs__list-item'>
                    <a className='govuk-tabs__tab' href='#'
                      aria-selected={this.state.tab === 'summary' ? 'true' : 'false'}
                      onClick={e => this.setTab(e, 'summary')}>Summary</a>
                  </li>
                </ul>
                {this.state.tab === 'model' &&
                <section className='govuk-tabs__panel'>
                  <DataModel data={data} />
                </section>
                }
                {this.state.tab === 'json' &&
                <section className='govuk-tabs__panel'>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </section>
                }
                {this.state.tab === 'summary' &&
                <section className='govuk-tabs__panel'>
                  <pre>{JSON.stringify(data.pages.map(page => page.path), null, 2)}</pre>
                </section>
                }
              </div>
            </div>
          </Flyout>
        </span>
      </div>
    )
  }
}

class App extends React.Component {
  state = {
    id: ''
  }
  componentWillMount () {
    if (!this.state.loaded) {
      this.setState({ id: window.id, previewUrl: window.previewUrl }, () => {
        window.fetch(`${this.state.id}/api/data`).then(res => res.json()).then(data => {
          data.save = this.save
          this.setState({ loaded: true, data })
        })
      })
    }
  }

  save = (updatedData) => {
    return window.fetch(`${this.state.id}/api/data`, {
      method: 'put',
      body: JSON.stringify(updatedData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        throw Error(res.statusText)
      }
    }).catch(() => {
      // Not connected to preview environment
    }).finally(() => {
      updatedData.save = this.save
      this.setState({ data: updatedData, updatedAt: (new Date().toLocaleTimeString()) })
      return updatedData
    })
  }

  updateDownloadedAt = (time) => {
    this.setState({ downloadedAt: time })
  }

  render () {
    let { previewUrl, id } = this.state
    if (this.state.loaded) {
      return (
        <div id='app'>
          <Menu data={this.state.data} id={this.state.id} updateDownloadedAt={this.updateDownloadedAt} />
          <Visualisation data={this.state.data} downloadedAt={this.state.downloadedAt} updatedAt={this.state.updatedAt} id={id} previewUrl={previewUrl} />
        </div>
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

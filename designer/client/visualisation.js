import React from 'react'
import Page from './page'
import dagre from 'dagre'
import Flyout from './flyout'
import LinkEdit from './link-edit'

function getLayout (data, el) {
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
  data.pages.forEach((page, index) => {
    const pageEl = el.children[index]

    g.setNode(page.path, { label: page.path, width: pageEl.offsetWidth, height: pageEl.offsetHeight })
  })

  // Add edges to the graph.
  data.pages.forEach(page => {
    if (Array.isArray(page.next)) {
      page.next.forEach(next => {
        // The linked node (next page) may not exist if it's filtered
        const exists = data.pages.find(page => page.path === next.path)
        if (exists) {
          g.setEdge(page.path, next.path, { condition: data.findCondition(next.condition)?.displayName })
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
    const { layout, data, persona } = this.props

    return (
      <div>
        <svg height={layout.height} width={layout.width}>
          {
            layout.edges.map(edge => {
              const points = edge.points.map(points => `${points.x},${points.y}`).join(' ')

              const xs = edge.points.map(p => p.x)
              const ys = edge.points.map(p => p.y)

              const textX = xs.reduce((a, b) => a + b, 0) / xs.length
              const textY = ys.reduce((a, b) => a + b, 0) / ys.length
              const highlight = [edge.source, edge.target].every(path => persona?.paths?.includes(path))
              return (
                <g key={points}>
                  <polyline
                    onClick={() => this.editLink(edge)}
                    points={points}
                    className={`${highlight ? 'highlight' : ''}`}
                  />
                  {edge.label && (<text textAnchor='middle' x={textX} y={textY} fill='black' pointerEvents='none'>{edge.label}</text>)}
                </g>
              )
            })
          }
        </svg>

        <Flyout
          title='Edit Link' show={this.state.showEditor}
          onHide={e => this.setState({ showEditor: false })}
        >
          <LinkEdit
            edge={this.state.showEditor} data={data}
            onEdit={e => this.setState({ showEditor: false })}
          />
        </Flyout>
      </div>
    )
  }
}

export default class Visualisation extends React.Component {
  state = {}

  constructor () {
    super()
    this.ref = React.createRef()
  }

  scheduleLayout () {
    setTimeout(() => {
      const { data } = this.props
      const layout = getLayout(data, this.ref.current)

      this.setState({
        layout: layout.pos
      })
    }, 200)
  }

  componentDidMount () {
    this.scheduleLayout()
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps () {
    this.scheduleLayout()
  }

  render () {
    const { data, id, updatedAt, downloadedAt, previewUrl, persona } = this.props
    const { pages } = data

    return (
      <div
        ref={this.ref} className='visualisation' style={this.state.layout &&
      { width: this.state.layout.width, height: this.state.layout.height }}
      >

        {pages.map((page, index) =>
          (<Page
            key={index} data={data} page={page} id={id} previewUrl={previewUrl} persona={persona}
            layout={this.state.layout && this.state.layout.nodes[index]}
          />
          )
        )}

        {this.state.layout &&
          <Lines layout={this.state.layout} data={data} persona={persona} />}

        {this.state.layout &&
          <Info layout={this.state.layout} downloadedAt={downloadedAt} updatedAt={updatedAt} persona={persona?.id} />}

        {this.state.layout &&
          <Minimap layout={this.state.layout} data={data} />}
      </div>
    )
  }
}

class Info extends React.Component {
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
                    <rect
                      x={parseFloat(node.left) * scale}
                      y={parseFloat(node.top) * scale}
                      width={node.node.width * scale}
                      height={node.node.height * scale}
                      title={node.node.label}
                    />
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

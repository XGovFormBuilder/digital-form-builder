import React from 'react'
import OutputEdit from './output-edit'

class OutputsEdit extends React.Component {
  state = {}

  onClickOutput = (e, output) => {
    e.preventDefault()

    this.setState({
      output: output
    })
  }

  onClickAddOutput = async (e) => {
    e.preventDefault()
    const { data } = this.props
    const id = await data.getId()
    this.setState({
      showAddOutput: true,
      id: id
    })
  }

  render () {
    const { data } = this.props
    const { outputs } = data
    const { output, id } = this.state

    return (
      <div className='govuk-body'>
        {!output ? (
          <div>
            {this.state.showAddOutput ? (
              <OutputEdit data={data} output={{ name: id }}
                onEdit={() => this.setState({ showAddOutput: false })}
                onCancel={() => this.setState({ showAddOutput: false })} />
            ) : (
              <ul className='govuk-list'>
                {(outputs || []).map(output => (
                  <li key={output.name}>
                    <a href='#' onClick={e => this.onClickOutput(e, output)}>
                      {output.title || output.name}
                    </a>
                  </li>
                ))}
                <li>
                  <hr />
                  <a href='#' onClick={this.onClickAddOutput}>Add output</a>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <OutputEdit output={output} data={data}
            onEdit={() => this.setState({ output: null })}
            onCancel={() => this.setState({ output: null })} />
        )}
      </div>
    )
  }
}

export default OutputsEdit

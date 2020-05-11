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

  onClickAddOutput = (e, output) => {
    e.preventDefault()

    this.setState({
      showAddOutput: true
    })
  }

  render () {
    const { data } = this.props
    const { outputs } = data
    const output = this.state.output

    return (
      <div className='govuk-body'>
        {!output ? (
          <div>
            {this.state.showAddOutput ? (
              <OutputEdit data={data}
                onEdit={e => this.setState({ showAddOutput: false })}
                onCancel={e => this.setState({ showAddOutput: false })} />
            ) : (
              <ul className='govuk-list'>
                {(outputs || []).map(output => (
                  <li key={output.name}>
                    <a href='#' onClick={e => this.onClickOutput(e, output)}>
                      {output.name}
                    </a>
                  </li>
                ))}
                <li>
                  <hr />
                  <a href='#' onClick={e => this.onClickAddOutput(e)}>Add output</a>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <OutputEdit output={output} data={data}
            onEdit={e => this.setState({ output: null })}
            onCancel={e => this.setState({ output: null })} />
        )}
      </div>
    )
  }
}

export default OutputsEdit

import React from 'react'
import SimpleEditor from 'react-simple-code-editor'
import core from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'

class Editor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      value: this.props.value || ''
    }
  }

  render () {
    return (
      <SimpleEditor
        name={this.props.name}
        className='editor'
        value={this.state.value}
        required={this.props.required}
        highlight={code => core.highlight(code, core.languages.js)}
        onValueChange={value => this.setState({ value })}
        padding={5}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          border: '2px solid #0b0c0c',
          fontSize: 16
        }}
      />
    )
  }
}

export default Editor

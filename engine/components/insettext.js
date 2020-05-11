const { Component } = require('.')

class InsetText extends Component {
  getViewModel () {
    return {
      content: this.content
    }
  }
}

module.exports = InsetText

const { Component } = require('.')

class Html extends Component {
  getViewModel () {
    const model = {
      content: this.content
    }

    if (this.options.condition) {
      model.condition = this.options.condition
    }

    return model
  }
}

module.exports = Html

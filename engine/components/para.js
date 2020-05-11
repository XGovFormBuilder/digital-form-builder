const { Component } = require('.')

class Para extends Component {
  getViewModel () {
    let model = {
      content: this.content
    }

    if (this.options.condition) {
      model.condition = this.options.condition
    }

    return model
  }
}

module.exports = Para

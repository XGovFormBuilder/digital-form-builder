const { Component } = require('.')

class Details extends Component {
  getViewModel () {
    let model = {
      summaryHtml: this.title,
      html: this.content
    }

    if (this.options.condition) {
      model.condition = this.options.condition
    }

    return model
  }
}

module.exports = Details

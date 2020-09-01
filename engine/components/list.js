const { Component } = require('.')

class List extends Component {
  getViewModel () {
    const { values } = this
    const viewModel = {}
    if (this.options.type) {
      viewModel.type = this.options.type
    }
    const content = values.items.map(item => {
      const contentItem = {
        text: item.hint || item.display
      }
      if (item.condition) {
        contentItem.condition = item.condition
      }
      return contentItem
    })

    return { ...viewModel, content }
  }
}

module.exports = List

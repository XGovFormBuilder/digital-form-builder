const { Component } = require('.')

class List extends Component {
  getViewModel () {
    const list = this.model.lists.find(list => list.name === this.options.list)
    const viewModel = {}
    if (this.options.type) {
      viewModel.type = this.options.type
    }
    const content = list.items.map(item => {
      const contentItem = {
        text: item.description
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

const { Component } = require('.')

class List extends Component {
  getViewModel () {
    let list = this.model.lists.find(list => list.name === this.options.list)
    let viewModel = {}
    if (this.options.type) {
      viewModel.type = this.options.type
    }
    let content = list.items.map(item => {
      let contentItem = {
        text: item.description
      }
      if (item.condition) {
        contentItem.condition = item.condition
      }
      return contentItem
    })



    return {...viewModel, content}
  }
}

module.exports = List

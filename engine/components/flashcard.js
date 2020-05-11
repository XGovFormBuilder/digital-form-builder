const { Component } = require('.')

class Flashcard extends Component {
  getViewModel () {
    let list = this.model.lists.find(list => list.name === this.options.list)
    let content = list.items.map(item => {
      let contentItem = {
        title: item.text,
        text: item.description || ''
      }
      if(item.condition) {
        contentItem.condition = item.condition
      }
      return contentItem
    })
    return {
      content
    }
  }
}

module.exports = Flashcard

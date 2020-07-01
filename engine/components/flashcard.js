const { Component } = require('.')

class Flashcard extends Component {
  getViewModel () {
    const list = this.model.lists.find(list => list.name === this.options.list)
    const content = list.items.map(item => {
      const contentItem = {
        title: item.text,
        text: item.description || ''
      }
      if (item.condition) {
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

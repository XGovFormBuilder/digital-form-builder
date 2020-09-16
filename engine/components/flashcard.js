const { Component } = require('.')

class Flashcard extends Component {
  getViewModel () {
    const { values } = this
    const content = values.items.map(item => {
      const contentItem = {
        title: item.label,
        text: item.hint || ''
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

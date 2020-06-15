import { newCondition, clone } from '../helpers'

export class Data {
  constructor (rawData) {
    Object.assign(this, rawData)
  }

  allInputs () {
    return (this.pages || []).flatMap(page => (page.components || []).filter(component => component.name).map(it => new Input(it, page)))
  }

  findPage (path) {
    return (this.pages || []).find(p => p.path === path)
  }

  clone () {
    return new Data(newCondition(this))
  }
}

class Input {
  constructor (rawData, page) {
    Object.assign(this, rawData)
    const myPage = clone(page)
    delete myPage.components
    this.page = myPage
  }
}

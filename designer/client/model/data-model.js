import { serialiseAndDeserialise, clone } from '../helpers'

export class Data {
  constructor (rawData) {
    Object.assign(this, rawData)
  }

  allInputs () {
    return (this.pages || []).flatMap(page => (page.components || []).filter(component => component.name).map(it => new Input(it, page)))
  }

  inputsAccessibleAt (path) {
    const precedingPages = this._allPathsLeadingTo(path)
    return this.allInputs().filter(it => precedingPages.includes(it.page.path) || path === it.page.path)
  }

  findPage (path) {
    return (this.pages || []).find(p => p.path === path)
  }

  listFor (input) {
    return (this.lists || []).find(it => it.name === (input.options || {}).list)
  }

  _allPathsLeadingTo (path) {
    return (this.pages || []).filter(page => page.next && page.next.includes(path))
      .flatMap(page => [page.path].concat(this._allPathsLeadingTo(page.path)))
  }

  clone () {
    return new Data(serialiseAndDeserialise(this))
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

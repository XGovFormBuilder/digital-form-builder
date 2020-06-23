import { serialiseAndDeserialise, clone } from '../helpers'

const yesNoList = {
  name: '__yesNo',
  title: 'Yes/No',
  type: 'boolean',
  items: [
    {
      text: 'Yes',
      value: true
    },
    {
      text: 'No',
      value: false
    }
  ]
}

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
    return (this.lists || []).find(it => it.name === (input.options || {}).list) || (input.type === 'YesNoField' ? yesNoList : undefined)
  }

  _allPathsLeadingTo (path) {
    return (this.pages || []).filter(page => page.next && page.next.find(next => next.path === path))
      .flatMap(page => [page.path].concat(this._allPathsLeadingTo(page.path)))
  }

  addCondition (name, value) {
    if (!this.conditions) {
      this.conditions = []
    }
    if (this.conditions?.find(it => it.name === name)) {
      throw Error(`A condition already exists with name ${name}`)
    }
    this.conditions.push({ name, value })
  }

  get hasConditions () {
    return (this.conditions??[]).length > 0
  }

  getConditions () {
    return (this.conditions??[]).map(it => clone(it))
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

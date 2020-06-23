import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'

import { Data } from '../client/model/data-model'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, describe, test } = lab

suite('data model', () => {
  describe('all inputs', () => {
    test('should return all inputs from the page model', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      expect(data.allInputs()).to.equal([
        { name: 'name1', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name1' },
        { name: 'name2', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name3' },
        { name: 'name4', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name4' }
      ])
    })

    test('should ignore unnamed components', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            components: [{ badger: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      expect(data.allInputs()).to.equal([
        { name: 'name1', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name1' },
        { name: 'name2', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name4', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name4' }
      ])
    })

    test('should handle no pages', () => {
      const data = new Data({ pages: [] })
      expect(data.allInputs()).to.equal([])
    })

    test('should handle undefined pages', () => {
      const data = new Data({ })
      expect(data.allInputs()).to.equal([])
    })

    test('should handle pages with undefined components', () => {
      const data = new Data({
        pages: [{ }]
      })
      expect(data.allInputs()).to.equal([])
    })

    test('should handle pages with no components', () => {
      const data = new Data({
        pages: [{ components: [] }]
      })
      expect(data.allInputs()).to.equal([])
    })
  })

  describe('all inputs accessible by', () => {
    test('should return all inputs from the page model when a single route leads to this page', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: [{ path: '/3' }],
            components: [{ name: 'name3' }, { name: 'name4' }]
          },
          {
            name: 'page3',
            path: '/3',
            components: [{ name: 'name5' }, { name: 'name6' }]
          }
        ]
      })
      expect(data.inputsAccessibleAt('/3')).to.equal([
        { name: 'name1', page: { name: 'page1', path: '/1', next: [{ path: '/2' }], section: 'section1' }, propertyPath: 'section1.name1' },
        { name: 'name2', page: { name: 'page1', path: '/1', next: [{ path: '/2' }], section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', path: '/2', next: [{ path: '/3' }], section: 'section1' }, propertyPath: 'section1.name3' },
        { name: 'name4', page: { name: 'page2', path: '/2', next: [{ path: '/3' }], section: 'section1' }, propertyPath: 'section1.name4' },
        { name: 'name5', page: { name: 'page3', path: '/3' }, propertyPath: 'name5' },
        { name: 'name6', page: { name: 'page3', path: '/3' }, propertyPath: 'name6' }
      ])
    })

    test('should include inputs from multiple branches leading to the requested page', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/3' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: [{ path: '/3' }],
            components: [{ name: 'name3' }, { name: 'name4' }]
          },
          {
            name: 'page3',
            path: '/3',
            components: [{ name: 'name5' }, { name: 'name6' }]
          }
        ]
      })

      expect(data.inputsAccessibleAt('/3')).to.equal([
        { name: 'name1', page: { name: 'page1', path: '/1', next: [{ path: '/3' }], section: 'section1' }, propertyPath: 'section1.name1' },
        { name: 'name2', page: { name: 'page1', path: '/1', next: [{ path: '/3' }], section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', path: '/2', next: [{ path: '/3' }], section: 'section1' }, propertyPath: 'section1.name3' },
        { name: 'name4', page: { name: 'page2', path: '/2', next: [{ path: '/3' }], section: 'section1' }, propertyPath: 'section1.name4' },
        { name: 'name5', page: { name: 'page3', path: '/3' }, propertyPath: 'name5' },
        { name: 'name6', page: { name: 'page3', path: '/3' }, propertyPath: 'name6' }
      ])
    })

    test('should ignore inputs from routes that don\'t lead to the requested page', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2' }, { path: '/3' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: [{ path: '/4' }],
            components: [{ name: 'name3' }, { name: 'name4' }]
          },
          {
            name: 'page3',
            path: '/3',
            components: [{ name: 'name5' }, { name: 'name6' }]
          }
        ]
      })

      expect(data.inputsAccessibleAt('/3')).to.equal([
        { name: 'name1', page: { name: 'page1', path: '/1', next: [{ path: '/2' }, { path: '/3' }], section: 'section1' }, propertyPath: 'section1.name1' },
        { name: 'name2', page: { name: 'page1', path: '/1', next: [{ path: '/2' }, { path: '/3' }], section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name5', page: { name: 'page3', path: '/3' }, propertyPath: 'name5' },
        { name: 'name6', page: { name: 'page3', path: '/3' }, propertyPath: 'name6' }
      ])
    })

    test('should ignore unnamed components', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2' }, { path: '/3' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            components: [{ badger: 'name3' }, { name: 'name4' }]
          }
        ]
      })

      expect(data.inputsAccessibleAt('/2')).to.equal([
        { name: 'name1', page: { name: 'page1', path: '/1', next: [{ path: '/2' }, { path: '/3' }], section: 'section1' }, propertyPath: 'section1.name1' },
        { name: 'name2', page: { name: 'page1', path: '/1', next: [{ path: '/2' }, { path: '/3' }], section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name4', page: { name: 'page2', path: '/2', section: 'section1' }, propertyPath: 'section1.name4' }
      ])
    })

    test('should handle no pages', () => {
      const data = new Data({ pages: [] })
      expect(data.inputsAccessibleAt('/1')).to.equal([])
    })

    test('should handle undefined pages', () => {
      const data = new Data({ })
      expect(data.inputsAccessibleAt('/1')).to.equal([])
    })

    test('should handle pages with undefined components', () => {
      const data = new Data({
        pages: [{ path: '/1' }]
      })
      expect(data.inputsAccessibleAt('/1')).to.equal([])
    })

    test('should handle pages with no components', () => {
      const data = new Data({
        pages: [{ path: '/1', components: [] }]
      })
      expect(data.inputsAccessibleAt('/1')).to.equal([])
    })
  })

  describe('list for', () => {
    test('should return the list specified in the provided input if it exists', () => {
      const data = new Data({
        lists: [{ name: 'list1' }, { name: 'list2', badger: 'monkeys' }]
      })
      let returned = data.listFor({ options: { list: 'list2' } })
      expect(returned === data.lists[1]).to.equal(true)
    })

    test('should return undefined if no lists exist', () => {
      const data = new Data({})

      expect(data.listFor({ options: { list: 'list2' } })).to.equal(undefined)
    })

    test('should return undefined if the requested list does not exist', () => {
      const data = new Data({
        lists: [{ name: 'list1' }, { name: 'list2', badger: 'monkeys' }]
      })

      expect(data.listFor({ options: { list: 'list3' } })).to.equal(undefined)
    })

    test('should return undefined if the provided input has no list data', () => {
      const data = new Data({
        lists: [{ name: 'list1' }, { name: 'list2', badger: 'monkeys' }]
      })

      expect(data.listFor({ options: {} })).to.equal(undefined)
    })

    test('should return undefined if the provided input has no options defined', () => {
      const data = new Data({
        lists: [{ name: 'list1' }, { name: 'list2', badger: 'monkeys' }]
      })

      expect(data.listFor({})).to.equal(undefined)
    })

    test('should return yes/no list if the provided input has no options defined but is a YesNoField', () => {
      const data = new Data({
        lists: [{ name: 'list1' }, { name: 'list2', badger: 'monkeys' }]
      })

      expect(data.listFor({ type: 'YesNoField' })).to.equal({
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
      })
    })
  })

  describe('find page', () => {
    test('should return the page with the requested path if it exists', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: [{ path: '/3' }],
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      let returned = data.findPage('/2')
      expect(returned === data.pages[1]).to.equal(true)
    })

    test('should return undefined if the requested page does not exist', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/3' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          }
        ]
      })

      expect(data.findPage('/2')).to.equal(undefined)
    })

    test('should handle no pages', () => {
      const data = new Data({ pages: [] })
      expect(data.findPage('/1')).to.equal(undefined)
    })

    test('should handle undefined pages', () => {
      const data = new Data({ })
      expect(data.findPage('/1')).to.equal(undefined)
    })
  })

  describe('clone', () => {
    test('should deep clone the data class', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: [{ path: '/3' }],
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      const returned = data.clone()
      expect(returned).to.equal(data)
      expect(returned instanceof Data).to.equal(true)
      expect(data === returned).to.equal(false)
    })

    test('save function property should be copied to data instance', () => {
      const sourceData = {
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: [{ path: '/3' }],
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      }
      const save = () => 'badgers'
      sourceData.save = save
      const data = new Data(sourceData)

      expect(data.save).to.equal(save)
      expect(data.save('something')).to.equal('badgers')
    })
  })

  describe('add condition', () => {
    test('should add a condition if none exists with the name', () => {
      const data = new Data({
        conditions: []
      })
      data.addCondition('some name', 'a condition')
      expect(data.getConditions()).to.equal([{ name: 'some name', value: 'a condition' }])
    })

    test('should create conditions in data model if they don\'t exist', () => {
      const data = new Data({

      })
      data.addCondition('some name', 'a condition')
      expect(data.getConditions()).to.equal([{ name: 'some name', value: 'a condition' }])
    })

    test('should throw error if a condition with the specified name exists', () => {
      const data = new Data({
        conditions: []
      })
      data.addCondition('some name', 'a condition')
      expect(() => data.addCondition('some name', 'awe shucks')).to.throw(Error)
    })
  })

  describe('has conditions', () => {
    test('should return true if there is at least one condition', () => {
      const data = new Data({
      })
      data.addCondition('some name', 'a condition')
      expect(data.hasConditions).to.equal(true)
    })

    test('should return false if no conditions array exists', () => {
      const data = new Data({

      })
      expect(data.hasConditions).to.equal(false)
    })

    test('should return false if there are no conditions', () => {
      const data = new Data({
        conditions: []
      })
      expect(data.hasConditions).to.equal(false)
    })
  })

  describe('get conditions', () => {
    test('should return a clone of the conditions list', () => {
      const data = new Data({
        conditions: [{ name: 'some name', value: 'a condition' }]
      })
      let returned = data.getConditions()
      expect(returned === data.getConditions()).to.equal(false)
      expect(returned).to.equal(data.getConditions())
      returned[0].name = 'badger'
      expect(data.getConditions()[0].name).to.equal('some name')
    })

    test('should return empty if no conditions array exists', () => {
      const data = new Data({

      })
      expect(data.getConditions()).to.equal([])
    })

    test('should return empty if there are no conditions', () => {
      const data = new Data({
        conditions: []
      })
      expect(data.getConditions()).to.equal([])
    })
  })
})

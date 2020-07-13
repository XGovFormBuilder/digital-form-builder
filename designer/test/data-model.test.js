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

    test('should include hidden inputs from appropriate lists', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            components: [{ name: 'name1', options: { list: 'badgerList' } }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ],
        lists: [
          {
            name: 'anotherList',
            title: 'Address Yes/No',
            type: 'string',
            items: [{
              text: 'Yes',
              value: 'true',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'type': 'TextField',
                    'name': 'buildingNameOrNumber',
                    'title': 'Building name or number',
                    'hint': '',
                    'schema': {}
                  }
                ]
              }
            }]
          },
          {
            name: 'badgerList',
            title: 'Badgers are epic',
            type: 'string',
            items: [{
              text: 'Something',
              value: 'something',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'name': 'myField'
                  }
                ]
              }
            }]
          }
        ]
      })
      expect(data.allInputs()).to.equal([
        { name: 'name1', page: { name: 'page1', section: 'section1' }, options: { list: 'badgerList' }, propertyPath: 'section1.name1' },
        { name: 'myField', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.myField' },
        { name: 'name2', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name3' },
        { name: 'name4', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name4' }
      ])
    })

    test('should not duplicate hidden inputs from lists if more than one component in the same page uses the same list', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            components: [{ name: 'name1', options: { list: 'badgerList' } }, { name: 'name2', options: { list: 'badgerList' } }]
          },
          {
            name: 'page2',
            section: 'section1',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ],
        lists: [
          {
            name: 'anotherList',
            title: 'Address Yes/No',
            type: 'string',
            items: [{
              text: 'Yes',
              value: 'true',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'type': 'TextField',
                    'name': 'buildingNameOrNumber',
                    'title': 'Building name or number',
                    'hint': '',
                    'schema': {}
                  }
                ]
              }
            }]
          },
          {
            name: 'badgerList',
            title: 'Badgers are epic',
            type: 'string',
            items: [{
              text: 'Something',
              value: 'something',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'name': 'myField'
                  }
                ]
              }
            }]
          }
        ]
      })
      expect(data.allInputs()).to.equal([
        { name: 'name1', page: { name: 'page1', section: 'section1' }, options: { list: 'badgerList' }, propertyPath: 'section1.name1' },
        { name: 'myField', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.myField' },
        { name: 'name2', page: { name: 'page1', section: 'section1' }, options: { list: 'badgerList' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name3' },
        { name: 'name4', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name4' }
      ])
    })

    test('should not duplicate hidden inputs from lists if components in different pages with the same section use the same list', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            components: [{ name: 'name1', options: { list: 'badgerList' } }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            components: [{ name: 'name3', options: { list: 'badgerList' } }, { name: 'name4' }]
          }
        ],
        lists: [
          {
            name: 'anotherList',
            title: 'Address Yes/No',
            type: 'string',
            items: [{
              text: 'Yes',
              value: 'true',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'type': 'TextField',
                    'name': 'buildingNameOrNumber',
                    'title': 'Building name or number',
                    'hint': '',
                    'schema': {}
                  }
                ]
              }
            }]
          },
          {
            name: 'badgerList',
            title: 'Badgers are epic',
            type: 'string',
            items: [{
              text: 'Something',
              value: 'something',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'name': 'myField'
                  }
                ]
              }
            }]
          }
        ]
      })
      expect(data.allInputs()).to.equal([
        { name: 'name1', page: { name: 'page1', section: 'section1' }, options: { list: 'badgerList' }, propertyPath: 'section1.name1' },
        { name: 'myField', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.myField' },
        { name: 'name2', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', section: 'section1' }, options: { list: 'badgerList' }, propertyPath: 'section1.name3' },
        { name: 'name4', page: { name: 'page2', section: 'section1' }, propertyPath: 'section1.name4' }
      ])
    })

    test('should return multiple of the same hidden input from lists if components in different pages with different sections use the same list', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            components: [{ name: 'name1', options: { list: 'badgerList' } }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section2',
            components: [{ name: 'name3', options: { list: 'badgerList' } }, { name: 'name4' }]
          }
        ],
        lists: [
          {
            name: 'anotherList',
            title: 'Address Yes/No',
            type: 'string',
            items: [{
              text: 'Yes',
              value: 'true',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'type': 'TextField',
                    'name': 'buildingNameOrNumber',
                    'title': 'Building name or number',
                    'hint': '',
                    'schema': {}
                  }
                ]
              }
            }]
          },
          {
            name: 'badgerList',
            title: 'Badgers are epic',
            type: 'string',
            items: [{
              text: 'Something',
              value: 'something',
              description: '',
              condition: '',
              conditional: {
                components: [
                  {
                    'name': 'myField'
                  }
                ]
              }
            }]
          }
        ]
      })
      expect(data.allInputs()).to.equal([
        { name: 'name1', page: { name: 'page1', section: 'section1' }, options: { list: 'badgerList' }, propertyPath: 'section1.name1' },
        { name: 'myField', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.myField' },
        { name: 'name2', page: { name: 'page1', section: 'section1' }, propertyPath: 'section1.name2' },
        { name: 'name3', page: { name: 'page2', section: 'section2' }, options: { list: 'badgerList' }, propertyPath: 'section2.name3' },
        { name: 'myField', page: { name: 'page2', section: 'section2' }, propertyPath: 'section2.myField' },
        { name: 'name4', page: { name: 'page2', section: 'section2' }, propertyPath: 'section2.name4' }
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

  describe('add link', () => {
    test('should add a link to the next page with no condition', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      const returned = data.addLink('/1', '/2')
      expect(returned.findPage(('/1'))).to.equal({
        name: 'page1',
        section: 'section1',
        path: '/1',
        next: [{ path: '/2' }],
        components: [{ name: 'name1' }, { name: 'name2' }]
      })
      expect(returned.findPage(('/2'))).to.equal({
        name: 'page2',
        section: 'section1',
        path: '/2',
        components: [{ name: 'name3' }, { name: 'name4' }]
      })
    })

    test('should add a link to the next page with a condition', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ],
        conditions: [
          { name: 'condition1' }
        ]
      })

      const returned = data.addLink('/1', '/2', 'condition1')

      expect(returned.findPage(('/1'))).to.equal({
        name: 'page1',
        section: 'section1',
        path: '/1',
        next: [{ path: '/2', condition: 'condition1' }],
        components: [{ name: 'name1' }, { name: 'name2' }]
      })
      expect(returned.findPage(('/2'))).to.equal({
        name: 'page2',
        section: 'section1',
        path: '/2',
        components: [{ name: 'name3' }, { name: 'name4' }]
      })
    })
  })

  describe('update link', () => {
    test('should remove a condition from a link to the next page', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2', condition: 'badgers' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      const returned = data.updateLink('/1', '/2')
      expect(returned.findPage(('/1'))).to.equal({
        name: 'page1',
        section: 'section1',
        path: '/1',
        next: [{ path: '/2' }],
        components: [{ name: 'name1' }, { name: 'name2' }]
      })
      expect(returned.findPage(('/2'))).to.equal({
        name: 'page2',
        section: 'section1',
        path: '/2',
        components: [{ name: 'name3' }, { name: 'name4' }]
      })
    })

    test('should add a condition to a link to the next page', () => {
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
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ],
        conditions: [
          { name: 'condition1' }
        ]
      })

      const returned = data.updateLink('/1', '/2', 'condition1')

      expect(returned.findPage(('/1'))).to.equal({
        name: 'page1',
        section: 'section1',
        path: '/1',
        next: [{ path: '/2', condition: 'condition1' }],
        components: [{ name: 'name1' }, { name: 'name2' }]
      })
      expect(returned.findPage(('/2'))).to.equal({
        name: 'page2',
        section: 'section1',
        path: '/2',
        components: [{ name: 'name3' }, { name: 'name4' }]
      })
    })

    test('should replace a condition on a link', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: [{ path: '/2', condition: 'badgers' }],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ],
        conditions: [
          { name: 'condition1' }
        ]
      })

      const returned = data.updateLink('/1', '/2', 'condition1')

      expect(returned.findPage(('/1'))).to.equal({
        name: 'page1',
        section: 'section1',
        path: '/1',
        next: [{ path: '/2', condition: 'condition1' }],
        components: [{ name: 'name1' }, { name: 'name2' }]
      })
      expect(returned.findPage(('/2'))).to.equal({
        name: 'page2',
        section: 'section1',
        path: '/2',
        components: [{ name: 'name3' }, { name: 'name4' }]
      })
    })

    test('should do nothing if the specified link does not exist', () => {
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
            components: [{ name: 'name3' }, { name: 'name4' }]
          },
          {
            name: 'page3',
            section: 'section1',
            path: '/3',
            components: [{ name: 'name5' }, { name: 'name6' }]
          }
        ],
        conditions: [
          { name: 'condition1' }
        ]
      })

      const returned = data.updateLink('/1', '/3', 'condition1')

      expect(returned.findPage(('/1'))).to.equal({
        name: 'page1',
        section: 'section1',
        path: '/1',
        next: [{ path: '/2' }],
        components: [{ name: 'name1' }, { name: 'name2' }]
      })
      expect(returned.findPage(('/2'))).to.equal({
        name: 'page2',
        section: 'section1',
        path: '/2',
        components: [{ name: 'name3' }, { name: 'name4' }]
      })
      expect(returned.findPage(('/3'))).to.equal({
        name: 'page3',
        section: 'section1',
        path: '/3',
        components: [{ name: 'name5' }, { name: 'name6' }]
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

  describe('add page', () => {
    test('should add the page', () => {
      const data = new Data({
        pages: []
      })
      const page = {
        name: 'page2',
        section: 'section1',
        path: '/2',
        next: [{ path: '/3' }],
        components: [{ name: 'name3' }, { name: 'name4' }]
      }
      data.addPage(page)
      expect(data.findPage('/2')).to.equal(page)
    })

    test('should add the page if no pages collection is defined', () => {
      const data = new Data({
      })
      const page = {
        name: 'page2',
        section: 'section1',
        path: '/2',
        next: [{ path: '/3' }],
        components: [{ name: 'name3' }, { name: 'name4' }]
      }
      data.addPage(page)
      expect(data.findPage('/2')).to.equal(page)
    })
  })

  describe('get pages', () => {
    test('should return the pages if they exist', () => {
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
      let returned = data.getPages()
      expect(returned === data.pages).to.equal(true)
    })

    test('should return empty array if undefined', () => {
      const data = new Data({})

      expect(data.getPages()).to.equal([])
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
        ],
        conditions: [{ name: 'badger', displayName: 'Badgers', value: 'badger == true' }]
      })
      const returned = data.clone()
      expect(returned).to.equal(data)
      expect(returned.conditions).to.equal(data.conditions)
      expect(returned instanceof Data).to.equal(true)
      expect(data === returned).to.equal(false)
    })

    test('random function property should be copied to data instance', () => {
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

    test('random function property should be copied on clone', () => {
      const sourceData = new Data({
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
      const save = () => 'badgers'
      sourceData.save = save
      const data = sourceData.clone()

      expect(data.save).to.equal(save)
      expect(data.save('something')).to.equal('badgers')
    })
  })

  describe('add condition', () => {
    test('should add a condition if none exists with the name', () => {
      const data = new Data({
        conditions: []
      })
      data.addCondition('someName', 'My name', 'a condition')
      expect(data.conditions).to.equal([{ name: 'someName', displayName: 'My name', value: 'a condition' }])
    })

    test('should create conditions in data model if they don\'t exist', () => {
      const data = new Data({

      })
      data.addCondition('someName', 'My name', 'a condition')
      expect(data.conditions).to.equal([{ name: 'someName', displayName: 'My name', value: 'a condition' }])
    })

    test('should throw error if a condition with the specified name exists', () => {
      const data = new Data({
        conditions: []
      })
      data.addCondition('someName', 'My name', 'a condition')
      expect(() => data.addCondition('someName', 'another name', 'awe shucks')).to.throw(Error)
    })
  })

  describe('has conditions', () => {
    test('should return true if there is at least one condition', () => {
      const data = new Data({
      })
      data.addCondition('someName', 'My name', 'a condition')
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
        conditions: [{ name: 'some name', displayName: 'My name', value: 'a condition' }]
      })
      let returned = data.conditions
      expect(returned === data.conditions).to.equal(false)
      expect(returned).to.equal(data.conditions)
      returned[0].name = 'badger'
      expect(data.conditions[0].name).to.equal('some name')
      expect(data.conditions[0].displayName).to.equal('My name')
    })

    test('should return empty if no conditions array exists', () => {
      const data = new Data({

      })
      expect(data.conditions).to.equal([])
    })

    test('should return empty if there are no conditions', () => {
      const data = new Data({
        conditions: []
      })
      expect(data.conditions).to.equal([])
    })
  })

  describe('find condition', () => {
    test('should find a condition if oone exists with the provided name', () => {
      const data = new Data({
        conditions: [{ name: 'someName' }]
      })
      expect(data.findCondition('someName')).to.equal({ name: 'someName', displayName: 'someName' })
    })

    test('should return undefined if there is no condition with the specified name', () => {
      const data = new Data({
        conditions: [{ name: 'anotherName' }]
      })
      expect(data.findCondition('someName')).to.equal(undefined)
    })

    test('should return undefined if conditions is undefined', () => {
      const data = new Data({
      })
      expect(data.findCondition('someName')).to.equal(undefined)
    })
  })

  describe('update condition', () => {
    test('should update a condition if one exists with the provided name', () => {
      const data = new Data({
        conditions: [{ name: 'someName' }]
      })
      data.updateCondition('someName', 'My condition', 'badgers == monkeys')
      expect(data.findCondition('someName')).to.equal({ name: 'someName', displayName: 'My condition', value: 'badgers == monkeys' })
    })

    test('should do nothing if there is no condition with the specified name', () => {
      const data = new Data({
        conditions: [{ name: 'anotherName' }]
      })
      data.updateCondition('someName', 'My condition', 'Some value')
      expect(data.conditions).to.equal([{ name: 'anotherName', displayName: 'anotherName' }])
    })

    test('should do nothing if conditions is undefined', () => {
      const data = new Data({
      })
      data.updateCondition('someName', 'My condition', 'Some value')
      expect(data.conditions).to.equal([])
    })
  })

  describe('remove condition', () => {
    test('should remove a condition if one exists with the provided name', () => {
      const data = new Data({
        conditions: [{ name: 'someName' }]
      })
      data.removeCondition('someName')
      expect(data.conditions).to.equal([])
    })

    test('should remove references to the removed condition if used in page links', () => {
      const data = new Data({
        pages: [{ path: '/' }, { path: '/badgers', next: [{ path: '/summary' }, { path: '/disaster', if: 'someName' }] }],
        conditions: [{ name: 'someName' }]
      })
      data.removeCondition('someName')
      expect(data.findPage('/')).to.equal({ path: '/' })
      expect(data.findPage('/badgers')).to.equal({ path: '/badgers', next: [{ path: '/summary' }, { path: '/disaster' }] })
    })

    test('should do nothing if there is no condition with the specified name', () => {
      const data = new Data({
        conditions: [{ name: 'anotherName' }]
      })
      data.removeCondition('someName')
      expect(data.conditions).to.equal([{ name: 'anotherName', displayName: 'anotherName' }])
    })

    test('should do nothing if conditions is undefined', () => {
      const data = new Data({
      })
      data.removeCondition('someName')
      expect(data.conditions).to.equal([])
    })
  })

  describe('toJSON', () => {
    test('should expose the conditions field', () => {
      const rawData = {
        conditions: [{ displayName: 'a Monkey', name: 'someName' }]
      }
      const data = new Data(rawData)
      expect(data.toJSON()).to.equal(rawData)
    })

    test('should expose the pages field', () => {
      const rawData = {
        pages: [{ name: 'someName' }]
      }
      const data = new Data(rawData)
      expect(data.toJSON()).to.equal({
        pages: [{ name: 'someName' }],
        conditions: []
      })
    })

    test('should not expose a random function', () => {
      const rawData = {
        save: () => 'Badgers'
      }
      const data = new Data(rawData)
      expect(data.toJSON()).to.equal({
        conditions: []
      })
    })
  })
})

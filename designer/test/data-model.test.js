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
        { name: 'name1', page: { name: 'page1', section: 'section1' } },
        { name: 'name2', page: { name: 'page1', section: 'section1' } },
        { name: 'name3', page: { name: 'page2', section: 'section1' } },
        { name: 'name4', page: { name: 'page2', section: 'section1' } }
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
        { name: 'name1', page: { name: 'page1', section: 'section1' } },
        { name: 'name2', page: { name: 'page1', section: 'section1' } },
        { name: 'name4', page: { name: 'page2', section: 'section1' } }
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

  describe('find page', () => {
    test('should return the page with the requested path if it exists', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: ['/2'],
            components: [{ name: 'name1' }, { name: 'name2' }]
          },
          {
            name: 'page2',
            section: 'section1',
            path: '/2',
            next: ['/3'],
            components: [{ name: 'name3' }, { name: 'name4' }]
          }
        ]
      })
      expect(data.findPage('/2')).to.equal(data.pages[1])
    })

    test('should return undefined if the requested page does not exist', () => {
      const data = new Data({
        pages: [
          {
            name: 'page1',
            section: 'section1',
            path: '/1',
            next: ['/3'],
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
})

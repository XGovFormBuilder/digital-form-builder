import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'

import { RelativeUrl } from '..'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, describe, test } = lab

suite('relative url', () => {
  describe('constructor', () => {
    test('should throw error if the provided url is not relative', () => {
      expect(() => new RelativeUrl('http://www.badgers.com')).to.throw(Error)
    })

    test('should throw error if the provided url is not relative when using the internal cheat url', () => {
      expect(() => new RelativeUrl('http://www.example.com')).to.throw(Error)
    })

    test('should not throw an error when using a relative url', () => {
      const underTest = new RelativeUrl('bob')
      expect(underTest.toString()).to.equal('bob')
    })

    test('should not throw an error when using a relative url with a leading /', () => {
      const underTest = new RelativeUrl('/bob')
      expect(underTest.toString()).to.equal('/bob')
    })
  })

  describe('addParam', () => {
    test('should add a first param', () => {
      const underTest = new RelativeUrl('bob')
      underTest.addParam('myParam', 'myBadger')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger')
    })

    test('should add a second param', () => {
      const underTest = new RelativeUrl('bob')
      underTest.addParam('myParam', 'myBadger')
      underTest.addParam('myParam2', 'myBadger2')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger&myParam2=myBadger2')
    })

    test('should add a second param to an existing query string', () => {
      const underTest = new RelativeUrl('bob?myParam=myBadger')
      underTest.addParam('myParam2', 'myBadger2')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger&myParam2=myBadger2')
    })

    test('should overwrite param of the same name', () => {
      const underTest = new RelativeUrl('bob?myParam=myBadger')
      underTest.addParam('myParam', 'myBadger2')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger2')
    })
  })

  describe('addParamIfNotPresent', () => {
    test('should add a first param', () => {
      const underTest = new RelativeUrl('bob')
      underTest.addParamIfNotPresent('myParam', 'myBadger')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger')
    })

    test('should add a second param', () => {
      const underTest = new RelativeUrl('bob')
      underTest.addParamIfNotPresent('myParam', 'myBadger')
      underTest.addParamIfNotPresent('myParam2', 'myBadger2')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger&myParam2=myBadger2')
    })

    test('should add a second param to an existing query string', () => {
      const underTest = new RelativeUrl('bob?myParam=myBadger')
      underTest.addParamIfNotPresent('myParam2', 'myBadger2')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger&myParam2=myBadger2')
    })

    test('should not overwrite param of the same name', () => {
      const underTest = new RelativeUrl('bob?myParam=myBadger')
      underTest.addParamIfNotPresent('myParam', 'myBadger2')
      expect(underTest.toString()).to.equal('bob?myParam=myBadger')
    })
  })

  describe('setFeedbackReturnInfo', () => {
    test('should set feedback param', () => {
      const underTest = new RelativeUrl('bob')
      underTest.setFeedbackReturnInfo('myBadger2')
      expect(underTest.toString()).to.equal('bob?f_t=myBadger2')
    })

    test('should overwrite param on subsequent call', () => {
      const underTest = new RelativeUrl('bob')
      underTest.setFeedbackReturnInfo('myBadger')
      underTest.setFeedbackReturnInfo('myBadger2')
      expect(underTest.toString()).to.equal('bob?f_t=myBadger2')
    })
  })

  describe('getFeedbackReturnInfo', () => {
    test('should get feedback param', () => {
      const underTest = new RelativeUrl('bob?f_t=myBadger2')
      expect(underTest.getFeedbackReturnInfo()).to.equal('myBadger2')
    })

    test('should return null if no feedback return info', () => {
      const underTest = new RelativeUrl('bob')
      expect(underTest.getFeedbackReturnInfo()).to.equal(null)
    })
  })

  describe('getParam', () => {
    test('should get a param', () => {
      const underTest = new RelativeUrl('bob?myParam=myBadger')
      expect(underTest.getParam('myParam')).to.equal('myBadger')
    })

    test('should return null if the param does not exist', () => {
      const underTest = new RelativeUrl('bob')
      expect(underTest.getParam('myParam')).to.equal(null)
    })
  })
})

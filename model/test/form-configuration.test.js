import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'

import { FormConfiguration } from '..'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test } = lab

suite('Form configuration', () => {
  test('should return provided items if provided', () => {
    const underTest = new FormConfiguration('My Key', 'Display name', 'Last modified')
    expect(underTest.Key).to.equal('My Key')
    expect(underTest.DisplayName).to.equal('Display name')
    expect(underTest.LastModified).to.equal('Last modified')
  })

  test('should default Display name to key', () => {
    const underTest = new FormConfiguration('My Key')
    expect(underTest.DisplayName).to.equal('My Key')
  })

  test('should keep LastModified as undefined when not specified', () => {
    const underTest = new FormConfiguration('My Key')
    expect(underTest.LastModified).to.equal(undefined)
  })

  test('should bork if no key provided', () => {
    expect(() => new FormConfiguration()).to.throw(Error)
  })
})

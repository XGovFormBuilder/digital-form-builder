import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { after, before, describe, it, suite, test } = lab

suite('test', () => {
  test('passing test', () => {
    expect(1).to.equal(1)
  })
})

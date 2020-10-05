import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { FeedbackContextInfo, decode } from '../../src/feedback'
const lab = Lab.script()
exports.lab = lab
const { expect } = Code
const { suite, test } = lab

suite('Feedback context info', () => {
  test('Should be able to be serialised and deserialised', () => {
    const original = new FeedbackContextInfo('My form', 'My page', '/badger')

    expect(decode(original.toString())).to.equal(original)
  })

  test('toString should be url friendly', () => {
    const original = new FeedbackContextInfo('My form', 'My page', '/badger')

    expect(/^[A-Za-z0-9+/=]*$/.test(original.toString())).to.equal(true)
  })
})

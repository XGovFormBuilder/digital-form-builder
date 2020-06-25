import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import sinon from 'sinon'
import InlineConditionHelpers from '../client/conditions/inline-condition-helpers'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test } = lab

suite('Inline condition helpers', () => {
  let data

  beforeEach(() => {
    data = {
      getId: sinon.stub(),
      addCondition: sinon.stub()
    }
  })

  test('should save conditions if provided', async () => {
    data.getId.resolves('abcdef')
    const amendedData = sinon.stub()
    data.addCondition.returns(amendedData)
    const conditions = {
      name: 'My condition',
      toExpression: () => 'my expression'
    }
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(data, 'my-monkey', conditions)

    expect(data.getId.calledOnce).to.equal(true)
    expect(data.addCondition.calledOnce).to.equal(true)
    expect(data.addCondition.firstCall.args[0]).to.equal('abcdef')
    expect(data.addCondition.firstCall.args[1]).to.equal('My condition')
    expect(data.addCondition.firstCall.args[2]).to.equal('my expression')
    expect(returned).to.equal({ data: amendedData, condition: 'abcdef' })
  })

  test('should return selected condition if provided and no conditions provided', async () => {
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(data, 'abcdef', undefined)

    expect(data.getId.called).to.equal(false)
    expect(data.addCondition.called).to.equal(false)
    expect(returned).to.equal({ data: data, condition: 'abcdef' })
  })

  test('should return undefined condition if nothing provided', async () => {
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(data, undefined, undefined)

    expect(data.getId.called).to.equal(false)
    expect(data.addCondition.called).to.equal(false)
    expect(returned).to.equal({ data: data, condition: undefined })
  })
})

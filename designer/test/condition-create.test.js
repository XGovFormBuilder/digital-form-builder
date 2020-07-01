import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import ConditionCreate from '../client/condition-create'
import { Data } from '../client/model/data-model'
import sinon from 'sinon'
import InlineConditionHelpers from '../client/conditions/inline-condition-helpers'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, describe, afterEach, beforeEach } = lab

suite('Condition create', () => {
  const data = new Data({})
  const nextId = 'abcdef'
  data.getId = sinon.stub()
  data.getId.resolves(nextId)

  test('Renders a form with inline conditions node', () => {
    const wrapper = shallow(<ConditionCreate data={data} />)
    const form = wrapper.find('form')

    const inlineConditions = form.find('InlineConditions')
    expect(inlineConditions.prop('data')).to.equal(data)
    expect(inlineConditions.prop('conditionsChange')).to.equal(wrapper.instance().saveConditions)
    expect(Object.keys(inlineConditions.props()).includes('hideAddLink')).to.equal(true)
    expect(Object.keys(inlineConditions.props()).length).to.equal(3)
  })
  describe('submitting the form', () => {
    let storeConditionStub

    beforeEach(function () {
      storeConditionStub = sinon.stub(InlineConditionHelpers, 'storeConditionIfNecessary')
    })

    afterEach(function () {
      storeConditionStub.restore()
    })

    test('creates a condition and calls back', async flags => {
      const clonedData = sinon.spy()
      const updatedData = sinon.spy()
      const savedData = sinon.spy()
      const onCreate = data => {
        expect(data.data).to.equal(savedData)
      }
      const save = data => {
        expect(data).to.equal(updatedData)
        return Promise.resolve(savedData)
      }
      // const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<ConditionCreate data={data} onCreate={onCreate} />)
      const preventDefault = sinon.spy()
      const conditions = {}
      wrapper.instance().saveConditions(conditions)
      storeConditionStub.resolves({ data: updatedData, condition: 'myBadger' })

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      data.save = flags.mustCall(save, 1)

      await wrapper.simulate('submit', { preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)
      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(undefined)
      expect(storeConditionStub.firstCall.args[2]).to.equal(conditions)
    })
  })

  test('Cancelling the form calls the onCancel callback', async flags => {
    const event = { target: {} }
    const onCancel = e => {
      expect(e).to.equal(event)
    }
    const wrappedOnCancel = flags.mustCall(onCancel, 1)
    const wrapper = shallow(<ConditionCreate data={data} onCancel={wrappedOnCancel} />)
    const form = wrapper.find('form')
    const backLink = form.find('a.govuk-back-link')
    await backLink.simulate('click', event)
  })
})

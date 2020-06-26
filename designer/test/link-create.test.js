import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import LinkCreate from '../client/link-create'
import { Data } from '../client/model/data-model'
import sinon from 'sinon'
import { assertSelectInput } from './helpers/element-assertions'
import InlineConditionHelpers from '../client/conditions/inline-condition-helpers'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, describe, beforeEach, afterEach } = lab

suite('Link create', () => {
  const data = new Data({
    pages: [
      { path: '/1', title: 'Page 1' },
      { path: '/2', title: 'Page 2' }
    ],
    conditions: [
      { name: 'someCondition', displayName: 'My condition' },
      { name: 'anotherCondition', displayName: 'Another condition' }
    ]
  })
  const nextId = 'abcdef'
  data.getId = sinon.stub()
  data.getId.resolves(nextId)

  test('Renders a form with from and to inputs', () => {
    const wrapper = shallow(<LinkCreate data={data} />)
    const form = wrapper.find('form')

    assertSelectInput(form.find('#link-source'), 'link-source', [
      { text: '' },
      { value: '/1', text: 'Page 1' },
      { value: '/2', text: 'Page 2' }
    ])

    assertSelectInput(form.find('#link-target'), 'link-target', [
      { text: '' },
      { value: '/1', text: 'Page 1' },
      { value: '/2', text: 'Page 2' }
    ])

    expect(wrapper.find('InlineConditions').exists()).to.equal(false)
  })

  test('Selecting a from value causes the InlineConditions component to be displayed', async () => {
    const wrapper = shallow(<LinkCreate data={data} />)
    const form = wrapper.find('form')

    await form.find('#link-source').simulate('change', { target: { value: '/1' } })
    const inlineConditions = wrapper.find('InlineConditions')
    expect(inlineConditions.exists()).to.equal(true)
    expect(inlineConditions.prop('data')).to.equal(data)
    expect(inlineConditions.prop('path')).to.equal('/1')
    expect(inlineConditions.prop('conditionsChange')).to.equal(wrapper.instance().saveConditions)
  })

  describe('submitting the form', () => {
    let storeConditionStub

    beforeEach(function () {
      storeConditionStub = sinon.stub(InlineConditionHelpers, 'storeConditionIfNecessary')
    })

    afterEach(function () {
      storeConditionStub.restore()
    })

    test('with a condition creates a link and calls back', async flags => {
      const clonedData = {
        addLink: sinon.stub()
      }
      const updatedData = sinon.spy()
      const savedData = sinon.spy()
      const onCreate = data => {
        expect(data.data).to.equal(savedData)
      }
      const save = data => {
        expect(data).to.equal(updatedData)
        return Promise.resolve(savedData)
      }
      const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<LinkCreate data={data} onCreate={wrappedOnCreate} />)
      const form = wrapper.find('form')
      form.find('#link-source').simulate('change', { target: { value: '/1' } })
      form.find('#link-target').simulate('change', { target: { value: '/2' } })
      const conditions = {}
      const selectedCondition = {}
      wrapper.instance().saveConditions(conditions, selectedCondition)

      storeConditionStub.resolves({ data: clonedData, condition: 'aCondition' })

      const preventDefault = sinon.spy()

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      data.save = flags.mustCall(save, 1)
      clonedData.addLink.returns(updatedData)

      await wrapper.simulate('submit', { preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)
      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(selectedCondition)
      expect(storeConditionStub.firstCall.args[2]).to.equal(conditions)

      expect(clonedData.addLink.calledOnce).to.equal(true)
      expect(clonedData.addLink.firstCall.args[0]).to.equal('/1')
      expect(clonedData.addLink.firstCall.args[1]).to.equal('/2')
      expect(clonedData.addLink.firstCall.args[2]).to.equal('aCondition')
    })

    test('with no condition creates a link and calls back', async flags => {
      const clonedData = {
        addLink: sinon.stub()
      }
      const updatedData = sinon.spy()
      const savedData = sinon.spy()
      const onCreate = data => {
        expect(data.data).to.equal(savedData)
      }
      const save = data => {
        expect(data).to.equal(updatedData)
        return Promise.resolve(savedData)
      }
      const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<LinkCreate data={data} onCreate={wrappedOnCreate} />)
      const form = wrapper.find('form')
      await form.find('#link-source').simulate('change', { target: { value: '/1' } })
      await form.find('#link-target').simulate('change', { target: { value: '/2' } })

      storeConditionStub.resolves({ data: clonedData, condition: 'aCondition' })

      const preventDefault = sinon.spy()

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      data.save = flags.mustCall(save, 1)
      clonedData.addLink.returns(updatedData)

      await wrapper.simulate('submit', { preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)
      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(undefined)
      expect(storeConditionStub.firstCall.args[2]).to.equal(undefined)

      expect(clonedData.addLink.calledOnce).to.equal(true)
      expect(clonedData.addLink.firstCall.args[0]).to.equal('/1')
      expect(clonedData.addLink.firstCall.args[1]).to.equal('/2')
      expect(clonedData.addLink.firstCall.args[2]).to.equal('aCondition')
    })
  })
})

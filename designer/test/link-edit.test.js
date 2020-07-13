import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Data } from '../client/model/data-model'
import sinon from 'sinon'
import { assertSelectInput } from './helpers/element-assertions'
import InlineConditionHelpers from '../client/conditions/inline-condition-helpers'
import LinkEdit from '../client/link-edit'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, describe, beforeEach, afterEach } = lab

suite('Link edit', () => {
  describe('Editing a link which does not have a condition', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'Page 1', next: [ { path: '/2' } ] },
        { path: '/2', title: 'Page 2' }
      ],
      conditions: [
        { name: 'someCondition', displayName: 'My condition' },
        { name: 'anotherCondition', displayName: 'Another condition' }
      ]
    })
    const edge = {
      source: '/1',
      target: '/2'
    }

    test('Renders a form with expected inputs', () => {
      const wrapper = shallow(<LinkEdit data={data} edge={edge} />)
      const form = wrapper.find('form')

      const fromInput = form.find('#link-source')
      assertSelectInput(fromInput, 'link-source', [
        { text: '' },
        { value: '/1', text: 'Page 1' },
        { value: '/2', text: 'Page 2' }
      ], '/1')
      expect(fromInput.prop('disabled')).to.equal(true)

      const toInput = form.find('#link-target')
      assertSelectInput(toInput, 'link-target', [
        { text: '' },
        { value: '/1', text: 'Page 1' },
        { value: '/2', text: 'Page 2' }
      ], '/2')
      expect(toInput.prop('disabled')).to.equal(true)

      const selectConditions = wrapper.find('SelectConditions')
      expect(selectConditions.exists()).to.equal(true)
      expect(selectConditions.prop('data')).to.equal(data)
      expect(selectConditions.prop('path')).to.equal('/1')
      expect(selectConditions.prop('selectedCondition')).to.equal(undefined)
      expect(selectConditions.prop('conditionsChange')).to.equal(wrapper.instance().saveConditions)
    })
  })

  describe('Editing a link which has a condition', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'Page 1', next: [ { path: '/2', condition: 'anotherCondition' } ] },
        { path: '/2', title: 'Page 2' }
      ],
      conditions: [
        { name: 'someCondition', displayName: 'My condition' },
        { name: 'anotherCondition', displayName: 'Another condition' }
      ]
    })
    const edge = {
      source: '/1',
      target: '/2'
    }

    test('Renders a form with expected inputs', () => {
      const wrapper = shallow(<LinkEdit data={data} edge={edge} />)
      const form = wrapper.find('form')

      const fromInput = form.find('#link-source')
      assertSelectInput(fromInput, 'link-source', [
        { text: '' },
        { value: '/1', text: 'Page 1' },
        { value: '/2', text: 'Page 2' }
      ], '/1')
      expect(fromInput.prop('disabled')).to.equal(true)

      const toInput = form.find('#link-target')
      assertSelectInput(toInput, 'link-target', [
        { text: '' },
        { value: '/1', text: 'Page 1' },
        { value: '/2', text: 'Page 2' }
      ], '/2')
      expect(toInput.prop('disabled')).to.equal(true)

      const selectConditions = wrapper.find('SelectConditions')
      expect(selectConditions.exists()).to.equal(true)
      expect(selectConditions.prop('data')).to.equal(data)
      expect(selectConditions.prop('path')).to.equal('/1')
      expect(selectConditions.prop('selectedCondition')).to.equal('anotherCondition')
      expect(selectConditions.prop('conditionsChange')).to.equal(wrapper.instance().saveConditions)
    })
  })

  describe('submitting the form', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'Page 1', next: [ { path: '/2' } ] },
        { path: '/2', title: 'Page 2' }
      ],
      conditions: [
        { name: 'someCondition', displayName: 'My condition' },
        { name: 'anotherCondition', displayName: 'Another condition' }
      ]
    })
    const edge = {
      source: '/1',
      target: '/2'
    }
    let storeConditionStub

    beforeEach(function () {
      storeConditionStub = sinon.stub(InlineConditionHelpers, 'storeConditionIfNecessary')
    })

    afterEach(function () {
      storeConditionStub.restore()
    })

    test('with a condition updates the link and calls back', async flags => {
      const clonedData = {}
      const withCondition = {
        updateLink: sinon.stub()
      }
      const updatedData = sinon.spy()
      const savedData = sinon.spy()
      const onEdit = data => {
        expect(data.data).to.equal(savedData)
      }
      const save = data => {
        expect(data).to.equal(updatedData)
        return Promise.resolve(savedData)
      }
      // const wrappedOnEdit = flags.mustCall(onEdit, 1)

      const wrapper = shallow(<LinkEdit data={data} edge={edge} onEdit={onEdit} />)
      const conditions = {}
      const selectedCondition = {}
      wrapper.instance().saveConditions(conditions, selectedCondition)

      storeConditionStub.resolves({ data: withCondition, condition: 'aCondition' })

      withCondition.updateLink.returns(updatedData)

      const preventDefault = sinon.spy()

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      data.save = flags.mustCall(save, 1)

      await wrapper.simulate('submit', { preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)
      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(selectedCondition)
      expect(storeConditionStub.firstCall.args[2]).to.equal(conditions)

      expect(withCondition.updateLink.calledOnce).to.equal(true)
      expect(withCondition.updateLink.firstCall.args[0]).to.equal('/1')
      expect(withCondition.updateLink.firstCall.args[1]).to.equal('/2')
      expect(withCondition.updateLink.firstCall.args[2]).to.equal('aCondition')
    })
  })
})

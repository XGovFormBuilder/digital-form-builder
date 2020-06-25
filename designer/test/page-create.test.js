import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import PageCreate from '../client/page-create'
import { Data } from '../client/model/data-model'
import sinon from 'sinon'
import { assertTextInput, assertSelectInput } from './helpers/element-assertions'
import InlineConditionHelpers from '../client/conditions/inline-condition-helpers'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, describe, beforeEach, afterEach } = lab

suite('Page create', () => {
  const data = new Data({
    pages: [
      { path: '/1' },
      { path: '/2' }
    ],
    sections: [
      {
        name: 'badger',
        title: 'Badger'
      },
      {
        name: 'personalDetails',
        title: 'Personal Details'
      }
    ]
  })

  test('Renders a form with the appropriate initial inputs', () => {
    const wrapper = shallow(<PageCreate data={data} />)

    assertSelectInput(wrapper.find('#page-type'), 'page-type', [
      { value: '', text: 'Question Page' },
      { value: './pages/start.js', text: 'Start Page' },
      { value: './pages/summary.js', text: 'Summary Page' }
    ])
    assertTextInput(wrapper.find('#page-title'), 'page-title')
    assertSelectInput(wrapper.find('#link-from'), 'link-from', [
      { text: '' },
      { value: '/1', text: '/1' },
      { value: '/2', text: '/2' }
    ])
    assertSelectInput(wrapper.find('#page-section'), 'page-section', [
      { text: '' },
      { value: 'badger', text: 'Badger' },
      { value: 'personalDetails', text: 'Personal Details' }
    ])
    expect(wrapper.find('InlineConditions').exists()).to.equal(false)
  })

  test('Inputs remain populated when amending other fields', () => {
    const wrapper = shallow(<PageCreate data={data} />)
    wrapper.find('#page-type').simulate('change', { target: { value: './pages/start.js' } })
    wrapper.find('#page-title').simulate('blur', { target: { value: 'New Page' } })
    wrapper.find('#link-from').simulate('change', { target: { value: '/2' } })
    wrapper.find('#page-section').simulate('change', { target: { value: 'personalDetails' } })

    assertTextInput(wrapper.find('#page-title'), 'page-title', 'New Page')
    assertSelectInput(wrapper.find('#link-from'), 'link-from', [
      { text: '' },
      { value: '/1', text: '/1' },
      { value: '/2', text: '/2' }
    ], '/2')
    assertSelectInput(wrapper.find('#page-section'), 'page-section', [
      { text: '' },
      { value: 'badger', text: 'Badger' },
      { value: 'personalDetails', text: 'Personal Details' }
    ], 'personalDetails')
    assertSelectInput(wrapper.find('#page-type'), 'page-type', [
      { value: '', text: 'Question Page' },
      { value: './pages/start.js', text: 'Start Page' },
      { value: './pages/summary.js', text: 'Summary Page' }
    ], './pages/start.js')
    expect(wrapper.find('InlineConditions').exists()).to.equal(true)
  })

  test('Selecting a link from displays the conditions section', () => {
    const wrapper = shallow(<PageCreate data={data} />)
    wrapper.find('#link-from').simulate('change', { target: { value: '/2' } })

    const inlineConditions = wrapper.find('InlineConditions')
    expect(inlineConditions.exists()).to.equal(true)
    expect(inlineConditions.prop('data')).to.equal(data)
    expect(inlineConditions.prop('path')).to.equal('/2')
    expect(inlineConditions.prop('conditionsChange')).to.equal(wrapper.instance().saveConditions)
  })

  describe('Submitting the form', () => {
    let storeConditionStub

    beforeEach(function () {
      storeConditionStub = sinon.stub(InlineConditionHelpers, 'storeConditionIfNecessary')
    })

    afterEach(function () {
      storeConditionStub.restore()
    })

    test('with a selected condition creates a page and calls back', async flags => {
      const expectedPage = {
        path: '/new-page',
        title: 'New Page',
        section: 'personalDetails',
        controller: './pages/start.js',
        next: [],
        components: []
      }
      const onCreate = data => {
        expect(data.value).to.equal(expectedPage)
      }
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub()
      }
      data.save = sinon.stub()
      data.save.resolves(clonedData)
      const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<PageCreate data={data} onCreate={wrappedOnCreate} />)
      const preventDefault = sinon.spy()
      wrapper.find('#page-type').simulate('change', { target: { value: './pages/start.js' } })
      wrapper.find('#page-title').simulate('blur', { target: { value: 'New Page' } })
      wrapper.find('#link-from').simulate('change', { target: { value: '/2' } })
      wrapper.find('#page-section').simulate('change', { target: { value: 'personalDetails' } })

      const selectedCondition = 'condition1'
      storeConditionStub.resolves({ data: clonedData, condition: selectedCondition })
      wrapper.instance().saveConditions(undefined, selectedCondition)

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      clonedData.addLink.returns(clonedData)
      clonedData.addPage.returns(clonedData)

      await wrapper.instance().onSubmit({ preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)
      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(selectedCondition)
      expect(storeConditionStub.firstCall.args[2]).to.equal(undefined)

      expect(clonedData.addLink.calledOnce).to.equal(true)
      expect(clonedData.addLink.firstCall.args[0]).to.equal('/2')
      expect(clonedData.addLink.firstCall.args[1]).to.equal('/new-page')
      expect(clonedData.addLink.firstCall.args[2]).to.equal(selectedCondition)
      expect(clonedData.addPage.calledOnce).to.equal(true)
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage)
    })

    test('with a created inline condition creates a page and calls back', async () => {
      const expectedPage = {
        path: '/new-page',
        title: 'New Page',
        section: 'personalDetails',
        controller: './pages/start.js',
        next: [],
        components: []
      }
      const onCreate = data => {
        expect(data.value).to.equal(expectedPage)
      }
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub()
      }
      const conditionId = 'abcdef'

      data.save = sinon.stub()
      data.save.resolves(clonedData)
      storeConditionStub.resolves({ data: clonedData, condition: conditionId })
      // const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<PageCreate data={data} onCreate={onCreate} />)
      const preventDefault = sinon.spy()
      wrapper.find('#page-type').simulate('change', { target: { value: './pages/start.js' } })
      wrapper.find('#page-title').simulate('blur', { target: { value: 'New Page' } })
      wrapper.find('#link-from').simulate('change', { target: { value: '/2' } })
      wrapper.find('#page-section').simulate('change', { target: { value: 'personalDetails' } })
      let conditions = {
        name: 'My Condition',
        toExpression: () => 'my expression'
      }
      wrapper.instance().saveConditions(conditions, undefined)

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      clonedData.addLink.returns(clonedData)
      clonedData.addPage.returns(clonedData)

      await wrapper.instance().onSubmit({ preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)

      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(undefined)
      expect(storeConditionStub.firstCall.args[2]).to.equal(conditions)
      expect(clonedData.addLink.calledOnce).to.equal(true)
      expect(clonedData.addLink.firstCall.args[0]).to.equal('/2')
      expect(clonedData.addLink.firstCall.args[1]).to.equal('/new-page')
      expect(clonedData.addLink.firstCall.args[2]).to.equal(conditionId)
      expect(clonedData.addPage.calledOnce).to.equal(true)
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage)
    })

    test('with no condition creates a page and calls back', async flags => {
      const expectedPage = {
        path: '/new-page',
        title: 'New Page',
        section: 'personalDetails',
        controller: './pages/start.js',
        next: [],
        components: []
      }
      const onCreate = data => {
        expect(data.value).to.equal(expectedPage)
      }
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub()
      }

      data.save = sinon.stub()
      data.save.resolves(clonedData)
      const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<PageCreate data={data} onCreate={wrappedOnCreate} />)
      const preventDefault = sinon.spy()
      wrapper.find('#page-type').simulate('change', { target: { value: './pages/start.js' } })
      wrapper.find('#page-title').simulate('blur', { target: { value: 'New Page' } })
      wrapper.find('#link-from').simulate('change', { target: { value: '/2' } })
      wrapper.find('#page-section').simulate('change', { target: { value: 'personalDetails' } })

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      clonedData.addLink.returns(clonedData)
      clonedData.addPage.returns(clonedData)
      storeConditionStub.resolves({ data: clonedData })

      await wrapper.instance().onSubmit({ preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)

      expect(storeConditionStub.calledOnce).to.equal(true)
      expect(storeConditionStub.firstCall.args[0]).to.equal(clonedData)
      expect(storeConditionStub.firstCall.args[1]).to.equal(undefined)
      expect(storeConditionStub.firstCall.args[2]).to.equal(undefined)
      expect(clonedData.addLink.calledOnce).to.equal(true)
      expect(clonedData.addLink.firstCall.args[0]).to.equal('/2')
      expect(clonedData.addLink.firstCall.args[1]).to.equal('/new-page')
      expect(clonedData.addLink.firstCall.args[2]).to.equal(undefined)
      expect(clonedData.addPage.calledOnce).to.equal(true)
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage)
    })

    test('with no link from or section creates a page and calls back', async flags => {
      const expectedPage = {
        path: '/new-page',
        title: 'New Page',
        controller: './pages/start.js',
        next: [],
        components: []
      }
      const onCreate = data => {
        expect(data.value).to.equal(expectedPage)
      }
      const clonedData = {
        addPage: sinon.stub()
      }

      data.save = sinon.stub()
      data.save.resolves(clonedData)
      const wrappedOnCreate = flags.mustCall(onCreate, 1)

      const wrapper = shallow(<PageCreate data={data} onCreate={wrappedOnCreate} />)
      const preventDefault = sinon.spy()
      wrapper.find('#page-type').simulate('change', { target: { value: './pages/start.js' } })
      wrapper.find('#page-title').simulate('blur', { target: { value: 'New Page' } })

      data.clone = sinon.stub()
      data.clone.returns(clonedData)
      clonedData.addPage.returns(clonedData)

      await wrapper.instance().onSubmit({ preventDefault: preventDefault })

      expect(preventDefault.calledOnce).to.equal(true)
      expect(clonedData.addPage.calledOnce).to.equal(true)
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage)
    })
  })
})

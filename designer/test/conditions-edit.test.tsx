import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import ConditionsEdit from '../client/conditions-edit'
import sinon from 'sinon'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test, describe } = lab

suite('Conditions edit', () => {
  describe('with existing conditions', () => {
    const condition = { name: 'abdefg', displayName: 'My condition', value: 'badgers' }
    const condition2 = { name: 'abdefgh', displayName: 'My condition 2', value: 'badgers again' }

    const data = { conditions: [condition, condition2], hasConditions: true, allInputs: sinon.stub() }

    beforeEach(() => {
      data.allInputs.reset()
    })

    test('Renders edit links for each condition.', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      expect(listItems.at(0).find('a').text()).to.equal(condition.displayName)
      expect(listItems.at(1).find('a').text()).to.equal(condition2.displayName)
      expect(wrapper.find('#edit-conditions').exists()).to.equal(false)
    })

    test('Clicking an edit link causes the edit view to be rendered and all other elements hidden.', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      listItems.at(1).find('a').simulate('click', { preventDefault: sinon.spy() })

      expect(wrapper.find('li').exists()).to.equal(false)
      expect(wrapper.find('#edit-conditions').exists()).to.equal(true)
      assertEditingInlineConditionsFlyout(wrapper, data, condition2, true)
    })

    test('Completion of editing causes the edit view to be hidden again .', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      listItems.at(1).find('a').simulate('click', { preventDefault: sinon.spy() })

      expect(wrapper.find('li').exists()).to.equal(false)
      expect(wrapper.find('#edit-conditions').exists()).to.equal(true)

      wrapper.instance().editFinished()

      const listItems2 = wrapper.find('li')
      expect(listItems2.exists()).to.equal(true)
      expect(listItems2.length).to.equal(3)
      expect(listItems2.at(0).find('a').text()).to.equal(condition.displayName)
      expect(listItems2.at(1).find('a').text()).to.equal(condition2.displayName)
      expect(wrapper.find('#edit-conditions').exists()).to.equal(false)
    })

    test('Renders add new condition link if there are inputs available', () => {
      data.allInputs.returns([{}])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      const link = listItems.at(2).find('a')
      expect(link.exists()).to.equal(true)
      expect(link.text()).to.equal('Add condition')
    })

    test('Renders no new condition message if there are no inputs available', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      expect(listItems.at(2).find('a').exists()).to.equal(false)
      expect(listItems.at(2).text().trim()).to.equal('You cannot add any conditions as there are no available fields')
    })

    test('Renders hidden inline condition flyout.', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      assertInlineConditionsFlyout(wrapper, data, false)
    })

    test('Clicking the add condition link causes the inline conditions flyout to be shown', () => {
      data.allInputs.returns([{}])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      expect(listItems.at(2).find('a').exists()).to.equal(true)
      listItems.at(2).find('a').simulate('click', { preventDefault: sinon.spy() })
      assertInlineConditionsFlyout(wrapper, data, true)
    })

    test('Cancellation or completion of inline conditions flyout causes the flyout to be hidden again', () => {
      data.allInputs.returns([{}])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(3)
      expect(listItems.at(2).find('a').exists()).to.equal(true)
      listItems.at(2).find('a').simulate('click', { preventDefault: sinon.spy() })
      assertInlineConditionsFlyout(wrapper, data, true)
      wrapper.instance().cancelInlineCondition()
      assertInlineConditionsFlyout(wrapper, data, false)
    })
  })

  describe('without existing conditions', () => {
    const data = { conditions: [], hasConditions: false, allInputs: sinon.stub() }

    test('Renders no edit condition links.', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.length).to.equal(1)
    })

    test('Renders add new condition link if inputs are available', () => {
      data.allInputs.returns([{}])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.length).to.equal(1)
      const link = listItems.at(0).find('a')
      expect(link.exists()).to.equal(true)
      expect(link.text()).to.equal('Add condition')
    })

    test('Renders no new condition message if there are no inputs available', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(1)
      expect(listItems.at(0).find('a').exists()).to.equal(false)
      expect(listItems.at(0).text().trim()).to.equal('You cannot add any conditions as there are no available fields')
    })

    test('Renders hidden inline condition flyout.', () => {
      data.allInputs.returns([])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      assertInlineConditionsFlyout(wrapper, data, false)
    })

    test('Clicking the add condition link causes the inline conditions flyout to be shown', () => {
      data.allInputs.returns([{}])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(1)
      expect(listItems.at(0).find('a').exists()).to.equal(true)
      listItems.at(0).find('a').simulate('click', { preventDefault: sinon.spy() })
      assertInlineConditionsFlyout(wrapper, data, true)
    })

    test('Cancellation or completion of inline conditions flyout causes the flyout to be hidden again', () => {
      data.allInputs.returns([{}])
      const wrapper = shallow(<ConditionsEdit data={data} />)
      const listItems = wrapper.find('li')
      expect(listItems.exists()).to.equal(true)
      expect(listItems.length).to.equal(1)
      expect(listItems.at(0).find('a').exists()).to.equal(true)
      listItems.at(0).find('a').simulate('click', { preventDefault: sinon.spy() })
      assertInlineConditionsFlyout(wrapper, data, true)
      wrapper.instance().cancelInlineCondition()
      assertInlineConditionsFlyout(wrapper, data, false)
    })
  })
})

function assertEditingInlineConditionsFlyout (wrapper, data, conditionModel, shown) {
  const inlineConditions = wrapper.find('InlineConditions')
  expect(inlineConditions.exists()).to.equal(true)
  expect(inlineConditions.prop('data')).to.equal(data)
  expect(inlineConditions.prop('condition')).to.equal(conditionModel)
  expect(inlineConditions.prop('conditionsChange')).to.equal(wrapper.instance().editFinished)
  expect(inlineConditions.prop('cancelCallback')).to.equal(wrapper.instance().editFinished)

  const flyout = inlineConditions.parent('Flyout')
  expect(flyout.exists()).to.equal(true)
  expect(flyout.prop('show')).to.equal(shown)
  expect(flyout.prop('title')).to.equal('Edit Conditions')
  expect(flyout.prop('onHide')).to.equal(wrapper.instance().editFinished)
}

function assertInlineConditionsFlyout (wrapper, data, shown) {
  const inlineConditions = wrapper.find('InlineConditions')
  expect(inlineConditions.exists()).to.equal(true)
  expect(inlineConditions.prop('data')).to.equal(data)
  expect(inlineConditions.prop('conditionsChange')).to.equal(wrapper.instance().cancelInlineCondition)
  expect(inlineConditions.prop('cancelCallback')).to.equal(wrapper.instance().cancelInlineCondition)

  const flyout = inlineConditions.parent('Flyout')
  expect(flyout.exists()).to.equal(true)
  expect(flyout.prop('show')).to.equal(shown)
  expect(flyout.prop('title')).to.equal('Add Condition')
  expect(flyout.prop('onHide')).to.equal(wrapper.instance().cancelInlineCondition)
}

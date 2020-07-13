import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { assertLink, assertSelectInput } from './helpers/element-assertions'
import sinon from 'sinon'
import SelectConditions from '../client/conditions/select-conditions'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { before, beforeEach, describe, suite, test } = lab

function assertNoFieldsText (wrapper) {
  expect(wrapper.exists('.conditions')).to.equal(true)
  expect(wrapper.find('.conditions').find('.govuk-body').text().trim()).to.equal('You cannot add any conditions as there are no available fields')
  expect(wrapper.exists('InlineConditions')).to.equal(false)
  expect(wrapper.exists('#select-condition')).to.equal(false)
}

suite('Select conditions', () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    listFor: sinon.stub(),
    hasConditions: false,
    conditions: []
  }
  const path = '/'
  let conditionsChange

  beforeEach(() => {
    conditionsChange = sinon.spy()
  })

  describe('when there are already conditions defined', () => {
    const conditions = [
      { name: 'badger', displayName: 'Monkeys love badgers', value: 'field1 is a thing' },
      { name: 'badger2', displayName: 'another thing', value: 'field4 is another thing' }
    ]

    beforeEach(() => {
      data.hasConditions = true
      data.conditions = conditions
    })

    test('render returns placeholder message when there is an empty fields list', () => {
      data.inputsAccessibleAt.withArgs(path).returns([])
      data.listFor.returns(undefined)
      assertNoFieldsText(shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />))
      expect(conditionsChange.called).to.equal(false)
    })

    describe('when fields are present', () => {
      let fields

      beforeEach(() => {
        fields = [
          { propertyPath: 'field1', title: 'Something', type: 'TextField' },
          { propertyPath: 'field2', title: 'Something else', type: 'TextField' },
          { propertyPath: 'field3', title: 'Another thing', type: 'SelectField' }
        ]

        data.inputsAccessibleAt.withArgs(path).returns(fields)
      })

      test('should display the select conditions list and a link to allow inline creation', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        let conditionsSection = wrapper.find('.conditions')
        expect(conditionsSection.exists()).to.equal(true)
        let conditionHeaderGroup = conditionsSection.find('#conditions-header-group')
        expect(conditionHeaderGroup.find('label').text()).to.equal('Conditions (optional)')
        expect(conditionsSection.find('InlineConditions').exists()).to.equal(false)
        let selectConditions = conditionsSection.find('#select-condition')
        expect(selectConditions.exists()).to.equal(true)
        expect(selectConditions.find('label').text()).to.equal('Select a condition')
        const expectedFieldOptions = conditions.map(condition => ({ text: condition.displayName, value: condition.name }))
        expectedFieldOptions.unshift({ text: '' })
        assertSelectInput(selectConditions.find('select'), 'cond-select',
          expectedFieldOptions, '')
        assertLink(selectConditions.find('#inline-conditions-link'), 'inline-conditions-link', 'Define a new condition')
      })

      test('should default the selected condition when one is provided', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} selectedCondition={conditions[1].name} conditionsChange={conditionsChange} />)
        let conditionsSection = wrapper.find('.conditions')
        expect(conditionsSection.exists()).to.equal(true)
        let conditionHeaderGroup = conditionsSection.find('#conditions-header-group')
        expect(conditionHeaderGroup.find('label').text()).to.equal('Conditions (optional)')
        expect(conditionsSection.find('InlineConditions').exists()).to.equal(false)
        let selectConditions = conditionsSection.find('#select-condition')
        expect(selectConditions.exists()).to.equal(true)
        expect(selectConditions.find('label').text()).to.equal('Select a condition')
        const expectedFieldOptions = conditions.map(condition => ({ text: condition.displayName, value: condition.name }))
        expectedFieldOptions.unshift({ text: '' })
        assertSelectInput(selectConditions.find('select'), 'cond-select',
          expectedFieldOptions, conditions[1].name)
        assertLink(selectConditions.find('#inline-conditions-link'), 'inline-conditions-link', 'Define a new condition')
      })

      test('Clicking the define condition link should trigger the inline view to define a condition', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        expect(wrapper.find('#select-condition').exists()).to.equal(true)

        wrapper.find('#inline-conditions-link').simulate('click')

        expect(wrapper.find('#select-condition').exists()).to.equal(false)
        assertInlineConditionsComponent(wrapper, data, path, conditionsChange, true)
      })

      test('cancel inline condition should re-display the select conditions section with blank condition', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        wrapper.find('#inline-conditions-link').simulate('click')
        assertInlineConditionsComponent(wrapper, data, path, conditionsChange, true)
        wrapper.instance().onCancelInlineCondition()

        const expectedFieldOptions = conditions.map(condition => ({ text: condition.displayName, value: condition.name }))
        expectedFieldOptions.unshift({ text: '' })
        assertSelectInput(wrapper.find('select'), 'cond-select', expectedFieldOptions, '')
        expect(wrapper.find('InlineConditions').exists()).to.equal(false)
      })

      test('cancel inline condition should re-display the select conditions section with specified condition selected', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} selectedCondition={conditions[1].name} conditionsChange={conditionsChange} />)
        wrapper.find('#inline-conditions-link').simulate('click')
        assertInlineConditionsComponent(wrapper, data, path, conditionsChange, true)
        wrapper.instance().onCancelInlineCondition()

        const expectedFieldOptions = conditions.map(condition => ({ text: condition.displayName, value: condition.name }))
        expectedFieldOptions.unshift({ text: '' })
        assertSelectInput(wrapper.find('select'), 'cond-select', expectedFieldOptions, conditions[1].name)
        expect(wrapper.find('InlineConditions').exists()).to.equal(false)
      })

      test('Conditions change is called with the updated conditions any time saveState is called with a selected condition', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        const selectedCondition = sinon.stub()
        wrapper.instance().render = sinon.stub()
        wrapper.instance().setState({ selectedCondition: selectedCondition })

        expect(conditionsChange.calledOnceWith(undefined, selectedCondition)).to.equal(true)
      })

      test('Conditions change is not called if saveState is called without a selected condition', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        wrapper.instance().setState({ something: 'badgers' })

        expect(conditionsChange.called).to.equal(false)
      })
    })
  })

  describe('when there are no conditions defined', () => {
    beforeEach(() => {
      data.hasConditions = false
      data.conditions = []
    })

    test('render returns placeholder message is an empty fields list', () => {
      data.inputsAccessibleAt.withArgs(path).returns([])
      data.listFor.returns(undefined)
      assertNoFieldsText(shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />))
      expect(conditionsChange.called).to.equal(false)
    })

    describe('when fields are present', () => {
      let fields
      const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]

      before(() => {
        fields = [
          { propertyPath: 'field1', title: 'Something', type: 'TextField' },
          { propertyPath: 'field2', title: 'Something else', type: 'TextField' },
          { propertyPath: 'field3', title: 'Another thing', type: 'SelectField' }
        ]
        data.inputsAccessibleAt.withArgs(path).returns(fields)
        data.listFor.returns(undefined)
        data.listFor.withArgs(fields[2]).returns({ items: values })
      })

      test('render displays the inline conditions component', () => {
        let path2 = '/2'
        data.inputsAccessibleAt.withArgs(path2).returns([])
        data.listFor.returns(undefined)
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        expect(wrapper.exists('.conditions')).to.equal(true)
        expect(wrapper.find('#select-condition').exists()).to.equal(false)

        assertInlineConditionsComponent(wrapper, data, path, conditionsChange, false)
      })

      test('cancel inline condition should keep the inline conditions section displayed', () => {
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        assertInlineConditionsComponent(wrapper, data, path, conditionsChange, false)
        wrapper.instance().onCancelInlineCondition()

        expect(wrapper.find('#select-condition').exists()).to.equal(false)
        assertInlineConditionsComponent(wrapper, data, path, conditionsChange, false)
      })

      test('if the path property changes to a route without fields then the condition section is replaced by no fields text', () => {
        let path2 = '/2'
        data.inputsAccessibleAt.withArgs(path2).returns([])
        data.listFor.returns(undefined)
        const wrapper = shallow(<SelectConditions data={data} path={path} conditionsChange={conditionsChange} />)
        expect(wrapper.find('InlineConditions').exists()).to.equal(true)
        wrapper.setProps({ path: path2 })
        assertNoFieldsText(wrapper)
      })

      test('if the path property changes from a route with fields then the condition section appears', () => {
        let path2 = '/2'
        data.inputsAccessibleAt.withArgs(path2).returns([])
        data.listFor.returns(undefined)
        const wrapper = shallow(<SelectConditions data={data} path={path2} conditionsChange={conditionsChange} />)
        expect(wrapper.exists('InlineConditions')).to.equal(false)
        wrapper.setProps({ path: path })
        expect(wrapper.exists('InlineConditions')).to.equal(true)
      })
    })
  })
})

function assertInlineConditionsComponent (wrapper, data, path, conditionsChange, hideAddLink) {
  const inlineConditionsComponent = wrapper.find('InlineConditions')
  expect(inlineConditionsComponent.exists()).to.equal(true)
  expect(inlineConditionsComponent.prop('data')).to.equal(data)
  expect(inlineConditionsComponent.prop('path')).to.equal(path)
  expect(inlineConditionsComponent.prop('conditionsChange')).to.equal(conditionsChange)
  expect(inlineConditionsComponent.prop('cancelCallback')).to.equal(wrapper.instance().onCancelInlineCondition)
  expect(inlineConditionsComponent.prop('hideAddLink')).to.equal(hideAddLink)
  expect(Object.keys(inlineConditionsComponent.props()).length).to.equal(5)
}

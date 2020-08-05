import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { assertLabel, assertLink, assertText } from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditions from '../client/conditions/inline-conditions'
import { Condition, ConditionsModel, Field } from '../client/conditions/inline-condition-model'
import { ConditionValue } from '../client/conditions/inline-condition-values'
import InlineConditionHelpers from '../client/conditions/inline-condition-helpers'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { afterEach, before, beforeEach, describe, suite, test } = lab

suite('Inline conditions', () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    allInputs: sinon.stub(),
    listFor: sinon.stub(),
    clone: sinon.stub(),
    save: sinon.stub()
  }
  const isEqualToOperator = 'is'
  const path = '/'
  let conditionsChange
  let cancelCallback

  beforeEach(() => {
    conditionsChange = sinon.spy()
    cancelCallback = sinon.spy()
  })

  test('render returns nothing when there is an empty fields list', () => {
    data.inputsAccessibleAt.withArgs(path).returns([])
    data.listFor.returns(undefined)
    expect(shallow(<InlineConditions data={data} path={path}
      conditionsChange={conditionsChange} cancelCallback={cancelCallback} />).exists('#inline-conditions')).to.equal(false)
    expect(conditionsChange.called).to.equal(false)
  })

  describe('when fields are present', () => {
    let fields
    let expectedFields
    const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]
    let storeConditionStub

    before(() => {
      fields = [
        { propertyPath: 'field1', displayName: 'Something', type: 'TextField' },
        { propertyPath: 'field2', displayName: 'Something else', type: 'TextField' },
        { propertyPath: 'field3', displayName: 'Another thing', type: 'SelectField' }
      ]
      expectedFields = {
        field1: {
          label: 'Something',
          name: 'field1',
          type: 'TextField',
          values: undefined
        },
        field2: {
          label: 'Something else',
          name: 'field2',
          type: 'TextField',
          values: undefined
        },
        field3: {
          label: 'Another thing',
          name: 'field3',
          type: 'SelectField',
          values: values
        }
      }
      data.inputsAccessibleAt.withArgs(path).returns(fields)
      data.listFor.returns(undefined)
      data.listFor.withArgs(fields[2]).returns({ items: values })
    })

    beforeEach(function () {
      storeConditionStub = sinon.stub(InlineConditionHelpers, 'storeConditionIfNecessary')
    })

    afterEach(function () {
      storeConditionStub.restore()
    })

    test('fields are retrieved from allInputs if no path is provided', () => {
      data.inputsAccessibleAt.returns([])
      data.allInputs.returns(fields)
      const wrapper = shallow(<InlineConditions data={data} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
      expect(wrapper.exists('#inline-conditions')).to.equal(true)
    })

    test('if the path property changes to a route without fields then the condition section disappears', () => {
      let path2 = '/2'
      data.inputsAccessibleAt.withArgs(path2).returns([])
      data.listFor.returns(undefined)
      const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
      expect(wrapper.exists('#inline-conditions')).to.equal(true)
      wrapper.setProps({ path: path2 })
      expect(wrapper.exists('#inline-conditions')).to.equal(false)
    })

    test('if the path property changes from a route with fields then the condition section appears', () => {
      let path2 = '/2'
      data.inputsAccessibleAt.withArgs(path2).returns([])
      data.listFor.returns(undefined)
      const wrapper = shallow(<InlineConditions data={data} path={path2} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
      expect(wrapper.exists('#inline-conditions')).to.equal(false)
      wrapper.setProps({ path: path })
      expect(wrapper.exists('#inline-conditions')).to.equal(true)
    })

    test('Conditions change is called with the updated conditions when the save button is clicked', async () => {
      const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
      wrapper.instance().saveCondition(new Condition(Field.from({ name: fields[0].propertyPath, type: fields[0].type, display: fields[0].displayName }), isEqualToOperator, new ConditionValue('N')))
      expect(conditionsChange.called).to.equal(false)

      const clonedData = sinon.spy()
      const updatedData = sinon.spy()
      const savedData = sinon.spy()
      data.save.resolves(savedData)
      data.clone.returns(clonedData)
      const selectedCondition = 'Nj2344qdw'
      storeConditionStub.resolves({ data: updatedData, condition: selectedCondition })

      expect(wrapper.find('#save-inline-conditions').prop('onClick')).to.equal(wrapper.instance().onClickSave)
      await wrapper.instance().onClickSave()
      expect(data.save.calledOnce).to.equal(true)
      expect(data.save.firstCall.args[0]).to.equal(updatedData)
      expect(conditionsChange.calledOnceWith(selectedCondition)).to.equal(true)
    })

    test('Clicking the cancel link should cancel any added conditions and partially completed inputs and trigger the cancel callback', () => {
      const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
      let instance = wrapper.instance()
      instance.saveCondition(new Condition(Field.from({ name: fields[0].propertyPath, type: fields[0].type, display: fields[0].displayName }), isEqualToOperator, new ConditionValue('N')))
      expect(wrapper.find('#conditions-display').exists()).to.equal(true)
      const e = {}
      wrapper.find('#cancel-inline-conditions-link').simulate('click', e)

      assertAddingFirstCondition(wrapper, expectedFields)
    })

    test('Clicking the cancel link should succeed if there is no cancel callback', () => {
      const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
      let instance = wrapper.instance()
      instance.saveCondition(new Condition(Field.from({ name: fields[0].propertyPath, type: fields[0].type, display: fields[0].displayName }), isEqualToOperator, new ConditionValue('N')))
      expect(wrapper.find('#conditions-display').exists()).to.equal(true)
      const e = {}
      wrapper.find('#cancel-inline-conditions-link').simulate('click', e)

      assertAddingFirstCondition(wrapper, expectedFields)
    })

    describe('adding conditions', () => {
      test('Only the header and add item link are present initially', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
        assertAddingFirstCondition(wrapper, expectedFields)
      })

      test('Defining the name updates the state', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
        wrapper.find('#cond-name').simulate('change', { target: { value: 'Badgers' } })

        assertAddingFirstCondition(wrapper, expectedFields)
        expect(wrapper.instance().state.conditions.name).to.equal('Badgers')
      })

      test('A condition being added causes the view to update', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
        const condition = new Condition(new Field('something', 'TextField', 'Something'), 'is', new ConditionValue('M'))
        wrapper.instance().saveCondition(condition)

        assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)

        expect(conditionsChange.called).to.equal(false)
      })
    })

    describe('editing conditions', () => {
      let conditions

      beforeEach(() => {
        conditions = new ConditionsModel()
        conditions.add(new Condition(new Field(fields[0].propertyPath, fields[0].type, fields[0].displayName), isEqualToOperator, new ConditionValue('M')))
      })

      test('Clicking the edit link causes editing view to be rendered', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
        wrapper.instance().setState({ conditions: conditions })
        wrapper.find('#edit-conditions-link').simulate('click')

        assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\'')
        assertEditPanel(wrapper, conditions, expectedFields)
      })

      test('edit callback should replace the conditions and leave in edit mode', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
        wrapper.instance().saveCondition(new Condition(new Field(fields[1].propertyPath, fields[1].type, fields[1].displayName), isEqualToOperator, new ConditionValue('N')))
        wrapper.find('#edit-conditions-link').simulate('click')
        assertEditingHeaderGroupWithConditionString(wrapper, '\'Something else\' is \'N\'')

        expect(wrapper.instance().editCallback(conditions))
        assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\'')
        assertEditPanel(wrapper, conditions, expectedFields)
      })

      test('exit edit callback should exit edit mode', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} cancelCallback={cancelCallback} />)
        wrapper.instance().setState({ conditions: conditions })
        wrapper.find('#edit-conditions-link').simulate('click')
        wrapper.instance().toggleEdit()

        assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)
        assertEditPanelDoesNotExist(wrapper)
      })
    })
  })
})

function assertFieldDefinitionSection (wrapper, expectedFields, hasConditions, editingIndex) {
  let inlineConditionsDefinition = wrapper.find('InlineConditionsDefinition')
  expect(inlineConditionsDefinition.exists()).to.equal(true)
  expect(inlineConditionsDefinition.prop('expectsCoordinator')).to.equal(hasConditions && editingIndex !== 0)
  expect(inlineConditionsDefinition.prop('fields')).to.equal(expectedFields)
  expect(inlineConditionsDefinition.prop('saveCallback')).to.equal(wrapper.instance().saveCondition)
  expect(Object.keys(inlineConditionsDefinition.props()).length).to.equal(3)
}

function assertAddingFirstCondition (wrapper, expectedFields) {
  expect(wrapper.find('#cond-name').exists()).to.equal(true)
  assertLabel(wrapper.find('#inline-condition-header').find('#condition-string-label'), 'When')

  assertFieldDefinitionSection(wrapper, expectedFields, false)
}

function assertAddingSubsequentCondition (wrapper, expectedConditionString, expectedFields) {
  assertHeaderGroupWithConditionString(wrapper, expectedConditionString)
  expect(wrapper.find('#cond-name').exists()).to.equal(true)
  assertLabel(wrapper.find('#inline-condition-header').find('#condition-string-label'), 'When')

  assertFieldDefinitionSection(wrapper, expectedFields, true)
}

function assertHeaderGroupWithConditionString (wrapper, conditionString) {
  const inlineConditionsHeader = wrapper.find('#inline-condition-header')
  assertLabel(inlineConditionsHeader.find('#condition-string-label'), 'When')
  const conditionDisplayDiv = inlineConditionsHeader.find('#conditions-display')

  const conditionDisplayChildren = conditionDisplayDiv.children()
  expect(conditionDisplayChildren.length).to.equal(2)

  assertText(conditionDisplayDiv.find('#condition-string'), conditionString)

  assertLink(conditionDisplayDiv.find('#edit-conditions-link'), 'edit-conditions-link', 'Not what you meant?')
}

function assertEditingHeaderGroupWithConditionString (wrapper, conditionString) {
  assertLabel(wrapper.find('#inline-condition-header').find('#condition-string-label'), 'When')

  const conditionDisplay = wrapper.find('#conditions-display')
  assertText(conditionDisplay.find('#condition-string'), conditionString)
  expect(conditionDisplay.find('#edit-conditions-link').exists()).to.equal(false)
}

function assertEditPanel (wrapper, expectedConditions, expectedFields) {
  let editConditionsPanel = wrapper.find('InlineConditionsEdit')
  expect(editConditionsPanel.exists()).to.equal(true)
  expect(editConditionsPanel.prop('conditions')).to.equal(expectedConditions)
  expect(editConditionsPanel.prop('fields')).to.equal(expectedFields)
  expect(editConditionsPanel.prop('saveCallback')).to.equal(wrapper.instance().editCallback)
  expect(editConditionsPanel.prop('exitCallback')).to.equal(wrapper.instance().toggleEdit)
}

function assertEditPanelDoesNotExist (wrapper) {
  expect(wrapper.find('InlineConditionsEdit').exists()).to.equal(false)
}

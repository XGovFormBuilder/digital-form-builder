import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { assertLabel, assertLink, assertSelectInput, assertText } from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditions from '../client/conditions/inline-conditions'
import { Condition, ConditionsModel, Field, Value, getOperatorNames } from '../client/conditions/inline-condition-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { before, beforeEach, describe, suite, test } = lab

suite('Inline conditions', () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    listFor: sinon.stub(),
    hasConditions: false,
    conditions: []
  }
  const textFieldOperators = getOperatorNames('TextField')
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

    test('render returns nothing when there is an empty fields list', () => {
      data.inputsAccessibleAt.withArgs(path).returns([])
      data.listFor.returns(undefined)
      expect(shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />).exists('.conditions')).to.equal(false)
      expect(conditionsChange.called).to.equal(false)
    })

    describe('when fields are present', () => {
      let fields
      let expectedFields

      beforeEach(() => {
        fields = [
          { propertyPath: 'field1', title: 'Something', type: 'TextField' },
          { propertyPath: 'field2', title: 'Something else', type: 'TextField' },
          { propertyPath: 'field3', title: 'Another thing', type: 'SelectField' }
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
            values: undefined
          }
        }

        data.inputsAccessibleAt.withArgs(path).returns(fields)
      })

      test('should display the select conditions list and a link to allow inline creation', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        let conditionsSection = wrapper.find('.conditions')
        expect(conditionsSection.exists()).to.equal(true)
        let conditionHeaderGroup = conditionsSection.find('#conditions-header-group')
        expect(conditionHeaderGroup.find('label').text()).to.equal('Conditions (optional)')
        expect(conditionHeaderGroup.find('#inline-condition-header').exists()).to.equal(false)
        expect(conditionsSection.find('#inline-conditions').exists()).to.equal(false)
        let selectConditions = conditionsSection.find('#select-condition')
        expect(selectConditions.exists()).to.equal(true)
        expect(selectConditions.find('label').text()).to.equal('Select a condition')
        const expectedFieldOptions = conditions.map(condition => ({ text: condition.displayName, value: condition.name }))
        expectedFieldOptions.unshift({ text: '' })
        assertSelectInput(selectConditions.find('select'), 'cond-select',
          expectedFieldOptions, '')
        assertLink(selectConditions.find('#inline-conditions-link'), 'inline-conditions-link', 'Define a new condition')
      })

      test('Clicking the define condition link should trigger the inline view to define a condition', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        expect(wrapper.find('#select-condition').exists()).to.equal(true)

        wrapper.find('#inline-conditions-link').simulate('click')

        expect(wrapper.find('#select-condition').exists()).to.equal(false)
        assertAddingFirstCondition(wrapper, expectedFields)
        expect(wrapper.find('#add-item').exists()).to.equal(false)
        expect(conditionsChange.calledOnceWith(undefined, null)).to.equal(true)
      })

      test('Clicking the cancel link should redisplay the select condition section', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        wrapper.find('#inline-conditions-link').simulate('click')
        wrapper.find('#cancel-inline-conditions-link').simulate('click')
        let conditionsSection = wrapper.find('.conditions')
        expect(conditionsSection.exists()).to.equal(true)
        let conditionHeaderGroup = conditionsSection.find('#conditions-header-group')
        expect(conditionHeaderGroup.find('label').text()).to.equal('Conditions (optional)')
        expect(conditionsSection.find('#inline-conditions').exists()).to.equal(false)
        expect(conditionsSection.find('#select-condition').exists()).to.equal(true)
      })

      test('Clicking the cancel link should cancel any added conditions and partially completed inputs', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        wrapper.find('#inline-conditions-link').simulate('click')
        let instance = wrapper.instance()
        instance.saveCondition(new Condition(Field.from({ name: fields[0].propertyPath, type: fields[0].type, display: fields[0].title }), textFieldOperators[0], new Value('N')))
        expect(wrapper.find('#conditions-display').exists()).to.equal(true)
        wrapper.find('#cancel-inline-conditions-link').simulate('click')

        expect(wrapper.find('#conditions-display').exists()).to.equal(false)
        expect(wrapper.find('InlineConditionsDefinition').exists()).to.equal(false)
      })
    })
  })

  describe('when there are no conditions defined', () => {
    beforeEach(() => {
      data.hasConditions = false
      data.conditions = []
    })

    test('render returns nothing when there is an empty fields list', () => {
      data.inputsAccessibleAt.withArgs(path).returns([])
      data.listFor.returns(undefined)
      expect(shallow(<InlineConditions data={data} path={path}
        conditionsChange={conditionsChange} />).exists('.conditions')).to.equal(false)
      expect(conditionsChange.called).to.equal(false)
    })

    describe('when fields are present', () => {
      let fields
      let expectedFields
      const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]

      before(() => {
        fields = [
          { propertyPath: 'field1', title: 'Something', type: 'TextField' },
          { propertyPath: 'field2', title: 'Something else', type: 'TextField' },
          { propertyPath: 'field3', title: 'Another thing', type: 'SelectField' }
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

      test('if the path property changes to a route without fields then the condition section disappears', () => {
        let path2 = '/2'
        data.inputsAccessibleAt.withArgs(path2).returns([])
        data.listFor.returns(undefined)
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        expect(wrapper.exists('.conditions')).to.equal(true)
        wrapper.setProps({ path: path2 })
        expect(wrapper.exists('.conditions')).to.equal(false)
      })

      test('if the path property changes from a route with fields then the condition section appears', () => {
        let path2 = '/2'
        data.inputsAccessibleAt.withArgs(path2).returns([])
        data.listFor.returns(undefined)
        const wrapper = shallow(<InlineConditions data={data} path={path2} conditionsChange={conditionsChange} />)
        expect(wrapper.exists('.conditions')).to.equal(false)
        wrapper.setProps({ path: path })
        expect(wrapper.exists('.conditions')).to.equal(true)
      })

      test('Conditions change is called with the updated conditions any time saveState is called with updated conditions', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        const updatedConditions = sinon.stub()
        wrapper.instance().render = sinon.stub()
        wrapper.instance().setState({ conditions: updatedConditions })

        expect(conditionsChange.calledOnceWith(updatedConditions)).to.equal(true)
      })

      test('Conditions change is called with the updated conditions any time saveState is called with updated selectedCondition', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        const updatedConditions = sinon.stub()
        wrapper.instance().render = sinon.stub()
        wrapper.instance().setState({ selectedCondition: updatedConditions })

        expect(conditionsChange.calledOnceWith(undefined, updatedConditions)).to.equal(true)
      })

      test('Conditions change is called with the updated conditions any time saveState is called with updated conditions and selectedCondition', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        const updatedConditions = sinon.stub()
        wrapper.instance().render = sinon.stub()
        wrapper.instance().setState({ conditions: updatedConditions, selectedCondition: 'badger' })

        expect(conditionsChange.calledOnceWith(updatedConditions, 'badger')).to.equal(true)
      })

      test('Conditions change is not called if saveState is called without updated conditions or selected condition', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        wrapper.instance().setState({ something: 'badgers' })

        expect(conditionsChange.called).to.equal(false)
      })

      describe('adding conditions', () => {
        test('Only the header and add item link are present initially', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          assertHeaderAndAddItemDisplayed(wrapper)
          expect(wrapper.find('#inline-condition-header').find('label').exists()).to.equal(false)
          expect(wrapper.find('#cond-name').exists()).to.equal(false)
          expect(wrapper.find('#condition-string').exists()).to.equal(false)
          expect(wrapper.find('#conditions-display').exists()).to.equal(false)
          expect(wrapper.find('#select-condition').exists()).to.equal(false)
          expect(wrapper.find('#cond-coordinator-group').exists()).to.equal(false)
          expect(wrapper.find('#cond-coordinator-group').exists()).to.equal(false)
          expect(wrapper.find('#condition-definition-inputs').exists()).to.equal(false)
          expect(wrapper.find('#cancel-inline-conditions-link').exists()).to.equal(false)
        })

        test('Clicking the add item link presents the field definition section and removes the add item link', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')

          assertAddingFirstCondition(wrapper, expectedFields)
        })

        test('Defining the name updates the state', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.find('#cond-name').simulate('change', { target: { value: 'Badgers' } })

          assertAddingFirstCondition(wrapper, expectedFields)
          expect(wrapper.instance().state.conditions.name).to.equal('Badgers')
        })

        test('A condition being added causes the view to update and the conditionsChange callback to be called', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          const condition = new Condition(new Field('something', 'TextField', 'Something'), 'is', new Value('M'))
          wrapper.instance().saveCondition(condition)

          assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)

          expect(conditionsChange.calledOnce).to.equal(true)
          expect(conditionsChange.firstCall.args[0].asPerUserGroupings).to.equal([condition])
          expect(conditionsChange.firstCall.args[1]).to.equal(undefined)
        })
      })

      describe('editing conditions', () => {
        let conditions

        beforeEach(() => {
          conditions = new ConditionsModel()
          conditions.add(new Condition(new Field(fields[0].propertyPath, fields[0].type, fields[0].title), textFieldOperators[0], new Value('M')))
        })

        test('Clicking the edit link causes editing view to be rendered', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.instance().setState({ conditions: conditions })
          wrapper.find('#edit-conditions-link').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\'')
          assertEditPanel(wrapper, conditions, expectedFields)
        })

        test('edit callback should replace the conditions and leave in edit mode', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].propertyPath, fields[1].type, fields[1].title), textFieldOperators[0], new Value('N')))
          wrapper.find('#edit-conditions-link').simulate('click')
          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something else\' is \'N\'')

          expect(wrapper.instance().editCallback(conditions))
          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\'')
          assertEditPanel(wrapper, conditions, expectedFields)
        })

        test('exit edit callback should exit edit mode', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.instance().setState({ conditions: conditions })
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.instance().toggleEdit()

          assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)
          assertEditPanelDoesNotExist(wrapper)
        })
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

function assertHeaderLabel (wrapper) {
  expect(wrapper.find('#conditions-header-group').exists()).to.equal(true)
  let headerLabel = wrapper.find('#conditions-header-group').find('label')
  assertLabel(headerLabel, 'Conditions (optional)')
  expect(headerLabel.hasClass('govuk-label--s')).to.equal(true)
}

function assertHeaderAndAddItemDisplayed (wrapper) {
  assertHeaderLabel(wrapper)
  assertLink(wrapper.find('#add-item'), 'add-item', 'Add')
}

function assertAddingFirstCondition (wrapper, expectedFields) {
  assertHeaderLabel(wrapper)
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
  assertHeaderLabel(wrapper)
  const inlineConditionsHeader = wrapper.find('#inline-condition-header')
  assertLabel(inlineConditionsHeader.find('#condition-string-label'), 'When')
  const conditionDisplayDiv = inlineConditionsHeader.find('#conditions-display')

  const conditionDisplayChildren = conditionDisplayDiv.children()
  expect(conditionDisplayChildren.length).to.equal(2)

  assertText(conditionDisplayDiv.find('#condition-string'), conditionString)

  assertLink(conditionDisplayDiv.find('#edit-conditions-link'), 'edit-conditions-link', 'Not what you meant?')
}

function assertEditingHeaderGroupWithConditionString (wrapper, conditionString) {
  assertHeaderLabel(wrapper)
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

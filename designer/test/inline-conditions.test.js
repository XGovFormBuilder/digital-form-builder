import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import {
  assertCheckboxInput,
  assertClasses,
  assertDiv,
  assertLabel,
  assertLink,
  assertSelectInput,
  assertSpan,
  assertText
} from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditions from '../client/conditions/inline-conditions'
import { Condition, Field, Value } from '../client/conditions/inline-condition-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { before, beforeEach, describe, suite, test } = lab

suite('Inline conditions', () => {
  const data = {
    inputsAccessibleAt: sinon.stub(),
    listFor: sinon.stub(),
    hasConditions: false,
    getConditions: sinon.stub()
  }
  const textFieldOperators = ['is', 'is not', 'matches']
  const path = '/'
  let conditionsChange

  beforeEach(() => {
    conditionsChange = sinon.spy()
  })

  describe('when there are already conditions defined', () => {
    const conditions = [{ name: 'badger', value: 'field1 is a thing' }, { name: 'badger2', value: 'field4 is another thing' }]

    beforeEach(() => {
      data.hasConditions = true
      data.getConditions.returns(conditions)
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
          { name: 'field1', title: 'Something', type: 'TextField' },
          { name: 'field2', title: 'Something else', type: 'TextField' },
          { name: 'field3', title: 'Another thing', type: 'SelectField' }
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
        assertSelectInput(selectConditions.find('select'), 'cond-select',
          conditions.map(condition => ({ text: condition.name, value: condition.name })), '')
        assertLink(selectConditions.find('#inline-conditions-link'), 'inline-conditions-link', 'Define a new condition')
      })

      test('Clicking the define condition link should trigger the inline view to define a condition', () => {
        const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
        wrapper.find('#inline-conditions-link').simulate('click')
        let conditionsSection = wrapper.find('.conditions')
        expect(conditionsSection.exists()).to.equal(true)
        let conditionHeaderGroup = conditionsSection.find('#conditions-header-group')
        expect(conditionHeaderGroup.find('label').text()).to.equal('Conditions (optional)')
        let inlineConditions = conditionsSection.find('#inline-conditions')
        expect(inlineConditions.find('#inline-condition-header').exists()).to.equal(true)
        expect(inlineConditions.exists()).to.equal(true)
        expect(conditionsSection.find('#add-item').exists()).to.equal(false)
        assertFieldDefinitionSection(wrapper, expectedFields, false, {})
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
        instance.saveCondition(new Condition(Field.from({ name: fields[0].name, display: fields[0].title }), textFieldOperators[0], new Value('N')))
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
      data.getConditions.returns([])
    })

    test('render returns nothing when there is an empty fields list', () => {
      data.inputsAccessibleAt.withArgs(path).returns([])
      data.listFor.returns(undefined)
      expect(shallow(<InlineConditions data={data} path={path}
        conditionsChange={conditionsChange} />).exists('.conditions')).to.equal(false)
      expect(conditionsChange.called).to.equal(false)
    })

    describe('when fields are present', () => {
      const selectFieldOperators = ['is', 'is not']
      let fields
      let expectedFields
      const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]

      before(() => {
        fields = [
          { name: 'field1', title: 'Something', type: 'TextField' },
          { name: 'field2', title: 'Something else', type: 'TextField' },
          { name: 'field3', title: 'Another thing', type: 'SelectField' }
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

        test('A condition being added causes the view to update and the conditionsChange callback to be called', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          const condition = new Condition(new Field('something', 'Something'), 'is', new Value('M'))
          wrapper.instance().saveCondition(condition)

          assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)

          expect(conditionsChange.calledOnce).to.equal(true)
          expect(conditionsChange.firstCall.args[0].asPerUserGroupings).to.equal([condition])
          expect(conditionsChange.firstCall.args[1]).to.equal(undefined)
        })
      })

      describe('editing conditions', () => {
        test('Clicking the edit link causes editing view to be rendered', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.find('#edit-conditions-link').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\'')
          assertEditPanel(wrapper, [{ condition: '\'Something\' is \'M\'' }])
        })

        test('Clicking the edit link for a single condition causes the field definition inputs to be pre-populated correctly', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          let condition = new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M'))
          wrapper.instance().saveCondition(condition)
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-0-edit').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\'')

          assertEditingCondition(wrapper, expectedFields, condition, 0)
        })

        test('Clicking the edit link for a subsequent condition causes the field definition inputs to be pre-populated correctly', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          let condition = new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and')
          wrapper.instance().saveCondition(condition)
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-1-edit').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' and \'Something else\' is \'N\'')

          assertEditingCondition(wrapper, expectedFields, condition, 1)
        })

        test('Saving edits to condition results in an updated condition string and returns the users to an updated edit panel', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-1-edit').simulate('click')

          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[1], new Value(values[0].value, values[0].text), 'or'))

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' or \'Another thing\' is not \'Value 1\'')
          assertEditPanel(wrapper, [{ condition: '\'Something\' is \'M\'' }, { condition: 'or \'Another thing\' is not \'Value 1\'' }])
        })

        test('Grouping conditions combines them into a single condition which can be split but not edited', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' and \'Something else\' is \'N\'')
          assertEditPanel(wrapper, [{
            condition: '\'Something\' is \'M\'',
            selected: true
          }, { condition: 'and \'Something else\' is \'N\'', selected: true }])

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '(\'Something\' is \'M\' and \'Something else\' is \'N\')')
          assertEditPanel(wrapper, [{ condition: '(\'Something\' is \'M\' and \'Something else\' is \'N\')', grouped: true }])
        })

        test('should not group non-consecutive conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[0], new Value(values[0].value, values[0].text), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-2').simulate('change', { target: { value: '2', checked: true } })

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' and \'Something else\' is \'N\' and \'Another thing\' is \'Value 1\'')
          assertEditPanel(wrapper, [{
            condition: '\'Something\' is \'M\'',
            selected: true
          }, { condition: 'and \'Something else\' is \'N\'' },
          { condition: 'and \'Another thing\' is \'Value 1\'', selected: true }])

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' and \'Something else\' is \'N\' and \'Another thing\' is \'Value 1\'')
          assertEditPanel(wrapper, [{
            condition: '\'Something\' is \'M\'',
            selected: true
          }, { condition: 'and \'Something else\' is \'N\'' },
          {
            condition: 'and \'Another thing\' is \'Value 1\'',
            selected: true
          }], 'Error: Please select consecutive items to group')
        })

        test('should group multiple consecutive condition groups', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'or'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[0], new Value(values[0].value, values[0].text), 'and'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[0], new Value(values[0].value, values[0].text), 'or'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('Y'), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })
          wrapper.find('#condition-3').simulate('change', { target: { value: '3', checked: true } })
          wrapper.find('#condition-4').simulate('change', { target: { value: '4', checked: true } })

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' or (\'Something else\' is \'N\' and \'Another thing\' is \'Value 1\') or (\'Another thing\' is \'Value 1\' and \'Something else\' is \'Y\')')
          assertEditPanel(wrapper, [{
            condition: '\'Something\' is \'M\'',
            selected: true
          }, { condition: 'or \'Something else\' is \'N\'', selected: true },
          { condition: 'and \'Another thing\' is \'Value 1\'' }, {
            condition: 'or \'Another thing\' is \'Value 1\'',
            selected: true
          }, { condition: 'and \'Something else\' is \'Y\'', selected: true }])

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '((\'Something\' is \'M\' or \'Something else\' is \'N\') and \'Another thing\' is \'Value 1\') or (\'Another thing\' is \'Value 1\' and \'Something else\' is \'Y\')')
          assertEditPanel(wrapper, [{ condition: '(\'Something\' is \'M\' or \'Something else\' is \'N\')', grouped: true },
            { condition: 'and \'Another thing\' is \'Value 1\'' }, {
              condition: 'or (\'Another thing\' is \'Value 1\' and \'Something else\' is \'Y\')',
              grouped: true
            }])
        })

        test('splitting grouped conditions returns them to their original components', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '(\'Something\' is \'M\' and \'Something else\' is \'N\')')
          assertEditPanel(wrapper, [{
            condition: '(\'Something\' is \'M\' and \'Something else\' is \'N\')',
            grouped: true
          }])

          wrapper.find('#condition-0-split').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something\' is \'M\' and \'Something else\' is \'N\'')
          assertEditPanel(wrapper, [{ condition: '\'Something\' is \'M\'' }, { condition: 'and \'Something else\' is \'N\'' }])
        })

        test('removing selected conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[0], new Value(values[0].value, values[0].text), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-2').simulate('change', { target: { value: '2', checked: true } })

          wrapper.find('#remove-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Something else\' is \'N\'')
          assertEditPanel(wrapper, [{ condition: '\'Something else\' is \'N\'' }])
        })

        test('Should deselect conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[0], new Value(values[0].value, values[0].text), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-0').simulate('change', { target: { value: '0' } })

          expect(wrapper.find('#remove-conditions').exists()).to.equal(false)
        })

        test('removing grouped conditions removes everything in the group', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.instance().saveCondition(new Condition(new Field(fields[2].name, fields[2].title), selectFieldOperators[0], new Value(values[0].value, values[0].text), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          wrapper.find('#group-conditions').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#remove-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '\'Another thing\' is \'Value 1\'')
          assertEditPanel(wrapper, [{ condition: '\'Another thing\' is \'Value 1\'' }])
        })

        test('removing last condition returns the user to the original add display', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.instance().saveCondition(new Condition(new Field(fields[1].name, fields[1].title), textFieldOperators[0], new Value('N'), 'and'))
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          wrapper.find('#group-conditions').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#remove-conditions').simulate('click')

          assertHeaderAndAddItemDisplayed(wrapper)
        })

        test('Cancelling from editing an individual condition returns user to the add conditions view', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-0-edit').simulate('click')
          wrapper.find('#cancel-edit-inline-conditions-link').simulate('click')

          assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)
        })

        test('Cancelling from edit view returns user to the add condition view', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.instance().saveCondition(new Condition(new Field(fields[0].name, fields[0].title), textFieldOperators[0], new Value('M')))
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#cancel-edit-inline-conditions-link').simulate('click')

          assertAddingSubsequentCondition(wrapper, '\'Something\' is \'M\'', expectedFields)
        })
      })
    })
  })
})

function assertFieldDefinitionSection (wrapper, expectedFields, hasConditions, condition, editingIndex) {
  let inlineConditionsDefinition = wrapper.find('InlineConditionsDefinition')
  expect(inlineConditionsDefinition.exists()).to.equal(true)
  expect(inlineConditionsDefinition.prop('expectsCoordinator')).to.equal(hasConditions && editingIndex !== 0)
  expect(inlineConditionsDefinition.prop('fields')).to.equal(expectedFields)
  expect(inlineConditionsDefinition.prop('condition')).to.equal(condition)
  expect(inlineConditionsDefinition.prop('saveCallback')).to.equal(wrapper.instance().saveCondition)
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
  assertLabel(wrapper.find('#inline-condition-header').find('label'), 'When')

  assertFieldDefinitionSection(wrapper, expectedFields, false, {})
}

function assertEditingCondition (wrapper, expectedFields, condition, editingIndex) {
  assertHeaderLabel(wrapper)
  assertLabel(wrapper.find('#inline-condition-header').find('label'), 'When')

  assertFieldDefinitionSection(wrapper, expectedFields, true, condition, editingIndex)
}

function assertAddingSubsequentCondition (wrapper, expectedConditionString, expectedFields) {
  assertHeaderGroupWithConditionString(wrapper, expectedConditionString)
  assertLabel(wrapper.find('#inline-condition-header').find('label'), 'When')

  assertFieldDefinitionSection(wrapper, expectedFields, true)
}

function assertHeaderGroupWithConditionString (wrapper, conditionString) {
  assertHeaderLabel(wrapper)
  const inlineConditionsHeader = wrapper.find('#inline-condition-header')
  assertLabel(inlineConditionsHeader.find('label'), 'When')
  const conditionDisplayDiv = inlineConditionsHeader.find('#conditions-display')

  const conditionDisplayChildren = conditionDisplayDiv.children()
  expect(conditionDisplayChildren.length).to.equal(2)

  assertText(conditionDisplayDiv.find('#condition-string'), conditionString)

  assertLink(conditionDisplayDiv.find('#edit-conditions-link'), 'edit-conditions-link', 'Not what you meant?')
}

function assertEditingHeaderGroupWithConditionString (wrapper, conditionString) {
  assertHeaderLabel(wrapper)
  assertLabel(wrapper.find('#inline-condition-header').find('label'), 'When')

  const conditionDisplay = wrapper.find('#conditions-display')
  assertText(conditionDisplay.find('#condition-string'), conditionString)
  expect(conditionDisplay.find('#edit-conditions-link').exists()).to.equal(false)
}

function assertCheckboxActionLink (span, id, text) {
  assertSpan(span)
  expect(span.children().length).to.equal(2)
  expect(span.children().at(0).name()).to.equal(null)
  expect(span.children().at(0).text()).to.equal('  ')
  assertLink(span.children().at(1), id, text)
}

function assertEditPanel (wrapper, conditions, editingError) {
  let editConditionsPanel = wrapper.find('#edit-conditions')
  expect(editConditionsPanel.exists()).to.equal(true)

  const fieldSet = editConditionsPanel.find('fieldset')

  const legend = fieldSet.find('legend')
  expect(legend.text()).to.equal('Select conditions to group / remove')

  assertLink(wrapper.find('#cancel-edit-inline-conditions-link'), 'cancel-edit-inline-conditions-link', 'Cancel')
  expect(wrapper.find('#cancel-inline-conditions-link').exists()).to.equal(false)

  if (editingError) {
    const editingErrorSection = fieldSet.find('#conditions-error')
    assertText(editingErrorSection, editingError)
    assertClasses(editingErrorSection, ['govuk-error-message'])
  }

  const checkboxesDiv = fieldSet.find('#editing-checkboxes')
  assertClasses(checkboxesDiv, ['govuk-checkboxes'])
  expect(checkboxesDiv.children().length).to.equal(conditions.length)
  conditions.forEach((condition, index) => {
    const checkboxDiv = checkboxesDiv.children().at(index)
    assertDiv(checkboxDiv, ['govuk-checkboxes__item'])
    expect(checkboxDiv.children().length).to.equal(3)
    assertCheckboxInput(checkboxDiv.children().at(0), `condition-${index}`, index, condition.selected)
    assertLabel(checkboxDiv.children().at(1), condition.condition)
    let actions = checkboxDiv.children().at(2)
    assertSpan(actions)
    let expectedActions = 3
    if (index === 0) {
      expectedActions--
    }
    if (index === conditions.length - 1) {
      expectedActions--
    }
    expect(actions.children().length).to.equal(expectedActions)
    if (condition.grouped) {
      assertCheckboxActionLink(actions.children().at(0), `condition-${index}-split`, 'Split')
    } else {
      assertCheckboxActionLink(actions.children().at(0), `condition-${index}-edit`, 'Edit')
    }
    if (index !== 0) {
      assertCheckboxActionLink(actions.children().at(1), `condition-${index}-move-earlier`, 'Move up')
    }
    if (index !== conditions.length - 1) {
      const actionIndex = index === 0 ? 1 : 2
      assertCheckboxActionLink(actions.children().at(actionIndex), `condition-${index}-move-later`, 'Move down')
    }
  })

  const groupAndRemove = wrapper.find('#group-and-remove')
  expect(groupAndRemove.exists()).to.equal(true)
  const selectedConditions = conditions.filter(condition => condition.selected).length
  // If one child is selected then only the remove link is displayed, if 2 are selected then both group and remove are displayed.
  expect(groupAndRemove.children().length).to.equal(Math.min(selectedConditions, 2))
  if (selectedConditions.length >= 2) {
    assertLink(groupAndRemove.children().at(0), 'group-conditions', 'Group')
    assertLink(groupAndRemove.children().at(1), 'remove-conditions', 'Remove')
  } else if (selectedConditions.length === 1) {
    assertLink(groupAndRemove.children().at(0), 'remove-conditions', 'Remove')
  }
}

import React from 'react'
import {shallow} from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import {
  assertCheckboxInput,
  assertClasses,
  assertDiv,
  assertLabel,
  assertLink,
  assertRequiredTextInput,
  assertSelectInput,
  assertSpan,
  assertText,
  assertTextInput
} from './helpers/element-assertions'
import sinon from 'sinon'
import InlineConditions from '../client/inline-conditions'

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

      beforeEach(() => {
        fields = [
          { name: 'field1', title: 'Something', type: 'TextField' },
          { name: 'field2', title: 'Something else', type: 'TextField' },
          { name: 'field3', title: 'Another thing', type: 'SelectField' }
        ]
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
        expect(conditionsSection.find('#condition-definition-inputs').exists()).to.equal(true)
        expect(conditionsSection.find('#select-condition').exists()).to.equal(false)
        assertLink(inlineConditions.find('#cancel-inline-conditions-link'), 'cancel-inline-conditions-link', 'Cancel')
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
        saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'N')
        expect(wrapper.find('#conditions-display').exists()).to.equal(true)
        wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'or' } })
        fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')
        wrapper.find('#cancel-inline-conditions-link').simulate('click')

        wrapper.find('#inline-conditions-link').simulate('click')

        expect(wrapper.find('#conditions-display').exists()).to.equal(false)
        expect(wrapper.find('#condition-definition-inputs').exists()).to.equal(true)
        assertSelectInput(wrapper.find('#cond-field'), 'cond-field', fields.map(field => ({
          value: field.name,
          text: field.title
        })), '')
        expect(wrapper.find('#cond-operator').exists()).to.equal(false)
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
      const values = [{ value: 'value1', text: 'Value 1' }, { value: 'value2', text: 'Value 2' }]

      before(() => {
        fields = [
          { name: 'field1', title: 'Something', type: 'TextField' },
          { name: 'field2', title: 'Something else', type: 'TextField' },
          { name: 'field3', title: 'Another thing', type: 'SelectField' }
        ]
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
        })

        test('Clicking the add item link presents the field drop down and removes the add item link', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')

          const fieldsGroup = assertAddingFirstCondition(wrapper)

          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(1)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), '')
        })

        test('Selecting a field displays the relevant operators', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })

          const fieldsGroup = assertAddingFirstCondition(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(2)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[0].name)

          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })))
        })

        test('Change field erases operator and value if neither is relevant anymore', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
          wrapper.find('#cond-operator').simulate('change', { target: { value: textFieldOperators[2] } })
          wrapper.find('#cond-value').simulate('change', { target: { value: 'M' } })

          const fieldsGroup = assertAddingFirstCondition(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(4)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[0].name)
          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), textFieldOperators[2])
          assertRequiredTextInput(fieldsChildren.at(2), 'cond-value', 'M')

          wrapper.find('#cond-field').simulate('change', { target: { value: fields[2].name } })

          const updatedFieldsGroup = assertAddingFirstCondition(wrapper)
          const updatedChildren = updatedFieldsGroup.children()
          expect(updatedChildren.length).to.equal(2)
          assertSelectInput(updatedChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[2].name)
          assertSelectInput(updatedChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })))

          wrapper.find('#cond-operator').simulate('change', { target: { value: selectFieldOperators[0] } })

          const withValue = assertAddingFirstCondition(wrapper)
          expect(withValue.children().length).to.equal(3)
          assertSelectInput(withValue.children().at(2), 'cond-value', values)
        })

        test('Change field erases value but keeps operator if operator is still relevant', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
          wrapper.find('#cond-operator').simulate('change', { target: { value: textFieldOperators[0] } })
          wrapper.find('#cond-value').simulate('change', { target: { value: 'M' } })

          const fieldsGroup = assertAddingFirstCondition(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(4)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[0].name)
          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), textFieldOperators[0])
          assertRequiredTextInput(fieldsChildren.at(2), 'cond-value', 'M')

          wrapper.find('#cond-field').simulate('change', { target: { value: fields[2].name } })

          const updatedFieldsGroup = assertAddingFirstCondition(wrapper)
          const updatedChildren = updatedFieldsGroup.children()
          expect(updatedChildren.length).to.equal(3)
          assertSelectInput(updatedChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[2].name)
          assertSelectInput(updatedChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), selectFieldOperators[0])
          assertSelectInput(updatedChildren.at(2), 'cond-value', values)
        })

        test('Clearing field erases all values', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
          wrapper.find('#cond-operator').simulate('change', { target: { value: textFieldOperators[0] } })
          wrapper.find('#cond-value').simulate('change', { target: { value: 'M' } })

          const fieldsGroup = assertAddingFirstCondition(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(4)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[0].name)
          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), textFieldOperators[0])
          assertRequiredTextInput(fieldsChildren.at(2), 'cond-value', 'M')

          wrapper.find('#cond-field').simulate('change', { target: { value: undefined } })

          const updatedFieldsGroup = assertAddingFirstCondition(wrapper)
          const updatedChildren = updatedFieldsGroup.children()
          expect(updatedChildren.length).to.equal(1)
          assertSelectInput(updatedChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), '')
        })

        describe('for a field which does not have an options list', () => {
          textFieldOperators.forEach(operator => {
            test('selecting an operator creates a text value input for ' + operator, () => {
              const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
              wrapper.find('#add-item').simulate('click')
              wrapper.find('#cond-field').simulate('change', { target: { value: fields[0].name } })
              wrapper.find('#cond-operator').simulate('change', { target: { value: operator } })

              const fieldsGroup = assertAddingFirstCondition(wrapper)
              const fieldsChildren = fieldsGroup.children()
              expect(fieldsChildren.length).to.equal(3)
              assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
                value: field.name,
                text: field.title
              })), fields[0].name)
              assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
                value: operator,
                text: operator
              })), operator)
              assertRequiredTextInput(fieldsChildren.at(2), 'cond-value', undefined)
            })
          })

          test('populating a value makes the \'save condition\' link appear', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')

            const fieldsGroup = assertAddingFirstCondition(wrapper)
            const fieldsChildren = fieldsGroup.children()
            expect(fieldsChildren.length).to.equal(4)
            assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
              value: field.name,
              text: field.title
            })), fields[0].name)
            assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
              value: operator,
              text: operator
            })), textFieldOperators[0])
            assertRequiredTextInput(fieldsChildren.at(2), 'cond-value', 'M')
            assertSaveConditionLink(fieldsChildren.at(3))
          })

          test('changing to a blank value makes the \'save condition\' link disappear', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')
            wrapper.find('#cond-value').simulate('change', { target: { value: '' } })

            const fieldsGroup = assertAddingFirstCondition(wrapper)
            const fieldsChildren = fieldsGroup.children()
            expect(fieldsChildren.length).to.equal(3)
            assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
              value: field.name,
              text: field.title
            })), fields[0].name)
            assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
              value: operator,
              text: operator
            })), textFieldOperators[0])
            assertRequiredTextInput(fieldsChildren.at(2), 'cond-value')
          })

          test('removing a value makes the \'save condition\' link disappear', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            fillConditionInputs(wrapper, fields[0].name, textFieldOperators[0], 'M')
            wrapper.find('#cond-value').simulate('change', { target: { value: undefined } })

            const fieldsGroup = assertAddingFirstCondition(wrapper)
            const fieldsChildren = fieldsGroup.children()
            expect(fieldsChildren.length).to.equal(3)
            assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
              value: field.name,
              text: field.title
            })), fields[0].name)
            assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
              value: operator,
              text: operator
            })), textFieldOperators[0])
            assertRequiredTextInput(fieldsChildren.at(2), 'cond-value')
          })

          test('Clicking the \'save condition\' link stores the condition and presents And / Or co-ordinator options', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')

            assertHeaderGroupWithConditionString(wrapper, 'Something is M')
            assertConditionCoordinatorInput(wrapper)
          })
        })

        describe('for a field which has an options list', () => {
          let field

          before(() => {
            field = fields[2]
          })

          selectFieldOperators.forEach(operator => {
            test(`selecting an operator creates a select input for ${operator}`, () => {
              const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
              wrapper.find('#add-item').simulate('click')
              wrapper.find('#cond-field').simulate('change', { target: { value: field.name } })
              wrapper.find('#cond-operator').simulate('change', { target: { value: operator } })

              const fieldsGroup = assertAddingFirstCondition(wrapper)
              expect(fieldsGroup.prop('id')).to.equal('condition-definition-inputs')
              const fieldsChildren = fieldsGroup.children()
              expect(fieldsChildren.length).to.equal(3)
              assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(it => ({
                value: it.name,
                text: it.title
              })), field.name)
              assertSelectInput(fieldsChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
                value: operator,
                text: operator
              })), operator)
              assertSelectInput(fieldsChildren.at(2), 'cond-value', values)
            })
          })

          values.forEach(value => {
            test(`selecting value '${value.text}' makes the 'save condition' link appear`, () => {
              const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
              wrapper.find('#add-item').simulate('click')
              fillConditionInputs(wrapper, field.name, textFieldOperators[0], value.value)

              const fieldsGroup = assertAddingFirstCondition(wrapper)
              expect(fieldsGroup.prop('id')).to.equal('condition-definition-inputs')
              const fieldsChildren = fieldsGroup.children()
              expect(fieldsChildren.length).to.equal(4)
              assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
                value: field.name,
                text: field.title
              })), field.name)
              assertSelectInput(fieldsChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
                value: operator,
                text: operator
              })), textFieldOperators[0])
              assertSelectInput(fieldsChildren.at(2), 'cond-value', values, value.value)
              assertSaveConditionLink(fieldsChildren.at(3))
            })
          })

          test('changing a value leaves the \'save condition\' link in place', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            fillConditionInputs(wrapper, field.name, textFieldOperators[0], values[0].value)
            wrapper.find('#cond-value').simulate('change', { target: { value: values[1].value } })

            const fieldsGroup = assertAddingFirstCondition(wrapper)
            expect(fieldsGroup.prop('id')).to.equal('condition-definition-inputs')
            const fieldsChildren = fieldsGroup.children()
            expect(fieldsChildren.length).to.equal(4)
            assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
              value: field.name,
              text: field.title
            })), field.name)
            assertSelectInput(fieldsChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
              value: operator,
              text: operator
            })), textFieldOperators[0])
            assertSelectInput(fieldsChildren.at(2), 'cond-value', values, values[1].value)
            assertSaveConditionLink(fieldsChildren.at(3))
          })

          test('Removing a value removes the \'save condition\' link', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            fillConditionInputs(wrapper, field.name, textFieldOperators[0], values[0].value)
            wrapper.find('#cond-value').simulate('change', { target: { value: undefined } })

            const fieldsGroup = assertAddingFirstCondition(wrapper)
            expect(fieldsGroup.prop('id')).to.equal('condition-definition-inputs')
            const fieldsChildren = fieldsGroup.children()
            expect(fieldsChildren.length).to.equal(3)
            assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
              value: field.name,
              text: field.title
            })), field.name)
            assertSelectInput(fieldsChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
              value: operator,
              text: operator
            })), textFieldOperators[0])
            assertSelectInput(fieldsChildren.at(2), 'cond-value', values)
          })

          test('Selecting a blank value removes the \'save condition\' link', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            fillConditionInputs(wrapper, field.name, textFieldOperators[0], values[0].value)
            wrapper.find('#cond-value').simulate('change', { target: { value: '' } })

            const fieldsGroup = assertAddingFirstCondition(wrapper)
            expect(fieldsGroup.prop('id')).to.equal('condition-definition-inputs')
            const fieldsChildren = fieldsGroup.children()
            expect(fieldsChildren.length).to.equal(3)
            assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
              value: field.name,
              text: field.title
            })), field.name)
            assertSelectInput(fieldsChildren.at(1), 'cond-operator', selectFieldOperators.map(operator => ({
              value: operator,
              text: operator
            })), textFieldOperators[0])
            assertSelectInput(fieldsChildren.at(2), 'cond-value', values)
          })

          test('Clicking the \'save condition\' link stores the condition and presents And / Or co-ordinator options', () => {
            const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
            wrapper.find('#add-item').simulate('click')
            saveCondition(wrapper, field.name, selectFieldOperators[0], values[0].value)

            assertHeaderGroupWithConditionString(wrapper, 'Another thing is Value 1')
            assertConditionCoordinatorInput(wrapper)
            assertNoFieldsGroup(wrapper)
          })
        })

        test('Adding multiple conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[1], 'N')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'or' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], 'value1')

          assertHeaderGroupWithConditionString(wrapper, '(Something is M and Something else is not N) or Another thing is Value 1')
          assertConditionCoordinatorInput(wrapper)
          assertNoFieldsGroup(wrapper)
        })

        test('Changing to a blank coordinator', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: '' } })

          assertHeaderGroupWithConditionString(wrapper, 'Something is M')
          assertConditionCoordinatorInput(wrapper)
          assertNoFieldsGroup(wrapper)
        })

        test('Changing to an undefined coordinator', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: undefined } })

          assertHeaderGroupWithConditionString(wrapper, 'Something is M')
          assertConditionCoordinatorInput(wrapper)
          assertNoFieldsGroup(wrapper)
        })
      })

      describe('editing conditions', () => {
        test('Clicking the edit link causes editing view to be rendered', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#edit-conditions-link').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M')
          assertEditPanel(wrapper, [{ condition: 'Something is M' }])
        })

        test('Clicking the edit link for a single condition causes the field definition inputs to be pre-populated', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-0-edit').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M')
          const fieldsGroup = assertFieldsGroup(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(4)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[0].name)
          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), textFieldOperators[0])
          assertTextInput(fieldsChildren.at(2), 'cond-value', 'M')
          assertSaveConditionLink(fieldsChildren.at(3))
        })

        test('Co-ordinator is not present when editing the first condition of many', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-0-edit').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M and Something else is N')
          const fieldsGroup = assertFieldsGroup(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(4)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[0].name)
          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), textFieldOperators[0])
          assertTextInput(fieldsChildren.at(2), 'cond-value', 'M')
          assertSaveConditionLink(fieldsChildren.at(3))
        })

        test('Co-ordinator is present when editing any subsequent condition', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-1-edit').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M and Something else is N')
          assertConditionCoordinatorInput(wrapper, 'and')
          const fieldsGroup = assertFieldsGroup(wrapper)
          const fieldsChildren = fieldsGroup.children()
          expect(fieldsChildren.length).to.equal(4)
          assertSelectInput(fieldsChildren.at(0), 'cond-field', fields.map(field => ({
            value: field.name,
            text: field.title
          })), fields[1].name)
          assertSelectInput(fieldsChildren.at(1), 'cond-operator', textFieldOperators.map(operator => ({
            value: operator,
            text: operator
          })), textFieldOperators[0])
          assertTextInput(fieldsChildren.at(2), 'cond-value', 'N')
          assertSaveConditionLink(fieldsChildren.at(3))
        })

        test('Saving edits to condition results in an updated condition string and returns the users to an updated edit panel', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#condition-1-edit').simulate('click')

          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'or' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[1], values[0].value)

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M or Another thing is not Value 1')
          assertEditPanel(wrapper, [{ condition: 'Something is M' }, { condition: 'or Another thing is not Value 1' }])
        })

        test('Grouping conditions combines them into a single condition which can be split but not edited', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M and Something else is N')
          assertEditPanel(wrapper, [{
            condition: 'Something is M',
            selected: true
          }, { condition: 'and Something else is N', selected: true }])

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '(Something is M and Something else is N)')
          assertEditPanel(wrapper, [{ condition: '(Something is M and Something else is N)', grouped: true }])
        })

        test('should not group non-consecutive conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], values[0].value)
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-2').simulate('change', { target: { value: '2', checked: true } })

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M and Something else is N and Another thing is Value 1')
          assertEditPanel(wrapper, [{
            condition: 'Something is M',
            selected: true
          }, { condition: 'and Something else is N' },
          { condition: 'and Another thing is Value 1', selected: true }])

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M and Something else is N and Another thing is Value 1')
          assertEditPanel(wrapper, [{
            condition: 'Something is M',
            selected: true
          }, { condition: 'and Something else is N' },
          {
            condition: 'and Another thing is Value 1',
            selected: true
          }], 'Error: Please select consecutive items to group')
        })

        test('should group multiple consecutive condition groups', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'or' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], values[0].value)
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'or' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], values[0].value)
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'Y')
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })
          wrapper.find('#condition-3').simulate('change', { target: { value: '3', checked: true } })
          wrapper.find('#condition-4').simulate('change', { target: { value: '4', checked: true } })

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M or (Something else is N and Another thing is Value 1) or (Another thing is Value 1 and Something else is Y)')
          assertEditPanel(wrapper, [{
            condition: 'Something is M',
            selected: true
          }, { condition: 'or Something else is N', selected: true },
          { condition: 'and Another thing is Value 1' }, {
            condition: 'or Another thing is Value 1',
            selected: true
          }, { condition: 'and Something else is Y', selected: true }])

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '((Something is M or Something else is N) and Another thing is Value 1) or (Another thing is Value 1 and Something else is Y)')
          assertEditPanel(wrapper, [{ condition: '(Something is M or Something else is N)', grouped: true },
            { condition: 'and Another thing is Value 1' }, {
              condition: 'or (Another thing is Value 1 and Something else is Y)',
              grouped: true
            }])
        })

        test('splitting grouped conditions returns them to their original components', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          wrapper.find('#group-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, '(Something is M and Something else is N)')
          assertEditPanel(wrapper, [{
            condition: '(Something is M and Something else is N)',
            grouped: true
          }])

          wrapper.find('#condition-0-split').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something is M and Something else is N')
          assertEditPanel(wrapper, [{ condition: 'Something is M' }, { condition: 'and Something else is N' }])
        })

        test('removing selected conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], values[0].value)
          wrapper.find('#edit-conditions-link').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-2').simulate('change', { target: { value: '2', checked: true } })

          wrapper.find('#remove-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Something else is N')
          assertEditPanel(wrapper, [{ condition: 'Something else is N' }])
        })

        test('Should deselect conditions', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], values[0].value)
          wrapper.find('#edit-conditions-link').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-0').simulate('change', { target: { value: '0' } })

          expect(wrapper.find('#remove-conditions').exists()).to.equal(false)
        })

        test('removing grouped conditions removes everything in the group', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[2].name, selectFieldOperators[0], values[0].value)
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          wrapper.find('#group-conditions').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#remove-conditions').simulate('click')

          assertEditingHeaderGroupWithConditionString(wrapper, 'Another thing is Value 1')
          assertEditPanel(wrapper, [{ condition: 'Another thing is Value 1' }])
        })

        test('removing last condition returns the user to the original add display', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#cond-coordinator').simulate('change', { target: { value: 'and' } })
          saveCondition(wrapper, fields[1].name, textFieldOperators[0], 'N')
          wrapper.find('#edit-conditions-link').simulate('click')

          expect(wrapper.find('#condition-0').exists()).to.equal(true)
          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#condition-1').simulate('change', { target: { value: '1', checked: true } })

          wrapper.find('#group-conditions').simulate('click')

          wrapper.find('#condition-0').simulate('change', { target: { value: '0', checked: true } })
          wrapper.find('#remove-conditions').simulate('click')

          assertHeaderAndAddItemDisplayed(wrapper)
        })

        test('exiting edit view returns user to the add condition view', () => {
          const wrapper = shallow(<InlineConditions data={data} path={path} conditionsChange={conditionsChange} />)
          wrapper.find('#add-item').simulate('click')
          saveCondition(wrapper, fields[0].name, textFieldOperators[0], 'M')
          wrapper.find('#edit-conditions-link').simulate('click')
          wrapper.find('#exit-edit-link').simulate('click')

          assertHeaderGroupWithConditionString(wrapper, 'Something is M')
          assertConditionCoordinatorInput(wrapper)
          assertNoFieldsGroup(wrapper)
        })
      })
    })
  })
})

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

function assertAddingFirstCondition (wrapper) {
  assertHeaderLabel(wrapper)
  assertLabel(wrapper.find('#inline-condition-header').find('label'), 'When')

  const inlineConditionsGroup = wrapper.find('#inline-conditions')
  expect(inlineConditionsGroup.find('#cond-coordinator-group').exists()).to.equal(false)
  expect(inlineConditionsGroup.find('#condition-definition-inputs').exists()).to.equal(true)
  return assertFieldsGroup(inlineConditionsGroup)
}

function assertFieldsGroup (wrapper) {
  const fieldsDefGroup = wrapper.find('#condition-definition-group')
  expect(fieldsDefGroup.hasClass('govuk-form-group')).to.equal(true)
  return fieldsDefGroup.find('#condition-definition-inputs')
}

function assertNoFieldsGroup (wrapper) {
  expect(wrapper.find('#condition-definition-inputs').exists()).to.equal(false)
}

function assertSaveConditionLink (wrapper) {
  assertDiv(wrapper, ['govuk-form-group'])
  expect(wrapper.children().length).to.equal(1)
  assertLink(wrapper.children().at(0), 'save-condition', 'Save condition')
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

  const editPanelChildren = editConditionsPanel.children()
  expect(editPanelChildren.length).to.equal(2)

  const fieldSet = editConditionsPanel.find('fieldset')

  const legend = fieldSet.find('legend')
  expect(legend.text()).to.equal('Select conditions to group / remove')

  assertLink(fieldSet.find('#exit-edit-link'), 'exit-edit-link', 'Exit')

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

  const groupAndRemove = editPanelChildren.at(1)
  assertDiv(groupAndRemove)
  expect(groupAndRemove.prop('id')).to.equal('group-and-remove')

  const selectedConditions = conditions.filter(condition => condition.selected).length
  // If one child is selected then only the remove link is displayed, if 2 are selected then both group and remove are displayed.
  expect(groupAndRemove.children().length).to.equal(Math.min(selectedConditions, 2))
  if (selectedConditions.length >= 2) {
    assertLink(groupAndRemove.children().at(0), 'group-conditions', 'Group')
    assertLink(groupAndRemove.children().at(1), 'remove-conditions', 'Remove')
  } else if (selectedConditions.length === 1) {
    assertLink(groupAndRemove.children().at(0), 'remove-conditions', 'Remove')
  } else {}
}

function assertConditionCoordinatorInput (wrapper, expectedValue) {
  const conditionCoordinatorGroup = wrapper.find('#cond-coordinator-group')
  expect(conditionCoordinatorGroup.hasClass('govuk-form-group')).to.equal(true)

  assertSelectInput(conditionCoordinatorGroup.find('select'), 'cond-coordinator', [{ value: 'and', text: 'And' }, { value: 'or', text: 'Or' }], expectedValue || '')
}

function saveCondition (wrapper, fieldName, operator, value) {
  fillConditionInputs(wrapper, fieldName, operator, value)
  wrapper.find('#save-condition').simulate('click')
}

function fillConditionInputs (wrapper, fieldName, operator, value) {
  wrapper.find('#cond-field').simulate('change', { target: { value: fieldName } })
  wrapper.find('#cond-operator').simulate('change', { target: { value: operator } })
  wrapper.find('#cond-value').simulate('change', { target: { value: value } })
}

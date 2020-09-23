import React from 'react'
import { render, mount, shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { ComponentTypes, Data } from '@xgovformbuilder/model'
import ComponentTypeEdit from '../client/component-type-edit'

import sinon from 'sinon'
import { assertCheckboxInput, assertRequiredTextInput, assertTextArea } from './helpers/element-assertions'
import { componentCases } from './component-type-edit.cases'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, describe } = lab

suite('Component type edit', () => {
  const data = new Data({
    lists: [{
      name: 'myList',
      type: 'number',
      items: [
        { text: 'Some Text', value: 'myValue', description: 'A hint' },
        { text: 'Some Text 2', value: 'myValue2', conditional: { components: [{ type: 'TextField' }] } },
        { text: 'Some Text 3', value: 'myValue3', condition: 'Azhgeqw' }
      ]
    }]
  })

  const nextId = 'abcdef'
  data.getId = sinon.stub()
  data.getId.resolves(nextId)

  const page = sinon.spy()

  describe('FileUploadField type gets the standard inputs but is always optional', () => {
    const cases = [
      { case: 'with all options provided', options: { hideTitle: true, optionalText: false }, hint: 'a hint' },
      { case: 'with title hidden', options: { hideTitle: true } },
      { case: 'with title explicitly not hidden', options: { hideTitle: false } },
      { case: 'with optional text hidden', options: { optionalText: false } },
      { case: 'with optional text explicitly not hidden', options: { optionalText: true } },
      { case: 'with no options' }
    ]

    cases.forEach(testCase => {
      test(`${testCase.case}`, () => {
        const wrapper = render(<ComponentTypeEdit data={data} component={{ type: 'FileUploadField', name: 'myComponent', title: 'My component', hint: testCase.hint, options: testCase.options }} />)
        const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
        expect(standardInputs.length).to.equal(1)
        const inputs = standardInputs.find('input')
        expect(inputs.length).to.equal(5)

        assertRequiredTextInput(inputs.get(0), 'field-title', 'My component', { name: 'title' })
        assertCheckboxInput(inputs.get(1), 'field-options-hideTitle', 'true', testCase.options?.hideTitle || '', { name: 'options.hideTitle' })
        assertRequiredTextInput(inputs.get(2), 'field-name', 'myComponent', { name: 'name', pattern: '^\\S+' })
        assertCheckboxInput(inputs.get(3), 'field-options-required', undefined, true, { name: 'options.required' })
        assertCheckboxInput(inputs.get(4), 'field-options-optionalText', undefined, testCase.options?.optionalText === false || '', { name: 'options.optionalText' })
        assertOptionalTextWrapper(inputs.get(4), true)

        const textAreas = standardInputs.find('textarea')
        expect(textAreas.length).to.equal(1)
        assertTextArea(textAreas.get(0), 'field-hint', testCase.hint || '', { name: 'hint', rows: '2' })

        const selects = standardInputs.find('select')
        expect(selects.length).to.equal(0)
      })
    })
  })

  describe('Populating the component model', () => {
    componentCases.forEach(testCase => {
      test(`${testCase.name} for ${testCase.type} component results in the appropriate model being passed to the callback function`, () => {
        const updateModel = sinon.spy()

        const component = { ...testCase.componentInitialState, type: testCase.type }
        const wrapper = mount(<ComponentTypeEdit data={data} component={component} updateModel={updateModel}/>)
        const field = wrapper.find(`#${testCase.fieldId}`)
        field.simulate(testCase.event, { target: { value: testCase.value } })
        expect(updateModel.firstCall.args[0]).to.equal(testCase.expectedModel)
        expect(field.exists()).to.equal(true)
        expect(updateModel.callCount).to.equal(1)
      })
    })
  })

  const componentTypesWithValues = ['RadiosField', 'CheckboxesField', 'SelectField', 'List', 'FlashCard']

  componentTypesWithValues.forEach(componentType => {
    test(`${componentType} component renders the ComponentValues component correctly`, () => {
      const updateModel = sinon.spy()

      const component = { type: componentType }
      const wrapper = shallow(<ComponentTypeEdit data={data} component={component} updateModel={updateModel} page={page}/>).dive()

      const field = wrapper.find('ComponentValues')
      expect(field.exists()).to.equal(true)
      expect(Object.keys(field.props()).length).to.equal(5)
      expect(field.prop('component')).to.equal(component)
      expect(field.prop('data')).to.equal(data)
      expect(field.prop('updateModel')).to.equal(updateModel)
      expect(field.prop('page')).to.equal(page)
      expect(field.prop('EditComponentView')).to.equal(ComponentTypeEdit)
    })
  })

  const inputsExcludingFileUpload = ComponentTypes.filter(type => type.subType === 'field').filter(type => type.name !== 'FileUploadField')
  inputsExcludingFileUpload.forEach(componentType => {
    test(`${componentType.name} type gets the standard inputs and is required by default`, () => {
      const wrapper = render(<ComponentTypeEdit data={data} component={{ type: componentType.name, name: 'myComponent', title: 'My component' }} />)
      const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
      expect(standardInputs.length).to.equal(1)
      const inputs = standardInputs.find('input')
      expect(inputs.length).to.equal(5)

      assertRequiredTextInput(inputs.get(0), 'field-title', 'My component', { name: 'title' })
      assertCheckboxInput(inputs.get(1), 'field-options-hideTitle', 'true', '', { name: 'options.hideTitle' })
      assertRequiredTextInput(inputs.get(2), 'field-name', 'myComponent', { name: 'name', pattern: '^\\S+' })
      assertCheckboxInput(inputs.get(3), 'field-options-required', undefined, '', { name: 'options.required' })
      assertCheckboxInput(inputs.get(4), 'field-options-optionalText', undefined, '', { name: 'options.optionalText' })
      assertOptionalTextWrapper(inputs.get(4), true)

      const textAreas = standardInputs.find('textarea')
      expect(textAreas.length).to.equal(1)
      assertTextArea(textAreas.get(0), 'field-hint', '', { name: 'hint', rows: '2' })

      const selects = standardInputs.find('select')
      expect(selects.length).to.equal(0)
    })

    describe(`${componentType.name} type has correctly pre-populated inputs `, () => {
      const optionalCases = [
        { case: 'with all options provided', options: { hideTitle: true, required: false, optionalText: false }, hint: 'a hint' },
        { case: 'with optional text unspecified', options: { required: false } },
        { case: 'with optional text hidden', options: { required: false, optionalText: false } },
        { case: 'with optional text explicitly not hidden', options: { required: false, optionalText: true } }
      ]

      optionalCases.forEach(testCase => {
        test(`when specified as optional ${testCase.case}`, () => {
          const wrapper = render(<ComponentTypeEdit data={data} component={{ type: componentType.name, name: 'myComponent', title: 'My component', hint: testCase.hint, options: testCase.options }} />)
          const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
          expect(standardInputs.length).to.equal(1)
          const inputs = standardInputs.find('input')

          expect(inputs.length).to.equal(5)
          // TODO:- getting input by index is dangerous.. it makes changing order of components a bit of a pain 😭
          assertRequiredTextInput(inputs.get(0), 'field-title', 'My component', { name: 'title' })
          assertCheckboxInput(inputs.get(1), 'field-options-hideTitle', 'true', testCase.options?.hideTitle || '', { name: 'options.hideTitle' })
          assertRequiredTextInput(inputs.get(2), 'field-name', 'myComponent', { name: 'name', pattern: '^\\S+' })
          assertCheckboxInput(inputs.get(3), 'field-options-required', undefined, true, { name: 'options.required' })
          assertCheckboxInput(inputs.get(4), 'field-options-optionalText', undefined, testCase.options?.optionalText === false || '', { name: 'options.optionalText' })
          assertOptionalTextWrapper(inputs.get(4))

          const textAreas = standardInputs.find('textarea')
          expect(textAreas.length).to.equal(1)
          assertTextArea(textAreas.get(0), 'field-hint', testCase.hint || '', { name: 'hint', rows: '2' })

          const selects = standardInputs.find('select')
          expect(selects.length).to.equal(0)
        })
      })

      const nonOptionalCases = [
        { case: 'with no options' },
        { case: 'with title hidden', options: { hideTitle: true } },
        { case: 'with title explicitly not hidden', options: { hideTitle: false } },
        { case: 'with required explicitly true', options: { required: true } }
      ]

      nonOptionalCases.forEach(testCase => {
        test(`when not specified as optional ${testCase.case}`, () => {
          const wrapper = render(<ComponentTypeEdit data={data} component={{ type: componentType.name, name: 'myComponent', title: 'My component', hint: testCase.hint, options: testCase.options }} />)
          const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
          expect(standardInputs.length).to.equal(1)
          const inputs = standardInputs.find('input')

          expect(inputs.length).to.equal(5)

          assertRequiredTextInput(inputs.get(0), 'field-title', 'My component', { name: 'title' })
          assertCheckboxInput(inputs.get(1), 'field-options-hideTitle', 'true', testCase.options?.hideTitle || '', { name: 'options.hideTitle' })
          assertRequiredTextInput(inputs.get(2), 'field-name', 'myComponent', { name: 'name', pattern: '^\\S+' })
          assertCheckboxInput(inputs.get(3), 'field-options-required', undefined, '', { name: 'options.required' })
          assertCheckboxInput(inputs.get(4), 'field-options-optionalText', undefined, '', { name: 'options.optionalText' })
          assertOptionalTextWrapper(inputs.get(4), true)

          const textAreas = standardInputs.find('textarea')
          expect(textAreas.length).to.equal(1)
          assertTextArea(textAreas.get(0), 'field-hint', testCase.hint || '', { name: 'hint', rows: '2' })

          const selects = standardInputs.find('select')
          expect(selects.length).to.equal(0)
        })
      })
    })
  })

  describe('optional checkbox', () => {
    test('clicking checkbox should toggle checked', () => {
      const wrapper = mount(<ComponentTypeEdit data={data} component={{ type: 'TextField', name: 'myComponent', title: 'My component' }} updateModel={sinon.spy()} />)
      const checkbox = wrapper.find('#field-options-required')
      const optionalText = wrapper.find('[data-test-id="field-options.optionalText-wrapper"]')
      expect(checkbox.exists()).to.equal(true)
      expect(optionalText.instance().hidden).to.equal(true)
      expect(checkbox.props().checked).to.equal(false)
      checkbox.simulate('change', { target: { checked: true } })
      expect(checkbox.instance().checked).to.equal(true)
      expect(optionalText.instance().hidden).to.equal(false)
    })
  })

  describe('controlled name field', () => {
    test('error messages shows up when whitespaces are entered', () => {
      const wrapper = mount(<ComponentTypeEdit data={data} component={{ type: 'TextField', name: 'myComponent', title: 'My component' }}/>)
      const field = wrapper.find('#field-name')
      field.simulate('change', { target: { value: `this${randomWhitespaceCharacter()}value${randomWhitespaceCharacter()}has dif${whitespaceCharacters.join('')}ferent spaces${randomWhitespaceCharacter()} in it` } })
      wrapper.update()
      expect(wrapper.find('#field-name').hasClass('govuk-input--error')).to.equal(true)
      expect(wrapper.find('#field-name').parent().hasClass('govuk-form-group--error')).to.equal(true)
      expect(wrapper.find('.govuk-error-message').exists()).to.equal(true)
    })
  })
})

function assertOptionalTextWrapper (input, hidden) {
  const wrappingDiv = input.parent.parent
  expect(wrappingDiv.attribs.hidden).to.equal(hidden ? '' : undefined)
}
const whitespaceCharacters = ['\u0020',
  '\u00A0',
  '\u2000',
  '\u2001',
  '\u2002',
  '\u2003',
  '\u2004',
  '\u2005',
  '\u2006',
  '\u2007',
  '\u2008',
  '\u2009',
  '\u200A',
  '\u2028',
  '\u205F',
  '\u3000']

const randomWhitespaceCharacter = () => {
  return whitespaceCharacters[Math.floor(Math.random() * whitespaceCharacters.length)]
}

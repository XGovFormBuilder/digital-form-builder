import React from 'react'
import { mount, shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { ComponentTypes, Data } from '@xgovformbuilder/model'
import sinon from 'sinon'
import ComponentTypeEdit from '../client/component-type-edit'

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
        const wrapper = mount(
          <ComponentTypeEdit
            data={data}
            component={{
              type: 'FileUploadField',
              name: 'myComponent',
              title: 'My component',
              hint: testCase.hint,
              options: testCase.options
            }}
          />
        )

        const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
        expect(standardInputs.length).to.equal(1)

        const inputs = standardInputs.find('input')
        expect(inputs.length).to.equal(5)

        assertRequiredTextInput({
          wrapper: inputs.at(0),
          id: 'field-title',
          expectedValue: 'My component'
        })

        assertCheckboxInput({
          wrapper: inputs.at(1),
          id: 'field-options-hideTitle',
          value: true,
          checked: testCase.options?.hideTitle || false,
          attrs: { name: 'options.hideTitle' }
        })

        assertRequiredTextInput({
          wrapper: inputs.at(2),
          id: 'field-name',
          expectedValue: 'myComponent'
        })

        assertCheckboxInput({
          wrapper: inputs.at(3),
          id: 'field-options-required',
          value: undefined,
          checked: true,
          attrs: { name: 'options.required' }
        })

        assertCheckboxInput({
          wrapper: inputs.at(4),
          id: 'field-options-optionalText',
          value: undefined,
          checked: testCase.options?.optionalText === false || false,
          attrs: { name: 'options.optionalText' }
        })

        expect(
          wrapper.find('[data-test-id="field-options.optionalText-wrapper"]')
            .prop('hidden')
        ).to.equal(true)

        const textarea = standardInputs.find('Textarea').first()

        assertTextArea({
          wrapper: textarea,
          id: 'field-hint',
          expectedValue: (testCase.hint || ''),
          attrs: { name: 'hint', rows: 2 }
        })

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
        expect(field.exists()).to.equal(true)
        field.prop(testCase.event)({ target: { value: testCase.value } })
        expect(updateModel.firstCall.args[0], JSON.stringify(testCase)).to.equal(testCase.expectedModel)
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

  const inputsExcludingFileUpload = ComponentTypes
    .filter(type => type.subType === 'field')
    .filter(type => type.name !== 'FileUploadField')

  inputsExcludingFileUpload.forEach(componentType => {
    test(`${componentType.name} type gets the standard inputs and is required by default`, () => {
      const wrapper = mount(
        <ComponentTypeEdit
          data={data}
          component={{ type: componentType.name, name: 'myComponent', title: 'My component' }}
        />
      )
      const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
      expect(standardInputs.length).to.equal(1)
      const inputs = standardInputs.find('input')
      expect(inputs.length).to.equal(5)

      assertRequiredTextInput({
        wrapper: inputs.at(0),
        id: 'field-title',
        expectedValue: 'My component'
      })

      assertCheckboxInput({
        wrapper: inputs.at(1),
        id: 'field-options-hideTitle',
        value: true,
        checked: false,
        attrs: { name: 'options.hideTitle' }
      })

      assertRequiredTextInput({
        wrapper: inputs.at(2),
        id: 'field-name',
        expectedValue: 'myComponent',
        attrs: { name: 'name', pattern: '^\\S+' }
      })

      assertCheckboxInput({
        wrapper: inputs.at(3),
        id: 'field-options-required',
        value: undefined,
        checked: false,
        attrs: { name: 'options.required' }
      })

      assertCheckboxInput({
        wrapper: inputs.at(4),
        id: 'field-options-optionalText',
        value: undefined,
        checked: false,
        attrs: { name: 'options.optionalText' }
      })

      expect(
        wrapper.find('[data-test-id="field-options.optionalText-wrapper"]').prop('hidden')
      ).to.equal(true)

      const textAreas = standardInputs.find('Textarea')

      expect(textAreas.length).to.equal(1)

      assertTextArea({
        wrapper: textAreas.at(0),
        id: 'field-hint',
        expectedValue: '',
        attrs: { name: 'hint', rows: 2 }
      })

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
          const wrapper = mount(
            <ComponentTypeEdit
              data={data}
              component={{
                type: componentType.name,
                name: 'myComponent',
                title: 'My component',
                hint: testCase.hint,
                options: testCase.options
              }}
            />
          )

          const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
          expect(standardInputs.length).to.equal(1)

          const inputs = standardInputs.find('input')
          expect(inputs.length).to.equal(5)

          assertRequiredTextInput({
            wrapper: inputs.at(0),
            id: 'field-title',
            expectedValue: 'My component'
          })

          assertCheckboxInput({
            wrapper: inputs.at(1),
            id: 'field-options-hideTitle',
            value: true,
            checked: testCase.options?.hideTitle || false
          })

          assertRequiredTextInput({
            wrapper: inputs.at(2),
            id: 'field-name',
            expectedValue: 'myComponent'
          })

          assertCheckboxInput({
            wrapper: inputs.at(3),
            id: 'field-options-required',
            value: undefined,
            checked: true
          })

          assertCheckboxInput({
            wrapper: inputs.at(4),
            id: 'field-options-optionalText',
            value: undefined,
            checked: testCase.options?.optionalText === false || false
          })

          expect(
            wrapper.find('[data-test-id="field-options.optionalText-wrapper"]')
              .prop('hidden')
          ).to.equal(false)

          const textAreas = standardInputs.find('Textarea')
          expect(textAreas.length).to.equal(1)

          assertTextArea({
            wrapper: textAreas.at(0),
            id: 'field-hint',
            expectedValue: testCase.hint || '',
            attrs: { name: 'hint', rows: 2 }
          })

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
          const wrapper = mount(
            <ComponentTypeEdit
              data={data}
              component={{
                type: componentType.name,
                name: 'myComponent',
                title: 'My component',
                hint: testCase.hint,
                options: testCase.options
              }}
            />
          )

          const standardInputs = wrapper.find('[data-test-id="standard-inputs"]')
          expect(standardInputs.length).to.equal(1)
          const inputs = standardInputs.find('input')

          expect(inputs.length).to.equal(5)

          assertRequiredTextInput({
            wrapper: inputs.at(0),
            id: 'field-title',
            expectedValue: 'My component'
          })

          assertCheckboxInput({
            wrapper: inputs.at(1),
            id: 'field-options-hideTitle',
            value: true,
            checked: testCase.options?.hideTitle || false
          })

          assertRequiredTextInput({
            wrapper: inputs.at(2),
            id: 'field-name',
            expectedValue: 'myComponent'
          })

          assertCheckboxInput({
            wrapper: inputs.at(3),
            id: 'field-options-required',
            value: undefined,
            checked: false
          })

          assertCheckboxInput({
            wrapper: inputs.at(4),
            id: 'field-options-optionalText',
            value: undefined,
            checked: false
          })

          expect(
            wrapper.find('[data-test-id="field-options.optionalText-wrapper"]')
              .prop('hidden')
          ).to.equal(true)

          const textAreas = standardInputs.find('Textarea')
          expect(textAreas.length).to.equal(1)

          assertTextArea({
            wrapper: textAreas.at(0),
            id: 'field-hint',
            expectedValue: testCase.hint || '',
            attrs: { name: 'hint', rows: 2 }
          })

          const selects = standardInputs.find('select')
          expect(selects.length).to.equal(0)
        })
      })
    })
  })

  describe('optional checkbox', () => {
    test('clicking checkbox should toggle checked', () => {
      const wrapper = mount(
        <ComponentTypeEdit
          data={data}
          component={{ type: 'TextField', name: 'myComponent', title: 'My component' }}
          updateModel={sinon.spy()}
        />
      )

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
})

import React from 'react'
import { shallow } from 'enzyme'
import * as Lab from '@hapi/lab'
import * as Code from '@hapi/code'
import { Data } from '@xgovformbuilder/model'
import sinon from 'sinon'
import ComponentValues from '../client/components/component-values'
import { assertRadioButton, assertSelectInput } from './helpers/element-assertions'
import { clone } from '@xgovformbuilder/model'

const lab = Lab.script()
exports.lab = lab
const { afterEach, before, describe, suite, test } = lab
const { expect } = Code

suite('Component values', () => {
  const data = new Data(
    {
      lists: [
        { name: 'myList', title: 'My list', type: 'number', items: [{ text: 'An item', description: 'A hint', value: 12 }] },
        {
          name: 'anotherList',
          title: 'Another list',
          type: 'string',
          items: [
            { text: 'My item', value: '12' },
            { text: 'Item 2', description: 'My hint', value: '11', condition: 'Abcewdad' },
            { text: 'Item 3', value: '11', conditional: { components: [{ type: 'TextField' }] } }
          ]
        }
      ]
    }
  )

  const page = sinon.spy()

  const expectedListSelectionOptions = [
    { text: '' },
    { text: 'My list', value: 'myList', items: [{ text: 'A thing', value: 'aThing', description: 'This is bonkers' }, { text: 'Another thing', value: 'anotherThing' }] },
    { text: 'Another list', value: 'anotherList' }
  ]

  const updateModel = sinon.spy()

  before(() => {
    data.clone = sinon.stub()
    data.save = sinon.stub()
  })

  afterEach(() => {
    updateModel.resetHistory()
  })

  test('Should render question as to the type of value population if component has no value type already', () => {
    const component = { type: 'RadiosField', name: 'myComponent' }
    const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

    assertRadioButton(wrapper.find('#population-type-list'), 'population-type-list', 'listRef', 'From a list', { defaultChecked: false })
    assertRadioButton(wrapper.find('#population-type-static'), 'population-type-static', 'static', 'I\'ll populate my own entries', { defaultChecked: false })
  })

  describe('Connecting to a list', () => {
    test('Should render the list selection input when list type is chosen', () => {
      const component = { type: 'RadiosField', name: 'myComponent' }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#population-type-list').simulate('click', { target: { value: 'listRef' } })

      assertRadioButton(wrapper.find('#population-type-list'), 'population-type-list', 'listRef', 'From a list', { defaultChecked: true })
      assertRadioButton(wrapper.find('#population-type-static'), 'population-type-static', 'static', 'I\'ll populate my own entries', { defaultChecked: false })
      assertSelectInput(wrapper.find('#field-options-list'), 'field-options-list', expectedListSelectionOptions)
    })

    test('Should render list selection where the component already has a list selected', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'listRef', list: 'myList' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      assertRadioButton(wrapper.find('#population-type-list'), 'population-type-list', 'listRef', 'From a list', { defaultChecked: true })
      assertRadioButton(wrapper.find('#population-type-static'), 'population-type-static', 'static', 'I\'ll populate my own entries', { defaultChecked: false })

      assertSelectInput(wrapper.find('#field-options-list'), 'field-options-list', expectedListSelectionOptions, 'myList')
      expect(updateModel.callCount).to.equal(0)
    })

    test('Should not display the add value link', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'listRef', list: 'myList' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      expect(wrapper.find('#add-value-link').exists()).to.equal(false)
    })

    test('Should not update model when the list population type is chosen', () => {
      const component = { type: 'RadiosField', name: 'myComponent' }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#population-type-list').simulate('click', { target: { value: 'listRef' } })

      expect(updateModel.callCount).to.equal(0)
    })

    test('Should update model in the expected fashion when a list is selected', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'listRef', list: 'myList' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#field-options-list').simulate('change', { target: { value: 'anotherList' } })
      expect(updateModel.callCount).to.equal(1)

      const expected = {
        type: 'RadiosField',
        name: 'myComponent',
        values: { type: 'listRef', list: 'anotherList' }
      }
      expect(updateModel.firstCall.args[0]).to.equal(expected)
    })
  })

  describe('Populating own inputs', () => {
    test('Should render the list selection input when static type is chosen', () => {
      const component = { type: 'RadiosField', name: 'myComponent' }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#population-type-static').simulate('click', { target: { value: 'static' } })

      assertRadioButton(wrapper.find('#population-type-list'), 'population-type-list', 'listRef', 'From a list', { defaultChecked: false })
      assertRadioButton(wrapper.find('#population-type-static'), 'population-type-static', 'static', 'I\'ll populate my own entries', { defaultChecked: true })
      assertSelectInput(wrapper.find('#field-options-list'), 'field-options-list', expectedListSelectionOptions)
    })

    test('Should render list selection where the component already has type selected but no values', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      assertRadioButton(wrapper.find('#population-type-list'), 'population-type-list', 'listRef', 'From a list', { defaultChecked: false })
      assertRadioButton(wrapper.find('#population-type-static'), 'population-type-static', 'static', 'I\'ll populate my own entries', { defaultChecked: true })

      assertSelectInput(wrapper.find('#field-options-list'), 'field-options-list', expectedListSelectionOptions)
      expect(updateModel.callCount).to.equal(0)
    })

    test('Should render existing values with edit and remove links', () => {
      const item = { display: 'My item', value: '12', children: [] };
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', items: [item] } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      expect(wrapper.find('#item-details-0').exists()).to.equal(true)
      expect(wrapper.find('#item-details-0').text()).to.equal('My item')
      expect(wrapper.find('#edit-item-0').exists()).to.equal(true)
      expect(wrapper.find('#remove-item-0').exists()).to.equal(true)
    })

    test('Should display the add value link', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      expect(wrapper.find('#add-value-link').exists()).to.equal(true)
      assertAddComponentValueFlyout(wrapper, data, page, component, false)
      assertEditComponentValueFlyout(wrapper, data, page, component, false)
    })

    test('Clicking the add item link should display the add component value flyout', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#add-value-link').simulate('click')

      assertAddComponentValueFlyout(wrapper, data, page, component, true)
      assertEditComponentValueFlyout(wrapper, data, page, component, false)
    })

    test('Clicking the edit item link should display the edit component value flyout', () => {
      const item = { display: 'My item', value: '12', children: [], condition: undefined, hint: undefined };
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string', items: [item] } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#edit-item-0').simulate('click')
      assertEditComponentValueFlyout(wrapper, data, page, component, true, item)
      assertAddComponentValueFlyout(wrapper, data, page, component, false)
    })

    test('Clicking the remove item link should remove the correct item', () => {
      const item = { display: 'My item', value: '12', children: [] };
      const item2 = { display: 'Another item', value: '13', children: [] };
      const item3 = { display: 'Third item', value: '13', children: [] };
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string', items: [item, item2, item3] } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#remove-item-1').simulate('click')

      const expected = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string', items: [item, item3] } }

      expect(updateModel.callCount).to.equal(1)
      expect(updateModel.firstCall.args[0]).to.equal(expected)

      expect(wrapper.find('#item-details-0').text()).to.equal('My item')
      expect(wrapper.find('#item-details-1').text()).to.equal('Third item')
      expect(wrapper.find('#item-details-2').exists()).to.equal(false)
      assertAddComponentValueFlyout(wrapper, data, page, component, false)
      assertEditComponentValueFlyout(wrapper, data, page, expected, false)
    })

    test('Should not update model when the static population type is chosen', () => {
      const component = { type: 'RadiosField', name: 'myComponent' }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#population-type-static').simulate('click', { target: { value: 'static' } })

      expect(updateModel.callCount).to.equal(0)
    })

    test('Should update model in the expected fashion when a list is selected', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#field-options-list').simulate('change', { target: { value: 'anotherList' } })
      expect(updateModel.callCount).to.equal(1)

      const expected = {
        type: 'RadiosField',
        name: 'myComponent',
        values: {
          type: 'static',
          valueType: 'string',
          items: [
            { display: 'My item', value: '12', children: [] },
            { display: 'Item 2', hint: 'My hint', value: '11', condition: 'Abcewdad', children: [] },
            { display: 'Item 3', value: '11', children: [{ type: 'TextField' }] }
          ]
        }
      }
      expect(updateModel.firstCall.args[0]).to.equal(expected)
    })

    test('Should update model in the expected fashion when a list is selected and there were already values', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', items: [{display:'old item'}] } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel}/>)

      wrapper.find('#field-options-list').simulate('change', { target: { value: 'anotherList' } })
      expect(updateModel.callCount).to.equal(1)

      const expected = {
        type: 'RadiosField',
        name: 'myComponent',
        values: {
          type: 'static',
          valueType: 'string',
          items: [
            { display: 'My item', value: '12', children: [] },
            { display: 'Item 2', hint: 'My hint', value: '11', condition: 'Abcewdad', children: [] },
            { display: 'Item 3', value: '11', children: [{ type: 'TextField' }] }
          ]
        }
      }
      expect(updateModel.firstCall.args[0]).to.equal(expected)
    })

    test('The cancel add item callback should hide the add component value flyout', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#add-value-link').simulate('click')

      wrapper.instance().cancelAddItem()

      assertAddComponentValueFlyout(wrapper, data, page, component, false)
    })

    test('The add item callback should update the model in the expected way and hide the add component value flyout', () => {
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string' } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#add-value-link').simulate('click')
      const item = { display: 'My item', value: '12', children: [] };
      expect(updateModel.callCount).to.equal(0)

      wrapper.instance().addItem(item)

      expect(updateModel.callCount).to.equal(1)
      const expected = {
        type: 'RadiosField',
        name: 'myComponent',
        values: {
          items: [
            item
          ],
          type: 'static',
          valueType: 'string'
        }
      };
      expect(updateModel.firstCall.args[0]).to.equal(expected)
      assertAddComponentValueFlyout(wrapper, data, page, expected, false)
      assertEditComponentValueFlyout(wrapper, data, page, component, false)
    })

    test('The cancel edit item callback should hide the edit component value flyout', () => {
      const item = { display: 'My item', value: '12', children: [], condition: undefined, hint: undefined };
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string', items: [item] } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#edit-item-0').simulate('click')
      assertEditComponentValueFlyout(wrapper, data, page, component, true, item)

      wrapper.instance().cancelEditItem()
      assertEditComponentValueFlyout(wrapper, data, page, component, false)
    })

    test('The edit item callback should update the model in the expected way and hide the edit component value flyout', () => {
      const item = { display: 'My item', value: '12', children: [] };
      const item2 = { display: 'Another item', value: '13', children: [], hint: undefined, condition: undefined };
      const item3 = { display: 'Third item', value: '13', children: [] };
      const component = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string', items: [item, item2, item3] } }
      const wrapper = shallow(<ComponentValues data={data} component={component} updateModel={updateModel} page={page}/>)

      wrapper.find('#edit-item-1').simulate('click')
      assertEditComponentValueFlyout(wrapper, data, page, component, true, item2)


      expect(updateModel.callCount).to.equal(0)

      const updatedItem = clone(item2)
      updatedItem.display = 'My new item name'
      wrapper.instance().updateItem(updatedItem)

      const expected = { type: 'RadiosField', name: 'myComponent', values: { type: 'static', valueType: 'string', items: [item, updatedItem, item3] } }

      expect(updateModel.callCount).to.equal(1)
      expect(updateModel.firstCall.args[0]).to.equal(expected)

      assertEditComponentValueFlyout(wrapper, data, page, expected, false)
    })
  })

  function assertAddComponentValueFlyout (wrapper, data, page, component, displayed) {
    const addComponentValue = wrapper.find('DefineComponentValue').at(0)
    expect(addComponentValue.exists()).to.equal(true)
    expect(addComponentValue.prop('data')).to.equal(data)
    expect(addComponentValue.prop('page')).to.equal(page)
    expect(addComponentValue.prop('saveCallback')).to.equal(wrapper.instance().addItem)
    expect(addComponentValue.prop('cancelCallback')).to.equal(wrapper.instance().cancelAddItem)
    expect(addComponentValue.prop('value')).to.equal(undefined)
    const flyout = addComponentValue.parent('Flyout')
    expect(flyout.exists()).to.equal(true)
    expect(flyout.prop('title')).to.equal('Add Item')
    expect(flyout.prop('show')).to.equal(displayed)
    expect(flyout.prop('onHide')).to.equal(wrapper.instance().cancelAddItem)
  }

  function assertEditComponentValueFlyout (wrapper, data, page, component, displayed, value) {
    const addComponentValue = wrapper.find('DefineComponentValue').at(1)
    expect(addComponentValue.exists()).to.equal(true)
    expect(addComponentValue.prop('data')).to.equal(data)
    expect(addComponentValue.prop('page')).to.equal(page)
    expect(addComponentValue.prop('saveCallback')).to.equal(wrapper.instance().updateItem)
    expect(addComponentValue.prop('cancelCallback')).to.equal(wrapper.instance().cancelEditItem)
    expect(addComponentValue.prop('value')).to.equal(value)
    const flyout = addComponentValue.parent('Flyout')
    expect(flyout.exists()).to.equal(true)
    expect(flyout.prop('title')).to.equal('Edit Item')
    expect(flyout.prop('show')).to.equal(displayed)
    expect(flyout.prop('onHide')).to.equal(wrapper.instance().cancelEditItem)
  }
})

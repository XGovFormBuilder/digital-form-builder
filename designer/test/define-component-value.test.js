import React from 'react'
import { shallow } from 'enzyme'
import * as Lab from '@hapi/lab'
import * as Code from '@hapi/code'
import { Data } from '@xgovformbuilder/model'
import sinon from 'sinon'
import DefineComponentValue from '../client/components/define-component-value'

const lab = Lab.script()
exports.lab = lab
const { afterEach, before, suite, test } = lab
const { expect } = Code

suite.skip('Define component value', () => {
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

  const page = {
    path: '/1'
  }
  const saveCallback = sinon.spy()
  const cancelCallback = sinon.spy()

  before(() => {
    data.clone = sinon.stub()
    data.save = sinon.stub()
  })

  afterEach(() => {
    saveCallback.resetHistory()
    cancelCallback.resetHistory()
  })

  test('Should render expected form', () => {
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />)

    const labelInput = wrapper.find('#item-label')
    expect(labelInput.prop('name')).to.equal('label')
    expect(labelInput.prop('required')).to.equal(true)
    expect(labelInput.prop('value')).to.equal(undefined)

    const valueInput = wrapper.find('#item-value')
    expect(valueInput.prop('name')).to.equal('value')
    expect(valueInput.prop('required')).to.equal(true)
    expect(valueInput.prop('value')).to.equal(undefined)

    const hintInput = wrapper.find('#item-hint')
    expect(hintInput.prop('name')).to.equal('hint')
    expect(hintInput.prop('required')).to.equal(false)
    expect(hintInput.prop('value')).to.equal(undefined)

    assertSelectConditionsDisplayed(wrapper)

    expect(wrapper.find('#add-child-link').exists()).to.equal(true)
    expect(wrapper.find('#save-component-value-link').exists()).to.equal(true)
    expect(wrapper.find('#cancel-add-component-value-link').exists()).to.equal(true)

    assertAddChildFlyout(wrapper, data, page, false)
    assertEditChildFlyout(wrapper, data, page, false)
  })

  test('Should render expected form when editing a fully-populated value', () => {
    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child]
    }

    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        value={value}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />
    )
    const labelInput = wrapper.find('#item-label')
    expect(labelInput.prop('name')).to.equal('label')
    expect(labelInput.prop('required')).to.equal(true)
    expect(labelInput.prop('value')).to.equal('My label')

    const valueInput = wrapper.find('#item-value')
    expect(valueInput.prop('name')).to.equal('value')
    expect(valueInput.prop('required')).to.equal(true)
    expect(valueInput.prop('value')).to.equal('My value')

    const hintInput = wrapper.find('#item-hint')
    expect(hintInput.prop('name')).to.equal('hint')
    expect(hintInput.prop('required')).to.equal(false)
    expect(hintInput.prop('value')).to.equal('My hint')
    expect(hintInput.prop('rows')).to.equal(2)

    assertSelectConditionsDisplayed(wrapper, 'myCondition')

    expect(wrapper.find('#child-details-0').exists()).to.equal(true)
    expect(wrapper.find('#child-details-0').text()).to.equal('My child component (TextField)')
    expect(wrapper.find('#add-child-link').exists()).to.equal(true)
    expect(wrapper.find('#save-component-value-link').exists()).to.equal(true)
    expect(wrapper.find('#cancel-add-component-value-link').exists()).to.equal(true)

    assertAddChildFlyout(wrapper, data, page, false)
    assertEditChildFlyout(wrapper, data, page, false)
  })

  test('Clicking the add child link causes the add child flyout to be displayed', () => {
    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child]
    }
    const wrapper = shallow(<DefineComponentValue data={data} value={value} saveCallback={saveCallback} cancelCallback={cancelCallback} page={page}/>)

    wrapper.find('#add-child-link').simulate('click')

    assertAddChildFlyout(wrapper, data, page, true)
    assertEditChildFlyout(wrapper, data, page, false)
  })

  test('The cancel add child callback causes the add child flyout to be hidden again', () => {
    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child]
    }
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        value={value}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />
    )

    wrapper.find('#add-child-link').simulate('click')
    wrapper.instance().cancelAddChild()

    assertAddChildFlyout(wrapper, data, page, false)
    assertEditChildFlyout(wrapper, data, page, false)
  })

  test('Adding a child causes the add child view to be hidden', () => {
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: []
    }
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        value={value}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />
    )
    wrapper.find('#add-child-link').simulate('click')

    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    stubFlyoutFormsReportValidity(wrapper)
    wrapper.instance().addChild(child)

    assertAddChildFlyout(wrapper, data, page, false)
    assertEditChildFlyout(wrapper, data, page, false)
  })

  test('Should be able to add child when original value has no children', () => {
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition'
    }

    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        value={value}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />
    )
    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    stubFlyoutFormsReportValidity(wrapper)
    wrapper.instance().addChild(child)

    expect(wrapper.find('#child-details-0').exists()).to.equal(true)
    expect(wrapper.find('#child-details-0').text()).to.equal('My child component (TextField)')
  })

  test('Adding a child causes the child to be displayed along with edit and remove links', () => {
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />
    )

    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    stubFlyoutFormsReportValidity(wrapper)
    wrapper.instance().addChild(child)

    expect(wrapper.find('#child-details-0').exists()).to.equal(true)
    expect(wrapper.find('#child-details-0').text()).to.equal('My child component (TextField)')
    expect(wrapper.find('#edit-child-0').exists()).to.equal(true)
    expect(wrapper.find('#remove-child-0').exists()).to.equal(true)
  })

  test('Clicking the remove child link causes the correct child to be removed', () => {
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
      />
    )

    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    const child2 = { name: 'myChild2', title: 'Another child component', type: 'TextField' }
    const child3 = { name: 'myChild3', title: 'Third child component', type: 'TextField' }
    stubFlyoutFormsReportValidity(wrapper)
    wrapper.instance().addChild(child)
    wrapper.instance().addChild(child2)
    wrapper.instance().addChild(child3)

    wrapper.find('#remove-child-1').simulate('click')

    expect(wrapper.find('#child-details-0').exists()).to.equal(true)
    expect(wrapper.find('#child-details-0').text()).to.equal('My child component (TextField)')

    expect(wrapper.find('#child-details-1').exists()).to.equal(true)
    expect(wrapper.find('#child-details-1').text()).to.equal('Third child component (TextField)')

    expect(wrapper.find('#child-details-2').exists()).to.equal(false)
  })

  test('Clicking the edit child link causes the edit child flyout to be displayed with the correct child', () => {
    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    const child2 = { name: 'myChild2', title: 'Another child component', type: 'TextField' }
    const child3 = { name: 'myChild3', title: 'Third child component', type: 'TextField' }
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child, child2, child3]
    }
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
        value={value}
      />
    )

    wrapper.find('#edit-child-1').simulate('click')

    assertAddChildFlyout(wrapper, data, page, false)
    assertEditChildFlyout(wrapper, data, page, true, child2)
  })

  test('Clicking the save link should call callback with appropriate value for minimally populated item', () => {
    const wrapper = shallow(<DefineComponentValue data={data} saveCallback={saveCallback} cancelCallback={cancelCallback} page={page}/>)
    wrapper.find('#item-label').prop('onChange')({ target: { value: 'My label' } })
    wrapper.find('#item-value').prop('onChange')({ target: { value: 'My value' } })

    wrapper.find('#save-component-value-link').simulate('click')

    expect(saveCallback.callCount).to.equal(1)
    expect(saveCallback.firstCall.args[0]).to.equal({
      label: 'My label',
      value: 'My value',
      hint: undefined,
      condition: undefined,
      children: []
    })
  })

  test('Clicking the save link should call callback with appropriate value', () => {
    const wrapper = shallow(<DefineComponentValue data={data} saveCallback={saveCallback} cancelCallback={cancelCallback} page={page}/>)
    wrapper.find('#item-label').prop('onChange')({ target: { value: 'My label' } })
    wrapper.find('#item-value').prop('onChange')({ target: { value: 'My value' } })
    wrapper.find('#item-hint').prop('onChange')({ target: { value: 'My hint' } })

    wrapper.instance().conditionSelected('myCondition')
    const child = { name: 'myChild' }
    stubFlyoutFormsReportValidity(wrapper)
    wrapper.instance().addChild(child)

    wrapper.find('#save-component-value-link').simulate('click')

    expect(saveCallback.callCount).to.equal(1)
    expect(saveCallback.firstCall.args[0]).to.equal({
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child]
    })
  })

  test('Updating the child causes the correct child to be updated and hides the edit child flyout', () => {
    const child = { name: 'myChild', title: 'My child component', type: 'TextField' }
    const child2 = { name: 'myChild2', title: 'Another child component', type: 'TextField' }
    const child3 = { name: 'myChild3', title: 'Third child component', type: 'TextField' }
    const value = {
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child, child2, child3]
    }
    const wrapper = shallow(
      <DefineComponentValue
        data={data}
        saveCallback={saveCallback}
        cancelCallback={cancelCallback}
        page={page}
        value={value}
      />
    )

    wrapper.find('#edit-child-1').simulate('click')

    const updated = { name: 'myChild2', title: 'New child component name', type: 'TextField' }
    stubFlyoutFormsReportValidity(wrapper)
    wrapper.instance().updateChild(updated)

    assertAddChildFlyout(wrapper, data, page, false)
    assertEditChildFlyout(wrapper, data, page, false)

    wrapper.find('#save-component-value-link').simulate('click')

    expect(saveCallback.callCount).to.equal(1)
    expect(saveCallback.firstCall.args[0]).to.equal({
      label: 'My label',
      value: 'My value',
      hint: 'My hint',
      condition: 'myCondition',
      children: [child, updated, child3]
    })
  })

  function assertAddChildFlyout (wrapper, data, page, displayed) {
    const addComponentValue = wrapper.find('DefineChildComponent').at(0)
    expect(addComponentValue.exists()).to.equal(true)
    expect(addComponentValue.prop('data')).to.equal(data)
    expect(addComponentValue.prop('component')).to.equal(undefined)
    expect(addComponentValue.prop('page')).to.equal(page)
    expect(addComponentValue.prop('saveCallback')).to.equal(wrapper.instance().addChild)
    expect(addComponentValue.prop('cancelCallback')).to.equal(wrapper.instance().cancelAddChild)
    const flyout = addComponentValue.closest('Flyout')
    expect(flyout.exists()).to.equal(true)
    expect(flyout.prop('title')).to.equal('Add Child')
    expect(flyout.prop('show')).to.equal(displayed)
    expect(flyout.prop('onHide')).to.equal(wrapper.instance().cancelAddChild)
  }

  function assertEditChildFlyout (wrapper, data, page, displayed, child) {
    const addComponentValue = wrapper.find('DefineChildComponent').at(1)
    expect(addComponentValue.exists()).to.equal(true)
    expect(addComponentValue.prop('data')).to.equal(data)
    expect(addComponentValue.prop('component')).to.equal(child)
    expect(addComponentValue.prop('page')).to.equal(page)
    expect(addComponentValue.prop('saveCallback')).to.equal(wrapper.instance().updateChild)
    expect(addComponentValue.prop('cancelCallback')).to.equal(wrapper.instance().cancelEditChild)
    const flyout = addComponentValue.closest('Flyout')
    expect(flyout.exists()).to.equal(true)
    expect(flyout.prop('title')).to.equal('Edit Child')
    expect(flyout.prop('show')).to.equal(displayed)
    expect(flyout.prop('onHide')).to.equal(wrapper.instance().cancelEditChild)
  }

  function assertSelectConditionsDisplayed (wrapper, selectedCondition) {
    const selectConditions = wrapper.find('SelectConditions')
    expect(selectConditions.exists()).to.equal(true)
    expect(selectConditions.prop('data')).to.equal(data)
    expect(selectConditions.prop('path')).to.equal(page.path)
    expect(selectConditions.prop('selectedCondition')).to.equal(selectedCondition)
    expect(selectConditions.prop('conditionsChange')).to.equal(wrapper.instance().conditionSelected)
    expect(selectConditions.prop('hints')).to.equal(['The item will only be displayed if the selected condition holds'])
  }
})

function stubFlyoutFormsReportValidity (wrapper) {
  sinon.stub(wrapper.instance(), 'formAddItem').value({
    current: {
      reportValidity: () => true
    }
  })

  sinon.stub(wrapper.instance(), 'formEditItem').value({
    current: {
      reportValidity: () => true
    }
  })
}

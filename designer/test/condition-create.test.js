import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import ConditionCreate from '../client/condition-create'
import { Data } from '../client/model/data-model'
import sinon from 'sinon'
import { assertTextInput } from './helpers/element-assertions'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test } = lab

suite('Condition create', () => {
  const data = new Data({})
  const nextId = 'abcdef'
  data.getId = sinon.stub()
  data.getId.resolves(nextId)

  test('Renders a form with display name and condition editor inputs', () => {
    const wrapper = shallow(<ConditionCreate data={data} />)
    const form = wrapper.find('form')
    const displayNameInput = form.find('input')

    assertTextInput(displayNameInput, 'condition-name')

    const editor = form.find('Editor')
    expect(editor.prop('name')).to.equal('value')
    expect(Object.keys(editor.props()).includes('required')).to.equal(true)
    expect(editor.prop('valueCallback')).to.equal(wrapper.instance().onValueChange)
  })

  test('Should set error message when setting display name to one that already exists', () => {
    const wrapper = shallow(<ConditionCreate data={data} />)
    const form = wrapper.find('form')
    const displayNameInput = form.find('input')
    const setCustomValidity = sinon.spy()
    data.addCondition('something', 'My condition', 'badger == monkeys')
    displayNameInput.simulate('blur', { target: { value: 'My condition', setCustomValidity: setCustomValidity } })

    expect(setCustomValidity.calledOnce).to.equal(true)
    expect(setCustomValidity.firstCall.args[0]).to.equal('Display name \'My condition\' already exists')
  })

  test('Submitting the form creates a condition and calls back', async flags => {
    const clonedData = {
      addCondition: sinon.stub()
    }
    const onCreate = data => {
      expect(data.data).to.equal(clonedData)
    }
    const save = data => {
      expect(data).to.equal(clonedData)
      return Promise.resolve(clonedData)
    }

    const wrapper = shallow(<ConditionCreate data={data} onCreate={onCreate} />)
    const form = wrapper.find('form')
    const displayNameInput = form.find('input')
    const preventDefault = sinon.spy()
    const setCustomValidity = sinon.spy()
    displayNameInput.simulate('blur', { target: { value: 'My condition', setCustomValidity: setCustomValidity } })
    wrapper.instance().onValueChange('badger == monkeys')

    data.clone = sinon.stub()
    data.clone.returns(clonedData)
    data.save = flags.mustCall(save, 1)

    await wrapper.simulate('submit', { preventDefault: preventDefault })

    expect(preventDefault.calledOnce).to.equal(true)
    expect(clonedData.addCondition.calledOnce).to.equal(true)
    expect(clonedData.addCondition.firstCall.args[0]).to.equal(nextId)
    expect(clonedData.addCondition.firstCall.args[1]).to.equal('My condition')
    expect(clonedData.addCondition.firstCall.args[2]).to.equal('badger == monkeys')
  })

  test('Cancelling the form calls the onCancel callback', async flags => {
    const event = { target: {} }
    const onCancel = e => {
      expect(e).to.equal(event)
    }
    const wrappedOnCancel = flags.mustCall(onCancel, 1)
    const wrapper = shallow(<ConditionCreate data={data} onCancel={wrappedOnCancel} />)
    const form = wrapper.find('form')
    const backLink = form.find('a.govuk-back-link')
    await backLink.simulate('click', event)
  })
})

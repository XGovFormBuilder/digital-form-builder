import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Data } from '@xgovformbuilder/model'
import { assertTextInput } from './helpers/element-assertions'
import SectionCreate from '../client/section-create'

import sinon from 'sinon'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { afterEach, beforeEach, suite, test } = lab

suite('Section create', () => {
  const onCreate = sinon.spy()

  const data = new Data({
    sections: [{ name: 'awesomeBadgers' }, { name: 'awesomeBadgers1' }, { name: 'awesomeBadgers2' }]
  })

  beforeEach(() => {
    data.clone = sinon.stub().returns(data)
    data.addSection = sinon.stub().returns(data)
    data.save = sinon.stub().resolves(data)
  })

  afterEach(() => {
    onCreate.resetHistory()
  })

  test('Should display form with title and name inputs', () => {
    const wrapper = shallow(<SectionCreate data={data} />)
    const form = wrapper.find('form')

    const inputs = form.find('input')
    expect(inputs.length).to.equal(2)
    assertTextInput(inputs.at(0), 'section-title', undefined, { value: '' })
    assertTextInput(inputs.at(1), 'section-name', '')
  })

  test('Specifying a title should default the name to the camel case version of the string', () => {
    const wrapper = shallow(<SectionCreate data={data} />)

    wrapper.find('#section-title').simulate('change', { target: { value: 'Bob\'s your uncle' } })

    const inputs = wrapper.find('input')
    expect(inputs.length).to.equal(2)
    assertTextInput(inputs.at(0), 'section-title', undefined, { value: 'Bob\'s your uncle' })
    assertTextInput(inputs.at(1), 'section-name', 'bobsYourUncle')
  })

  test('Specifying a title should default the name to camel case + an integer when sections with the name already exist', () => {
    const wrapper = shallow(<SectionCreate data={data} />)

    wrapper.find('#section-title').simulate('change', { target: { value: 'Awesome badgers' } })

    const inputs = wrapper.find('input')
    expect(inputs.length).to.equal(2)
    assertTextInput(inputs.at(0), 'section-title', undefined, { value: 'Awesome badgers' })
    assertTextInput(inputs.at(1), 'section-name', 'awesomeBadgers3')
  })

  test('Specifying a name should overwrite any auto-generated value', () => {
    const wrapper = shallow(<SectionCreate data={data} />)

    wrapper.find('#section-title').simulate('change', { target: { value: 'My badgers' } })
    wrapper.find('#section-name').simulate('blur', { target: { value: 'myName', setCustomValidity: sinon.spy() } })
    wrapper.find('#section-title').simulate('change', { target: { value: 'Your badgers' } })

    const inputs = wrapper.find('input')
    expect(inputs.length).to.equal(2)
    assertTextInput(inputs.at(0), 'section-title', undefined, { value: 'Your badgers' })
    assertTextInput(inputs.at(1), 'section-name', 'myName')
  })

  test('Submitting without changing the name should generate the appropriate section', flags => {
    const wrapper = shallow(<SectionCreate data={data} onCreate={onCreate} />)

    wrapper.find('#section-title').simulate('change', { target: { value: ' My badgers ' } })
    const preventDefault = sinon.spy()
    wrapper.instance().onSubmit({ preventDefault })

    expect(data.addSection.callCount).to.equal(1)
    expect(data.addSection.firstCall.args[0]).to.equal('myBadgers')
    expect(data.addSection.firstCall.args[1]).to.equal('My badgers')
  })

  test('Submitting without changing the name should use generated name with integer if needed', async () => {
    const wrapper = shallow(<SectionCreate data={data} onCreate={onCreate} />)

    wrapper.find('#section-title').simulate('change', { target: { value: ' Awesome Badgers ' } })
    const preventDefault = sinon.spy()

    await wrapper.instance().onSubmit({ preventDefault })

    expect(data.addSection.callCount).to.equal(1)
    expect(data.addSection.firstCall.args[0]).to.equal('awesomeBadgers3')
    expect(data.addSection.firstCall.args[1]).to.equal('Awesome Badgers')
  })

  test('Submitting with a specified name should use the specified name', async () => {
    const wrapper = shallow(<SectionCreate data={data} onCreate={onCreate} />)

    wrapper.find('#section-title').simulate('change', { target: { value: ' Awesome Badgers ' } })
    wrapper.find('#section-name').simulate('blur', { target: { value: 'myName', setCustomValidity: sinon.spy() } })
    const preventDefault = sinon.spy()
    await wrapper.instance().onSubmit({ preventDefault })

    expect(data.addSection.callCount).to.equal(1)
    expect(data.addSection.firstCall.args[0]).to.equal('myName')
    expect(data.addSection.firstCall.args[1]).to.equal('Awesome Badgers')
  })

  test('Submitting causes the updated data to be saved and the callback to be called with the saved data', async () => {
    const clonedData = {
      addSection: sinon.stub()
    }
    data.clone.returns(clonedData)

    const updatedData = sinon.stub()
    clonedData.addSection.returns(updatedData)

    const savedData = sinon.stub()
    data.save.resolves(savedData)

    const wrapper = shallow(<SectionCreate data={data} onCreate={onCreate} />)

    wrapper.find('#section-title').simulate('change', { target: { value: ' Awesome Badgers ' } })
    wrapper.find('#section-name').simulate('blur', { target: { value: 'myName', setCustomValidity: sinon.spy() } })
    const preventDefault = sinon.spy()
    await wrapper.instance().onSubmit({ preventDefault })

    expect(data.save.callCount).to.equal(1)
    expect(data.save.firstCall.args[0]).to.equal(updatedData)

    expect(onCreate.callCount).to.equal(1)
    expect(onCreate.firstCall.args[0]).to.equal(savedData)
  })
})

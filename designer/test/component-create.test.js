import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import ComponentCreate from '../client/component-create'
import { Data } from '@xgovformbuilder/model'
import sinon from 'sinon'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { before, suite, test } = lab

suite('Component create', () => {
  const data = new Data({})
  const page = { path: '/1' }
  const generatedId = 'DMaslknf'

  before(() => {
    data.getId = sinon.stub().resolves(generatedId)
    data.clone = sinon.stub()
    data.save = sinon.stub()
  })

  test('Should display form with component types in alphabetical order', () => {
    const wrapper = shallow(<ComponentCreate data={data} page={page} />)
    const form = wrapper.find('form')

    const componentTypeInput = form.find('select')
    let lastDisplayedTitle = ''
    componentTypeInput.find('options').forEach(type => {
      expect(lastDisplayedTitle.localeCompare(type.title)).equal.to(-1)
      lastDisplayedTitle = type.title
    })

    expect(wrapper.find('ComponentTypeEdit').exists()).to.equal(false)
  })

  test('Selecting a component type should display the ComponentTypeEdit component', async flags => {
    const wrapper = shallow(<ComponentCreate data={data} page={page} />)
    await wrapper.instance().componentDidMount()

    const form = wrapper.find('form')

    form.find('select').simulate('change', { target: { value: 'TextField' } })

    const componentTypeEdit = wrapper.find('ComponentTypeEdit')
    expect(componentTypeEdit.exists()).to.equal(true)
    expect(componentTypeEdit.prop('page')).to.equal(page)
    expect(componentTypeEdit.prop('component')).to.equal({ type: 'TextField', name: generatedId })
    expect(componentTypeEdit.prop('data')).to.equal(data)
    expect(componentTypeEdit.prop('updateModel')).to.equal(wrapper.instance().storeComponent)
    expect(Object.keys(componentTypeEdit.props()).length).to.equal(4)
  })

  test('Should store the populated component and call callback on submit', async () => {
    const component = { type: 'TextField', schema: { max: 24, min: 22 }, options: { required: false } }
    const onCreate = sinon.spy()

    const clonedData = {
      addComponent: sinon.stub()
    }
    const updatedData = sinon.stub()
    const savedData = sinon.stub()
    data.clone.returns(clonedData)
    clonedData.addComponent.returns(updatedData)
    data.save.resolves(savedData)

    const wrapper = shallow(<ComponentCreate data={data} page={page} onCreate={onCreate}/>)

    wrapper.instance().storeComponent(component)

    await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

    expect(clonedData.addComponent.callCount).to.equal(1)
    expect(clonedData.addComponent.firstCall.args[0]).to.equal(page.path)
    expect(clonedData.addComponent.firstCall.args[1]).to.equal(component)

    expect(data.save.callCount).to.equal(1)
    expect(data.save.firstCall.args[0]).to.equal(updatedData)

    expect(onCreate.callCount).to.equal(1)
    expect(onCreate.firstCall.args[0]).to.equal({ data: savedData })
  })
})

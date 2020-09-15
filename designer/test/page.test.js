import React from "react"
import { shallow } from "enzyme"
import * as Code from "@hapi/code"
import * as Lab from "@hapi/lab"
import Page from "../client/page"
import Flyout from '../client/flyout'
import PageEdit from '../client/page-edit'
import ComponentCreate from '../client/component-create'
import { Data } from "@xgovformbuilder/model"

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, beforeEach } = lab

suite.only("Page", () => {
  let data;
  
  beforeEach(() => {
    data = new Data({
      pages: [
        {
          path: "/1",
          title: "My first page",
          section: "badger",
          controller: "./pages/start.js",
          components: []
        },
      ],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    })
  });

  test("Clicking page's handle toggles showEditor", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const handle = wrapper.find('.page__handle').first()
    
    expect(wrapper.state().showEditor).to.equal(false)
    
    handle.simulate('click')
    expect(wrapper.state().showEditor).to.equal(true)
  })

  test("PageEdit Flyout onHide toggles showEditor", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const editor = wrapper.find(Flyout).first()
    
    wrapper.setState({showEditor: true})
    expect(wrapper.state().showEditor).to.equal(true)

    editor.prop('onHide')()
    wrapper.update()
    expect(wrapper.state().showEditor).to.equal(false)
  })
  
  test("PageEdit onEdit toggles showEditor", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const editor = wrapper.find(PageEdit).first()
    
    wrapper.setState({showEditor: true})
    expect(wrapper.state().showEditor).to.equal(true)

    editor.prop('onEdit')()
    wrapper.update()
    expect(wrapper.state().showEditor).to.equal(false)
  })
  
  test("PageEdit Flyout receives showEditor correctly", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const componentCreate = wrapper.find(ComponentCreate).first()
    
    wrapper.setState({showEditor: 'showEditor'})
    expect(wrapper.state().showEditor).to.equal('showEditor')
  })

  test("Button add components toggles showAddComponent", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const button = wrapper.find('.page__actions__button').first()
    
    expect(wrapper.state().showAddComponent).to.equal(false)
    
    button.simulate('click');
    expect(wrapper.state().showAddComponent).to.equal(true)
  })

  test("AddComponent Flyout onHide toggles showAddComponent", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const addComponent = wrapper.find(Flyout).at(1)
    
    wrapper.setState({showAddComponent: true})
    expect(wrapper.state().showAddComponent).to.equal(true)

    addComponent.prop('onHide')()
    wrapper.update()
    expect(wrapper.state().showAddComponent).to.equal(false)
  })

  test("ComponentCreate onCreate toggles showAddComponent", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const componentCreate = wrapper.find(ComponentCreate).first()
    
    wrapper.setState({showAddComponent: true})
    expect(wrapper.state().showAddComponent).to.equal(true)

    componentCreate.prop('onCreate')()
    wrapper.update()
    expect(wrapper.state().showAddComponent).to.equal(false)
  })

  test("AddComponent Flyout receives showAddComponent correctly", () => {
    const wrapper = shallow(<Page data={data} page={data.pages[0]} />)
    const componentCreate = wrapper.find(ComponentCreate).first()
    
    wrapper.setState({showAddComponent: 'showAddComponent'})
    expect(wrapper.state().showAddComponent).to.equal('showAddComponent')
  })
})

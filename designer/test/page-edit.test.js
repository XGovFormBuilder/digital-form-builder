import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import PageEdit from '../client/page-edit'
import { Data } from '@xgovformbuilder/model'
import { assertTextInput, assertSelectInput } from './helpers/element-assertions'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test } = lab

suite('Page edit', () => {
  test('Renders a form with the appropriate initial inputs', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'My first page', section: 'badger', controller: './pages/start.js' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)

    assertSelectInput(wrapper.find('#page-type'), 'page-type', [
      { value: '', text: 'Question Page' },
      { value: './pages/start.js', text: 'Start Page' },
      { value: './pages/summary.js', text: 'Summary Page' }
    ], './pages/start.js')
    assertTextInput(wrapper.find('#page-title'), 'page-title', undefined, { value: 'My first page' })
    assertTextInput(wrapper.find('#page-path'), 'page-path', undefined, { value: '/1' })

    assertSelectInput(wrapper.find('#page-section'), 'page-section', [
      { text: '' },
      { value: 'badger', text: 'Badger' },
      { value: 'personalDetails', text: 'Personal Details' }
    ], 'badger')
    const buttons = wrapper.find('button')
    expect(buttons.length).to.equal(3)
    expect(buttons.at(0).text()).to.equal('Save')
    expect(buttons.at(1).text()).to.equal('Duplicate')
    expect(buttons.at(2).text()).to.equal('Delete')
  })

  test('Renders a form with the appropriate initial inputs when no section or controller selected', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'My first page' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)

    assertSelectInput(wrapper.find('#page-type'), 'page-type', [
      { value: '', text: 'Question Page' },
      { value: './pages/start.js', text: 'Start Page' },
      { value: './pages/summary.js', text: 'Summary Page' }
    ], '')
    assertTextInput(wrapper.find('#page-title'), 'page-title', undefined, { value: 'My first page' })
    assertTextInput(wrapper.find('#page-path'), 'page-path', undefined, { value: '/1' })

    assertSelectInput(wrapper.find('#page-section'), 'page-section', [
      { text: '' },
      { value: 'badger', text: 'Badger' },
      { value: 'personalDetails', text: 'Personal Details' }
    ], '')
    const buttons = wrapper.find('button')
    expect(buttons.length).to.equal(3)
    expect(buttons.at(0).text()).to.equal('Save')
    expect(buttons.at(1).text()).to.equal('Duplicate')
    expect(buttons.at(2).text()).to.equal('Delete')
  })

  test('Updating the title changes the path if the path is the auto-generated one', () => {
    const data = new Data({
      pages: [
        { path: '/my-first-page', title: 'My first page' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)
    wrapper.find('#page-title').simulate('change', { target: { value: 'New Page' } })

    assertTextInput(wrapper.find('#page-title'), 'page-title', undefined, { value: 'New Page' })
    assertTextInput(wrapper.find('#page-path'), 'page-path', undefined, { value: '/new-page' })
  })

  test('Updating the title changes the path if the path is the auto-generated one for no title', () => {
    const data = new Data({
      pages: [
        { path: '/' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)
    wrapper.find('#page-title').simulate('change', { target: { value: 'New Page' } })

    assertTextInput(wrapper.find('#page-title'), 'page-title', undefined, { value: 'New Page' })
    assertTextInput(wrapper.find('#page-path'), 'page-path', undefined, { value: '/new-page' })
  })

  test('Updating the title does not change the path if the path is not the auto-generated one', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'My first page' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)
    wrapper.find('#page-title').simulate('change', { target: { value: 'New Page' } })

    assertTextInput(wrapper.find('#page-title'), 'page-title', undefined, { value: 'New Page' })
    assertTextInput(wrapper.find('#page-path'), 'page-path', undefined, { value: '/1' })
  })

  test('Changing the section causes the new section to be selected', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'My first page' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)
    wrapper.find('#page-section').simulate('change', { target: { value: 'badger' } })

    assertSelectInput(wrapper.find('#page-section'), 'page-section', [
      { text: '' },
      { value: 'badger', text: 'Badger' },
      { value: 'personalDetails', text: 'Personal Details' }
    ], 'badger')
  })

  test('Changing the controller causes the new controller to be selected', () => {
    const data = new Data({
      pages: [
        { path: '/1', title: 'My first page' }
      ],
      sections: [
        {
          name: 'badger',
          title: 'Badger'
        },
        {
          name: 'personalDetails',
          title: 'Personal Details'
        }
      ]
    })

    const wrapper = shallow(<PageEdit data={data} page={data.pages[0]} />)
    wrapper.find('#page-type').simulate('change', { target: { value: './pages/summary.js' } })

    assertSelectInput(wrapper.find('#page-type'), 'page-type', [
      { value: '', text: 'Question Page' },
      { value: './pages/start.js', text: 'Start Page' },
      { value: './pages/summary.js', text: 'Summary Page' }
    ], './pages/summary.js')
  })
})

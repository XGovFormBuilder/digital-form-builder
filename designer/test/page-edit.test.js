import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Data } from '../client/model/data-model'
import PageEdit from '../client/page-edit'
import * as sinon from 'sinon'
import { stub } from 'sinon'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test } = lab

suite('Page edit', () => {
  test('Page link is preserved when page title is changed', async flags => {
    const page = {
      title: 'Page B',
      path: 'page-b',
      next: [
        { path: 'page-b' }
      ]
    }
    const data = new Data({
      pages: [
        {
          title: 'Page A',
          path: 'page-a',
          next: [
            { path: 'page-b' }
          ]
        },
        {
          title: 'Page B',
          path: 'page-b',
          next: [
            { path: 'page-c' }
          ]
        },
        {
          title: 'Page C',
          path: 'page-c',
          next: [
            { path: 'page-d' }
          ]
        },
        {
          title: 'Page D',
          path: 'page-d',
          next: [
            { path: 'page-e' }
          ]
        },
        {
          title: 'Page E',
          path: 'page-e',
          next: []
        }
      ]
    })

    // const clonedData = data
    // const onEdit = data => {
    //   expect(data.data).to.equal(clonedData)
    // }
    // const wrappedOnEdit = flags.mustCall(onEdit, 1)

    const wrapper = shallow(<PageEdit data={data} page={page} />)
    const form = wrapper.find('form')

    const titleInput = form.find('#page-title').get(0)
    titleInput.value = 'Hi there'
    await titleInput.simulate('change', { target: titleInput })

    const preventDefault = sinon.spy()
    data.save = sinon.stub()
    data.clone = sinon.stub()

    await form.simulate('submit', { preventDefault: preventDefault })
  })
})

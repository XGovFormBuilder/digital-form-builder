import * as Lab from '@hapi/lab'

import React from 'react'
import { mount } from 'enzyme'
import LinkCreate from '../client/link-create'
import { Data } from '../client/model/data-model'
import * as Code from '@hapi/code'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test } = lab

suite('Page lins', () => {
  test('page links are alphabetically sorted.', () => {
    const data = new Data({
      pages: [
        {
          title: 'Dpage'
        },
        {
          title: 'Cpage'
        },
        {
          title: 'Apage'
        },
        {
          title: 'Epage'
        },
        {
          title: 'Bpage'
        }
      ],
      conditions: [
        {
          name: 'condition1'
        }
      ]
    })

    const expectedData = new Data({
      pages: [
        {
          title: 'Apage'
        },
        {
          title: 'Bpage'
        },
        {
          title: 'Cpage'
        },
        {
          title: 'Dpage'
        },
        {
          title: 'Epage'
        }
      ]
    })
    const wrapper = mount(<LinkCreate data={data} />)
    const actualData = wrapper.props().data
    expect(actualData.pages).to.equal(expectedData.pages)
  })
})

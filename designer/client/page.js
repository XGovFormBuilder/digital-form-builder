import React from 'react'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import Flyout from './flyout'
import PageEdit from './page-edit'
import { Component } from './component'
import ComponentCreate from './component-create'
import ComponentTypes from 'digital-form-builder-model/lib/component-types'
import { clone } from 'digital-form-builder-model/lib/helpers'

const SortableItem = SortableElement(({ index, page, component, data }) =>
  <div className='component-item'>
    <Component key={index} page={page} component={component} data={data} />
  </div>
)

const SortableList = SortableContainer(({ page, data }) => {
  return (
    <div className='component-list'>
      {page.components.map((component, index) => (
        <SortableItem key={index} index={index} page={page} component={component} data={data} />
      ))}
    </div>
  )
})

class Page extends React.Component {
  state = {}

  showEditor = (e, value) => {
    e.stopPropagation()
    this.setState({ showEditor: value })
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { page, data } = this.props
    const copy = clone(data)
    const copyPage = data.findPage(page.path)
    copyPage.components = arrayMove(copyPage.components, oldIndex, newIndex)

    data.save(copy)

    // OPTIMISTIC SAVE TO STOP JUMP

    // const { page, data } = this.props
    // page.components = arrayMove(page.components, oldIndex, newIndex)

    // data.save(data)
  }

  render () {
    const { page, data, id, previewUrl } = this.props
    const { sections } = data
    const formComponents = page.components.filter(comp => ComponentTypes.find(type => type.name === comp.type).subType === 'field')
    const section = page.section && sections.find(section => section.name === page.section)
    const conditional = !!page.condition
    let pageTitle = page.title || (formComponents.length === 1 && page.components[0] === formComponents[0] ? formComponents[0].title : page.title)
    if (pageTitle && typeof pageTitle === 'object') {
      pageTitle = pageTitle.en
    }
    return (
      <div id={page.path} className={`page${conditional ? ' conditional' : ''}`}
        title={page.path} style={this.props.layout}>
        <div className='handle' onClick={(e) => this.showEditor(e, true)} />
        <div className='govuk-!-padding-top-2 govuk-!-padding-left-2 govuk-!-padding-right-2'>
          <h3 className='govuk-heading-s'>
            {section && <span className='govuk-caption-m govuk-!-font-size-14'>{section.title}</span>}
            {pageTitle}
          </h3>
        </div>

        <SortableList page={page} data={data} pressDelay={200}
          onSortEnd={this.onSortEnd} lockAxis='y' helperClass='dragging'
          lockToContainerEdges useDragHandle />

        <div className='govuk-!-padding-2'>
          <a className='preview pull-right govuk-body govuk-!-font-size-14'
            href={`${previewUrl}/${id}${page.path}`} target='_blank'>Open</a>
          <div className='button active'
            onClick={e => this.setState({ showAddComponent: true })} />
        </div>

        <Flyout title='Edit Page' show={this.state.showEditor}
          onHide={e => this.showEditor(e, false)}>
          <PageEdit page={page} data={data}
            onEdit={e => this.setState({ showEditor: false })} />
        </Flyout>

        <Flyout title='Add Component' show={this.state.showAddComponent}
          onHide={() => this.setState({ showAddComponent: false })}>
          <ComponentCreate page={page} data={data}
            onCreate={e => this.setState({ showAddComponent: false })} />
        </Flyout>
      </div>
    )
  }
}

export default Page

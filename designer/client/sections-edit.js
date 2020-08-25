import React from 'react'
import SectionEdit from './section-edit'
import SectionCreate from './section-create'

class SectionsEdit extends React.Component {
  state = {}

  onClickSection = (e, section) => {
    e.preventDefault()

    this.setState({
      section: section
    })
  }

  onClickAddSection = (e, section) => {
    e.preventDefault()

    this.setState({
      showAddSection: true
    })
  }

  render () {
    const { data } = this.props
    const { sections } = data
    const section = this.state.section

    return (
      <div className='govuk-body'>
        {!section ? (
          <div>
            {this.state.showAddSection ? (
              <SectionCreate
                data={data}
                onCreate={e => this.setState({ showAddSection: false })}
                onCancel={e => this.setState({ showAddSection: false })}
              />
            ) : (
              <ul className='govuk-list'>
                {sections.map((section, index) => (
                  <li key={section.name}>
                    <a href='#' onClick={e => this.onClickSection(e, section)}>
                      {section.title}
                    </a>
                  </li>
                ))}
                <li>
                  <hr />
                  <a href='#' onClick={e => this.onClickAddSection(e)}>Add section</a>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <SectionEdit
            section={section} data={data}
            onEdit={e => this.setState({ section: null })}
            onCancel={e => this.setState({ section: null })}
          />
        )}
      </div>
    )
  }
}

export default SectionsEdit

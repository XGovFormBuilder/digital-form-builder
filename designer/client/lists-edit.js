import React from 'react'
import ListEdit from './list-edit'

class ListsEdit extends React.Component {
  state = {}

  onClickList = (e, list) => {
    e.preventDefault()

    this.setState({
      list: list
    })
  }

  onClickAddList = (e, list) => {
    e.preventDefault()

    this.setState({
      showAddList: true
    })
  }

  render () {
    const { data } = this.props
    const { lists } = data
    const list = this.state.list

    return (
      <div className='govuk-body'>
        {!list ? (
          <div>
            {this.state.showAddList ? (
              <ListEdit list={{}} data={data}
                onEdit={e => this.setState({ showAddList: false })}
                onCancel={e => this.setState({ showAddList: false })} />
            ) : (
              <ul className='govuk-list'>
                {lists.map((list, index) => (
                  <li key={list.name}>
                    <a href='#' onClick={e => this.onClickList(e, list)}>
                      {list.title}
                    </a>
                  </li>
                ))}
                <li>
                  <hr />
                  <a href='#' onClick={e => this.onClickAddList(e)}>Add list</a>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <ListEdit list={list} data={data}
            onEdit={e => this.setState({ list: null })}
            onCancel={e => this.setState({ list: null })} />
        )}
      </div>
    )
  }
}

export default ListsEdit

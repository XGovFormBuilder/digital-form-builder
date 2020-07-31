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

  onClickAddList = async e => {
    e.preventDefault()
    const { data } = this.props
    const id = await data.getId()
    this.setState({
      id: id,
      showAddList: true
    })
  }

  render () {
    const { data } = this.props
    const { lists } = data
    const { list, id } = this.state

    return (
      <div className='govuk-body'>
        {!list ? (
          <div>
            {this.state.showAddList ? (
              <ListEdit list={{}} data={data} id={id}
                onEdit={() => this.setState({ showAddList: false })}
                onCancel={() => this.setState({ showAddList: false })} />
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
                  <a href='#' onClick={this.onClickAddList}>Add list</a>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <ListEdit list={list} data={data}
            onEdit={() => this.setState({ list: null })}
            onCancel={() => this.setState({ list: null })} />
        )}
      </div>
    )
  }
}

export default ListsEdit

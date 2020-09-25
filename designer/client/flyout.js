import React from 'react'

function Flyout (props) {
  if (!props.show) {
    return null
  }

  const width = props.width || ''
  const offset = props.offset || 0
  const style = {
    paddingLeft: `${offset * 50}px`,
    transform: `translateX(${offset * -50}px)`,
    position: 'relative'
  }

  return (
    <div className='flyout-menu show'>
      <div className={`flyout-menu-container ${width}`}
        style={style} >
        <a title='Close' className='close govuk-body govuk-!-font-size-16' onClick={e => props.onHide(e)}>Close</a>
        <div className='panel'>
          <div className='panel-header govuk-!-padding-top-4 govuk-!-padding-left-4'>
            {props.title && <h4 className='govuk-heading-m'>{props.title}</h4>}
          </div>
          <div className='panel-body'>
            <div className='govuk-!-padding-left-4 govuk-!-padding-right-4 govuk-!-padding-bottom-4'>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flyout

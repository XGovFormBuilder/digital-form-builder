import React, { useContext, useEffect, useState } from 'react'
import { FlyoutContext } from './context'

function Flyout (props) {
  // TODO:- This should really be handled by the parent to determine whether or not flyout should render.
  if (!props.show) {
    return null
  }
  const flyoutContext = useContext(FlyoutContext)
  const [offset, setOffset] = useState(0)

  /**
   * @code on component mount
   */
  useEffect(() => {
    flyoutContext.increment(() => {
      setOffset(flyoutContext.flyoutCount)
    })
  }, [])

  const [style, setStyle] = useState()
  useEffect(() => {
    setStyle({
      paddingLeft: `${offset * 50}px`,
      transform: `translateX(${offset * -50}px)`,
      position: 'relative'
    })
  }, [offset])

  const width = props.width || ''

  const onHide = e => {
    flyoutContext.decrement()
    props.onHide(e)
  }

  return (
    <div className='flyout-menu show'>
      <div className={`flyout-menu-container ${width}`}
        style={style} >
        <a title='Close' className='close govuk-body govuk-!-font-size-16' onClick={onHide}>Close</a>
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

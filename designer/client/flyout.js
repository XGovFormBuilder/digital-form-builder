import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { FlyoutContext } from './context'

export function useFlyoutEffect (props) {
  const flyoutContext = useContext(FlyoutContext)
  const [offset, setOffset] = useState(0)
  const [style, setStyle] = useState()

  /**
   * @code on component mount
   */
  useLayoutEffect(() => {
    flyoutContext.increment()
  }, [])

  useLayoutEffect(() => {
    setOffset(flyoutContext.flyoutCount)
  }, [])

  useEffect(() => {
    setStyle({
      paddingLeft: `${offset * 50}px`,
      transform: `translateX(${offset * -50}px)`,
      position: 'relative'
    })
  }, [offset])

  const onHide = () => {
    flyoutContext.decrement()
    props.onHide()
  }

  return { style, width: props?.width, onHide, offset }
}

function Flyout (props) {
  // TODO:- This should really be handled by the parent to determine whether or not flyout should render.
  if (!props.show) {
    return null
  }

  const { style, width = '', onHide } = useFlyoutEffect(props)

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

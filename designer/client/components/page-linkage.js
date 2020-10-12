import React, { useCallback, useState, Fragment } from 'react'
import { RenderInPortal } from './render-in-portal'

export function PageLinkage ({ page, data, layout }) {
  const [lineStart, setLineStart] = useState(null)
  const [lineEnd, setLineEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const reset = () => {
    setIsDragging(false)
    setLineStart(null)
    setLineEnd(null)
    setIsDraggingOver(false)
  }

  console.log(layout)

  const handleDragStart = useCallback(({ clientX, clientY }) => {
    setIsDragging(true)
    setLineStart({ x: clientX, y: clientY })
    setLineEnd({ x: clientX, y: clientY })
    event.dataTransfer.setData('linkingPage', JSON.stringify(page))
  }, [])

  const handleDrag = useCallback((event) => {
    const { clientX, clientY } = event
    setLineEnd({ x: clientX, y: clientY })

    if (!clientX && !clientY) {
      // event might return 0 0 when outside dom or drop occurs outside linkage
      setLineStart({ x: clientX, y: clientY })
      reset()
    }
  }, [])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((event) => {
    event.preventDefault()
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(async (event) => {
    event.preventDefault()
    const linkingPage = JSON.parse(event.dataTransfer.getData('linkingPage'))

    if (linkingPage.path === page.path) {
      // don't link page to itself
      return
    }

    const copy = data.clone()
    const updatedData = copy.addLink(linkingPage.path, page.path)
    await data.save(updatedData)
    reset()
  }, [])

  const handleDragEnd = useCallback((event) => {
    event.preventDefault()
    reset()
  }, [])

  const showHighlight = isDragging || isDraggingOver

  const pageNodeSize = {
    width: layout?.node?.width,
    height: layout?.node?.height
  }

  return (
    <Fragment>
      {showHighlight &&
        <div className="page-linkage__highlight-area" style={pageNodeSize} />
      }
      <div
        className="page-linkage__drag-area"
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave = {handleDragLeave}
        draggable="true"
      />
      {isDragging && lineEnd && (
        <RenderInPortal>
          <svg
            className="page-linkage__line"
            width="9000"
            height="9000"
          >
            <defs>
              <marker
                id="arrow"
                markerWidth="6"
                markerHeight="6"
                refX="0"
                refY="3"
                orient="auto"
                fill="transparent"
              >
                <polygon
                  points="0 0, 0 6, 6 3"
                  fill="#000000" stroke="transparent"
                />
              </marker>
            </defs>
            <line
              x1={lineStart?.x}
              y1={lineStart?.y}
              x2={lineEnd?.x}
              y2={lineEnd?.y}
              markerEnd="url(#arrow)"
            />
          </svg>
        </RenderInPortal>
      )}
    </Fragment>
  )
}

import React from 'react'

export const FlyoutContext = React.createContext(
  {
    count: -1,
    incrementFlyoutCounter: () => {},
    decrementFlyoutCounter: () => {}
  }
)

import { createContext } from "react";

export const FlyoutContext = createContext({
  count: 0,
  increment: () => {},
  decrement: () => {},
});

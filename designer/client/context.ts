import { createContext } from "react";

export const FlyoutContext = createContext({
  count: 0,
  increment: () => {},
  decrement: () => {},
});

// TODO: types
export const DataContext = createContext<{
  data: any;
  save: () => Promise<any>;
}>({
  data: {},
  save: async () => {},
});

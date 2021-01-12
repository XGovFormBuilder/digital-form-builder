import { createContext } from "react";

// TODO: data type
export const DataContext = createContext<{
  data: any;
  save: () => Promise<any>;
}>({
  data: {},
  save: async () => {},
});

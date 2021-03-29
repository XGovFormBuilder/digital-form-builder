import { createContext } from "react";
import { Data } from "@xgovformbuilder/model";

export const DataContext = createContext<{
  data: Data;
  save: (toUpdate: Data) => Promise<false>;
}>({
  data: {} as Data,
  save: async (_data: Data) => false,
});

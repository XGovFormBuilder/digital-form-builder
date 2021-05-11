import { createContext } from "react";
import { FormDefinition } from "@xgovformbuilder/model";

export const DataContext = createContext<{
  data: FormDefinition;
  save: (toUpdate: FormDefinition) => Promise<false>;
}>({
  data: {} as FormDefinition,
  save: async (_data: FormDefinition) => false,
});

/**
 * This replaces the class data-model (deprecated) which we previously used to mutate {@link FormDefinition} before it is saved.
 * They were written FP style. When {@link FormDefinition} is passed in, it will be copied via destructuring `{...data}`, and the mutation applied.
 */

export * from "./types";
export * from "./component";
export * from "./list";
export * from "./page";
export * from "./section";
export * from "./condition";

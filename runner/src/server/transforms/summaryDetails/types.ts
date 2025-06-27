import { FormModel } from "server/plugins/engine/models";

type TransformFunction = <Details>(value: Details) => Details;

/**
 * This is a Record of FormModel basePath to transformation function,
 * e.g.
 * ```
 *   {
 *     // test.json basePath will be "test"
 *     "test": (value) => value,
 *   }
 *   ```
 */
export type SummaryDetailsTransformationMap = Record<
  FormModel["basePath"],
  TransformFunction
>;

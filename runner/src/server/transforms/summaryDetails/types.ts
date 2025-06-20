import { FormModel } from "server/plugins/engine/models";

type TransformFunction = <Details>(value: Details) => Details;

export type SummaryDetailsTransformationMap = Record<
  FormModel["basePath"],
  TransformFunction
>;

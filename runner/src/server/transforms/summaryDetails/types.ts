import { FormModel } from "server/plugins/engine/models";

export type SummaryDetailsTransformationMap = Record<
  FormModel["basePath"],
  <Details>(value: Details) => Details
>;

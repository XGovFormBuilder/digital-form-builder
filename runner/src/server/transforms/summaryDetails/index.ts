"use strict";

import { SummaryDetailsTransformationMap } from "server/transforms/summaryDetails/types";
export { SummaryDetailsTransformationMap };

const summaryDetailsTransformations: SummaryDetailsTransformationMap = {
  test: (value) => {
    console.log("test form summary transformation");
    return value;
  },
};

module.exports = summaryDetailsTransformations;

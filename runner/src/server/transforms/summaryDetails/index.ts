"use strict";

import { SummaryDetailsTransformationMap } from "server/transforms/summaryDetails/types";
export { SummaryDetailsTransformationMap };

/**
 * [View the docs for summary-details-transformations an explanation of how this feature works](docs/runner/summary-details-transforms.md)
 */
const summaryDetailsTransformations: SummaryDetailsTransformationMap = {
  "close-contact-form": closeContact,
};

module.exports = summaryDetailsTransformations;

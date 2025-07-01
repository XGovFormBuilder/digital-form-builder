"use strict";

import { sectionsOnlyAndCardConversion } from "./sectionsOnlyAndCardConversion";

import { SummaryDetailsTransformationMap } from "server/transforms/summaryDetails/types";
export { SummaryDetailsTransformationMap };

/**
 * [View the docs for summary-details-transformations an explanation of how this feature works](docs/runner/summary-details-transforms.md)
 */
const summaryDetailsTransformations: SummaryDetailsTransformationMap = {
  "close-contact-form": sectionsOnlyAndCardConversion,
  "close-contact-form-uat": sectionsOnlyAndCardConversion,
  "close-contact-form-nl5": sectionsOnlyAndCardConversion,
  "close-contact-form-hpt": sectionsOnlyAndCardConversion,
  "close-contact-form-hpt-uat": sectionsOnlyAndCardConversion,
  "close-contact-form-hpt-nl5": sectionsOnlyAndCardConversion,
};

module.exports = summaryDetailsTransformations;

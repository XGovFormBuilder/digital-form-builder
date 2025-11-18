"use strict";

import { mergeRows } from "./mergeRows";
import { removeRows } from "./removeRows";
import { filterSections } from "./filterSections";

import { SummaryDetailsTransformationMap } from "server/transforms/summaryDetails/types";
export { SummaryDetailsTransformationMap };

/**
 * [View the docs for summary-details-transformations an explanation of how this feature works](docs/runner/summary-details-transforms.md)
 */

const closeContactParams = [
  {
    names: ["first_name", "last_name"],
    to: "Full name",
    joiner: " ",
  },
  {
    names: ["mobile_number", "landline_number", "email_address"],
    to: "Contact details",
    joiner: "\n",
  },
];

const klsRemoveParams = ["ZpmVWP"];

const summaryDetailsTransformations: SummaryDetailsTransformationMap = {
  "close-contact-form": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-cca": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "kls-enquiries": (details) => {
    return removeRows(details, klsRemoveParams);
  },
  "kls-training-request": (details) => {
    return removeRows(details, klsRemoveParams);
  },
};

module.exports = summaryDetailsTransformations;




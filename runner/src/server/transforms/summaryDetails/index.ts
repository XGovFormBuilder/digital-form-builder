"use strict";

import { mergeRows } from "./mergeRows";
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

const summaryDetailsTransformations: SummaryDetailsTransformationMap = {
  "close-contact-form-nl1-dev": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-nl1-test": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-nl4": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-nl5": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-nl7": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-nl8": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-uat": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-nl1-dev": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-nl1-test": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-nl4": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-nl5": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-nl7": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-nl8": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
  "close-contact-form-hpt-uat": (details) => {
    const firstTransform = mergeRows(details, closeContactParams);
    return filterSections(firstTransform);
  },
};

module.exports = summaryDetailsTransformations;


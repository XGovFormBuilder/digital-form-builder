"use strict";

type SummaryTransformationsMap = Record<string, (value: any) => any>;

const SummaryTransformationsMap: SummaryTransformationsMap = {
  test: (value) => {
    console.log("test form summary transformation");
    return value;
  },
};

module.exports = SummaryTransformationsMap;

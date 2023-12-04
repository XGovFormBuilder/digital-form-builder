import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

import { clone } from "hoek";

const state = {
  checkBeforeYouStart: {
    ukPassport: true,
  },
  applicantDetails: {
    numberOfApplicants: 2,
  },
  applicant: [
    {
      "/applicant-repeatable": {
        firstName: "a",
        middleName: "b",
        lastName: "c",
      },
      "/contact-details": {
        phoneNumber: "123",
        emailAddress: "j@j",
      },
    },
    {
      "/applicant-repeatable": {
        firstName: "c",
        middleName: "d",
        lastName: "e",
      },
      "/contact-details": {
        phoneNumber: "123",
        emailAddress: "j@j",
      },
    },
  ],
};

const p = {
  "/applicant-repeatable": {
    firstName: "a",
    middleName: "b",
    lastName: "c",
  },
  "/contact-details": {
    phoneNumber: "123",
    emailAddress: "j@j",
  },
};
const q = [p, p];

function toSingleObject(acc, curr) {
  return {
    ...acc,
    ...curr,
  };
}

function withoutPageKeys(repeatedSection) {
  return Object.values(repeatedSection).reduce(toSingleObject, {});
}

function toStateWithRemovedPageKeys(acc, curr) {
  const [key, repeatedSection] = curr;

  return {
    ...acc,
    [key]: repeatedSection.map(withoutPageKeys),
  };
}

export function gatherRepeatPages(state) {
  const { progress, ...stateWithoutProgress } = state;
  const entries = Object.entries(stateWithoutProgress);
  const repeatSections = entries.filter(([_key, section]) =>
    Array.isArray(section)
  );

  if (!repeatSections) {
    return state;
  }

  const repeatSectionStateWithoutPageKeys = repeatSections.reduce(
    toStateWithRemovedPageKeys,
    {}
  );
  return {
    ...state,
    ...repeatSectionStateWithoutPageKeys,
  };
}
test.only("gatherRepeatPages", () => {
  expect(gatherRepeatPages(state)).to.equal({
    checkBeforeYouStart: {
      ukPassport: true,
    },
    applicantDetails: {
      numberOfApplicants: 2,
    },
    applicant: [
      {
        firstName: "a",
        middleName: "b",
        lastName: "c",
        phoneNumber: "123",
        emailAddress: "j@j",
      },
      {
        firstName: "c",
        middleName: "d",
        lastName: "e",
        phoneNumber: "123",
        emailAddress: "j@j",
      },
    ],
  });
});

suite.only("gatherRepeatPages", () => {
  test("joinPages merges a section separated by page", () => {
    const section = {
      "/applicant-repeatable": {
        firstName: "a",
        middleName: "b",
        lastName: "c",
      },
      "/contact-details": {
        phoneNumber: "123",
        emailAddress: "j@j",
      },
    };

    expect(withoutPageKeys(section)).to.equal({
      firstName: "a",
      middleName: "b",
      lastName: "c",
      phoneNumber: "123",
      emailAddress: "j@j",
    });
  });
});

import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
const { before, test, suite, after } = (exports.lab = Lab.script());

import { removeRows } from "../../../../src/server/transforms/summaryDetails/removeRows";

suite("mergeRows", () => {
  const details = [
    {
      name: "Detail1",
      title: "Detail 1",
      items: [
        {
          name: "organisation_1",
          title: "Which organisation do you work for?",
          label: "Which organistation do you work for?",
          value: "ORG 1",
          rawValue: "ORG 1",
          url: "/org1",
        },
        {
          name: "organisation_2",
          title: "Which organisation do you work for?",
          label: "Which organistation do you work for?",
          value: "ORG 2",
          rawValue: "ORG 2",
          url: "/org2",
        },
        {
          name: "first_name",
          title: "First name",
          label: "First name",
          value: "Joe",
          rawValue: "Joe",
          url: "/namePage",
        },
        {
          name: "last_name",
          title: "Last name",
          label: "Last name",
          value: "Bloggs",
          rawValue: "Bloggs",
          url: "/namePage",
        },
        {
          name: "dob",
          title: "Date of birth",
          label: "Date of birth",
          value: "21/04/1994",
          rawValue: "21/04/1994",
          url: "/namePage",
        },
      ],
    },
  ];
  const fields = [
    "organisation", "dob",
  ];

  test("mergeRows correctly transforms ", () => {
    expect(removeRows(details, fields)).to.equal([
      {
        name: "Detail1",
        title: "Detail 1",
        items: [
        {
          name: "organisation_2",
          title: "Which organisation do you work for?",
          label: "Which organistation do you work for?",
          value: "ORG 2",
          rawValue: "ORG 2",
          url: "/org2",
        },
        {
          name: "first_name",
          title: "First name",
          label: "First name",
          value: "Joe",
          rawValue: "Joe",
          url: "/namePage",
        },
        {
          name: "last_name",
          title: "Last name",
          label: "Last name",
          value: "Bloggs",
          rawValue: "Bloggs",
          url: "/namePage",
        },
        ],
      },
    ]);
  });
});

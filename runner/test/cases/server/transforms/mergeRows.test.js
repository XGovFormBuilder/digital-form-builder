import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
const { before, test, suite, after } = (exports.lab = Lab.script());

import { mergeRows } from "../../../../src/server/transforms/summaryDetails/mergeRows";

suite("mergeRows", () => {
  const details = [
    {
      name: "Detail1",
      title: "Detail 1",
      items: [
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
    { names: ["first_name", "last_name"], to: "Full name", joiner: " " },
  ];

  test("mergeRows correctly transforms ", () => {
    expect(mergeRows(details, fields)).to.equal([
      {
        name: "Detail1",
        title: "Detail 1",
        items: [
          {
            name: "full_name",
            title: "Full name",
            label: "Full name",
            value: "Joe Bloggs",
            rawValue: "Full name",
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
    ]);
  });
});

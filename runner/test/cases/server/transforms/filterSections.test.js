import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
const { before, test, suite, after } = (exports.lab = Lab.script());

import { filterSections } from "../../../../src/server/transforms/summaryDetails/filterSections";

suite("filterSections", () => {
  const details = [
    {
      items: [
        {
          name: "id",
          title: "ID",
          label: "ID",
          value: "123",
          rawValue: "123",
          url: "/startPage",
        },
      ],
    },
    {
      name: "YourDetails",
      title: "Your details",
      items: [
        {
          name: "first_name",
          title: "First name",
          label: "First name",
          value: "Joe",
          rawValue: "Joe",
          url: "/namePage?returnTo=summary",
          pageId: "/namePage",
        },
      ],
    },
    {
      name: "Person1",
      title: "Person 1",
      items: [
        {
          name: "first_name",
          title: "First name",
          label: "First name",
          value: "Joe",
          rawValue: "Joe",
          url: "/namePage?returnTo=summary",
          pageId: "/namePage",
        },
      ],
    },
    {
      name: "Person2",
      title: "Person 2",
      items: [
        {
          name: "first_name",
          title: "First name",
          label: "First name",
          value: "Joe",
          rawValue: "Joe",
          url: "/namePage?returnTo=summary",
          pageId: "/namePage",
          inError: true,
        },
      ],
    },
  ];

  test("filterSections correctly transforms", () => {
    expect(filterSections(details)).to.equal([
      {
        name: "YourDetails",
        title: "Your details",
        items: [
          {
            name: "first_name",
            title: "First name",
            label: "First name",
            value: "Joe",
            rawValue: "Joe",
            url: "/namePage?returnTo=summary",
            pageId: "/namePage",
          },
        ],
      },
      {
        name: "Person1",
        title: "Person 1",
        card: "/namePage?returnTo=summary",
        items: [
          {
            name: "first_name",
            title: "First name",
            label: "First name",
            value: "Joe",
            rawValue: "Joe",
            url: "/namePage?returnTo=summary",
            pageId: "/namePage",
          },
        ],
      },
      {
        name: "Person2",
        title: "Person 2",
        card: "/namePage",
        items: [
          {
            name: "first_name",
            title: "First name",
            label: "First name",
            value: "Joe",
            rawValue: "Joe",
            url: "/namePage?returnTo=summary",
            pageId: "/namePage",
            inError: true,
          },
        ],
      },
    ]);
  });
});

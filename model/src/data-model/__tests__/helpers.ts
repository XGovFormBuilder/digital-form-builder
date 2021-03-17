// @ts-nocheck
import { RawData } from "../data-model";
export const fullyPopulatedRawData: Readonly<RawData> = {
  pages: [
    {
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2" }],
      components: [{ name: "name1" }, { name: "name2" }],
    },
    {
      name: "page2",
      section: "section1",
      path: "/2",
      next: [{ path: "/3" }],
      components: [{ name: "name3" }, { name: "name4" }],
    },
  ],
  conditions: [
    { name: "badger", displayName: "Badgers", value: "badger == true" },
  ],
  feedback: {
    feedbackForm: false,
    url: "/feedback",
  },
  lists: [
    {
      name: "myList",
      type: "string",
      items: [
        {
          text: "some stuff",
          value: "myValue",
          description: "A hint",
          condition: "badger",
        },
        { text: "another thing", value: "anotherValue" },
      ],
    },
  ],
  phaseBanner: {
    phase: "alpha",
    feedbackUrl: "mailto:test@gov.uk",
  },
};

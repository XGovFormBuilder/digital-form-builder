import { FormDefinition } from "@xgovformbuilder/model";
import { allPathsLeadingTo } from "..";

test("allPathsLeadingTo should work with cycle in paths", () => {
  const data: FormDefinition = {
    pages: [
      {
        path: "/1",
        next: [{ path: "/2" }],
      },
      {
        path: "/2",
        next: [{ path: "/1" }],
      },
      {
        path: "/3",
      },
    ],
  };
  const paths = allPathsLeadingTo(data, "/2");
  expect(paths).toEqual(["/2", "/1"]);
});

test("allPathsLeadingTo should work with single parents", () => {
  const data: FormDefinition = {
    pages: [
      {
        path: "/1",
        next: [{ path: "/2" }],
      },
      {
        path: "/2",
        next: [{ path: "/3" }],
      },
      {
        path: "/3",
      },
    ],
  };
  expect(allPathsLeadingTo(data, "/3")).toEqual(["/3", "/2", "/1"]);
});

test("allPathsLeadingTo should work with multiple parents", () => {
  const data: FormDefinition = {
    pages: [
      {
        path: "/1",
        next: [{ path: "/2" }, { path: "/3" }],
      },
      {
        path: "/2",
        next: [{ path: "/4" }],
      },
      {
        path: "/3",
        next: [{ path: "/4" }],
      },
      {
        path: "/4",
      },
    ],
  };

  expect(allPathsLeadingTo(data, "/4")).toEqual(["/4", "/2", "/1", "/3"]);
  expect(allPathsLeadingTo(data, "/3")).toEqual(["/3", "/1"]);
  expect(allPathsLeadingTo(data, "/1")).toEqual(["/1"]);
});

import { FormDefinition } from "@xgovformbuilder/model";
import { addPage } from "../addPage";

const data: FormDefinition = {
  conditions: [],
  lists: [],
  name: "",
  pages: [
    {
      title: "scrambled",
      path: "/scrambled",
      next: [{ path: "/poached" }],
    },
    { title: "poached", path: "/poached" },
    { title: "sunny", path: "/sunny" },
  ],
  sections: [],
  startPage: "",
};

test("addPage throws if a page with the same path already exists", () => {
  expect(() => addPage(data, { path: "/scrambled" })).toThrow(
    /A page with the path/
  );
});

test("addPage adds a page if one does not exist with the same path", () => {
  expect(addPage(data, { path: "/soft-boiled" }).pages).toContainEqual({
    path: "/soft-boiled",
  });
});

import { FormDefinition } from "@xgovformbuilder/model";
import { findList } from "../findList";

test("findList throws when no list can be found", () => {
  const data: FormDefinition = {
    conditions: [],
    lists: [
      {
        name: "listA",
      },
      {
        name: "listB",
      },
    ],
    pages: [],
    sections: [],
  };

  expect(() => findList(data, "listC")).toThrowError(
    /No list found with the name/
  );
});

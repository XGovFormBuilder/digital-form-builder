import { isNotContentType } from "../data-model";
import {
  ContentComponentsDef,
  InputFieldsComponentsDef,
} from "../../components";
test("isNotContentType type guard catches content types", () => {
  const contentBase: ContentComponentsDef = {
    options: {},
    type: "Para",
    content: "",
    name: "",
    schema: {},
    subType: "content",
    title: "",
  };

  const inputBase: InputFieldsComponentsDef = {
    hint: "",
    name: "",
    options: {},
    schema: {},
    title: "",
    type: "TextField",
  };

  expect(isNotContentType(contentBase)).toBe(false);
  expect(isNotContentType({ ...contentBase, type: "Details" })).toBe(false);
  expect(isNotContentType({ ...contentBase, type: "InsetText" })).toBe(false);
  expect(isNotContentType({ ...contentBase, type: "Para" })).toBe(false);
  expect(isNotContentType(inputBase)).toBe(true);
  expect(isNotContentType({ ...inputBase, type: "TelephoneNumberField" })).toBe(
    true
  );
  expect(
    isNotContentType({
      list: "",
      ...inputBase,
      type: "RadiosField",
    })
  ).toBe(true);
});

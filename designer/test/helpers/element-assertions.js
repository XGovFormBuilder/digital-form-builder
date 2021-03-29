import * as Code from "@hapi/code";

const { expect } = Code;

export function assertDiv(wrapper, classes) {
  assertElement(wrapper, "div", classes);
}

export function assertText(wrapper, text) {
  expect(wrapper.text()).to.equal(text);
}

export function assertClasses(wrapper, classes) {
  const certainClasses = classes ?? [];
  certainClasses.forEach((className) => {
    expect(
      wrapper.hasClass(className),
      `${getTagName(wrapper)} ${
        getProperty(wrapper, "id") || ""
      } to have class ${className}`
    ).to.equal(true);
  });
}

export function assertSpan(wrapper, classes) {
  assertElement(wrapper, "span", classes);
}

export function assertLabel(wrapper, text) {
  assertElement(wrapper, "label", ["govuk-label"]);
  expect(wrapper.text()).to.equal(text);
}

export function assertLink(wrapper, id, expectedText) {
  expect(getProperty(wrapper, "id")).to.equal(id);
  expect(wrapper.text()).to.equal(expectedText);
}

export function assertRequiredNumberInput(wrapper, id, expectedValue) {
  assertNumberInput(wrapper, id, expectedValue);
  expect(getPropertyNames(wrapper).includes("required")).to.equal(true);
}

export function assertNumberInput(wrapper, id, expectedValue) {
  assertTextBasedInput(wrapper, id, expectedValue, "number");
}

export function assertRequiredTextInput({ wrapper, id, expectedValue }) {
  assertTextInput({ wrapper, id, expectedValue });
  expect(getPropertyNames(wrapper).includes("required")).to.equal(true);
}

export function assertTextInput({ wrapper, id, expectedValue, attrs }) {
  assertTextBasedInput(wrapper, id, expectedValue, "text", attrs);
}

export function assertTextBasedInput(wrapper, id, expectedValue, type, attrs) {
  expect(getTagName(wrapper)).to.equal("input");
  expect(getProperty(wrapper, "id")).to.equal(id);
  expect(getProperty(wrapper, "type")).to.equal(type);
  expect(
    getProperty(wrapper, "defaultValue") || getProperty(wrapper, "value")
  ).to.equal(expectedValue);
  assertAdditionalAttributes(attrs, wrapper);
}

export function assertTextArea({ wrapper, id, expectedValue, attrs }) {
  expect(wrapper.prop("id")).to.equal(id);
  expect(
    getProperty(wrapper, "defaultValue") || getProperty(wrapper, "value")
  ).to.equal(expectedValue);
  assertAdditionalAttributes(attrs, wrapper);
}

export function assertSelectInput({
  wrapper,
  id,
  expectedFieldOptions,
  expectedValue,
}) {
  expect(getTagName(wrapper)).to.equal("select");
  expect(getProperty(wrapper, "id")).to.equal(id);
  const options = wrapper.children();
  expect(options.length).to.equal(expectedFieldOptions.length);
  expectedFieldOptions.forEach((expectedOption, index) => {
    assertOption(options.at(index), expectedOption.value, expectedOption.text);
  });
  expect(getProperty(wrapper, "value")).to.equal(expectedValue);
}

export function assertCheckboxInput({ wrapper, id, value, checked, attrs }) {
  expect(getTagName(wrapper)).to.equal("input");
  expect(getProperty(wrapper, "type")).to.equal("checkbox");
  expect(getProperty(wrapper, "id")).to.equal(id);
  expect(getProperty(wrapper, "value")).to.equal(value);
  expect(
    getProperty(wrapper, "checked"),
    `checkbox ${id} to be ${checked ? "checked" : "not checked"}`
  ).to.equal(checked);
  assertAdditionalAttributes(attrs, wrapper);
}

export function assertRadioButton({ wrapper, id, value, label, attrs }) {
  expect(getTagName(wrapper)).to.equal("input");
  expect(getProperty(wrapper, "type")).to.equal("radio");
  expect(getProperty(wrapper, "id")).to.equal(id);
  expect(getProperty(wrapper, "value")).to.equal(value);
  expect(wrapper.closest("div").find("label").text()).to.equal(label);
  assertAdditionalAttributes(attrs, wrapper);
}

export function assertOption(wrapper, expectedValue, expectedText) {
  expect(getTagName(wrapper)).to.equal("option");
  expect(getProperty(wrapper, "value")).to.equal(expectedValue);
  expect(wrapper.text()).to.equal(expectedText);
}

function assertElement(wrapper, elementName, classes) {
  expect(getTagName(wrapper)).to.equal(elementName);
  assertClasses(wrapper, classes);
}

function assertAdditionalAttributes(attrs = {}, wrapper) {
  Object.keys(attrs).forEach((key) => {
    expect(wrapper.prop(key)).to.equal(attrs[key]);
  });
}

/** ****** Adapters for handling standard Enzyme (shallow) vs Cheerio (render) wrappers. Eugh! ***********/
function getTagName(wrapper) {
  if (typeof wrapper.name === "function") {
    return wrapper.name();
  }

  return wrapper.name;
}

function getProperty(wrapper, name) {
  if (typeof wrapper.prop === "function") {
    return wrapper.prop(name);
  }
  const propertyMapping = propertyMappings[name];
  return propertyMapping
    ? propertyMapping(wrapper.attribs)
    : wrapper.attribs[name];
}

function getPropertyNames(wrapper) {
  return typeof wrapper.props === "function"
    ? Object.keys(wrapper.props())
    : Object.keys(wrapper.attribs);
}

const propertyMappings = {
  defaultValue: (attribs) => attribs.value,
  checked: (attribs) => Object.keys(attribs).includes("checked") || "",
};

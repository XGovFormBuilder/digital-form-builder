import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, it } = lab;
import sinon from "sinon";
import { FlashCard } from "src/server/plugins/engine/components";

const lists = [
  {
    name: "myList",
    title:
      "How to get your vehicle importation letter and take your statutory declaration",
    type: "string",
    items: [
      {
        text: "Get your documents ready",
        value: "Get your documents ready",
        description:
          "On the next page we will tell you what documents you'll need to apply",
        condition: "my condition",
      },
      {
        text: "Add your documents",
        value: "Add your documents",
        description: "Upload a photo or scan of your documents",
        condition: "",
      },
      {
        text: "Apply online",
        value: "Apply online",
        description:
          "Take as long as you need to finish, but if you're inactive for 20 minutes your application will time out",
        condition: "",
      },
      {
        text: "Pay online",
        value: "Pay online",
        description:
          "This service costs £100 you can pay by credit or debit card",
        condition: "",
      },
      {
        text: "Book an appointment at the Consulate in Lisbon or Portimão",
        value: "Book an appointment at the Consulate in Lisbon or Portimão",
        description:
          "After you've completed your online application you need to take a statutory declaration at the Consulate. We will give you the option to go to the Consulate at Lisbon or Portimão and we will send you a link to book your appointment.",
        condition: "",
      },
      {
        text: "Check and print your declaration",
        value: "Check and print your statutory declaration",
        description:
          "Your declaration will be emailed to you. Check the details are correct, then print it off but do not sign it. Take it to your appointment at the Consulate.",
        condition: "",
      },
      {
        text: "Take your documents to Portuguese customs ",
        value: "Take your documents to Portuguese customs ",
        description:
          "Take your vehicle importation letter and signed statutory declaration to Portuguese customs.",
        condition: "",
      },
    ],
  },
];

suite("Flashcard", () => {
  it("returns the correct ViewModel for rendering", () => {
    const componentDefinition = {
      subType: "field",
      type: "CheckboxesField",
      name: "myCheckbox",
      title: "Tada",
      options: {},
      list: "numberOfApplicants",
      schema: {},
    };
    const formModel = {
      getList: (_name) => lists[0],
      makePage: () => sinon.stub(),
    };
    const component = new FlashCard(componentDefinition, formModel);
    const viewModel = component.getViewModel();
    expect(viewModel).to.equal({
      attributes: {},
      content: [
        {
          title: "Get your documents ready",
          text:
            "On the next page we will tell you what documents you'll need to apply",
          condition: "my condition",
        },
        {
          title: "Add your documents",
          text: "Upload a photo or scan of your documents",
          condition: "",
        },
        {
          title: "Apply online",
          text:
            "Take as long as you need to finish, but if you're inactive for 20 minutes your application will time out",
          condition: "",
        },
        {
          title: "Pay online",
          text: "This service costs £100 you can pay by credit or debit card",
          condition: "",
        },
        {
          title: "Book an appointment at the Consulate in Lisbon or Portimão",
          text:
            "After you've completed your online application you need to take a statutory declaration at the Consulate. We will give you the option to go to the Consulate at Lisbon or Portimão and we will send you a link to book your appointment.",
          condition: "",
        },
        {
          title: "Check and print your declaration",
          text:
            "Your declaration will be emailed to you. Check the details are correct, then print it off but do not sign it. Take it to your appointment at the Consulate.",
          condition: "",
        },
        {
          title: "Take your documents to Portuguese customs ",
          text:
            "Take your vehicle importation letter and signed statutory declaration to Portuguese customs.",
          condition: "",
        },
      ],
    });
  });
});

import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import {
  controllerNameFromPath,
  getPageController,
} from "server/plugins/engine/pageControllers/helpers";

import * as PageControllers from "server/plugins/engine/pageControllers";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";
import { PageController } from "server/plugins/engine/pageControllers";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { describe, suite, test } = lab;

suite("Engine Page Controllers getPageController", () => {
  describe("controllerNameFromPath", () => {
    test("controller name is extracted correctly", () => {
      const filePath = "./pages/summary.js";
      const controllerName = controllerNameFromPath(filePath);
      expect(controllerName).to.equal("SummaryPageController");
    });

    test("kebab-case is pascal-case", () => {
      const filePath = "./pages/dob.js";
      const controllerName = controllerNameFromPath(filePath);
      expect(controllerName).to.equal("DobPageController");
    });
  });

  describe("getPageController", () => {
    test("it returns DobPageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/dob.js");
      expect(controllerFromPath).to.equal(PageControllers.DobPageController);

      const controllerFromName = getPageController("DobPageController");
      expect(controllerFromName).to.equal(PageControllers.DobPageController);
    });

    test("it returns HomePageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/home.js");
      expect(controllerFromPath).to.equal(PageControllers.HomePageController);

      const controllerFromName = getPageController("HomePageController");
      expect(controllerFromName).to.equal(PageControllers.HomePageController);
    });

    test("it returns StartDatePageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/start-date.js");
      expect(controllerFromPath).to.equal(
        PageControllers.StartDatePageController
      );

      const controllerFromName = getPageController("StartDatePageController");
      expect(controllerFromName).to.equal(
        PageControllers.StartDatePageController
      );
    });

    test("it returns StartPageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/start.js");
      expect(controllerFromPath).to.equal(PageControllers.StartPageController);

      const controllerFromName = getPageController("StartPageController");
      expect(controllerFromName).to.equal(PageControllers.StartPageController);
    });

    test("it returns SummaryPageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/summary.js");
      expect(controllerFromPath).to.equal(
        PageControllers.SummaryPageController
      );

      const controllerFromName = getPageController("SummaryPageController");
      expect(controllerFromName).to.equal(
        PageControllers.SummaryPageController
      );
    });
  });

  describe("calculateRelevantState", () => {
    const formJson = JSON.parse(
      '{"startPage":"/uk-passport","pages":[{"path":"/uk-passport","components":[{"type":"YesNoField","name":"ukPassport","title":"Do you have a UK passport?","options":{"required":true},"schema":{}}],"section":"checkBeforeYouStart","next":[{"path":"/how-many-people"},{"path":"/testconditions","condition":"doesntHaveUKPassport"}],"title":"Do you have a UK passport?"},{"path":"/how-many-people","section":"applicantDetails","components":[{"options":{"classes":"govuk-input--width-10","required":true},"type":"SelectField","name":"numberOfApplicants","title":"How many applicants are there?","list":"numberOfApplicants","schema":{}}],"next":[{"path":"/applicant-one"}],"title":"How many applicants are there?"},{"path":"/applicant-one","title":"Applicant 1","section":"applicantOneDetails","components":[{"type":"Para","content":"Provide the details as they appear on your passport.","options":{"required":true},"schema":{}},{"type":"TextField","name":"firstName","title":"First name","options":{"required":true},"schema":{}},{"options":{"required":false,"optionalText":false},"type":"TextField","name":"middleName","title":"Middle name","hint":"If you have a middle name on your passport you must include it here","schema":{}},{"type":"TextField","name":"lastName","title":"Surname","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-one-address"}]},{"path":"/applicant-one-address","section":"applicantOneDetails","components":[{"type":"UkAddressField","name":"address","title":"Address","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-two","condition":"moreThanOneApplicant"},{"path":"/contact-details"}],"title":"Address"},{"path":"/applicant-two","title":"Applicant 2","section":"applicantTwoDetails","components":[{"type":"Para","content":"Provide the details as they appear on your passport.","options":{"required":true},"schema":{}},{"type":"TextField","name":"firstName","title":"First name","options":{"required":true},"schema":{}},{"options":{"required":false,"optionalText":false},"type":"TextField","name":"middleName","title":"Middle name","hint":"If you have a middle name on your passport you must include it here","schema":{}},{"type":"TextField","name":"lastName","title":"Surname","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-two-address"}]},{"path":"/applicant-two-address","section":"applicantTwoDetails","components":[{"type":"UkAddressField","name":"address","title":"Address","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-three","condition":"moreThanTwoApplicants"},{"path":"/contact-details"}],"title":"Address"},{"path":"/applicant-three","title":"Applicant 3","section":"applicantThreeDetails","components":[{"type":"Para","content":"Provide the details as they appear on your passport.","options":{"required":true},"schema":{}},{"type":"TextField","name":"firstName","title":"First name","options":{"required":true},"schema":{}},{"options":{"required":false,"optionalText":false},"type":"TextField","name":"middleName","title":"Middle name","hint":"If you have a middle name on your passport you must include it here","schema":{}},{"type":"TextField","name":"lastName","title":"Surname","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-three-address"}]},{"path":"/applicant-three-address","section":"applicantThreeDetails","components":[{"type":"UkAddressField","name":"address","title":"Address","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-four","condition":"moreThanThreeApplicants"},{"path":"/contact-details"}],"title":"Address"},{"path":"/applicant-four","title":"Applicant 4","section":"applicantFourDetails","components":[{"type":"Para","content":"Provide the details as they appear on your passport.","options":{"required":true},"schema":{}},{"type":"TextField","name":"firstName","title":"First name","options":{"required":true},"schema":{}},{"options":{"required":false,"optionalText":false},"type":"TextField","name":"middleName","title":"Middle name","hint":"If you have a middle name on your passport you must include it here","schema":{}},{"type":"TextField","name":"lastName","title":"Surname","options":{"required":true},"schema":{}}],"next":[{"path":"/applicant-four-address"}]},{"path":"/applicant-four-address","section":"applicantFourDetails","components":[{"type":"UkAddressField","name":"address","title":"Address","options":{"required":true},"schema":{}}],"next":[{"path":"/contact-details"}],"title":"Address"},{"path":"/contact-details","section":"applicantDetails","components":[{"type":"TelephoneNumberField","name":"phoneNumber","title":"Phone number","hint":"If you haven\'t got a UK phone number, include country code","options":{"required":true},"schema":{}},{"type":"EmailAddressField","name":"emailAddress","title":"Your email address","options":{"required":true},"schema":{}}],"next":[{"path":"/testconditions"}],"title":"Applicant contact details"},{"path":"/summary","controller":"./pages/summary.js","title":"Summary","components":[],"next":[]},{"path":"/testconditions","title":"TestConditions","components":[{"name":"pmmRYP","options":{"condition":"bDDfgf"},"type":"Para","content":"There Is Someone Called Martin"}],"next":[{"path":"/summary"}]}],"lists":[{"name":"numberOfApplicants","title":"Number of people","type":"number","items":[{"text":"1","value":1,"description":"","condition":""},{"text":"2","value":2,"description":"","condition":""},{"text":"3","value":3,"description":"","condition":""},{"text":"4","value":4,"description":"","condition":""}]}],"sections":[{"name":"checkBeforeYouStart","title":"Check before you start"},{"name":"applicantDetails","title":"Applicant details"},{"name":"applicantOneDetails","title":"Applicant 1"},{"name":"applicantTwoDetails","title":"Applicant 2"},{"name":"applicantThreeDetails","title":"Applicant 3"},{"name":"applicantFourDetails","title":"Applicant 4"}],"phaseBanner":{},"fees":[],"outputs":[{"name":"Ric43H5Ctwl4NBDC9x1_4","title":"email","type":"email","outputConfiguration":{"emailAddress":"jennifermyanh.duong@digital.homeoffice.gov.uk"}}],"declaration":"<p class=\\"govuk-body\\">All the answers you have provided are true to the best of your knowledge.</p>","version":2,"conditions":[{"name":"hasUKPassport","displayName":"hasUKPassport","value":"checkBeforeYouStart.ukPassport==true"},{"name":"doesntHaveUKPassport","displayName":"doesntHaveUKPassport","value":"checkBeforeYouStart.ukPassport==false"},{"name":"moreThanOneApplicant","displayName":"moreThanOneApplicant","value":"applicantDetails.numberOfApplicants > 1"},{"name":"moreThanTwoApplicants","displayName":"moreThanTwoApplicants","value":"applicantDetails.numberOfApplicants > 2"},{"name":"moreThanThreeApplicants","displayName":"moreThanThreeApplicants","value":"applicantDetails.numberOfApplicants > 3"},{"name":"bDDfgf","displayName":"testCondition","value":{"name":"testCondition","conditions":[{"field":{"name":"applicantOneDetails.firstName","type":"TextField","display":"First name"},"operator":"is","value":{"type":"Value","value":"Martin","display":"Martin"}}]}}]}'
    );

    test.only("it correctly includes/filters state values", () => {
      const formModel = new FormModel(formJson, {});

      //Selected page appears after convergence and contains a conditional field
      //This is the page we're theoritically browsing to
      const testConditionsPage = formModel.pages.find(
        (page) => page.path === "/testconditions"
      );

      const page = new PageController(formModel, testConditionsPage?.pageDef);

      //The state below shows we said we had a UKPassport and entered details for an applicant
      let completeState = {
        progress: [
          "/csds/uk-passport?visit=7O4_nT1TVI",
          "/csds/how-many-people?visit=7O4_nT1TVI",
          "/csds/applicant-one?visit=7O4_nT1TVI",
          "/csds/applicant-one-address?visit=7O4_nT1TVI",
          "/csds/contact-details?visit=7O4_nT1TVI",
        ],
        checkBeforeYouStart: {
          ukPassport: true,
        },
        applicantDetails: {
          numberOfApplicants: 1,
          phoneNumber: "1234567890",
          emailAddress: "developer@test.com",
        },
        applicantOneDetails: {
          firstName: "Martin",
          middleName: null,
          lastName: "Crawley",
          address: {
            addressLine1: "AddressLine1",
            addressLine2: "AddressLine2",
            town: "Town",
            postcode: "Postcode",
          },
        },
      };

      //Calculate our relevantState based on the page we're attempting to load and the above state we provide
      let relevantState = page.calculateRelevantState(formModel, completeState);

      //Our relevantState should know our applicants firstName is Martin
      expect(relevantState.applicantOneDetails.firstName).to.equal("Martin");

      //Now mark that we don't have a UK Passport
      completeState.checkBeforeYouStart.ukPassport = false;

      //And recalculate our relevantState
      relevantState = page.calculateRelevantState(formModel, completeState);

      //Our relevantState should no longer know anything about our applicant
      expect(relevantState.checkBeforeYouStart.ukPassport).to.equal(false);
      expect(relevantState.applicantOneDetails).to.not.exist();
    });
  });
});

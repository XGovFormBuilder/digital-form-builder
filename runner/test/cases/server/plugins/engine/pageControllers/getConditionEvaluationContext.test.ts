import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import formJson from "../../../../../../src/server/forms/get-condition-evaluation-context.json";

import { FormModel } from "../../../../../../src/server/plugins/engine/models";
import { PageController } from "server/plugins/engine/pageControllers";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, it } = lab;

suite("Condition Evaluation Context", () => {
  it("it correctly includes/filters state values", () => {
    const formModel = new FormModel(formJson, {});

    //Selected page appears after convergence and contains a conditional field
    //This is the page we're theoretically browsing to
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
        emailAddress: "developer@example.com",
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
    let relevantState = page.getConditionEvaluationContext(
      formModel,
      completeState
    );

    //Our relevantState should know our applicants firstName is Martin
    expect(relevantState.applicantOneDetails.firstName).to.equal("Martin");

    //Now mark that we don't have a UK Passport
    completeState.checkBeforeYouStart.ukPassport = false;

    //And recalculate our relevantState
    relevantState = page.getConditionEvaluationContext(
      formModel,
      completeState
    );

    //Our relevantState should no longer know anything about our applicant
    expect(relevantState.checkBeforeYouStart.ukPassport).to.equal(false);
    expect(relevantState.applicantOneDetails).to.not.exist();
  });
});

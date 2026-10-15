// Forces the components barrel to resolve top-to-bottom before anything below
// imports a specific component class out of order, which otherwise throws
// "Class extends value undefined" when this file is run on its own.
import "server/plugins/engine/components";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { rpsGasTestKitOnSummarySubmit } from "../../../../../../src/server/services/hooks/rps/rpsGasTestKitOnSummarySubmit";
import { saveGasTestKitDetailsSchema } from "@xgovformbuilder/model/src/schema/rps";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, afterEach } = lab;

describe("saveGasTestKitDetailsSchema", () => {
  const customerPerson = {
    title: "Mr",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
  };

  const recipientPerson = {
    title: "Mr",
    firstName: "John",
    lastName: "Smith",
  };

  const address = {
    fullAddress: "Houses of Parliament, Westminster, London, SW1A 0AA",
    postcode: "SW1A 0AA",
  };

  const manualAddress = {
    fullAddress: "1 Test Street, Testville, TE5 7ST",
    postcode: "TE5 7ST",
  };

  const basePayload = {
    uuid: "343d10da-7d57-425e-8b2f-6891b1c563d6",
    customer: customerPerson,
    measurementAddress: address,
    kitRecipient: recipientPerson,
    kitRecipientAddress: address,
    resultsRecipient: recipientPerson,
    resultsRecipientAddress: manualAddress,
    prevTestedAddress: false,
    prevAboveActionLevel: false,
    remediationComplete: false,
    amount: 5280,
  };

  describe("valid payloads", () => {
    it("accepts a fully populated payload", () => {
      const { error, value } =
        saveGasTestKitDetailsSchema.validate(basePayload);
      expect(error).to.be.undefined();
      expect(value.customer.telephone).to.be.undefined();
      expect(value.resultsRecipientAddress.fullAddress).to.equal(
        manualAddress.fullAddress
      );
    });

    it("strips unknown top-level fields", () => {
      const { error, value } = saveGasTestKitDetailsSchema.validate({
        ...basePayload,
        somethingUnexpected: "leftover state",
      });
      expect(error).to.be.undefined();
      expect(value).to.not.include("somethingUnexpected");
    });

    it("keeps an explicitly provided customer telephone", () => {
      const { error, value } = saveGasTestKitDetailsSchema.validate({
        ...basePayload,
        customer: { ...customerPerson, telephone: "07865123456" },
      });
      expect(error).to.be.undefined();
      expect(value.customer.telephone).to.equal("07865123456");
    });
  });

  describe("invalid payloads", () => {
    it("errors when uuid is missing", () => {
      const { uuid, ...rest } = basePayload;
      const { error } = saveGasTestKitDetailsSchema.validate(rest);
      expect(error).to.exist();
      expect(error!.message).to.include("uuid");
    });

    it("errors when customer.firstName is missing", () => {
      const { firstName, ...personWithoutFirstName } = customerPerson;
      const { error } = saveGasTestKitDetailsSchema.validate({
        ...basePayload,
        customer: personWithoutFirstName,
      });
      expect(error).to.exist();
      expect(error!.message).to.include("firstName");
    });

    it("errors when customer.email is missing", () => {
      const { email, ...personWithoutEmail } = customerPerson;
      const { error } = saveGasTestKitDetailsSchema.validate({
        ...basePayload,
        customer: personWithoutEmail,
      });
      expect(error).to.exist();
      expect(error!.message).to.include("email");
    });

    it("errors when an address is missing fullAddress", () => {
      const { fullAddress, ...addressWithoutFullAddress } = address;
      const { error } = saveGasTestKitDetailsSchema.validate({
        ...basePayload,
        measurementAddress: addressWithoutFullAddress,
      });
      expect(error).to.exist();
      expect(error!.message).to.include("fullAddress");
    });

    it("errors when prevTestedAddress is not a boolean", () => {
      const { error } = saveGasTestKitDetailsSchema.validate({
        ...basePayload,
        prevTestedAddress: "yes",
      });
      expect(error).to.exist();
      expect(error!.message).to.include("prevTestedAddress");
    });
  });
});

describe("rpsGasTestKitOnSummarySubmit", () => {
  afterEach(() => {
    sinon.restore();
  });

  const measurementAddress = {
    address: "1 Measurement Way, Manchester",
    postcode: "M1 1AA",
  };

  const kitAddress = {
    address: "2 Kit Street, Leeds",
    postcode: "LS1 1AA",
  };

  const resultAddress = {
    address: "3 Results Road, Bristol",
    postcode: "BS1 1AA",
  };

  const toAddressDetails = (address: typeof measurementAddress) => ({
    fullAddress: address.address,
    postcode: address.postcode,
    udprn: "00000000",
  });

  const baseState = {
    title: "Mr",
    firstName: "John",
    lastName: "Smith",
    emailAddress: "john.smith@email.com",
    propertyAddress_selectedAddress: measurementAddress,
    testedBeforeYesNo: false,
    bqmYesNo: false,
    stepsToReduceYesNo: false,
  };

  // Only what FeesModel reads, with the fee from order-a-home-radon-gas-test-kit.json.
  const model = {
    def: { fees: [{ description: "Radon gas home test kit", amount: 5280 }] },
    conditions: {},
  };

  const buildRequest = () => {
    const storeGtkStub = sinon
      .stub()
      .resolves({ success: true, data: { message: "", uuid: "" } });

    const cacheService = { isStateFrozen: sinon.stub().resolves(false) };

    const yarStore = new Map<string, unknown>();

    const request: any = {
      service: {
        getServices: sinon.stub().returns({
          gasTestKitApiService: { storeGtk: storeGtkStub },
          cacheService,
        }),
      },
      logger: { warn: sinon.stub(), trace: sinon.stub() },
      yar: {
        get: (key: string) => yarStore.get(key),
        set: (key: string, value: unknown) => yarStore.set(key, value),
      },
    };

    return { request, storeGtkStub };
  };

  const getPostedBody = (storeGtkStub: sinon.SinonStub) => {
    return storeGtkStub.firstCall.args[0];
  };

  it("uses the measurement address for both kit and results when both are confirmed as the same as the measurement address", async () => {
    const { request, storeGtkStub } = buildRequest();
    const context: any = {
      model,
      state: {
        ...baseState,
        kitAddressConfirmation: true,
        resultAddressConfirmation: true,
        kitResultsConfirmation: true,
      },
    };

    await rpsGasTestKitOnSummarySubmit(request, context);

    const body = getPostedBody(storeGtkStub);

    expect(body.kitRecipient.firstName).to.equal("John");
    expect(body.kitRecipientAddress).to.equal(
      toAddressDetails(measurementAddress)
    );
    expect(body.resultsRecipient.firstName).to.equal("John");
    expect(body.resultsRecipientAddress).to.equal(
      toAddressDetails(measurementAddress)
    );
    expect(body.resultsRecipientAddress).to.equal(body.kitRecipientAddress);
  });

  it("uses the measurement address for the kit but collects a separate results address when only the kit is confirmed as the same as the measurement address", async () => {
    const { request, storeGtkStub } = buildRequest();
    const context: any = {
      model,
      state: {
        ...baseState,
        kitAddressConfirmation: true,
        resultAddressConfirmation: false,
        resultsTitle: "Mrs",
        resultsFirstName: "Jane",
        resultsLastName: "Doe",
        resultAddress_selectedAddress: resultAddress,
      },
    };

    await rpsGasTestKitOnSummarySubmit(request, context);

    const body = getPostedBody(storeGtkStub);

    expect(body.kitRecipient.firstName).to.equal("John");
    expect(body.kitRecipientAddress).to.equal(
      toAddressDetails(measurementAddress)
    );
    expect(body.resultsRecipient).to.equal({
      title: "Mrs",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(body.resultsRecipientAddress).to.equal(
      toAddressDetails(resultAddress)
    );
    expect(body.resultsRecipientAddress).to.not.equal(body.kitRecipientAddress);
  });

  it("sends results to the measurement address when kit goes to a different address but results are confirmed as the same as measurement", async () => {
    const { request, storeGtkStub } = buildRequest();
    const context: any = {
      model,
      state: {
        ...baseState,
        kitAddressConfirmation: false,
        resultAddressConfirmation: true,
        // kitResultsConfirmation is never shown in this form path, so it is absent
        kitTitle: "Dr",
        kitFirstName: "Ken",
        kitLastName: "Adams",
        kitAddress_selectedAddress: kitAddress,
      },
    };

    await rpsGasTestKitOnSummarySubmit(request, context);

    const body = getPostedBody(storeGtkStub);

    expect(body.kitRecipient).to.equal({
      title: "Dr",
      firstName: "Ken",
      lastName: "Adams",
    });
    expect(body.kitRecipientAddress).to.equal(toAddressDetails(kitAddress));
    expect(body.resultsRecipient.firstName).to.equal("John");
    expect(body.resultsRecipientAddress).to.equal(
      toAddressDetails(measurementAddress)
    );
    expect(body.resultsRecipientAddress).to.not.equal(
      toAddressDetails(kitAddress)
    );
  });

  it("sends results to the kit address when kit goes to a different address and kitResultsConfirmation is yes", async () => {
    const { request, storeGtkStub } = buildRequest();
    const context: any = {
      model,
      state: {
        ...baseState,
        kitAddressConfirmation: false,
        resultAddressConfirmation: false,
        kitResultsConfirmation: true,
        kitTitle: "Dr",
        kitFirstName: "Ken",
        kitLastName: "Adams",
        kitAddress_selectedAddress: kitAddress,
      },
    };

    await rpsGasTestKitOnSummarySubmit(request, context);

    const body = getPostedBody(storeGtkStub);

    expect(body.kitRecipient).to.equal({
      title: "Dr",
      firstName: "Ken",
      lastName: "Adams",
    });
    expect(body.kitRecipientAddress).to.equal(toAddressDetails(kitAddress));
    expect(body.resultsRecipient).to.equal(body.kitRecipient);
    expect(body.resultsRecipientAddress).to.equal(toAddressDetails(kitAddress));
  });

  it("sends results to a separate address when kit goes to a different address and kitResultsConfirmation is no", async () => {
    const { request, storeGtkStub } = buildRequest();
    const context: any = {
      model,
      state: {
        ...baseState,
        kitAddressConfirmation: false,
        resultAddressConfirmation: false,
        kitResultsConfirmation: false,
        kitTitle: "Dr",
        kitFirstName: "Ken",
        kitLastName: "Adams",
        kitAddress_selectedAddress: kitAddress,
        resultsTitle: "Ms",
        resultsFirstName: "Amy",
        resultsLastName: "Lee",
        resultAddress_selectedAddress: resultAddress,
      },
    };

    await rpsGasTestKitOnSummarySubmit(request, context);

    const body = getPostedBody(storeGtkStub);

    expect(body.kitRecipient).to.equal({
      title: "Dr",
      firstName: "Ken",
      lastName: "Adams",
    });
    expect(body.kitRecipientAddress).to.equal(toAddressDetails(kitAddress));
    expect(body.resultsRecipient).to.equal({
      title: "Ms",
      firstName: "Amy",
      lastName: "Lee",
    });
    expect(body.resultsRecipientAddress).to.equal(
      toAddressDetails(resultAddress)
    );
  });

  it("overrides any stale separately-entered kit/results addresses when both are confirmed as the same as the measurement address", async () => {
    const { request, storeGtkStub } = buildRequest();
    const context: any = {
      model,
      state: {
        ...baseState,
        kitAddressConfirmation: true,
        resultAddressConfirmation: true,
        // Leftover state from a previous journey through the form, where the
        // kit and results addresses were entered separately and differed.
        kitAddress_selectedAddress: kitAddress,
        resultAddress_selectedAddress: resultAddress,
      },
    };

    await rpsGasTestKitOnSummarySubmit(request, context);

    const body = getPostedBody(storeGtkStub);

    expect(body.kitRecipientAddress).to.equal(
      toAddressDetails(measurementAddress)
    );
    expect(body.resultsRecipientAddress).to.equal(
      toAddressDetails(measurementAddress)
    );
    expect(body.resultsRecipientAddress).to.equal(body.kitRecipientAddress);
    expect(body.resultsRecipientAddress).to.not.equal(
      toAddressDetails(resultAddress)
    );
  });
});

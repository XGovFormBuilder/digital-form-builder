// Forces the components barrel to resolve top-to-bottom before anything below
// imports a specific component class out of order, which otherwise throws
// "Class extends value undefined" when this file is run on its own.
import "server/plugins/engine/components";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { runHook } from "../../../../../src/server/services/hooks";
import { hookRegistry } from "../../../../../src/server/services/hooks/registry";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, afterEach } = lab;

describe("runHook", () => {
  afterEach(() => {
    sinon.restore();
  });

  const buildRequest = (state: Record<string, any> = {}) => {
    const getStateStub = sinon.stub().resolves(state);

    const request: any = {
      service: {
        getServices: sinon.stub().returns({
          cacheService: { getState: getStateStub },
        }),
      },
      logger: { trace: sinon.stub() },
    };

    return { request, getStateStub };
  };

  it("no-ops and does not read state when no hook is configured", async () => {
    const { request, getStateStub } = buildRequest();
    const model: any = { def: { hooks: {} } };

    const result = await runHook("MyController.onSomething", request, {
      model,
    });

    expect(result).to.be.undefined();
    expect(getStateStub.called).to.be.false();
  });

  it("no-ops when the configured value is 'void'", async () => {
    const { request, getStateStub } = buildRequest();
    const model: any = {
      def: { hooks: { "MyController.onSomething": "void" } },
    };

    const result = await runHook("MyController.onSomething", request, {
      model,
    });

    expect(result).to.be.undefined();
    expect(getStateStub.called).to.be.false();
  });

  it("throws a ControllerError when the configured action is unknown", async () => {
    const { request } = buildRequest();
    const model: any = {
      def: { hooks: { "MyController.onSomething": "notARealHook" } },
    };

    await expect(
      runHook("MyController.onSomething", request, { model })
    ).to.reject(Error, /Unknown hook action 'notARealHook'/);
  });

  it("fetches state from cacheService when context.state is not passed", async () => {
    const cachedState = { sessionId: "abc" };
    const { request, getStateStub } = buildRequest(cachedState);
    const model: any = {
      def: {
        hooks: { "MyController.onSomething": "rpsGetBillingInformation" },
      },
    };
    const hookStub = sinon.stub(hookRegistry, "rpsGetBillingInformation");
    hookStub.resolves(undefined);

    await runHook("MyController.onSomething", request, { model });

    expect(getStateStub.called).to.be.true();
    expect(hookStub.firstCall.args).to.equal([
      request,
      { state: cachedState, model },
    ]);
  });

  it("uses the passed state and skips the cache read when context.state is provided", async () => {
    const { request, getStateStub } = buildRequest();
    const model: any = {
      def: {
        hooks: { "MyController.onSomething": "rpsGetBillingInformation" },
      },
    };
    const explicitState = { sessionId: "explicit" };
    const hookStub = sinon.stub(hookRegistry, "rpsGetBillingInformation");
    hookStub.resolves(undefined);

    await runHook("MyController.onSomething", request, {
      model,
      state: explicitState,
    });

    expect(getStateStub.called).to.be.false();
    expect(hookStub.firstCall.args).to.equal([
      request,
      { state: explicitState, model },
    ]);
  });

  it("returns the resolved hook's return value", async () => {
    const { request } = buildRequest();
    const model: any = {
      def: {
        hooks: { "MyController.onSomething": "rpsGetBillingInformation" },
      },
    };
    const hookStub = sinon.stub(hookRegistry, "rpsGetBillingInformation");
    hookStub.resolves("hook result" as any);

    const result = await runHook("MyController.onSomething", request, {
      model,
    });

    expect(result).to.equal("hook result");
  });
});

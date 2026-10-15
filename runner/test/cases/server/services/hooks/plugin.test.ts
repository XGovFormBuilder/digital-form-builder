// Forces the components barrel to resolve top-to-bottom before anything below
// imports a specific component class out of order, which otherwise throws
// "Class extends value undefined" when this file is run on its own.
import "server/plugins/engine/components";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import hapi from "@hapi/hapi";
import Schmervice from "schmervice";
import sinon from "sinon";
import pluginLogging from "../../../../../src/server/plugins/logging";
import pluginServiceHelper from "../../../../../src/server/plugins/serviceHelper";
import pluginHooks from "../../../../../src/server/services/hooks";
import { hookRegistry } from "../../../../../src/server/services/hooks/registry";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, before, after, afterEach } = lab;

describe("hooks plugin (request.hook.run)", () => {
  let server: hapi.Server;

  before(async () => {
    server = hapi.server();
    await server.register(pluginLogging);
    await server.register(Schmervice);
    await server.register(pluginServiceHelper);
    await server.register(pluginHooks);

    // The dispatcher always resolves `cacheService` up front (even when an
    // explicit `state` is passed), so a stub must be registered for any
    // request to reach the hook lookup at all.
    server.registerService(
      Schmervice.withName("cacheService", { getState: async () => ({}) })
    );

    server.route({
      method: "GET",
      path: "/test",
      handler: async (request: any) => {
        const model = {
          def: {
            hooks: {
              "Test.onEvent": request.query.action ?? "void",
            },
          },
        };

        const result = await request.hook.run("Test.onEvent", {
          model,
          state: {},
        });

        return { result: result ?? null };
      },
    });

    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("decorates request with a callable hook.run", async () => {
    const res = await server.inject({ method: "GET", url: "/test" });

    expect(res.statusCode).to.equal(200);
    expect(JSON.parse(res.payload)).to.equal({ result: null });
  });

  it("dispatches through the real registry for a configured action", async () => {
    const hookStub = sinon.stub(hookRegistry, "rpsGetBillingInformation");
    hookStub.resolves("wired" as any);

    const res = await server.inject({
      method: "GET",
      url: "/test?action=rpsGetBillingInformation",
    });

    expect(res.statusCode).to.equal(200);
    expect(JSON.parse(res.payload)).to.equal({ result: "wired" });
    expect(hookStub.calledOnce).to.be.true();
  });
});

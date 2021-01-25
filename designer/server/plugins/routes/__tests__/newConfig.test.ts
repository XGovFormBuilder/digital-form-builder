const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");
const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script());
const { createServer } = require("../../../createServer");

describe("POST /new", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
  });

  it("Encodes the new form name", async () => {
    const name = ">:тестировать<";
    const invalidCharacters = [...name];
    const res = await server.inject({
      method: "post",
      url: "/new",
      payload: { name },
    });
    const encoded = res.headers.location;

    try {
      decodeURIComponent(encoded);
    } catch (e) {
      console.error(e);
    }
    expect(encoded).to.not.include(invalidCharacters);
    expect(res.statusCode).to.equal(302);
  });
});

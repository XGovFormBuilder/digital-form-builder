const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");
const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script());
const { createServer } = require("../../../createServer");

describe.only("POST /new", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterEach(async () => {
    // await server.stop();
  });

  it("responds with 200", async () => {
    console.log(server);
    const res = await server.inject({
      method: "post",
      url: "/new",
      payload: { name: ">>nice%252E%252E%252F<::<try::" },
    });
    expect(res.statusCode).to.equal(200);
  });
});

import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import FormData from "form-data";
import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, before, after } = lab;

const fixturesPath = __dirname;

function post(server, url) {
  const form = new FormData();

  return server.inject({
    method: "post",
    url,
    headers: form.getHeaders(),
    payload: form.getBuffer(),
  });
}

suite("Disabled form (active: false)", () => {
  let server;

  before(async () => {
    server = await createServer({
      formFileName: "disabled-form.json",
      formFilePath: fixturesPath,
      enforceCsrf: false,
    });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("GET returns 503", async () => {
    const response = await server.inject({
      method: "get",
      url: "/disabled-form/start",
    });

    expect(response.statusCode).to.equal(503);
  });

  test("POST returns 503", async () => {
    const response = await post(server, "/disabled-form/start");

    expect(response.statusCode).to.equal(503);
  });
});

suite("Form with active resolved from an unset env var placeholder", () => {
  let server;

  before(async () => {
    delete process.env.TEST_FORM_ACTIVE_FLAG;
    server = await createServer({
      formFileName: "active-env-form.json",
      formFilePath: fixturesPath,
      enforceCsrf: false,
    });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("GET defaults to enabled (fail-open) and returns 200", async () => {
    const response = await server.inject({
      method: "get",
      url: "/active-env-form/start",
    });

    expect(response.statusCode).to.equal(200);
  });
});

suite("Form with active resolved from a 'false' env var placeholder", () => {
  let server;

  before(async () => {
    process.env.TEST_FORM_ACTIVE_FLAG = "false";
    server = await createServer({
      formFileName: "active-env-form.json",
      formFilePath: fixturesPath,
      enforceCsrf: false,
    });
    await server.start();
  });

  after(async () => {
    delete process.env.TEST_FORM_ACTIVE_FLAG;
    await server.stop();
  });

  test("GET returns 503", async () => {
    const response = await server.inject({
      method: "get",
      url: "/active-env-form/start",
    });

    expect(response.statusCode).to.equal(503);
  });
});

suite("Form without an active field (regression guard)", () => {
  let server;

  before(async () => {
    server = await createServer({
      formFileName: "active-enabled-form.json",
      formFilePath: fixturesPath,
      enforceCsrf: false,
    });
    await server.start();
  });

  after(async () => {
    await server.stop();
  });

  test("GET returns 200", async () => {
    const response = await server.inject({
      method: "get",
      url: "/active-enabled-form/start",
    });

    expect(response.statusCode).to.equal(200);
  });
});

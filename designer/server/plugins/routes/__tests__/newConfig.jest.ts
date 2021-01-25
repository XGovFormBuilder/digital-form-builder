const { createServer } = require("../../../createServer");

test("POST /new encodes the form name", async () => {
  let server;
  server = await createServer();
  await server.initialize();
  await server.stop();

  const name = ">:тестировать<";
  const invalidCharacters = [...name];
  const res = await server.inject({
    method: "post",
    url: "/new",
    payload: { name },
  });
  const encoded = res.headers.location;
  expect(async () => {
    try {
      decodeURIComponent(encoded);
    } catch (e) {
      console.log(e);
    }
  }).not.toThrow();
  expect(encoded).toEqual(expect.not.arrayContaining(invalidCharacters));
  expect(res.statusCode).toBe(302);
});

import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import createServer from "src/server";

const {
  before,
  after,
  describe,
  suite,
  it,
  test,
} = (exports.lab = Lab.script());

let server;

const options = {
  callbackUrl:
    "https://b4bf0fcd-1dd3-4650-92fe-d1f83885a447.mock.pstmn.io/doesntexist",
  message: "Please fix this thing..",
  customText: {
    paymentSkipped: false,
    nextSteps: false,
  },
  components: [
    {
      name: "WLskhZ",
      options: {},
      type: "Html",
      content: "Thanks!",
      schema: {},
    },
  ],
};

const baseRequest = {
  options,
  name: "undefined lawyers-mod",
  questions: [
    {
      question: "Which list of lawyers do you want to be added to?",
      fields: [
        {
          key: "country",
          title: "Country list",
          type: "list",
          answer: "Italy",
        },
      ],
    },
    {
      fields: [
        {
          key: "size",
          title: "Company size",
          type: "list",
          answer: "Large firm (350+ legal professionals)",
        },
      ],
    },
    {
      question:
        "Which legal regulator or local bar associations are you registered with?",
      fields: [
        {
          key: "regulators",
          title: "Regulator(s)",
          type: "text",
          answer: "test",
        },
      ],
    },
    {
      question: "In what areas of law are you qualified to practise? ",
      fields: [
        {
          key: "areasOfLaw",
          title: "Areas of law practised",
          type: "list",
          answer: ["Bankruptcy", "Corporate", "Criminal"],
        },
      ],
    },
    {
      question: "Can you provide legal aid to British nationals?",
      fields: [
        {
          key: "legalAid",
          title: "Can you provide legal aid to British nationals?",
          type: "list",
          answer: true,
        },
      ],
    },
  ],
  metadata: { woo: "ah" },
};

before(async () => {
  server = await createServer({});
  await server.start();
});

after(async () => {
  await server.stop();
});

suite("InitialiseSession", () => {
  describe("POST /session/{id}", () => {
    test(" responds with token if file exists", async () => {
      const serverRequestOptions = {
        method: "POST",
        url: `/session/test`,
        payload: baseRequest,
      };

      const { payload } = await server.inject(serverRequestOptions);
      expect(payload).to.not.be.undefined();
    });

    it("responds with token if form doesnt exist", async () => {
      const serverRequestOptions = {
        method: "POST",
        url: `/session/four-o-four`,
        payload: baseRequest,
      };

      const { statusCode } = await server.inject(serverRequestOptions);
      expect(statusCode).to.equal(404);
    });
  });
  describe("GET /session/{token}", () => {
    test("redirects the user to the correct form", async () => {
      let serverRequestOptions = {
        method: "POST",
        url: `/session/test`,
        payload: { ...baseRequest, options: { ...options, redirectPath: "" } },
      };
      let postResponse;
      let getResponse;
      let token;

      postResponse = await server.inject(serverRequestOptions);
      token = JSON.parse(postResponse.payload).token;
      console.log(token);

      getResponse = await server.inject({
        url: `/session/${token}`,
      });

      expect(getResponse.statusCode).to.equal(302);
      expect(getResponse.headers.location).to.equal("/test");

      serverRequestOptions.payload.options.redirectPath = "summary";
      postResponse = await server.inject(serverRequestOptions);
      token = JSON.parse(postResponse.payload).token;

      getResponse = await server.inject({
        url: `/session/${token}`,
      });
      expect(getResponse.statusCode).to.equal(302);
      expect(getResponse.headers.location).to.equal("/test/summary");
    });
  });
});

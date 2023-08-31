import { WebhookService } from "../index";
import { createServer } from "../../createServer";
import { HapiServer } from "../../types";
import { prisma } from "../../prismaClient";
import type { Prisma } from "@xgovformbuilder/queueModel";

let server: HapiServer;

//instantiate the server to get access to the service instances
beforeAll(async () => {
  server = await createServer();
  await server.start();
});

//remove any added submissions after each test has run
afterEach(async () => {
  await prisma.submission.deleteMany({});
  await prisma.$queryRawUnsafe(`TRUNCATE TABLE Submission;`);
});

//stop the server instance
afterAll(async () => {
  await server.stop();
});

async function seedDb(submissions: Prisma.SubmissionCreateManyInput[]) {
  await prisma.$connect();
  try {
    await prisma.submission.createMany({
      data: submissions,
    });
  } catch (err) {
    console.log(err);
    return;
  }
  return true;
}

test("Queue service does not process any submissions if the table is empty", async () => {
  const seedRes = await seedDb([]);
  if (!seedRes) {
    throw new Error("Test failed: could not seed the db");
  }
  const postReqFunction = jest.spyOn(WebhookService.prototype, "postRequest");
  const { queueService } = server.services([]);
  await queueService.processSubmissions();
  expect(postReqFunction).not.toBeCalled();
});
test("Queue service does not process any submissions if all submissions are complete or have errored", async () => {
  const seedRes = await seedDb([
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-failing-url.com",
      complete: true,
      retry_counter: 0,
    },
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: null,
      complete: false,
      retry_counter: 0,
    },
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-failing-url.com",
      complete: false,
      error: "Some error",
      retry_counter: 5,
    },
  ]);
  if (!seedRes) {
    throw new Error("Test failed: could not seed the db");
  }
  const postReqFunction = jest.spyOn(WebhookService.prototype, "postRequest");
  const { queueService } = server.services([]);
  await queueService.processSubmissions();
  expect(postReqFunction).not.toBeCalled();
});
test("Queue service updates a submission entry with an error if the webhook fails", async () => {
  const seedRes = await seedDb([
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-failing-url.com",
      complete: false,
      retry_counter: 0,
    },
  ]);
  if (!seedRes) {
    throw new Error("Test failed: could not seed the db");
  }
  jest.spyOn(WebhookService.prototype, "postRequest").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve({
        message: "Bad error",
      });
    });
  });

  const { queueService } = server.services([]);
  await queueService.processSubmissions();

  const submission = await prisma.submission.findUnique({
    where: {
      id: 1,
    },
  });

  if (!submission) {
    throw new Error("Test failed: no submission found");
  }
  expect(submission.error).not.toBe(null);
});
test("Queue service updates a submission entry with a successful response if the webhook was successful", async () => {
  const seedRes = await seedDb([
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-passing-url.com",
      complete: false,
      retry_counter: 0,
    },
  ]);
  if (!seedRes) {
    throw new Error("Test failed: could not seed the db");
  }
  jest.spyOn(WebhookService.prototype, "postRequest").mockImplementation(() => {
    return new Promise((resolve) => {
      resolve("REF1234");
    });
  });

  const { queueService } = server.services([]);

  await queueService.processSubmissions();

  const submission = await prisma.submission.findUnique({
    where: {
      id: 1,
    },
  });

  if (!submission) {
    throw new Error("Test failed: no submission found");
  }

  expect(submission.return_reference).toBe("REF1234");
});
test("Queue service runs through all valid submissions without throwing an error", async () => {
  const seedRes = await seedDb([
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-url.com",
      complete: true,
      retry_counter: 0,
    },
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-url.com",
      complete: false,
      retry_counter: 0,
    },
    {
      time: 1234567,
      data: `{"some": "data"}`,
      webhook_url: "https://a-url.com",
      complete: false,
      retry_counter: 0,
    },
  ]);

  if (!seedRes) {
    throw new Error("Test failed: could not seed db");
  }

  jest.spyOn(WebhookService.prototype, "postRequest").mockImplementation(() => {
    return new Promise((resolve) => {
      const passFailArray = [
        "REF1234",
        {
          message: "Bad request",
        },
      ];
      resolve(passFailArray[Math.round(Math.random() * 2) - 1]);
    });
  });

  const { queueService } = server.services([]);

  expect(async () => {
    await queueService.processSubmissions();
  }).not.toThrow();
});

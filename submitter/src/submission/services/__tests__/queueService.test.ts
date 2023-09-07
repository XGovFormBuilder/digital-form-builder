import { QueueService } from "../index";
import { HapiServer } from "../../types";
import { prisma } from "../../../__mocks__/prismaClient";
import logger from "pino";
jest.mock("../../../prismaClient");

function createServer(webhookSuccess: boolean) {
  const mockPostRequest = jest.fn().mockImplementation(
    async (_url: string, _data: object, _method?: "POST" | "PUT") =>
      new Promise((resolve) => {
        resolve(webhookSuccess ? "REF1234" : { message: "bad error" });
      })
  );
  const webhookService = {
    postRequest: mockPostRequest,
  };
  const serverLogger = logger();
  return ({
    logger: serverLogger,
    services: (_options: any[]) => ({
      webhookService,
    }),
  } as unknown) as HapiServer;
}

test("Queue service does not process any submissions if the table is empty", async () => {
  const server = createServer(true);
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([]);
  const postReq = server.services([]).webhookService.postRequest;
  const queueService = new QueueService(server);
  await queueService.processSubmissions();
  expect(postReq).not.toBeCalled();
});
test("Queue service does not process any submissions if all submissions are complete or have errored", async () => {
  const server = createServer(true);
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      webhook_url: "https://some-url.com",
      complete: true,
      retry_count: 0,
    },
    {
      id: 2,
      created_at: new Date(),
      updated_at: new Date(),
      webhook_url: null,
      complete: false,
      retry_count: 0,
    },
    {
      id: 3,
      created_at: new Date(),
      updated_at: new Date(),
      complete: false,
      webhook_url: "https://some-url.com",
      error: "Some error",
      retry_count: 5,
    },
  ]);
  const postReq = server.services([]).webhookService.postRequest;
  const queueService = new QueueService(server);
  await queueService.processSubmissions();
  expect(postReq).not.toBeCalled();
});
test("Queue service updates a submission entry with an error if the webhook fails", async () => {
  const updateFunc = jest.spyOn(QueueService.prototype, "updateWithError");

  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      webhook_url: "https://some-url.com",
      data: `{"some": "data"}`,
      complete: false,
      retry_count: 0,
    },
  ]);

  const server = createServer(false);

  const queueService = new QueueService(server);
  await queueService.processSubmissions();

  expect(updateFunc).toBeCalled();
});
test("Queue service updates a submission entry with a successful response if the webhook was successful", async () => {
  const updateFunc = jest.spyOn(QueueService.prototype, "updateWithSuccess");
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      webhook_url: "https://some-url.com",
      data: `{"some": "data"}`,
      complete: false,
      retry_count: 0,
    },
  ]);

  const server = createServer(true);
  const queueService = new QueueService(server);

  await queueService.processSubmissions();

  expect(updateFunc).toBeCalled();
});

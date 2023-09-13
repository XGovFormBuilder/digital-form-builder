import { QueueService } from "../index";
import { prisma } from "../../../__mocks__/prismaClient";
jest.mock("../../../prismaClient");

const webhookService = {
  postRequest: jest.fn(),
};

const server = {
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  services: () => ({
    webhookService,
  }),
};

test("Queue service does not process any submissions if the table is empty", async () => {
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([]);

  const queueService = new QueueService(server);
  await queueService.processSubmissions();
  expect(webhookService.postRequest).not.toBeCalled();
});

test("Queue service does not process any submissions if all submissions are complete or have errored", async () => {
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

  const queueService = new QueueService(server);
  const updateFunc = jest.spyOn(queueService, "updateWithError");

  await queueService.processSubmissions();
  expect(updateFunc).toBeCalled();
});
test("Queue service updates a submission entry with a successful response if the webhook was successful", async () => {
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
  const queueService = new QueueService(server);
  webhookService.postRequest.mockResolvedValueOnce({
    output: {},
  });

  const updateFunc = jest.spyOn(queueService, "updateWithSuccess");
  await queueService.processSubmissions();

  expect(updateFunc).toBeCalled();
});

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

const queueService = new QueueService(server);

test("Queue service does not process any submissions if none found", async () => {
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([]);

  await queueService.processSubmissions();
  expect(webhookService.postRequest).not.toBeCalled();
});

test("Queue service updates a submission entry with an error if the webhook fails", async () => {
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      webhook_url: "https://some-url.com",
      data: `{"some": "data"}`,
      complete: false,
      retry_count: 0,
    },
  ]);
  webhookService.postRequest.mockResolvedValueOnce({
    payload: {
      error: {
        statusCode: 400,
        message: ":(",
      },
    },
  });
  const updateWithError = jest.spyOn(queueService, "updateWithError");

  await queueService.processSubmissions();
  expect(updateWithError).toBeCalled();
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

  webhookService.postRequest.mockResolvedValueOnce({
    payload: {
      reference: "REF-0042",
    },
  });

  const updateFunc = jest.spyOn(queueService, "updateWithSuccess");
  await queueService.processSubmissions();

  expect(updateFunc).toBeCalled();
});

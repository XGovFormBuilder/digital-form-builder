import { redactSubmissions } from "../redactSubmissions";
import { prisma } from "../../../__mocks__/prismaClient";
jest.mock("../../../prismaClient");

const today = new Date();

test("Deletes submissions that fall within retention period", async () => {
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([
    {
      id: 1,
      created_at: today,
      updated_at: today,
      data: `{"some": "data"}`,
      complete: true,
      retry_counter: 0,
    },
  ]);
  await redactSubmissions();
  expect(prisma.submission.deleteMany).toBeCalled();
});
test("Does not delete any submissions if none fall within retention period", async () => {
  (prisma.submission.findMany as jest.Mock).mockResolvedValueOnce([]);
  await redactSubmissions();
  expect(prisma.submission.deleteMany).not.toBeCalled();
});

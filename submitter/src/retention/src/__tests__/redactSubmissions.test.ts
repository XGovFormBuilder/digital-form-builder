import { Prisma } from "@xgovformbuilder/queueModel";
import { redactSubmissions } from "../index";
import { prisma } from "../../__mocks__/prismaClient";
jest.mock("../../prismaClient");

const today = new Date();
let inTenDays = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 10
);
let aYearTodayPlusOne = new Date(
  today.getFullYear() + 1,
  today.getMonth(),
  today.getDate() + 1
);
let aMonthAgo = new Date(
  today.getFullYear(),
  today.getMonth() - 1,
  today.getDate()
);
let aYearAgo = new Date(
  today.getFullYear() - 1,
  today.getMonth(),
  today.getDate()
);

test.each([
  [
    "Doesn't delete any submissions if there are no complete submissions",
    [
      {
        id: 1,
        created_at: today,
        updated_at: today,
        data: `{"some": "data"}`,
        complete: false,
        retry_counter: 0,
      },
      {
        id: 2,
        created_at: aYearAgo,
        updated_at: aYearAgo,
        data: `{"some": "data"}`,
        complete: false,
        retry_counter: 0,
      },
      {
        id: 3,
        created_at: inTenDays,
        updated_at: inTenDays,
        data: `{"some": "data"}`,
        complete: false,
        retry_counter: 0,
      },
    ],
    "0",
    [],
  ],
  [
    "Automatically deletes any submissions that are complete if the retention period is 0",
    [
      {
        id: 1,
        created_at: today,
        updated_at: today,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        id: 2,
        created_at: aYearAgo,
        updated_at: aYearAgo,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        id: 3,
        created_at: inTenDays,
        updated_at: inTenDays,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
    ],
    "0",
    [1, 2, 3],
  ],
  [
    "Doesn't delete any submissions if all submission fall within retention period",
    [
      {
        created_at: today,
        updated_at: today,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: aMonthAgo,
        updated_at: aMonthAgo,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: inTenDays,
        updated_at: inTenDays,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
    ],
    "365",
    [],
  ],
  [
    "Only deletes submissions that fall outside of retention period if the retention period is greater than 0",
    [
      {
        id: 1,
        created_at: today,
        updated_at: today,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        id: 2,
        created_at: aYearTodayPlusOne,
        updated_at: aYearTodayPlusOne,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        id: 3,
        created_at: inTenDays,
        updated_at: inTenDays,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
    ],
    "365",
    [2],
  ],
])(
  "%s",
  async (
    _name,
    subs: Prisma.SubmissionCreateManyInput[],
    retentionPeriod,
    deleted: number[]
  ) => {
    process.env.QUEUE_RETENTION_PERIOD_DAYS = retentionPeriod;
    prisma.submission.findMany.mockResolvedValueOnce(subs);
    await redactSubmissions();
    if (deleted.length > 0) {
      expect(prisma.submission.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: deleted,
          },
        },
      });
    }
  }
);

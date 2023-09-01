import { Prisma } from "@xgovformbuilder/queueModel";
import { prisma } from "../prismaClient";
import { redactSubmissions } from "../index";

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

const todayTimestamp = new Date().getTime();

console.log(todayTimestamp);

test.each([
  [
    "Doesn't delete any submissions if there are no complete submissions",
    [
      {
        created_at: todayTimestamp,
        updated_at: todayTimestamp,
        data: `{"some": "data"}`,
        complete: false,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp - 365 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp - 365 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: false,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: false,
        retry_counter: 0,
      },
    ],
    "0",
    [],
    [1, 2, 3],
  ],
  [
    "Automatically deletes any submissions that are complete if the retention period is 0",
    [
      {
        created_at: todayTimestamp,
        updated_at: todayTimestamp,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp - 365 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp - 365 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
    ],
    "0",
    [1, 2, 3],
    [],
  ],
  [
    "Doesn't delete any submissions if there all submission fall within retention period",
    [
      {
        created_at: todayTimestamp,
        updated_at: todayTimestamp,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp - 35 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp - 35 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
    ],
    "365",
    [],
    [1, 2, 3],
  ],
  [
    "Only deletes submissions that fall outside of retention period if the retention period is greater than 0",
    [
      {
        created_at: todayTimestamp,
        updated_at: todayTimestamp,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp - 366 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp - 366 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
      {
        created_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        updated_at: todayTimestamp + 10 * 24 * 60 * 60 * 1000,
        data: `{"some": "data"}`,
        complete: true,
        retry_counter: 0,
      },
    ],
    "365",
    [2],
    [1, 3],
  ],
])(
  "%s",
  async (
    _name,
    subs: Prisma.SubmissionCreateManyInput[],
    retentionPeriod,
    deletedSubs: number[],
    remainingSubs: number[]
  ) => {
    process.env.QUEUE_RETENTION_PERIOD_DAYS = retentionPeriod;
    const seedRes = await seedDb(subs);
    if (!seedRes) {
      throw new Error("Test failed: database could not be seeded");
    }
    await redactSubmissions();
    const deleted = await prisma.submission.findMany({
      where: {
        id: {
          in: deletedSubs,
        },
      },
    });
    console.log("deleted subs: ", deleted);
    expect(deleted.length).toBe(0);

    const remaining = await prisma.submission.findMany({
      where: {
        id: {
          in: remainingSubs,
        },
      },
    });
    expect(remaining.length).toEqual(remainingSubs.length);
  }
);

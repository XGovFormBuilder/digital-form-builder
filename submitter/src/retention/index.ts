import config from "../config";
import { prisma } from "../prismaClient";

export async function redactSubmissions() {
  const retentionAsTimestamp =
    parseInt(config.retentionPeriod) * 24 * 60 * 60 * 1000;
  const retentionLimit = new Date().getTime() - retentionAsTimestamp;
  const validSubs = await prisma.submission.findMany({
    where: {
      updated_at: {
        lt: retentionLimit,
      },
      complete: true,
    },
    select: {
      id: true,
    },
  });
  if (validSubs.length > 0) {
    prisma.submission.deleteMany({
      where: {
        id: {
          in: validSubs.map((sub) => sub.id),
        },
      },
    });
  }
}

(async () => {
  await redactSubmissions();
})();

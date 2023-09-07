import config from "../../config";
import { prisma } from "../../prismaClient";

export async function redactSubmissions() {
  const today = new Date();
  const retentionLimit = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - parseInt(config.retentionPeriod)
  );
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

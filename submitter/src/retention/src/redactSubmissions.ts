import config from "../../config";
import { prisma } from "../../prismaClient";

export async function redactSubmissions() {
  const today = new Date();
  const retentionLimit = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - parseInt(config.retentionPeriod)
  );
  try {
    await prisma.submission.deleteMany({
      where: {
        updated_at: {
          lt: retentionLimit,
        },
        complete: true,
      },
    });
  } catch (e) {}
}

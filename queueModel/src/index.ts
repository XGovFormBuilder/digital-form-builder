import * as path from "path";

export { PrismaClient, Prisma } from "@prisma/client";
export const SCHEMA_LOCATION = path.resolve(__dirname, "schema.prisma");

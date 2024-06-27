import { customAlphabet } from "nanoid";
import config from "server/config";

export const payReferenceLength = parseInt(config.payReferenceLength ?? 10);
export const nanoid = customAlphabet(
  "1234567890ABCDEFGHIJKLMNPQRSTUVWXYZ-_",
  payReferenceLength
);

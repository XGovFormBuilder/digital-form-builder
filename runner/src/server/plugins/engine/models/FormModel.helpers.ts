import { add } from "date-fns";
import config from "config";
import * as crypto from "crypto";

export function dateForComparison(timePeriod, timeUnit) {
  return add(new Date(), { [timeUnit]: timePeriod }).toISOString();
}

export function timeForComparison(timePeriod, timeUnit) {
  const offsetTime = add(Number(timePeriod), timeUnit);
  return `${offsetTime.getHours()}:${offsetTime.getMinutes()}`;
}

export function getSignature(data: string) {
  return crypto
    .createHmac("sha512", config.get("apiConditionSecret"))
    .update(data)
    .digest("hex");
}

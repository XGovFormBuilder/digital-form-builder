import crypto from "crypto";
import { logger } from "./logger";

// Configuration constants
const TIME_THRESHOLD = 1200; // 20 minutes in seconds
export const MAGIC_LINK_EXPIRY_SECONDS = 20 * 60;

export type HmacValidation = {
  isValid: boolean;
  reason: "valid" | "expired" | "invalid_signature" | "error";
};

function lastSunday(month: number, year?: number): Date {
  const d = new Date();
  const lastDayOfMonth = new Date(Date.UTC(year || d.getFullYear(), month, 0));
  const day = lastDayOfMonth.getDay();
  return new Date(
    Date.UTC(
      lastDayOfMonth.getFullYear(),
      lastDayOfMonth.getMonth(),
      lastDayOfMonth.getDate() - day
    )
  );
}

function isBST(date?: Date): boolean {
  const d = date || new Date();
  const starts = lastSunday(3, d.getFullYear());
  starts.setHours(1);
  const ends = lastSunday(10, d.getFullYear());
  ends.setHours(1);
  return d.getTime() >= starts.getTime() && d.getTime() < ends.getTime();
}

function applyBSTIfRequired(timestamp: number): number {
  const date = new Date(timestamp * 1000);

  if (isBST(date)) {
    // During BST, add 1 hour (3600 seconds)
    return timestamp + 3600;
  } else {
    // During GMT, no adjustment needed
    return timestamp;
  }
}

/**
 * Formats a Unix timestamp to a human-readable time string
 */
function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

  return `${hours}.${minutes < 10 ? "0" : ""}${minutes}${ampm}`;
}

/**
 * Creates an HMAC signature for authentication
 */
export async function createHmac(
  email: string,
  hmacKey: string
): Promise<[string, number, string]> {
  try {
    // Get current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Prepare the data for HMAC calculation
    const dataToHash = email + currentTimestamp;

    // Calculate the HMAC hash
    const hmac = crypto
      .createHmac("sha256", hmacKey)
      .update(dataToHash)
      .digest("hex");

    const expiryTimestamp = currentTimestamp + MAGIC_LINK_EXPIRY_SECONDS;
    const adjustedExpiryForDisplay = applyBSTIfRequired(expiryTimestamp);

    const hmacExpiryTime = formatUnixTimestamp(adjustedExpiryForDisplay);

    return [hmac, currentTimestamp, hmacExpiryTime];
  } catch (error) {
    logger.error(error, "Error creating HMAC");
    throw error;
  }
}

/**
 * Similar to the above but returns raw epoch timestamps,
 * making it preferable for cryptographic logic.
 * The other function may benefit from refactoring
 * to separate display logic from core logic. */
export async function createHmacRaw(
  message: string,
  hmacKey: string
): Promise<[string, number, number]> {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const dataToHash = message + currentTimestamp;
    const hmac = crypto
      .createHmac("sha256", hmacKey)
      .update(dataToHash)
      .digest("hex");

    const expiryTimestamp = currentTimestamp + TIME_THRESHOLD;

    return [hmac, currentTimestamp, expiryTimestamp];
  } catch (error) {
    logger.error(error, "Error creating HMAC (raw)");
    throw error;
  }
}

/**
 * Validates an HMAC signature
 */
export async function validateHmac(
  email: string,
  signature: string,
  requestTime: string,
  hmacKey: string | undefined
): Promise<HmacValidation> {
  try {
    // Get the current UTC time
    const currentUtcUnixTimestamp = Math.floor(Date.now() / 1000);

    if (
      currentUtcUnixTimestamp >
      parseInt(requestTime) + MAGIC_LINK_EXPIRY_SECONDS
    ) {
      return { isValid: false, reason: "expired" };
    }

    if (!hmacKey) {
      throw new Error("No HMAC key configured");
    }

    // Prepare the data for HMAC calculation
    const dataToHash = email + requestTime;

    // Calculate the HMAC hash
    const xResponseHmac = crypto
      .createHmac("sha256", hmacKey)
      .update(dataToHash)
      .digest("hex");

    // Verify the HMAC
    if (signature === xResponseHmac) {
      return { isValid: true, reason: "valid" };
    } else {
      return { isValid: false, reason: "invalid_signature" };
    }
  } catch (error) {
    logger.error(error, "Error validating HMAC");
    return { isValid: false, reason: "error" };
  }
}

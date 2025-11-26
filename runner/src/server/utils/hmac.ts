import crypto from "crypto";

// Configuration constants
const TIME_THRESHOLD = 1200; // 5 minutes in seconds

function lastSunday(month, year) {
  var d = new Date();
  var lastDayOfMonth = new Date(Date.UTC(year || d.getFullYear(), month, 0));
  var day = lastDayOfMonth.getDay();
  return new Date(
    Date.UTC(
      lastDayOfMonth.getFullYear(),
      lastDayOfMonth.getMonth(),
      lastDayOfMonth.getDate() - day
    )
  );
}

function isBST(date) {
  var d = date || new Date();
  var starts = lastSunday(3, d.getFullYear());
  starts.setHours(1);
  var ends = lastSunday(10, d.getFullYear());
  ends.setHours(1);
  return d.getTime() >= starts.getTime() && d.getTime() < ends.getTime();
}

function applyBSTIfRequired(timestamp) {
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
export async function createHmac(email: string, hmacKey: string) {
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

    const expiryTimestamp = currentTimestamp + TIME_THRESHOLD;
    const adjustedExpiryForDisplay = applyBSTIfRequired(expiryTimestamp);

    const hmacExpiryTime = formatUnixTimestamp(adjustedExpiryForDisplay);

    return [hmac, currentTimestamp, hmacExpiryTime];
  } catch (error) {
    console.error("Error creating HMAC:", error);
    throw error;
  }
}

/**
 * Similar to the above but returns raw epoch timestamps,
 * making it preferable for cryptographic logic.
 * The other function may benefit from refactoring
 * to separate display logic from core logic. */
export async function createHmacRaw(message: string, hmacKey: string) {
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
    console.error("Error creating HMAC (raw):", error);
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
  hmacKey: string
) {
  try {
    // Get the current UTC time
    const currentUtcUnixTimestamp = Math.floor(Date.now() / 1000);

    if (currentUtcUnixTimestamp > parseInt(requestTime) + TIME_THRESHOLD) {
      return { isValid: false, reason: "expired" };
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
    console.error("Error validating HMAC:", error);
    return { isValid: false, reason: "error" };
  }
}

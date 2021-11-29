const generateCookiePassword = (): String =>
  Array(32)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join("");

export default generateCookiePassword;

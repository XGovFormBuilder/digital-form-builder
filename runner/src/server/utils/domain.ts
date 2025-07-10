export function isAllowedDomain(
  email: string,
  allowedDomains: string[]
): boolean {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }

  const trimmedEmail = email.trim();
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!basicEmailRegex.test(trimmedEmail)) {
    return false;
  }

  const domain = trimmedEmail.split("@")[1].toLowerCase();
  return allowedDomains.some((allowed) => {
    const allowedLower = allowed.toLowerCase();
    return domain === allowedLower || domain.endsWith("." + allowedLower);
  });
}

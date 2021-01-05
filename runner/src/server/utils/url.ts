export function isUrlSecure(matomoUrl: string) {
  try {
    const { protocol } = new URL(matomoUrl);

    if (protocol === "https:") {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

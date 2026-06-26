import { FormConfiguration } from "./plugins/engine/services/configurationService";

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidSecureFormSubmissionConfig = (
  config: FormConfiguration["configuration"]["secureFormSubmissionConfig"]
): boolean => {
  if (!config) {
    return false;
  }

  return (
    GUID.test(config.tenantId) &&
    GUID.test(config.clientId) &&
    config.clientSecret.length > 0 &&
    config.scopes.length > 0 &&
    config.scopes.every((s) => s.length > 0)
  );
};

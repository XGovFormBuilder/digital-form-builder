import { FormDefinition } from "@xgovformbuilder/model";
import { logger } from "../../../utils/logger";

const PLACEHOLDER_PATTERN = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/;

/**
 * Resolves a `"${VAR_NAME}"` placeholder in a form's `active` field from `process.env`.
 * Unlike `resolveDevPlaceholders`, this runs in every environment so that production
 * deployments can disable a form's traffic via an environment variable.
 *
 * A missing environment variable fails open (form stays active) rather than silently
 * taking down production traffic from a misconfigured deployment.
 */
export function resolveFormActive(def: FormDefinition): FormDefinition {
  if (typeof def.active !== "string") {
    return def;
  }

  const match = PLACEHOLDER_PATTERN.exec(def.active);

  if (!match) {
    return def;
  }

  const [, varName] = match;
  const value = process.env[varName];

  if (value === undefined) {
    logger.warn(
      `[resolveFormActive] Environment variable '${varName}' not found. Form will default to active.`
    );
    return { ...def, active: true };
  }

  return { ...def, active: value };
}

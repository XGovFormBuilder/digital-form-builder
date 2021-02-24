import { migrate as V0_TO_V2 } from "./migration.0-2";
import { migrate as V1_TO_V2 } from "./migration.1-2";

/**
 * Returns which migrations that should be run against your JSON with the given version
 * @param version
 */
export function whichMigrations(version) {
  let migrations = new Set();
  switch (version) {
    case 0:
      migrations.add(V0_TO_V2);
      /**
       * we are skipping v1 entirely. If we weren't you would also do migrations.add([V1_TO_V2, V2_TO_V3]) for example.
       */
      break;
    case 1:
      migrations.add(V1_TO_V2);
      break;
  }
  return migrations;
}

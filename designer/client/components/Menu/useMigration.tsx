import { whichMigrations } from "@xgovformbuilder/model";

export function useMigration(formJson) {
  const version = formJson.version ?? 0;
  const migrationList = whichMigrations(version);
  try {
    let migratedJson = { ...formJson };
    migrationList.forEach((migration) => {
      migratedJson = migration(migratedJson);
    });
    return migratedJson;
  } catch (e) {
    console.error("failed to migrate json");
  }
}

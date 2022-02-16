import { initialiseSession } from "server/plugins/initialiseSession/initialiseSession";

export function configureInitialiseSessionPlugin(options: {
  whitelist: string[];
}) {
  return {
    plugin: initialiseSession,
    options,
  };
}

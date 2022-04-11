import { initialiseSession } from "server/plugins/initialiseSession/initialiseSession";

export function configureInitialiseSessionPlugin(options: {
  safelist: string[];
}) {
  return {
    plugin: initialiseSession,
    options,
  };
}

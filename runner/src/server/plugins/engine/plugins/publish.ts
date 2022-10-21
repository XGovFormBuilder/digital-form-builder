import { Plugin } from "hapi";

import { published, publish, disabled } from "./routes";
import config from "server/config";

export const plugin: Plugin<{}> = {
  name: "@xgovformbuilder/runner/engine/publish",
  dependencies: "@hapi/vision",
  multiple: false,
  register: (server) => {
    const isPreviewMode = config.previewMode;

    const enabledString = isPreviewMode ? `[ENABLED]` : `[DISABLED]`;

    /**
     * The following publish endpoints (/publish, /published/{id}, /published)
     * are used from the designer for operating in 'preview' mode.
     * I.E. Designs saved in the designer can be accessed in the runner for viewing.
     * The designer also uses these endpoints as a persistence mechanism for storing and retrieving data
     * for its own purposes so if you're changing these endpoints you likely need to go and amend
     * the designer too!
     */
    server.route({
      method: "post",
      path: "/publish",
      handler: isPreviewMode ? publish.post : disabled,
      options: {
        payload: {
          parse: true,
        },
        description: `${enabledString} Allows a form to be persisted (published) on the runner server. Requires previewMode to be set to true. See runner/README.md for details on environment variables`,
      },
    });

    server.route({
      method: "get",
      path: "/published/{id}",
      handler: isPreviewMode ? published.id.get : disabled,
      options: {
        description: `${enabledString} Gets a published form, by form id. Requires previewMode to be set to true. See runner/README.md for details on environment variables`,
      },
    });

    server.route({
      method: "get",
      path: "/published",
      handler: isPreviewMode ? published.get : disabled,
      options: {
        description: `${enabledString} Gets all published forms. Requires previewMode to be set to true. See runner/README.md for details on environment variables`,
      },
    });
  },
};

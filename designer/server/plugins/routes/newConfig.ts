import config from "../../config";
import newFormJson from "../../../new-form.json";
import { publish } from "../../lib/publish";
import { ServerRoute } from "@hapi/hapi";
import { FormConfiguration } from "@xgovformbuilder/model";

export const get: ServerRoute = {
  method: "get",
  path: "/new",
  options: {
    handler: async (request, h) => {
      const { persistenceService } = request.services([]);
      let configurations: FormConfiguration[] = [];
      try {
        configurations = await persistenceService.listAllConfigurations();
        return h.view("designer", {
          newConfig: true,
          configurations,
          phase: config.phase,
        });
      } catch (e) {
        configurations = [];
        return h.view("designer", {
          newConfig: true,
          configurations,
          error: e,
          phase: config.phase,
        });
      }
    },
  },
};

export const post: ServerRoute = {
  method: "post",
  path: "/new",
  options: {
    handler: async (request, h) => {
      const { persistenceService } = request.services([]);
      const { selected, name } = request.payload;
      const newName = encodeURIComponent(name);

      try {
        if (selected.Key === "New") {
          if (config.persistentBackend !== "preview") {
            await persistenceService.uploadConfiguration(
              `${newName}.json`,
              JSON.stringify(newFormJson)
            );
          }
          await publish(newName, newFormJson);
        } else {
          await persistenceService.copyConfiguration(
            `${selected.Key}`,
            newName
          );
          const copied = await persistenceService.getConfiguration(newName);
          await publish(newName, copied);
        }
      } catch (e) {
        console.error(e);
      }

      return h.redirect(`/${newName}`);
    },
  },
};

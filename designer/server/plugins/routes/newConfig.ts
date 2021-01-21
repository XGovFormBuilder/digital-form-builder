import config from "../../config";
import { nanoid } from "nanoid";
import newFormJson from "../../../new-form.json";
import Wreck from "@hapi/wreck";

const publish = async function (id, configuration) {
  try {
    const result = Wreck.post(`${config.publishUrl}/publish`, {
      payload: JSON.stringify({ id, configuration }),
    });
    return result;
  } catch (error) {
    throw new Error(
      `Error when publishing to endpoint ${config.publishUrl}/publish: message: ${error.message}`
    );
  }
};

export const get = {
  method: "get",
  path: "/new",
  options: {
    handler: async (request, h) => {
      const { persistenceService } = request.services([]);
      let configurations = [];
      let error;
      try {
        configurations = await persistenceService.listAllConfigurations();
        return h.view("designer", {
          newConfig: true,
          configurations,
          phase: config.phase,
        });
      } catch (e) {
        error = e;
        configurations = [];
        return h.view("designer", {
          newConfig: true,
          configurations,
          error,
          phase: config.phase,
        });
      }
    },
  },
};

export const post = {
  method: "post",
  path: "/new",
  options: {
    handler: async (request, h) => {
      const { persistenceService } = request.services([]);
      const { selected, name } = request.payload;
      const newName = name === "" ? nanoid(10) : name;
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
        console.log(e);
      }

      return h.redirect(`/${newName}`);
    },
  },
};

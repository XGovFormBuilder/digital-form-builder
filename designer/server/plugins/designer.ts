import { Schema } from "@xgovformbuilder/model";
import { nanoid } from "nanoid";
import Wreck from "@hapi/wreck";
import pkg from "../../package.json";
import config from "../config";
import newFormJson from "../../new-form.json";
import { FormConfiguration } from "../lib/persistence/types";

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

const getPublished = async function (id) {
  const { payload } = await Wreck.get<FormConfiguration>(
    `${config.publishUrl}/published/${id}`
  );
  return payload.toString();
};

export const designerPlugin = {
  plugin: {
    name: pkg.name,
    version: pkg.version,
    multiple: true,
    dependencies: "vision",
    register: async (server) => {
      server.route({
        method: "get",
        path: "/",
        options: {
          handler: async (_request, h) => {
            return h.redirect("/new");
          },
        },
      });

      server.route({
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
      });

      server.route({
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
                const copied = await persistenceService.getConfiguration(
                  newName
                );
                await publish(newName, copied);
              }
            } catch (e) {
              console.log(e);
            }

            return h.redirect(`/${newName}`);
          },
        },
      });

      // DESIGNER
      server.route({
        method: "get",
        path: "/{id}",
        options: {
          handler: (request, h) => {
            const { id } = request.params;
            return h.view("designer", {
              id,
              previewUrl: config.previewUrl,
              phase: config.phase,
            });
          },
        },
      });

      // GET DATA
      server.route({
        method: "GET",
        path: "/{id}/api/data",
        options: {
          handler: async (request, h) => {
            const { id } = request.params;
            let formJson = newFormJson;

            try {
              const response = await getPublished(id);
              const { values } = JSON.parse(response);

              if (values) {
                formJson = values;
              }
            } catch (error) {
              console.error(error);
            }

            return h.response(formJson).type("application/json");
          },
        },
      });

      server.route({
        method: "GET",
        path: "/configurations",
        options: {
          handler: async (request, h) => {
            const { persistenceService } = request.services([]);
            try {
              const response = await persistenceService.listAllConfigurations();
              return h.response(response).type("application/json");
            } catch (error) {
              request.server.log(["error", "/configurations"], error);
            }
          },
        },
      });

      // SAVE DATA
      server.route({
        method: "PUT",
        path: "/{id}/api/data",
        options: {
          handler: async (request, h) => {
            const { id } = request.params;
            const { persistenceService } = request.services([]);

            try {
              const { value, error } = Schema.validate(request.payload, {
                abortEarly: false,
              });

              if (error) {
                throw new Error("Schema validation failed");
              }
              await persistenceService.uploadConfiguration(
                `${id}`,
                JSON.stringify(value)
              );
              await publish(id, value);
              return h.response({ ok: true }).code(204);
            } catch (err) {
              console.error("Designer Server PUT /{id}/api/data error:", err);
              return h.response({ ok: false, err }).code(401);
            }
          },
        },
      });
    },
  },
};

import newFormJson from "../../../new-form.json";
import { FormConfiguration, Schema } from "@xgovformbuilder/model";
import Wreck from "@hapi/wreck";
import config from "../../config";
import { publish } from "../../lib/publish";
import { ServerRoute, ResponseObject } from "@hapi/hapi";

const getPublished = async function (id) {
  const { payload } = await Wreck.get<FormConfiguration>(
    `${config.publishUrl}/published/${id}`
  );
  return payload.toString();
};

export const getFormWithId: ServerRoute = {
  // GET DATA
  method: "GET",
  path: "/api/{id}/data",
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
        request.logger.error(["GET /api/{id}/data", "getFormWithId"], error);
      }

      return h.response(formJson).type("application/json");
    },
  },
};

export const putFormWithId: ServerRoute = {
  // SAVE DATA
  method: "PUT",
  path: "/api/{id}/data",
  options: {
    payload: {
      parse: true,
    },
    handler: async (request, h) => {
      const { id } = request.params;
      const { persistenceService } = request.services([]);

      try {
        const { value, error } = Schema.validate(request.payload, {
          abortEarly: false,
        });

        if (error) {
          request.logger.error(
            ["error", `/api/${id}/data`],
            [error, request.payload]
          );

          throw new Error("Schema validation failed, reason: " + error.message);
        }
        await persistenceService.uploadConfiguration(
          `${id}`,
          JSON.stringify(value)
        );
        await publish(id, value);
        return h.response({ ok: true }).code(204);
      } catch (err) {
        request.logger.error("Designer Server PUT /api/{id}/data error:", err);
        const errorSummary = {
          id: id,
          payload: request.payload,
          errorMessage: err.message,
          error: err.stack,
        };
        request.yar.set(`error-summary-${id}`, errorSummary);
        return h.response({ ok: false, err }).code(401);
      }
    },
  },
};

export const getAllPersistedConfigurations: ServerRoute = {
  method: "GET",
  path: "/api/configurations",
  options: {
    handler: async (request, h): Promise<ResponseObject | undefined> => {
      const { persistenceService } = request.services([]);
      try {
        const response = await persistenceService.listAllConfigurations();
        return h.response(response).type("application/json");
      } catch (error) {
        request.server.log(["error", "/configurations"], error);
        return;
      }
    },
  },
};

export const log: ServerRoute = {
  method: "POST",
  path: "/api/log",
  options: {
    handler: async (request, h): Promise<ResponseObject | undefined> => {
      try {
        request.server.log(request.payload.toString());
        return h.response({ ok: true }).code(204);
      } catch (error) {
        request.server.error(request.payload.toString());
        return h.response({ ok: false }).code(500);
      }
    },
  },
};

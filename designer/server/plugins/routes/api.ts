import newFormJson from "../../../new-form.json";
import { FormConfiguration, Schema } from "@xgovformbuilder/model";
import Wreck from "@hapi/wreck";
import config from "../../config";
import { publish } from "../../lib/publish";
import { ServerRoute } from "@hapi/hapi";

const getPublished = async function (id) {
  const { payload } = await Wreck.get<FormConfiguration>(
    `${config.publishUrl}/published/${id}`
  );
  return payload.toString();
};

export const get: ServerRoute = {
  // GET DATA
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
};

export const put: ServerRoute = {
  // SAVE DATA
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
};

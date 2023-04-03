import { HapiLifecycleMethod } from "server/types";
import { FormPayload } from "server/plugins/engine/types";
import { FormModel } from "../../../models";
export const post: HapiLifecycleMethod = (request, h) => {
  const { forms } = request.server.app;
  const payload = request.payload as FormPayload;
  const { id, configuration } = payload;
  const parsedConfiguration =
    typeof configuration === "string"
      ? JSON.parse(configuration)
      : configuration;
  try {
    forms[id] = new FormModel(parsedConfiguration, {});
  } catch (e) {
    request.logger.error(e);
  }

  return h.response({}).code(204);
};

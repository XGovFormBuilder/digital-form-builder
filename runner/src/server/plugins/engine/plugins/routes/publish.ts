import { HapiLifecycleMethod } from "server/types";
import { FormPayload } from "server/plugins/engine/types";
import { FormModel } from "server/plugins/engine/models";

export const post: HapiLifecycleMethod = (request, h) => {
  const { forms } = request.server.app;
  const payload = request.payload as FormPayload;
  const { id, configuration } = payload;

  const parsedConfiguration =
    typeof configuration === "string"
      ? JSON.parse(configuration)
      : configuration;

  forms[id] = new FormModel(parsedConfiguration, {
    ...h.context.modelOptions,
    basePath: id,
  });

  return h.response({}).code(204);
};

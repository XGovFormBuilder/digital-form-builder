import { HapiLifecycleMethod } from "server/types";

export const get: HapiLifecycleMethod = (request, h) => {
  const forms = request.server.app.forms;
  const published = Object.entries(forms)
    .map(([key, formModel]) => {
      return {
        Key: key,
        DisplayName: formModel?.name ?? key,
        feedbackForm: formModel?.def?.feedback?.feedbackForm ?? false,
      };
    })
    .filter(Boolean);

  return h.response(published);
};

export const id = {
  get: (request, h): HapiLifecycleMethod => {
    const forms = request.server.app.forms;
    const { id } = request.params;

    const form = forms[id];
    if (!form) {
      return h.response({}).code(204);
    }

    return h.response(JSON.stringify({ id, values: form.def })).code(200);
  },
};

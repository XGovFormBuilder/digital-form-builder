import { ResponseObject, ServerRoute } from "@hapi/hapi";

export const getAllPersistedConfigurations: ServerRoute = {
  method: "GET",
  path: "/configurations",
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

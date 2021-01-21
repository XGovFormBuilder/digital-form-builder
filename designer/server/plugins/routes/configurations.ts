export const get = {
  method: "GET",
  path: "/configurations",
  options: {
    handler: async (request: Request, h) => {
      const { persistenceService } = request.services([]);
      try {
        const response = await persistenceService.listAllConfigurations();
        return h.response(response).type("application/json");
      } catch (error) {
        request.server.log(["error", "/configurations"], error);
      }
    },
  },
};

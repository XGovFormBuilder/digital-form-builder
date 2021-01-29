import config from "../../config";
import { ServerRoute } from "@hapi/hapi";

export const redirectNewToApp: ServerRoute = {
  method: "get",
  path: "/new",
  options: {
    handler: async (_request, h) => {
      return h.redirect("/app").code(301);
    },
  },
};

export const getApp: ServerRoute = {
  method: "get",
  path: "/app",
  options: {
    handler: async (_request, h) => {
      return h.view("designer", {
        phase: config.phase,
        previewUrl: config.previewUrl,
        footerText: config.footerText,
      });
    },
  },
};

export const getAppChildRoutes: ServerRoute = {
  method: "get",
  path: "/app/{path*}",
  options: {
    handler: async (_request, h) => {
      return h.view("designer", {
        phase: config.phase,
        previewUrl: config.previewUrl,
        footerText: config.footerText,
      });
    },
  },
};

export const redirectOldUrlToDesigner: ServerRoute = {
  method: "get",
  path: "/{id}",
  options: {
    handler: async (request, h) => {
      const { id } = request.params;
      return h.redirect(`/app/designer/${id}`).code(301);
    },
  },
};

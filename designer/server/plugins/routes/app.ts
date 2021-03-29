import config from "../../config";
import { ServerRoute } from "@hapi/hapi";
import JSZip from "jszip";

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

export const getErrorCrashReport: ServerRoute = {
  method: "get",
  path: "/error/crashreport/{id}",
  options: {
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const error = request.yar.get(`error-summary-${id}`) as any;
        const zip = new JSZip();
        zip.file(`${id}-crash-report.json`, JSON.stringify(error));
        const buffer = await zip.generateAsync({
          type: "nodebuffer",
          compression: "DEFLATE",
        });
        return h
          .response(buffer)
          .encoding("binary")
          .type("application/zip")
          .header(
            "content-disposition",
            `attachment; filename=${id}-crash-report.zip`
          );
      } catch (err) {
        console.error("Error while generating crash report:", err);
        return h
          .response(Buffer.from("Error while generating crash report"))
          .encoding("binary")
          .type("text/plain")
          .header(
            "content-disposition",
            `attachment; filename=error-${new Date().toISOString()}.txt;`
          );
      }
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

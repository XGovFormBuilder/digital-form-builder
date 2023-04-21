import { HapiRequest, HapiResponseToolkit } from "../types";
import { authStrategy } from "server/plugins/engine/plugin";

export default {
  plugin: {
    name: "clientSideUpload",
    register: (server) => {
      server.route({
        method: "POST",
        path: "/s3/{id}/{pageKey}/{componentKey}/create-pre-signed-url",
        options: {
          auth: authStrategy,
        },
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const { uploadService, cacheService } = request.services([]);
          const state = await cacheService.getState(request);
          const form_session_identifier =
            state.metadata?.form_session_identifier ?? "";
          if (!form_session_identifier) {
            return h.response({ ok: false }).code(401);
          }
          const { id, pageKey, componentKey } = request.params as any;
          const { filename } = request.payload;

          const form = request.server.app.forms[id];
          const page = form?.pages.find(
            (p) =>
              uploadService.normalisePath(p.path) ===
              uploadService.normalisePath(pageKey)
          );

          const metaData = {
            page: encodeURI(page.title),
            section: encodeURI(page.section?.title ?? ""),
            componentName: componentKey,
          };

          const key = `${form_session_identifier}/${id}/${pageKey}/${componentKey}/${filename}`;
          const url = await uploadService.getPreSignedUrlS3(key, metaData);
          return { url };
        },
      });

      server.route({
        method: "GET",
        path: "/s3/{id}/{pageKey}/{componentKey}/download-file",
        options: {
          auth: authStrategy,
        },
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const { uploadService, cacheService } = request.services([]);
          const state = await cacheService.getState(request);
          const form_session_identifier =
            state.metadata?.form_session_identifier ?? "";
          if (!form_session_identifier) {
            return h.response({ ok: false }).code(401);
          }
          const { id, pageKey, componentKey } = request.params as any;
          const { filename } = request.query;

          const key = `${form_session_identifier}/${id}/${pageKey}/${componentKey}/${filename}`;
          const url = await uploadService.getFileDownloadUrlS3(key);
          return h.redirect(url);
        },
      });

      server.route({
        method: "DELETE",
        path: "/s3/{id}/{pageKey}/{componentKey}/delete-file-by-key",
        options: {
          auth: authStrategy,
        },
        handler: async (request, h) => {
          const { uploadService, cacheService } = request.services([]);
          const state = await cacheService.getState(request);
          const form_session_identifier =
            state.metadata?.form_session_identifier ?? "";
          if (!form_session_identifier) {
            return h.response({ ok: false }).code(401);
          }
          const { id, pageKey, componentKey } = request.params as any;
          const { filename } = request.payload;

          const key = `${form_session_identifier}/${id}/${pageKey}/${componentKey}/${filename}`;
          const wasDeleted = uploadService.deleteFileS3(key);
          if (wasDeleted) {
            return h.response("File deleted from S3").code(200);
          } else {
            return h.response("Error deleting file from S3").code(500);
          }
        },
      });
    },
  },
};

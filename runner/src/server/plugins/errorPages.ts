import fs from "node:fs";
import path from "node:path";
import config from "../config";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "../types";
import type { ApplicationErrorMetadata } from "./engine/errors";
import { FormModel } from "./engine/models";
import { feedbackUrlFromRequest } from "./engine/feedback";

/**
 * Extracts the Form ID from the URL path
 * @param path a url path
 * @returns
 */
export const extractFormIdFromPath = (path: string): string | undefined => {
  const segments = path.split("/").filter(Boolean);
  return segments[0];
};

/**
 * Get's a view from a folder
 *
 * @param folder the folder where the view is located. If not provided the default folder is `views`.
 * @param view the name of the view
 * @returns
 */
export const getView = (folder: string, view: string) => {
  const viewPath = path.join(__dirname, `../views/${folder}/${view}.html`);

  if (!fs.existsSync(viewPath)) {
    return undefined;
  }

  return folder ? `${folder}/${view}` : view;
};

/**
 * Finds the first view that exists across a list of candidate folders,
 * checked in order (e.g. form folder, then form group folder, then generic).
 *
 * @param folders the folders to check, in priority order
 * @param view the name of the view
 * @returns
 */
export const findView = (folders: (string | undefined)[], view: string) => {
  for (const folder of folders) {
    const match = folder !== undefined && getView(folder, view);
    if (match) return match;
  }
  return undefined;
};

/**
 * Handles the rendering of errors caused by application errors
 *
 * @param request a hapi request object
 * @param response a hapi response toolkit
 * @param data the metadata ({@link ApplicationErrorMetadata}) attached to the application error
 * @param group the project group name
 * @returns
 */
export const handleApplicationError = (
  request: HapiRequest,
  response: HapiResponseToolkit,
  data: ApplicationErrorMetadata,
  formGroup?: string
) => {
  // extract project from url path
  const formId = extractFormIdFromPath(request.path);
  const code = `${data.code}`;

  // views are looked up from most to least specific: form, form group, generic
  const folders = [formId, formGroup, ""];

  const pageData = {
    ...(data.backUrl ? { backLink: data.backUrl } : {}),
    ...(formId ? { startPage: `/${formId}` } : {}),
    ...("data" in data ? data.data : {}),
  };

  const view =
    ("page" in data && data.page && findView(folders, data.page)) ||
    findView(folders, code);

  return response.view(view || code, pageData).code(data.code);
};

/*
 * Add an `onPreResponse` listener to return error pages
 */
export default {
  plugin: {
    name: "error-pages",
    register: (server: HapiServer) => {
      server.ext(
        "onPreResponse",
        (request: HapiRequest, h: HapiResponseToolkit) => {
          const response = request.response;

          if ("isBoom" in response && response.isBoom) {
            // An error was raised during processing the request
            const statusCode = response.output.statusCode;

            try {
              const formId = extractFormIdFromPath(request.path);

              if (!formId) throw new Error("cannot find form id");

              const form: FormModel | undefined = server.app.forms[formId];

              const formGroup = form?.def.formGroup;
              const formName = form?.name;

              // Determine service name and start page for the form
              const serviceName = form?.def.serviceName || config.serviceName;
              const serviceStartPage =
                form?.serviceStartPage || config.serviceStartPage;

              request.log("error", {
                statusCode: statusCode,
                data: response.data,
                message: response.message,
                stack: response.stack,
              });

              // In the event of 403 (CSRF protection)
              if (statusCode === 403) {
                return h
                  .view("csrf-protection", {
                    url: formId,
                    name: formName,
                    footerLinks: form?.def.footerLinks,
                    serviceName,
                    serviceStartPage,
                  })
                  .code(statusCode);
              }

              if (
                response.message.includes("ControllerError") ||
                response.message.includes("RenderingError")
              ) {
                const page = response.data?.page || `${statusCode}`;

                const globalPageState = {
                  feedbackLink: feedbackUrlFromRequest(request, form, page),
                  footerLinks: form?.def.footerLinks,
                  serviceName,
                  serviceStartPage,
                };

                const applicationErrorData: ApplicationErrorMetadata = {
                  ...response.data,
                  data: {
                    ...globalPageState,
                    ...response.data?.data,
                  },
                };

                return handleApplicationError(
                  request,
                  h,
                  applicationErrorData,
                  formGroup
                );
              }

              return h
                .view("500", {
                  name: formName || config.serviceName,
                  contactEmail: form?.def.error500ContactEmail,
                  footerLinks: form?.def.footerLinks,
                  serviceName,
                  serviceStartPage,
                })
                .code(statusCode);
            } catch (error) {
              // The return the `500` view
              return h.view("500").code(statusCode);
            }
          }

          return h.continue;
        }
      );
    },
  },
};

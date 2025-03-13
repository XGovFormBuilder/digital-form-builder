import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";
import { redirectTo, redirectUrl } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { validateHmac } from "src/server/utils/hmac";
import Jwt from "@hapi/jwt";
import config from "server/config";

export class MagicLinkController extends PageController {
  constructor(model, pageDef) {
    super(model, pageDef);
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const email = request.query.email;
      const signature = request.query.signature;
      const requestTime = request.query.request_time;
      const hmacKey = this.model.def.outputs[0].outputConfiguration.hmacKey;

      const validation = await validateHmac(
        email,
        signature,
        requestTime,
        hmacKey
      );

      if (!validation.isValid) {
        // Handle different invalid token cases
        switch (validation.reason) {
          case "expired":
            return h.redirect("/magic-link/expired").code(302);
          case "invalid_signature":
            return h.redirect("/magic-link/incorrect-email").code(302);
          default:
            return h.redirect("/magic-link/error").code(302);
        }
      }

      this.langFromRequest(request);

      const { cacheService } = request.services([]);
      const model = this.model;

      if (this.model.def.skipSummary) {
        return this.makePostRouteHandler()(request, h);
      }
      const state = await cacheService.getState(request);
      const viewModel = new SummaryViewModel(this.title, model, state, request);

      if (viewModel.endPage) {
        return redirectTo(
          request,
          h,
          `/${model.basePath}${viewModel.endPage.path}`
        );
      }

      /**
       * iterates through the errors. If there are errors, a user will be redirected to the page
       * with the error with returnUrl=`/${model.basePath}/summary` in the URL query parameter.
       */
      if (viewModel.errors) {
        const errorToFix = viewModel.errors[0];
        const { path } = errorToFix;
        const parts = path.split(".");
        const section = parts[0];
        const property = parts.length > 1 ? parts[parts.length - 1] : null;
        const iteration = parts.length === 3 ? Number(parts[1]) + 1 : null;
        const pageWithError = model.pages.filter((page) => {
          if (page.section && page.section.name === section) {
            let propertyMatches = true;
            let conditionMatches = true;
            if (property) {
              propertyMatches =
                page.components.formItems.filter(
                  (item) => item.name === property
                ).length > 0;
            }
            if (
              propertyMatches &&
              page.condition &&
              model.conditions[page.condition]
            ) {
              conditionMatches = model.conditions[page.condition].fn(state);
            }
            return propertyMatches && conditionMatches;
          }
          return false;
        })[0];
        if (pageWithError) {
          const params = {
            returnUrl: redirectUrl(request, `/${model.basePath}/summary`),
            num: iteration && pageWithError.repeatField ? iteration : null,
          };
          return redirectTo(
            request,
            h,
            `/${model.basePath}${pageWithError.path}`,
            params
          );
        }
      }

      const declarationError = request.yar.flash("declarationError");
      if (declarationError.length) {
        viewModel.declarationError = declarationError[0];
      }
      return h.view("summary", viewModel);
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const email = request.query.email;
      const signature = request.query.signature;
      const requestTime = request.query.request_time;
      const hmacKey = this.model.def.outputs[0].outputConfiguration.hmacKey;

      const validation = await validateHmac(
        email,
        signature,
        requestTime,
        hmacKey
      );

      if (validation.isValid) {
        const token = Jwt.token.generate(
          { email: request.query.email },
          {
            key: this.model.def.jwtKey,
            algorithm: config.initialisedSessionAlgorithm,
          },
          {
            ttlSec: config.initialisedSessionTimeout / 1000,
          }
        );

        // Set the JWT in a cookie
        h.state("auth_token", token, {
          ttl: 20 * 60 * 1000,
          isSecure: true,
          isHttpOnly: true,
          encoding: "none",
          clearInvalid: true,
          path: "/",
          isSameSite: "Lax",
        });
      }

      // Redirect to custom page instead of status
      return redirectTo(request, h, `/${request.params.id}/email-confirmed`);
    };
  }
}

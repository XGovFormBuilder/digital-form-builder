import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";
import { redirectTo } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { createHmac } from "src/server/utils/hmac";
import { isAllowedDomain } from "src/server/utils/domain";

// Shared options for cookie settings
const getCookieOptions = (timeRemaining) => ({
  ttl: timeRemaining * 1000, // Convert remaining seconds to milliseconds
  isSecure: true,
  isHttpOnly: true,
  encoding: "base64json",
  path: "/",
  clearInvalid: false,
  strictHeader: true,
});

// Base controller class containing shared functionality
export class MagicLinkSubmissionPageController extends PageController {
  RETRY_TIMEOUT_SECONDS: number;

  constructor(model, pageDef) {
    super(model, pageDef);
    this.RETRY_TIMEOUT_SECONDS = this.model.def.retryTimeoutSeconds ?? 300;
  }

  // Template-specific configurations that can be overridden by child classes
  get timeRemainingRedirect() {
    return `/${this.model.basePath}/email`;
  }

  get redirectAfterSubmission() {
    return `/${this.request.params.id}/check-your-email`;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.request = request; // Store request for use in getter methods
      const { cacheService } = request.services([]);
      const state = await cacheService.getState(request);
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if there's a cookie with retry information
      const retryCookie = request.state.magicLinkRetry;

      if (retryCookie) {
        try {
          const decoded = atob(retryCookie); // Decodes base64
          const data = JSON.parse(decoded); // Parses JSON

          // Get the retry time from the cookie
          const retryAfter = data.retryAfter;

          // Calculate time remaining (in seconds)
          const timeRemaining = Math.max(0, retryAfter - currentTime);

          // Allow retry if time has elapsed
          if (timeRemaining <= 0) {
            return redirectTo(
              request,
              h,
              `/${this.model.basePath}/resubmit-email`
            );
          }

          // Otherwise show the time remaining page with consistent calculation
          const minutesRemaining = Math.ceil(timeRemaining / 60);

          await cacheService.mergeState(request, {
            minutesRemaining: minutesRemaining,
          });

          return redirectTo(request, h, this.timeRemainingRedirect);
        } catch (error) {
          request.logger.error(["Cookie parsing error", error.message]);
          return redirectTo(request, h, `/${this.model.basePath}/start`);
        }
      } else {
        return this.makePostRouteHandler()(request, h);
      }
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.request = request; // Store request for use in getter methods
      const { cacheService } = request.services([]);
      const model = this.model;
      const state = await cacheService.getState(request);
      const summaryViewModel = new SummaryViewModel(
        this.title,
        model,
        state,
        request
      );
      this.setFeedbackDetails(summaryViewModel, request);

      // redirect user to start page if there are incomplete form errors
      if (summaryViewModel.result.error) {
        request.logger.error(
          `SummaryPage Error`,
          summaryViewModel.result.error
        );

        // Determine which page to redirect to
        const startPage = model.def.startPage;
        let redirectPath;

        if (startPage && startPage.startsWith("http")) {
          redirectPath = startPage;
        } else if (
          startPage &&
          model.def.pages.find((page) => page.path === startPage)
        ) {
          redirectPath = `/${model.basePath}${startPage}`;
        } else {
          // Default to first page if no valid start page
          redirectPath = `/${model.basePath}${model.def.pages[0].path}`;
        }

        return redirectTo(request, h, redirectPath);
      }

      // Get user email from state
      const email = state["email"];
      if (!email) {
        request.logger.warn([
          "HMAC",
          "No email found in state",
          JSON.stringify(state),
        ]);
        return redirectTo(request, h, `/${model.basePath}/start`);
      }

      const allowedEmailDomains = this.model.def.allowedDomains ?? [];
      //hardcoded start page as a fallback if InvalidDomainRedirectPage not added to config
      const InvalidDomainRedirectPage =
        model.def.invalidDomainRedirect || "/start";
      if (!isAllowedDomain(email, allowedEmailDomains)) {
        request.logger.warn([
          "DomainValidation",
          `Email domain '${email.split("@")[1]}' not allowed`,
        ]);
        return redirectTo(request, h, InvalidDomainRedirectPage);
      }

      const hmacKey = this.model.def.outputs[0].outputConfiguration.hmacKey;
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if the user already has an active HMAC link
      const foundHmac = await cacheService.searchForMagicLinkRecord(email);

      if (foundHmac && foundHmac.active) {
        const hmacTimestamp = foundHmac.active;
        const timeDifference = currentTime - hmacTimestamp;

        if (timeDifference < this.RETRY_TIMEOUT_SECONDS) {
          // User must wait before requesting another link
          const timeRemaining = this.RETRY_TIMEOUT_SECONDS - timeDifference;
          const minutesRemaining = Math.ceil(timeRemaining / 60);

          await cacheService.mergeState(request, {
            minutesRemaining: minutesRemaining,
          });

          // Set consistent cookie for retry timeout
          const cookieValue = {
            retryAfter: hmacTimestamp + this.RETRY_TIMEOUT_SECONDS,
          };

          const cookieOptions = getCookieOptions(timeRemaining);
          h.state("magicLinkRetry", cookieValue, cookieOptions);

          // Show the time remaining page
          return redirectTo(request, h, this.timeRemainingRedirect);
        }
      }

      // Generate new HMAC for the email
      const [hmac, currentTimestamp, hmacExpiryTime] = await createHmac(
        email,
        hmacKey
      );

      // Store or update the HMAC record
      if (!foundHmac) {
        await cacheService.createMagicLinkRecord(email, hmac, currentTimestamp);
      } else {
        // Update existing record
        await cacheService.updateMagicLinkRecord(email, hmac, currentTimestamp);
      }

      // Construct the magic link URL
      const hmacUrlStart = `/${model.basePath}/return?email=`
      const hmacUrl = hmacUrlStart.concat(
        email,
        "&request_time=",
        currentTimestamp.toString(),
        "&signature=",
        hmac.toString()
      );

      // First, let's get the current state to see what's in it
      const currentState = await cacheService.getState(request);

      // Create new state object with all the values we want to set
      const newStateValues = {
        hmacSignature: hmacUrl,
        hmacExpiryTime: hmacExpiryTime,
        outputs: summaryViewModel.outputs,
        userCompletedSummary: true,
        webhookData: summaryViewModel.validatedWebhookData,
      };

      // If minutesRemaining exists in the current state, explicitly remove it
      if ("minutesRemaining" in currentState) {
        // Use undefined instead of null to truly remove the property
        newStateValues.minutesRemaining = undefined;
      }

      // Store data in state with a single merge operation
      await cacheService.mergeState(request, newStateValues);

      // Set cookie for retry timeout (using consistent constant)
      const cookieOptions = getCookieOptions(this.RETRY_TIMEOUT_SECONDS);
      h.state(
        "magicLinkRetry",
        {
          retryAfter: currentTimestamp + this.RETRY_TIMEOUT_SECONDS,
        },
        cookieOptions
      );

      // Commented out due to potential for logging PII
      // request.logger.info(
      //   ["Webhook data", "before send", request.yar.id],
      //   JSON.stringify(summaryViewModel.validatedWebhookData)
      // );

      // Get StatusService and submit the form
      const { statusService } = request.services([]);
      await statusService.outputRequests(request);

      // Redirect to custom page
      return redirectTo(request, h, this.redirectAfterSubmission);
    };
  }

  get postRouteOptions() {
    return {
      ext: {
        onPreHandler: {
          method: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }
}

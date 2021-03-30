import config from "../config";
import { nanoid } from "nanoid";
import {
  decodeFeedbackContextInfo,
  redirectTo,
  nonRelativeRedirectUrl,
  RelativeUrl,
} from "./engine";

import { HapiRequest, HapiResponseToolkit } from "../types";

function getFeedbackContextInfo(request: HapiRequest) {
  if (request.query[RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER]) {
    return decodeFeedbackContextInfo(
      new RelativeUrl(`${request.url.pathname}${request.url.search}`)
        .feedbackReturnInfo
    );
  }
}

function successfulOutcome(
  request: HapiRequest,
  h: HapiResponseToolkit,
  model?: any
) {
  const feedbackContextInfo = getFeedbackContextInfo(request);

  if (feedbackContextInfo) {
    return h.redirect(feedbackContextInfo.url);
  }

  return h.view("confirmation", model);
}

const applicationStatus = {
  plugin: {
    name: "applicationStatus",
    dependencies: "vision",
    multiple: true,
    register: (server) => {
      server.route({
        method: "get",
        path: "/status",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const {
            notifyService,
            payService,
            webhookService,
            cacheService,
          } = request.services([]);
          const {
            pay,
            reference,
            outputs,
            webhookData,
          } = await cacheService.getState(request);
          const params = request.query;
          let newReference;
          let payState;
          let userCouldntPay;

          if (pay) {
            const { self, meta } = pay;
            payState = await payService.payStatus(self, meta.payApiKey);
            userCouldntPay =
              params.continue === "true" || pay.meta.attempts === 3;

            /**
             * @code allow the user to try again if they haven't skipped or reached their retry limit
             */
            if (payState.state.status !== "success" && !userCouldntPay) {
              return h.view("pay-error", {
                reference,
                errorList: ["there was a problem with your payment"],
              });
            }
          }

          if (reference) {
            await cacheService.clearState(request);
            if (reference !== "UNKNOWN") {
              return successfulOutcome(request, h, { reference, payState });
            } else {
              return successfulOutcome(request, h, { payState });
            }
          }

          /**
           * @code if there are webhooks, find one and use that to generate a reference number for other output calls.
           * TODO:- to be honest, it should really be a 'lazy' var but concurrent aysnc is kinda a pain for this and I don't have time. Probably wont have >1 webhook anyway. ¯\_( ツ )_/¯
           */
          const webhookOutputs = (outputs || []).filter(
            (output) => output.type === "webhook"
          );
          let firstWebhook;

          try {
            if (webhookOutputs.length) {
              firstWebhook = webhookOutputs[0];
              const firstWebhookFormData = webhookData;
              if (userCouldntPay && firstWebhookFormData.fees) {
                delete firstWebhookFormData.fees;
              }
              newReference = await webhookService.postRequest(
                firstWebhook.outputData.url,
                firstWebhookFormData
              );
              await cacheService.mergeState(request, {
                reference: newReference,
              });
            }
            const outputPromises = (outputs || [])
              .filter((output) => output !== firstWebhook)
              .map((output) => {
                switch (output.type) {
                  case "notify":
                  case "email": {
                    const {
                      apiKey,
                      templateId,
                      emailAddress,
                      personalisation = {},
                      addReferencesToPersonalisation = false,
                    } = output.outputData;

                    if (addReferencesToPersonalisation) {
                      Object.assign(personalisation, {
                        hasWebhookReference: !!newReference,
                        webhookReference: newReference || "",
                        hasPaymentReference: !!payState?.reference,
                        paymentReference: payState?.reference || "",
                      });
                    }

                    return notifyService.sendNotification({
                      apiKey,
                      templateId,
                      emailAddress,
                      personalisation,
                      reference: newReference,
                    });
                  }
                  case "webhook": {
                    const { url } = output.outputData;
                    const formData = webhookData;
                    if (userCouldntPay) {
                      delete formData.fees;
                    }
                    return webhookService.postRequest(url, formData);
                  }
                  default:
                    return {};
                }
              });

            if (outputPromises.length) {
              await Promise.all(outputPromises);
            }
            await cacheService.clearState(request);
            if (newReference !== "UNKNOWN") {
              return successfulOutcome(request, h, {
                reference: newReference,
                paySkipped: userCouldntPay,
                payState,
              });
            } else {
              return successfulOutcome(request, h, {
                paySkipped: userCouldntPay,
                payState,
              });
            }
          } catch (err) {
            request.server.log(
              ["error", "output"],
              `Error processing output: ${err.message}`
            );
            await cacheService.clearState(request);
            return h.view("application-error");
          }

          // TODO:- unfinished pay flow?
        },
      });
      server.route({
        method: "post",
        path: "/status",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const { payService, cacheService } = request.services([]);
          const { pay } = await cacheService.getState(request);
          const { meta } = pay;
          meta.attempts++;
          // TODO:- let payService handle nanoid(10)
          const reference = `${nanoid(10)}`;
          const res = await payService.payRequest(
            meta.amount,
            reference,
            meta.description,
            meta.payApiKey,
            nonRelativeRedirectUrl(request, config.payReturnUrl)
          );
          await cacheService.mergeState(request, {
            pay: {
              payId: res.payment_id,
              reference,
              self: res._links.self.href,
              meta,
            },
          });
          return redirectTo(request, h, res._links.next_url.href);
        },
      });
    },
  },
};

export default applicationStatus;

import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { ServerInjectResponse } from "@hapi/hapi";
import Jwt from "@hapi/jwt";
import {
  FormDefinition,
  NotifyOutputConfiguration,
} from "@xgovformbuilder/model";
import createServer from "src/server";
import config from "src/server/config";
import { HapiServer } from "src/server/types";
import { SendNotificationArgs } from "src/server/services/notifyService";
import { freezeNow } from "../../../../../clock-helper";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

const formsPath = path.join(__dirname, "../../../../../../src/server/forms");
const browserUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const scannerUserAgent = "Mozilla/5.0 (compatible; email-security-scanner)";
const removeUserAgentHeader = "x-test-remove-user-agent";
const linkLifetimeSeconds = 20 * 60;
const resendWaitSeconds = 5 * 60;
const answers = {
  region: "London",
  details: { reference: "1-123456789", name: "Oak House" },
};

const loadForm = (id: string): FormDefinition =>
  JSON.parse(fs.readFileSync(path.join(formsPath, `${id}.json`), "utf8"));

// Valid answers for a page: the first item of each list and 1 for numbers. Other fields are left empty.
const validAnswersFor = (form: FormDefinition, pagePath: string) => {
  const page = form.pages.find(({ path }) => path === pagePath);
  const values: Record<string, string> = {};
  for (const component of page?.components ?? []) {
    if ("list" in component) {
      const list = form.lists.find(({ name }) => name === component.list);
      values[component.name] = String(list?.items[0]?.value);
    } else if (component.type === "NumberField") {
      values[component.name] = "1";
    }
  }
  return values;
};

const journeys = [
  ["magic-link", "ReportAnOutbreak"],
  ["kls-magic-link", "kls-enquiries"],
  ["kls-training-magic-link", "kls-training-request"],
].map(([formId, originatingFormId]) => {
  const form = loadForm(formId);
  const originatingForm = loadForm(originatingFormId);
  const redirectPage = originatingForm.pages.find(
    (page) => page.controller === "MagicLinkRedirectController"
  );
  const continuePath = redirectPage?.next?.[0]?.path;
  if (!redirectPage || !continuePath) {
    throw new Error(`${originatingFormId} has no magic link redirect page`);
  }

  return {
    formId,
    originatingFormId,
    redirectPath: redirectPage.path,
    continuePath,
    continueAnswers: validAnswersFor(originatingForm, continuePath),
    allowedDomains: form.allowedDomains ?? [],
    invalidDomainRedirect: form.invalidDomainRedirect,
    // ReportAnOutbreak's toggle is an unresolved ${...} placeholder in tests, so sign-in isn't enforced for it here.
    signInEnforced:
      originatingForm.authentication === true &&
      originatingForm.toggle === true,
  };
});

type Browser = { cookies: Record<string, string>; sessionId: string };

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

suite("Magic link journey", () => {
  let server: HapiServer;
  const sentEmails: SendNotificationArgs[] = [];
  let lastSessionId: string;
  let emailCount = 0;

  before({ timeout: 30000 }, async () => {
    server = await createServer({});

    // server.inject always sends a user-agent, so strip it here to simulate clients that send none.
    server.ext("onRequest", (request, h) => {
      if (request.headers[removeUserAgentHeader]) {
        delete request.headers["user-agent"];
      }
      return h.continue;
    });
    server.ext("onPreResponse", (request, h) => {
      lastSessionId = request.yar.id;
      return h.continue;
    });

    await server.initialize();
    // Vision configures Nunjucks on the first view render, and SelectionControlField's conditional reveals fail until it has.
    await server.inject({ method: "get", url: "/magic-link/expired" });
    server.services([]).notifyService.sendNotification = (args) => {
      sentEmails.push(args);
    };
  });

  after(async () => {
    await server.stop();
  });

  const services = () => server.services([]);
  const nowInSeconds = () => Math.floor(Date.now() / 1000);
  const newEmail = () => `manager${++emailCount}@ukhsa.gov.uk`;
  const stateKey = (sessionId: string, id: string) => ({
    yar: { id: sessionId },
    params: { id },
  });

  const setCookieHeaders = (res: ServerInjectResponse): string[] => {
    const header = res.headers["set-cookie"];
    if (header === undefined) {
      return [];
    }
    return Array.isArray(header) ? header : [String(header)];
  };

  const rememberCookies = (browser: Browser, res: ServerInjectResponse) => {
    for (const cookie of setCookieHeaders(res)) {
      const [pair] = cookie.split(";");
      const separator = pair.indexOf("=");
      browser.cookies[pair.slice(0, separator)] = pair.slice(separator + 1);
    }
  };

  const cookieHeader = (browser: Browser) =>
    Object.entries(browser.cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");

  const get = async (
    url: string,
    {
      browser,
      userAgent = browserUserAgent,
      withoutUserAgent = false,
    }: {
      browser?: Browser;
      userAgent?: string;
      withoutUserAgent?: boolean;
    } = {}
  ) => {
    const res = await server.inject({
      method: "get",
      url,
      headers: {
        "user-agent": userAgent,
        ...(browser ? { cookie: cookieHeader(browser) } : {}),
        ...(withoutUserAgent ? { [removeUserAgentHeader]: "true" } : {}),
      },
    });
    if (browser) {
      rememberCookies(browser, res);
    }
    return { res, sessionId: lastSessionId };
  };

  // Form pages post multipart/form-data; the engine's POST route streams any other content type, which the CSRF check rejects.
  const post = async (
    url: string,
    browser: Browser,
    fields: Record<string, string>
  ) => {
    const boundary = "magic-link-test-boundary";
    const body =
      Object.entries({ ...fields, crumb: browser.cookies.crumb })
        .map(
          ([name, value]) =>
            `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
        )
        .join("") + `--${boundary}--\r\n`;
    const res = await server.inject({
      method: "post",
      url,
      headers: {
        "user-agent": browserUserAgent,
        "content-type": `multipart/form-data; boundary=${boundary}`,
        cookie: cookieHeader(browser),
      },
      payload: body,
    });
    rememberCookies(browser, res);
    return { res };
  };

  const lastEmail = (): SendNotificationArgs =>
    sentEmails[sentEmails.length - 1];

  const answer = (browser: Browser, id: string, values: object) =>
    services().cacheService.mergeState(stateKey(browser.sessionId, id), values);

  const answersIn = (sessionId: string, id: string) =>
    services().cacheService.getState(stateKey(sessionId, id));

  const retryCookie = (value: string) => Buffer.from(value).toString("base64");

  journeys.forEach(
    ({
      formId,
      originatingFormId,
      redirectPath,
      continuePath,
      continueAnswers,
      allowedDomains,
      invalidDomainRedirect,
      signInEnforced,
    }) => {
      suite(`${originatingFormId} using ${formId}`, () => {
        const openBrowser = async (): Promise<Browser> => {
          const browser = { cookies: {}, sessionId: "" };
          const { sessionId } = await get(`/${formId}/start`, { browser });
          browser.sessionId = sessionId;
          return browser;
        };

        const leaveOriginatingForm = (browser: Browser) =>
          get(`/${originatingFormId}${redirectPath}`, { browser });

        const sign = (email: string, requestTime: number) => {
          const { outputConfiguration } =
            server.app.forms[formId].def.outputs[0];
          const { hmacKey } = outputConfiguration as NotifyOutputConfiguration;
          if (!hmacKey) {
            throw new Error(`${formId} has no hmacKey`);
          }
          return crypto
            .createHmac("sha256", hmacKey)
            .update(email + requestTime)
            .digest("hex");
        };

        const linkUrl = (
          email: string,
          requestTime: number,
          signature: string
        ) =>
          `/${formId}/return?email=${encodeURIComponent(
            email
          )}&request_time=${requestTime}&signature=${signature}`;

        // Same steps as the email page (MagicLinkSubmissionPageController), with a chosen send time and no email.
        const requestMagicLink = async (
          browser: Browser,
          email = newEmail(),
          requestTime = nowInSeconds()
        ) => {
          const { magicLinkCacheService } = services();
          const signature = sign(email, requestTime);

          await leaveOriginatingForm(browser);
          await magicLinkCacheService.createMagicLinkRecord(
            email,
            signature,
            requestTime
          );
          await magicLinkCacheService.saveInformationToAllowMagicLinkResume(
            {
              ...stateKey(browser.sessionId, formId),
              logger: server.logger,
            },
            signature
          );

          return {
            email,
            signature,
            url: linkUrl(email, requestTime, signature),
          };
        };

        const requestLinkWithAnswers = async () => {
          const requester = await openBrowser();
          await answer(requester, originatingFormId, answers);
          const link = await requestMagicLink(requester);
          await answer(requester, formId, { email: link.email });
          return { requester, ...link };
        };

        const sendLinkFromEmailPage = async (
          browser: Browser,
          email: string,
          page: "submit1" | "submit2" = "submit1"
        ) => {
          await answer(browser, formId, { email });
          const { res } = await get(`/${formId}/${page}`, { browser });
          const state = await answersIn(browser.sessionId, formId);
          return { res, state, url: state.hmacSignature };
        };

        const enterEmail = async (browser: Browser, email: string) => {
          await get(`/${formId}/email`, { browser });
          return post(`/${formId}/email`, browser, { email });
        };

        const restoreAnswersInto = (sessionId: string, signature: string) =>
          services().magicLinkCacheService.repopulateFormStateUponMagicLinkReturn(
            {
              ...stateKey(sessionId, formId),
              logger: server.logger,
            },
            signature
          );

        suite("leaving the originating form", () => {
          test(`${redirectPath} sends the user to the ${formId} form`, async () => {
            const browser = await openBrowser();

            const { res } = await leaveOriginatingForm(browser);

            expect(res.headers.location).to.equal(`/${formId}/start`);
          });
        });

        suite("requesting a link from the email page", () => {
          test("the link is emailed and the check your email page is shown", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            const emailsSent = sentEmails.length;

            const { res, state } = await sendLinkFromEmailPage(browser, email);

            expect(res.headers.location).to.equal(
              `/${formId}/check-your-email`
            );
            expect(sentEmails.length).to.equal(emailsSent + 1);
            expect(lastEmail().emailAddress).to.equal(email);
            expect(lastEmail().personalisation).to.include({
              email,
              hmacSignature: state.hmacSignature,
              hmacExpiryTime: state.hmacExpiryTime,
            });
            expect(state.hmacSignature).to.match(
              new RegExp(
                `^/${formId}/return\\?email=${escapeRegExp(
                  email
                )}&request_time=\\d+&signature=[0-9a-f]{64}$`
              )
            );
            expect(state.hmacExpiryTime).to.match(/^\d{1,2}\.\d{2}(am|pm)$/);
          });

          test("entering an email address emails a link that confirms the email when opened", async () => {
            const browser = await openBrowser();
            await leaveOriginatingForm(browser);
            const email = newEmail();

            const { res: entered } = await enterEmail(browser, email);
            expect(entered.headers.location).to.equal(`/${formId}/submit1`);

            const { res: sent } = await get(`/${formId}/submit1`, {
              browser,
            });
            expect(sent.headers.location).to.equal(
              `/${formId}/check-your-email`
            );
            expect(lastEmail().emailAddress).to.equal(email);

            const { res } = await get(
              lastEmail().personalisation.hmacSignature,
              {
                browser,
              }
            );
            expect(res.headers.location).to.equal(`/${formId}/email-confirmed`);
          });

          test("an invalid email address shows an error and no link is emailed", async () => {
            const browser = await openBrowser();
            const emailsSent = sentEmails.length;

            const { res } = await enterEmail(browser, "not-an-email-address");

            expect(res.statusCode).to.equal(200);
            expect(res.payload).to.contain("govuk-error-summary");
            expect(sentEmails.length).to.equal(emailsSent);
          });

          test("without an email address the user goes back to the start", async () => {
            const browser = await openBrowser();

            const { res } = await get(`/${formId}/submit1`, { browser });

            expect(res.headers.location).to.equal(`/${formId}/start`);
          });

          if (allowedDomains.length > 0) {
            test("an email address outside the allowed domains is not sent a link", async () => {
              const browser = await openBrowser();
              const email = "someone@example.com";

              const { res } = await sendLinkFromEmailPage(browser, email);

              expect(res.headers.location).to.equal(invalidDomainRedirect);
              expect(
                await services().magicLinkCacheService.searchForMagicLinkRecord(
                  email
                )
              ).to.be.null();
            });
          }

          test("asking again within 5 minutes shows the wait page with the minutes left", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            await sendLinkFromEmailPage(browser, email);

            const { res, state } = await sendLinkFromEmailPage(browser, email);

            expect(res.headers.location).to.equal(`/${formId}/email`);
            expect(state.minutesRemaining).to.equal(5);
          });

          test("the resend page within 5 minutes shows the check your email page", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            await sendLinkFromEmailPage(browser, email);

            const { res } = await sendLinkFromEmailPage(
              browser,
              email,
              "submit2"
            );

            expect(res.headers.location).to.equal(
              `/${formId}/check-your-email`
            );
          });

          test("the resend page sends a new link once the 5 minute wait has passed", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            await services().magicLinkCacheService.createMagicLinkRecord(
              email,
              "earlier-link",
              nowInSeconds() - resendWaitSeconds - 1
            );
            const emailsSent = sentEmails.length;

            const { res } = await sendLinkFromEmailPage(
              browser,
              email,
              "submit2"
            );

            expect(res.headers.location).to.equal(`/${formId}/resubmit-email`);
            expect(sentEmails.length).to.equal(emailsSent + 1);
          });

          test("sending a new link after the wait page clears the minutes left", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            await sendLinkFromEmailPage(browser, email);
            const { state: waitPageState } = await sendLinkFromEmailPage(
              browser,
              email
            );
            expect(waitPageState.minutesRemaining).to.equal(5);
            await services().magicLinkCacheService.updateMagicLinkRecord(
              email,
              "earlier-link",
              nowInSeconds() - resendWaitSeconds - 1
            );
            // The retry cookie expires when the wait ends, so the browser stops sending it.
            delete browser.cookies.magicLinkRetry;
            const emailsSent = sentEmails.length;

            const { res, state } = await sendLinkFromEmailPage(browser, email);

            expect(res.headers.location).to.equal(
              `/${formId}/check-your-email`
            );
            expect(sentEmails.length).to.equal(emailsSent + 1);
            expect(state.minutesRemaining).to.be.undefined();
          });

          test("a retry cookie whose wait has passed sends the user to the resend page", async () => {
            const browser = await openBrowser();
            browser.cookies.magicLinkRetry = retryCookie(
              JSON.stringify({ retryAfter: nowInSeconds() - 1 })
            );

            const { res } = await sendLinkFromEmailPage(browser, newEmail());

            expect(res.headers.location).to.equal(`/${formId}/resubmit-email`);
          });

          test("an unreadable retry cookie sends the user back to the start", async () => {
            const browser = await openBrowser();
            browser.cookies.magicLinkRetry = retryCookie("not json");

            const { res } = await sendLinkFromEmailPage(browser, newEmail());

            expect(res.headers.location).to.equal(`/${formId}/start`);
          });
        });

        suite("opening a link", () => {
          test("a request without a user agent is ignored and the link still works", async () => {
            const browser = await openBrowser();
            const { url } = await requestMagicLink(browser);

            const { res: ignored } = await get(url, {
              withoutUserAgent: true,
            });
            expect(ignored.statusCode).to.equal(200);
            expect(ignored.payload).to.equal("Ignored bot request");

            const { res } = await get(url, { browser });
            expect(res.headers.location).to.equal(`/${formId}/email-confirmed`);
          });

          test("an email with no link record goes to the expired page", async () => {
            const email = newEmail();
            const requestTime = nowInSeconds();

            const { res } = await get(
              linkUrl(email, requestTime, sign(email, requestTime))
            );

            expect(res.headers.location).to.equal(`/${formId}/expired`);
          });

          test("a link with the wrong signature goes to the incorrect email page", async () => {
            const browser = await openBrowser();
            const { url } = await requestMagicLink(browser);

            const { res } = await get(
              url.replace(/signature=\w+/, "signature=0000"),
              { browser }
            );

            expect(res.headers.location).to.equal(`/${formId}/incorrect-email`);
          });

          test("an older link still works after a newer link has been sent to the same email", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            const { url: olderLink } = await requestMagicLink(
              browser,
              email,
              nowInSeconds() - resendWaitSeconds - 60
            );
            await requestMagicLink(browser, email);

            const { res } = await get(olderLink, { browser });

            expect(res.headers.location).to.equal(`/${formId}/email-confirmed`);
          });
        });

        suite("restoring answers in a different browser", () => {
          test("answers from the original browser replace older ones already in the different browser, section by section", async () => {
            const browser = await openBrowser();
            await answer(browser, originatingFormId, {
              region: "London",
              details: { reference: "1-123456789" },
            });
            const { url } = await requestMagicLink(browser);
            const otherBrowser = await openBrowser();
            await answer(otherBrowser, originatingFormId, {
              region: "Leeds",
              details: { reference: "1-000000000", name: "Old Home" },
            });

            await get(url, { browser: otherBrowser });

            expect(
              await answersIn(otherBrowser.sessionId, originatingFormId)
            ).to.equal({
              region: "London",
              details: { reference: "1-123456789", name: "Old Home" },
            });
          });

          test("returning in the same browser keeps the saved details for restoring answers elsewhere", async () => {
            const browser = await openBrowser();
            await answer(browser, originatingFormId, answers);
            const { signature } = await requestMagicLink(browser);

            await restoreAnswersInto(browser.sessionId, signature);
            await restoreAnswersInto("another-browser-session", signature);

            expect(
              await answersIn("another-browser-session", originatingFormId)
            ).to.equal(answers);
          });
        });

        suite(
          "the same browser and a different browser behave the same",
          () => {
            const whereUsed = [
              {
                name: "the browser that requested the link",
                browserFor: async (requester: Browser) => requester,
              },
              {
                name: "a different browser",
                browserFor: async (_requester: Browser) => openBrowser(),
              },
            ];

            whereUsed.forEach(({ name, browserFor }) => {
              suite(`using ${name}`, () => {
                test("opening the link confirms the email and the user has their answers", async () => {
                  const { requester, url, email } =
                    await requestLinkWithAnswers();
                  const browser = await browserFor(requester);

                  const { res } = await get(url, { browser });

                  expect(res.headers.location).to.equal(
                    `/${formId}/email-confirmed`
                  );
                  expect(Object.keys(browser.cookies)).to.include("auth_token");
                  expect(
                    await answersIn(browser.sessionId, originatingFormId)
                  ).to.equal(answers);
                  expect(await answersIn(browser.sessionId, formId)).to.include(
                    { email }
                  );
                });

                test(`after opening the link the user can carry on to ${continuePath}`, async () => {
                  const { requester, url } = await requestLinkWithAnswers();
                  const browser = await browserFor(requester);
                  await get(url, { browser });

                  const { res } = await get(
                    `/${originatingFormId}${continuePath}`,
                    { browser }
                  );

                  expect(res.statusCode).to.equal(200);
                });

                test("after an email scanner has opened the link, the user can open it and has their answers", async () => {
                  const { requester, url } = await requestLinkWithAnswers();
                  await get(url, { userAgent: scannerUserAgent });
                  const browser = await browserFor(requester);

                  const { res } = await get(url, { browser });

                  expect(res.headers.location).to.equal(
                    `/${formId}/email-confirmed`
                  );
                  expect(
                    await answersIn(browser.sessionId, originatingFormId)
                  ).to.equal(answers);
                });

                test("a link older than 20 minutes goes to the expired page", async () => {
                  const requester = await openBrowser();
                  const { url } = await requestMagicLink(
                    requester,
                    newEmail(),
                    nowInSeconds() - linkLifetimeSeconds - 1
                  );
                  const browser = await browserFor(requester);

                  const { res } = await get(url, { browser });

                  expect(res.headers.location).to.equal(`/${formId}/expired`);
                });

                test("requesting another link within 5 minutes shows the wait page", async () => {
                  const email = newEmail();
                  const requester = await openBrowser();
                  await sendLinkFromEmailPage(requester, email);
                  const browser = await browserFor(requester);

                  const { res } = await sendLinkFromEmailPage(browser, email);

                  expect(res.headers.location).to.equal(`/${formId}/email`);
                });

                test("after the link has been opened, requesting another link within 5 minutes shows the wait page", async () => {
                  const email = newEmail();
                  const requester = await openBrowser();
                  const { url } = await sendLinkFromEmailPage(requester, email);
                  await get(url, { browser: requester });
                  const browser = await browserFor(requester);

                  const { res } = await sendLinkFromEmailPage(browser, email);

                  expect(res.headers.location).to.equal(`/${formId}/email`);
                });
              });
            });
          }
        );

        if (signInEnforced) {
          suite("signing in", () => {
            test(`without opening a link the user is sent from ${continuePath} back to the start`, async () => {
              const browser = await openBrowser();

              const { res } = await get(
                `/${originatingFormId}${continuePath}`,
                { browser }
              );

              expect(res.headers.location).to.equal(
                `/${originatingFormId}/start`
              );
            });

            // Signs in by opening a link and shows the continue page, then swaps in a sign-in cookie signed with the wrong key.
            const browserWithForgedSignIn = async () => {
              const { requester, url, email } = await requestLinkWithAnswers();
              await get(url, { browser: requester });
              await get(`/${originatingFormId}${continuePath}`, {
                browser: requester,
              });
              requester.cookies.auth_token = Jwt.token.generate(
                { email },
                {
                  key: "not-the-form-jwt-key",
                  algorithm: config.initialisedSessionAlgorithm,
                }
              );
              return requester;
            };

            test(`with a sign-in cookie signed with the wrong key the user is sent from ${continuePath} back to the start`, async () => {
              const browser = await browserWithForgedSignIn();

              const { res } = await get(
                `/${originatingFormId}${continuePath}`,
                { browser }
              );

              expect(res.headers.location).to.equal(
                `/${originatingFormId}/start`
              );
            });

            test(`with a sign-in cookie signed with the wrong key, answering ${continuePath} sends the user back to the start`, async () => {
              const browser = await browserWithForgedSignIn();

              const { res } = await post(
                `/${originatingFormId}${continuePath}`,
                browser,
                continueAnswers
              );

              expect(res.headers.location).to.equal(
                `/${originatingFormId}/start`
              );
            });
          });
        }

        suite("INC0224140: links opened before the user clicks them", () => {
          test("an email scanner opening the link does not remove the user's answers", async () => {
            const { requester, url, email } = await requestLinkWithAnswers();

            await get(url, { userAgent: scannerUserAgent });

            expect(
              await answersIn(requester.sessionId, originatingFormId)
            ).to.equal(answers);
            expect(await answersIn(requester.sessionId, formId)).to.include({
              email,
            });
          });

          test("a request with the wrong signature does not use up the user's link", async () => {
            const browser = await openBrowser();
            const { url } = await requestMagicLink(browser);

            await get(url.replace(/signature=\w+/, "signature=0000"));
            const { res } = await get(url, { browser });

            expect(res.headers.location).to.equal(`/${formId}/email-confirmed`);
          });

          test("opening one link does not expire the other links sent to the same email", async () => {
            const browser = await openBrowser();
            const email = newEmail();
            const { url: olderLink } = await requestMagicLink(
              browser,
              email,
              nowInSeconds() - resendWaitSeconds - 60
            );
            const { url: newerLink } = await requestMagicLink(browser, email);
            await get(newerLink, { browser });

            const { res } = await get(olderLink, { browser });

            expect(res.headers.location).to.equal(`/${formId}/email-confirmed`);
          });

          test("the link record expires with the link, 20 minutes after it was sent", async () => {
            const browser = await openBrowser();
            const { email } = await requestMagicLink(browser);
            const { magicLinkCacheService } = services();
            const clock = freezeNow();

            try {
              clock.tick((linkLifetimeSeconds - 1) * 1000);
              expect(
                await magicLinkCacheService.searchForMagicLinkRecord(email)
              ).to.not.be.null();

              clock.tick(2 * 1000);
              expect(
                await magicLinkCacheService.searchForMagicLinkRecord(email)
              ).to.be.null();
            } finally {
              clock.restore();
            }
          });

          test("the saved details for restoring answers expire with the link", async () => {
            const browser = await openBrowser();
            await answer(browser, originatingFormId, answers);
            const { signature } = await requestMagicLink(browser);
            const clock = freezeNow();

            try {
              clock.tick((linkLifetimeSeconds + 1) * 1000);
              await restoreAnswersInto("late-browser-session", signature);
            } finally {
              clock.restore();
            }

            expect(
              await answersIn("late-browser-session", originatingFormId)
            ).to.equal({});
          });
        });
      });
    }
  );
});

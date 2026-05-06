import { Policy, PolicyOptions } from "@hapi/catbox";
import config from "../config";
import { HapiRequest, HapiServer } from "../types";
import { CacheService } from "./cacheService";

export class MagicLinkCacheService {
  /* This service is responsible for getting, storing or deleting magic link data in the cache. 
     This service has been registered by {@link createServer}
   */
  cacheService: CacheService;
  magicLinkRecordCache: TypedCache<MagicLinkRecord>;

  magicLinkFormIdBySessionCache: TypedCache<FormIdBySessionIdRecord>;
  magicLinkReturnDataByHmacCache: TypedCache<ReturnDataByHmacRecord>;
  logger: HapiServer["logger"];

  ttl = config.sessionTimeout ?? 1000 * 60 * 10; // 10 minutes

  constructor(server: HapiServer) {
    this.logger = server.logger;

    const { cacheService } = server.services([]);

    this.cacheService = cacheService;
    this.magicLinkRecordCache = cacheService.cache as typeof this.magicLinkRecordCache;
    this.magicLinkFormIdBySessionCache = cacheService.cache as typeof this.magicLinkFormIdBySessionCache;
    this.magicLinkReturnDataByHmacCache = cacheService.cache as typeof this.magicLinkReturnDataByHmacCache;
  }

  async createMagicLinkRecord(
    email: string,
    hmac: string,
    currentTimestamp: number
  ) {
    const key = email;
    const value = {
      hmac: hmac,
      active: currentTimestamp,
    };
    return this.magicLinkRecordCache.set(key, value, this.ttl);
  }

  async updateMagicLinkRecord(
    email: string,
    hmac: string,
    currentTimestamp: number
  ) {
    const key = email;

    const value = {
      hmac: hmac,
      active: currentTimestamp,
    };
    return this.magicLinkRecordCache.set(key, value, this.ttl);
  }

  async searchForMagicLinkRecord(email: string) {
    const key = email;
    const emailCached = await this.magicLinkRecordCache.get(key);
    return emailCached ?? null;
  }

  async deleteMagicLinkRecord(email: string) {
    const key = email;
    return await this.magicLinkRecordCache.drop(key);
  }

  async saveFormIdBeforeMagicLinkRedirectToAllowResume(request: HapiRequest) {
    /* Magic Link Session Resume Step 1: Save the form id before redirecting to the Magic Link form
       Saves form id by session id, to allow retrieval in the magic link form flow 
    */
    const sessionId = request.yar.id;

    /* Form id being redirected to magic link from, for example "ReportAnOutbreak" */
    const formId = request.params.id as string;

    if (!sessionId || !formId) {
      request.logger.error("Magic Link: Missing data in step 1", {
        sessionId,
        formId,
      });

      return;
    }

    /* Set the current form id to allow it to be accessed from the magic link form flow */
    const key = getFormIdBySessionIdKey(sessionId);
    await this.magicLinkFormIdBySessionCache.set(key, { formId }, this.ttl);
  }

  async saveInformationToAllowMagicLinkResume(
    request: HapiRequest,
    hmac: string
  ) {
    /* Magic Link Session Resume Step 2: Save additional information when sending out the Magic Link
       In order to be able to re-populate the state after magic link has been clicked without relying on browser state we save the current:
        - session id (as a new session will be started when opening in a differnt browser)
        - form id (i.e "ReportAnOutbreak", to know which cache key to retrieve state from)
      */

    const sessionId = request.yar.id;
    const magicLinkFormId = request.params.id as string;

    if (!sessionId || !magicLinkFormId) {
      request.logger.error("Magic Link: Missing data in step 2", {
        sessionId,
        magicLinkFormId,
      });

      return;
    }

    /* Retrieve form id using the FormIdBySessionIdLookup */
    const previousFormEntry = await this.magicLinkFormIdBySessionCache.get(
      getFormIdBySessionIdKey(sessionId)
    );

    if (!previousFormEntry) {
      request.logger.error("Magic Link: Missing data in step 2", {
        sessionId,
        magicLinkFormId,
        previousFormEntry,
      });

      return;
    }

    /* Save information required to populate state from previous session */
    await this.magicLinkReturnDataByHmacCache.set(
      getReturnDataByHmacKey(hmac),
      {
        sessionId,
        formId: previousFormEntry.formId,
      },
      this.ttl
    );

    /* Clear out FormId By Session lookup */
    await this.magicLinkFormIdBySessionCache.drop(
      getFormIdBySessionIdKey(sessionId)
    );
  }

  async repopulateFormStateUponMagicLinkReturn(
    request: HapiRequest,
    hmac: string
  ) {
    /* Magic Link Session Resume Step 3:
       Populate current session with saved data when returning to site from email link, before navigating back to normal form
     */
    const magicLinkReturnEntry = await this.magicLinkReturnDataByHmacCache.get(
      getReturnDataByHmacKey(hmac)
    );

    if (!magicLinkReturnEntry) {
      request.logger.error(
        "Magic Link: Missing data in step 3 (magicLinkReturnEntry undefined)"
      );

      return;
    }

    /* Found previous session state */
    const currentSessionId = request.yar.id;
    const magicLinkFormId = request.params.id;

    const {
      sessionId: previousSessionId,
      formId: previousFormId,
    } = magicLinkReturnEntry;

    if (!currentSessionId || !previousSessionId || !previousFormId) {
      request.logger.error("Magic Link: Missing data in step 3", {
        currentSessionId,
        previousSessionId,
        previousFormId,
      });
      return;
    }

    if (currentSessionId === previousSessionId) {
      /* Continuing in same browser, no need to repopulate previous state */
      return;
    }

    /* Continuing in different session (different browser / new browser / new instance / tab)
       Re-instate form states from previous session 
    */
    await this.mergeFormStateFromPreviousSession({
      previousSessionId,
      currentSessionId,
      formId: magicLinkFormId,
    });

    await this.mergeFormStateFromPreviousSession({
      previousSessionId,
      currentSessionId,
      formId: previousFormId,
    });

    /* Cleaning up state from previous session */
    await this.clearFormState(previousSessionId, magicLinkFormId);
    await this.clearFormState(previousSessionId, previousFormId);

    /* Delete Magic Link Lookup Entry */
    await this.magicLinkReturnDataByHmacCache.drop(
      getReturnDataByHmacKey(hmac)
    );
  }

  private async mergeFormStateFromPreviousSession({
    previousSessionId,
    currentSessionId,
    formId,
  }: {
    previousSessionId: string;
    currentSessionId: string;
    formId: string;
  }) {
    const previousFormState = await this.getFormState(
      previousSessionId,
      formId
    );

    await this.mergeFormState(currentSessionId, formId, previousFormState);
  }

  private async getFormState(sessionId: string, formId: string) {
    return await this.cacheService.getState({
      params: { id: formId },
      yar: { id: sessionId },
    });
  }

  private async mergeFormState(
    sessionId: string,
    formId: string,
    value: Record<string, any>
  ) {
    return await this.cacheService.mergeState(
      {
        params: { id: formId },
        yar: { id: sessionId },
      },
      value
    );
  }

  private async clearFormState(sessionId: string, formId: string) {
    if (sessionId && formId) {
      await this.cacheService.clearState({
        params: { id: formId },
        yar: { id: sessionId },
      });
    }
  }
}

type TypedCache<T> = Policy<T, PolicyOptions<T>>;

type MagicLinkRecord = {
  hmac: string;
  active: number;
};

type FormIdBySessionIdRecord = { formId: string };
const getFormIdBySessionIdKey = (sessionId: string) =>
  `magic_link_form_id_by_session:${sessionId}`;

type ReturnDataByHmacRecord = { sessionId: string; formId: string } | undefined;
const getReturnDataByHmacKey = (hmac: string) =>
  `magic_link_return_data_by_hmac:${hmac}`;

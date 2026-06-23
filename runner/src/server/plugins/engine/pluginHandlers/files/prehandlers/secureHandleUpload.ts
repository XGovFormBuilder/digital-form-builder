import { HapiRequest, HapiResponseToolkit } from "server/types";
import { createHmacRaw } from "server/utils/hmac";
import { handleUpload } from "./handleUpload";
import { FormModel } from "../../../models";

export async function secureHandleUpload(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
  let securityHeaders: Record<string, string> | undefined = undefined;

  const formId = request.params?.id;
  const forms = request.server?.app?.forms;

  if (formId && forms) {
    const formModel = forms[formId];

    if (formModel) {
      securityHeaders = await getSecurityHeaders(formModel, request);
    }
  }

  return handleUpload(request, h, {
    additionalHeaders: securityHeaders,
  });
}

const getSecurityHeaders = async (
  formModel: FormModel,
  request: HapiRequest
): Promise<Record<string, string> | undefined> => {
  const hmacKey = formModel?.def?.fileUploadHmacSharedKey;
  if (hmacKey) {
    /* Used by KLS to support secure file uploads */
    const sessionId = request.yar.id;
    const [hmacSignature, requestTime] = await createHmacRaw(
      sessionId,
      hmacKey
    );

    return {
      "X-Request-ID": sessionId,
      "X-HMAC-Signature": hmacSignature.toString(),
      "X-HMAC-Time": requestTime.toString(),
    };
  }

  return undefined;
};

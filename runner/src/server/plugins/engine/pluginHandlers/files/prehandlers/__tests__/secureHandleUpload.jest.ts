import { secureHandleUpload } from "../secureHandleUpload";
import { handleUpload } from "../handleUpload";
import { HapiRequest, HapiResponseToolkit } from "src/server/types";

jest.mock("../handleUpload");

afterEach(() => {
  jest.clearAllMocks();
});

test("it supports unsecure file uploads", async () => {
  const request = buildRequest("form-id");
  const h = {} as HapiResponseToolkit;

  await secureHandleUpload(request, h);

  expect(handleUpload).toHaveBeenCalledWith(request, h, {
    additionalHeaders: undefined,
  });
});

test("it supports secure file uploads using fileUploadHmacSharedKey", async () => {
  const request = buildRequest("my-form", "my-hmac-key");
  const h = {} as HapiResponseToolkit;

  await secureHandleUpload(request, h);

  expect(handleUpload).toHaveBeenCalledWith(request, h, {
    additionalHeaders: {
      "X-Request-ID": expect.any(String),
      "X-HMAC-Signature": expect.any(String),
      "X-HMAC-Time": expect.any(String),
    },
  });
});

const buildRequest = (formId: string, fileUploadHmacSharedKey?: string) => {
  const request = {
    params: {
      id: formId,
    },
    server: {
      app: {
        forms: {
          [formId]: {},
        },
      },
    },
    yar: {
      id: "session-id",
    },
  };

  if (fileUploadHmacSharedKey) {
    request["server"]["app"]["forms"][formId]["def"] = {
      fileUploadHmacSharedKey: "my-hmac-key",
    };
  }

  return (request as unknown) as HapiRequest;
};

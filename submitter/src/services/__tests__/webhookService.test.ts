import logger from "pino";
import { WebhookService } from "../webhookService";
import * as httpService from "../httpService";

test.each([
  ["reference if request is successful", `{"reference": "REF1234"}`, "REF1234"],
  ["UNKNOWN if the reference isn't returned", "{}", "UNKNOWN"],
  ["an error if the response cannot be parsed", "not valid json", undefined],
])("postRequest returns %s", async (_returns, payload, returnRef) => {
  const mockPayload = {
    payload: payload,
  };
  jest.spyOn(httpService, "put").mockImplementation(() => {
    return new Promise((resolve) =>
      resolve((mockPayload as unknown) as httpService.Response<any>)
    );
  });
  jest.spyOn(httpService, "post").mockImplementation(() => {
    return new Promise((resolve) =>
      resolve((mockPayload as unknown) as httpService.Response<any>)
    );
  });

  const webhookService = new WebhookService({ logger: logger() });

  const ref = await webhookService.postRequest("https://a-url.com", {}, "POST");

  if (returnRef) {
    expect(ref).toBe(returnRef);
  } else {
    expect(ref).toBeInstanceOf(Error);
  }
});

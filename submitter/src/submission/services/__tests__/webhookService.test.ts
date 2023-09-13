import logger from "pino";
import { WebhookService } from "../webhookService";
import * as httpService from "../httpService";

test.each`
  name                                           | payload                       | returnRef
  ${"reference if request is successful"}        | ${`{"reference": "REF1234"}`} | ${"REF1234"}
  ${"UNKNOWN if the reference isn't returned"}   | ${`{}`}                       | ${"UNKNOWN"}
  ${"an error if the response cannot be parsed"} | ${"not json"}                 | ${undefined}
`("postRequest returns $name", async ({ payload, returnRef }) => {
  jest.spyOn(httpService, "post").mockResolvedValue({ res: {}, payload });

  const webhookService = new WebhookService({ logger: logger() });

  const ref = await webhookService.postRequest(
    "https://a-url.com",
    "{}",
    "POST"
  );

  if (returnRef) {
    expect(ref).toEqual({
      payload: {
        reference: returnRef,
      },
    });
  } else {
    expect(ref.payload.error).toBeDefined();
  }
});
